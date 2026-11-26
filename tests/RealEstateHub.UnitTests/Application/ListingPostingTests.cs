using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Patterns.Factory;
using RealEstateHub.Application.Services;
using RealEstateHub.Application.Validators;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.UnitTests.Application;

/// <summary>Đăng tin, sửa tin, giới hạn số tin, ảnh và kiểm duyệt của admin.</summary>
public class ListingPostingTests
{
    private static readonly Guid OwnerId = Guid.NewGuid();
    private static readonly DateTime Now = DateTime.UtcNow;

    private static readonly Ward Ward = new()
    {
        Code = "W1",
        Name = "Phường 1",
        District = new District { Code = "D1", Name = "Quận 1", Province = new Province { Code = "P1", Name = "TP. Hồ Chí Minh" } },
    };

    private static CreateListingRequest ApartmentRequest(List<string>? images = null) => new()
    {
        PropertyType = PropertyType.Apartment,
        TransactionType = TransactionType.ForSale,
        Title = "Bán căn hộ 2 phòng ngủ view sông Quận 1",
        Description = "Căn hộ thoáng mát, nội thất đầy đủ, sổ hồng chính chủ, gần trường học và chợ, vào ở ngay.",
        Price = 3_500_000_000,
        Area = 72,
        ProvinceCode = "P1",
        DistrictCode = "D1",
        WardCode = "W1",
        StreetAddress = "12 Nguyễn Huệ",
        BedroomCount = 2,
        BathroomCount = 2,
        FloorNumber = 12,
        LegalStatus = LegalStatus.PinkBook,
        Furniture = FurnitureStatus.Full,
        ImageUrls = images,
    };

    private static (ListingService Service, FakeListingStore Store) CreateService(User owner, params Property[] existing)
    {
        owner.Id = OwnerId;
        var store = new FakeListingStore(existing);
        var service = new ListingService(store, new SingleUser(owner), new SingleWard(), new PropertyFactory());
        return (service, store);
    }

    /* ------------------------------- Đăng tin ------------------------------- */

    [Fact]
    public async Task NewListingIsPendingWithImagesInOrder()
    {
        var (service, store) = CreateService(new Seller());
        var dto = await service.CreateAsync(OwnerId, ApartmentRequest(new() { "/uploads/listings/a.jpg", "/uploads/listings/b.png" }));

        Assert.Equal(PropertyStatus.Pending, dto.Status);
        Assert.Equal(new[] { "/uploads/listings/a.jpg", "/uploads/listings/b.png" }, dto.Images.Select(i => i.Url));
        Assert.Equal(2, dto.Bedrooms);
        Assert.Equal(LegalStatus.PinkBook, dto.LegalStatus);
        Assert.True(store.Items.Single().Images.First().IsPrimary);
    }

    [Fact]
    public async Task BuyerCannotPost()
    {
        var (service, _) = CreateService(new Buyer());
        await Assert.ThrowsAsync<ForbiddenException>(() => service.CreateAsync(OwnerId, ApartmentRequest()));
    }

    [Fact]
    public async Task SellerIsLimitedToFiveOpenListingsButClosedOnesDoNotCount()
    {
        var open = Enumerable.Range(0, 5).Select(_ => (Property)new Apartment { OwnerId = OwnerId, Status = PropertyStatus.Active }).ToArray();
        var (service, _) = CreateService(new Seller(), open);
        var error = await Assert.ThrowsAsync<AppException>(() => service.CreateAsync(OwnerId, ApartmentRequest()));
        Assert.Equal("LISTING_LIMIT", error.ErrorCode);

        open[0].Status = PropertyStatus.Sold;
        var (service2, _) = CreateService(new Seller(), open);
        var dto = await service2.CreateAsync(OwnerId, ApartmentRequest());
        Assert.Equal(PropertyStatus.Pending, dto.Status);
    }

    [Fact]
    public async Task AgentHasHigherLimit()
    {
        var many = Enumerable.Range(0, 5).Select(_ => (Property)new Apartment { OwnerId = OwnerId, Status = PropertyStatus.Active }).ToArray();
        var (service, _) = CreateService(new AgentSeller(), many);
        Assert.Equal(PropertyStatus.Pending, (await service.CreateAsync(OwnerId, ApartmentRequest())).Status);
    }

    /* ------------------------------- Sửa tin ------------------------------- */

