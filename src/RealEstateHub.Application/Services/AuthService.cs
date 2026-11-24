using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _tokens;

    public AuthService(IUserRepository users, IPasswordHasher passwordHasher, IJwtTokenService tokens)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokens = tokens;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await _users.GetByEmailAsync(email, ct) is not null)
            throw new ConflictException("Email is already registered.");

        User user = request.Role switch
        {
            "Buyer" => new Buyer(),
            "Seller" => new Seller(),
            "Agent" => new AgentSeller(),
            _ => throw new AppException(422, "VALIDATION_ERROR", "Unsupported registration role.")
        };

        user.Email = email;
        user.Phone = request.Phone.Trim();
        user.FullName = request.FullName.Trim();
        user.PasswordHash = _passwordHasher.Hash(request.Password);
        await _users.AddAsync(user, ct);
        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByEmailAsync(request.Email, ct);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Email or password is incorrect.");

        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var stored = await _users.GetRefreshTokenAsync(refreshToken, ct);
        if (stored is null || stored.RevokedAt.HasValue || stored.ExpiresAt <= DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token is invalid or expired.");

        stored.RevokedAt = DateTime.UtcNow;
        await _users.UpdateAsync(stored.User, ct);
        return await IssueAsync(stored.User, ct);
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        var stored = await _users.GetRefreshTokenAsync(refreshToken, ct);
        if (stored is null) return;
        stored.RevokedAt = DateTime.UtcNow;
        await _users.UpdateAsync(stored.User, ct);
    }

    private async Task<AuthResponse> IssueAsync(User user, CancellationToken ct)
    {
        var (accessToken, expiresAt) = _tokens.CreateAccessToken(user);
        var refreshToken = _tokens.CreateRefreshToken();
        var refresh = new RefreshToken
        {
            UserId = user.Id,
            User = user,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        await _users.AddRefreshTokenAsync(refresh, ct);

        var role = user.GetRole().ToString();
        var dto = new UserDto(user.Id, user.Email, user.Phone, user.FullName, role, user.IsVerified);
        return new AuthResponse(accessToken, refreshToken, expiresAt, dto);
    }
}
