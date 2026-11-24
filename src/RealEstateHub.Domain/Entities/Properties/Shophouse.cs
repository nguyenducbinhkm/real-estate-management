using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Properties;

public class Shophouse : ForSaleProperty
{
    public double LandArea { get; set; }
    public double RoadWidth { get; set; }
    public int CommercialFloorCount { get; set; }
    public bool HasHandoverStandard { get; set; }

    public override bool Validate()
        => !string.IsNullOrWhiteSpace(Title)
           && Price > 0
           && Area > 0
           && LandArea > 0
           && CommercialFloorCount >= 1;
}
