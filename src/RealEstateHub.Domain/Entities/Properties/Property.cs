using RealEstateHub.Domain.Enums;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Domain.Entities.Projects;
using RealEstateHub.Domain.Entities.Users;
using RealEstateHub.Domain.ValueObjects;

namespace RealEstateHub.Domain.Entities.Properties;

public abstract class Property
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Area { get; set; }

    /// <summary>Vị trí lưu theo phường/xã; quận/huyện và tỉnh/thành suy ra từ phường.</summary>
    public Guid WardId { get; set; }
    public Ward? Ward { get; set; }
    public string StreetAddress { get; set; } = string.Empty;

    /// <summary>Địa chỉ đầy đủ (chỉ đọc), cần nạp Ward → District → Province.</summary>
    public Address Address => Address.From(Ward, StreetAddress);

    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    public PropertyStatus Status { get; set; } = PropertyStatus.Draft;
    public abstract TransactionType TransactionType { get; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    /// <summary>Số liên hệ riêng của tin; null = dùng số điện thoại trong hồ sơ người đăng.</summary>
    public string? ContactPhone { get; set; }
    /// <summary>Số Zalo riêng của tin; null = dùng số Zalo trong hồ sơ, rồi tới số liên hệ.</summary>
    public string? ZaloPhone { get; set; }

    /// <summary>Số liên hệ thực tế của tin (cần nạp Owner nếu tin không có số riêng).</summary>
    public string? EffectiveContactPhone
        => PhoneNumber.Normalize(ContactPhone) ?? PhoneNumber.Normalize(Owner?.Phone);

    /// <summary>Số Zalo thực tế: số Zalo của tin → số Zalo hồ sơ → số liên hệ.</summary>
    public string? EffectiveZaloPhone
        => PhoneNumber.Normalize(ZaloPhone) ?? PhoneNumber.Normalize(Owner?.ZaloPhone) ?? EffectiveContactPhone;

    /// <summary>Đặt số liên hệ/Zalo cho tin; để trống thì tin dùng số trong hồ sơ người đăng.</summary>
    public void SetContactPhones(string? contactPhone, string? zaloPhone)
    {
        ContactPhone = PhoneNumber.Normalize(contactPhone);
        ZaloPhone = PhoneNumber.Normalize(zaloPhone);
    }
    public List<PropertyImage> Images { get; set; } = new();
    public PackageType PackageType { get; set; } = PackageType.Free;
    public int BoostScore { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }

    public abstract bool Validate();

    public virtual decimal CalculatePricePerSqm()
        => Area > 0 ? Price / (decimal)Area : 0;

    public virtual string GetSummary()
        => $"{Title} - {Price:N0} VNĐ - {Area}m²";

    /// <summary>Thời gian hiển thị một tin sau khi được duyệt.</summary>
    public const int ListingDurationDays = 30;

    /// <summary>Số ảnh tối đa của một tin.</summary>
    public const int MaxImages = 10;

    /// <summary>Tin chiếm "suất" đăng của chủ tin (chưa giao dịch, chưa hết hạn, không bị từ chối).</summary>
    public bool CountsTowardListingLimit
        => Status is PropertyStatus.Pending or PropertyStatus.Active or PropertyStatus.Draft;

    /// <summary>Admin duyệt tin đang chờ: chuyển sang Đang hiển thị và tính lại hạn hiển thị.</summary>
    public void Approve(DateTime nowUtc)
    {
        if (Status != PropertyStatus.Pending)
            throw new InvalidOperationException("Chỉ duyệt được tin đang chờ duyệt.");
        Status = PropertyStatus.Active;
        ExpiresAt = nowUtc.AddDays(ListingDurationDays);
        UpdatedAt = nowUtc;
    }

    /// <summary>Admin từ chối tin đang chờ duyệt.</summary>
    public void Reject(DateTime nowUtc)
    {
        if (Status != PropertyStatus.Pending)
            throw new InvalidOperationException("Chỉ từ chối được tin đang chờ duyệt.");
        Status = PropertyStatus.Rejected;
        UpdatedAt = nowUtc;
    }

    /// <summary>Admin gỡ tin vi phạm đang hiển thị (hoặc đang ẩn): chuyển sang Bị từ chối; chủ tin có thể sửa rồi gửi duyệt lại.</summary>
    public void TakeDown(DateTime nowUtc)
    {
        if (Status is not (PropertyStatus.Active or PropertyStatus.Draft))
            throw new InvalidOperationException("Chỉ gỡ được tin đang hiển thị hoặc đang ẩn.");
        Status = PropertyStatus.Rejected;
        UpdatedAt = nowUtc;
    }

    /// <summary>
    /// Chủ tin sửa nội dung: tin phải được duyệt lại (về Chờ duyệt), kể cả tin bị từ chối hoặc hết hạn – đây cũng là cách đăng lại.
    /// Tin đã bán / đã cho thuê không sửa được.
    /// </summary>
    public void MarkEditedByOwner(DateTime nowUtc)
    {
        if (Status is PropertyStatus.Sold or PropertyStatus.Rented)
            throw new InvalidOperationException("Tin đã giao dịch, không thể sửa nội dung.");
        Status = PropertyStatus.Pending;
        UpdatedAt = nowUtc;
    }

    /// <summary>Thay toàn bộ ảnh theo thứ tự; ảnh đầu tiên là ảnh đại diện.</summary>
    public void ReplaceImages(IEnumerable<string> urls)
    {
        var list = urls.Where(u => !string.IsNullOrWhiteSpace(u)).Select(u => u.Trim()).Distinct().ToList();
        if (list.Count > MaxImages)
            throw new InvalidOperationException($"Một tin chỉ được tối đa {MaxImages} ảnh.");
        Images.Clear();
        for (var i = 0; i < list.Count; i++)
            Images.Add(new PropertyImage { PropertyId = Id, Url = list[i], SortOrder = i, IsPrimary = i == 0 });
    }

    /// <summary>Tin đã qua ngày hết hạn (ExpiresAt) hoặc mang trạng thái Expired.</summary>
    public bool IsExpired(DateTime nowUtc)
        => Status == PropertyStatus.Expired || (ExpiresAt.HasValue && ExpiresAt.Value <= nowUtc);

    /// <summary>
    /// Chủ tin tự đổi trạng thái: Active (hiện), Draft (ẩn), Sold (đã bán – chỉ tin bán), Rented (đã cho thuê – chỉ tin cho thuê).
    /// Không tự duyệt tin đang chờ duyệt, không mở lại tin bị từ chối hoặc đã hết hạn.
    /// Ném InvalidOperationException (thông báo tiếng Việt) khi không hợp lệ.
    /// </summary>
    public void ChangeStatusByOwner(PropertyStatus target, DateTime nowUtc)
    {
        if (target == Status) return;

        switch (target)
        {
            case PropertyStatus.Draft:
                // Chỉ tin đã được duyệt mới được ẩn; nếu không, Pending -> Draft -> Active sẽ vượt qua bước duyệt.
                if (Status is not (PropertyStatus.Active or PropertyStatus.Sold or PropertyStatus.Rented))
                    throw new InvalidOperationException("Chỉ ẩn được tin đã được duyệt.");
                break;
            case PropertyStatus.Sold when TransactionType != TransactionType.ForSale:
                throw new InvalidOperationException("Chỉ tin bán mới đánh dấu được \"Đã bán\".");
            case PropertyStatus.Rented when TransactionType != TransactionType.ForRent:
                throw new InvalidOperationException("Chỉ tin cho thuê mới đánh dấu được \"Đã cho thuê\".");
            case PropertyStatus.Sold or PropertyStatus.Rented:
                if (Status is PropertyStatus.Pending or PropertyStatus.Rejected)
                    throw new InvalidOperationException("Tin chưa được duyệt nên chưa thể đánh dấu đã giao dịch.");
                break;
            case PropertyStatus.Active:
                if (Status == PropertyStatus.Pending)
                    throw new InvalidOperationException("Tin đang chờ duyệt, chưa thể tự hiển thị.");
                if (Status == PropertyStatus.Rejected)
                    throw new InvalidOperationException("Tin đã bị từ chối, hãy sửa nội dung và đăng lại.");
                if (IsExpired(nowUtc))
                    throw new InvalidOperationException("Tin đã hết hạn, không thể hiển thị lại.");
                break;
            default:
                throw new InvalidOperationException("Trạng thái không hợp lệ. Chỉ được hiện, ẩn hoặc đánh dấu đã giao dịch.");
        }

        Status = target;
        UpdatedAt = nowUtc;
    }
}
