using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Domain.Entities.Projects;

namespace RealEstateHub.Application.Interfaces;

/// <summary>Dự án kèm số tin đăng thuộc dự án.</summary>
public record ProjectWithStats(Project Project, int ListingCount);

public interface IProjectRepository
{
    Task<(IReadOnlyCollection<ProjectWithStats> Items, int Total)> SearchAsync(ProjectQuery query, CancellationToken ct = default);
    Task<ProjectWithStats?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyCollection<ProjectWithStats>> GetRelatedAsync(Project project, int limit, CancellationToken ct = default);
    Task<IReadOnlyCollection<ProjectProvinceDto>> GetProvincesAsync(CancellationToken ct = default);
}
