-- Thêm số điện thoại liên hệ và số Zalo (chạy được nhiều lần).
--   Users.ZaloPhone          : số Zalo mặc định của tài khoản (có thể khác số điện thoại).
--   Properties.ContactPhone  : số liên hệ riêng cho từng tin (NULL = dùng số trong hồ sơ người đăng).
--   Properties.ZaloPhone     : số Zalo riêng cho từng tin (NULL = dùng số Zalo trong hồ sơ, rồi tới số liên hệ).
-- Chạy:  psql -h localhost -U postgres -d RealEstateHubDb -f database/migrations/2026-11-26_add_contact_and_zalo_phones.sql
BEGIN;
ALTER TABLE "Users"      ADD COLUMN IF NOT EXISTS "ZaloPhone"    varchar(20) NULL;
ALTER TABLE "Properties" ADD COLUMN IF NOT EXISTS "ContactPhone" varchar(20) NULL;
ALTER TABLE "Properties" ADD COLUMN IF NOT EXISTS "ZaloPhone"    varchar(20) NULL;
COMMIT;
