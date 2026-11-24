using System.Net;
using System.Text.Json;
using FluentValidation;
using RealEstateHub.Application.Exceptions;

namespace RealEstateHub.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            await WriteAsync(context, HttpStatusCode.BadRequest, "VALIDATION_ERROR",
                "One or more validation errors occurred.", ex.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray()));
        }
        catch (AppException ex)
        {
            await WriteAsync(context, (HttpStatusCode)ex.StatusCode, ex.ErrorCode, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled API exception");
            await WriteAsync(context, HttpStatusCode.InternalServerError, "INTERNAL_ERROR",
                "An unexpected error occurred.");
        }
    }

    private static async Task WriteAsync(HttpContext context, HttpStatusCode status, string code,
        string message, object? details = null)
    {
        context.Response.StatusCode = (int)status;
        context.Response.ContentType = "application/json";

        var payload = new
        {
            status = (int)status,
            code,
            message,
            details
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload,
            new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    }
}
