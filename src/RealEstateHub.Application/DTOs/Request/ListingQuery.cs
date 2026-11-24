using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.DTOs.Request;

public class ListingQuery
{
    public string? Keyword { get; set; }
    public PropertyType? PropertyType { get; set; }
    public TransactionType? TransactionType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? MinArea { get; set; }
    public double? MaxArea { get; set; }
    public string? ProvinceCode { get; set; }
    public string? DistrictCode { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
