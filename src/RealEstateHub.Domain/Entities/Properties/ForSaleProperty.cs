using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Properties;

public abstract class ForSaleProperty : Property
{
    public override TransactionType TransactionType => TransactionType.ForSale;
    public LegalStatus LegalStatus { get; set; }
    public FurnitureStatus Furniture { get; set; }
    public int FloorCount { get; set; }
}
