using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Services;
using RealEstateHub.Application.Validators;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.UnitTests.Application;

public class AccountServiceTests
{
    private static Seller SampleUser() => new()
    {
        Email = "seller@example.com",
        Phone = "0900000000",
        FullName = "Người bán",
        PasswordHash = "hash:old-password",
    };

    [Fact]
    public async Task GetProfileReturnsRoleAndListingQuota()
    {
        var user = SampleUser();
        var service = new AccountService(new FakeUserRepository(user), new FakeHasher());

        var profile = await service.GetProfileAsync(user.Id);

        Assert.Equal("seller@example.com", profile.Email);
        Assert.Equal("Seller", profile.Role);
        Assert.True(profile.CanPostListing);
        Assert.Equal(user.GetMaxListings(), profile.MaxListings);
    }

    [Fact]
    public async Task UpdateProfileTrimsValuesAndKeepsAvatar()
    {
        var user = SampleUser();
        user.AvatarUrl = "https://example.com/old.png";
        var repo = new FakeUserRepository(user);
        var service = new AccountService(repo, new FakeHasher());

        var profile = await service.UpdateProfileAsync(user.Id, new UpdateProfileRequest("  Nguyễn Văn A ", " 0912345678 "));

        Assert.Equal("Nguyễn Văn A", profile.FullName);
        Assert.Equal("0912345678", profile.Phone);
        Assert.Equal("https://example.com/old.png", profile.AvatarUrl); // ảnh chỉ đổi qua tải file
        Assert.Equal("seller@example.com", profile.Email);
        Assert.Equal(1, repo.UpdateCount);
    }

    [Fact]
    public async Task ChangePasswordStoresNewHashWhenCurrentPasswordMatches()
    {
        var user = SampleUser();
        var repo = new FakeUserRepository(user);
        var service = new AccountService(repo, new FakeHasher());

        await service.ChangePasswordAsync(user.Id, new ChangePasswordRequest("old-password", "new-password-123"));

        Assert.Equal("hash:new-password-123", user.PasswordHash);
        Assert.Equal(1, repo.UpdateCount);
    }

    [Fact]
    public async Task ChangePasswordRejectsWrongCurrentPasswordWith400()
    {
        var user = SampleUser();
        var repo = new FakeUserRepository(user);
        var service = new AccountService(repo, new FakeHasher());

        var error = await Assert.ThrowsAsync<AppException>(() =>
            service.ChangePasswordAsync(user.Id, new ChangePasswordRequest("wrong", "new-password-123")));

        // Không dùng 401 vì frontend coi 401 là hết phiên và tự đăng xuất.
        Assert.Equal(400, error.StatusCode);
        Assert.Equal("hash:old-password", user.PasswordHash);
        Assert.Equal(0, repo.UpdateCount);
    }

    [Fact]
    public async Task MissingUserThrowsNotFound()
    {
        var service = new AccountService(new FakeUserRepository(null), new FakeHasher());
        await Assert.ThrowsAsync<NotFoundException>(() => service.GetProfileAsync(Guid.NewGuid()));
    }

    [Theory]
    [InlineData("", "0912345678", false)]
    [InlineData("Nguyễn Văn A", "abc", false)]
    [InlineData("Nguyễn Văn A", "+84 912 345 678", true)]
    [InlineData("Nguyễn Văn A", "0912345678", true)]
    public void UpdateProfileValidatorChecksInput(string name, string phone, bool valid)
        => Assert.Equal(valid, new UpdateProfileRequestValidator().Validate(new UpdateProfileRequest(name, phone)).IsValid);

    /* ------------------------------- Ảnh đại diện ------------------------------- */

