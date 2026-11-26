using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Patterns.Factory;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.UnitTests.Patterns;

public class SearchAndFactoryTests
{
    [Fact]
    public void FactoryCreatesApartmentForSale()
    {
        var owner = new Seller { Id = Guid.NewGuid(), FullName = "Seller" };
        var request = new CreateListingRequest
        {
            PropertyType = PropertyType.Apartment,
            TransactionType = TransactionType.ForSale,
            Title = "Can ho mau",
            Description = "Mo ta",
            Price = 3_000_000_000,
            Area = 70,
            ProvinceCode = "79",
            DistrictCode = "749",
            StreetAddress = "Duong mau",
            BedroomCount = 2
        };

        var result = new PropertyFactory().Create(request, owner);

        Assert.IsType<Apartment>(result);
        Assert.Equal(owner.Id, result.OwnerId);
        Assert.True(result.Validate());
    }

    [Fact]
    public void SearchCriteriaBuilderMapsQueryValues()
    {
        var criteria = new SearchCriteria.Builder()
            .WithKeyword("Can ho")
            .InLocation("79", "747")
            .PriceRange(2_000_000_000, 5_000_000_000)
            .AreaRange(50, 90)
            .OfType(PropertyType.Apartment)
            .ForTransaction(TransactionType.ForSale)
            .WithPaging(2, 30)
            .Build();

        Assert.Equal("Can ho", criteria.Keyword);
        Assert.Equal("79", criteria.ProvinceCode);
        Assert.Equal("747", criteria.DistrictCode);
        Assert.Equal(PropertyType.Apartment, criteria.Type);
        Assert.Equal(TransactionType.ForSale, criteria.TransactionType);
        Assert.Equal(2, criteria.Page);
        Assert.Equal(30, criteria.PageSize);
    }
}
