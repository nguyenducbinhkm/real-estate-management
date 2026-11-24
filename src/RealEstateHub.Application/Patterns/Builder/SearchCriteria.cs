using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Patterns.Builder;

public class SearchCriteria
{
    public string? Keyword { get; private set; }
    public string? ProvinceCode { get; private set; }
    public string? DistrictCode { get; private set; }
    public decimal? MinPrice { get; private set; }
    public decimal? MaxPrice { get; private set; }
    public double? MinArea { get; private set; }
    public double? MaxArea { get; private set; }
    public PropertyType? Type { get; private set; }
    public TransactionType? TransactionType { get; private set; }
    public int Page { get; private set; } = 1;
    public int PageSize { get; private set; } = 20;

    public class Builder
    {
        private readonly SearchCriteria _criteria = new();

        public Builder WithKeyword(string? keyword)
        {
            _criteria.Keyword = string.IsNullOrWhiteSpace(keyword) ? null : keyword.Trim();
            return this;
        }

        public Builder InLocation(string? provinceCode, string? districtCode)
        {
            _criteria.ProvinceCode = provinceCode;
            _criteria.DistrictCode = districtCode;
            return this;
        }

        public Builder PriceRange(decimal? minPrice, decimal? maxPrice)
        {
            _criteria.MinPrice = minPrice;
            _criteria.MaxPrice = maxPrice;
            return this;
        }

        public Builder AreaRange(double? minArea, double? maxArea)
        {
            _criteria.MinArea = minArea;
            _criteria.MaxArea = maxArea;
            return this;
        }

        public Builder OfType(PropertyType? type)
        {
            _criteria.Type = type;
            return this;
        }

        public Builder ForTransaction(TransactionType? transactionType)
        {
            _criteria.TransactionType = transactionType;
            return this;
        }

        public Builder WithPaging(int page, int pageSize)
        {
            _criteria.Page = Math.Max(page, 1);
            _criteria.PageSize = Math.Clamp(pageSize, 1, 100);
            return this;
        }

        public SearchCriteria Build() => _criteria;
    }
}
