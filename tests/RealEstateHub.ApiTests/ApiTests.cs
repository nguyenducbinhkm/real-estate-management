using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.ApiTests;

/// <summary>API test: gọi HTTP thật vào ứng dụng (JWT, phân quyền 4 vai trò, validation, luồng liên phân hệ).</summary>
[Collection(ApiCollection.Name)]
public class ApiTests
{
    private readonly ApiFactory _api;

    public ApiTests(ApiFactory api) => _api = api;

    private static async Task<JsonElement> JsonAsync(HttpResponseMessage response)
        => JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;

    private async Task<object> ListingBodyAsync(string title, PropertyType type = PropertyType.Apartment)
    {
        await using var db = _api.NewDbContext();
        var ward = await db.Wards.Include(w => w.District).ThenInclude(d => d.Province).OrderBy(w => w.Code).FirstAsync();
        return new
        {
            propertyType = type.ToString(),
            transactionType = "ForSale",
            title,
            description = "Mô tả đủ dài cho API test – căn hộ thoáng mát, gần chợ, trường học và bệnh viện.",
            price = 3_200_000_000m,
            area = 72,
            provinceCode = ward.District.Province.Code,
            districtCode = ward.District.Code,
            wardCode = ward.Code,
            streetAddress = "12 Đường API",
            contactPhone = "0911 222 333",
            zaloPhone = "0988 777 666",
        };
    }

    /* ------------------------------- Xác thực ------------------------------- */

