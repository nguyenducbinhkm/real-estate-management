using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;

namespace RealEstateHub.Application.Interfaces;

/// <summary>Quản lý thông tin tài khoản của người dùng đang đăng nhập.</summary>
public interface IAccountService
{
    Task<ProfileDto> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken ct = default);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);

    /// <summary>Tải ảnh đại diện mới từ máy (ghi đè ảnh cũ trên kho lưu trữ).</summary>
    Task<ProfileDto> UploadAvatarAsync(Guid userId, Stream content, long length, CancellationToken ct = default);

    /// <summary>Xoá ảnh đại diện, quay về chữ cái đầu của tên.</summary>
    Task<ProfileDto> RemoveAvatarAsync(Guid userId, CancellationToken ct = default);
}
