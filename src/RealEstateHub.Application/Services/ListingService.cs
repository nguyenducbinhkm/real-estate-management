using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Mappings;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Patterns.Factory;

namespace RealEstateHub.Application.Services;

public class ListingService : IListingService
{
    private readonly IListingRepository _listings;
    private readonly IUserRepository _users;
    private readonly ILocationRepository _locations;
    private readonly IPropertyFactory _propertyFactory;

    public ListingService(IListingRepository listings, IUserRepository users,
        ILocationRepository locations, IPropertyFactory propertyFactory)
    {
        _listings = listings;
        _users = users;
        _locations = locations;
        _propertyFactory = propertyFactory;
    }

    public async Task<PagedResult<ListingDto>> SearchAsync(ListingQuery query, CancellationToken ct = default)
    {
        query.Page = Math.Max(query.Page, 1);
        query.PageSize = Math.Clamp(query.PageSize, 1, 100);
        var criteria = new SearchCriteria.Builder()
            .WithKeyword(query.Keyword)
            .InLocation(query.ProvinceCode, query.DistrictCode)
            .PriceRange(query.MinPrice, query.MaxPrice)
            .AreaRange(query.MinArea, query.MaxArea)
            .OfType(query.PropertyType)
            .ForTransaction(query.TransactionType)
            .WithPaging(query.Page, query.PageSize)
            .Build();
        var (items, total) = await _listings.SearchAsync(criteria, ct);
        return new PagedResult<ListingDto>(
            items.Select(RealEstateHubProfile.MapListing).ToArray(),
            query.Page,
            query.PageSize,
            total);
    }

    public async Task<ListingDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var listing = await _listings.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Listing not found.");
        return RealEstateHubProfile.MapListing(listing);
    }

    public async Task<ListingDto> CreateAsync(Guid ownerId, CreateListingRequest request, CancellationToken ct = default)
    {
        var owner = await _users.GetByIdAsync(ownerId, ct)
            ?? throw new UnauthorizedException("User not found.");

        if (!owner.CanPostListing())
            throw new ForbiddenException("Buyer accounts cannot post listings.");

        var ward = await ResolveWardAsync(request, ct);
        var listing = _propertyFactory.Create(request, owner);
        listing.WardId = ward.Id;
        listing.Ward = ward;
        if (!listing.Validate())
            throw new AppException(422, "VALIDATION_ERROR", "Listing data is invalid.");

        listing.Status = PropertyStatus.Pending;
        await _listings.AddAsync(listing, ct);
        return RealEstateHubProfile.MapListing(listing);
    }

    public async Task<ListingDto> UpdateAsync(Guid id, Guid requesterId, bool isAdmin, UpdateListingRequest request, CancellationToken ct = default)
    {
        var listing = await _listings.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Listing not found.");

        if (!isAdmin && listing.OwnerId != requesterId)
            throw new ForbiddenException("You can only update your own listing.");

        var ward = await ResolveWardAsync(request, ct);
        ApplyListing(request, listing);
        listing.WardId = ward.Id;
        listing.Ward = ward;
        if (!listing.Validate())
            throw new AppException(422, "VALIDATION_ERROR", "Listing data is invalid.");

        listing.UpdatedAt = DateTime.UtcNow;
        await _listings.UpdateAsync(listing, ct);
        return RealEstateHubProfile.MapListing(listing);
    }

    public async Task DeleteAsync(Guid id, Guid requesterId, bool isAdmin, CancellationToken ct = default)
    {
        var listing = await _listings.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Listing not found.");

        if (!isAdmin && listing.OwnerId != requesterId)
            throw new ForbiddenException("You can only delete your own listing.");

        await _listings.DeleteAsync(listing, ct);
    }

    public async Task<IReadOnlyCollection<ListingDto>> GetMineAsync(Guid ownerId, CancellationToken ct = default)
    {
        var items = await _listings.GetByOwnerAsync(ownerId, ct);
        return items.Select(RealEstateHubProfile.MapListing).ToArray();
    }

    // Địa chỉ lưu theo phường/xã: tra WardCode và kiểm tra khớp quận/huyện, tỉnh/thành gửi lên.
    private async Task<Ward> ResolveWardAsync(CreateListingRequest request, CancellationToken ct)
    {
        var ward = await _locations.FindWardAsync(request.WardCode.Trim(), ct)
            ?? throw new AppException(422, "VALIDATION_ERROR", "Ward not found.");

        if (!string.IsNullOrWhiteSpace(request.DistrictCode) && ward.District.Code != request.DistrictCode.Trim())
            throw new AppException(422, "VALIDATION_ERROR", "Ward does not belong to the given district.");
        if (!string.IsNullOrWhiteSpace(request.ProvinceCode) && ward.District.Province.Code != request.ProvinceCode.Trim())
            throw new AppException(422, "VALIDATION_ERROR", "Ward does not belong to the given province.");

        return ward;
    }

    private static void ApplyListing(CreateListingRequest r, Property listing)
    {
        listing.Title = r.Title;
        listing.Description = r.Description;
        listing.Price = r.Price;
        listing.Area = r.Area;
        listing.StreetAddress = r.StreetAddress;

        if (listing is ForSaleProperty sale)
        {
            sale.LegalStatus = r.LegalStatus ?? LegalStatus.Unknown;
            sale.Furniture = r.Furniture ?? FurnitureStatus.None;
        }

        if (listing is Apartment apartment)
        {
            apartment.BedroomCount = r.BedroomCount ?? 0;
            apartment.BathroomCount = r.BathroomCount ?? 0;
            apartment.FloorNumber = r.FloorNumber ?? 0;
        }
        else if (listing is House house)
            house.LandArea = r.LandArea ?? 0;
        else if (listing is Villa villa)
        {
            villa.BedroomCount = r.BedroomCount ?? 0;
            villa.BathroomCount = r.BathroomCount ?? 0;
            villa.LandArea = r.LandArea ?? 0;
        }
        else if (listing is Shophouse shophouse)
        {
            shophouse.LandArea = r.LandArea ?? 0;
            shophouse.CommercialFloorCount = r.FloorNumber ?? 1;
        }
        else if (listing is RentalApartment rentalApartment)
        {
            rentalApartment.BedroomCount = r.BedroomCount ?? 0;
            rentalApartment.BathroomCount = r.BathroomCount ?? 0;
            rentalApartment.FloorNumber = r.FloorNumber ?? 0;
        }
        else if (listing is RentalHouse rentalHouse)
        {
            rentalHouse.BedroomCount = r.BedroomCount ?? 0;
            rentalHouse.BathroomCount = r.BathroomCount ?? 0;
            rentalHouse.LandArea = r.LandArea ?? 0;
        }
        else if (listing is Office office)
            office.FloorNumber = r.FloorNumber ?? 0;
    }
}
