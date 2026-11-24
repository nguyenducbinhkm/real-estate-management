using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Application.Interfaces;

public interface IJwtTokenService
{
    (string AccessToken, DateTime ExpiresAt) CreateAccessToken(User user);
    string CreateRefreshToken();
}
