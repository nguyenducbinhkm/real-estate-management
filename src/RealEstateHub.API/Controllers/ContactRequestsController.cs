using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Interfaces;

namespace RealEstateHub.API.Controllers;

/// <summary>Khách gửi yêu cầu liên hệ tới người đăng tin (không bắt buộc đăng nhập).</summary>
[ApiController]
[Route("api/contact-requests")]
public class ContactRequestsController : ControllerBase
{
    private readonly IContactRequestService _contacts;
    private readonly IValidator<CreateContactRequest> _validator;

    public ContactRequestsController(IContactRequestService contacts, IValidator<CreateContactRequest> validator)
    {
        _contacts = contacts;
        _validator = validator;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Send([FromBody] CreateContactRequest request, CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        var created = await _contacts.SendAsync(User.FindUserId(), request, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }
}
