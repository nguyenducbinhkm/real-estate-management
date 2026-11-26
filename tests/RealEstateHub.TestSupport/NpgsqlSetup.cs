using System.Runtime.CompilerServices;

namespace RealEstateHub.TestSupport;

internal static class NpgsqlSetup
{
    /// <summary>
    /// Database dùng cột "timestamp without time zone" nên ứng dụng bật chế độ legacy timestamp của Npgsql
    /// (Program.cs / AppDbContext). Cờ này phải bật TRƯỚC lần dùng Npgsql đầu tiên – ở test là lúc dựng database.
    /// </summary>
    [ModuleInitializer]
    internal static void EnableLegacyTimestamps() => AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
}
