using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Infrastructure.Data.Configurations;

public class BuyerConfiguration : IEntityTypeConfiguration<Buyer>
{
    public void Configure(EntityTypeBuilder<Buyer> builder)
    {
        builder.Ignore(b => b.SavedListingIds);
        builder.HasMany(b => b.SearchAlerts)
            .WithOne(a => a.Buyer)
            .HasForeignKey(a => a.BuyerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SellerConfiguration : IEntityTypeConfiguration<Seller>
{
    public void Configure(EntityTypeBuilder<Seller> builder)
    {
        builder.Ignore(s => s.Listings);
        builder.Property(s => s.Subscription).HasColumnName("SubscriptionPackage").HasConversion<string>().HasMaxLength(30);
    }
}

public class AgentSellerConfiguration : IEntityTypeConfiguration<AgentSeller>
{
    public void Configure(EntityTypeBuilder<AgentSeller> builder)
    {
        builder.Property(a => a.AgentLicense).HasMaxLength(100);
        builder.Property(a => a.AgencyName).HasMaxLength(200);
        builder.Property(a => a.Rating).HasColumnType("numeric(3,2)");
    }
}

public class AdminConfiguration : IEntityTypeConfiguration<Admin>
{
    public void Configure(EntityTypeBuilder<Admin> builder)
    {
        builder.Property(a => a.Level).HasColumnName("AdminLevel");
    }
}
