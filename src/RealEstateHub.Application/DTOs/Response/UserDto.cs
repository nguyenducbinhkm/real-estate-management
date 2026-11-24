namespace RealEstateHub.Application.DTOs.Response;

public record UserDto(Guid Id, string Email, string Phone, string FullName, string Role, bool IsVerified);
