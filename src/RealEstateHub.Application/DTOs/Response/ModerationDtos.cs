namespace RealEstateHub.Application.DTOs.Response;

public record LocationOptionDto(string Code, string Name);

/// <summary>Tin trong hàng chờ kiểm duyệt của admin, kèm thông tin người đăng.</summary>
public record ModerationListingDto(
    ListingDto Listing,
    string OwnerName,
    string OwnerEmail,
    string OwnerPhone,
    string OwnerRole);

/// <summary>Danh sách tin theo bộ lọc + số tin theo từng trạng thái (cho các tab).</summary>
public record ModerationQueueDto(
    IReadOnlyCollection<ModerationListingDto> Items,
    IReadOnlyDictionary<string, int> Counts);

public record UploadedImageDto(string Url);
