using RealEstateHub.Domain.Entities.Locations;

namespace RealEstateHub.Domain.ValueObjects;

public sealed class Address
{
    public string ProvinceCode { get; set; } = string.Empty;
    public string ProvinceName { get; set; } = string.Empty;
    public string DistrictCode { get; set; } = string.Empty;
    public string DistrictName { get; set; } = string.Empty;
    public string WardCode { get; set; } = string.Empty;
    public string WardName { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    /// <summary>Dựng địa chỉ đầy đủ từ phường/xã (đã nạp kèm quận/huyện và tỉnh/thành).</summary>
    public static Address From(Ward? ward, string? streetAddress) => new()
    {
        ProvinceCode = ward?.District?.Province?.Code ?? string.Empty,
        ProvinceName = ward?.District?.Province?.Name ?? string.Empty,
        DistrictCode = ward?.District?.Code ?? string.Empty,
        DistrictName = ward?.District?.Name ?? string.Empty,
        WardCode = ward?.Code ?? string.Empty,
        WardName = ward?.Name ?? string.Empty,
        StreetAddress = streetAddress ?? string.Empty
    };
}
