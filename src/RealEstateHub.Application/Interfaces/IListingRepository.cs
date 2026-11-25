using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.Patterns.Builder;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Interfaces;

public interface IListingRepository
{
    Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(ListingQuery query, CancellationToken ct = default);
    Task<(IReadOnlyCollection<Property> Items, int Total)> SearchAsync(SearchCriteria criteria, CancellationToken ct = default);
    Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyCollection<Property>> GetByOwnerAsync(Guid ownerId, CancellationToken ct = default);
    /// <summary>Số lượt lưu tin (SavedListings) của từng tin thuộc người bán: PropertyId → số lượt.</summary>
    Task<IReadOnlyDictionary<Guid, int>> GetSaveCountsAsync(Guid ownerId, CancellationToken ct = default);
    Task<(IReadOnlyCollection<Property> Items, int Total)> GetByProjectAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default);
    /// <summary>Tin cho admin kiểm duyệt (kèm chủ tin), lọc theo trạng thái nếu có, mới nhất trước.</summary>
    Task<IReadOnlyCollection<Property>> GetForModerationAsync(PropertyStatus? status, CancellationToken ct = default);
    /// <summary>Số tin theo từng trạng thái trên toàn hệ thống.</summary>
    Task<IReadOnlyDictionary<PropertyStatus, int>> CountByStatusAsync(CancellationToken ct = default);
    Task<Property> AddAsync(Property listing, CancellationToken ct = default);
    Task UpdateAsync(Property listing, CancellationToken ct = default);
    Task DeleteAsync(Property listing, CancellationToken ct = default);
}
