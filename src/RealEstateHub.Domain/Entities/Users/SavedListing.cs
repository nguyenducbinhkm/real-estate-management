using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Domain.Entities.Users;

public class SavedListing
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BuyerId { get; set; }
    public Buyer Buyer { get; set; } = null!;
    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
