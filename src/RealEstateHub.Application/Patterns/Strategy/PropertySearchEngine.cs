using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Application.Patterns.Strategy;

public class PropertySearchEngine
{
    private readonly List<ISearchStrategy> _strategies = new();

    public PropertySearchEngine AddStrategy(ISearchStrategy strategy)
    {
        _strategies.Add(strategy);
        return this;
    }

    public PropertySearchEngine Clear()
    {
        _strategies.Clear();
        return this;
    }

    public IQueryable<Property> Search(IQueryable<Property> source, SearchCriteria criteria)
        => _strategies.Aggregate(source, (current, strategy) => strategy.Execute(current, criteria));
}
