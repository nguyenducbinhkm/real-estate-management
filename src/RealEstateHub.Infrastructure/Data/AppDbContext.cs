using Microsoft.EntityFrameworkCore;
using RealEstateHub.Domain.Entities.Locations;
using RealEstateHub.Domain.Entities.Projects;
using RealEstateHub.Domain.Entities.Properties;
using RealEstateHub.Domain.Entities.Users;

namespace RealEstateHub.Infrastructure.Data;

/// <summary>
/// Map tới database có sẵn RealEstateHubDb (không tạo bằng EF migrations).
/// </summary>
public class AppDbContext : DbContext
{
    static AppDbContext()
    {
        // Các cột thời gian trong RealEstateHubDb là "timestamp without time zone".
        // Chế độ legacy của Npgsql cho phép ghi DateTime (kể cả UTC) vào kiểu này.
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Property> Properties => Set<Property>();
    public DbSet<Apartment> Apartments => Set<Apartment>();
    public DbSet<House> Houses => Set<House>();
    public DbSet<Villa> Villas => Set<Villa>();
    public DbSet<Shophouse> Shophouses => Set<Shophouse>();
    public DbSet<Land> Lands => Set<Land>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectPhase> ProjectPhases => Set<ProjectPhase>();
    public DbSet<SavedListing> SavedListings => Set<SavedListing>();
    public DbSet<ContactRequest> ContactRequests => Set<ContactRequest>();
    public DbSet<SearchAlert> SearchAlerts => Set<SearchAlert>();
    public DbSet<ListingReport> ListingReports => Set<ListingReport>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Province> Provinces => Set<Province>();
    public DbSet<District> Districts => Set<District>();
    public DbSet<Ward> Wards => Set<Ward>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Property>()
            .HasDiscriminator<string>("PropertyType")
            .HasValue<Apartment>("Apartment")
            .HasValue<House>("House")
            .HasValue<Villa>("Villa")
            .HasValue<Shophouse>("Shophouse")
            .HasValue<RentalApartment>("RentalApartment")
            .HasValue<RentalHouse>("RentalHouse")
            .HasValue<Office>("Office")
            .HasValue<Warehouse>("Warehouse")
            .HasValue<Land>("Land");

        modelBuilder.Entity<User>()
            .HasDiscriminator<string>("UserRole")
            .HasValue<Buyer>("Buyer")
            .HasValue<Seller>("Seller")
            .HasValue<AgentSeller>("Agent")
            .HasValue<Admin>("Admin");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
