using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Users;

public class Admin : User
{
    public AdminLevel Level { get; set; } = AdminLevel.Moderator;

    public override bool CanPostListing() => true;
    public override UserRole GetRole() => UserRole.Admin;
    public override int GetMaxListings() => 999;
}
