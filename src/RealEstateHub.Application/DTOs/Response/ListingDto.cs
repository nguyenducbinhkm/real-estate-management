using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.DTOs.Response;

public class ListingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Area { get; set; }
    public decimal PricePerSqm { get; set; }
    public PropertyStatus Status { get; set; }
    public PropertyType PropertyType { get; set; }
    public TransactionType TransactionType { get; set; }
    public PackageType PackageType { get; set; }
    public Guid OwnerId { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string ProvinceCode { get; set; } = string.Empty;
    public string ProvinceName { get; set; } = string.Empty;
    public string DistrictCode { get; set; } = string.Empty;
    public string DistrictName { get; set; } = string.Empty;
    public string WardCode { get; set; } = string.Empty;
    public string WardName { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }

    // Thông tin chi tiết theo loại BĐS (chỉ những trường có cột trong database).
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public int? Floors { get; set; }
    public LegalStatus? LegalStatus { get; set; }
    public FurnitureStatus? Furniture { get; set; }

    public List<ListingImageDto> Images { get; set; } = new();
}

public record ListingImageDto(Guid Id, string Url, string? Caption, int SortOrder);
