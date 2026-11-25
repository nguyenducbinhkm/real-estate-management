using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Interfaces;

/// <summary>Admin kiểm duyệt tin đăng: xem hàng chờ, duyệt, từ chối.</summary>
public interface IListingModerationService
{
    Task<ModerationQueueDto> GetQueueAsync(PropertyStatus? status, string? keyword, CancellationToken ct = default);
    Task<ListingDto> ApproveAsync(Guid listingId, CancellationToken ct = default);
    Task<ListingDto> RejectAsync(Guid listingId, CancellationToken ct = default);
    /// <summary>Gỡ tin vi phạm đang hiển thị/đang ẩn (chuyển sang Bị từ chối).</summary>
    Task<ListingDto> TakeDownAsync(Guid listingId, CancellationToken ct = default);
}

/// <summary>Lưu file ảnh và trả về đường dẫn công khai (vd. /uploads/listings/abc.jpg).</summary>
public interface IImageStorage
{
    Task<string> SaveListingImageAsync(Stream content, string extension, CancellationToken ct = default);
}

/// <summary>Kiểm tra quyền, kích thước, định dạng ảnh rồi lưu qua IImageStorage.</summary>
public interface IImageUploadService
{
    Task<UploadedImageDto> UploadListingImageAsync(Guid userId, Stream content, long length, CancellationToken ct = default);
}
