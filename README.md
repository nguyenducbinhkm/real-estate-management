# RealEstate Hub

Repository này chứa skeleton cho hệ thống bất động sản Clean Architecture:

- Backend: `RealEstateHub.sln`, ASP.NET Core .NET 8
- Frontend: React 18, Vite, Tailwind CSS và Zustand
- Test: xUnit trong `tests/RealEstateHub.Tests`

## Database

Backend dùng database PostgreSQL có sẵn `RealEstateHubDb` (PostgreSQL 18, `localhost:5432`, user `postgres`).
Chuỗi kết nối nằm trong `src/RealEstateHub.API/appsettings.Development.json`.
Backend **không** tự chạy migration hay seed: cấu trúc bảng do database quản lý, EF chỉ map vào các bảng đã có.

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
