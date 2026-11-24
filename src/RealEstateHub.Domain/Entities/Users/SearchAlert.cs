using RealEstateHub.Domain.Enums;
using RealEstateHub.Domain.ValueObjects;

namespace RealEstateHub.Domain.Entities.Users;

public class SearchAlert
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BuyerId { get; set; }
    public Buyer Buyer { get; set; } = null!;
    public string? Keyword { get; set; }
    public Guid? ProvinceId { get; set; }
    public Guid? DistrictId { get; set; }
    public Guid? WardId { get; set; }
    public Address Location { get; set; } = new();
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? MinArea { get; set; }
    public double? MaxArea { get; set; }
    public PropertyType? PropertyType { get; set; }
    public TransactionType? TransactionType { get; set; }
    public SearchAlertFrequency Frequency { get; set; } = SearchAlertFrequency.Daily;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
