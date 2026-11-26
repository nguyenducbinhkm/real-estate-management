using Microsoft.EntityFrameworkCore;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Patterns.Factory;
using RealEstateHub.Application.Services;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;
using RealEstateHub.Infrastructure.Repositories;
using RealEstateHub.Infrastructure.Services;
using RealEstateHub.TestSupport;

namespace RealEstateHub.IntegrationTests;

/// <summary>
/// Integration test trên PostgreSQL thật (database dựng từ database/*.sql của repo, ≈13.000 dòng dữ liệu mẫu):
/// repository + service + SQL thật, luồng liên phân hệ, Rollback khi tiêm lỗi và đối chiếu báo cáo với SQL tính tay.
/// </summary>
[Collection(DatabaseCollection.Name)]
public class IntegrationTests
{
    private readonly DatabaseFixture _fx;

    public IntegrationTests(DatabaseFixture fx) => _fx = fx;

    private static Apartment NewListing(Guid ownerId, Guid wardId, PropertyStatus status, string title) => new()
    {
        Title = title,
        Description = "Tin tạo bởi integration test.",
        Price = 2_000_000_000,
        Area = 60,
        OwnerId = ownerId,
        WardId = wardId,
        StreetAddress = "1 Đường Test",
        Status = status,
        BedroomCount = 2,
        BathroomCount = 1,
    };

    /* ----------------------------- Dữ liệu mẫu ----------------------------- */

