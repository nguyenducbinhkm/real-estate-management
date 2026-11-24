using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Properties;

public class Land : Property
{
    public override TransactionType TransactionType => TransactionType.ForSale;
    public LandType LandType { get; set; }
    public bool HasClearance { get; set; }
    public double RoadWidth { get; set; }
    public LegalStatus LegalStatus { get; set; }

    public override bool Validate()
        => !string.IsNullOrWhiteSpace(Title)
           && Price > 0
           && Area > 0
           && HasClearance;
}
