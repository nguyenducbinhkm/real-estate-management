namespace RealEstateHub.Domain.Entities.Properties;

public class Warehouse : ForRentProperty
{
    public double CeilingHeight { get; set; }
    public bool HasLoadingDock { get; set; }
    public bool HasThreePhasePower { get; set; }
    public double RoadWidth { get; set; }

    public override bool Validate()
        => !string.IsNullOrWhiteSpace(Title)
           && Price > 0
           && Area > 0
           && RentalPeriodMonths > 0
           && CeilingHeight > 0;
}
