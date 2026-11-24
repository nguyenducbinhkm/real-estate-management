namespace RealEstateHub.Application.DTOs.Response;

public record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt, UserDto User);
