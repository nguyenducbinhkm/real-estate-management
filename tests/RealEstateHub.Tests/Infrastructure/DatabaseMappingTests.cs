using RealEstateHub.Application.Mappings;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Patterns.Strategy;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;
using RealEstateHub.Infrastructure.Data.Converters;
using RealEstateHub.Infrastructure.Services;

namespace RealEstateHub.Tests.Infrastructure;

public class DatabaseMappingTests
{
    [Fact]
    public void PasswordHasherVerifiesLegacyBcryptHashes()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Secret123!", workFactor: 4);
        var hasher = new PasswordHasher();

        Assert.True(hasher.Verify("Secret123!", hash));
        Assert.False(hasher.Verify("wrong", hash));
    }

    [Fact]
    public void PasswordHasherStillVerifiesPbkdf2Hashes()
    {
        var hasher = new PasswordHasher();
        var hash = hasher.Hash("Secret123!");

        Assert.StartsWith("PBKDF2:", hash);
        Assert.True(hasher.Verify("Secret123!", hash));
        Assert.False(hasher.Verify("wrong", hash));
    }

    [Theory]
    [InlineData("Sổ đỏ/Sổ hồng", LegalStatus.RedBook)]
    [InlineData("Have certificate", LegalStatus.RedBook)]
    [InlineData("Sale contract", LegalStatus.SaleContract)]
    [InlineData("something else", LegalStatus.Unknown)]
    public void LegalStatusTextIsReadFromDatabase(string text, LegalStatus expected)
        => Assert.Equal(expected, LegacyValueConverters.LegalFromText(text));

    [Theory]
    [InlineData("Full", FurnitureStatus.Full)]
    [InlineData("Basic", FurnitureStatus.Basic)]
    [InlineData("Cơ bản", FurnitureStatus.Basic)]
    [InlineData("", FurnitureStatus.None)]
    public void FurnitureTextIsReadFromDatabase(string text, FurnitureStatus expected)
        => Assert.Equal(expected, LegacyValueConverters.FurnitureFromText(text));

    [Fact]
    public void ForSaleFilterIncludesLandAndExcludesRentals()
    {
        var source = new Property[]
        {
            new Apartment { Title = "a" },
            new Land { Title = "b" },
            new RentalApartment { Title = "c" },
        }.AsQueryable();
        var criteria = new SearchCriteria.Builder().ForTransaction(TransactionType.ForSale).Build();

        var result = new TransactionTypeStrategy().Execute(source, criteria).ToList();

        Assert.Equal(2, result.Count);
        Assert.DoesNotContain(result, p => p is RentalApartment);
    }

    [Fact]
    public void MapListingKeepsRentalTypeAndBuildsAddressFromWard()
    {
        var province = new Province { Code = "79", Name = "Thành phố Hồ Chí Minh" };
        var district = new District { Code = "760", Name = "Quận 1", Province = province };
        var ward = new Ward { Code = "26734", Name = "Phường Bến Nghé", District = district };
        var listing = new RentalApartment { Title = "Studio", Price = 10_000_000, Area = 30, Ward = ward, StreetAddress = "Lê Lợi" };

        var dto = RealEstateHubProfile.MapListing(listing);

        Assert.Equal(PropertyType.RentalApartment, dto.PropertyType);
        Assert.Equal(TransactionType.ForRent, dto.TransactionType);
        Assert.Equal("79", dto.ProvinceCode);
        Assert.Equal("Quận 1", dto.DistrictName);
        Assert.Equal("Phường Bến Nghé", dto.WardName);
        Assert.Equal("Lê Lợi", dto.StreetAddress);
    }
}
