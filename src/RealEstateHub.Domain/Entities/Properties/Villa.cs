using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Properties;

public class Villa : ForSaleProperty
{
    public int BedroomCount { get; set; }
    public int BathroomCount { get; set; }
    public double LandArea { get; set; }
    public double GardenArea { get; set; }
    public double RoadWidth { get; set; }
    public Direction Direction { get; set; }
    public bool HasSwimmingPool { get; set; }

    public override bool Validate()
        => !string.IsNullOrWhiteSpace(Title)
           && Price > 0
           && Area > 0
           && LandArea > 0
           && BedroomCount >= 0;
}
