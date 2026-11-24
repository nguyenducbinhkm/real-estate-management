using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Infrastructure.Data.Converters;

namespace RealEstateHub.Infrastructure.Data.Configurations;

/// <summary>
/// Bảng "Properties" của RealEstateHubDb: mọi loại BĐS chung một bảng (TPH, phân biệt bằng cột PropertyType).
/// Các thuộc tính riêng của lớp con được map vào cột dùng chung (Bedrooms, Bathrooms, Floors, LegalStatus, FurnitureState);
/// thuộc tính không có cột trong database thì bỏ qua (Ignore) – giá trị của chúng không được lưu.
/// </summary>
public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.ToTable("Properties");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("PropertyId");

        builder.Property(p => p.Title).HasMaxLength(250).IsRequired();
        builder.Property(p => p.Description).HasColumnType("text");
        builder.Property(p => p.Price).HasPrecision(18, 2).IsRequired();
        builder.Property(p => p.StreetAddress).HasMaxLength(250);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(p => p.PackageType).HasConversion<string>().HasMaxLength(30);
        builder.Ignore(p => p.TransactionType);
        builder.Ignore(p => p.Address);

        builder.HasOne(p => p.Ward).WithMany().HasForeignKey(p => p.WardId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(p => p.Project).WithMany().HasForeignKey(p => p.ProjectId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(p => p.Owner).WithMany().HasForeignKey(p => p.OwnerId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(p => p.Images).WithOne(i => i.Property).HasForeignKey(i => i.PropertyId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class ForSalePropertyConfiguration : IEntityTypeConfiguration<ForSaleProperty>
{
    public void Configure(EntityTypeBuilder<ForSaleProperty> builder)
    {
        builder.Property(p => p.LegalStatus).HasColumnName("LegalStatus").HasConversion(LegacyValueConverters.LegalStatus).HasMaxLength(200);
        builder.Property(p => p.Furniture).HasColumnName("FurnitureState").HasConversion(LegacyValueConverters.Furniture).HasMaxLength(200);
        builder.Ignore(p => p.FloorCount);
    }
}

public class ForRentPropertyConfiguration : IEntityTypeConfiguration<ForRentProperty>
{
    public void Configure(EntityTypeBuilder<ForRentProperty> builder)
    {
        builder.Ignore(p => p.RentalPeriodMonths);
        builder.Ignore(p => p.DepositAmount);
        builder.Ignore(p => p.IncludesUtilities);
    }
}

public class ApartmentConfiguration : IEntityTypeConfiguration<Apartment>
{
    public void Configure(EntityTypeBuilder<Apartment> builder)
    {
        builder.Property(p => p.BedroomCount).HasColumnName("Bedrooms");
        builder.Property(p => p.BathroomCount).HasColumnName("Bathrooms");
        builder.Property(p => p.FloorNumber).HasColumnName("Floors");
        builder.Ignore(p => p.ProjectName);
        builder.Ignore(p => p.Direction);
    }
}

public class HouseConfiguration : IEntityTypeConfiguration<House>
{
    public void Configure(EntityTypeBuilder<House> builder)
    {
        builder.Ignore(p => p.LandArea);
        builder.Ignore(p => p.RoadWidth);
        builder.Ignore(p => p.HouseType);
    }
}

public class VillaConfiguration : IEntityTypeConfiguration<Villa>
{
    public void Configure(EntityTypeBuilder<Villa> builder)
    {
        builder.Property(p => p.BedroomCount).HasColumnName("Bedrooms");
        builder.Property(p => p.BathroomCount).HasColumnName("Bathrooms");
        builder.Ignore(p => p.LandArea);
        builder.Ignore(p => p.GardenArea);
        builder.Ignore(p => p.RoadWidth);
        builder.Ignore(p => p.Direction);
        builder.Ignore(p => p.HasSwimmingPool);
    }
}

public class ShophouseConfiguration : IEntityTypeConfiguration<Shophouse>
{
    public void Configure(EntityTypeBuilder<Shophouse> builder)
    {
        builder.Ignore(p => p.LandArea);
        builder.Ignore(p => p.RoadWidth);
        builder.Ignore(p => p.CommercialFloorCount);
        builder.Ignore(p => p.HasHandoverStandard);
    }
}

public class LandConfiguration : IEntityTypeConfiguration<Land>
{
    public void Configure(EntityTypeBuilder<Land> builder)
    {
        builder.Property(p => p.LegalStatus).HasColumnName("LegalStatus").HasConversion(LegacyValueConverters.LegalStatus).HasMaxLength(200);
        builder.Ignore(p => p.LandType);
        builder.Ignore(p => p.HasClearance);
        builder.Ignore(p => p.RoadWidth);
    }
}

public class RentalApartmentConfiguration : IEntityTypeConfiguration<RentalApartment>
{
    public void Configure(EntityTypeBuilder<RentalApartment> builder)
    {
        builder.Property(p => p.BedroomCount).HasColumnName("Bedrooms");
        builder.Property(p => p.BathroomCount).HasColumnName("Bathrooms");
        builder.Property(p => p.FloorNumber).HasColumnName("Floors");
        builder.Property(p => p.Furniture).HasColumnName("FurnitureState").HasConversion(LegacyValueConverters.Furniture).HasMaxLength(200);
        builder.Ignore(p => p.ProjectName);
        builder.Ignore(p => p.PetsAllowed);
    }
}

public class RentalHouseConfiguration : IEntityTypeConfiguration<RentalHouse>
{
    public void Configure(EntityTypeBuilder<RentalHouse> builder)
    {
        builder.Property(p => p.BedroomCount).HasColumnName("Bedrooms");
        builder.Property(p => p.BathroomCount).HasColumnName("Bathrooms");
        builder.Property(p => p.Furniture).HasColumnName("FurnitureState").HasConversion(LegacyValueConverters.Furniture).HasMaxLength(200);
        builder.Ignore(p => p.LandArea);
        builder.Ignore(p => p.HouseType);
    }
}

public class OfficeConfiguration : IEntityTypeConfiguration<Office>
{
    public void Configure(EntityTypeBuilder<Office> builder)
    {
        builder.Property(p => p.FloorNumber).HasColumnName("Floors");
        builder.Property(p => p.Furniture).HasColumnName("FurnitureState").HasConversion(LegacyValueConverters.Furniture).HasMaxLength(200);
        builder.Ignore(p => p.HasElevator);
        builder.Ignore(p => p.HasParking);
    }
}

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.Ignore(p => p.CeilingHeight);
        builder.Ignore(p => p.HasLoadingDock);
        builder.Ignore(p => p.HasThreePhasePower);
        builder.Ignore(p => p.RoadWidth);
    }
}
