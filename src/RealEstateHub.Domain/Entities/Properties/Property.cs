using RealEstateHub.Domain.Enums;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Domain.Entities.Projects;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.ValueObjects;

namespace RealEstateHub.Domain.Entities.Properties;

public abstract class Property
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Area { get; set; }

    /// <summary>Vị trí lưu theo phường/xã; quận/huyện và tỉnh/thành suy ra từ phường.</summary>
    public Guid WardId { get; set; }
    public Ward? Ward { get; set; }
    public string StreetAddress { get; set; } = string.Empty;

    /// <summary>Địa chỉ đầy đủ (chỉ đọc), cần nạp Ward → District → Province.</summary>
    public Address Address => Address.From(Ward, StreetAddress);

    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    public PropertyStatus Status { get; set; } = PropertyStatus.Draft;
    public abstract TransactionType TransactionType { get; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public List<PropertyImage> Images { get; set; } = new();
    public PackageType PackageType { get; set; } = PackageType.Free;
    public int BoostScore { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }

    public abstract bool Validate();

    public virtual decimal CalculatePricePerSqm()
        => Area > 0 ? Price / (decimal)Area : 0;

    public virtual string GetSummary()
        => $"{Title} - {Price:N0} VNĐ - {Area}m²";
}
