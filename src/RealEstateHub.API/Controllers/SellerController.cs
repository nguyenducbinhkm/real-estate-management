using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.API.Controllers;

/// <summary>Khu vực quản lý của người bán: Tổng quan, Quản lý tin đăng, Quản lý khách hàng.</summary>
[ApiController]
[Authorize]
[Route("api/seller")]
public class SellerController : ControllerBase
{
    private readonly ISellerService _seller;
    private readonly IContactRequestService _contacts;

    public SellerController(ISellerService seller, IContactRequestService contacts)
    {
        _seller = seller;
        _contacts = contacts;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct)
        => Ok(await _seller.GetDashboardAsync(User.GetUserId(), ct));

    [HttpGet("listings")]
    public async Task<IActionResult> Listings(CancellationToken ct)
        => Ok(await _seller.GetListingsAsync(User.GetUserId(), ct));

    [HttpGet("contact-requests")]
    public async Task<IActionResult> ContactRequests([FromQuery] ContactRequestStatus? status, [FromQuery] string? q, CancellationToken ct)
        => Ok(await _contacts.GetForSellerAsync(User.GetUserId(), new ContactRequestQuery(status, q), ct));

    [HttpPatch("contact-requests/{id:guid}/status")]
    public async Task<IActionResult> UpdateContactStatus(Guid id, [FromBody] UpdateContactStatusRequest request,
        [FromServices] IValidator<UpdateContactStatusRequest> validator, CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(request, ct);
        return Ok(await _contacts.UpdateStatusAsync(User.GetUserId(), id, request, ct));
    }

    [HttpDelete("contact-requests/{id:guid}")]
    public async Task<IActionResult> DeleteContact(Guid id, CancellationToken ct)
    {
        await _contacts.DeleteAsync(User.GetUserId(), id, ct);
        return NoContent();
    }
}
