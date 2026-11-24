namespace RealEstateHub.Application.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }
    public string ErrorCode { get; }

    public AppException(int statusCode, string errorCode, string message)
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}

public sealed class NotFoundException : AppException
{
    public NotFoundException(string message) : base(404, "NOT_FOUND", message) { }
}

public sealed class ConflictException : AppException
{
    public ConflictException(string message) : base(409, "CONFLICT", message) { }
}

public sealed class ForbiddenException : AppException
{
    public ForbiddenException(string message) : base(403, "FORBIDDEN", message) { }
}

public sealed class UnauthorizedException : AppException
{
    public UnauthorizedException(string message) : base(401, "UNAUTHORIZED", message) { }
}
