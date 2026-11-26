using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Infrastructure.Data;
using RealEstateHub.TestSupport;

namespace RealEstateHub.ApiTests;

/// <summary>
/// Chạy toàn bộ API (route, JWT, phân quyền, validation, middleware lỗi) trong bộ nhớ trên database test
/// RealEstateHubDb_ApiTests dựng từ database/*.sql. Lưu ảnh đại diện được thay bằng bản giả (không gọi Supabase).
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string DatabaseName = "RealEstateHubDb_ApiTests";
    public string ConnectionString { get; private set; } = string.Empty;
    public FakeAvatarStorage Avatars { get; } = new();

    public async Task InitializeAsync() => ConnectionString = await TestDatabase.RecreateAsync(DatabaseName);

    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        NpgsqlConnection.ClearAllPools();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:DefaultConnection", ConnectionString);
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseNpgsql(ConnectionString));
            services.RemoveAll<IAvatarStorage>();
            services.AddSingleton<IAvatarStorage>(Avatars);
        });
    }

    public AppDbContext NewDbContext()
        => new(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(ConnectionString).Options);

    /// <summary>Tạo tài khoản thử với vai trò T rồi đăng nhập qua API; trả về HttpClient đã gắn token.</summary>
    public async Task<(HttpClient Client, T User, LoginResult Login)> SignInAsNewAsync<T>(Action<T>? configure = null) where T : User, new()
    {
        T user;
        await using (var db = NewDbContext())
            user = await TestUsers.CreateAsync(db, configure: configure);
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email = user.Email, password = TestUsers.Password });
        response.EnsureSuccessStatusCode();
        var login = (await response.Content.ReadFromJsonAsync<LoginResult>())!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login.AccessToken);
        return (client, user, login);
    }
}

public sealed record LoginResult(string AccessToken, string RefreshToken, LoginUser User);
public sealed record LoginUser(Guid Id, string Email, string Role, string? AvatarUrl);

public sealed class FakeAvatarStorage : IAvatarStorage
{
    public bool IsConfigured => true;
    public Dictionary<Guid, string> ContentTypes { get; } = new();

    public Task<string> UploadAsync(Guid userId, Stream content, string contentType, CancellationToken ct = default)
    {
        lock (ContentTypes) ContentTypes[userId] = contentType;
        return Task.FromResult($"https://storage.test/avatars/{userId:N}");
    }

    public Task DeleteAsync(Guid userId, CancellationToken ct = default)
    {
        lock (ContentTypes) ContentTypes.Remove(userId);
        return Task.CompletedTask;
    }
}

internal static class ServiceCollectionExtensions
{
    public static void RemoveAll<T>(this IServiceCollection services)
    {
        foreach (var descriptor in services.Where(d => d.ServiceType == typeof(T)).ToList())
            services.Remove(descriptor);
    }
}

[CollectionDefinition(Name)]
public sealed class ApiCollection : ICollectionFixture<ApiFactory>
{
    public const string Name = "Api";
}
