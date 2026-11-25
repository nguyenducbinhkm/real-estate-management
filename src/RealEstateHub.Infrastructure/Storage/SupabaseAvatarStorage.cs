using System.Net;
using System.Net.Http.Headers;
using System.Text;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;

namespace RealEstateHub.Infrastructure.Storage;

/// <summary>Cấu hình Supabase Storage, đọc từ SUPABASE_URL / SUPABASE_KEY / SUPABASE_BUCKET (file .env của backend).</summary>
public sealed record SupabaseStorageOptions(string? Url, string? Key, string? Bucket)
{
    public bool IsComplete => !string.IsNullOrWhiteSpace(Url) && !string.IsNullOrWhiteSpace(Key) && !string.IsNullOrWhiteSpace(Bucket);
}

/// <summary>
/// Lưu ảnh đại diện lên Supabase Storage qua REST API. Mỗi người dùng một đối tượng cố định "avatars/{userId}":
/// tải ảnh mới dùng x-upsert nên ghi đè ảnh cũ, không để lại file rác. Bucket cần để chế độ Public để ảnh hiển thị được.
/// Khoá bí mật chỉ dùng ở backend, không bao giờ trả về trình duyệt.
/// </summary>
public class SupabaseAvatarStorage : IAvatarStorage
{
    private readonly HttpClient _http;
    private readonly SupabaseStorageOptions _options;

    public SupabaseAvatarStorage(HttpClient http, SupabaseStorageOptions options)
    {
        _http = http;
        _options = options;
    }

    public bool IsConfigured => _options.IsComplete;

    /// <summary>Chỉ lấy phần gốc https://&lt;project&gt;.supabase.co – chấp nhận cả URL dán kèm đuôi như /rest/v1/.</summary>
    private string BaseUrl => Uri.TryCreate(_options.Url!.Trim(), UriKind.Absolute, out var uri)
        ? uri.GetLeftPart(UriPartial.Authority)
        : _options.Url!.Trim().TrimEnd('/');
    private static string ObjectPath(Guid userId) => $"avatars/{userId:N}";

    public async Task<string> UploadAsync(Guid userId, Stream content, string contentType, CancellationToken ct = default)
    {
        var path = ObjectPath(userId);
        using var request = NewRequest(HttpMethod.Post, $"{BaseUrl}/storage/v1/object/{_options.Bucket}/{path}");
        request.Headers.Add("x-upsert", "true");
        request.Headers.CacheControl = new CacheControlHeaderValue { MaxAge = TimeSpan.FromHours(1) };
        request.Content = new StreamContent(content);
        request.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        using var response = await _http.SendAsync(request, ct);
        await EnsureSuccessAsync(response, "tải ảnh lên", ct);
        return $"{BaseUrl}/storage/v1/object/public/{_options.Bucket}/{path}";
    }

    public async Task DeleteAsync(Guid userId, CancellationToken ct = default)
    {
        using var request = NewRequest(HttpMethod.Delete, $"{BaseUrl}/storage/v1/object/{_options.Bucket}/{ObjectPath(userId)}");
        using var response = await _http.SendAsync(request, ct);
        if (response.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.BadRequest) return; // chưa có ảnh
        await EnsureSuccessAsync(response, "xoá ảnh", ct);
    }

    private HttpRequestMessage NewRequest(HttpMethod method, string url)
    {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Add("apikey", _options.Key);
        // Khoá cũ dạng JWT (eyJ...) gửi kèm Authorization; khoá mới sb_secret_... chỉ cần header apikey.
        if (_options.Key!.StartsWith("eyJ", StringComparison.Ordinal))
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.Key);
        return request;
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, string action, CancellationToken ct)
    {
        if (response.IsSuccessStatusCode) return;
        var body = await response.Content.ReadAsStringAsync(ct);
        if (body.Length > 300) body = body[..300];
        // 502: lỗi từ dịch vụ lưu trữ bên ngoài (không dùng 401 để frontend không hiểu nhầm là hết phiên đăng nhập).
        throw new AppException(502, "STORAGE_ERROR",
            $"Không {action} được lên kho lưu trữ (Supabase trả về {(int)response.StatusCode}). {Sanitize(body)}".Trim());
    }

    private static string Sanitize(string text)
    {
        var sb = new StringBuilder(text.Length);
        foreach (var ch in text) sb.Append(char.IsControl(ch) ? ' ' : ch);
        return sb.ToString();
    }
}
