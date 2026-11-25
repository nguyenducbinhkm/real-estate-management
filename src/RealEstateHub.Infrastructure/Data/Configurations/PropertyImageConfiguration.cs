using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstateHub.Domain.Entities.Properties;

namespace RealEstateHub.Infrastructure.Data.Configurations;

public class PropertyImageConfiguration : IEntityTypeConfiguration<PropertyImage>
{
    public void Configure(EntityTypeBuilder<PropertyImage> builder)
    {
        builder.ToTable("PropertyImages");
        builder.HasKey(i => i.Id);
        // Id do ứng dụng sinh (Guid.NewGuid) → ảnh mới thêm vào tin đã có phải được INSERT, không bị hiểu nhầm là bản ghi cũ cần UPDATE.
        builder.Property(i => i.Id).HasColumnName("PropertyImageId").ValueGeneratedNever();
        builder.Property(i => i.Url).HasMaxLength(1000).IsRequired();
        builder.Property(i => i.Caption).HasMaxLength(500);
        builder.Ignore(i => i.IsPrimary);
        builder.Ignore(i => i.CreatedAt);
    }
}