    private static readonly byte[] Jpeg = { 0xFF, 0xD8, 0xFF, 0xE0, 1, 2, 3, 4 };
    private static readonly byte[] Png = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0 };

    [Fact]
    public async Task UploadAvatarStoresUnderUserAndOverwritesOnChange()
    {
        var user = SampleUser();
        var storage = new FakeAvatarStorage();
        var service = new AccountService(new FakeUserRepository(user), new FakeHasher(), storage);

        var first = await service.UploadAvatarAsync(user.Id, new MemoryStream(Jpeg), Jpeg.Length);
        var second = await service.UploadAvatarAsync(user.Id, new MemoryStream(Png), Png.Length);

        Assert.Single(storage.Files);                                  // cùng 1 file cho mỗi người dùng → ghi đè
        Assert.Equal("image/png", storage.Files[user.Id].ContentType);  // định dạng lấy từ nội dung file
        Assert.StartsWith($"https://store/avatars/{user.Id}?v=", second.AvatarUrl);
        Assert.NotEqual(first.AvatarUrl, second.AvatarUrl);            // ?v= mới để trình duyệt tải ảnh mới
    }

    [Fact]
    public async Task UploadAvatarRejectsNonImagesAndLargeFiles()
    {
        var user = SampleUser();
        var storage = new FakeAvatarStorage();
        var service = new AccountService(new FakeUserRepository(user), new FakeHasher(), storage);

        var html = "<svg onload=alert(1)>"u8.ToArray();
        Assert.Equal("INVALID_IMAGE", (await Assert.ThrowsAsync<AppException>(() => service.UploadAvatarAsync(user.Id, new MemoryStream(html), html.Length))).ErrorCode);
        Assert.Equal("IMAGE_TOO_LARGE", (await Assert.ThrowsAsync<AppException>(() => service.UploadAvatarAsync(user.Id, new MemoryStream(Jpeg), AccountService.MaxAvatarBytes + 1))).ErrorCode);
        Assert.Empty(storage.Files);
        Assert.Null(user.AvatarUrl);
    }

    [Fact]
    public async Task RemoveAvatarDeletesFileAndClearsUrl()
    {
        var user = SampleUser();
        var storage = new FakeAvatarStorage();
        var service = new AccountService(new FakeUserRepository(user), new FakeHasher(), storage);
        await service.UploadAvatarAsync(user.Id, new MemoryStream(Jpeg), Jpeg.Length);

        var profile = await service.RemoveAvatarAsync(user.Id);

        Assert.Null(profile.AvatarUrl);
        Assert.Empty(storage.Files);
    }

    [Fact]
    public async Task AvatarRequiresConfiguredStorage()
    {
        var user = SampleUser();
        var service = new AccountService(new FakeUserRepository(user), new FakeHasher(), new FakeAvatarStorage { IsConfigured = false });
        var error = await Assert.ThrowsAsync<AppException>(() => service.UploadAvatarAsync(user.Id, new MemoryStream(Jpeg), Jpeg.Length));
        Assert.Equal("STORAGE_NOT_CONFIGURED", error.ErrorCode);
    }

    private sealed class FakeAvatarStorage : IAvatarStorage
    {
        public bool IsConfigured { get; init; } = true;
        public Dictionary<Guid, (byte[] Bytes, string ContentType)> Files { get; } = new();

        public async Task<string> UploadAsync(Guid userId, Stream content, string contentType, CancellationToken ct = default)
        {
            using var copy = new MemoryStream();
            await content.CopyToAsync(copy, ct);
            Files[userId] = (copy.ToArray(), contentType);
            return $"https://store/avatars/{userId}";
        }

        public Task DeleteAsync(Guid userId, CancellationToken ct = default)
        {
            Files.Remove(userId);
            return Task.CompletedTask;
        }
    }

    [Fact]
    public void ChangePasswordValidatorRequiresDifferentLongPassword()
    {
        var validator = new ChangePasswordRequestValidator();
        Assert.False(validator.Validate(new ChangePasswordRequest("old-password", "short")).IsValid);
        Assert.False(validator.Validate(new ChangePasswordRequest("same-password", "same-password")).IsValid);
        Assert.True(validator.Validate(new ChangePasswordRequest("old-password", "new-password-123")).IsValid);
    }

    private sealed class FakeHasher : IPasswordHasher
    {
        public string Hash(string password) => $"hash:{password}";
        public bool Verify(string password, string passwordHash) => passwordHash == $"hash:{password}";
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        private readonly User? _user;
        public int UpdateCount { get; private set; }

        public FakeUserRepository(User? user) => _user = user;

        public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(_user is not null && _user.Id == id ? _user : null);
        public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) => Task.FromResult<User?>(null);
        public Task<User> AddAsync(User user, CancellationToken ct = default) => Task.FromResult(user);
        public Task UpdateAsync(User user, CancellationToken ct = default)
        {
            UpdateCount++;
            return Task.CompletedTask;
        }
        public Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default) => Task.FromResult<RefreshToken?>(null);
        public Task AddRefreshTokenAsync(RefreshToken token, CancellationToken ct = default) => Task.CompletedTask;
    }
}
