using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Application.Patterns.Strategy;

public class PriceRangeStrategy : ISearchStrategy
{
    public IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria)
    {
        if (criteria.MinPrice.HasValue)
            query = query.Where(p => p.Price >= criteria.MinPrice.Value);
        if (criteria.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= criteria.MaxPrice.Value);
        return query;
    }
}
