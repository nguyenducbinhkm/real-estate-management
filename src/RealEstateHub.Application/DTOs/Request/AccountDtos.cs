namespace RealEstateHub.Application.DTOs.Request;

/// <summary>Cập nhật thông tin cá nhân. Email là định danh đăng nhập nên không đổi ở đây.</summary>
public record UpdateProfileRequest(string FullName, string Phone, string? AvatarUrl);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
