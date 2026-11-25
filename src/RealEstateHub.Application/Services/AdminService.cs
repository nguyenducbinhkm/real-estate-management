using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Services;

/// <summary>Tổng quan quản trị và quản lý người dùng (đổi vai trò Người mua / Người bán / Môi giới).</summary>
public class AdminService : IAdminService
{
    private static readonly UserRole[] AssignableRoles = { UserRole.Buyer, UserRole.Seller, UserRole.Agent };

    private readonly IAdminRepository _admin;
    private readonly IUserRepository _users;
    private readonly IListingRepository _listings;

    public AdminService(IAdminRepository admin, IUserRepository users, IListingRepository listings)
    {
        _admin = admin;
        _users = users;
        _listings = listings;
    }

    public async Task<AdminStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var since = DateTime.UtcNow.AddDays(-7);
        var usersByRole = await _admin.CountUsersByRoleAsync(ct);
        var listingsByStatus = await _listings.CountByStatusAsync(ct);

        return new AdminStatsDto(
            usersByRole.Values.Sum(),
            Enum.GetValues<UserRole>().ToDictionary(r => r.ToString(), r => usersByRole.GetValueOrDefault(r)),
            await _admin.CountUsersCreatedSinceAsync(since, ct),
            listingsByStatus.Values.Sum(),
            Enum.GetValues<PropertyStatus>().ToDictionary(s => s.ToString(), s => listingsByStatus.GetValueOrDefault(s)),
            await _admin.CountListingsCreatedSinceAsync(since, ct));
    }

    public async Task<IReadOnlyCollection<AdminUserDto>> GetUsersAsync(UserRole? role, string? keyword, CancellationToken ct = default)
    {
        var users = await _admin.SearchUsersAsync(role, keyword?.Trim(), ct);
        var counts = await _admin.CountListingsByOwnerAsync(users.Select(u => u.Id), ct);
        return users.Select(u => ToDto(u, counts.GetValueOrDefault(u.Id))).ToList();
    }

    public async Task<AdminUserDto> ChangeUserRoleAsync(Guid adminId, Guid userId, UserRole role, CancellationToken ct = default)
    {
        if (!AssignableRoles.Contains(role))
            throw new AppException(422, "INVALID_ROLE", "Chỉ đổi được sang Người mua, Người bán hoặc Môi giới. Admin được khai báo trong file admin-accounts.json.");
        if (userId == adminId)
            throw new AppException(422, "SELF_ROLE", "Không thể tự đổi vai trò của chính mình.");

        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("Không tìm thấy người dùng.");
        if (user is Admin)
            throw new AppException(422, "ADMIN_ROLE", "Không đổi vai trò của tài khoản admin trên giao diện; hãy sửa file admin-accounts.json.");

        var counts = (await _admin.CountListingsByOwnerAsync(new[] { userId }, ct)).GetValueOrDefault(userId);
        if (user.GetRole() != role)
        {
            // Hỏi quy tắc của vai trò mới (đa hình): không được giữ nhiều tin đang mở hơn số tin vai trò mới cho phép.
            var target = User.ForRole(role);
            var allowed = target.CanPostListing() ? target.GetMaxListings() : 0;
            if (counts.Open > allowed)
                throw new AppException(422, "TOO_MANY_LISTINGS",
                    $"Người dùng đang có {counts.Open} tin chưa kết thúc, vai trò mới chỉ cho phép {allowed} tin. Hãy gỡ hoặc xoá bớt tin trước.");

            await _admin.ChangeRoleAsync(userId, role, ct);
            user = await _users.GetByIdAsync(userId, ct) ?? user;
        }

        return ToDto(user, counts);
    }

    private static AdminUserDto ToDto(User u, (int Total, int Open) counts) => new(
        u.Id, u.Email, u.FullName, u.Phone ?? string.Empty, u.GetRole().ToString(), u.IsVerified, u.CreatedAt, counts.Total, counts.Open);
}
