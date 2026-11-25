using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;

namespace RealEstateHub.Application.Interfaces;

/// <summary>Yêu cầu liên hệ: khách gửi, người bán quản lý (Quản lý khách hàng).</summary>
public interface IContactRequestService
{
    Task<ContactRequestDto> SendAsync(Guid? senderId, CreateContactRequest request, CancellationToken ct = default);
    Task<IReadOnlyCollection<ContactRequestDto>> GetForSellerAsync(Guid sellerId, ContactRequestQuery query, CancellationToken ct = default);
    Task<ContactRequestDto> UpdateStatusAsync(Guid sellerId, Guid id, UpdateContactStatusRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid sellerId, Guid id, CancellationToken ct = default);
}

/// <summary>Số liệu cho trang Tổng quan và Quản lý tin đăng của người bán.</summary>
public interface ISellerService
{
    Task<SellerDashboardDto> GetDashboardAsync(Guid sellerId, CancellationToken ct = default);
    Task<IReadOnlyCollection<SellerListingDto>> GetListingsAsync(Guid sellerId, CancellationToken ct = default);
}
