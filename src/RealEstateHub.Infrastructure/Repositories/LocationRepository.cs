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
}
