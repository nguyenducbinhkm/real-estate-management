using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstateHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Developer = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    Address_ProvinceCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address_ProvinceName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Address_DistrictCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address_DistrictName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Address_WardCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address_WardName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Address_StreetAddress = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Address_Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Address_Longitude = table.Column<double>(type: "double precision", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    MinPrice_Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MinPrice_Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    MaxPrice_Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MaxPrice_Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TotalArea = table.Column<double>(type: "double precision", nullable: true),
                    LaunchDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HandoverDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AvatarUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserRole = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: true),
                    Subscription = table.Column<int>(type: "integer", nullable: true),
                    AgentLicense = table.Column<string>(type: "text", nullable: true),
                    AgencyName = table.Column<string>(type: "text", nullable: true),
                    Rating = table.Column<double>(type: "double precision", nullable: true),
                    TotalTransactions = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectPhases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    StartingPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    AreaFrom = table.Column<double>(type: "double precision", nullable: true),
                    AreaTo = table.Column<double>(type: "double precision", nullable: true),
                    LaunchDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HandoverDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectPhases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectPhases_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Properties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Area = table.Column<double>(type: "double precision", nullable: false),
                    Address_ProvinceCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address_ProvinceName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Address_DistrictCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address_DistrictName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Address_WardCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address_WardName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Address_StreetAddress = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Address_Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Address_Longitude = table.Column<double>(type: "double precision", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageType = table.Column<int>(type: "integer", nullable: false),
                    BoostScore = table.Column<int>(type: "integer", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PropertyType = table.Column<string>(type: "character varying(21)", maxLength: 21, nullable: false),
                    BedroomCount = table.Column<int>(type: "integer", nullable: true),
                    BathroomCount = table.Column<int>(type: "integer", nullable: true),
                    Apartment_FloorNumber = table.Column<int>(type: "integer", nullable: true),
                    ProjectName = table.Column<string>(type: "text", nullable: true),
                    Direction = table.Column<int>(type: "integer", nullable: true),
                    Apartment_LegalStatus = table.Column<int>(type: "integer", nullable: true),
                    Apartment_Furniture = table.Column<int>(type: "integer", nullable: true),
                    FloorCount = table.Column<int>(type: "integer", nullable: true),
                    LandArea = table.Column<double>(type: "double precision", nullable: true),
                    House_RoadWidth = table.Column<double>(type: "double precision", nullable: true),
                    HouseType = table.Column<int>(type: "integer", nullable: true),
                    House_LegalStatus = table.Column<int>(type: "integer", nullable: true),
                    House_Furniture = table.Column<int>(type: "integer", nullable: true),
                    LandType = table.Column<int>(type: "integer", nullable: true),
                    HasClearance = table.Column<bool>(type: "boolean", nullable: true),
                    RoadWidth = table.Column<double>(type: "double precision", nullable: true),
                    LegalStatus = table.Column<int>(type: "integer", nullable: true),
                    FloorNumber = table.Column<int>(type: "integer", nullable: true),
                    HasElevator = table.Column<bool>(type: "boolean", nullable: true),
                    HasParking = table.Column<bool>(type: "boolean", nullable: true),
                    Furniture = table.Column<int>(type: "integer", nullable: true),
                    RentalPeriodMonths = table.Column<int>(type: "integer", nullable: true),
                    DepositAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    IncludesUtilities = table.Column<bool>(type: "boolean", nullable: true),
                    RentalApartment_BedroomCount = table.Column<int>(type: "integer", nullable: true),
                    RentalApartment_BathroomCount = table.Column<int>(type: "integer", nullable: true),
                    RentalApartment_FloorNumber = table.Column<int>(type: "integer", nullable: true),
                    RentalApartment_ProjectName = table.Column<string>(type: "text", nullable: true),
                    PetsAllowed = table.Column<bool>(type: "boolean", nullable: true),
                    RentalApartment_Furniture = table.Column<int>(type: "integer", nullable: true),
                    RentalHouse_BedroomCount = table.Column<int>(type: "integer", nullable: true),
                    RentalHouse_BathroomCount = table.Column<int>(type: "integer", nullable: true),
                    RentalHouse_LandArea = table.Column<double>(type: "double precision", nullable: true),
                    RentalHouse_HouseType = table.Column<int>(type: "integer", nullable: true),
                    RentalHouse_Furniture = table.Column<int>(type: "integer", nullable: true),
                    Shophouse_LandArea = table.Column<double>(type: "double precision", nullable: true),
                    Shophouse_RoadWidth = table.Column<double>(type: "double precision", nullable: true),
                    CommercialFloorCount = table.Column<int>(type: "integer", nullable: true),
                    HasHandoverStandard = table.Column<bool>(type: "boolean", nullable: true),
                    Shophouse_LegalStatus = table.Column<int>(type: "integer", nullable: true),
                    Shophouse_Furniture = table.Column<int>(type: "integer", nullable: true),
                    Villa_BedroomCount = table.Column<int>(type: "integer", nullable: true),
                    Villa_BathroomCount = table.Column<int>(type: "integer", nullable: true),
                    Villa_LandArea = table.Column<double>(type: "double precision", nullable: true),
                    GardenArea = table.Column<double>(type: "double precision", nullable: true),
                    Villa_RoadWidth = table.Column<double>(type: "double precision", nullable: true),
                    Villa_Direction = table.Column<int>(type: "integer", nullable: true),
                    HasSwimmingPool = table.Column<bool>(type: "boolean", nullable: true),
                    Villa_LegalStatus = table.Column<int>(type: "integer", nullable: true),
                    Villa_Furniture = table.Column<int>(type: "integer", nullable: true),
                    CeilingHeight = table.Column<double>(type: "double precision", nullable: true),
                    HasLoadingDock = table.Column<bool>(type: "boolean", nullable: true),
                    HasThreePhasePower = table.Column<bool>(type: "boolean", nullable: true),
                    Warehouse_RoadWidth = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Properties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Properties_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SearchAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Keyword = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    Location_ProvinceCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Location_ProvinceName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Location_DistrictCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Location_DistrictName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Location_WardCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Location_WardName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Location_StreetAddress = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Location_Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Location_Longitude = table.Column<double>(type: "double precision", nullable: true),
                    MinPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MinArea = table.Column<double>(type: "double precision", nullable: true),
                    MaxArea = table.Column<double>(type: "double precision", nullable: true),
                    PropertyType = table.Column<int>(type: "integer", nullable: true),
                    TransactionType = table.Column<int>(type: "integer", nullable: true),
                    Frequency = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SearchAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SearchAlerts_Users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListingReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReporterId = table.Column<Guid>(type: "uuid", nullable: false),
                    Reason = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Details = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReviewedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListingReports_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListingReports_Users_ReporterId",
                        column: x => x.ReporterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ListingReports_Users_ReviewedById",
                        column: x => x.ReviewedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PropertyImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Caption = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PropertyImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PropertyImages_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SavedListings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedListings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedListings_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SavedListings_Users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListingReports_PropertyId",
                table: "ListingReports",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingReports_ReporterId",
                table: "ListingReports",
                column: "ReporterId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingReports_ReviewedById",
                table: "ListingReports",
                column: "ReviewedById");

            migrationBuilder.CreateIndex(
                name: "IX_ListingReports_Status",
                table: "ListingReports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectPhases_ProjectId_SortOrder",
                table: "ProjectPhases",
                columns: new[] { "ProjectId", "SortOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Projects_IsFeatured",
                table: "Projects",
                column: "IsFeatured");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Status",
                table: "Projects",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Area",
                table: "Properties",
                column: "Area");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_OwnerId",
                table: "Properties",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_PackageType",
                table: "Properties",
                column: "PackageType");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Price",
                table: "Properties",
                column: "Price");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Status",
                table: "Properties",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyImages_PropertyId_SortOrder",
                table: "PropertyImages",
                columns: new[] { "PropertyId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_SavedListings_BuyerId_PropertyId",
                table: "SavedListings",
                columns: new[] { "BuyerId", "PropertyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SavedListings_PropertyId",
                table: "SavedListings",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_SearchAlerts_BuyerId_IsActive",
                table: "SearchAlerts",
                columns: new[] { "BuyerId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Phone",
                table: "Users",
                column: "Phone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListingReports");

            migrationBuilder.DropTable(
                name: "ProjectPhases");

            migrationBuilder.DropTable(
                name: "PropertyImages");

            migrationBuilder.DropTable(
                name: "SavedListings");

            migrationBuilder.DropTable(
                name: "SearchAlerts");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Properties");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
