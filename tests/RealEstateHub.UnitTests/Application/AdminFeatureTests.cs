using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Services;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;
using RealEstateHub.Infrastructure.Services;

namespace RealEstateHub.UnitTests.Application;

/// <summary>Tài khoản admin khai báo trong file, quản lý người dùng và gỡ tin.</summary>
public class AdminFeatureTests
{
    private readonly PasswordHasher _hasher = new();

    private static AdminAccountEntry Entry(string email, string password = "MatKhauAdmin1!", string? name = "Quản trị A")
        => new() { Email = email, Password = password, FullName = name, Phone = "0911111111" };

    /* --------------------------- Đồng bộ admin từ file --------------------------- */

    [Fact]
    public async Task NewEmailInFileCreatesAdminThatCanLogIn()
    {
        var store = new UserStore();
        var sync = new AdminAccountSync(store, store, _hasher);

        var results = await sync.SyncAsync(new[] { Entry("New.Admin@BSRealty.local") });

        var admin = Assert.IsType<Admin>(store.Users.Single());
        Assert.Equal("new.admin@bsrealty.local", admin.Email);
        Assert.True(admin.IsVerified);
        Assert.True(_hasher.Verify("MatKhauAdmin1!", admin.PasswordHash));
        Assert.True(results.Single().Success);
    }

    [Fact]
    public async Task RunningAgainWithSameFileChangesNothing()
    {
        var store = new UserStore();
        var sync = new AdminAccountSync(store, store, _hasher);
        await sync.SyncAsync(new[] { Entry("a@bsrealty.local") });
        var hash = store.Users.Single().PasswordHash;

        var results = await sync.SyncAsync(new[] { Entry("a@bsrealty.local") });

        Assert.Single(store.Users);
        Assert.Equal(hash, store.Users.Single().PasswordHash);
        Assert.Equal("Không thay đổi.", results.Single().Action);
    }

    [Fact]
    public async Task ChangingPasswordInFileUpdatesIt()
    {
        var store = new UserStore();
        var sync = new AdminAccountSync(store, store, _hasher);
        await sync.SyncAsync(new[] { Entry("a@bsrealty.local") });

        await sync.SyncAsync(new[] { Entry("a@bsrealty.local", "MatKhauMoi2024!", "Tên mới") });

        var admin = store.Users.Single();
        Assert.True(_hasher.Verify("MatKhauMoi2024!", admin.PasswordHash));
        Assert.Equal("Tên mới", admin.FullName);
    }

    [Fact]
    public async Task ExistingBuyerEmailIsPromotedToAdmin()
    {
        var store = new UserStore(new Buyer { Email = "buyer@bsrealty.local", FullName = "Người mua", PasswordHash = _hasher.Hash("cu-12345678") });
        var sync = new AdminAccountSync(store, store, _hasher);

        var results = await sync.SyncAsync(new[] { Entry("buyer@bsrealty.local") });

        Assert.IsType<Admin>(store.Users.Single());
        Assert.True(_hasher.Verify("MatKhauAdmin1!", store.Users.Single().PasswordHash));
        Assert.StartsWith("Đã nâng", results.Single().Action);
    }

    [Fact]
    public async Task InvalidOrDuplicateEntriesAreSkipped()
    {
        var store = new UserStore();
        var sync = new AdminAccountSync(store, store, _hasher);

        var results = await sync.SyncAsync(new[]
        {
            Entry("not-an-email"),
            Entry("short@bsrealty.local", "123"),
            Entry("ok@bsrealty.local"),
            Entry("OK@bsrealty.local"),
        });

        Assert.Single(store.Users);
        Assert.Equal(new[] { false, false, true, false }, results.Select(r => r.Success));
    }

    /* --------------------------- Quản lý người dùng --------------------------- */

