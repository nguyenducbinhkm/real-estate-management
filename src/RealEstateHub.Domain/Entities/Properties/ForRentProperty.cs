using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Properties;

public abstract class ForRentProperty : Property
{
    public override TransactionType TransactionType => TransactionType.ForRent;
    public int RentalPeriodMonths { get; set; } = 12;
    public decimal DepositAmount { get; set; }
    public bool IncludesUtilities { get; set; }
}
