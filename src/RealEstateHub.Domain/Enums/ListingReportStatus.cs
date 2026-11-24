namespace RealEstateHub.Domain.Enums;

public enum ListingReportStatus
{
    Pending,
    Reviewing,
    Resolved,
    Rejected,
    // Giá trị dùng trong database RealEstateHubDb.
    Dismissed
}
