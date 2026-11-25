namespace RealEstateHub.Application.DTOs.Response;

/// <summary>Một yêu cầu liên hệ (khách hàng) mà người bán nhận được.</summary>
public record ContactRequestDto(
    Guid Id,
    Guid? PropertyId,
    string? PropertyTitle,
    decimal? PropertyPrice,
    string? PropertyStatus,
    string SenderName,
    string SenderPhone,
    string? SenderEmail,
    string? Message,
    string Status,
    bool IsRegisteredUser,
    DateTime CreatedAt);

/// <summary>Tin của người bán kèm số liệu tương tác.</summary>
public record SellerListingDto(ListingDto Listing, int SaveCount, int ContactCount, int NewContactCount);

/// <summary>Số yêu cầu liên hệ theo ngày (biểu đồ ở trang Tổng quan).</summary>
public record DailyCount(DateTime Date, int Count);

/// <summary>Số liệu trang "Tổng quan" của người bán.</summary>
public record SellerDashboardDto(
    int MaxListings,
    int UsedListingSlots,
    int TotalListings,
    int ActiveListings,
    int PendingListings,
    int HiddenListings,
    int ClosedListings,
    int ExpiredListings,
    int RejectedListings,
    int ExpiringSoon,
    int TotalSaves,
    int TotalContacts,
    int NewContacts,
    int ContactedContacts,
    int ClosedContacts,
    IReadOnlyList<DailyCount> ContactsLast14Days,
    IReadOnlyList<ContactRequestDto> RecentContacts,
    IReadOnlyList<SellerListingDto> TopListings,
    IReadOnlyList<SellerListingDto> ExpiringListings);
