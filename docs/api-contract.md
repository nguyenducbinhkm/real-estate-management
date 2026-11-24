# RealEstateHub API Contract

Tài liệu này được suy ra trực tiếp từ `AuthController`, `ListingsController`, DTO và FluentValidation hiện có.

Tất cả response lỗi do `ExceptionMiddleware` đều có cấu trúc:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "One or more validation errors occurred.",
  "details": {}
}
```

`details` có thể là `null` hoặc một object gom lỗi theo tên field. Các lỗi `AppException` sử dụng `status`, `code`, `message` và `details: null`.

## Enum values

### PropertyType

`Apartment`, `House`, `Villa`, `Shophouse`, `RentalApartment`, `RentalHouse`, `Office`, `Warehouse`, `Land`

### TransactionType

`ForSale`, `ForRent`

### LegalStatus

`Unknown`, `PinkBook`, `RedBook`, `SaleContract`, `LongTermLease`

### FurnitureStatus

`None`, `Basic`, `Full`, `Luxury`

### PropertyStatus

`Draft`, `Pending`, `Active`, `Sold`, `Rented`, `Expired`, `Rejected`

### PackageType

`Free`, `VipSilver`, `VipGold`, `VipDiamond`

## Auth

### POST /api/auth/register

**Auth:** Không yêu cầu.

**Request body:**

| Trường | Kiểu | Bắt buộc | Validation |
|---|---|---|---|
| `email` | string | Có | Không rỗng, email hợp lệ, tối đa 256 ký tự |
| `phone` | string | Có | Không rỗng, tối đa 20 ký tự |
| `fullName` | string | Có | Không rỗng, tối đa 200 ký tự |
| `password` | string | Có | Không rỗng, 8-128 ký tự |
| `role` | string | Có | Chỉ `Buyer`, `Seller`, `Agent` |

```json
{
  "email": "seller.test@realestatehub.vn",
  "phone": "0902000001",
  "fullName": "Seller Test",
  "password": "Password123!",
  "role": "Seller"
}
```

**Response thành công:** `200 OK`

```json
{
  "accessToken": "jwt-string",
  "refreshToken": "refresh-token-string",
  "expiresAt": "2026-11-22T13:00:00Z",
  "user": {
    "id": "guid",
    "email": "seller.test@realestatehub.vn",
    "phone": "0902000001",
    "fullName": "Seller Test",
    "role": "Seller",
    "isVerified": false
  }
}
```

**Lỗi phổ biến:**

- `400 VALIDATION_ERROR`: dữ liệu không qua FluentValidation.
- `409 CONFLICT`: email đã đăng ký.
- `422 VALIDATION_ERROR`: role không được hỗ trợ trong implementation.
- `500 INTERNAL_ERROR`: lỗi không xử lý.

### POST /api/auth/login

**Auth:** Không yêu cầu.

**Request body:**

| Trường | Kiểu | Bắt buộc | Validation |
|---|---|---|---|
| `email` | string | Có | Không rỗng, email hợp lệ |
| `password` | string | Có | Không rỗng |

**Response thành công:** `200 OK`

`AuthResponse` giống endpoint register.

**Lỗi phổ biến:**

- `400 VALIDATION_ERROR`: dữ liệu không hợp lệ.
- `401 UNAUTHORIZED`: email hoặc password sai.
- `500 INTERNAL_ERROR`: lỗi không xử lý.

### POST /api/auth/refresh-token

**Auth:** Không yêu cầu.

**Request body:**

| Trường | Kiểu | Bắt buộc | Validation |
|---|---|---|---|
| `refreshToken` | string | Có | Không rỗng |

**Response thành công:** `200 OK`

`AuthResponse` giống endpoint register. Refresh token cũ sẽ bị thu hồi và được thay bằng token mới.

**Lỗi phổ biến:**

- `400 VALIDATION_ERROR`: `refreshToken` rỗng.
- `401 UNAUTHORIZED`: refresh token không hợp lệ, đã thu hồi hoặc hết hạn.
- `500 INTERNAL_ERROR`: lỗi không xử lý.

### POST /api/auth/logout

**Auth:** Không yêu cầu theo code hiện tại.

**Request body:**

| Trường | Kiểu | Bắt buộc | Validation |
|---|---|---|---|
| `refreshToken` | string | Có | Không rỗng |

**Response thành công:** `204 No Content`

**Lỗi phổ biến:**

- `400 VALIDATION_ERROR`: `refreshToken` rỗng.
- `500 INTERNAL_ERROR`: lỗi không xử lý.

## Listings

### GET /api/listings

**Auth:** Không yêu cầu.

**Query params:**

| Tên | Kiểu | Bắt buộc | Mặc định/Ghi chú |
|---|---|---|---|
| `keyword` | string | Không | Tìm trong `Title` hoặc `Description` |
| `propertyType` | `PropertyType` | Không | Một trong enum `PropertyType` |
| `transactionType` | `TransactionType` | Không | Một trong enum `TransactionType` |
| `minPrice` | decimal | Không | Lớn hơn hoặc bằng giá |
| `maxPrice` | decimal | Không | Nhỏ hơn hoặc bằng giá |
| `minArea` | double | Không | Lớn hơn hoặc bằng diện tích |
| `maxArea` | double | Không | Nhỏ hơn hoặc bằng diện tích |
| `provinceCode` | string | Không | Mã tỉnh trong `Address` |
| `districtCode` | string | Không | Mã quận/huyện trong `Address` |
| `page` | int | Không | Mặc định `1`; giá trị nhỏ hơn `1` được đưa về `1` |
| `pageSize` | int | Không | Mặc định `20`; giới hạn `1-100` |

**Response thành công:** `200 OK`

```json
{
  "items": [
    {
      "id": "guid",
      "title": "string",
      "description": "string",
      "price": 0,
      "area": 0,
      "pricePerSqm": 0,
      "status": "Pending",
      "propertyType": "Apartment",
      "transactionType": "ForSale",
      "packageType": "Free",
      "ownerId": "guid",
      "summary": "string",
      "provinceCode": "string",
      "provinceName": "string",
      "districtCode": "string",
      "districtName": "string",
      "wardCode": "string",
      "wardName": "string",
      "streetAddress": "string",
      "createdAt": "2026-11-22T12:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

Các enum trong mỗi `ListingDto`:

- `status`: `PropertyStatus`
- `propertyType`: `PropertyType`
- `transactionType`: `TransactionType`
- `packageType`: `PackageType`

**Lỗi phổ biến:**

- `400` nếu ASP.NET Core không chuyển đổi được query enum/số.
- `500 INTERNAL_ERROR`: lỗi không xử lý.

### GET /api/listings/{id}

**Auth:** Không yêu cầu.

**Route param:**

| Tên | Kiểu | Bắt buộc |
|---|---|---|
| `id` | Guid | Có |

**Response thành công:** `200 OK`, body là `ListingDto`.

**Lỗi phổ biến:**

- `400` nếu `id` không phải Guid.
- `404 NOT_FOUND`: `"Listing not found."`
- `500 INTERNAL_ERROR`: lỗi không xử lý.

### POST /api/listings

**Auth:** Bearer JWT. Buyer không thể đăng tin; Seller/Agent/Admin được kiểm tra theo `CanPostListing()`.

**Request body:**

| Trường | Kiểu | Bắt buộc | Validation/Ghi chú |
|---|---|---|---|
| `propertyType` | `PropertyType` | Có | Một trong enum `PropertyType` |
| `transactionType` | `TransactionType` | Có | Một trong enum `TransactionType` |
| `title` | string | Có | Không rỗng, tối đa 250 ký tự |
| `description` | string | Có | Không rỗng, tối đa 8000 ký tự |
| `price` | decimal | Có | Phải lớn hơn `0` |
| `area` | double | Có | Phải lớn hơn `0` |
| `provinceCode` | string | Có | Không rỗng, tối đa 20 ký tự |
| `provinceName` | string | Không | Kiểu string |
| `districtCode` | string | Có | Không rỗng, tối đa 20 ký tự |
| `districtName` | string | Không | Kiểu string |
| `wardCode` | string | Có | Không rỗng, tối đa 20 ký tự; phải có trong bảng `Wards` và thuộc đúng `districtCode`/`provinceCode` (sai → `422`) |
| `wardName` | string | Không | Bỏ qua; tên phường lấy từ bảng `Wards` |
| `streetAddress` | string | Có | Không rỗng, tối đa 250 ký tự |
| `bedroomCount` | int nullable | Không | Dùng cho căn hộ/villa/phòng thuê |
| `bathroomCount` | int nullable | Không | Dùng cho căn hộ/villa/phòng thuê |
| `floorNumber` | int nullable | Không | Dùng cho căn hộ/văn phòng/lô thuê |
| `landArea` | double nullable | Không | Dùng cho nhà/villa/đất/mặt phố |
| `legalStatus` | `LegalStatus` nullable | Không | Một trong enum `LegalStatus` |
| `furniture` | `FurnitureStatus` nullable | Không | Một trong enum `FurnitureStatus` |
| `hasClearance` | bool nullable | Không | Dùng cho `Land` |
| `rentalPeriodMonths` | int nullable | Không | Dùng cho bất động sản cho thuê |
| `petsAllowed` | bool nullable | Không | Dùng cho `RentalApartment` |
| `ceilingHeight` | double nullable | Không | Dùng cho `Warehouse` |
| `roadWidth` | double nullable | Không | Dùng cho nhà/đất/kho |

Tổ hợp property/transaction được validator hỗ trợ:

| PropertyType | TransactionType |
|---|---|
| `Apartment`, `House`, `Villa`, `Shophouse`, `Land` | `ForSale` |
| `RentalApartment`, `RentalHouse`, `Office`, `Warehouse` | `ForRent` |

**Response thành công:** `201 Created`, body là `ListingDto`.

**Lỗi phổ biến:**

- `400 VALIDATION_ERROR`: FluentValidation không qua.
- `401 UNAUTHORIZED`: thiếu hoặc sai bearer JWT; hoặc identity claim không hợp lệ.
- `403 FORBIDDEN`: Buyer đăng tin hoặc không đủ quyền.
- `422 VALIDATION_ERROR`: tổ hợp property/transaction không hỗ trợ hoặc dữ liệu domain không hợp lệ.
- `500 INTERNAL_ERROR`: lỗi không xử lý.

### PUT /api/listings/{id}

**Auth:** Bearer JWT. Chỉ owner hoặc role `Admin`.

**Route param:**

| Tên | Kiểu | Bắt buộc |
|---|---|---|
| `id` | Guid | Có |

**Request body:**

Giống toàn bộ trường của `CreateListingRequest`.

Update validator kiểm tra:

| Trường | Kiểu | Bắt buộc | Validation |
|---|---|---|---|
| `title` | string | Có | Không rỗng, tối đa 250 ký tự |
| `description` | string | Có | Không rỗng, tối đa 8000 ký tự |
| `price` | decimal | Có | Lớn hơn `0` |
| `area` | double | Có | Lớn hơn `0` |
| `provinceCode` | string | Có | Không rỗng |
| `districtCode` | string | Có | Không rỗng |
| `wardCode` | string | Có | Không rỗng, tối đa 20 ký tự; phải có trong bảng `Wards` |
| `streetAddress` | string | Có | Không rỗng, tối đa 250 ký tự |
| Các trường còn lại | Giống create request | Không | Không có rule riêng trong update validator |

**Response thành công:** `200 OK`, body là `ListingDto`.

**Lỗi phổ biến:**

- `400 VALIDATION_ERROR`: validation update không qua.
- `401 UNAUTHORIZED`: thiếu/sai bearer JWT hoặc identity claim không hợp lệ.
- `403 FORBIDDEN`: không phải owner và không phải Admin.
- `404 NOT_FOUND`: `"Listing not found."`
- `422 VALIDATION_ERROR`: dữ liệu domain không hợp lệ.
- `500 INTERNAL_ERROR`: lỗi không xử lý.

### DELETE /api/listings/{id}

**Auth:** Bearer JWT. Chỉ owner hoặc role `Admin`.

**Route param:**

| Tên | Kiểu | Bắt buộc |
|---|---|---|
| `id` | Guid | Có |

**Response thành công:** `204 No Content`

**Lỗi phổ biến:**

- `401 UNAUTHORIZED`: thiếu/sai bearer JWT hoặc identity claim không hợp lệ.
- `403 FORBIDDEN`: không phải owner và không phải Admin.
- `404 NOT_FOUND`: `"Listing not found."`
- `500 INTERNAL_ERROR`: lỗi không xử lý.

### GET /api/listings/my

**Auth:** Bearer JWT.

**Query params:** Không có.

**Route params:** Không có.

**Response thành công:** `200 OK`

Body là mảng `ListingDto`:

```json
[
  {
    "id": "guid",
    "title": "string",
    "description": "string",
    "price": 0,
    "area": 0,
    "pricePerSqm": 0,
    "status": "Pending",
    "propertyType": "Apartment",
    "transactionType": "ForSale",
    "packageType": "Free",
    "ownerId": "guid",
    "summary": "string",
    "provinceCode": "string",
    "provinceName": "string",
    "districtCode": "string",
    "districtName": "string",
    "wardCode": "string",
    "wardName": "string",
    "streetAddress": "string",
    "createdAt": "2026-11-22T12:00:00Z"
  }
]
```

**Lỗi phổ biến:**

- `401 UNAUTHORIZED`: thiếu/sai bearer JWT hoặc identity claim không hợp lệ.
- `500 INTERNAL_ERROR`: lỗi không xử lý.

## Projects (chỉ đọc)

Tất cả endpoint dự án **không yêu cầu đăng nhập** và chỉ đọc dữ liệu từ các bảng `Projects`, `ProjectPhases`, `Properties`, `Wards`/`Districts`/`Provinces`.

`ProjectStatus` trong database hiện dùng: `Upcoming`, `Selling`, `HandedOver` (enum còn có `Planning`, `PreSales`, `UnderConstruction`, `Completed`, `Suspended`).

### GET /api/projects

| Tên | Kiểu | Mặc định/Ghi chú |
|---|---|---|
| `keyword` | string | Tìm trong tên dự án hoặc chủ đầu tư, không phân biệt hoa thường |
| `provinceCode` | string | Mã tỉnh, ví dụ `01`, `79` |
| `status` | `ProjectStatus` | |
| `minPrice`, `maxPrice` | decimal | Lấy dự án có khoảng giá **giao** với khoảng lọc; nếu min > max sẽ tự đảo |
| `featured` | bool | Chỉ dự án nổi bật |
| `sort` | string | `default` (nổi bật trước), `newest` (ngày mở bán mới nhất), `priceAsc`, `priceDesc` |
| `page` | int | Mặc định `1` |
| `pageSize` | int | Mặc định `12`, giới hạn `1-50` |

**Response `200`:** `{ items: ProjectSummaryDto[], page, pageSize, total }`

`ProjectSummaryDto`: `id`, `name`, `developer`, `status`, `provinceCode`, `provinceName`, `districtName`, `wardName`, `streetAddress`,
`minPrice`, `maxPrice`, `currency`, `totalArea` (hecta), `launchDate`, `handoverDate`, `isFeatured`, `phaseCount`, `listingCount`.

### GET /api/projects/provinces

Danh sách tỉnh có dự án: `[{ provinceCode, provinceName, projectCount }]`, nhiều dự án xếp trước.

### GET /api/projects/{id}

`ProjectDetailDto` = `ProjectSummaryDto` + `description`, `districtCode`, `wardCode`,
`phases: [{ id, name, description, sortOrder, startingPrice }]` (theo `sortOrder`).
Lỗi: `404 NOT_FOUND` "Project not found.".

### GET /api/projects/{id}/listings?page=&pageSize=

Tin đăng thuộc dự án (`Properties.ProjectId`): `{ items: ListingDto[], page, pageSize, total }`. `pageSize` mặc định `12`, tối đa `50`. Lỗi `404` nếu dự án không tồn tại.

### GET /api/projects/{id}/related?limit=

Dự án liên quan (ưu tiên cùng tỉnh, rồi cùng chủ đầu tư, rồi dự án nổi bật): `ProjectSummaryDto[]`. `limit` mặc định `4`, tối đa `12`.
