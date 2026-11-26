using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.DTOs.Request;

public class CreateListingRequest
{
    public PropertyType PropertyType { get; set; }
    public TransactionType TransactionType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Area { get; set; }
    public string ProvinceCode { get; set; } = string.Empty;
    public string ProvinceName { get; set; } = string.Empty;
    public string DistrictCode { get; set; } = string.Empty;
    public string DistrictName { get; set; } = string.Empty;
    public string WardCode { get; set; } = string.Empty;
    public string WardName { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public int? BedroomCount { get; set; }
    public int? BathroomCount { get; set; }
    public int? FloorNumber { get; set; }
    public double? LandArea { get; set; }
    public LegalStatus? LegalStatus { get; set; }
    public FurnitureStatus? Furniture { get; set; }
    public bool? HasClearance { get; set; }
    public int? RentalPeriodMonths { get; set; }
    public bool? PetsAllowed { get; set; }
    public double? CeilingHeight { get; set; }
    public double? RoadWidth { get; set; }

    /// <summary>Đường dẫn ảnh theo thứ tự hiển thị (ảnh đầu là ảnh đại diện), lấy từ POST /api/uploads/images.</summary>
    public List<string>? ImageUrls { get; set; }

    /// <summary>Số liên hệ của tin; để trống = dùng số điện thoại trong hồ sơ.</summary>
    public string? ContactPhone { get; set; }
    /// <summary>Số Zalo của tin; để trống = dùng số Zalo trong hồ sơ (hoặc số liên hệ).</summary>
    public string? ZaloPhone { get; set; }
}