    [Fact]
    public async Task AdminUpgradesBuyerToSeller()
    {
        var buyer = new Buyer { Email = "b@x.vn", FullName = "B" };
        var store = new UserStore(buyer);
        var service = new AdminService(store, store, new ListingCounts());

        var dto = await service.ChangeUserRoleAsync(Guid.NewGuid(), buyer.Id, UserRole.Seller);

        Assert.Equal("Seller", dto.Role);
        Assert.IsType<Seller>(store.Users.Single());
    }

    [Fact]
    public async Task CannotChangeAdminsSelfOrAssignAdminRole()
    {
        var admin = new Admin { Email = "a@x.vn" };
        var buyer = new Buyer { Email = "b@x.vn" };
        var store = new UserStore(admin, buyer);
        var service = new AdminService(store, store, new ListingCounts());

        Assert.Equal("INVALID_ROLE", (await Assert.ThrowsAsync<AppException>(() => service.ChangeUserRoleAsync(admin.Id, buyer.Id, UserRole.Admin))).ErrorCode);
        Assert.Equal("SELF_ROLE", (await Assert.ThrowsAsync<AppException>(() => service.ChangeUserRoleAsync(buyer.Id, buyer.Id, UserRole.Seller))).ErrorCode);
        Assert.Equal("ADMIN_ROLE", (await Assert.ThrowsAsync<AppException>(() => service.ChangeUserRoleAsync(Guid.NewGuid(), admin.Id, UserRole.Buyer))).ErrorCode);
        await Assert.ThrowsAsync<NotFoundException>(() => service.ChangeUserRoleAsync(admin.Id, Guid.NewGuid(), UserRole.Seller));
    }

    [Fact]
    public async Task DowngradeIsBlockedWhenUserHasTooManyOpenListings()
    {
        var agent = new AgentSeller { Email = "agent@x.vn" };
        var store = new UserStore(agent) { OpenListings = { [agent.Id] = 6 } };
        var service = new AdminService(store, store, new ListingCounts());

        var toSeller = await Assert.ThrowsAsync<AppException>(() => service.ChangeUserRoleAsync(Guid.NewGuid(), agent.Id, UserRole.Seller));
        Assert.Equal("TOO_MANY_LISTINGS", toSeller.ErrorCode);
        await Assert.ThrowsAsync<AppException>(() => service.ChangeUserRoleAsync(Guid.NewGuid(), agent.Id, UserRole.Buyer));

        store.OpenListings[agent.Id] = 5;
        Assert.Equal("Seller", (await service.ChangeUserRoleAsync(Guid.NewGuid(), agent.Id, UserRole.Seller)).Role);
    }

    [Fact]
    public async Task StatsListEveryRoleAndStatus()
    {
        var store = new UserStore(new Buyer(), new Seller(), new Seller());
        var stats = await new AdminService(store, store, new ListingCounts()).GetStatsAsync();

        Assert.Equal(3, stats.TotalUsers);
        Assert.Equal(2, stats.UsersByRole["Seller"]);
        Assert.Equal(0, stats.UsersByRole["Admin"]);
        Assert.Equal(4, stats.TotalListings);
        Assert.Equal(3, stats.ListingsByStatus["Pending"]);
    }

    /* --------------------------- Gỡ tin --------------------------- */

    [Theory]
    [InlineData(PropertyStatus.Active, true)]
    [InlineData(PropertyStatus.Draft, true)]
    [InlineData(PropertyStatus.Pending, false)]
    [InlineData(PropertyStatus.Sold, false)]
    public void TakeDownOnlyAppliesToActiveOrHiddenListings(PropertyStatus from, bool ok)
    {
        var listing = new Apartment { Status = from };
        if (ok)
        {
            listing.TakeDown(DateTime.UtcNow);
            Assert.Equal(PropertyStatus.Rejected, listing.Status);
        }
        else
        {
            Assert.Throws<InvalidOperationException>(() => listing.TakeDown(DateTime.UtcNow));
        }
    }

