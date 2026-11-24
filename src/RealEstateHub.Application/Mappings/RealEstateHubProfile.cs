using AutoMapper;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Mappings;

public class RealEstateHubProfile : Profile
{
    public RealEstateHubProfile()
    {
        CreateMap<User, UserDto>()
            .ConstructUsing(u => new UserDto(
                u.Id,
                u.Email,
                u.Phone,
                u.FullName,
                u.GetRole().ToString(),
                u.IsVerified));
    }

    public static ListingDto MapListing(Property p) => new()
    {
        Id = p.Id,
        Title = p.Title,
        Description = p.Description,
        Price = p.Price,
        Area = p.Area,
        PricePerSqm = p.CalculatePricePerSqm(),
        Status = p.Status,
        PropertyType = p switch
        {
            Apartment => PropertyType.Apartment,
            RentalApartment => PropertyType.RentalApartment,
            House => PropertyType.House,
            RentalHouse => PropertyType.RentalHouse,
            Villa => PropertyType.Villa,
            Shophouse => PropertyType.Shophouse,
            Office => PropertyType.Office,
            Warehouse => PropertyType.Warehouse,
            Land => PropertyType.Land,
            _ => PropertyType.Apartment
        },
        TransactionType = p.TransactionType,
        PackageType = p.PackageType,
        OwnerId = p.OwnerId,
        Summary = p.GetSummary(),
        ProvinceCode = p.Address.ProvinceCode,
        ProvinceName = p.Address.ProvinceName,
        DistrictCode = p.Address.DistrictCode,
        DistrictName = p.Address.DistrictName,
        WardCode = p.Address.WardCode,
        WardName = p.Address.WardName,
        StreetAddress = p.Address.StreetAddress,
        CreatedAt = p.CreatedAt
    };
}
