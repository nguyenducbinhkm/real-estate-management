using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Properties;

public class House : ForSaleProperty
{
    public double LandArea { get; set; }
    public double RoadWidth { get; set; }
    public HouseType HouseType { get; set; }

    public override bool Validate()
        => !string.IsNullOrWhiteSpace(Title)
           && Price > 0
           && Area > 0
           && LandArea > 0;
}
