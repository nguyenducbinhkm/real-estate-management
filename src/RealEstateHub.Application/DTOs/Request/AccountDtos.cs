namespace RealEstateHub.Application.DTOs.Request;

/// <summary>Cập nhật thông tin cá nhân. Email là định danh đăng nhập nên không đổi ở đây;
/// ảnh đại diện đổi qua PUT /api/users/me/avatar (tải file lên).</summary>
public record UpdateProfileRequest(string FullName, string Phone, string? ZaloPhone = null);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
