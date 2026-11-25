using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.API.Controllers;

/// <summary>Khu quản trị: tổng quan và quản lý người dùng. Chỉ tài khoản Admin.</summary>
[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;

    public AdminController(IAdminService admin) => _admin = admin;

    [HttpGet("stats")]
    public async Task<IActionResult> Stats(CancellationToken ct)
        => Ok(await _admin.GetStatsAsync(ct));

    [HttpGet("users")]
    public async Task<IActionResult> Users([FromQuery] UserRole? role, [FromQuery] string? q, CancellationToken ct)
        => Ok(await _admin.GetUsersAsync(role, q, ct));

    /// <summary>Đổi vai trò người dùng: Buyer, Seller hoặc Agent.</summary>
    [HttpPatch("users/{id:guid}/role")]
    public async Task<IActionResult> ChangeRole(Guid id, [FromBody] ChangeUserRoleRequest request, CancellationToken ct)
        => Ok(await _admin.ChangeUserRoleAsync(User.GetUserId(), id, request.Role, ct));
}