    [Fact]
    public async Task LoginReturnsTokensAndRole_WrongPasswordIs401()
    {
        var (_, seller, login) = await _api.SignInAsNewAsync<Seller>();
        Assert.Equal("Seller", login.User.Role);
        Assert.False(string.IsNullOrEmpty(login.AccessToken));

        var wrong = await _api.CreateClient().PostAsJsonAsync("/api/auth/login", new { email = seller.Email, password = "sai-mat-khau" });
        Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpointWithoutTokenIs401()
        => Assert.Equal(HttpStatusCode.Unauthorized, (await _api.CreateClient().GetAsync("/api/users/me")).StatusCode);

    /* ------------------------------- Phân quyền (RBAC) ------------------------------- */

    [Fact]
    public async Task BuyerCannotPostListing()
    {
        var (buyer, _, _) = await _api.SignInAsNewAsync<Buyer>();
        var response = await buyer.PostAsJsonAsync("/api/listings", await ListingBodyAsync("Người mua thử đăng tin căn hộ 2 phòng ngủ"));
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task AdminApiIsForbiddenForSellerAndOpenForAdmin()
    {
        var (seller, _, _) = await _api.SignInAsNewAsync<Seller>();
        var (admin, _, _) = await _api.SignInAsNewAsync<Admin>();

        Assert.Equal(HttpStatusCode.Forbidden, (await seller.GetAsync("/api/admin/stats")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await seller.PatchAsync($"/api/admin/listings/{Guid.NewGuid()}/approve", null)).StatusCode);
        var stats = await admin.GetAsync("/api/admin/stats");
        Assert.Equal(HttpStatusCode.OK, stats.StatusCode);
        Assert.True((await JsonAsync(stats)).GetProperty("totalListings").GetInt32() >= 300);
    }

    [Fact]
    public async Task AdminChangesRoleAndOldSessionIsRevoked()
    {
        var (admin, _, _) = await _api.SignInAsNewAsync<Admin>();
        var (_, buyer, buyerLogin) = await _api.SignInAsNewAsync<Buyer>();

        var change = await admin.PatchAsJsonAsync($"/api/admin/users/{buyer.Id}/role", new { role = "Seller" });
        Assert.Equal(HttpStatusCode.OK, change.StatusCode);
        Assert.Equal("Seller", (await JsonAsync(change)).GetProperty("role").GetString());

        var refresh = await _api.CreateClient().PostAsJsonAsync("/api/auth/refresh-token", new { refreshToken = buyerLogin.RefreshToken });
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode); // phiên cũ đã bị thu hồi
    }

    /* ------------------------------- Validation ------------------------------- */

    [Fact]
    public async Task InvalidListingReturns400WithFieldErrors()
    {
        var (seller, _, _) = await _api.SignInAsNewAsync<Seller>();
        var response = await seller.PostAsJsonAsync("/api/listings", new { propertyType = "House", transactionType = "ForSale", title = "ngắn", price = 0, area = 0 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var details = (await JsonAsync(response)).GetProperty("details");
        Assert.True(details.TryGetProperty("Title", out _));
        Assert.True(details.TryGetProperty("Price", out _));
        Assert.True(details.TryGetProperty("LandArea", out _)); // nhà riêng bắt buộc diện tích đất
    }

    [Fact]
    public async Task SellerQuotaIsEnforced()
    {
        var (seller, user, _) = await _api.SignInAsNewAsync<Seller>();
        await using (var db = _api.NewDbContext())
        {
            var wardId = (await db.Wards.OrderBy(w => w.Code).FirstAsync()).Id;
            for (var i = 0; i < 5; i++)
                db.Properties.Add(new Apartment { Title = $"Tin {i}", Price = 1, Area = 1, OwnerId = user.Id, WardId = wardId, Status = PropertyStatus.Active });
            await db.SaveChangesAsync();
        }

        var sixth = await seller.PostAsJsonAsync("/api/listings", await ListingBodyAsync("Tin thứ sáu vượt giới hạn của người bán"));
        Assert.Equal((HttpStatusCode)422, sixth.StatusCode);
        Assert.Equal("LISTING_LIMIT", (await JsonAsync(sixth)).GetProperty("code").GetString());
    }

    /* ------------------------------- Luồng liên phân hệ ------------------------------- */

    [Fact]
    public async Task FullFlow_PostApprovePublicContactSellerInbox()
    {
        var (seller, sellerUser, _) = await _api.SignInAsNewAsync<Seller>();
        var (admin, _, _) = await _api.SignInAsNewAsync<Admin>();
        var tag = $"APITEST{Guid.NewGuid():N}"[..20];

        var created = await seller.PostAsJsonAsync("/api/listings", await ListingBodyAsync($"{tag} căn hộ hai phòng ngủ view sông"));
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var listingId = (await JsonAsync(created)).GetProperty("id").GetGuid();
        Assert.Equal("Pending", (await JsonAsync(created)).GetProperty("status").GetString());

        var publicBefore = await JsonAsync(await _api.CreateClient().GetAsync($"/api/listings?keyword={tag}"));
        Assert.Equal(0, publicBefore.GetProperty("total").GetInt32());

        Assert.Equal(HttpStatusCode.OK, (await admin.PatchAsync($"/api/admin/listings/{listingId}/approve", null)).StatusCode);
        var publicAfter = await JsonAsync(await _api.CreateClient().GetAsync($"/api/listings?keyword={tag}"));
        Assert.Equal(1, publicAfter.GetProperty("total").GetInt32());

        var contact = await _api.CreateClient().PostAsJsonAsync("/api/contact-requests",
            new { propertyId = listingId, senderName = "Khách API", senderPhone = "0933 444 555", message = "Cho tôi xem nhà" });
        Assert.Equal(HttpStatusCode.Created, contact.StatusCode);

        var inbox = await JsonAsync(await seller.GetAsync("/api/seller/contact-requests"));
        Assert.Contains(inbox.EnumerateArray(), c => c.GetProperty("propertyId").GetGuid() == listingId && c.GetProperty("status").GetString() == "New");

        // Xoá tin đã có khách liên hệ: tin bị xoá, khách vẫn còn trong danh sách (hồi quy lỗi ràng buộc CHECK).
        Assert.Equal(HttpStatusCode.NoContent, (await seller.DeleteAsync($"/api/listings/{listingId}")).StatusCode);
        var inboxAfter = await JsonAsync(await seller.GetAsync("/api/seller/contact-requests"));
        Assert.Contains(inboxAfter.EnumerateArray(), c => c.GetProperty("senderName").GetString() == "Khách API");
        Assert.NotEqual(Guid.Empty, sellerUser.Id);
    }

    [Fact]
    public async Task ContactEndpointHidesZaloUntilSignedIn()
    {
        var (seller, _, _) = await _api.SignInAsNewAsync<Seller>();
        var created = await JsonAsync(await seller.PostAsJsonAsync("/api/listings", await ListingBodyAsync("Tin kiểm tra số liên hệ và số Zalo riêng")));
        var id = created.GetProperty("id").GetGuid();
        Assert.Equal("0911 222 ***", created.GetProperty("contactPhoneMasked").GetString());

        var anonymous = await JsonAsync(await _api.CreateClient().GetAsync($"/api/listings/{id}/contact"));
        Assert.Equal("0911222333", anonymous.GetProperty("phone").GetString());
        Assert.Equal(JsonValueKind.Null, anonymous.GetProperty("zaloLink").ValueKind);
        Assert.True(anonymous.GetProperty("zaloRequiresLogin").GetBoolean());

        var (buyer, _, _) = await _api.SignInAsNewAsync<Buyer>();
        var signedIn = await JsonAsync(await buyer.GetAsync($"/api/listings/{id}/contact"));
        Assert.Equal("https://zalo.me/0988777666", signedIn.GetProperty("zaloLink").GetString());
    }

    /* ------------------------------- Tài khoản ------------------------------- */

    [Fact]
    public async Task AvatarUploadRejectsFakeImageAndAcceptsJpeg()
    {
        var (client, user, _) = await _api.SignInAsNewAsync<Buyer>();

        static MultipartFormDataContent File(byte[] bytes, string type)
        {
            var file = new ByteArrayContent(bytes);
            file.Headers.ContentType = new MediaTypeHeaderValue(type);
            return new MultipartFormDataContent { { file, "file", "avatar" } };
        }

        var fake = await client.PutAsync("/api/users/me/avatar", File("<svg onload=alert(1)>"u8.ToArray(), "image/png"));
        Assert.Equal(HttpStatusCode.BadRequest, fake.StatusCode);

        var ok = await client.PutAsync("/api/users/me/avatar", File(new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 1, 2, 3 }, "image/jpeg"));
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        Assert.StartsWith($"https://storage.test/avatars/{user.Id:N}?v=", (await JsonAsync(ok)).GetProperty("avatarUrl").GetString());
        Assert.Equal("image/jpeg", _api.Avatars.ContentTypes[user.Id]);
    }

    [Fact]
    public async Task ProfileUpdateSavesZaloAndRejectsBadPhone()
    {
        var (client, _, _) = await _api.SignInAsNewAsync<Seller>();

        var ok = await client.PutAsJsonAsync("/api/users/me", new { fullName = "Người Bán API", phone = "0900 111 222", zaloPhone = "0977 888 999" });
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        Assert.Equal("0977888999", (await JsonAsync(ok)).GetProperty("zaloPhone").GetString());

        var bad = await client.PutAsJsonAsync("/api/users/me", new { fullName = "Người Bán API", phone = "abc" });
        Assert.Equal(HttpStatusCode.BadRequest, bad.StatusCode);
    }

    [Fact]
    public async Task LocationsEndpointListsAll63Provinces()
    {
        var provinces = await JsonAsync(await _api.CreateClient().GetAsync("/api/locations/provinces"));
        Assert.Equal(63, provinces.GetArrayLength());
    }
}