    [Theory]
    [InlineData(PropertyStatus.Active)]
    [InlineData(PropertyStatus.Rejected)]
    [InlineData(PropertyStatus.Expired)]
    public async Task OwnerEditSendsListingBackToReview(PropertyStatus from)
    {
        var listing = new Apartment { OwnerId = OwnerId, Status = from, Title = "x", Price = 1, Area = 1 };
        var (service, _) = CreateService(new Seller(), listing);

        var request = new UpdateListingRequest { PropertyType = PropertyType.Apartment, TransactionType = TransactionType.ForSale };
        Copy(ApartmentRequest(new() { "/uploads/listings/new.jpg" }), request);
        var dto = await service.UpdateAsync(listing.Id, OwnerId, false, request);

        Assert.Equal(PropertyStatus.Pending, dto.Status);
        Assert.Equal("Bán căn hộ 2 phòng ngủ view sông Quận 1", dto.Title);
        Assert.Single(dto.Images);
    }

    [Fact]
    public async Task SoldListingCannotBeEdited()
    {
        var listing = new Apartment { OwnerId = OwnerId, Status = PropertyStatus.Sold };
        var (service, _) = CreateService(new Seller(), listing);
        var request = new UpdateListingRequest();
        Copy(ApartmentRequest(), request);

        var error = await Assert.ThrowsAsync<AppException>(() => service.UpdateAsync(listing.Id, OwnerId, false, request));
        Assert.Equal(422, error.StatusCode);
    }

    /* ------------------------------- Kiểm tra dữ liệu ------------------------------- */

    [Fact]
    public void ValidatorRequiresTypeSpecificFields()
    {
        var validator = new CreateListingRequestValidator();

        var house = ApartmentRequest();
        house.PropertyType = PropertyType.House;
        Assert.Contains(validator.Validate(house).Errors, e => e.PropertyName == "LandArea");

        var land = ApartmentRequest();
        land.PropertyType = PropertyType.Land;
        Assert.Contains(validator.Validate(land).Errors, e => e.PropertyName == "HasClearance");

        var warehouse = ApartmentRequest();
        warehouse.PropertyType = PropertyType.Warehouse;
        warehouse.TransactionType = TransactionType.ForRent;
        Assert.Contains(validator.Validate(warehouse).Errors, e => e.PropertyName == "CeilingHeight");

        Assert.True(validator.Validate(ApartmentRequest()).IsValid);
    }

    [Theory]
    [InlineData("/uploads/listings/abc.jpg", true)]
    [InlineData("https://example.com/a.jpg", true)]
    [InlineData("/uploads/listings/../../appsettings.json", false)]
    [InlineData("javascript:alert(1)", false)]
    [InlineData("/etc/passwd", false)]
    public void OnlySafeImageUrlsAreAccepted(string url, bool ok)
        => Assert.Equal(ok, CreateListingRequestValidator.IsAllowedImageUrl(url));

    [Fact]
    public void ListingAcceptsAtMostTenImages()
    {
        var listing = new Apartment();
        Assert.Throws<InvalidOperationException>(() =>
            listing.ReplaceImages(Enumerable.Range(0, 11).Select(i => $"/uploads/listings/{i}.jpg")));
    }

    /* ------------------------------- Tải ảnh ------------------------------- */

