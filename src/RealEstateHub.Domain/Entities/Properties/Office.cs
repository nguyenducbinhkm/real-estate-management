using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Properties;

public class Office : ForRentProperty
{
    public int FloorNumber { get; set; }
    public bool HasElevator { get; set; }
    public bool HasParking { get; set; }
    public FurnitureStatus Furniture { get; set; }

    public override bool Validate()
        => !string.IsNullOrWhiteSpace(Title)
           && Price > 0
           && Area > 0
           && RentalPeriodMonths > 0;
}
