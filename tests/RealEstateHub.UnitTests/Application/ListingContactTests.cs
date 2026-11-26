using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Mappings;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Services;
using RealEstateHub.Application.Validators;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;
using RealEstateHub.Domain.ValueObjects;

namespace RealEstateHub.UnitTests.Application;

/// <summary>Số liên hệ / số Zalo của tin đăng: che số, thứ tự ưu tiên, nút "Hiện số" và "Chat qua Zalo".</summary>
public class ListingContactTests
{
    [Theory]
    [InlineData("0335834123", "0335 834 ***")]
    [InlineData("0335 834 123", "0335 834 ***")]
    [InlineData("+84335834123", "0335 834 ***")]
    [InlineData("12345", "12 ***")]
    [InlineData(null, null)]
    [InlineData("  ", null)]
    public void MaskHidesTheLastDigits(string? phone, string? expected)
        => Assert.Equal(expected, PhoneNumber.Mask(phone));

    [Theory]
    [InlineData("0335.834.123", "https://zalo.me/0335834123")]
    [InlineData("+84 335 834 123", "https://zalo.me/0335834123")]
    [InlineData("", null)]
    public void ZaloLinkUsesLocalDigits(string phone, string? expected)
        => Assert.Equal(expected, PhoneNumber.ZaloLink(phone));

    [Fact]
    public void ListingPhonesFallBackToOwnerProfile()
    {
        var owner = new Seller { Phone = "0900000001", ZaloPhone = "0900000002" };
        var listing = new Apartment { Owner = owner };

        Assert.Equal("0900000001", listing.EffectiveContactPhone);
        Assert.Equal("0900000002", listing.EffectiveZaloPhone);

        owner.ZaloPhone = null;
        Assert.Equal("0900000001", listing.EffectiveZaloPhone); // không có Zalo riêng → dùng số liên hệ

        listing.SetContactPhones("0911 111 111", "0922.222.222");
        Assert.Equal("0911111111", listing.EffectiveContactPhone);
        Assert.Equal("0922222222", listing.EffectiveZaloPhone);
    }

    [Fact]
    public void PublicListingOnlyExposesMaskedPhone()
    {
        var listing = new Apartment { Owner = new Seller { Phone = "0335834123" } };
        var dto = RealEstateHubProfile.MapListing(listing);

        Assert.Equal("0335 834 ***", dto.ContactPhoneMasked);
        Assert.True(dto.HasZalo);
    }

    [Fact]
    public async Task RevealPhoneIsPublicButZaloNeedsLogin()
    {
        var listing = new Apartment { Owner = new Seller { Phone = "0335834123", ZaloPhone = "0987654321" } };
        var service = new ListingService(new OneListing(listing), null!, null!, null!);

        var anonymous = await service.GetContactAsync(listing.Id, isAuthenticated: false);
        Assert.Equal("0335834123", anonymous.Phone);
        Assert.Null(anonymous.ZaloPhone);
        Assert.Null(anonymous.ZaloLink);
        Assert.True(anonymous.ZaloRequiresLogin);

        var signedIn = await service.GetContactAsync(listing.Id, isAuthenticated: true);
        Assert.Equal("0987654321", signedIn.ZaloPhone);
        Assert.Equal("https://zalo.me/0987654321", signedIn.ZaloLink);
        Assert.False(signedIn.ZaloRequiresLogin);
    }

    [Theory]
    [InlineData("0912 345 678", true)]
    [InlineData("", true)]
    [InlineData("abc", false)]
    public void ProfileZaloPhoneIsValidated(string zalo, bool valid)
        => Assert.Equal(valid, new UpdateProfileRequestValidator().Validate(new UpdateProfileRequest("Nguyễn Văn A", "0912345678", zalo)).IsValid);

    private sealed class OneListing : IListingRepository
    {
        private readonly Property _listing;
        public OneListing(Property listing) => _listing = listing;

        public Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default) => Task.FromResult<Property?>(_listing.Id == id ? _listing : null);
        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(ListingQuery query, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(SearchCriteria criteria, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyCollection<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyDictionary<Guid, int>> GetSaveCountsAsync(Guid ownerId, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyCollection<Property>> GetForModerationAsync(PropertyStatus? status, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyDictionary<PropertyStatus, int>> CountByStatusAsync(CancellationToken ct = default) => throw new NotImplementedException();
        public Task<Property> AddAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
        public Task UpdateAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
        public Task DeleteAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
    }
}
