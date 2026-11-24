using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Patterns.Strategy;

public class TransactionTypeStrategy : ISearchStrategy
{
    // Land không kế thừa ForSaleProperty nhưng là tin bán.
    // Dùng Where thay cho Concat giữa hai kiểu khác nhau (EF Core không dịch được, gây lỗi 500).
    public IQueryable<Property> Execute(IQueryable<Property> query, SearchCriteria criteria)
        => criteria.TransactionType switch
        {
            TransactionType.ForSale => query.Where(p => p is ForSaleProperty || p is Land),
            TransactionType.ForRent => query.Where(p => p is ForRentProperty),
            _ => query
        };
}
