using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Application.Patterns.Strategy;

public class LocationStrategy : ISearchStrategy
{
    // Địa chỉ lưu theo phường/xã: Property → Ward → District → Province.
    public IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria)
    {
        if (!string.IsNullOrWhiteSpace(criteria.ProvinceCode))
            query = query.Where(p => p.Ward!.District.Province.Code == criteria.ProvinceCode);
        if (!string.IsNullOrWhiteSpace(criteria.DistrictCode))
            query = query.Where(p => p.Ward!.District.Code == criteria.DistrictCode);
        return query;
    }
}
