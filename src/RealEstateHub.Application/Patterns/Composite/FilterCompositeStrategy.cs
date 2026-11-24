using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Patterns.Strategy;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Application.Patterns.Composite;

public class FilterCompositeStrategy : ISearchStrategy
{
    private readonly IReadOnlyCollection<ISearchStrategy> _strategies;

    public FilterCompositeStrategy(params ISearchStrategy[] strategies)
        => _strategies = strategies;

    public IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria)
        => _strategies.Aggregate(query, (current, strategy) => strategy.Execute(current, criteria));
}
