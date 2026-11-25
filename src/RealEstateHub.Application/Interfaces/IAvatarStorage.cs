namespace RealEstateHub.Application.Interfaces;

/// <summary>Nơi lưu ảnh đại diện (Supabase Storage). Mỗi người dùng một file cố định: tải ảnh mới sẽ ghi đè ảnh cũ.</summary>
public interface IAvatarStorage
{
    /// <summary>Đã cấu hình đủ (URL, khoá, bucket) hay chưa.</summary>
    bool IsConfigured { get; }

    /// <summary>Tải ảnh lên (ghi đè nếu đã có) và trả về đường dẫn công khai.</summary>
    Task<string> UploadAsync(Guid userId, Stream content, string contentType, CancellationToken ct = default);

    /// <summary>Xoá ảnh của người dùng (không lỗi nếu chưa có).</summary>
    Task DeleteAsync(Guid userId, CancellationToken ct = default);
}
