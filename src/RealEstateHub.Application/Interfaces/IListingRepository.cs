using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Application.Interfaces;

public interface IListingRepository
{
    Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(ListingQuery query, CancellationToken ct = default);
    Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(SearchCriteria criteria, CancellationToken ct = default);
    Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyCollection<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default);
    Task<(IReadOnlyCollection<Property> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default);
    Task<Property> AddAsync(Property listing, CancellationToken ct = default);
    Task UpdateAsync(Property listing, CancellationToken ct = default);
    Task DeleteAsync(Property listing, CancellationToken ct = default);
}
