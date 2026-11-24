using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstateHub.Domain.Entities.Locations;

namespace RealEstateHub.Infrastructure.Data.Configurations;

public class ProvinceConfiguration : IEntityTypeConfiguration<Province>
{
    public void Configure(EntityTypeBuilder<Province> builder)
    {
        builder.ToTable("Provinces");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("ProvinceId");
        builder.Property(p => p.Code).HasColumnName("ProvinceCode").HasMaxLength(20);
        builder.Property(p => p.Name).HasColumnName("ProvinceName").HasMaxLength(100);
        builder.HasMany(p => p.Districts).WithOne(d => d.Province).HasForeignKey(d => d.ProvinceId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class DistrictConfiguration : IEntityTypeConfiguration<District>
{
    public void Configure(EntityTypeBuilder<District> builder)
    {
        builder.ToTable("Districts");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnName("DistrictId");
        builder.Property(d => d.Code).HasColumnName("DistrictCode").HasMaxLength(20);
        builder.Property(d => d.Name).HasColumnName("DistrictName").HasMaxLength(100);
        builder.HasMany(d => d.Wards).WithOne(w => w.District).HasForeignKey(w => w.DistrictId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class WardConfiguration : IEntityTypeConfiguration<Ward>
{
    public void Configure(EntityTypeBuilder<Ward> builder)
    {
        builder.ToTable("Wards");
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).HasColumnName("WardId");
        builder.Property(w => w.Code).HasColumnName("WardCode").HasMaxLength(20);
        builder.Property(w => w.Name).HasColumnName("WardName").HasMaxLength(100);
    }
}
