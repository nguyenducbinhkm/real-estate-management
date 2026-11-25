using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Services;
using RealEstateHub.Application.Validators;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Tests.Application;

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
    public async Task UpdateProfileTrimsValuesAndClearsEmptyAvatar()
    {
        var user = SampleUser();
        user.AvatarUrl = "https://example.com/old.png";
        var repo = new FakeUserRepository(user);
        var service = new AccountService(repo, new FakeHasher());

        var profile = await service.UpdateProfileAsync(user.Id, new UpdateProfileRequest("  Nguyễn Văn A ", " 0912345678 ", "  "));

        Assert.Equal("Nguyễn Văn A", profile.FullName);
        Assert.Equal("0912345678", profile.Phone);
        Assert.Null(profile.AvatarUrl);
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
    [InlineData("", "0912345678", null, false)]
    [InlineData("Nguyễn Văn A", "abc", null, false)]
    [InlineData("Nguyễn Văn A", "0912345678", "javascript:alert(1)", false)]
    [InlineData("Nguyễn Văn A", "+84 912 345 678", "https://example.com/a.png", true)]
    [InlineData("Nguyễn Văn A", "0912345678", "", true)]
    public void UpdateProfileValidatorChecksInput(string name, string phone, string? avatar, bool valid)
        => Assert.Equal(valid, new UpdateProfileRequestValidator().Validate(new UpdateProfileRequest(name, phone, avatar)).IsValid);

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
