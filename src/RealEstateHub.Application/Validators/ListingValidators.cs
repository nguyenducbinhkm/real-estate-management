using FluentValidation;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Validators;

/// <summary>
/// Kiểm tra dữ liệu đăng/sửa tin. Các trường bắt buộc riêng theo loại BĐS khớp với Validate() của lớp con
/// (nhà/biệt thự/shophouse/nhà cho thuê cần diện tích đất, kho xưởng cần chiều cao trần, đất cần đã giải phóng mặt bằng)
/// để người dùng nhận lỗi theo từng ô thay vì lỗi chung chung.
/// </summary>
public class CreateListingRequestValidator : AbstractValidator<CreateListingRequest>
{
    public const string UploadPrefix = "/uploads/listings/";

    private static readonly PropertyType[] NeedLandArea =
        { PropertyType.House, PropertyType.Villa, PropertyType.Shophouse, PropertyType.RentalHouse };

    public CreateListingRequestValidator()
    {
        RuleFor(x => x.PropertyType).IsInEnum().WithMessage("Loại bất động sản không hợp lệ.");
        RuleFor(x => x.TransactionType).IsInEnum().WithMessage("Hình thức giao dịch không hợp lệ.");
        RuleFor(x => x).Must(IsTypeAndTransactionCompatible)
            .WithName("PropertyType")
            .WithMessage("Loại bất động sản không phù hợp với hình thức giao dịch.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Vui lòng nhập tiêu đề.")
            .MinimumLength(20).WithMessage("Tiêu đề cần ít nhất 20 ký tự.")
            .MaximumLength(250).WithMessage("Tiêu đề tối đa 250 ký tự.");
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Vui lòng nhập mô tả.")
            .MinimumLength(50).WithMessage("Mô tả cần ít nhất 50 ký tự.")
            .MaximumLength(8000).WithMessage("Mô tả tối đa 8000 ký tự.");
        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Giá phải lớn hơn 0.")
            .LessThan(1_000_000_000_000_000m).WithMessage("Giá quá lớn.");
        RuleFor(x => x.Area)
            .GreaterThan(0).WithMessage("Diện tích phải lớn hơn 0.")
            .LessThanOrEqualTo(1_000_000).WithMessage("Diện tích quá lớn.");

        RuleFor(x => x.ProvinceCode).NotEmpty().WithMessage("Vui lòng chọn tỉnh/thành.").MaximumLength(20);
        RuleFor(x => x.DistrictCode).NotEmpty().WithMessage("Vui lòng chọn quận/huyện.").MaximumLength(20);
        RuleFor(x => x.WardCode).NotEmpty().WithMessage("Vui lòng chọn phường/xã.").MaximumLength(20);
        RuleFor(x => x.StreetAddress)
            .NotEmpty().WithMessage("Vui lòng nhập số nhà, tên đường.")
            .MaximumLength(250).WithMessage("Địa chỉ tối đa 250 ký tự.");

        RuleFor(x => x.BedroomCount).InclusiveBetween(0, 100).When(x => x.BedroomCount.HasValue).WithMessage("Số phòng ngủ không hợp lệ.");
        RuleFor(x => x.BathroomCount).InclusiveBetween(0, 100).When(x => x.BathroomCount.HasValue).WithMessage("Số phòng tắm không hợp lệ.");
        RuleFor(x => x.FloorNumber).InclusiveBetween(0, 200).When(x => x.FloorNumber.HasValue).WithMessage("Số tầng không hợp lệ.");
        RuleFor(x => x.LegalStatus).IsInEnum().When(x => x.LegalStatus.HasValue).WithMessage("Pháp lý không hợp lệ.");
        RuleFor(x => x.Furniture).IsInEnum().When(x => x.Furniture.HasValue).WithMessage("Nội thất không hợp lệ.");
        RuleFor(x => x.RentalPeriodMonths).InclusiveBetween(1, 120).When(x => x.RentalPeriodMonths.HasValue)
            .WithMessage("Thời hạn thuê từ 1 đến 120 tháng.");

        RuleFor(x => x.LandArea)
            .NotNull().WithMessage("Vui lòng nhập diện tích đất.")
            .GreaterThan(0).WithMessage("Diện tích đất phải lớn hơn 0.")
            .When(x => NeedLandArea.Contains(x.PropertyType));
        RuleFor(x => x.CeilingHeight)
            .NotNull().WithMessage("Vui lòng nhập chiều cao trần.")
            .GreaterThan(0).WithMessage("Chiều cao trần phải lớn hơn 0.")
            .When(x => x.PropertyType == PropertyType.Warehouse);
        RuleFor(x => x.HasClearance)
            .Equal(true).WithMessage("Chỉ đăng được đất đã giải phóng mặt bằng.")
            .When(x => x.PropertyType == PropertyType.Land);

        RuleFor(x => x.ContactPhone)
            .Matches(@"^\+?[0-9 .]{8,20}$").WithMessage("Số điện thoại liên hệ chỉ gồm chữ số (8–20 ký tự).")
            .When(x => !string.IsNullOrWhiteSpace(x.ContactPhone));
        RuleFor(x => x.ZaloPhone)
            .Matches(@"^\+?[0-9 .]{8,20}$").WithMessage("Số Zalo chỉ gồm chữ số (8–20 ký tự).")
            .When(x => !string.IsNullOrWhiteSpace(x.ZaloPhone));

        RuleFor(x => x.ImageUrls)
            .Must(urls => urls!.Count <= Property.MaxImages).WithMessage($"Tối đa {Property.MaxImages} ảnh.")
            .When(x => x.ImageUrls is not null);
        RuleForEach(x => x.ImageUrls)
            .Must(IsAllowedImageUrl).WithMessage("Đường dẫn ảnh không hợp lệ.");
    }

    /// <summary>Ảnh tải lên hệ thống (/uploads/listings/...) hoặc ảnh http(s) bên ngoài.</summary>
    public static bool IsAllowedImageUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url) || url.Length > 1000) return false;
        if (url.StartsWith(UploadPrefix, StringComparison.Ordinal))
            return !url.Contains("..") && url.IndexOfAny(new[] { '\\', '?', '#' }) < 0;
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp);
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

/// <summary>Sửa tin dùng cùng quy tắc với đăng tin.</summary>
public class UpdateListingRequestValidator : AbstractValidator<UpdateListingRequest>
{
    public UpdateListingRequestValidator()
    {
        Include(new CreateListingRequestValidator());
    }
}
