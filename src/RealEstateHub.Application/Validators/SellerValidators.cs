using FluentValidation;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Validators;

public class CreateContactRequestValidator : AbstractValidator<CreateContactRequest>
{
    public CreateContactRequestValidator()
    {
        RuleFor(x => x.PropertyId).NotEmpty().WithMessage("Thiếu tin đăng cần liên hệ.");
        RuleFor(x => x.SenderName).NotEmpty().WithMessage("Vui lòng nhập họ tên.")
            .MaximumLength(200).WithMessage("Họ tên tối đa 200 ký tự.");
        RuleFor(x => x.SenderPhone).NotEmpty().WithMessage("Vui lòng nhập số điện thoại.")
            .Matches(@"^\+?[0-9 .]{8,20}$").WithMessage("Số điện thoại chỉ gồm chữ số (8–20 ký tự).");
        RuleFor(x => x.SenderEmail)
            .EmailAddress().WithMessage("Email không hợp lệ.")
            .MaximumLength(256)
            .When(x => !string.IsNullOrWhiteSpace(x.SenderEmail));
        RuleFor(x => x.Message).MaximumLength(2000).WithMessage("Lời nhắn tối đa 2000 ký tự.");
    }
}

public class ChangeListingStatusRequestValidator : AbstractValidator<ChangeListingStatusRequest>
{
    public ChangeListingStatusRequestValidator()
        => RuleFor(x => x.Status)
            .Must(s => s is PropertyStatus.Active or PropertyStatus.Draft or PropertyStatus.Sold or PropertyStatus.Rented)
            .WithMessage("Chỉ được hiện, ẩn tin hoặc đánh dấu đã bán / đã cho thuê.");
}

public class UpdateContactStatusRequestValidator : AbstractValidator<UpdateContactStatusRequest>
{
    public UpdateContactStatusRequestValidator()
        => RuleFor(x => x.Status).IsInEnum().WithMessage("Trạng thái không hợp lệ.");
}
