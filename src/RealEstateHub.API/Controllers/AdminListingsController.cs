using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.API.Controllers;

/// <summary>Admin kiểm duyệt tin đăng.</summary>
[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/listings")]
public class AdminListingsController : ControllerBase
{
    private readonly IListingModerationService _moderation;

    public AdminListingsController(IListingModerationService moderation) => _moderation = moderation;

    [HttpGet]
    public async Task<IActionResult> Queue([FromQuery] PropertyStatus? status, [FromQuery] string? q, CancellationToken ct)
        => Ok(await _moderation.GetQueueAsync(status, q, ct));

    [HttpPatch("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
        => Ok(await _moderation.ApproveAsync(id, ct));

    [HttpPatch("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken ct)
        => Ok(await _moderation.RejectAsync(id, ct));

    /// <summary>Gỡ tin vi phạm đang hiển thị/đang ẩn.</summary>
    [HttpPatch("{id:guid}/takedown")]
    public async Task<IActionResult> TakeDown(Guid id, CancellationToken ct)
        => Ok(await _moderation.TakeDownAsync(id, ct));
}
