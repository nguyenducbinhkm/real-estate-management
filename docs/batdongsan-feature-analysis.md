# Khảo sát chức năng batdongsan.com.vn (24/11/2026)

Khảo sát phần công khai của website (không đăng nhập). Mục đánh dấu *(cần đăng nhập)* chỉ thấy qua menu/URL, chưa xem được nội dung bên trong.

## 1. Vai trò người dùng

| Vai trò | Việc làm được |
|---|---|
| Khách (chưa đăng nhập) | Xem trang chủ, tìm kiếm, lọc, xem chi tiết tin/dự án, danh bạ, tin tức, wiki, tiện ích phong thủy |
| Người tìm nhà (đã đăng nhập) | Lưu tin, nhận email tin mới (search alert), báo xấu tin, xem số điện thoại, chat Zalo |
| Người bán / Môi giới | Đăng tin, quản lý tin, quản lý khách hàng (lead), hồ sơ môi giới chuyên nghiệp, gói hội viên, nạp tiền |
| Quản trị (nội bộ) | Kiểm duyệt tin, xác thực tin, xử lý báo cáo vi phạm |

## 2. Danh mục loại bất động sản

**Nhà đất bán** (`/nha-dat-ban`): căn hộ chung cư, chung cư mini/căn hộ dịch vụ, nhà riêng, biệt thự/liền kề, nhà mặt phố, shophouse/nhà phố thương mại, đất nền dự án, đất, trang trại/khu nghỉ dưỡng, condotel, kho/nhà xưởng, loại khác.

**Nhà đất cho thuê** (`/nha-dat-cho-thue`): căn hộ chung cư, chung cư mini/căn hộ dịch vụ, nhà riêng, biệt thự/liền kề, nhà mặt phố, shophouse, nhà trọ/phòng trọ, văn phòng, cửa hàng/ki ốt (sang nhượng), kho/nhà xưởng/đất, loại khác.

**Dự án** (`/du-an-bat-dong-san`): căn hộ chung cư, cao ốc văn phòng, trung tâm thương mại, khu đô thị mới, khu phức hợp, nhà ở xã hội, khu nghỉ dưỡng/sinh thái, khu công nghiệp, biệt thự/liền kề, shophouse, nhà mặt phố, dự án khác.

URL thân thiện SEO dạng `/{loai-giao-dich}-{loai-bds}-{dia-diem}`, ví dụ `/ban-can-ho-chung-cu-tp-hcm`. Mã tin ở cuối URL: `...-pr41837263`; mã dự án: `...-pj6957`.

## 3. Tìm kiếm và danh sách tin

- Thanh tìm kiếm theo từ khóa / địa điểm, tab **Mua bán / Cho thuê / Dự án**.
- Chip lọc nhanh: Tin xác thực (toggle), Loại BĐS, Khoảng giá, Diện tích, Môi giới chuyên nghiệp.
- **Bộ lọc đầy đủ**:
  - Tìm mua / Tìm thuê
  - Loại BĐS (chọn nhiều)
  - Khu vực & Dự án (tỉnh → quận/phường, hoặc theo dự án)
  - Khoảng giá — bán: dưới 500tr, 500–800tr, 800tr–1 tỷ, 1–2, 2–3, 3–5, 5–7, 7–10, 10–20, 20–30, 30–40, 40–60, trên 60 tỷ, Thỏa thuận; thuê: dưới 1tr, 1–3, 3–5, 5–10, 10–40, 40–70, 70–100, trên 100tr, Thỏa thuận
  - Diện tích
  - Tin xác thực, Môi giới chuyên nghiệp
  - Số phòng ngủ (1–5+), số phòng tắm (1–5+)
  - Hướng nhà, hướng ban công (8 hướng)
  - Pháp lý: Sổ đỏ/Sổ hồng, Hợp đồng mua bán, Đang chờ sổ, Khác
  - Nội thất: Đầy đủ, Cơ bản, Không nội thất, Khác
  - Có video
- Sắp xếp (mặc định là tin VIP/nổi bật lên trước).
- Xem dạng **Danh sách** hoặc **Bản đồ**.
- Breadcrumb, tổng số tin, số lượt xem khu vực trong 7 ngày.
- **Nhận email tin mới** cho bộ lọc hiện tại (search alert).
- Thẻ tin: nhãn gói (VIP Kim Cương…), số ảnh, tiêu đề, giá, diện tích, giá/m², số PN, số WC, địa chỉ (ghi cả tên quận cũ và phường mới sau sáp nhập), đoạn mô tả, tên người đăng, thời gian đăng, số điện thoại bị che + nút "Hiện số".
- Khối "Tin xác thực bởi Batdongsan.com.vn" (có sổ, đúng địa chỉ/ảnh, giá trong khoảng thị trường).

## 4. Chi tiết tin đăng

