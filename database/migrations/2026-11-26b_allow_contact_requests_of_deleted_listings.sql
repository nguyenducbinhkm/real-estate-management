-- Sửa mâu thuẫn trong schema: FK "ContactRequests"."PropertyId" là ON DELETE SET NULL (xoá tin vẫn giữ thông tin khách),
-- nhưng CHECK "CK_ContactRequests_Target" lại bắt PropertyId hoặc ProjectId phải khác NULL
-- → xoá 1 tin đã có khách liên hệ (không thuộc dự án) luôn bị PostgreSQL từ chối (API trả lỗi 500).
-- Bỏ CHECK này; việc yêu cầu liên hệ MỚI phải gắn với 1 tin đăng vẫn được kiểm tra ở ContactRequestService.
-- Chạy được nhiều lần.
-- Chạy:  psql -h localhost -U postgres -d RealEstateHubDb -f database/migrations/2026-11-26b_allow_contact_requests_of_deleted_listings.sql
ALTER TABLE "ContactRequests" DROP CONSTRAINT IF EXISTS "CK_ContactRequests_Target";
