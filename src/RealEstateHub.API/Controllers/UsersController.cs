using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;

namespace RealEstateHub.API.Controllers;

/// <summary>Thông tin tài khoản của người dùng đang đăng nhập.</summary>
[ApiController]
[Authorize]
[Route("api/users/me")]
public class UsersController : ControllerBase
{
    private readonly IAccountService _accounts;
    private readonly IValidator<UpdateProfileRequest> _profileValidator;
    private readonly IValidator<ChangePasswordRequest> _passwordValidator;

    public UsersController(IAccountService accounts,
        IValidator<UpdateProfileRequest> profileValidator,
        IValidator<ChangePasswordRequest> passwordValidator)
    {
        _accounts = accounts;
        _profileValidator = profileValidator;
        _passwordValidator = passwordValidator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
        => Ok(await _accounts.GetProfileAsync(GetUserId(), ct));

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        await _profileValidator.ValidateAndThrowAsync(request, ct);
        return Ok(await _accounts.UpdateProfileAsync(GetUserId(), request, ct));
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        await _passwordValidator.ValidateAndThrowAsync(request, ct);
        await _accounts.ChangePasswordAsync(GetUserId(), request, ct);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(value, out var id))
            throw new UnauthorizedException("Invalid authenticated identity.");
        return id;
    }
}
