using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Users;

public class AgentSeller : Seller
{
    public string AgentLicense { get; set; } = string.Empty;
    public string AgencyName { get; set; } = string.Empty;
    public double Rating { get; set; }
    public int TotalTransactions { get; set; }

    public override int GetMaxListings() => 999;
    public override UserRole GetRole() => UserRole.Agent;
}
