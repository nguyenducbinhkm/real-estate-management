using FluentValidation;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Validators;

public class CreateListingRequestValidator : AbstractValidator<CreateListingRequest>
{
    public CreateListingRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(8000);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.Area).GreaterThan(0);
        RuleFor(x => x.ProvinceCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.DistrictCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.WardCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.StreetAddress).NotEmpty().MaximumLength(250);
        RuleFor(x => x).Must(IsTypeAndTransactionCompatible)
            .WithMessage("PropertyType is not compatible with TransactionType.");
    }

    private static bool IsTypeAndTransactionCompatible(CreateListingRequest x)
        => x.PropertyType switch
        {
            PropertyType.Apartment or PropertyType.House or PropertyType.Villa or PropertyType.Shophouse or PropertyType.Land
                => x.TransactionType == TransactionType.ForSale,
            PropertyType.RentalApartment or PropertyType.RentalHouse or PropertyType.Office or PropertyType.Warehouse
                => x.TransactionType == TransactionType.ForRent,
            _ => false
        };
}

public class UpdateListingRequestValidator : AbstractValidator<UpdateListingRequest>
{
    public UpdateListingRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(8000);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.Area).GreaterThan(0);
        RuleFor(x => x.ProvinceCode).NotEmpty();
        RuleFor(x => x.DistrictCode).NotEmpty();
        RuleFor(x => x.WardCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.StreetAddress).NotEmpty().MaximumLength(250);
    }
}
