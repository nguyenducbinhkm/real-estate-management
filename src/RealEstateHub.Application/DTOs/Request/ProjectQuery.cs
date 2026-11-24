using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.DTOs.Request;

public class ProjectQuery
{
    /// <summary>Tìm theo tên dự án hoặc chủ đầu tư (không phân biệt hoa thường).</summary>
    public string? Keyword { get; set; }
    public string? ProvinceCode { get; set; }
    public ProjectStatus? Status { get; set; }

    /// <summary>Lọc dự án có khoảng giá giao với [MinPrice, MaxPrice].</summary>
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? Featured { get; set; }

    /// <summary>default | newest | priceAsc | priceDesc</summary>
    public string? Sort { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}
