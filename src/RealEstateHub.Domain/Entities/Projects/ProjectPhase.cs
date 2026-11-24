namespace RealEstateHub.Domain.Entities.Projects;

public class ProjectPhase
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public decimal? StartingPrice { get; set; }
    public double? AreaFrom { get; set; }
    public double? AreaTo { get; set; }
    public DateTime? LaunchDate { get; set; }
    public DateTime? HandoverDate { get; set; }
}
