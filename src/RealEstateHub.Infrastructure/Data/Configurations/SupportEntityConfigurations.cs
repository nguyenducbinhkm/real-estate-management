using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Infrastructure.Data.Configurations;

public class SavedListingConfiguration : IEntityTypeConfiguration<SavedListing>
{
    public void Configure(EntityTypeBuilder<SavedListing> builder)
    {
        builder.ToTable("SavedListings");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("SavedListingId");
        builder.Property(s => s.CreatedAt).HasColumnName("SavedAt");

        builder.HasOne(s => s.Buyer).WithMany().HasForeignKey(s => s.BuyerId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(s => s.Property).WithMany().HasForeignKey(s => s.PropertyId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class SearchAlertConfiguration : IEntityTypeConfiguration<SearchAlert>
{
    public void Configure(EntityTypeBuilder<SearchAlert> builder)
    {
        builder.ToTable("SearchAlerts");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("SearchAlertId");
        builder.Property(a => a.Keyword).HasMaxLength(250);
        builder.Property(a => a.MinPrice).HasPrecision(18, 2);
        builder.Property(a => a.MaxPrice).HasPrecision(18, 2);
        builder.Property(a => a.Frequency).HasConversion<string>().HasMaxLength(30);

        // Không có cột tương ứng trong RealEstateHubDb.
        builder.Ignore(a => a.Location);
        builder.Ignore(a => a.MinArea);
        builder.Ignore(a => a.MaxArea);
        builder.Ignore(a => a.PropertyType);
        builder.Ignore(a => a.TransactionType);
        builder.Ignore(a => a.CreatedAt);
    }
}

public class ListingReportConfiguration : IEntityTypeConfiguration<ListingReport>
{
    public void Configure(EntityTypeBuilder<ListingReport> builder)
    {
        builder.ToTable("ListingReports");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("ListingReportId");
        builder.Property(r => r.Reason).HasMaxLength(250).IsRequired();
        builder.Property(r => r.Details).HasColumnType("text");
        builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(30);
        builder.Ignore(r => r.ResolvedAt);

        builder.HasOne(r => r.Property).WithMany().HasForeignKey(r => r.PropertyId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(r => r.Reporter).WithMany().HasForeignKey(r => r.ReporterId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(r => r.ReviewedBy).WithMany().HasForeignKey(r => r.ReviewedById).OnDelete(DeleteBehavior.SetNull);
    }
}
