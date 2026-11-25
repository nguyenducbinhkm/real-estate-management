namespace RealEstateHub.Application.DTOs.Response;

/// <summary>Số liệu trang Tổng quan quản trị.</summary>
public record AdminStatsDto(
    int TotalUsers,
    IReadOnlyDictionary<string, int> UsersByRole,
    int NewUsers7Days,
    int TotalListings,
    IReadOnlyDictionary<string, int> ListingsByStatus,
    int NewListings7Days);

/// <summary>Người dùng trong trang Quản lý người dùng.</summary>
public record AdminUserDto(
    Guid Id,
    string Email,
    string FullName,
    string Phone,
    string Role,
    bool IsVerified,
    DateTime CreatedAt,
    int ListingCount,
    int OpenListingCount);

/// <summary>Kết quả đồng bộ một dòng trong file admin-accounts.json (để ghi log khi khởi động).</summary>
public record AdminSyncResult(string Email, string Action, bool Success);
