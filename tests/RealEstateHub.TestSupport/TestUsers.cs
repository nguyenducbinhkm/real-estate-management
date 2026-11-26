using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Infrastructure.Data;
using RealEstateHub.Infrastructure.Services;

namespace RealEstateHub.TestSupport;

/// <summary>Tạo nhanh tài khoản thử (mật khẩu đã biết) trong database test cho các vai trò Buyer / Seller / Agent / Admin.</summary>
public static class TestUsers
{
    public const string Password = "MatKhauTest123!";
    private static readonly PasswordHasher Hasher = new();

    public static async Task<T> CreateAsync<T>(AppDbContext db, string? emailPrefix = null, Action<T>? configure = null) where T : User, new()
    {
        var user = new T
        {
            Email = $"{emailPrefix ?? typeof(T).Name.ToLowerInvariant()}.{Guid.NewGuid():N}@test.local",
            FullName = $"Test {typeof(T).Name}",
            Phone = "0900000000",
            IsVerified = true,
            PasswordHash = Hasher.Hash(Password),
        };
        configure?.Invoke(user);
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }
}
