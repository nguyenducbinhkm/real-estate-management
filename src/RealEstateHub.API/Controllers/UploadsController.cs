using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstateHub.Application.Exceptions;
using RealEstateHub.Application.Interfaces;
using RealEstateHub.Application.Services;

namespace RealEstateHub.API.Controllers;

[ApiController]
[Authorize]
[Route("api/uploads")]
public class UploadsController : ControllerBase
{
    private readonly IImageUploadService _uploads;

    public UploadsController(IImageUploadService uploads) => _uploads = uploads;

    /// <summary>Tải 1 ảnh tin đăng (multipart/form-data, trường "file"). Trả về { url }.</summary>
    [HttpPost("images")]
    [RequestSizeLimit(ImageUploadService.MaxBytes + 64 * 1024)]
    public async Task<IActionResult> UploadImage(IFormFile? file, CancellationToken ct)
    {
        if (file is null)
            throw new AppException(400, "INVALID_IMAGE", "Chưa chọn ảnh.");
        await using var stream = file.OpenReadStream();
        var result = await _uploads.UploadListingImageAsync(User.GetUserId(), stream, file.Length, ct);
        return Created(result.Url, result);
    }
}
