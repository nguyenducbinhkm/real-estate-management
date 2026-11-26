namespace RealEstateHub.Domain.ValueObjects;

/// <summary>Tiện ích số điện thoại Việt Nam: chuẩn hoá, che số khi hiển thị công khai, tạo liên kết Zalo.</summary>
public static class PhoneNumber
{
    /// <summary>Bỏ khoảng trắng/dấu chấm; chuỗi rỗng → null.</summary>
    public static string? Normalize(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return null;
        var compact = new string(phone.Where(c => char.IsDigit(c) || c == '+').ToArray());
        return compact.Length == 0 ? null : compact;
    }

    /// <summary>Chỉ còn chữ số, đổi +84 thành 0 (dạng zalo.me/0xxxxxxxxx).</summary>
    public static string? Digits(string? phone)
    {
        var normalized = Normalize(phone);
        if (normalized is null) return null;
        var digits = new string(normalized.Where(char.IsDigit).ToArray());
        if (normalized.StartsWith("+84", StringComparison.Ordinal)) digits = "0" + digits[2..];
        return digits.Length == 0 ? null : digits;
    }

    /// <summary>"0335834123" → "0335 834 ***" (giữ 7 số đầu, che phần còn lại).</summary>
    public static string? Mask(string? phone)
    {
        var digits = Digits(phone);
        if (digits is null) return null;
        if (digits.Length <= 4) return new string('*', digits.Length);
        var head = digits.Length > 7 ? digits[..7] : digits[..^3];
        var grouped = head.Length > 4 ? $"{head[..4]} {head[4..]}" : head;
        return $"{grouped} ***";
    }

    /// <summary>Liên kết mở cuộc trò chuyện Zalo (máy tính: trang zalo.me mở app/web; điện thoại: mở thẳng app Zalo).</summary>
    public static string? ZaloLink(string? phone)
        => Digits(phone) is { } digits ? $"https://zalo.me/{digits}" : null;
}
