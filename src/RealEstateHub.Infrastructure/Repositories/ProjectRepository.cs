using Microsoft.EntityFrameworkCore;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Projects;
using RealEstateHub.Infrastructure.Data;

namespace RealEstateHub.Infrastructure.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _db;

    public ProjectRepository(AppDbContext db) => _db = db;

    // Địa chỉ dự án lưu theo phường: Project → Ward → District → Province.
    private IQueryable<Project> Projects()
        => _db.Projects.AsNoTracking()
            .Include(p => p.Ward!).ThenInclude(w => w.District).ThenInclude(d => d.Province)
            .Include(p => p.Phases)
            .AsSplitQuery();

    public async Task<(IReadOnlyCollection<ProjectWithStats> Items, int Total)> SearchAsync(ProjectQuery query, CancellationToken ct = default)
    {
        var source = _db.Projects.AsNoTracking().AsQueryable();

        if (query.Keyword is { } keyword)
        {
            var pattern = $"%{keyword.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_")}%";
            source = source.Where(p => EF.Functions.ILike(p.Name, pattern) || EF.Functions.ILike(p.Developer, pattern));
        }
        if (query.ProvinceCode is { } provinceCode)
            source = source.Where(p => p.Ward!.District.Province.Code == provinceCode);
        if (query.Status is { } status)
            source = source.Where(p => p.Status == status);
        if (query.MinPrice is { } minPrice)
            source = source.Where(p => p.MaxPrice.Amount >= minPrice);
        if (query.MaxPrice is { } maxPrice)
            source = source.Where(p => p.MinPrice.Amount <= maxPrice);
        if (query.Featured is { } featured)
            source = source.Where(p => p.IsFeatured == featured);

        var total = await source.CountAsync(ct);

        source = query.Sort switch
        {
            "newest" => source.OrderByDescending(p => p.LaunchDate).ThenBy(p => p.Name),
            "priceAsc" => source.OrderBy(p => p.MinPrice.Amount).ThenBy(p => p.Name),
            "priceDesc" => source.OrderByDescending(p => p.MaxPrice.Amount).ThenBy(p => p.Name),
            _ => source.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.LaunchDate).ThenBy(p => p.Name)
        };

        var ids = await source
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => p.Id)
            .ToListAsync(ct);

        return (await LoadWithStatsAsync(ids, ct), total);
    }

    public async Task<ProjectWithStats?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => (await LoadWithStatsAsync(new List<Guid> { id }, ct)).FirstOrDefault();

    public async Task<IReadOnlyCollection<ProjectWithStats>> GetRelatedAsync(Project project, int limit, CancellationToken ct = default)
    {
        var provinceId = project.Ward?.District?.ProvinceId;
        var ids = await _db.Projects.AsNoTracking()
            .Where(p => p.Id != project.Id)
            .OrderByDescending(p => p.Ward!.District.ProvinceId == provinceId)
            .ThenByDescending(p => p.Developer == project.Developer)
            .ThenByDescending(p => p.IsFeatured)
            .ThenBy(p => p.Name)
            .Take(limit)
            .Select(p => p.Id)
            .ToListAsync(ct);

        return await LoadWithStatsAsync(ids, ct);
    }

    public async Task<IReadOnlyCollection<ProjectProvinceDto>> GetProvincesAsync(CancellationToken ct = default)
    {
        // Nhóm và đếm trong SQL; sắp xếp trong bộ nhớ (số tỉnh ít).
        var groups = await _db.Projects.AsNoTracking()
            .GroupBy(p => new { p.Ward!.District.Province.Code, p.Ward.District.Province.Name })
            .Select(g => new { g.Key.Code, g.Key.Name, Count = g.Count() })
            .ToListAsync(ct);

        return groups
            .OrderByDescending(g => g.Count)
            .ThenBy(g => g.Name)
            .Select(g => new ProjectProvinceDto(g.Code, g.Name, g.Count))
            .ToArray();
    }

    // Nạp dự án theo danh sách id (giữ nguyên thứ tự) kèm số tin đăng thuộc từng dự án.
    private async Task<IReadOnlyCollection<ProjectWithStats>> LoadWithStatsAsync(List<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return Array.Empty<ProjectWithStats>();

        var projects = await Projects().Where(p => ids.Contains(p.Id)).ToListAsync(ct);
        var counts = await _db.Properties.AsNoTracking()
            .Where(p => p.ProjectId != null && ids.Contains(p.ProjectId.Value))
            .GroupBy(p => p.ProjectId!.Value)
            .Select(g => new { ProjectId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProjectId, x => x.Count, ct);

        return ids
            .Select(id => projects.FirstOrDefault(p => p.Id == id))
            .Where(p => p is not null)
            .Select(p => new ProjectWithStats(p!, counts.GetValueOrDefault(p!.Id)))
            .ToArray();
    }
}
