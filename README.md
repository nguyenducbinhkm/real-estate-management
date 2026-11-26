# RealEstate Hub

Repository này chứa skeleton cho hệ thống bất động sản Clean Architecture:

- Backend: `RealEstateHub.sln`, ASP.NET Core .NET 8
- Frontend: React 18, Vite, Tailwind CSS và Zustand
- Test: xUnit trong `tests/RealEstateHub.Tests`

## Database

Backend dùng PostgreSQL (`localhost:5432`, database `RealEstateHubDb`). Chuỗi kết nối nằm trong
`src/RealEstateHub.API/appsettings.Development.json` (git bỏ qua – tạo file này với `ConnectionStrings:DefaultConnection`).
Backend **không** tự chạy migration; cấu trúc và dữ liệu mẫu nằm trong thư mục `database/`:

| File | Nội dung |
|---|---|
| `database/schema.sql` | Tạo 15 bảng (3NF, khoá ngoại, chỉ mục) |
| `database/seed.sql` | Dữ liệu mẫu ≈13.000 dòng (63 tỉnh, 696 quận, 10.035 phường, 300 tin, 120 yêu cầu liên hệ, 60 người dùng…) |
| `database/migrations/*.sql` | Thay đổi sau đó, chạy theo thứ tự tên file (chạy lại nhiều lần vẫn an toàn) |
| `database/tools/generate_seed_pg.py` | Script đã sinh ra `seed.sql` |

Tạo database mới:

```powershell
psql -U postgres -c "CREATE DATABASE \"RealEstateHubDb\""
psql -U postgres -d RealEstateHubDb -f database/schema.sql
psql -U postgres -d RealEstateHubDb -f database/seed.sql
Get-ChildItem database/migrations/*.sql | Sort-Object Name | ForEach-Object { psql -U postgres -d RealEstateHubDb -f $_.FullName }
```

Database đã có sẵn từ trước thì chỉ cần chạy các file trong `database/migrations/` chưa chạy.

## Chạy backend

```powershell
dotnet restore RealEstateHub.sln
dotnet build RealEstateHub.sln
dotnet run --project src/RealEstateHub.API --launch-profile http
```

API chạy ở `http://localhost:5129` (Swagger: `http://localhost:5129/swagger`) và cho phép frontend `http://localhost:5173` gọi tới (CORS, cấu hình ở `Cors:AllowedOrigins`).

## Chạy frontend

```powershell
cd frontend
npm install
npm run dev
```

## Kiểm thử

4 bộ test, chạy tất cả bằng 1 lệnh:

```powershell
.un-tests.ps1
```

Chạy riêng một bộ: `.un-tests.ps1 -Only unit` (`unit` | `integration` | `api` | `frontend`).

| Bộ test | Thư mục | Công cụ | Cần gì |
|---|---|---|---|
| Unit | `tests/RealEstateHub.UnitTests` | xUnit + Fake/Stub | không cần database |
| Integration | `tests/RealEstateHub.IntegrationTests` | xUnit + PostgreSQL thật | PostgreSQL đang chạy |
| API | `tests/RealEstateHub.ApiTests` | xUnit + `WebApplicationFactory` (API chạy trong bộ nhớ) | PostgreSQL đang chạy |
| Frontend | `frontend/src/**/*.test.{js,jsx}` | Vitest + React Testing Library (jsdom) | không cần backend (`npm test`) |

- Integration test và API test **tự dựng database riêng** (`RealEstateHubDb_IntegrationTests`, `RealEstateHubDb_ApiTests`)
  từ `database/schema.sql` + `seed.sql` + `migrations/` mỗi lần chạy, nên **không đụng tới `RealEstateHubDb`**.
  Chuỗi kết nối tới máy chủ PostgreSQL lấy từ biến môi trường `REALESTATEHUB_TEST_DB`
  (vd. `Host=localhost;Port=5432;Username=postgres;Password=...`), nếu không có thì từ `appsettings.Development.json`.
- API test thay nơi lưu ảnh đại diện (Supabase) bằng bản giả, không gọi ra Internet.
- Ma trận ca kiểm thử (mã TC, kỹ thuật, người phụ trách TV1/TV2): [`docs/test-matrix.md`](docs/test-matrix.md),
  sinh lại bằng `node tests/generate-test-matrix.mjs`.

