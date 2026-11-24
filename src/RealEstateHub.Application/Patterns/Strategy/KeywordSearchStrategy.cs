using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Application.Patterns.Strategy;

public class KeywordSearchStrategy : ISearchStrategy
{
    public IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria)
    {
        if (string.IsNullOrWhiteSpace(criteria.Keyword)) return query;
        var keyword = criteria.Keyword.Trim();
        return query.Where(p => p.Title.Contains(keyword) || p.Description.Contains(keyword));
    }
}
