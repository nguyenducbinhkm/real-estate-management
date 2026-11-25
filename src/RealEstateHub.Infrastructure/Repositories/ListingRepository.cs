using RealEstateHub.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Patterns.Composite;
using RealEstateHub.Application.Patterns.Strategy;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Infrastructure.Data;

namespace RealEstateHub.Infrastructure.Repositories;

public class ListingRepository : IListingRepository
{
    private readonly AppDbContext _db;
    private readonly PropertySearchEngine _searchEngine;
    private readonly FilterCompositeStrategy _composite;

    public ListingRepository(AppDbContext db,
        PropertySearchEngine searchEngine,
        FilterCompositeStrategy composite)
    {
        _db = db;
        _searchEngine = searchEngine;
        _composite = composite;
    }

    // Địa chỉ đầy đủ cần nạp Ward → District → Province.
    private static IQueryable<Property> WithLocation(IQueryable<Property> query)
        => query.Include(p => p.Ward!).ThenInclude(w => w.District).ThenInclude(d => d.Province);

    public async Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(ListingQuery query, CancellationToken ct = default)
    {
        var criteria = new SearchCriteria.Builder()
            .WithKeyword(query.Keyword)
            .InLocation(query.ProvinceCode, query.DistrictCode)
            .PriceRange(query.MinPrice, query.MaxPrice)
            .AreaRange(query.MinArea, query.MaxArea)
            .OfType(query.PropertyType)
            .ForTransaction(query.TransactionType)
            .WithPaging(query.Page, query.PageSize)
            .Build();

        return await SearchAsync(criteria, ct);
    }

    public async Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(
        SearchCriteria criteria,
        CancellationToken ct = default)
    {
        // Trang công khai không hiện tin chưa duyệt, bị từ chối hoặc chủ tin đã ẩn.
        var source = PubliclyVisible(_db.Properties.AsNoTracking());
        source = _searchEngine.Clear()
            .AddStrategy(_composite)
            .Search(source, criteria);

        var total = await source.CountAsync(ct);
        var items = await WithLocation(source)
            .OrderByDescending(p => p.IsFeatured)
            .ThenByDescending(p => p.BoostScore)
            .ThenByDescending(p => p.CreatedAt)
            .ThenBy(p => p.Id)
            .Skip((criteria.Page - 1) * criteria.PageSize)
            .Take(criteria.PageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => WithLocation(_db.Properties)
            .Include(p => p.Images)
            .Include(p => p.Owner)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyCollection<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default)
        => await WithLocation(_db.Properties.AsNoTracking())
            .Where(p => p.OwnerId == ownerId)
            .Include(p => p.Images)
            .AsSplitQuery()
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public async Task<(IReadOnlyCollection<Property> Items, int Total)> GetByProjectAsync(
        Guid projectId, int page, int pageSize, CancellationToken ct = default)
    {
        var source = PubliclyVisible(_db.Properties.AsNoTracking()).Where(p => p.ProjectId == projectId);
        var total = await source.CountAsync(ct);
        var items = await WithLocation(source)
            .OrderByDescending(p => p.IsFeatured)
            .ThenByDescending(p => p.BoostScore)
            .ThenByDescending(p => p.CreatedAt)
            .ThenBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return (items, total);
    }

    private static IQueryable<Property> PubliclyVisible(IQueryable<Property> query)
        => query.Where(p => p.Status != PropertyStatus.Pending
                            && p.Status != PropertyStatus.Rejected
                            && p.Status != PropertyStatus.Draft);

    public async Task<IReadOnlyCollection<Property>> GetForModerationAsync(PropertyStatus? status, CancellationToken ct = default)
    {
        var query = WithLocation(_db.Properties.AsNoTracking()).Include(p => p.Owner).Include(p => p.Images).AsSplitQuery();
        if (status.HasValue) query = query.Where(p => p.Status == status.Value);
        return await query.OrderByDescending(p => p.UpdatedAt).ThenByDescending(p => p.CreatedAt).ToListAsync(ct);
    }

    public async Task<IReadOnlyDictionary<PropertyStatus, int>> CountByStatusAsync(CancellationToken ct = default)
        => await _db.Properties.AsNoTracking()
            .GroupBy(p => p.Status)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count, ct);

    public async Task<Property> AddAsync(Property listing, CancellationToken ct = default)
    {
        await _db.Properties.AddAsync(listing, ct);
        await _db.SaveChangesAsync(ct);
        return listing;
    }

    public async Task<IReadOnlyDictionary<Guid, int>> GetSaveCountsAsync(Guid ownerId, CancellationToken ct = default)
        => await _db.SavedListings.AsNoTracking()
            .Where(s => s.Property.OwnerId == ownerId)
            .GroupBy(s => s.PropertyId)
            .Select(g => new { PropertyId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PropertyId, x => x.Count, ct);

    public async Task UpdateAsync(Property listing, CancellationToken ct = default)
    {
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Property listing, CancellationToken ct = default)
    {
        _db.Properties.Remove(listing);
        await _db.SaveChangesAsync(ct);
    }
}
