using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstateHub.Application.DTOs.Response;
using RealEstateHub.Application.Interfaces;

namespace RealEstateHub.API.Controllers;

/// <summary>Danh mục địa giới hành chính cho ô chọn Tỉnh → Quận → Phường.</summary>
[ApiController]
[AllowAnonymous]
[Route("api/locations")]
public class LocationsController : ControllerBase
{
    private readonly ILocationRepository _locations;

    public LocationsController(ILocationRepository locations) => _locations = locations;

    [HttpGet("provinces")]
    [ResponseCache(Duration = 3600)]
    public async Task<IActionResult> Provinces(CancellationToken ct)
        => Ok((await _locations.GetProvincesAsync(ct)).Select(p => new LocationOptionDto(p.Code, p.Name)));

    [HttpGet("provinces/{provinceCode}/districts")]
    [ResponseCache(Duration = 3600)]
    public async Task<IActionResult> Districts(string provinceCode, CancellationToken ct)
        => Ok((await _locations.GetDistrictsAsync(provinceCode, ct)).Select(d => new LocationOptionDto(d.Code, d.Name)));

    [HttpGet("districts/{districtCode}/wards")]
    [ResponseCache(Duration = 3600)]
    public async Task<IActionResult> Wards(string districtCode, CancellationToken ct)
        => Ok((await _locations.GetWardsAsync(districtCode, ct)).Select(w => new LocationOptionDto(w.Code, w.Name)));
}
