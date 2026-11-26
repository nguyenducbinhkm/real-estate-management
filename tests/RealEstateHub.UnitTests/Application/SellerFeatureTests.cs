using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Services;
using RealEstateHub.Application.Validators;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.UnitTests.Application;

/// <summary>Tổng quan, Quản lý tin đăng (đổi trạng thái) và Quản lý khách hàng của người bán.</summary>
public class SellerFeatureTests
{
    private static readonly DateTime Now = DateTime.UtcNow;
    private static readonly Guid SellerId = Guid.NewGuid();

    private static Apartment SaleListing(PropertyStatus status = PropertyStatus.Active, DateTime? expiresAt = null) => new()
    {
        Title = "Căn hộ mẫu",
        Price = 3_000_000_000,
        Area = 70,
        OwnerId = SellerId,
        Status = status,
        ExpiresAt = expiresAt,
    };

    private static RentalApartment RentListing(PropertyStatus status = PropertyStatus.Active) => new()
    {
        Title = "Căn hộ cho thuê",
        Price = 12_000_000,
        Area = 50,
        OwnerId = SellerId,
        Status = status,
    };

    /* ------------------------------ Đổi trạng thái tin ------------------------------ */

    [Theory]
    [InlineData(PropertyStatus.Active, PropertyStatus.Draft)]
    [InlineData(PropertyStatus.Draft, PropertyStatus.Active)]
    [InlineData(PropertyStatus.Active, PropertyStatus.Sold)]
    [InlineData(PropertyStatus.Sold, PropertyStatus.Active)]
    [InlineData(PropertyStatus.Sold, PropertyStatus.Draft)]
    public void OwnerCanMoveSaleListingBetweenAllowedStatuses(PropertyStatus from, PropertyStatus to)
    {
        var listing = SaleListing(from);
        listing.ChangeStatusByOwner(to, Now);
        Assert.Equal(to, listing.Status);
    }

    [Theory]
    [InlineData(PropertyStatus.Active, PropertyStatus.Rented)]   // tin bán không thể "đã cho thuê"
    [InlineData(PropertyStatus.Pending, PropertyStatus.Active)]  // không tự duyệt tin
    [InlineData(PropertyStatus.Rejected, PropertyStatus.Active)]
    [InlineData(PropertyStatus.Pending, PropertyStatus.Sold)]
    [InlineData(PropertyStatus.Pending, PropertyStatus.Draft)]   // không ẩn rồi hiện lại để né bước duyệt
    [InlineData(PropertyStatus.Rejected, PropertyStatus.Draft)]
    [InlineData(PropertyStatus.Active, PropertyStatus.Pending)]  // không phải trạng thái chủ tin được chọn
    public void OwnerCannotMakeInvalidStatusChanges(PropertyStatus from, PropertyStatus to)
    {
        var listing = SaleListing(from);
        Assert.Throws<InvalidOperationException>(() => listing.ChangeStatusByOwner(to, Now));
        Assert.Equal(from, listing.Status);
    }

    [Fact]
    public void RentListingUsesRentedNotSold()
    {
        var listing = RentListing();
        Assert.Throws<InvalidOperationException>(() => listing.ChangeStatusByOwner(PropertyStatus.Sold, Now));
        listing.ChangeStatusByOwner(PropertyStatus.Rented, Now);
        Assert.Equal(PropertyStatus.Rented, listing.Status);
    }

    [Fact]
    public void ExpiredListingCannotBeShownAgainButCanBeHidden()
    {
        var listing = SaleListing(PropertyStatus.Draft, expiresAt: Now.AddDays(-1));
        Assert.Throws<InvalidOperationException>(() => listing.ChangeStatusByOwner(PropertyStatus.Active, Now));

        var active = SaleListing(PropertyStatus.Active, expiresAt: Now.AddDays(-1));
        active.ChangeStatusByOwner(PropertyStatus.Draft, Now);
        Assert.Equal(PropertyStatus.Draft, active.Status);
    }

    [Fact]
    public async Task ListingServiceRejectsStatusChangeByOtherUserAndMapsRuleErrorsTo422()
    {
        var listing = SaleListing(PropertyStatus.Active);
        var service = new ListingService(new FakeListings(listing), null!, null!, null!);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.ChangeStatusAsync(listing.Id, Guid.NewGuid(), false, new ChangeListingStatusRequest(PropertyStatus.Draft)));

        var error = await Assert.ThrowsAsync<AppException>(() =>
            service.ChangeStatusAsync(listing.Id, SellerId, false, new ChangeListingStatusRequest(PropertyStatus.Rented)));
        Assert.Equal(422, error.StatusCode);

