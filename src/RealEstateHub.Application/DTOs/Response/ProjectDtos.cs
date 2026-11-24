using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.DTOs.Response;

public class ProjectSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Developer { get; set; } = string.Empty;
    public ProjectStatus Status { get; set; }
    public string ProvinceCode { get; set; } = string.Empty;
    public string ProvinceName { get; set; } = string.Empty;
    public string DistrictName { get; set; } = string.Empty;
    public string WardName { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string Currency { get; set; } = "VND";
    public double? TotalArea { get; set; }
    public DateTime? LaunchDate { get; set; }
    public DateTime? HandoverDate { get; set; }
    public bool IsFeatured { get; set; }
    public int PhaseCount { get; set; }
    public int ListingCount { get; set; }
}

public class ProjectDetailDto : ProjectSummaryDto
{
    public string Description { get; set; } = string.Empty;
    public string DistrictCode { get; set; } = string.Empty;
    public string WardCode { get; set; } = string.Empty;
    public IReadOnlyCollection<ProjectPhaseDto> Phases { get; set; } = Array.Empty<ProjectPhaseDto>();
}

public record ProjectPhaseDto(Guid Id, string Name, string? Description, int SortOrder, decimal? StartingPrice);

public record ProjectProvinceDto(string ProvinceCode, string ProvinceName, int ProjectCount);
