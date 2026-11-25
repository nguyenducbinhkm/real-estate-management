using Microsoft.EntityFrameworkCore;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Infrastructure.Data;

namespace RealEstateHub.Infrastructure.Repositories;

public class ContactRequestRepository : IContactRequestRepository
{
    private readonly AppDbContext _db;

    public ContactRequestRepository(AppDbContext db) => _db = db;

    public async Task<ContactRequest> AddAsync(ContactRequest request, CancellationToken ct = default)
    {
        _db.ContactRequests.Add(request);
        await _db.SaveChangesAsync(ct);
        return request;
    }

    public Task<ContactRequest?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => _db.ContactRequests.Include(c => c.Property).FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IReadOnlyCollection<ContactRequest>> GetForReceiverAsync(Guid receiverId, CancellationToken ct = default)
        => await _db.ContactRequests.AsNoTracking()
            .Include(c => c.Property)
            .Where(c => c.ReceiverId == receiverId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

    public async Task UpdateAsync(ContactRequest request, CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);

    public async Task DeleteAsync(ContactRequest request, CancellationToken ct = default)
    {
        _db.ContactRequests.Remove(request);
        await _db.SaveChangesAsync(ct);
    }
}
