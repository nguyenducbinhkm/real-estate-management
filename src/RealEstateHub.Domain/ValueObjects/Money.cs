namespace RealEstateHub.Domain.ValueObjects;

public sealed class Money
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "VND";
}
