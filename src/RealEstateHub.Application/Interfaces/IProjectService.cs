using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;

namespace RealEstateHub.Application.Interfaces;

public interface IProjectService
{
    Task<PagedResult<ProjectSummaryDto>> SearchAsync(ProjectQuery query, CancellationToken ct = default);
    Task<ProjectDetailDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<ListingDto>> GetListingsAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default);
    Task<IReadOnlyCollection<ProjectSummaryDto>> GetRelatedAsync(Guid projectId, int limit, CancellationToken ct = default);
    Task<IReadOnlyCollection<ProjectProvinceDto>> GetProvincesAsync(CancellationToken ct = default);
}
