using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Application.Patterns.Strategy;

public class KeywordSearchStrategy : ISearchStrategy
{
    public IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria)
    {
        if (string.IsNullOrWhiteSpace(criteria.Keyword)) return query;
        // Không phân biệt hoa thường: EF Core (Npgsql) dịch ToLower() thành lower() trong SQL.
        var keyword = criteria.Keyword.Trim().ToLower();
        return query.Where(p =>
            (p.Title != null && p.Title.ToLower().Contains(keyword)) ||
            (p.Description != null && p.Description.ToLower().Contains(keyword)));
    }
}
