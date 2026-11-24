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
        var source = _db.Properties.AsNoTracking().AsQueryable();
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
        var source = _db.Properties.AsNoTracking().Where(p => p.ProjectId == projectId);
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

    public async Task<Property> AddAsync(Property listing, CancellationToken ct = default)
    {
        await _db.Properties.AddAsync(listing, ct);
        await _db.SaveChangesAsync(ct);
        return listing;
    }

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
