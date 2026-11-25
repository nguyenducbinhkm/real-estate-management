using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Infrastructure.Data.Configurations;

/// <summary>
/// Bảng "ContactRequests" có sẵn trong RealEstateHubDb. Khi xoá tin, database tự đặt PropertyId = NULL
/// (yêu cầu vẫn còn và vẫn thuộc người bán qua ReceiverId).
/// </summary>
public class ContactRequestConfiguration : IEntityTypeConfiguration<ContactRequest>
{
    public void Configure(EntityTypeBuilder<ContactRequest> builder)
    {
        builder.ToTable("ContactRequests");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("ContactRequestId");
        builder.Property(c => c.SenderName).HasMaxLength(200).IsRequired();
        builder.Property(c => c.SenderPhone).HasMaxLength(20).IsRequired();
        builder.Property(c => c.SenderEmail).HasMaxLength(256);
        builder.Property(c => c.Message).HasMaxLength(2000);
        builder.Property(c => c.Status).HasConversion<string>().HasMaxLength(30);

        builder.HasOne(c => c.Property).WithMany().HasForeignKey(c => c.PropertyId).OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(c => c.ReceiverId);
    }
}
