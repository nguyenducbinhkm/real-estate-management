using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;

namespace RealEstateHub.Application.Services;

/// <summary>
/// Nhận ảnh tin đăng: chỉ tài khoản được đăng tin, tối đa 5 MB, định dạng xác định bằng chữ ký file (magic bytes)
/// chứ không tin vào tên file hay Content-Type do trình duyệt gửi.
/// </summary>
public class ImageUploadService : IImageUploadService
{
    public const long MaxBytes = 5 * 1024 * 1024;

    private readonly IUserRepository _users;
    private readonly IImageStorage _storage;

    public ImageUploadService(IUserRepository users, IImageStorage storage)
    {
        _users = users;
        _storage = storage;
    }

    public async Task<UploadedImageDto> UploadListingImageAsync(Guid userId, Stream content, long length, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new UnauthorizedException("User not found.");
        if (!user.CanPostListing())
            throw new ForbiddenException("Tài khoản người mua không thể tải ảnh tin đăng.");

        if (length <= 0)
            throw new AppException(400, "INVALID_IMAGE", "Chưa chọn ảnh.");
        if (length > MaxBytes)
            throw new AppException(400, "IMAGE_TOO_LARGE", "Ảnh tối đa 5 MB.");

        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, ct);
        if (buffer.Length > MaxBytes)
            throw new AppException(400, "IMAGE_TOO_LARGE", "Ảnh tối đa 5 MB.");

        var extension = DetectExtension(buffer.GetBuffer().AsSpan(0, (int)Math.Min(buffer.Length, 16)))
            ?? throw new AppException(400, "INVALID_IMAGE", "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");

        buffer.Position = 0;
        var url = await _storage.SaveListingImageAsync(buffer, extension, ct);
        return new UploadedImageDto(url);
    }

    /// <summary>Nhận diện JPG/PNG/WEBP theo các byte đầu file; trả null nếu không phải.</summary>
    public static string? DetectExtension(ReadOnlySpan<byte> head)
    {
        if (head.Length >= 3 && head[0] == 0xFF && head[1] == 0xD8 && head[2] == 0xFF) return ".jpg";
        if (head.Length >= 8 && head[..8].SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A })) return ".png";
        if (head.Length >= 12 && head[..4].SequenceEqual("RIFF"u8) && head.Slice(8, 4).SequenceEqual("WEBP"u8)) return ".webp";
        return null;
    }
}
