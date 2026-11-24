using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Application.Patterns.Strategy;

public interface ISearchStrategy
{
    IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria);
}
