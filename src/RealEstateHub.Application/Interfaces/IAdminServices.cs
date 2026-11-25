using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Interfaces;

/// <summary>Truy vấn/cập nhật dành riêng cho khu quản trị.</summary>
public interface IAdminRepository
{
    Task<IReadOnlyCollection<User>> SearchUsersAsync(UserRole? role, string? keyword, CancellationToken ct = default);
    Task<IReadOnlyDictionary<UserRole, int>> CountUsersByRoleAsync(CancellationToken ct = default);
    Task<int> CountUsersCreatedSinceAsync(DateTime sinceUtc, CancellationToken ct = default);
    Task<int> CountListingsCreatedSinceAsync(DateTime sinceUtc, CancellationToken ct = default);
    /// <summary>Số tin của mỗi chủ tin: (tổng, đang mở = Chờ duyệt/Đang hiển thị/Đã ẩn).</summary>
    Task<IReadOnlyDictionary<Guid, (int Total, int Open)>> CountListingsByOwnerAsync(IEnumerable<Guid> ownerIds, CancellationToken ct = default);
    /// <summary>Đổi vai trò (cột phân loại UserRole) và thu hồi phiên đăng nhập để vai trò mới có hiệu lực khi đăng nhập lại.</summary>
    Task ChangeRoleAsync(Guid userId, UserRole role, CancellationToken ct = default);
}

/// <summary>Tạo/cập nhật tài khoản admin theo danh sách trong file cấu hình, chạy khi API khởi động.</summary>
public interface IAdminAccountSync
{
    Task<IReadOnlyList<AdminSyncResult>> SyncAsync(IEnumerable<AdminAccountEntry> entries, CancellationToken ct = default);
}

/// <summary>Chức năng của trang quản trị.</summary>
public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync(CancellationToken ct = default);
    Task<IReadOnlyCollection<AdminUserDto>> GetUsersAsync(UserRole? role, string? keyword, CancellationToken ct = default);
    Task<AdminUserDto> ChangeUserRoleAsync(Guid adminId, Guid userId, UserRole role, CancellationToken ct = default);
}
