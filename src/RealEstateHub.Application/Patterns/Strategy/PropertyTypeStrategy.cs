using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Patterns.Strategy;

public class PropertyTypeStrategy : ISearchStrategy
{
    public IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria)
        => criteria.Type switch
        {
            PropertyType.Apartment => query.OfType<Apartment>().Cast<Property>(),
            PropertyType.House => query.OfType<House>().Cast<Property>(),
            PropertyType.Villa => query.OfType<Villa>().Cast<Property>(),
            PropertyType.Shophouse => query.OfType<Shophouse>().Cast<Property>(),
            PropertyType.RentalApartment => query.OfType<RentalApartment>().Cast<Property>(),
            PropertyType.RentalHouse => query.OfType<RentalHouse>().Cast<Property>(),
            PropertyType.Office => query.OfType<Office>().Cast<Property>(),
            PropertyType.Warehouse => query.OfType<Warehouse>().Cast<Property>(),
            PropertyType.Land => query.OfType<Land>().Cast<Property>(),
            _ => query
        };
}
