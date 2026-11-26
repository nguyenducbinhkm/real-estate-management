using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Patterns.Factory;

public class PropertyFactory : IPropertyFactory
{
    public Property Create(CreateListingRequest request, User owner)
    {
        Property property = (request.PropertyType, request.TransactionType) switch
        {
            (PropertyType.Apartment, TransactionType.ForSale) => new Apartment
            {
                BedroomCount = request.BedroomCount ?? 0,
                BathroomCount = request.BathroomCount ?? 0,
                FloorNumber = request.FloorNumber ?? 0
            },
            (PropertyType.House, TransactionType.ForSale) => new House
            {
                LandArea = request.LandArea ?? 0,
                RoadWidth = 0
            },
            (PropertyType.Villa, TransactionType.ForSale) => new Villa
            {
                BedroomCount = request.BedroomCount ?? 0,
                BathroomCount = request.BathroomCount ?? 0,
                LandArea = request.LandArea ?? 0
            },
            (PropertyType.Shophouse, TransactionType.ForSale) => new Shophouse
            {
                LandArea = request.LandArea ?? 0,
                CommercialFloorCount = request.FloorNumber ?? 1
            },
            (PropertyType.Land, _) => new Land
            {
                HasClearance = request.HasClearance ?? false
            },
            (PropertyType.RentalApartment, TransactionType.ForRent) => new RentalApartment
            {
                BedroomCount = request.BedroomCount ?? 0,
                BathroomCount = request.BathroomCount ?? 0,
                FloorNumber = request.FloorNumber ?? 0,
                RentalPeriodMonths = request.RentalPeriodMonths ?? 12
            },
            (PropertyType.RentalHouse, TransactionType.ForRent) => new RentalHouse
            {
                BedroomCount = request.BedroomCount ?? 0,
                BathroomCount = request.BathroomCount ?? 0,
                LandArea = request.LandArea ?? 0,
                RentalPeriodMonths = request.RentalPeriodMonths ?? 12
            },
            (PropertyType.Office, TransactionType.ForRent) => new Office
            {
                FloorNumber = request.FloorNumber ?? 0,
                RentalPeriodMonths = request.RentalPeriodMonths ?? 12
            },
            (PropertyType.Warehouse, TransactionType.ForRent) => new Warehouse
            {
                CeilingHeight = request.CeilingHeight ?? 0,
                RoadWidth = request.RoadWidth ?? 0,
                RentalPeriodMonths = request.RentalPeriodMonths ?? 12
            },
            _ => throw new AppException(422, "VALIDATION_ERROR",
                $"Unsupported property type and transaction: {request.PropertyType}/{request.TransactionType}.")
        };

        property.OwnerId = owner.Id;
        property.Owner = owner;
        property.Title = request.Title;
        property.Description = request.Description;
        property.Price = request.Price;
        property.Area = request.Area;
        // Phường/xã (WardId) do ListingService tra theo WardCode rồi gán.
        property.StreetAddress = request.StreetAddress;
        property.SetContactPhones(request.ContactPhone, request.ZaloPhone);

        if (property is ForSaleProperty sale)
        {
            sale.LegalStatus = request.LegalStatus ?? LegalStatus.Unknown;
            sale.Furniture = request.Furniture ?? FurnitureStatus.None;
        }

        if (property is Land land)
            land.LegalStatus = request.LegalStatus ?? LegalStatus.Unknown;

        if (property is RentalApartment rentalApartment)
        {
            rentalApartment.Furniture = request.Furniture ?? FurnitureStatus.None;
            rentalApartment.PetsAllowed = request.PetsAllowed ?? false;
        }
        else if (property is RentalHouse rentalHouse)
            rentalHouse.Furniture = request.Furniture ?? FurnitureStatus.None;
        else if (property is Office office)
            office.Furniture = request.Furniture ?? FurnitureStatus.None;

        return property;
    }
}
