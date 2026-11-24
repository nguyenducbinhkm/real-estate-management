using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Infrastructure.Data.Configurations;

/// <summary>Bảng "Users" (TPH, phân biệt bằng cột UserRole: Buyer/Seller/Agent/Admin).</summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("UserId");
        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.Property(u => u.Phone).HasMaxLength(20);
        builder.Property(u => u.FullName).HasMaxLength(200).IsRequired();
        builder.Property(u => u.AvatarUrl).HasMaxLength(1000);
        builder.Property(u => u.PasswordHash).HasMaxLength(500);
    }
}
