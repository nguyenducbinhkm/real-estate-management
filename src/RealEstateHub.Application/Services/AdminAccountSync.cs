using System.Net.Mail;
using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Services;

/// <summary>
/// Đồng bộ tài khoản admin từ file admin-accounts.json vào database khi API khởi động:
///  - email chưa có  → tạo tài khoản Admin mới;
///  - email là Admin → cập nhật mật khẩu (nếu đổi), họ tên, SĐT theo file;
///  - email là tài khoản khác (người mua/bán/môi giới) → nâng lên Admin rồi cập nhật như trên.
/// Xoá một dòng khỏi file KHÔNG xoá tài khoản trong database (tránh mất dữ liệu do sửa nhầm file).
/// </summary>
public class AdminAccountSync : IAdminAccountSync
{
    private const int MinPasswordLength = 8;

    private readonly IUserRepository _users;
    private readonly IAdminRepository _admin;
    private readonly IPasswordHasher _hasher;

    public AdminAccountSync(IUserRepository users, IAdminRepository admin, IPasswordHasher hasher)
    {
        _users = users;
        _admin = admin;
        _hasher = hasher;
    }

    public async Task<IReadOnlyList<AdminSyncResult>> SyncAsync(IEnumerable<AdminAccountEntry> entries, CancellationToken ct = default)
    {
        var results = new List<AdminSyncResult>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var entry in entries)
        {
            var email = entry.Email?.Trim().ToLowerInvariant() ?? string.Empty;
            var problem = Validate(entry, email);
            if (problem is not null)
            {
                results.Add(new AdminSyncResult(email == string.Empty ? "(trống)" : email, problem, false));
                continue;
            }
            if (!seen.Add(email))
            {
                results.Add(new AdminSyncResult(email, "Bỏ qua: email bị khai báo trùng trong file.", false));
                continue;
            }

            results.Add(await SyncOneAsync(entry, email, ct));
        }

        return results;
    }

    private async Task<AdminSyncResult> SyncOneAsync(AdminAccountEntry entry, string email, CancellationToken ct)
    {
        var fullName = string.IsNullOrWhiteSpace(entry.FullName) ? "Quản trị viên" : entry.FullName.Trim();
        var phone = entry.Phone?.Trim() ?? string.Empty;
        var user = await _users.GetByEmailAsync(email, ct);

        if (user is null)
        {
            var admin = new Admin
            {
                Email = email,
                FullName = fullName,
                Phone = phone,
                IsVerified = true,
                PasswordHash = _hasher.Hash(entry.Password),
            };
            await _users.AddAsync(admin, ct);
            return new AdminSyncResult(email, "Đã tạo tài khoản admin mới.", true);
        }

        var promoted = false;
        if (user is not Admin)
        {
            await _admin.ChangeRoleAsync(user.Id, UserRole.Admin, ct);
            user = await _users.GetByEmailAsync(email, ct)
                ?? throw new InvalidOperationException($"Không đọc lại được tài khoản {email} sau khi đổi vai trò.");
            promoted = true;
        }

        var changes = new List<string>();
        if (!_hasher.Verify(entry.Password, user.PasswordHash))
        {
            user.PasswordHash = _hasher.Hash(entry.Password);
            changes.Add("mật khẩu");
        }
        if (user.FullName != fullName)
        {
            user.FullName = fullName;
            changes.Add("họ tên");
        }
        if (!string.IsNullOrEmpty(phone) && user.Phone != phone)
        {
            user.Phone = phone;
            changes.Add("SĐT");
        }
        if (!user.IsVerified)
        {
            user.IsVerified = true;
            changes.Add("xác minh");
        }

        if (changes.Count > 0)
        {
            user.UpdatedAt = DateTime.UtcNow;
            await _users.UpdateAsync(user, ct);
        }

        var action = (promoted, changes.Count) switch
        {
            (true, 0) => "Đã nâng tài khoản có sẵn lên admin.",
            (true, _) => $"Đã nâng tài khoản có sẵn lên admin và cập nhật {string.Join(", ", changes)}.",
            (false, 0) => "Không thay đổi.",
            _ => $"Đã cập nhật {string.Join(", ", changes)}."
        };
        return new AdminSyncResult(email, action, true);
    }

    private static string? Validate(AdminAccountEntry entry, string email)
    {
        if (string.IsNullOrEmpty(email)) return "Bỏ qua: thiếu Email.";
        if (!MailAddress.TryCreate(email, out var parsed) || parsed.Address != email) return "Bỏ qua: Email không hợp lệ.";
        if (string.IsNullOrEmpty(entry.Password) || entry.Password.Length < MinPasswordLength)
            return $"Bỏ qua: Password phải có ít nhất {MinPasswordLength} ký tự.";
        return null;
    }
}
