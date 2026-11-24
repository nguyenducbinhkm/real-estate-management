using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Mappings;
using RealEstateHub.Domain.Entities.Projects;

namespace RealEstateHub.Application.Services;

/// <summary>Đọc dữ liệu dự án (chỉ đọc, không ghi database).</summary>
public class ProjectService : IProjectService
{
    private static readonly string[] AllowedSorts = { "default", "newest", "priceAsc", "priceDesc" };

    private readonly IProjectRepository _projects;
    private readonly IListingRepository _listings;

    public ProjectService(IProjectRepository projects, IListingRepository listings)
    {
        _projects = projects;
        _listings = listings;
    }

    public async Task<PagedResult<ProjectSummaryDto>> SearchAsync(ProjectQuery query, CancellationToken ct = default)
    {
        query.Page = Math.Max(query.Page, 1);
        query.PageSize = Math.Clamp(query.PageSize, 1, 50);
        query.Keyword = string.IsNullOrWhiteSpace(query.Keyword) ? null : query.Keyword.Trim();
        query.ProvinceCode = string.IsNullOrWhiteSpace(query.ProvinceCode) ? null : query.ProvinceCode.Trim();
        query.Sort = AllowedSorts.FirstOrDefault(s => string.Equals(s, query.Sort, StringComparison.OrdinalIgnoreCase)) ?? "default";

        if (query.MinPrice.HasValue && query.MaxPrice.HasValue && query.MinPrice > query.MaxPrice)
            (query.MinPrice, query.MaxPrice) = (query.MaxPrice, query.MinPrice);

        var (items, total) = await _projects.SearchAsync(query, ct);
        return new PagedResult<ProjectSummaryDto>(
            items.Select(x => MapSummary(new ProjectSummaryDto(), x)).ToArray(),
            query.Page,
            query.PageSize,
            total);
    }

    public async Task<ProjectDetailDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var item = await _projects.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Project not found.");

        var dto = MapSummary(new ProjectDetailDto(), item);
        var address = item.Project.Address;
        dto.Description = item.Project.Description ?? string.Empty;
        dto.DistrictCode = address.DistrictCode;
        dto.WardCode = address.WardCode;
        dto.Phases = item.Project.Phases
            .OrderBy(p => p.SortOrder)
            .Select(p => new ProjectPhaseDto(p.Id, p.Name, p.Description, p.SortOrder, p.StartingPrice))
            .ToArray();
        return dto;
    }

    public async Task<PagedResult<ListingDto>> GetListingsAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default)
    {
        _ = await _projects.GetByIdAsync(projectId, ct) ?? throw new NotFoundException("Project not found.");

        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var (items, total) = await _listings.GetByProjectAsync(projectId, page, pageSize, ct);
        return new PagedResult<ListingDto>(items.Select(RealEstateHubProfile.MapListing).ToArray(), page, pageSize, total);
    }

    public async Task<IReadOnlyCollection<ProjectSummaryDto>> GetRelatedAsync(Guid projectId, int limit, CancellationToken ct = default)
    {
        var item = await _projects.GetByIdAsync(projectId, ct)
            ?? throw new NotFoundException("Project not found.");

        var related = await _projects.GetRelatedAsync(item.Project, Math.Clamp(limit, 1, 12), ct);
        return related.Select(x => MapSummary(new ProjectSummaryDto(), x)).ToArray();
    }

    public Task<IReadOnlyCollection<ProjectProvinceDto>> GetProvincesAsync(CancellationToken ct = default)
        => _projects.GetProvincesAsync(ct);

    private static T MapSummary<T>(T dto, ProjectWithStats item) where T : ProjectSummaryDto
    {
        Project p = item.Project;
        var address = p.Address;
        dto.Id = p.Id;
        dto.Name = p.Name;
        dto.Developer = p.Developer;
        dto.Status = p.Status;
        dto.ProvinceCode = address.ProvinceCode;
        dto.ProvinceName = address.ProvinceName;
        dto.DistrictName = address.DistrictName;
        dto.WardName = address.WardName;
        dto.StreetAddress = address.StreetAddress;
        dto.MinPrice = p.MinPrice?.Amount;
        dto.MaxPrice = p.MaxPrice?.Amount;
        dto.Currency = p.MinPrice?.Currency ?? p.MaxPrice?.Currency ?? "VND";
        dto.TotalArea = p.TotalArea;
        dto.LaunchDate = p.LaunchDate;
        dto.HandoverDate = p.HandoverDate;
        dto.IsFeatured = p.IsFeatured;
        dto.PhaseCount = p.Phases.Count;
        dto.ListingCount = item.ListingCount;
        return dto;
    }
}
