using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Users;

/// <summary>
/// Yêu cầu liên hệ khách gửi cho người đăng tin (bảng ContactRequests).
/// Người gửi có thể chưa đăng nhập nên SenderId có thể null; ReceiverId là chủ tin.
/// </summary>
public class ContactRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? PropertyId { get; set; }
    public Property? Property { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? SenderId { get; set; }
    public Guid? ReceiverId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderPhone { get; set; } = string.Empty;
    public string? SenderEmail { get; set; }
    public string? Message { get; set; }
    public ContactRequestStatus Status { get; set; } = ContactRequestStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Chuyển trạng thái xử lý; mọi trạng thái đều có thể quay lại (vd. mở lại yêu cầu đã đóng).</summary>
    public void MoveTo(ContactRequestStatus status) => Status = status;
}
