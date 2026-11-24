namespace RealEstateHub.Domain.Entities.Locations;

public class Ward
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DistrictId { get; set; }
    public District District { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
