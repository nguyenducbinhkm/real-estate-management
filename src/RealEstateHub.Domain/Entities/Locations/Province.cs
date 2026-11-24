namespace RealEstateHub.Domain.Entities.Locations;

public class Province
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<District> Districts { get; set; } = new();
}
