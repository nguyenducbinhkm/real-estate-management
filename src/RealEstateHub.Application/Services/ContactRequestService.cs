using RealEstateHub.Application.DTOs.Request;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.Enums;

namespace RealEstateHub.Application.Services;

public class ContactRequestService : IContactRequestService
{
    private readonly IContactRequestRepository _requests;
    private readonly IListingRepository _listings;

    public ContactRequestService(IContactRequestRepository requests, IListingRepository listings)
    {
        _requests = requests;
        _listings = listings;
    }

    public async Task<ContactRequestDto> SendAsync(Guid? senderId, CreateContactRequest request, CancellationToken ct = default)
    {
        var listing = await _listings.GetByIdAsync(request.PropertyId, ct)
            ?? throw new NotFoundException("Tin đăng không tồn tại.");

        if (listing.Status is PropertyStatus.Sold or PropertyStatus.Rented)
            throw new AppException(422, "LISTING_CLOSED", "Tin này đã giao dịch xong nên không nhận liên hệ nữa.");
        if (senderId.HasValue && senderId.Value == listing.OwnerId)
            throw new AppException(422, "OWN_LISTING", "Bạn không thể gửi liên hệ cho tin của chính mình.");

        var contact = new ContactRequest
        {
            PropertyId = listing.Id,
            Property = listing,
            ProjectId = listing.ProjectId,
            SenderId = senderId,
            ReceiverId = listing.OwnerId,
            SenderName = request.SenderName.Trim(),
            SenderPhone = request.SenderPhone.Trim(),
            SenderEmail = string.IsNullOrWhiteSpace(request.SenderEmail) ? null : request.SenderEmail.Trim(),
            Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message.Trim(),
            Status = ContactRequestStatus.New,
            CreatedAt = DateTime.UtcNow,
        };
        await _requests.AddAsync(contact, ct);
        return SellerMappings.ToDto(contact);
    }

    public async Task<IReadOnlyCollection<ContactRequestDto>> GetForSellerAsync(Guid sellerId, ContactRequestQuery query, CancellationToken ct = default)
    {
        IEnumerable<ContactRequest> items = await _requests.GetForReceiverAsync(sellerId, ct);
        if (query.Status.HasValue)
            items = items.Where(c => c.Status == query.Status.Value);

        var keyword = query.Keyword?.Trim();
        if (!string.IsNullOrEmpty(keyword))
        {
            items = items.Where(c =>
                Contains(c.SenderName, keyword) || Contains(c.SenderPhone, keyword) ||
                Contains(c.SenderEmail, keyword) || Contains(c.Property?.Title, keyword) || Contains(c.Message, keyword));
        }

        return items.Select(SellerMappings.ToDto).ToArray();
    }

    public async Task<ContactRequestDto> UpdateStatusAsync(Guid sellerId, Guid id, UpdateContactStatusRequest request, CancellationToken ct = default)
    {
        var contact = await LoadOwnedAsync(sellerId, id, ct);
        contact.MoveTo(request.Status);
        await _requests.UpdateAsync(contact, ct);
        return SellerMappings.ToDto(contact);
    }

    public async Task DeleteAsync(Guid sellerId, Guid id, CancellationToken ct = default)
        => await _requests.DeleteAsync(await LoadOwnedAsync(sellerId, id, ct), ct);

    // Yêu cầu của người bán khác cũng trả 404 để không lộ thông tin khách hàng.
    private async Task<ContactRequest> LoadOwnedAsync(Guid sellerId, Guid id, CancellationToken ct)
    {
        var contact = await _requests.GetByIdAsync(id, ct);
        if (contact is null || contact.ReceiverId != sellerId)
            throw new NotFoundException("Không tìm thấy yêu cầu liên hệ.");
        return contact;
    }

    private static bool Contains(string? text, string keyword)
        => text is not null && text.Contains(keyword, StringComparison.OrdinalIgnoreCase);
}
