namespace RealEstateHub.Domain.Enums;

public enum ProjectStatus
{
    Planning,
    PreSales,
    UnderConstruction,
    Completed,
    Suspended,
    // Giá trị dùng trong database RealEstateHubDb.
    Upcoming,
    Selling,
    HandedOver
}