    [Fact]
    public void RoleRulesComeFromTheUserSubclasses()
    {
        Assert.False(User.ForRole(UserRole.Buyer).CanPostListing());
        Assert.Equal(5, User.ForRole(UserRole.Seller).GetMaxListings());
        Assert.IsType<AgentSeller>(User.ForRole(UserRole.Agent));
    }

    /* --------------------------- Fakes --------------------------- */

    /// <summary>Kho người dùng trong bộ nhớ, đóng vai cả IUserRepository và IAdminRepository.</summary>
    private sealed class UserStore : IUserRepository, IAdminRepository
    {
        public List<User> Users { get; }
        public Dictionary<Guid, int> OpenListings { get; } = new();
        public UserStore(params User[] users) => Users = users.ToList();

        public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) => Task.FromResult(Users.FirstOrDefault(u => u.Id == id));
        public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
            => Task.FromResult(Users.FirstOrDefault(u => string.Equals(u.Email, email.Trim(), StringComparison.OrdinalIgnoreCase)));
        public Task<User> AddAsync(User user, CancellationToken ct = default)
        {
            Users.Add(user);
            return Task.FromResult(user);
        }
        public Task UpdateAsync(User user, CancellationToken ct = default) => Task.CompletedTask;
        public Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default) => Task.FromResult<RefreshToken?>(null);
        public Task AddRefreshTokenAsync(RefreshToken token, CancellationToken ct = default) => Task.CompletedTask;

        public Task<IReadOnlyCollection<User>> SearchUsersAsync(UserRole? role, string? keyword, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyCollection<User>>(Users.Where(u => role is null || u.GetRole() == role).ToList());
        public Task<IReadOnlyDictionary<UserRole, int>> CountUsersByRoleAsync(CancellationToken ct = default)
            => Task.FromResult<IReadOnlyDictionary<UserRole, int>>(Users.GroupBy(u => u.GetRole()).ToDictionary(g => g.Key, g => g.Count()));
        public Task<int> CountUsersCreatedSinceAsync(DateTime sinceUtc, CancellationToken ct = default) => Task.FromResult(Users.Count);
        public Task<int> CountListingsCreatedSinceAsync(DateTime sinceUtc, CancellationToken ct = default) => Task.FromResult(1);
        public Task<IReadOnlyDictionary<Guid, (int Total, int Open)>> CountListingsByOwnerAsync(IEnumerable<Guid> ownerIds, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyDictionary<Guid, (int, int)>>(ownerIds.ToDictionary(id => id, id => (OpenListings.GetValueOrDefault(id), OpenListings.GetValueOrDefault(id))));

        /// <summary>Giống bản thật: thay thực thể bằng đối tượng của vai trò mới, giữ nguyên dữ liệu chung.</summary>
        public Task ChangeRoleAsync(Guid userId, UserRole role, CancellationToken ct = default)
        {
            var old = Users.Single(u => u.Id == userId);
            var replacement = User.ForRole(role);
            replacement.Id = old.Id;
            replacement.Email = old.Email;
            replacement.FullName = old.FullName;
            replacement.Phone = old.Phone;
            replacement.PasswordHash = old.PasswordHash;
            replacement.IsVerified = old.IsVerified;
            replacement.CreatedAt = old.CreatedAt;
            Users[Users.IndexOf(old)] = replacement;
            return Task.CompletedTask;
        }
    }

    private sealed class ListingCounts : IListingRepository
    {
        public Task<IReadOnlyDictionary<PropertyStatus, int>> CountByStatusAsync(CancellationToken ct = default)
            => Task.FromResult<IReadOnlyDictionary<PropertyStatus, int>>(new Dictionary<PropertyStatus, int> { [PropertyStatus.Pending] = 3, [PropertyStatus.Active] = 1 });

        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(ListingQuery query, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(SearchCriteria criteria, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyCollection<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyDictionary<Guid, int>> GetSaveCountsAsync(Guid ownerId, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyCollection<Property>> GetForModerationAsync(PropertyStatus? status, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<Property> AddAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
        public Task UpdateAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
        public Task DeleteAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
    }
}
