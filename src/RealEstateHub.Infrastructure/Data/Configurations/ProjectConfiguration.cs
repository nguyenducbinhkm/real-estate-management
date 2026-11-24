using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstateHub.Domain.Entities.Projects;

namespace RealEstateHub.Infrastructure.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("ProjectId");
        builder.Property(p => p.Name).HasMaxLength(250).IsRequired();
        builder.Property(p => p.Developer).HasMaxLength(250).IsRequired();
        builder.Property(p => p.Description).HasColumnType("text");
        builder.Property(p => p.StreetAddress).HasMaxLength(250);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(30);
        builder.Ignore(p => p.Address);

        builder.HasOne(p => p.Ward).WithMany().HasForeignKey(p => p.WardId).OnDelete(DeleteBehavior.Restrict);

        // Cột MinPrice_Amount, MinPrice_Currency, MaxPrice_Amount, MaxPrice_Currency.
        builder.OwnsOne(p => p.MinPrice, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MinPrice_Amount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("MinPrice_Currency").HasMaxLength(10);
        });
        builder.OwnsOne(p => p.MaxPrice, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MaxPrice_Amount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("MaxPrice_Currency").HasMaxLength(10);
        });

        builder.HasMany(p => p.Phases)
            .WithOne(ph => ph.Project)
            .HasForeignKey(ph => ph.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProjectPhaseConfiguration : IEntityTypeConfiguration<ProjectPhase>
{
    public void Configure(EntityTypeBuilder<ProjectPhase> builder)
    {
        builder.ToTable("ProjectPhases");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("ProjectPhaseId");
        builder.Property(p => p.Name).HasMaxLength(250).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(2000);
        builder.Property(p => p.StartingPrice).HasPrecision(18, 2);
        builder.Ignore(p => p.AreaFrom);
        builder.Ignore(p => p.AreaTo);
        builder.Ignore(p => p.LaunchDate);
        builder.Ignore(p => p.HandoverDate);
    }
}