- Gallery ảnh/video, breadcrumb, tiêu đề, địa chỉ đầy đủ (cũ/mới).
- Giá, giá/m², diện tích, số phòng ngủ; đánh giá "Giá nằm trong khoảng giá phổ biến"; **lịch sử giá**.
- Mô tả tự do.
- **Đặc điểm**: giá, diện tích, phòng ngủ, phòng tắm, hướng nhà, hướng ban công, giá điện, pháp lý, nội thất.
- **Thông tin dự án** gắn kèm (tên, trạng thái, số căn, số tòa, chủ đầu tư, số tin của dự án).
- Xem trên bản đồ.
- **Người đăng**: môi giới chuyên nghiệp, thời gian tham gia, số tin đang có, trang cá nhân.
- Meta: ngày đăng, ngày hết hạn, **loại tin** (gói VIP), mã tin.
- Hành động: Lưu tin, Chia sẻ, **Báo xấu tin đăng**, Hiện số, Chat Zalo.
- Gợi ý: BĐS dành cho bạn, tin đã xem, liên kết tìm kiếm theo từ khóa/khu vực.

## 5. Dự án

- Danh sách dự án, lọc theo Khu vực, Loại hình, Khoảng giá, **Trạng thái** (Sắp mở bán, Đang mở bán, Đang cập nhật, Đã bàn giao…), sắp xếp "Mới nhất".
- Thẻ dự án: trạng thái, mốc thời gian (khởi công, đợt nhận hồ sơ), quy mô (ha/m²), số căn, số tòa, địa chỉ, chủ đầu tư.
- Chi tiết dự án: tổng quan (số căn, diện tích, số tòa, chủ đầu tư, pháp lý), giới thiệu, vị trí, quy mô – thiết kế, loại căn, **mặt bằng từng tầng**, tiện ích, bản đồ + tiện ích xung quanh (trường học, siêu thị…), FAQ, dự án liên quan, tin đăng bán/thuê thuộc dự án.

## 6. Danh bạ

- Nhà môi giới (`/nha-moi-gioi`) và Doanh nghiệp (`/doanh-nghiep`): tên, địa chỉ, điện thoại, gửi email, khu vực hoạt động.

## 7. Kênh người bán (Sellernet) *(cần đăng nhập)*

- Đăng tin (`/nguoi-ban/dang-tin`), Tổng quan, Quản lý tin đăng, **Quản lý khách hàng**, hồ sơ Môi giới chuyên nghiệp, **Gói hội viên**, **Nạp tiền**, Cài đặt tài khoản, Đổi mật khẩu.
- Tin có ngày hết hạn và loại gói (Tin thường, VIP Bạc/Vàng/Kim Cương…), được ưu tiên hiển thị theo gói.

## 8. Tài khoản

- Đăng nhập bằng **SĐT hoặc email** + mật khẩu, quên mật khẩu, đăng nhập Google, đăng ký.
- Tin đã lưu (`/tin-da-luu`).

## 9. Nội dung và tiện ích

- Tin tức, Wiki BĐS (mua, bán, thuê, tài chính, quy hoạch – pháp lý, nội ngoại thất, phong tục).
- Phân tích đánh giá: **biểu đồ giá**, video đánh giá, báo cáo thị trường, góc nhìn chuyên gia.
- Tiện ích: xem tuổi xây nhà, tư vấn phong thủy (hướng nhà).
- Trang chủ: BĐS theo địa điểm (số tin mỗi tỉnh), dự án nổi bật, tiêu điểm.

---

## Đối chiếu với RealEstateHub hiện tại

| Chức năng | batdongsan.com.vn | RealEstateHub |
|---|---|---|
| Loại BĐS | 12 bán + 11 thuê | 5 bán + 4 thuê |
| Đăng ký / đăng nhập (email) | Có (+ SĐT, Google, quên mật khẩu) | Có API; FE chưa có trang đăng ký |
| Tìm kiếm từ khóa, loại, giá, diện tích, tỉnh/quận | Có | Có |
| Lọc phòng ngủ/tắm, hướng, pháp lý, nội thất, có video | Có | Chưa (dữ liệu domain đã có một phần) |
| Sắp xếp | Có | Cố định (featured → boost → mới nhất) |
| Danh sách theo gói VIP | Có | Có `PackageType`, `BoostScore` |
| Chi tiết tin đầy đủ đặc điểm | Có | DTO chỉ có trường chung |
| Ảnh/video tin | Có | Có bảng `PropertyImages`, chưa có API upload |
| Lưu tin | Có | Có bảng `SavedListings`, chưa có API/FE |
| Nhận email tin mới | Có | Có bảng `SearchAlerts`, chưa có API |
| Báo xấu tin | Có | Có bảng `ListingReports`, chưa có API |
| Kiểm duyệt tin (Pending → Active) | Có | Có status, chưa có API admin |
| Hết hạn tin | Có | Có `ExpiresAt`, chưa dùng |
| Dự án: danh sách, lọc, chi tiết, mặt bằng | Có | Có entity Project/Phase, chưa có API/FE |
| Tin gắn với dự án | Có | Có `ProjectName` dạng text, chưa có khóa ngoại |
| Danh bạ môi giới / doanh nghiệp | Có | Có AgentSeller, chưa có API |
| Quản lý tin của người bán | Có | Có API `/my`, FE mới có khung |
| Gói hội viên, nạp tiền, thanh toán | Có | Có enum `SubscriptionPackage`, chưa có logic |
| Bản đồ, lịch sử giá, biểu đồ giá | Có | Chưa (có Latitude/Longitude) |
| Tin tức, Wiki, phong thủy | Có | Chưa |
