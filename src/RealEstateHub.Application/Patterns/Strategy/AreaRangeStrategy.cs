using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Application.Patterns.Strategy;

public class AreaRangeStrategy : ISearchStrategy
{
    public IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria)
    {
        if (criteria.MinArea.HasValue)
            query = query.Where(p => p.Area >= criteria.MinArea.Value);
        if (criteria.MaxArea.HasValue)
            query = query.Where(p => p.Area <= criteria.MaxArea.Value);
        return query;
    }
}