    [Fact]
    public async Task SeedDataCoversEveryTableWithAtLeast120Rows()
    {
        // Đáp án tính tay: số dòng của từng bảng trong database/seed.sql.
        Assert.Equal(300, await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Properties"" WHERE ""Title"" NOT LIKE '[IT]%'"));
        Assert.Equal(120, await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""ContactRequests"""));
        Assert.Equal(63, await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Provinces"""));
        Assert.True(await _fx.ScalarAsync(@"SELECT COUNT(DISTINCT ""UserRole"") FROM ""Users""") >= 4); // Buyer/Seller/Agent/Admin
        var tables = await _fx.ScalarAsync(@"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
        Assert.True(tables >= 11, $"Chỉ có {tables} bảng");
    }

    /* ----------------------------- Truy vấn / ánh xạ ----------------------------- */

    [Fact]
    public async Task PublicSearchHidesPendingRejectedAndHiddenListings()
    {
        await using var db = _fx.NewContext();
        await using var tx = await db.Database.BeginTransactionAsync();
        var seller = await TestUsers.CreateAsync<Seller>(db);
        var ward = await DatabaseFixture.AnyWardAsync(db);
        var tag = $"[IT] {Guid.NewGuid():N}";
        foreach (var status in new[] { PropertyStatus.Active, PropertyStatus.Pending, PropertyStatus.Rejected, PropertyStatus.Draft, PropertyStatus.Sold })
            db.Properties.Add(NewListing(seller.Id, ward.Id, status, $"{tag} {status}"));
        await db.SaveChangesAsync();

        var (items, total) = await DatabaseFixture.Listings(db).SearchAsync(new SearchCriteria.Builder().WithKeyword(tag).WithPaging(1, 50).Build());

        Assert.Equal(2, total);
        Assert.Equal(new[] { PropertyStatus.Active, PropertyStatus.Sold }, items.Select(i => i.Status).OrderBy(s => s));
        await tx.RollbackAsync();
    }

    [Fact]
    public async Task DeletingListingCascadesImagesButKeepsCustomerContactRequests()
    {
        await using var db = _fx.NewContext();
        await using var tx = await db.Database.BeginTransactionAsync();
        var seller = await TestUsers.CreateAsync<Seller>(db);
        var listing = NewListing(seller.Id, (await DatabaseFixture.AnyWardAsync(db)).Id, PropertyStatus.Active, "[IT] xoá tin");
        listing.ReplaceImages(new[] { "/uploads/listings/a.jpg", "/uploads/listings/b.jpg" });
        db.Properties.Add(listing);
        db.ContactRequests.Add(new ContactRequest { PropertyId = listing.Id, ReceiverId = seller.Id, SenderName = "Khách", SenderPhone = "0911111111" });
        await db.SaveChangesAsync();

        await DatabaseFixture.Listings(db).DeleteAsync(listing);

        Assert.Equal(0, await db.Set<PropertyImage>().CountAsync(i => i.PropertyId == listing.Id));          // ON DELETE CASCADE
        var request = await db.ContactRequests.AsNoTracking().SingleAsync(r => r.ReceiverId == seller.Id);
        Assert.Null(request.PropertyId);                                                                    // ON DELETE SET NULL
        await tx.RollbackAsync();
    }

    [Fact]
    public async Task UserSearchIsCaseInsensitiveAndFiltersByRole()
    {
        await using var db = _fx.NewContext();
        await using var tx = await db.Database.BeginTransactionAsync();
        var agent = await TestUsers.CreateAsync<AgentSeller>(db, configure: u => u.FullName = "Môi Giới Đặc Biệt");

        var found = await new AdminRepository(db).SearchUsersAsync(UserRole.Agent, "đặc biệt");
        var wrongRole = await new AdminRepository(db).SearchUsersAsync(UserRole.Buyer, "đặc biệt");

        Assert.Contains(found, u => u.Id == agent.Id);
        Assert.DoesNotContain(wrongRole, u => u.Id == agent.Id);
        await tx.RollbackAsync();
    }

    [Fact]
    public async Task LocationsAreLinkedProvinceToDistrictToWard()
    {
        await using var db = _fx.NewContext();
        var locations = new LocationRepository(db);
        var hcm = (await locations.GetProvincesAsync()).Single(p => p.Name.Contains("Hồ Chí Minh"));
        var districts = await locations.GetDistrictsAsync(hcm.Code);
        var wards = await locations.GetWardsAsync(districts[0].Code);
        var ward = await locations.FindWardAsync(wards[0].Code);

        Assert.True(districts.Count >= 20);
        Assert.NotEmpty(wards);
        Assert.Equal(hcm.Code, ward!.District.Province.Code);
    }

    /* ----------------------------- ACID / Rollback (tiêm lỗi) ----------------------------- */

    [Fact]
    public async Task RoleChangeRollsBackUsersWhenTokenRevocationFails()
    {
        Guid userId;
        await using (var setup = _fx.NewContext())
            userId = (await TestUsers.CreateAsync<Buyer>(setup)).Id;

        // Tiêm lỗi vào bước 2 (UPDATE "RefreshTokens") của giao dịch đổi vai trò.
        await using (var failing = _fx.NewContext(new FailingCommandInterceptor(@"UPDATE ""RefreshTokens""")))
            await Assert.ThrowsAsync<InvalidOperationException>(() => new AdminRepository(failing).ChangeRoleAsync(userId, UserRole.Seller));

        await using var check = _fx.NewContext();
        Assert.IsType<Buyer>(await check.Users.AsNoTracking().SingleAsync(u => u.Id == userId)); // bước 1 đã được hoàn tác
    }

    [Fact]
    public async Task RoleChangeCommitsBothTablesAndRevokesSessions()
    {
        Guid userId;
        await using (var setup = _fx.NewContext())
        {
            var buyer = await TestUsers.CreateAsync<Buyer>(setup);
            setup.RefreshTokens.Add(new RefreshToken { UserId = buyer.Id, Token = Guid.NewGuid().ToString("N"), ExpiresAt = DateTime.UtcNow.AddDays(1) });
            await setup.SaveChangesAsync();
            userId = buyer.Id;
        }

        await using (var db = _fx.NewContext())
            await new AdminRepository(db).ChangeRoleAsync(userId, UserRole.Seller);

        await using var check = _fx.NewContext();
        Assert.IsType<Seller>(await check.Users.AsNoTracking().SingleAsync(u => u.Id == userId));
        Assert.All(await check.RefreshTokens.Where(t => t.UserId == userId).ToListAsync(), t => Assert.NotNull(t.RevokedAt));
    }

    [Fact]
    public async Task ListingWithInvalidImageIsNotSavedAtAll()
    {
        Guid sellerId, wardId;
        await using (var setup = _fx.NewContext())
        {
            sellerId = (await TestUsers.CreateAsync<Seller>(setup)).Id;
            wardId = (await DatabaseFixture.AnyWardAsync(setup)).Id;
        }

        var listing = NewListing(sellerId, wardId, PropertyStatus.Pending, "[IT] rollback ảnh lỗi");
        listing.Images.Add(new PropertyImage { PropertyId = listing.Id, Url = new string('x', 2000) }); // vượt VARCHAR(1000)

        await using (var db = _fx.NewContext())
            await Assert.ThrowsAsync<DbUpdateException>(() => DatabaseFixture.Listings(db).AddAsync(listing));

        // Properties + PropertyImages ghi trong 1 transaction: ảnh lỗi → tin cũng không được lưu.
        Assert.Equal(0, await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Properties"" WHERE ""PropertyId"" = @p0", listing.Id));
    }

    /* ----------------------------- Luồng liên phân hệ ----------------------------- */

    [Fact]
    public async Task PostApproveThenListingBecomesPublic()
    {
        await using var db = _fx.NewContext();
        await using var tx = await db.Database.BeginTransactionAsync();
        var seller = await TestUsers.CreateAsync<Seller>(db);
        var ward = await DatabaseFixture.AnyWardAsync(db);
        var listings = DatabaseFixture.Listings(db);
        var service = new ListingService(listings, new UserRepository(db), new LocationRepository(db), new PropertyFactory());
        var tag = $"[IT] {Guid.NewGuid():N}";

        var created = await service.CreateAsync(seller.Id, new CreateListingRequest
        {
            PropertyType = PropertyType.Apartment, TransactionType = TransactionType.ForSale,
            Title = $"{tag} căn hộ kiểm thử", Description = "Mô tả đủ dài cho integration test luồng đăng tin.",
            Price = 3_000_000_000, Area = 70, ProvinceCode = ward.District.Province.Code, DistrictCode = ward.District.Code,
            WardCode = ward.Code, StreetAddress = "2 Đường Test", ImageUrls = new() { "/uploads/listings/it.jpg" },
            ContactPhone = "0911 222 333",
        });
        var beforeApprove = await listings.SearchAsync(new SearchCriteria.Builder().WithKeyword(tag).Build());
        await new ListingModerationService(listings).ApproveAsync(created.Id);
        var afterApprove = await listings.SearchAsync(new SearchCriteria.Builder().WithKeyword(tag).Build());

        Assert.Equal(0, beforeApprove.Total);
        Assert.Equal(1, afterApprove.Total);
        var saved = await db.Properties.AsNoTracking().Include(p => p.Images).SingleAsync(p => p.Id == created.Id);
        Assert.Equal("0911222333", saved.ContactPhone);
        Assert.Single(saved.Images);
        await tx.RollbackAsync();
    }

    [Fact]
    public async Task VisitorContactReachesSellerCustomerList()
    {
        await using var db = _fx.NewContext();
        await using var tx = await db.Database.BeginTransactionAsync();
        var seller = await TestUsers.CreateAsync<Seller>(db);
        var listing = NewListing(seller.Id, (await DatabaseFixture.AnyWardAsync(db)).Id, PropertyStatus.Active, "[IT] liên hệ");
        db.Properties.Add(listing);
        await db.SaveChangesAsync();
        var requests = new ContactRequestRepository(db);
        var contacts = new ContactRequestService(requests, DatabaseFixture.Listings(db));

        await contacts.SendAsync(null, new CreateContactRequest(listing.Id, "Khách Tích Hợp", "0933 444 555", null, "Còn bán không?"));
        var inbox = await contacts.GetForSellerAsync(seller.Id, new ContactRequestQuery(ContactRequestStatus.New, "tích hợp"));

        var item = Assert.Single(inbox);
        Assert.Equal(listing.Id, item.PropertyId);
        Assert.Equal("[IT] liên hệ", item.PropertyTitle);
        await tx.RollbackAsync();
    }

    /* ----------------------------- Báo cáo khớp tính tay ----------------------------- */

    [Fact]
    public async Task SellerDashboardMatchesHandCountedSql()
    {
        // Người bán có nhiều yêu cầu liên hệ nhất trong dữ liệu mẫu.
        await using var db = _fx.NewContext();
        var sellerId = await db.ContactRequests.Where(r => r.ReceiverId != null)
            .GroupBy(r => r.ReceiverId).OrderByDescending(g => g.Count()).Select(g => g.Key!.Value).FirstAsync();
        var dashboard = await new SellerService(DatabaseFixture.Listings(db), new ContactRequestRepository(db), new UserRepository(db))
            .GetDashboardAsync(sellerId);

        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Properties"" WHERE ""OwnerId"" = @p0", sellerId), dashboard.TotalListings);
        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""ContactRequests"" WHERE ""ReceiverId"" = @p0", sellerId), dashboard.TotalContacts);
        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""ContactRequests"" WHERE ""ReceiverId"" = @p0 AND ""Status"" = 'New'", sellerId), dashboard.NewContacts);
        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""SavedListings"" s JOIN ""Properties"" p ON p.""PropertyId"" = s.""PropertyId"" WHERE p.""OwnerId"" = @p0", sellerId), dashboard.TotalSaves);
        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Properties"" WHERE ""OwnerId"" = @p0 AND ""Status"" = 'Pending'", sellerId), dashboard.PendingListings);
    }

    [Fact]
    public async Task AdminStatsMatchHandCountedSql()
    {
        await using var db = _fx.NewContext();
        var stats = await new AdminService(new AdminRepository(db), new UserRepository(db), DatabaseFixture.Listings(db)).GetStatsAsync();

        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Users"""), stats.TotalUsers);
        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Users"" WHERE ""UserRole"" = 'Seller'"), stats.UsersByRole["Seller"]);
        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Properties"""), stats.TotalListings);
        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Properties"" WHERE ""Status"" = 'Pending'"), stats.ListingsByStatus["Pending"]);
        Assert.Equal(await _fx.ScalarAsync(@"SELECT COUNT(*) FROM ""Properties"" WHERE ""Status"" = 'Sold'"), stats.ListingsByStatus["Sold"]);
    }

    [Fact]
    public async Task PasswordsAreStoredHashedNotPlainText()
    {
        await using var db = _fx.NewContext();
        await using var tx = await db.Database.BeginTransactionAsync();
        var user = await TestUsers.CreateAsync<Buyer>(db);

        var stored = await db.Users.AsNoTracking().Where(u => u.Id == user.Id).Select(u => u.PasswordHash).SingleAsync();
        Assert.StartsWith("PBKDF2:", stored);
        Assert.DoesNotContain(TestUsers.Password, stored);
        Assert.True(new PasswordHasher().Verify(TestUsers.Password, stored));
        await tx.RollbackAsync();
    }
}
