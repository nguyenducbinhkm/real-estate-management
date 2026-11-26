using System.Text.Json;
using Npgsql;

namespace RealEstateHub.TestSupport;

/// <summary>
/// Dựng một database PostgreSQL riêng cho bộ test từ các script trong thư mục database/ của repo:
/// schema.sql → seed.sql (≈13.000 dòng dữ liệu mẫu) → migrations/*.sql (theo thứ tự tên file).
/// Database thật (RealEstateHubDb) không bị đụng tới.
///
/// Chuỗi kết nối tới máy chủ PostgreSQL lấy theo thứ tự:
///   1. biến môi trường REALESTATEHUB_TEST_DB (vd. "Host=localhost;Port=5432;Username=postgres;Password=...");
///   2. ConnectionStrings:DefaultConnection trong src/RealEstateHub.API/appsettings.Development.json.
/// </summary>
public static class TestDatabase
{
    static TestDatabase() => AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

    public static string RepoRoot { get; } = FindRepoRoot();

    /// <summary>Xoá (nếu có) rồi tạo mới database <paramref name="name"/> và nạp đủ cấu trúc + dữ liệu mẫu. Trả về chuỗi kết nối.</summary>
    public static async Task<string> RecreateAsync(string name)
    {
        var server = new NpgsqlConnectionStringBuilder(ServerConnectionString()) { Database = "postgres", Pooling = false };
        await using (var admin = new NpgsqlConnection(server.ConnectionString))
        {
            await admin.OpenAsync();
            await ExecAsync(admin, $"DROP DATABASE IF EXISTS \"{name}\" WITH (FORCE)");
            await ExecAsync(admin, $"CREATE DATABASE \"{name}\" ENCODING 'UTF8'");
        }

        var target = new NpgsqlConnectionStringBuilder(server.ConnectionString) { Database = name, Pooling = true };
        await using (var db = new NpgsqlConnection(target.ConnectionString))
        {
            await db.OpenAsync();
            foreach (var script in Scripts())
                await ExecAsync(db, await File.ReadAllTextAsync(script), timeoutSeconds: 300);
        }
        return target.ConnectionString;
    }

    /// <summary>Các script theo đúng thứ tự chạy.</summary>
    public static IEnumerable<string> Scripts()
    {
        var dir = Path.Combine(RepoRoot, "database");
        yield return Path.Combine(dir, "schema.sql");
        yield return Path.Combine(dir, "seed.sql");
        var migrations = Path.Combine(dir, "migrations");
        if (Directory.Exists(migrations))
            foreach (var file in Directory.GetFiles(migrations, "*.sql").OrderBy(f => f, StringComparer.Ordinal))
                yield return file;
    }

    private static async Task ExecAsync(NpgsqlConnection connection, string sql, int timeoutSeconds = 60)
    {
        await using var command = new NpgsqlCommand(sql, connection) { CommandTimeout = timeoutSeconds };
        await command.ExecuteNonQueryAsync();
    }

    private static string ServerConnectionString()
    {
        var fromEnv = Environment.GetEnvironmentVariable("REALESTATEHUB_TEST_DB");
        if (!string.IsNullOrWhiteSpace(fromEnv)) return fromEnv;

        var settings = Path.Combine(RepoRoot, "src", "RealEstateHub.API", "appsettings.Development.json");
        if (File.Exists(settings))
        {
            using var json = JsonDocument.Parse(File.ReadAllText(settings), new JsonDocumentOptions { CommentHandling = JsonCommentHandling.Skip });
            if (json.RootElement.TryGetProperty("ConnectionStrings", out var cs) && cs.TryGetProperty("DefaultConnection", out var value))
                return value.GetString()!;
        }
        throw new InvalidOperationException(
            "Không tìm thấy chuỗi kết nối PostgreSQL cho test. Đặt biến môi trường REALESTATEHUB_TEST_DB " +
            "hoặc tạo src/RealEstateHub.API/appsettings.Development.json (xem README).");
    }

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "RealEstateHub.sln")))
            dir = dir.Parent;
        return dir?.FullName ?? throw new InvalidOperationException("Không tìm thấy thư mục gốc của repo (RealEstateHub.sln).");
    }
}
