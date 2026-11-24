using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Users;

public class Buyer : User
{
    public List<Guid> SavedListingIds { get; set; } = new();
    public List<SearchAlert> SearchAlerts { get; set; } = new();

    public override bool CanPostListing() => false;
    public override UserRole GetRole() => UserRole.Buyer;
}
