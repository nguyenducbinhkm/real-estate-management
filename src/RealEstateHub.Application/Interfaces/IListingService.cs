using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;

namespace RealEstateHub.Application.Interfaces;

public interface IListingService
{
    Task<PagedResult<ListingDto>> SearchAsync(ListingQuery query, CancellationToken ct = default);
    Task<ListingDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ListingDto> CreateAsync(Guid ownerId, CreateListingRequest request, CancellationToken ct = default);
    Task<ListingDto> UpdateAsync(Guid id, Guid requesterId, bool isAdmin, UpdateListingRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, Guid requesterId, bool isAdmin, CancellationToken ct = default);
    Task<IReadOnlyCollection<ListingDto>> GetMineAsync(Guid ownerId, CancellationToken ct = default);
}
