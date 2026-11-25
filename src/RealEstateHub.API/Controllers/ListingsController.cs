using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;

namespace RealEstateHub.API.Controllers;

[ApiController]
[Route("api/listings")]
public class ListingsController : ControllerBase
{
    private readonly IListingService _listings;
    private readonly IValidator<CreateListingRequest> _createValidator;
    private readonly IValidator<UpdateListingRequest> _updateValidator;

    public ListingsController(IListingService listings,
        IValidator<CreateListingRequest> createValidator,
        IValidator<UpdateListingRequest> updateValidator)
    {
        _listings = listings;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    [AllowAnonymous]
    public Task<IActionResult> Search([FromQuery] ListingQuery query, CancellationToken ct)
        => SearchInternal(query, ct);

    private async Task<IActionResult> SearchInternal(ListingQuery query, CancellationToken ct)
        => Ok(await _listings.SearchAsync(query, ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _listings.GetByIdAsync(id, ct));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateListingRequest request, CancellationToken ct)
    {
        await _createValidator.ValidateAndThrowAsync(request, ct);
        var ownerId = GetUserId();
        var created = await _listings.CreateAsync(ownerId, request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateListingRequest request, CancellationToken ct)
    {
        await _updateValidator.ValidateAndThrowAsync(request, ct);
        var updated = await _listings.UpdateAsync(id, GetUserId(), IsAdmin(), request, ct);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _listings.DeleteAsync(id, GetUserId(), IsAdmin(), ct);
        return NoContent();
    }

    /// <summary>Chủ tin đổi trạng thái: hiện (Active), ẩn (Draft), đã bán (Sold), đã cho thuê (Rented).</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeListingStatusRequest request,
        [FromServices] IValidator<ChangeListingStatusRequest> validator, CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(request, ct);
        return Ok(await _listings.ChangeStatusAsync(id, GetUserId(), IsAdmin(), request, ct));
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMine(CancellationToken ct)
        => Ok(await _listings.GetMineAsync(GetUserId(), ct));

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(value, out var id))
            throw new UnauthorizedException("Invalid authenticated identity.");
        return id;
    }

    private bool IsAdmin()
        => User.IsInRole("Admin");
}
