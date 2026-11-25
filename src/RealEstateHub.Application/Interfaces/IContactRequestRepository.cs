using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Application.Interfaces;

public interface IContactRequestRepository
{
    Task<ContactRequest> AddAsync(ContactRequest request, CancellationToken ct = default);
    Task<ContactRequest?> GetByIdAsync(Guid id, CancellationToken ct = default);
    /// <summary>Mọi yêu cầu người bán nhận được (kèm tin liên quan), mới nhất trước.</summary>
    Task<IReadOnlyCollection<ContactRequest>> GetForReceiverAsync(Guid receiverId, CancellationToken ct = default);
    Task UpdateAsync(ContactRequest request, CancellationToken ct = default);
    Task DeleteAsync(ContactRequest request, CancellationToken ct = default);
}
