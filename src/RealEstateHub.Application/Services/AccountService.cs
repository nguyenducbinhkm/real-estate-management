using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Application.Services;

public class AccountService : IAccountService
{
    /// <summary>Dung lượng tối đa của ảnh đại diện.</summary>
    public const long MaxAvatarBytes = 2 * 1024 * 1024;

    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAvatarStorage? _avatars;

    public AccountService(IUserRepository users, IPasswordHasher passwordHasher, IAvatarStorage? avatars = null)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _avatars = avatars;
    }

    public async Task<ProfileDto> GetProfileAsync(Guid userId, CancellationToken ct = default)
        => ToDto(await LoadAsync(userId, ct));

    public async Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        var user = await LoadAsync(userId, ct);
        user.FullName = request.FullName.Trim();
        user.Phone = request.Phone.Trim();
        user.UpdatedAt = DateTime.UtcNow;
        await _users.UpdateAsync(user, ct);
        return ToDto(user);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await LoadAsync(userId, ct);
        // 400 (không phải 401): frontend coi 401 là hết phiên đăng nhập và sẽ tự đăng xuất.
        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new AppException(400, "INVALID_PASSWORD", "Mật khẩu hiện tại không đúng.");

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _users.UpdateAsync(user, ct);
    }

    public async Task<ProfileDto> UploadAvatarAsync(Guid userId, Stream content, long length, CancellationToken ct = default)
    {
        var storage = RequireStorage();
        var user = await LoadAsync(userId, ct);

        if (length <= 0)
            throw new AppException(400, "INVALID_IMAGE", "Chưa chọn ảnh.");
        if (length > MaxAvatarBytes)
            throw new AppException(400, "IMAGE_TOO_LARGE", "Ảnh đại diện tối đa 2 MB.");

        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, ct);
        if (buffer.Length > MaxAvatarBytes)
            throw new AppException(400, "IMAGE_TOO_LARGE", "Ảnh đại diện tối đa 2 MB.");

        // Nhận diện định dạng bằng chữ ký file, không tin tên file/Content-Type trình duyệt gửi.
        var extension = ImageUploadService.DetectExtension(buffer.GetBuffer().AsSpan(0, (int)Math.Min(buffer.Length, 16)))
            ?? throw new AppException(400, "INVALID_IMAGE", "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
        var contentType = extension switch { ".png" => "image/png", ".webp" => "image/webp", _ => "image/jpeg" };

        buffer.Position = 0;
        var url = await storage.UploadAsync(user.Id, buffer, contentType, ct);
        user.ChangeAvatar(url, DateTime.UtcNow);
        await _users.UpdateAsync(user, ct);
        return ToDto(user);
    }

    public async Task<ProfileDto> RemoveAvatarAsync(Guid userId, CancellationToken ct = default)
    {
        var storage = RequireStorage();
        var user = await LoadAsync(userId, ct);
        await storage.DeleteAsync(user.Id, ct);
        user.RemoveAvatar(DateTime.UtcNow);
        await _users.UpdateAsync(user, ct);
        return ToDto(user);
    }

    private IAvatarStorage RequireStorage()
        => _avatars is { IsConfigured: true }
            ? _avatars
            : throw new AppException(503, "STORAGE_NOT_CONFIGURED",
                "Chưa cấu hình nơi lưu ảnh (SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET trong file .env của backend).");

    private async Task<User> LoadAsync(Guid userId, CancellationToken ct)
        => await _users.GetByIdAsync(userId, ct) ?? throw new NotFoundException("Không tìm thấy tài khoản.");

    private static ProfileDto ToDto(User user) => new(
        user.Id,
        user.Email,
        user.Phone,
        user.FullName,
        user.AvatarUrl,
        user.GetRole().ToString(),
        user.IsVerified,
        user.CanPostListing(),
        user.GetMaxListings(),
        user.CreatedAt,
        user.UpdatedAt);
}
