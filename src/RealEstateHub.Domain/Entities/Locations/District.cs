namespace RealEstateHub.Domain.Entities.Locations;

public class District
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProvinceId { get; set; }
    public Province Province { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<Ward> Wards { get; set; } = new();
}
