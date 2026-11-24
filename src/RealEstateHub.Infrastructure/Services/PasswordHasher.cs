using System.Security.Cryptography;
using RealEstateHub.Application.Interfaces;

namespace RealEstateHub.Infrastructure.Services;

/// <summary>
/// Mật khẩu mới được băm bằng PBKDF2. Vẫn xác thực được mật khẩu cũ băm bằng BCrypt
/// (dạng "$2a$…", có sẵn trong database RealEstateHubDb).
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;

    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, HashSize);
        return $"PBKDF2:{Iterations}:{Convert.ToHexString(salt)}:{Convert.ToHexString(hash)}";
    }

    public bool Verify(string password, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash)) return false;
        if (passwordHash.StartsWith("$2", StringComparison.Ordinal)) return VerifyBcrypt(password, passwordHash);

        var parts = passwordHash.Split(':');
        if (parts.Length != 4 || parts[0] != "PBKDF2") return false;
        if (!int.TryParse(parts[1], out var iterations)) return false;
        try
        {
            var salt = Convert.FromHexString(parts[2]);
            var expected = Convert.FromHexString(parts[3]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch
        {
            return false;
        }
    }

    private static bool VerifyBcrypt(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            return false;
        }
    }
}
