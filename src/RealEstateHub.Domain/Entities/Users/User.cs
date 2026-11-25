using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Domain.Entities.Users;

public abstract class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool IsVerified { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public List<RefreshToken> RefreshTokens { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public abstract bool CanPostListing();
    public abstract UserRole GetRole();

    public virtual int GetMaxListings()
        => 0;

    /// <summary>Đặt ảnh đại diện mới. Thêm "?v=..." để trình duyệt không dùng lại ảnh cũ đã lưu đệm (file được ghi đè cùng đường dẫn).</summary>
    public void ChangeAvatar(string publicUrl, DateTime nowUtc)
    {
        if (string.IsNullOrWhiteSpace(publicUrl))
            throw new ArgumentException("Đường dẫn ảnh không hợp lệ.", nameof(publicUrl));
        AvatarUrl = $"{publicUrl}?v={nowUtc.Ticks}";
        UpdatedAt = nowUtc;
    }

    public void RemoveAvatar(DateTime nowUtc)
    {
        AvatarUrl = null;
        UpdatedAt = nowUtc;
    }

    /// <summary>Tạo đối tượng rỗng theo vai trò – dùng để hỏi quy tắc của vai trò (được đăng tin không, tối đa bao nhiêu tin).</summary>
    public static User ForRole(UserRole role) => role switch
    {
        UserRole.Buyer => new Buyer(),
        UserRole.Seller => new Seller(),
        UserRole.Agent => new AgentSeller(),
        UserRole.Admin => new Admin(),
        _ => throw new ArgumentOutOfRangeException(nameof(role), role, null)
    };
}
