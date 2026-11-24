using RealEstateHub.Domain.Entities.Locations;

namespace RealEstateHub.Application.Interfaces;

public interface ILocationRepository
{
    /// <summary>Tìm phường/xã theo mã, nạp kèm quận/huyện và tỉnh/thành.</summary>
    Task<Ward?> FindWardAsync(string wardCode, CancellationToken ct = default);
}
