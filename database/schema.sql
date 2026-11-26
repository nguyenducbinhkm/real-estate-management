BEGIN;

-- ==========================================
-- TẦNG 1: BẢNG ĐỘC LẬP
-- ==========================================

CREATE TABLE "Provinces" (
    "ProvinceId"   UUID PRIMARY KEY,
    "ProvinceCode" VARCHAR(20)  NOT NULL UNIQUE,
    "ProvinceName" VARCHAR(100) NOT NULL
);

CREATE TABLE "Users" (
    "UserId"              UUID PRIMARY KEY,
    "Email"               VARCHAR(256) NOT NULL UNIQUE,
    "Phone"               VARCHAR(20),
    "FullName"            VARCHAR(200) NOT NULL,
    "PasswordHash"        VARCHAR(500) NOT NULL,
    "AvatarUrl"           VARCHAR(1000),
    "IsVerified"          BOOLEAN      NOT NULL DEFAULT FALSE,
    "UserRole"            VARCHAR(20)  NOT NULL,
    "SubscriptionPackage" VARCHAR(30),
    "AgentLicense"        VARCHAR(100),
    "AgencyName"          VARCHAR(200),
    "Rating"              NUMERIC(3,2),
    "TotalTransactions"   INT,
    "AdminLevel"          INT,
    "CreatedAt"           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt"           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "IX_Users_Phone" ON "Users" ("Phone");

-- ==========================================
-- TẦNG 2
-- ==========================================

CREATE TABLE "Districts" (
    "DistrictId"   UUID PRIMARY KEY,
    "ProvinceId"   UUID         NOT NULL REFERENCES "Provinces"("ProvinceId") ON DELETE RESTRICT,
    "DistrictCode" VARCHAR(20)  NOT NULL UNIQUE,
    "DistrictName" VARCHAR(100) NOT NULL
);
CREATE INDEX "IX_Districts_ProvinceId" ON "Districts" ("ProvinceId");

CREATE TABLE "RefreshTokens" (
    "RefreshTokenId" UUID PRIMARY KEY,
    "UserId"         UUID         NOT NULL REFERENCES "Users"("UserId") ON DELETE CASCADE,
    "Token"          VARCHAR(500) NOT NULL UNIQUE,
    "ExpiresAt"      TIMESTAMP    NOT NULL,
    "RevokedAt"      TIMESTAMP
);
CREATE INDEX "IX_RefreshTokens_UserId" ON "RefreshTokens" ("UserId");

-- ==========================================
-- TẦNG 3
-- ==========================================

CREATE TABLE "Wards" (
    "WardId"     UUID PRIMARY KEY,
    "DistrictId" UUID         NOT NULL REFERENCES "Districts"("DistrictId") ON DELETE RESTRICT,
    "WardCode"   VARCHAR(20)  NOT NULL UNIQUE,
    "WardName"   VARCHAR(100) NOT NULL
);
CREATE INDEX "IX_Wards_DistrictId" ON "Wards" ("DistrictId");

-- ==========================================
-- TẦNG 4
-- ==========================================

CREATE TABLE "Projects" (
    "ProjectId"         UUID PRIMARY KEY,
    "WardId"            UUID         NOT NULL REFERENCES "Wards"("WardId") ON DELETE RESTRICT,
    "Name"              VARCHAR(250) NOT NULL,
    "Developer"         VARCHAR(250) NOT NULL,
    "Description"       TEXT,
    "StreetAddress"     VARCHAR(250),
    "Status"            VARCHAR(30)  NOT NULL,
    "MinPrice_Amount"   NUMERIC(18,2),
    "MinPrice_Currency" VARCHAR(10),
    "MaxPrice_Amount"   NUMERIC(18,2),
    "MaxPrice_Currency" VARCHAR(10),
    "TotalArea"         DOUBLE PRECISION,
    "LaunchDate"        TIMESTAMP,
    "HandoverDate"      TIMESTAMP,
    "IsFeatured"        BOOLEAN      NOT NULL DEFAULT FALSE,
    "CreatedAt"         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt"         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "IX_Projects_Status"     ON "Projects" ("Status");
CREATE INDEX "IX_Projects_IsFeatured" ON "Projects" ("IsFeatured");
CREATE INDEX "IX_Projects_WardId"     ON "Projects" ("WardId");

CREATE TABLE "SearchAlerts" (
    "SearchAlertId" UUID PRIMARY KEY,
    "BuyerId"       UUID        NOT NULL REFERENCES "Users"("UserId") ON DELETE CASCADE,
    "ProvinceId"    UUID        REFERENCES "Provinces"("ProvinceId") ON DELETE SET NULL,
    "DistrictId"    UUID        REFERENCES "Districts"("DistrictId") ON DELETE SET NULL,
    "WardId"        UUID        REFERENCES "Wards"("WardId") ON DELETE SET NULL,
    "Keyword"       VARCHAR(250),
    "MinPrice"      NUMERIC(18,2),
    "MaxPrice"      NUMERIC(18,2),
    "Frequency"     VARCHAR(30) NOT NULL,
    "IsActive"      BOOLEAN     NOT NULL DEFAULT TRUE
);
CREATE INDEX "IX_SearchAlerts_BuyerId" ON "SearchAlerts" ("BuyerId");

-- ==========================================
-- TẦNG 5
-- ==========================================

CREATE TABLE "ProjectPhases" (
    "ProjectPhaseId" UUID PRIMARY KEY,
    "ProjectId"      UUID         NOT NULL REFERENCES "Projects"("ProjectId") ON DELETE CASCADE,
    "Name"           VARCHAR(250) NOT NULL,
    "Description"    VARCHAR(2000),
    "StartingPrice"  NUMERIC(18,2),
    "SortOrder"      INT          NOT NULL,
    CONSTRAINT "UQ_ProjectPhases_Project_Sort" UNIQUE ("ProjectId", "SortOrder")
);

CREATE TABLE "Properties" (
    "PropertyId"     UUID PRIMARY KEY,
    "OwnerId"        UUID             NOT NULL REFERENCES "Users"("UserId") ON DELETE CASCADE,
    "ProjectId"      UUID             REFERENCES "Projects"("ProjectId") ON DELETE SET NULL,
    "WardId"         UUID             NOT NULL REFERENCES "Wards"("WardId") ON DELETE RESTRICT,
    "PropertyType"   VARCHAR(30)      NOT NULL,
    "Title"          VARCHAR(250)     NOT NULL,
    "Description"    TEXT,
    "Price"          NUMERIC(18,2)    NOT NULL,
    "Area"           DOUBLE PRECISION NOT NULL,
    "StreetAddress"  VARCHAR(250),
    "Status"         VARCHAR(30)      NOT NULL,
    "PackageType"    VARCHAR(30)      NOT NULL,
    "BoostScore"     INT              NOT NULL DEFAULT 0,
    "IsFeatured"     BOOLEAN          NOT NULL DEFAULT FALSE,
    "Bedrooms"       INT,
    "Bathrooms"      INT,
    "Floors"         INT,
    "LegalStatus"    VARCHAR(200),
    "FurnitureState" VARCHAR(200),
    "CreatedAt"      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt"      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ExpiresAt"      TIMESTAMP
);
CREATE INDEX "IX_Properties_OwnerId"     ON "Properties" ("OwnerId");
CREATE INDEX "IX_Properties_WardId"      ON "Properties" ("WardId");
CREATE INDEX "IX_Properties_Price"       ON "Properties" ("Price");
CREATE INDEX "IX_Properties_Area"        ON "Properties" ("Area");
CREATE INDEX "IX_Properties_Status"      ON "Properties" ("Status");
CREATE INDEX "IX_Properties_PackageType" ON "Properties" ("PackageType");

-- ==========================================
-- TẦNG 6
-- ==========================================

CREATE TABLE "PropertyImages" (
    "PropertyImageId" UUID PRIMARY KEY,
    "PropertyId"      UUID          NOT NULL REFERENCES "Properties"("PropertyId") ON DELETE CASCADE,
    "Url"             VARCHAR(1000) NOT NULL,
    "Caption"         VARCHAR(500),
    "SortOrder"       INT           NOT NULL DEFAULT 0
);
CREATE INDEX "IX_PropertyImages_PropertyId" ON "PropertyImages" ("PropertyId");

CREATE TABLE "SavedListings" (
    "SavedListingId" UUID PRIMARY KEY,
    "BuyerId"        UUID      NOT NULL REFERENCES "Users"("UserId") ON DELETE CASCADE,
    "PropertyId"     UUID      NOT NULL REFERENCES "Properties"("PropertyId") ON DELETE CASCADE,
    "SavedAt"        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_SavedListings_Buyer_Property" UNIQUE ("BuyerId", "PropertyId")
);

CREATE TABLE "ContactRequests" (
    "ContactRequestId" UUID PRIMARY KEY,
    "PropertyId"       UUID         REFERENCES "Properties"("PropertyId") ON DELETE SET NULL,
    "ProjectId"        UUID         REFERENCES "Projects"("ProjectId") ON DELETE SET NULL,
    "SenderId"         UUID         REFERENCES "Users"("UserId") ON DELETE SET NULL,
    "ReceiverId"       UUID         REFERENCES "Users"("UserId") ON DELETE SET NULL,
    "SenderName"       VARCHAR(200) NOT NULL,
    "SenderPhone"      VARCHAR(20)  NOT NULL,
    "SenderEmail"      VARCHAR(256),
    "Message"          VARCHAR(1000),
    "Status"           VARCHAR(20)  NOT NULL DEFAULT 'New',
    "CreatedAt"        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CK_ContactRequests_Target" CHECK ("PropertyId" IS NOT NULL OR "ProjectId" IS NOT NULL)
);
CREATE INDEX "IX_ContactRequests_Status" ON "ContactRequests" ("Status");

CREATE TABLE "ListingReports" (
    "ListingReportId" UUID PRIMARY KEY,
    "PropertyId"      UUID         NOT NULL REFERENCES "Properties"("PropertyId") ON DELETE CASCADE,
    "ReporterId"      UUID         NOT NULL REFERENCES "Users"("UserId") ON DELETE RESTRICT,
    "ReviewedById"    UUID         REFERENCES "Users"("UserId") ON DELETE SET NULL,
    "Reason"          VARCHAR(250) NOT NULL,
    "Details"         TEXT,
    "Status"          VARCHAR(30)  NOT NULL,
    "CreatedAt"       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "IX_ListingReports_Status" ON "ListingReports" ("Status");

CREATE TABLE "PaymentTransactions" (
    "PaymentTransactionId" UUID PRIMARY KEY,
    "UserId"               UUID          NOT NULL REFERENCES "Users"("UserId") ON DELETE RESTRICT,
    "PropertyId"           UUID          REFERENCES "Properties"("PropertyId") ON DELETE SET NULL,
    "TransactionType"      VARCHAR(30)   NOT NULL,
    "PackageType"          VARCHAR(30),
    "Amount"               NUMERIC(18,2) NOT NULL CHECK ("Amount" >= 0),
    "PaymentMethod"        VARCHAR(30)   NOT NULL,
    "TransactionRef"       VARCHAR(100)  UNIQUE,
    "Status"               VARCHAR(20)   NOT NULL,
    "CreatedAt"            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "IX_PaymentTransactions_Status" ON "PaymentTransactions" ("Status");

CREATE TABLE "Notifications" (
    "NotificationId" UUID PRIMARY KEY,
    "UserId"         UUID          NOT NULL REFERENCES "Users"("UserId") ON DELETE CASCADE,
    "Title"          VARCHAR(200)  NOT NULL,
    "Message"        VARCHAR(1000) NOT NULL,
    "Type"           VARCHAR(30)   NOT NULL,
    "ReferenceId"    UUID,
    "IsRead"         BOOLEAN       NOT NULL DEFAULT FALSE,
    "CreatedAt"      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "IX_Notifications_UserId_IsRead" ON "Notifications" ("UserId", "IsRead");

COMMIT;