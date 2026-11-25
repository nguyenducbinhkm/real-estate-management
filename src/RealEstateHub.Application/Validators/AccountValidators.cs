using FluentValidation;
using RealEstateHub.Application.DTOs.Request;

namespace RealEstateHub.Application.Validators;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().WithMessage("Vui lòng nhập họ tên.")
            .MaximumLength(200).WithMessage("Họ tên tối đa 200 ký tự.");
        RuleFor(x => x.Phone).NotEmpty().WithMessage("Vui lòng nhập số điện thoại.")
            .Matches(@"^\+?[0-9 .]{8,20}$").WithMessage("Số điện thoại chỉ gồm chữ số (8–20 ký tự).");
        RuleFor(x => x.AvatarUrl)
            .MaximumLength(1000).WithMessage("Đường dẫn ảnh tối đa 1000 ký tự.")
            .Must(BeHttpUrl).WithMessage("Ảnh đại diện phải là đường dẫn http(s) hợp lệ.")
            .When(x => !string.IsNullOrWhiteSpace(x.AvatarUrl));
    }

    private static bool BeHttpUrl(string? url)
        => Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
}

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty().WithMessage("Vui lòng nhập mật khẩu hiện tại.");
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Vui lòng nhập mật khẩu mới.")
            .MinimumLength(8).WithMessage("Mật khẩu mới tối thiểu 8 ký tự.")
            .MaximumLength(128).WithMessage("Mật khẩu mới tối đa 128 ký tự.")
            .NotEqual(x => x.CurrentPassword).WithMessage("Mật khẩu mới phải khác mật khẩu hiện tại.");
    }
}
