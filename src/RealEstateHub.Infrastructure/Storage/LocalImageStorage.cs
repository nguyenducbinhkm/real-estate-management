using RealEstateHub.Application.Interfaces;

namespace RealEstateHub.Infrastructure.Storage;

/// <summary>Lưu ảnh vào thư mục wwwroot/uploads/listings của API; tên file là GUID ngẫu nhiên.</summary>
public class LocalImageStorage : IImageStorage
{
    private const string PublicFolder = "uploads/listings";
    private readonly string _webRoot;

    public LocalImageStorage(string webRoot) => _webRoot = webRoot;

    public async Task<string> SaveListingImageAsync(Stream content, string extension, CancellationToken ct = default)
    {
        var folder = Path.Combine(_webRoot, "uploads", "listings");
        Directory.CreateDirectory(folder);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        await using (var file = File.Create(Path.Combine(folder, fileName)))
            await content.CopyToAsync(file, ct);
        return $"/{PublicFolder}/{fileName}";
    }
}
