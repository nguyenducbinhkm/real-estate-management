using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Application.Services;

public class AccountService : IAccountService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;

    public AccountService(IUserRepository users, IPasswordHasher passwordHasher)
    {
        _users = users;
        _passwordHasher = passwordHasher;
    }

    public async Task<ProfileDto> GetProfileAsync(Guid userId, CancellationToken ct = default)
        => ToDto(await LoadAsync(userId, ct));

    public async Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        var user = await LoadAsync(userId, ct);
        user.FullName = request.FullName.Trim();
        user.Phone = request.Phone.Trim();
        user.AvatarUrl = string.IsNullOrWhiteSpace(request.AvatarUrl) ? null : request.AvatarUrl.Trim();
        user.UpdatedAt = DateTime.UtcNow;
        await _users.UpdateAsync(user, ct);
        return ToDto(user);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await LoadAsync(userId, ct);
        // 400 (không phải 401): frontend coi 401 là hết phiên đăng nhập và sẽ tự đăng xuất.
        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new AppException(400, "INVALID_PASSWORD", "Mật khẩu hiện tại không đúng.");

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _users.UpdateAsync(user, ct);
    }

    private async Task<User> LoadAsync(Guid userId, CancellationToken ct)
        => await _users.GetByIdAsync(userId, ct) ?? throw new NotFoundException("Không tìm thấy tài khoản.");

    private static ProfileDto ToDto(User user) => new(
        user.Id,
        user.Email,
        user.Phone,
        user.FullName,
        user.AvatarUrl,
        user.GetRole().ToString(),
        user.IsVerified,
        user.CanPostListing(),
        user.GetMaxListings(),
        user.CreatedAt,
        user.UpdatedAt);
}
