using Microsoft.EntityFrameworkCore;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Infrastructure.Data;

namespace RealEstateHub.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => _db.Users.Include(u => u.RefreshTokens).FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => _db.Users.Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower(), ct);

    public async Task<User> AddAsync(User user, CancellationToken ct = default)
    {
        await _db.Users.AddAsync(user, ct);
        await _db.SaveChangesAsync(ct);
        return user;
    }

    public async Task UpdateAsync(User user, CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);

    public Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default)
        => _db.RefreshTokens.Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == token, ct);

    public async Task AddRefreshTokenAsync(RefreshToken token, CancellationToken ct = default)
    {
        await _db.RefreshTokens.AddAsync(token, ct);
        await _db.SaveChangesAsync(ct);
    }
}
