using System.Security.Claims;
using RealEstateHub.Application.Exceptions;

namespace RealEstateHub.API.Controllers;

public static class ClaimsPrincipalExtensions
{
    /// <summary>Id người dùng trong access token (claim NameIdentifier / sub).</summary>
    public static Guid GetUserId(this ClaimsPrincipal user)
        => user.FindUserId() ?? throw new UnauthorizedException("Invalid authenticated identity.");

    /// <summary>Id người dùng nếu đã đăng nhập, ngược lại null (dùng cho API cho phép khách vãng lai).</summary>
    public static Guid? FindUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
