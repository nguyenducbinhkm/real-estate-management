namespace RealEstateHub.Application.DTOs.Response;

/// <summary>Hồ sơ đầy đủ của người dùng đang đăng nhập (trang "Cài đặt tài khoản").</summary>
public record ProfileDto(
    Guid Id,
    string Email,
    string Phone,
    string FullName,
    string? AvatarUrl,
    string Role,
    bool IsVerified,
    bool CanPostListing,
    int MaxListings,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? ZaloPhone = null);
