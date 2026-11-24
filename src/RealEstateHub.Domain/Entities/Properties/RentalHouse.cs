using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Properties;

public class RentalHouse : ForRentProperty
{
    public int BedroomCount { get; set; }
    public int BathroomCount { get; set; }
    public double LandArea { get; set; }
    public HouseType HouseType { get; set; }
    public FurnitureStatus Furniture { get; set; }

    public override bool Validate()
        => !string.IsNullOrWhiteSpace(Title)
           && Price > 0
           && Area > 0
           && RentalPeriodMonths > 0
           && LandArea > 0;
}
