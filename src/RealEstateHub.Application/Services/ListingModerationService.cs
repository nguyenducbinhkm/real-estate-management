using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Mappings;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Services;

public class ListingModerationService : IListingModerationService
{
    private readonly IListingRepository _listings;

    public ListingModerationService(IListingRepository listings) => _listings = listings;

    public async Task<ModerationQueueDto> GetQueueAsync(PropertyStatus? status, string? keyword, CancellationToken ct = default)
    {
        var items = await _listings.GetForModerationAsync(status, ct);
        var q = keyword?.Trim();
        var filtered = string.IsNullOrEmpty(q)
            ? items
            : items.Where(p => Contains(p.Title, q) || Contains(p.Owner?.FullName, q)
                               || Contains(p.Owner?.Email, q) || Contains(p.Owner?.Phone, q)).ToList();

        var counts = (await _listings.CountByStatusAsync(ct)).ToDictionary(x => x.Key.ToString(), x => x.Value);
        return new ModerationQueueDto(filtered.Select(ToDto).ToList(), counts);
    }

    public Task<ListingDto> ApproveAsync(Guid listingId, CancellationToken ct = default)
        => ModerateAsync(listingId, (p, now) => p.Approve(now), ct);

    public Task<ListingDto> RejectAsync(Guid listingId, CancellationToken ct = default)
        => ModerateAsync(listingId, (p, now) => p.Reject(now), ct);

    private async Task<ListingDto> ModerateAsync(Guid listingId, Action<Property, DateTime> action, CancellationToken ct)
    {
        var listing = await _listings.GetByIdAsync(listingId, ct)
            ?? throw new NotFoundException("Không tìm thấy tin đăng.");
        try
        {
            action(listing, DateTime.UtcNow);
        }
        catch (InvalidOperationException ex)
        {
            throw new AppException(422, "INVALID_STATUS", ex.Message);
        }
        await _listings.UpdateAsync(listing, ct);
        return RealEstateHubProfile.MapListing(listing);
    }

    private static bool Contains(string? text, string q)
        => text?.Contains(q, StringComparison.OrdinalIgnoreCase) == true;

    private static ModerationListingDto ToDto(Property p) => new(
        RealEstateHubProfile.MapListing(p),
        p.Owner?.FullName ?? string.Empty,
        p.Owner?.Email ?? string.Empty,
        p.Owner?.Phone ?? string.Empty,
        p.Owner?.GetRole().ToString() ?? string.Empty);
}
