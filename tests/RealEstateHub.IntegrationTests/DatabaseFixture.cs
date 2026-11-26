using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql;
using RealEstateHub.Application.Patterns.Composite;
using RealEstateHub.Application.Patterns.Strategy;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Infrastructure.Data;
using RealEstateHub.Infrastructure.Repositories;
using RealEstateHub.TestSupport;

namespace RealEstateHub.IntegrationTests;

/// <summary>
/// Dựng database RealEstateHubDb_IntegrationTests 1 lần cho cả bộ test (schema + seed + migrations của repo)
/// và cung cấp DbContext / repository thật. Các test trong cùng collection chạy tuần tự.
/// </summary>
public sealed class DatabaseFixture : IAsyncLifetime
{
    public const string DatabaseName = "RealEstateHubDb_IntegrationTests";

    public string ConnectionString { get; private set; } = string.Empty;

    public async Task InitializeAsync() => ConnectionString = await TestDatabase.RecreateAsync(DatabaseName);

    public Task DisposeAsync()
    {
        NpgsqlConnection.ClearAllPools();
        return Task.CompletedTask;
    }

    public AppDbContext NewContext(params IInterceptor[] interceptors)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(ConnectionString);
        if (interceptors.Length > 0) options.AddInterceptors(interceptors);
        return new AppDbContext(options.Options);
    }

    /// <summary>ListingRepository thật với đủ chiến lược tìm kiếm (giống đăng ký ở Program.cs).</summary>
    public static ListingRepository Listings(AppDbContext db) => new(db, new PropertySearchEngine(), new FilterCompositeStrategy(
        new KeywordSearchStrategy(), new PriceRangeStrategy(), new AreaRangeStrategy(),
        new LocationStrategy(), new PropertyTypeStrategy(), new TransactionTypeStrategy()));

    public static Task<Ward> AnyWardAsync(AppDbContext db)
        => db.Wards.Include(w => w.District).ThenInclude(d => d.Province).OrderBy(w => w.Code).FirstAsync();

    /// <summary>Đếm bằng SQL viết tay – dùng làm "đáp án tính tay" để đối chiếu với số liệu báo cáo.</summary>
    public async Task<long> ScalarAsync(string sql, params object[] args)
    {
        await using var connection = new NpgsqlConnection(ConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        for (var i = 0; i < args.Length; i++) command.Parameters.AddWithValue($"p{i}", args[i]);
        return Convert.ToInt64(await command.ExecuteScalarAsync());
    }
}

[CollectionDefinition(Name)]
public sealed class DatabaseCollection : ICollectionFixture<DatabaseFixture>
{
    public const string Name = "Database";
}

/// <summary>Tiêm lỗi: ném ngoại lệ khi chạy câu lệnh có chứa đoạn văn bản chỉ định (dùng kiểm tra Rollback).</summary>
public sealed class FailingCommandInterceptor : DbCommandInterceptor
{
    private readonly string _marker;
    public FailingCommandInterceptor(string marker) => _marker = marker;

    public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(DbCommand command, CommandEventData eventData,
        InterceptionResult<int> result, CancellationToken cancellationToken = default)
        => command.CommandText.Contains(_marker, StringComparison.Ordinal)
            ? throw new InvalidOperationException($"Lỗi tiêm có chủ đích tại câu lệnh chứa {_marker}")
            : base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);

    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(DbCommand command, CommandEventData eventData,
        InterceptionResult<DbDataReader> result, CancellationToken cancellationToken = default)
        => command.CommandText.Contains(_marker, StringComparison.Ordinal)
            ? throw new InvalidOperationException($"Lỗi tiêm có chủ đích tại câu lệnh chứa {_marker}")
            : base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
}
