namespace RealEstateHub.Domain.Entities.Properties;

public class RentalApartment : ForRentProperty
{
    public int BedroomCount { get; set; }
    public int BathroomCount { get; set; }
    public int FloorNumber { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public bool PetsAllowed { get; set; }
    public Enums.FurnitureStatus Furniture { get; set; }

    public override bool Validate()
        => !string.IsNullOrWhiteSpace(Title)
           && Price > 0
           && Area > 0
           && RentalPeriodMonths > 0
           && BedroomCount >= 0;
}
