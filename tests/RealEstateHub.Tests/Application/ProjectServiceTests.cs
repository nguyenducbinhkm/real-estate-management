using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Application.Services;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Domain.Entities.Projects;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;
using RealEstateHub.Domain.ValueObjects;

namespace RealEstateHub.Tests.Application;

public class ProjectServiceTests
{
    private static Project SampleProject()
    {
        var ward = new Ward
        {
            Code = "00001",
            Name = "Phường Phúc Xá",
            District = new District { Code = "001", Name = "Quận Ba Đình", Province = new Province { Code = "01", Name = "Thành phố Hà Nội" } }
        };
        var project = new Project
        {
            Name = "Dự án mẫu",
            Developer = "Chủ đầu tư mẫu",
            Description = "Mô tả",
            Ward = ward,
            StreetAddress = "Đường A",
            Status = ProjectStatus.Selling,
            MinPrice = new Money { Amount = 2_000_000_000 },
            MaxPrice = new Money { Amount = 5_000_000_000 },
            IsFeatured = true
        };
        project.Phases.Add(new ProjectPhase { Name = "Giai đoạn 2", SortOrder = 2, StartingPrice = 3_000_000_000 });
        project.Phases.Add(new ProjectPhase { Name = "Giai đoạn 1", SortOrder = 1, StartingPrice = 2_000_000_000 });
        return project;
    }

    [Fact]
    public async Task SearchNormalizesQueryAndMapsAddressAndCounts()
    {
        var repo = new FakeProjectRepository(SampleProject(), listingCount: 7);
        var service = new ProjectService(repo, new FakeListingRepository());

        var result = await service.SearchAsync(new ProjectQuery
        {
            Keyword = "  mẫu  ",
            MinPrice = 9, MaxPrice = 1,
            Sort = "PRICEASC",
            Page = 0, PageSize = 500
        });

        Assert.Equal("mẫu", repo.LastQuery!.Keyword);
        Assert.Equal(1, repo.LastQuery.MinPrice);
        Assert.Equal(9, repo.LastQuery.MaxPrice);
        Assert.Equal("priceAsc", repo.LastQuery.Sort);
        Assert.Equal(1, result.Page);
        Assert.Equal(50, result.PageSize);

        var dto = Assert.Single(result.Items);
        Assert.Equal("01", dto.ProvinceCode);
        Assert.Equal("Quận Ba Đình", dto.DistrictName);
        Assert.Equal(7, dto.ListingCount);
        Assert.Equal(2, dto.PhaseCount);
        Assert.Equal(ProjectStatus.Selling, dto.Status);
    }

    [Fact]
    public async Task DetailOrdersPhases()
    {
        var service = new ProjectService(new FakeProjectRepository(SampleProject(), 0), new FakeListingRepository());

        var dto = await service.GetByIdAsync(Guid.NewGuid());

        Assert.Equal(new[] { "Giai đoạn 1", "Giai đoạn 2" }, dto.Phases.Select(p => p.Name));
        Assert.Equal("Mô tả", dto.Description);
    }

    [Fact]
    public async Task MissingProjectThrowsNotFound()
    {
        var service = new ProjectService(new FakeProjectRepository(null, 0), new FakeListingRepository());

        await Assert.ThrowsAsync<NotFoundException>(() => service.GetByIdAsync(Guid.NewGuid()));
        await Assert.ThrowsAsync<NotFoundException>(() => service.GetListingsAsync(Guid.NewGuid(), 1, 10));
    }

    private sealed class FakeProjectRepository : IProjectRepository
    {
        private readonly Project? _project;
        private readonly int _listingCount;
        public ProjectQuery? LastQuery { get; private set; }

        public FakeProjectRepository(Project? project, int listingCount)
        {
            _project = project;
            _listingCount = listingCount;
        }

        public Task<(IReadOnlyCollection<ProjectWithStats> Items, int Total)> SearchAsync(ProjectQuery query, CancellationToken ct = default)
        {
            LastQuery = query;
            IReadOnlyCollection<ProjectWithStats> items = _project is null ? Array.Empty<ProjectWithStats>() : new[] { new ProjectWithStats(_project, _listingCount) };
            return Task.FromResult((items, items.Count));
        }

        public Task<ProjectWithStats?> GetByIdAsync(Guid id, CancellationToken ct = default)
            => Task.FromResult(_project is null ? null : new ProjectWithStats(_project, _listingCount));

        public Task<IReadOnlyCollection<ProjectWithStats>> GetRelatedAsync(Project project, int limit, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyCollection<ProjectWithStats>>(Array.Empty<ProjectWithStats>());

        public Task<IReadOnlyCollection<ProjectProvinceDto>> GetProvincesAsync(CancellationToken ct = default)
            => Task.FromResult<IReadOnlyCollection<ProjectProvinceDto>>(Array.Empty<ProjectProvinceDto>());
    }

    private sealed class FakeListingRepository : IListingRepository
    {
        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(ListingQuery query, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(SearchCriteria criteria, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<IReadOnlyCollection<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default) => throw new NotImplementedException();
        public Task<(IReadOnlyCollection<Property> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default)
            => Task.FromResult<(IReadOnlyCollection<Property>, int)>((Array.Empty<Property>(), 0));
        public Task<Property> AddAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
        public Task UpdateAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
        public Task DeleteAsync(Property listing, CancellationToken ct = default) => throw new NotImplementedException();
    }
}
