using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.DTOs.Request;

/// <summary>Khách gửi yêu cầu liên hệ từ trang chi tiết tin (không bắt buộc đăng nhập).</summary>
public record CreateContactRequest(Guid PropertyId, string SenderName, string SenderPhone, string? SenderEmail, string? Message);

/// <summary>Người bán cập nhật tiến độ xử lý khách hàng.</summary>
public record UpdateContactStatusRequest(ContactRequestStatus Status);

/// <summary>Người bán đổi trạng thái tin: Active (hiện), Draft (ẩn), Sold (đã bán), Rented (đã cho thuê).</summary>
public record ChangeListingStatusRequest(PropertyStatus Status);

/// <summary>Bộ lọc danh sách khách hàng của người bán.</summary>
public record ContactRequestQuery(ContactRequestStatus? Status, string? Keyword);
