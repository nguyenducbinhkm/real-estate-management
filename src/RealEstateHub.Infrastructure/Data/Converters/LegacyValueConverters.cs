using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Infrastructure.Data.Converters;

/// <summary>
/// Chuyển giữa enum của domain và chuỗi tự do trong database RealEstateHubDb
/// (vd. "Sổ đỏ/Sổ hồng", "Sale contract", "Cơ bản").
/// </summary>
public static class LegacyValueConverters
{
    public static readonly ValueConverter<LegalStatus, string> LegalStatus =
        new(v => LegalToText(v), v => LegalFromText(v));

    public static readonly ValueConverter<FurnitureStatus, string> Furniture =
        new(v => v.ToString(), v => FurnitureFromText(v));

    public static string LegalToText(LegalStatus value) => value switch
    {
        Domain.Enums.LegalStatus.RedBook or Domain.Enums.LegalStatus.PinkBook => "Sổ đỏ/Sổ hồng",
        Domain.Enums.LegalStatus.SaleContract => "Sale contract",
        Domain.Enums.LegalStatus.LongTermLease => "Long-term lease",
        _ => "Unknown"
    };

    public static LegalStatus LegalFromText(string? text) => Normalize(text) switch
    {
        "sổ đỏ/sổ hồng" or "have certificate" or "redbook" => Domain.Enums.LegalStatus.RedBook,
        "pinkbook" => Domain.Enums.LegalStatus.PinkBook,
        "sale contract" or "salecontract" => Domain.Enums.LegalStatus.SaleContract,
        "long-term lease" or "longtermlease" => Domain.Enums.LegalStatus.LongTermLease,
        _ => Domain.Enums.LegalStatus.Unknown
    };

    public static FurnitureStatus FurnitureFromText(string? text) => Normalize(text) switch
    {
        "full" or "đầy đủ" => FurnitureStatus.Full,
        "basic" or "cơ bản" => FurnitureStatus.Basic,
        "luxury" or "cao cấp" => FurnitureStatus.Luxury,
        _ => FurnitureStatus.None
    };

    private static string Normalize(string? text) => (text ?? string.Empty).Trim().ToLowerInvariant();
}
