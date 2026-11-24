namespace RealEstateHub.Application.DTOs.Response;

public record PagedResult<T>(IReadOnlyCollection<T> Items, int Page, int PageSize, int Total);