    [Theory]
    [InlineData(new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }, ".jpg")]
    [InlineData(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }, ".png")]
    [InlineData(new byte[] { 0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50 }, ".webp")]
    [InlineData(new byte[] { 0x3C, 0x73, 0x76, 0x67 }, null)] // <svg
    public void ImageTypeIsDetectedFromContent(byte[] head, string? expected)
        => Assert.Equal(expected, ImageUploadService.DetectExtension(head));

    [Fact]
    public async Task UploadRejectsNonImagesAndBuyers()
    {
        var storage = new MemoryStorage();
        var seller = new Seller { Id = OwnerId };
        var uploads = new ImageUploadService(new SingleUser(seller), storage);

        var fake = new MemoryStream("<html>not an image</html>"u8.ToArray());
        var error = await Assert.ThrowsAsync<AppException>(() => uploads.UploadListingImageAsync(OwnerId, fake, fake.Length));
        Assert.Equal("INVALID_IMAGE", error.ErrorCode);

        var jpg = new MemoryStream(new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 1, 2, 3 });
        var result = await uploads.UploadListingImageAsync(OwnerId, jpg, jpg.Length);
        Assert.Equal("/uploads/listings/test.jpg", result.Url);

        var buyerUploads = new ImageUploadService(new SingleUser(new Buyer { Id = OwnerId }), storage);
        await Assert.ThrowsAsync<ForbiddenException>(() => buyerUploads.UploadListingImageAsync(OwnerId, jpg, jpg.Length));
    }

    /* ------------------------------- Kiểm duyệt ------------------------------- */

    [Fact]
    public async Task AdminApprovesPendingListingForThirtyDays()
    {
        var listing = new Apartment { OwnerId = OwnerId, Status = PropertyStatus.Pending };
        var moderation = new ListingModerationService(new FakeListingStore(new Property[] { listing }));

        var dto = await moderation.ApproveAsync(listing.Id);

        Assert.Equal(PropertyStatus.Active, dto.Status);
        Assert.InRange(dto.ExpiresAt!.Value, Now.AddDays(29.9), Now.AddDays(30.1));
    }

    [Fact]
    public async Task AdminRejectsOnlyPendingListings()
    {
        var pending = new Apartment { OwnerId = OwnerId, Status = PropertyStatus.Pending };
        var active = new Apartment { OwnerId = OwnerId, Status = PropertyStatus.Active };
        var moderation = new ListingModerationService(new FakeListingStore(new Property[] { pending, active }));

        Assert.Equal(PropertyStatus.Rejected, (await moderation.RejectAsync(pending.Id)).Status);
        var error = await Assert.ThrowsAsync<AppException>(() => moderation.RejectAsync(active.Id));
        Assert.Equal(422, error.StatusCode);
        await Assert.ThrowsAsync<NotFoundException>(() => moderation.ApproveAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task QueueFiltersByKeywordAndCountsByStatus()
    {
        var owner = new Seller { FullName = "Nguyễn Văn Bán", Email = "ban@example.test", Phone = "0900000001" };
        var a = new Apartment { Title = "Căn hộ Thảo Điền", Status = PropertyStatus.Pending, Owner = owner };
        var b = new Apartment { Title = "Căn hộ Quận 7", Status = PropertyStatus.Active, Owner = owner };
        var moderation = new ListingModerationService(new FakeListingStore(new Property[] { a, b }));

        var queue = await moderation.GetQueueAsync(null, "thảo");

        Assert.Single(queue.Items);
        Assert.Equal("Seller", queue.Items.Single().OwnerRole);
        Assert.Equal(1, queue.Counts["Pending"]);
        Assert.Equal(1, queue.Counts["Active"]);
    }

    private static void Copy(CreateListingRequest from, CreateListingRequest to)
    {
        foreach (var prop in typeof(CreateListingRequest).GetProperties())
            prop.SetValue(to, prop.GetValue(from));
    }

    /* ------------------------------- Fakes ------------------------------- */

    private sealed class FakeListingStore : IListingRepository
    {
        public List<Property> Items { get; }
        public FakeListingStore(IEnumerable<Property> items) => Items = items.ToList();

        public Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default) => Task.FromResult(Items.FirstOrDefault(p => p.Id == id));
        public Task<IReadOnlyCollection<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyCollection<Property>>(Items.Where(p => p.OwnerId == ownerId).ToArray());
        public Task<IReadOnlyCollection<Property>> GetForModerationAsync(PropertyStatus? status, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyCollection<Property>>(Items.Where(p => status is null || p.Status == status).ToArray());
        public Task<IReadOnlyDictionary<PropertyStatus, int>> CountByStatusAsync(CancellationToken ct = default)
            => Task.FromResult<IReadOnlyDictionary<PropertyStatus, int>>(Items.GroupBy(p => p.Status).ToDictionary(g => g.Key, g => g.Count()));
        public Task<Property> AddAsync(Property listing, CancellationToken ct = default)
        {
            Items.Add(listing);
            return Task.FromResult(listing);
        }
        public Task UpdateAsync(Property listing, CancellationToken ct = default) => Task.CompletedTask;

        public Task<IReadOnlyDictionary<Guid, int>> GetSaveCountsAsync(Guid ownerId, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(ListingQuery query, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(SearchCriteria criteria, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default) => throw new NotImplementedException();
        public Task DeleteAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
    }

    private sealed class SingleUser : IUserRepository
    {
        private readonly User _user;
        public SingleUser(User user) => _user = user;
        public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) => Task.FromResult<User?>(_user.Id == id ? _user : null);
        public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) => Task.FromResult<User?>(null);
        public Task<User> AddAsync(User user, CancellationToken ct = default) => Task.FromResult(user);
        public Task UpdateAsync(User user, CancellationToken ct = default) => Task.CompletedTask;
        public Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default) => Task.FromResult<RefreshToken?>(null);
        public Task AddRefreshTokenAsync(RefreshToken token, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class SingleWard : ILocationRepository
    {
        public Task<Ward?> FindWardAsync(string wardCode, CancellationToken ct = default) => Task.FromResult<Ward?>(wardCode == Ward.Code ? Ward : null);
        public Task<IReadOnlyList<Province>> GetProvincesAsync(CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyList<District>> GetDistrictsAsync(string provinceCode, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyList<Ward>> GetWardsAsync(string districtCode, CancellationToken ct = default) => throw new NotImplementedException();
    }

    private sealed class MemoryStorage : IImageStorage
    {
        public Task<string> SaveListingImageAsync(Stream content, string extension, CancellationToken ct = default)
            => Task.FromResult($"/uploads/listings/test{extension}");
    }
}
