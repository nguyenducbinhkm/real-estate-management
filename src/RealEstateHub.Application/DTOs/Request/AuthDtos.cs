namespace RealEstateHub.Application.DTOs.Request;

public record RegisterRequest(string Email, string Phone, string FullName, string Password, string Role);
public record LoginRequest(string Email, string Password);
public record RefreshTokenRequest(string RefreshToken);
