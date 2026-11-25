using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Mappings;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Services;

public class SellerService : ISellerService
{
    private const int ExpiringWithinDays = 7;

    private readonly IListingRepository _listings;
    private readonly IContactRequestRepository _requests;
    private readonly IUserRepository _users;

    public SellerService(IListingRepository listings, IContactRequestRepository requests, IUserRepository users)
    {
        _listings = listings;
        _requests = requests;
        _users = users;
    }

    public async Task<IReadOnlyCollection<SellerListingDto>> GetListingsAsync(Guid sellerId, CancellationToken ct = default)
    {
        var (listings, contacts, saves) = await LoadAsync(sellerId, ct);
        return listings.Select(p => ToSellerListing(p, contacts, saves)).ToArray();
    }

    public async Task<SellerDashboardDto> GetDashboardAsync(Guid sellerId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(sellerId, ct) ?? throw new NotFoundException("Không tìm thấy tài khoản.");
        var (listings, contacts, saves) = await LoadAsync(sellerId, ct);
        var now = DateTime.UtcNow;

        bool Closed(Property p) => p.Status is PropertyStatus.Sold or PropertyStatus.Rented;
        bool Expired(Property p) => !Closed(p) && p.IsExpired(now);
        bool Live(Property p) => p.Status == PropertyStatus.Active && !p.IsExpired(now);
        bool ExpiringSoon(Property p) => Live(p) && p.ExpiresAt.HasValue && p.ExpiresAt.Value <= now.AddDays(ExpiringWithinDays);

        var today = DateTime.Now.Date;
        var last14Days = Enumerable.Range(0, 14)
            .Select(offset => today.AddDays(offset - 13))
            .Select(day => new DailyCount(day, contacts.Count(c => c.CreatedAt.Date == day)))
            .ToArray();

        var sellerListings = listings.Select(p => ToSellerListing(p, contacts, saves)).ToArray();

        return new SellerDashboardDto(
            MaxListings: user.GetMaxListings(),
            UsedListingSlots: listings.Count(p => p.CountsTowardListingLimit),
            TotalListings: listings.Count,
            ActiveListings: listings.Count(Live),
            PendingListings: listings.Count(p => p.Status == PropertyStatus.Pending),
            HiddenListings: listings.Count(p => p.Status == PropertyStatus.Draft),
            ClosedListings: listings.Count(Closed),
            ExpiredListings: listings.Count(Expired),
            RejectedListings: listings.Count(p => p.Status == PropertyStatus.Rejected),
            ExpiringSoon: listings.Count(ExpiringSoon),
            TotalSaves: saves.Values.Sum(),
            TotalContacts: contacts.Count,
            NewContacts: contacts.Count(c => c.Status == ContactRequestStatus.New),
            ContactedContacts: contacts.Count(c => c.Status == ContactRequestStatus.Contacted),
            ClosedContacts: contacts.Count(c => c.Status == ContactRequestStatus.Closed),
            ContactsLast14Days: last14Days,
            RecentContacts: contacts.Take(5).Select(SellerMappings.ToDto).ToArray(),
            TopListings: sellerListings
                .Where(l => l.ContactCount + l.SaveCount > 0)
                .OrderByDescending(l => l.ContactCount * 2 + l.SaveCount)
                .ThenByDescending(l => l.Listing.CreatedAt)
                .Take(5)
                .ToArray(),
            ExpiringListings: listings
                .Where(ExpiringSoon)
                .OrderBy(p => p.ExpiresAt)
                .Take(5)
                .Select(p => ToSellerListing(p, contacts, saves))
                .ToArray());
    }

    private async Task<(IReadOnlyCollection<Property> Listings, IReadOnlyCollection<ContactRequest> Contacts, IReadOnlyDictionary<Guid, int> Saves)>
        LoadAsync(Guid sellerId, CancellationToken ct)
    {
        var listings = await _listings.GetByOwnerAsync(sellerId, ct);
        var contacts = await _requests.GetForReceiverAsync(sellerId, ct);
        var saves = await _listings.GetSaveCountsAsync(sellerId, ct);
        return (listings, contacts, saves);
    }

    private static SellerListingDto ToSellerListing(Property p, IReadOnlyCollection<ContactRequest> contacts, IReadOnlyDictionary<Guid, int> saves)
    {
        var own = contacts.Where(c => c.PropertyId == p.Id).ToArray();
        return new SellerListingDto(
            RealEstateHubProfile.MapListing(p),
            saves.TryGetValue(p.Id, out var saveCount) ? saveCount : 0,
            own.Length,
            own.Count(c => c.Status == ContactRequestStatus.New));
    }
}

/// <summary>Chuyển yêu cầu liên hệ sang DTO (dùng chung cho các service của người bán).</summary>
public static class SellerMappings
{
    public static ContactRequestDto ToDto(ContactRequest c) => new(
        c.Id,
        c.PropertyId,
        c.Property?.Title,
        c.Property?.Price,
        c.Property?.Status.ToString(),
        c.SenderName,
        c.SenderPhone,
        c.SenderEmail,
        c.Message,
        c.Status.ToString(),
        c.SenderId.HasValue,
        c.CreatedAt);
}
