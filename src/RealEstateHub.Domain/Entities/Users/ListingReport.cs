using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Users;

public class ListingReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;
    public Guid ReporterId { get; set; }
    public Buyer Reporter { get; set; } = null!;
    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }
    public ListingReportStatus Status { get; set; } = ListingReportStatus.Pending;
    public Guid? ReviewedById { get; set; }
    public Admin? ReviewedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}
