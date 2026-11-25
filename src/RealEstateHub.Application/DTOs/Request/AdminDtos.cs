using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.DTOs.Request;

/// <summary>Một tài khoản admin khai báo trong file admin-accounts.json (mục "AdminAccounts").</summary>
public class AdminAccountEntry
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Phone { get; set; }
}

public record ChangeUserRoleRequest(UserRole Role);
