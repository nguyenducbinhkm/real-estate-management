using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Domain.Enums;
using RealEstateHub.Domain.ValueObjects;

namespace RealEstateHub.Domain.Entities.Projects;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Developer { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid WardId { get; set; }
    public Ward? Ward { get; set; }
    public string StreetAddress { get; set; } = string.Empty;
    public Address Address => Address.From(Ward, StreetAddress);
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    public Money MinPrice { get; set; } = new();
    public Money MaxPrice { get; set; } = new();
    public double? TotalArea { get; set; }
    public DateTime? LaunchDate { get; set; }
    public DateTime? HandoverDate { get; set; }
    public bool IsFeatured { get; set; }
    public List<ProjectPhase> Phases { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
