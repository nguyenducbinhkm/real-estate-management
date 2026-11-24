using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Properties;

public class Apartment : ForSaleProperty
{
    public int BedroomCount { get; set; }
    public int BathroomCount { get; set; }
    public int FloorNumber { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public Direction Direction { get; set; }

    public override bool Validate()
        => !string.IsNullOrWhiteSpace(Title)
           && Price > 0
           && Area > 0
           && BedroomCount >= 0
           && BathroomCount >= 0;
}