        var updated = await service.ChangeStatusAsync(listing.Id, SellerId, false, new ChangeListingStatusRequest(PropertyStatus.Draft));
        Assert.Equal(PropertyStatus.Draft, updated.Status);
    }

    /* ------------------------------- Yêu cầu liên hệ ------------------------------- */

    [Fact]
    public async Task VisitorContactGoesToListingOwnerAsNew()
    {
        var listing = SaleListing();
        var repo = new FakeContacts();
        var service = new ContactRequestService(repo, new FakeListings(listing));

        var dto = await service.SendAsync(null, new CreateContactRequest(listing.Id, "  Anh Minh ", " 0912345678 ", "", "  Hẹn xem nhà  "));

        var saved = Assert.Single(repo.Items);
        Assert.Equal(SellerId, saved.ReceiverId);
        Assert.Null(saved.SenderId);
        Assert.Equal("Anh Minh", saved.SenderName);
        Assert.Null(saved.SenderEmail);
        Assert.Equal("Hẹn xem nhà", saved.Message);
        Assert.Equal("New", dto.Status);
        Assert.Equal(listing.Title, dto.PropertyTitle);
    }

    [Fact]
    public async Task CannotContactOwnListingOrClosedListing()
    {
        var own = SaleListing();
        var sold = SaleListing(PropertyStatus.Sold);
        var service = new ContactRequestService(new FakeContacts(), new FakeListings(own, sold));
        var request = (Guid id) => new CreateContactRequest(id, "Khách", "0912345678", null, null);

        var ownError = await Assert.ThrowsAsync<AppException>(() => service.SendAsync(SellerId, request(own.Id)));
        Assert.Equal("OWN_LISTING", ownError.ErrorCode);
        var closedError = await Assert.ThrowsAsync<AppException>(() => service.SendAsync(Guid.NewGuid(), request(sold.Id)));
        Assert.Equal("LISTING_CLOSED", closedError.ErrorCode);
    }

    [Fact]
    public async Task SellerFiltersUpdatesAndDeletesOnlyOwnContacts()
    {
        var listing = SaleListing();
        var mine1 = Contact(listing, "Nguyễn An", "0901111111", ContactRequestStatus.New);
        var mine2 = Contact(listing, "Trần Bình", "0902222222", ContactRequestStatus.Contacted);
        var others = Contact(listing, "Khách khác", "0903333333", ContactRequestStatus.New);
        others.ReceiverId = Guid.NewGuid();
        var repo = new FakeContacts(mine1, mine2, others);
        var service = new ContactRequestService(repo, new FakeListings(listing));

        Assert.Equal(2, (await service.GetForSellerAsync(SellerId, new ContactRequestQuery(null, null))).Count);
        Assert.Single(await service.GetForSellerAsync(SellerId, new ContactRequestQuery(ContactRequestStatus.New, null)));
        Assert.Equal("Trần Bình", Assert.Single(await service.GetForSellerAsync(SellerId, new ContactRequestQuery(null, "bình"))).SenderName);

        var updated = await service.UpdateStatusAsync(SellerId, mine1.Id, new UpdateContactStatusRequest(ContactRequestStatus.Closed));
        Assert.Equal("Closed", updated.Status);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.UpdateStatusAsync(SellerId, others.Id, new UpdateContactStatusRequest(ContactRequestStatus.Closed)));
        await Assert.ThrowsAsync<NotFoundException>(() => service.DeleteAsync(SellerId, others.Id));

        await service.DeleteAsync(SellerId, mine2.Id);
        Assert.DoesNotContain(mine2, repo.Items);
    }

    [Theory]
    [InlineData("Khách", "0912345678", null, true)]
    [InlineData("", "0912345678", null, false)]
    [InlineData("Khách", "abc", null, false)]
    [InlineData("Khách", "0912345678", "not-an-email", false)]
    public void ContactValidatorChecksInput(string name, string phone, string? email, bool valid)
        => Assert.Equal(valid, new CreateContactRequestValidator()
            .Validate(new CreateContactRequest(Guid.NewGuid(), name, phone, email, null)).IsValid);

    /* ---------------------------------- Tổng quan ---------------------------------- */

    [Fact]
    public async Task DashboardCountsListingsContactsAndSaves()
    {
        var live = SaleListing(PropertyStatus.Active, Now.AddDays(30));
        var expiring = SaleListing(PropertyStatus.Active, Now.AddDays(3));
        var hidden = SaleListing(PropertyStatus.Draft);
        var sold = SaleListing(PropertyStatus.Sold);
        var expired = SaleListing(PropertyStatus.Active, Now.AddDays(-2));
        var pending = RentListing(PropertyStatus.Pending);
        var listings = new FakeListings(live, expiring, hidden, sold, expired, pending)
        {
            SaveCounts = { [live.Id] = 4, [expiring.Id] = 1 },
        };
        var contacts = new FakeContacts(
            Contact(live, "A", "0900000001", ContactRequestStatus.New),
            Contact(live, "B", "0900000002", ContactRequestStatus.Contacted),
            Contact(expiring, "C", "0900000003", ContactRequestStatus.Closed));
        var users = new FakeUsers(new Seller { FullName = "Người bán" }, SellerId);
        var service = new SellerService(listings, contacts, users);

        var dashboard = await service.GetDashboardAsync(SellerId);

        Assert.Equal(6, dashboard.TotalListings);
        Assert.Equal(2, dashboard.ActiveListings);
        Assert.Equal(1, dashboard.HiddenListings);
        Assert.Equal(1, dashboard.ClosedListings);
        Assert.Equal(1, dashboard.ExpiredListings);
        Assert.Equal(1, dashboard.PendingListings);
        Assert.Equal(1, dashboard.ExpiringSoon);
        Assert.Equal(5, dashboard.TotalSaves);
        Assert.Equal(3, dashboard.TotalContacts);
        Assert.Equal(1, dashboard.NewContacts);
        Assert.Equal(14, dashboard.ContactsLast14Days.Count);
        Assert.Equal(3, dashboard.ContactsLast14Days.Sum(d => d.Count));
        Assert.Equal(live.Id, dashboard.TopListings[0].Listing.Id);
        Assert.Equal(expiring.Id, Assert.Single(dashboard.ExpiringListings).Listing.Id);

        var perListing = (await service.GetListingsAsync(SellerId)).Single(l => l.Listing.Id == live.Id);
        Assert.Equal((4, 2, 1), (perListing.SaveCount, perListing.ContactCount, perListing.NewContactCount));
    }

    /* ---------------------------------- Fakes ---------------------------------- */

    private static ContactRequest Contact(Property listing, string name, string phone, ContactRequestStatus status) => new()
    {
        PropertyId = listing.Id,
        Property = listing,
        ReceiverId = listing.OwnerId,
        SenderName = name,
        SenderPhone = phone,
        Status = status,
        CreatedAt = DateTime.Now,
    };

    private sealed class FakeContacts : IContactRequestRepository
    {
        public List<ContactRequest> Items { get; }
        public FakeContacts(params ContactRequest[] items) => Items = items.ToList();

        public Task<ContactRequest> AddAsync(ContactRequest request, CancellationToken ct = default)
        {
            Items.Add(request);
            return Task.FromResult(request);
        }
        public Task<ContactRequest?> GetByIdAsync(Guid id, CancellationToken ct = default) => Task.FromResult(Items.FirstOrDefault(c => c.Id == id));
        public Task<IReadOnlyCollection<ContactRequest>> GetForReceiverAsync(Guid receiverId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyCollection<ContactRequest>>(Items.Where(c => c.ReceiverId == receiverId).OrderByDescending(c => c.CreatedAt).ToArray());
        public Task UpdateAsync(ContactRequest request, CancellationToken ct = default) => Task.CompletedTask;
        public Task DeleteAsync(ContactRequest request, CancellationToken ct = default)
        {
            Items.Remove(request);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeListings : IListingRepository
    {
        private readonly List<Property> _items;
        public Dictionary<Guid, int> SaveCounts { get; } = new();
        public FakeListings(params Property[] items) => _items = items.ToList();

        public Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default) => Task.FromResult(_items.FirstOrDefault(p => p.Id == id));
        public Task<IReadOnlyCollection<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyCollection<Property>>(_items.Where(p => p.OwnerId == ownerId).ToArray());
        public Task<IReadOnlyDictionary<Guid, int>> GetSaveCountsAsync(Guid ownerId, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyDictionary<Guid, int>>(SaveCounts);
        public Task UpdateAsync(Property listing, CancellationToken ct = default) => Task.CompletedTask;

        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(ListingQuery query, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(SearchCriteria criteria, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyCollection<Property>> GetForModerationAsync(PropertyStatus? status, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyDictionary<PropertyStatus, int>> CountByStatusAsync(CancellationToken ct = default) => throw new NotImplementedException();
        public Task<Property> AddAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
        public Task DeleteAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
    }

    private sealed class FakeUsers : IUserRepository
    {
        private readonly User _user;
        public FakeUsers(User user, Guid id)
        {
            user.Id = id;
            _user = user;
        }
        public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) => Task.FromResult<User?>(_user.Id == id ? _user : null);
        public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) => Task.FromResult<User?>(null);
        public Task<User> AddAsync(User user, CancellationToken ct = default) => Task.FromResult(user);
        public Task UpdateAsync(User user, CancellationToken ct = default) => Task.CompletedTask;
        public Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default) => Task.FromResult<RefreshToken?>(null);
        public Task AddRefreshTokenAsync(RefreshToken token, CancellationToken ct = default) => Task.CompletedTask;
    }
}
