using Microsoft.EntityFrameworkCore;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;
using RealEstateHub.Infrastructure.Data;

namespace RealEstateHub.Infrastructure.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _db;

    public AdminRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyCollection<User>> SearchUsersAsync(UserRole? role, string? keyword, CancellationToken ct = default)
    {
        IQueryable<User> query = _db.Users.AsNoTracking();
        query = role switch
        {
            UserRole.Buyer => query.Where(u => u is Buyer),
            UserRole.Seller => query.Where(u => u is Seller),
            UserRole.Agent => query.Where(u => u is AgentSeller),
            UserRole.Admin => query.Where(u => u is Admin),
            _ => query
        };
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var pattern = $"%{keyword.Trim()}%";
            query = query.Where(u => EF.Functions.ILike(u.FullName, pattern)
                                     || EF.Functions.ILike(u.Email, pattern)
                                     || (u.Phone != null && EF.Functions.ILike(u.Phone, pattern)));
        }
        return await query.OrderByDescending(u => u.CreatedAt).Take(500).ToListAsync(ct);
    }

    public async Task<IReadOnlyDictionary<UserRole, int>> CountUsersByRoleAsync(CancellationToken ct = default)
    {
        // Cột phân loại "UserRole" là shadow property của EF (TPH).
        var rows = await _db.Users.AsNoTracking()
            .GroupBy(u => EF.Property<string>(u, "UserRole"))
            .Select(g => new { g.Key, Count = g.Count() })
            .ToListAsync(ct);
        return rows
            .Where(r => Enum.TryParse<UserRole>(r.Key, out _))
            .ToDictionary(r => Enum.Parse<UserRole>(r.Key), r => r.Count);
    }

    public Task<int> CountUsersCreatedSinceAsync(DateTime sinceUtc, CancellationToken ct = default)
        => _db.Users.CountAsync(u => u.CreatedAt >= sinceUtc, ct);

    public Task<int> CountListingsCreatedSinceAsync(DateTime sinceUtc, CancellationToken ct = default)
        => _db.Properties.CountAsync(p => p.CreatedAt >= sinceUtc, ct);

    public async Task<IReadOnlyDictionary<Guid, (int Total, int Open)>> CountListingsByOwnerAsync(IEnumerable<Guid> ownerIds, CancellationToken ct = default)
    {
        var ids = ownerIds.Distinct().ToList();
        var rows = await _db.Properties.AsNoTracking()
            .Where(p => ids.Contains(p.OwnerId))
            .GroupBy(p => p.OwnerId)
            .Select(g => new
            {
                g.Key,
                Total = g.Count(),
                Open = g.Count(p => p.Status == PropertyStatus.Pending || p.Status == PropertyStatus.Active || p.Status == PropertyStatus.Draft)
            })
            .ToListAsync(ct);
        return rows.ToDictionary(r => r.Key, r => (r.Total, r.Open));
    }

    public async Task ChangeRoleAsync(Guid userId, UserRole role, CancellationToken ct = default)
    {
        // EF không đổi được kiểu của một thực thể TPH, nên cập nhật thẳng cột phân loại.
        var roleName = role.ToString();
        int? adminLevel = role == UserRole.Admin ? 1 : null;
        var now = DateTime.UtcNow;

        // 2 bảng (Users + RefreshTokens) trong 1 transaction: lỗi ở bước sau thì bước trước cũng được hoàn tác (ACID).
        // Nếu bên gọi đã mở transaction thì dùng chung transaction đó.
        var ownTransaction = _db.Database.CurrentTransaction is null
            ? await _db.Database.BeginTransactionAsync(ct)
            : null;
        try
        {
            await _db.Database.ExecuteSqlInterpolatedAsync(
                $@"UPDATE ""Users"" SET ""UserRole"" = {roleName}, ""AdminLevel"" = {adminLevel}, ""UpdatedAt"" = {now} WHERE ""UserId"" = {userId}", ct);
            // Thu hồi phiên đăng nhập: vai trò mới có hiệu lực khi người dùng đăng nhập lại.
            await _db.Database.ExecuteSqlInterpolatedAsync(
                $@"UPDATE ""RefreshTokens"" SET ""RevokedAt"" = {now} WHERE ""UserId"" = {userId} AND ""RevokedAt"" IS NULL", ct);
            if (ownTransaction is not null) await ownTransaction.CommitAsync(ct);
        }
        catch
        {
            if (ownTransaction is not null) await ownTransaction.RollbackAsync(CancellationToken.None);
            throw;
        }
        finally
        {
            if (ownTransaction is not null) await ownTransaction.DisposeAsync();
        }

        // Bỏ các thực thể đang theo dõi (kiểu cũ) để lần đọc sau nạp đúng kiểu mới.
        _db.ChangeTracker.Clear();
    }
}
