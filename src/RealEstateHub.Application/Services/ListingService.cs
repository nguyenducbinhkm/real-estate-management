using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Mappings;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;
using RealEstateHub.Domain.ValueObjects;
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

    public async Task<ListingContactDto> GetContactAsync(Guid id, bool isAuthenticated, CancellationToken ct = default)
    {
        var listing = await _listings.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Không tìm thấy tin đăng.");
        var phone = listing.EffectiveContactPhone;
        var zalo = listing.EffectiveZaloPhone;
        // Ai cũng xem được số điện thoại khi bấm "Hiện số"; nhắn Zalo cần đăng nhập.
        return new ListingContactDto(
            phone,
            isAuthenticated ? zalo : null,
            isAuthenticated ? PhoneNumber.ZaloLink(zalo) : null,
            HasZalo: zalo is not null,
            ZaloRequiresLogin: !isAuthenticated && zalo is not null);
    }

    public async Task<ListingDto> CreateAsync(Guid ownerId, CreateListingRequest request, CancellationToken ct = default)
    {
        var owner = await _users.GetByIdAsync(ownerId, ct)
            ?? throw new UnauthorizedException("User not found.");

        if (!owner.CanPostListing())
            throw new ForbiddenException("Tài khoản người mua không thể đăng tin.");

        var maxListings = owner.GetMaxListings();
        var used = (await _listings.GetByOwnerAsync(ownerId, ct)).Count(p => p.CountsTowardListingLimit);
        if (used >= maxListings)
            throw new AppException(422, "LISTING_LIMIT",
                $"Bạn đã dùng hết {maxListings} suất đăng tin. Hãy ẩn hoặc xoá bớt tin, hoặc đánh dấu tin đã giao dịch.");

        var ward = await ResolveWardAsync(request, ct);
        var listing = _propertyFactory.Create(request, owner);
        listing.WardId = ward.Id;
        listing.Ward = ward;
        if (!listing.Validate())
            throw new AppException(422, "VALIDATION_ERROR", "Dữ liệu tin đăng không hợp lệ.");

        ApplyImages(listing, request.ImageUrls ?? new List<string>());
        listing.Status = PropertyStatus.Pending;
        await _listings.AddAsync(listing, ct);
        return RealEstateHubProfile.MapListing(listing);
    }

    public async Task<ListingDto> UpdateAsync(Guid id, Guid requesterId, bool isAdmin, UpdateListingRequest request, CancellationToken ct = default)
    {
        var listing = await _listings.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Listing not found.");

        if (!isAdmin && listing.OwnerId != requesterId)
            throw new ForbiddenException("Bạn chỉ sửa được tin của mình.");

        var now = DateTime.UtcNow;
        if (!isAdmin)
        {
            // Sửa nội dung thì tin phải được duyệt lại.
            try { listing.MarkEditedByOwner(now); }
            catch (InvalidOperationException ex) { throw new AppException(422, "INVALID_STATUS", ex.Message); }
        }

        var ward = await ResolveWardAsync(request, ct);
        ApplyListing(request, listing);
        listing.WardId = ward.Id;
        listing.Ward = ward;
        if (!listing.Validate())
            throw new AppException(422, "VALIDATION_ERROR", "Dữ liệu tin đăng không hợp lệ.");

        if (request.ImageUrls is not null)
            ApplyImages(listing, request.ImageUrls);
        listing.UpdatedAt = now;
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

    public async Task<ListingDto> ChangeStatusAsync(Guid id, Guid requesterId, bool isAdmin, ChangeListingStatusRequest request, CancellationToken ct = default)
    {
        var listing = await _listings.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Listing not found.");

        if (!isAdmin && listing.OwnerId != requesterId)
            throw new ForbiddenException("You can only update your own listing.");

        try
        {
            listing.ChangeStatusByOwner(request.Status, DateTime.UtcNow);
        }
        catch (InvalidOperationException ex)
        {
            throw new AppException(422, "INVALID_STATUS", ex.Message);
        }

        await _listings.UpdateAsync(listing, ct);
        return RealEstateHubProfile.MapListing(listing);
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

    private static void ApplyImages(Property listing, IEnumerable<string> urls)
    {
        try { listing.ReplaceImages(urls); }
        catch (InvalidOperationException ex) { throw new AppException(422, "VALIDATION_ERROR", ex.Message); }
    }

    private static void ApplyListing(CreateListingRequest r, Property listing)
    {
        listing.Title = r.Title;
        listing.Description = r.Description;
        listing.Price = r.Price;
        listing.Area = r.Area;
        listing.StreetAddress = r.StreetAddress;
        listing.SetContactPhones(r.ContactPhone, r.ZaloPhone);

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
        {
            office.FloorNumber = r.FloorNumber ?? 0;
            office.Furniture = r.Furniture ?? FurnitureStatus.None;
        }
        else if (listing is Warehouse warehouse)
        {
            warehouse.CeilingHeight = r.CeilingHeight ?? 0;
            warehouse.RoadWidth = r.RoadWidth ?? 0;
        }
        else if (listing is Land land)
        {
            land.HasClearance = r.HasClearance ?? false;
            land.LegalStatus = r.LegalStatus ?? LegalStatus.Unknown;
        }

        if (listing is RentalApartment ra)
        {
            ra.Furniture = r.Furniture ?? FurnitureStatus.None;
            ra.PetsAllowed = r.PetsAllowed ?? false;
        }
        else if (listing is RentalHouse rh)
            rh.Furniture = r.Furniture ?? FurnitureStatus.None;

        if (listing is ForRentProperty rent)
            rent.RentalPeriodMonths = r.RentalPeriodMonths ?? 12;
    }
}
