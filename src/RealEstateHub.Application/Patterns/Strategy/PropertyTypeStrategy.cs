using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Patterns.Strategy;

public class PropertyTypeStrategy : ISearchStrategy
{
    // Dùng Where(p => p is X) thay cho OfType<X>().Cast<Property>(): giữ nguyên kiểu IQueryable<Property>
    // để EF Core dịch được khi ghép với các strategy khác (vd. TransactionTypeStrategy kiểm tra "is ForSaleProperty").
    public IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria)
        => criteria.Type switch
        {
            PropertyType.Apartment => query.Where(p => p is Apartment),
            PropertyType.House => query.Where(p => p is House),
            PropertyType.Villa => query.Where(p => p is Villa),
            PropertyType.Shophouse => query.Where(p => p is Shophouse),
            PropertyType.RentalApartment => query.Where(p => p is RentalApartment),
            PropertyType.RentalHouse => query.Where(p => p is RentalHouse),
            PropertyType.Office => query.Where(p => p is Office),
            PropertyType.Warehouse => query.Where(p => p is Warehouse),
            PropertyType.Land => query.Where(p => p is Land),
            _ => query
        };
}
