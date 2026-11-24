using RealEstateHub.Domain.Enums;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Domain.Entities.Users;

public class Seller : User
{
    public List<Property> Listings { get; set; } = new();
    public SubscriptionPackage Subscription { get; set; } = SubscriptionPackage.Free;

    public override bool CanPostListing() => true;
    public override UserRole GetRole() => UserRole.Seller;
    public override int GetMaxListings() => 5;
}
