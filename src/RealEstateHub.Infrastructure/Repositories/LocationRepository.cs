using Microsoft.EntityFrameworkCore;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Infrastructure.Data;

namespace RealEstateHub.Infrastructure.Repositories;

public class LocationRepository : ILocationRepository
{
    private readonly AppDbContext _db;

    public LocationRepository(AppDbContext db) => _db = db;

    public Task<Ward?> FindWardAsync(string wardCode, CancellationToken ct = default)
        => _db.Wards
            .Include(w => w.District).ThenInclude(d => d.Province)
            .FirstOrDefaultAsync(w => w.Code == wardCode, ct);

    public async Task<IReadOnlyList<Province>> GetProvincesAsync(CancellationToken ct = default)
        => await _db.Provinces.AsNoTracking().OrderBy(p => p.Name).ToListAsync(ct);

    public async Task<IReadOnlyList<District>> GetDistrictsAsync(string provinceCode, CancellationToken ct = default)
        => await _db.Districts.AsNoTracking()
            .Where(d => d.Province.Code == provinceCode)
            .OrderBy(d => d.Name)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Ward>> GetWardsAsync(string districtCode, CancellationToken ct = default)
        => await _db.Wards.AsNoTracking()
            .Where(w => w.District.Code == districtCode)
            .OrderBy(w => w.Name)
            .ToListAsync(ct);
}
