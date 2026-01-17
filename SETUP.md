# 🏴‍☠️ Hướng Dẫn Setup Dự Án Pirate Treasure

Hướng dẫn chi tiết để setup và chạy dự án bao gồm Frontend, Backend và Database.

---

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Cài Đặt Database (MySQL)](#cài-đặt-database-mysql)
3. [Cài Đặt Backend (.NET)](#cài-đặt-backend-net)
4. [Cài Đặt Frontend (React + Vite)](#cài-đặt-frontend-react--vite)
5. [Cấu Hình Môi Trường](#cấu-hình-môi-trường)
6. [Chạy Dự Án](#chạy-dự-án)
7. [Kiểm Tra Kết Nối](#kiểm-tra-kết-nối)
8. [Troubleshooting](#troubleshooting)

---

## 🖥️ Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết

- **Node.js**: >= 18.x (khuyến nghị LTS)
- **.NET SDK**: >= 8.0 (hoặc .NET 10.0 nếu có)
- **MySQL**: >= 8.0
- **Git**: Để clone repository
- **IDE/Editor**: Visual Studio Code, Visual Studio, hoặc Rider (cho backend)

### Kiểm Tra Phiên Bản

```bash
# Kiểm tra Node.js
node --version

# Kiểm tra npm
npm --version

# Kiểm tra .NET SDK
dotnet --version

# Kiểm tra MySQL
mysql --version
```

---

## 🗄️ Cài Đặt Database (MySQL)

### 1. Cài Đặt MySQL

#### Windows
- Tải MySQL Installer từ [mysql.com](https://dev.mysql.com/downloads/installer/)
- Chạy installer và làm theo hướng dẫn
- Ghi nhớ username và password root

#### macOS
```bash
# Sử dụng Homebrew
brew install mysql
brew services start mysql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Tạo Database và User

Mở MySQL Command Line hoặc MySQL Workbench và thực hiện:

```sql
-- Tạo database
CREATE DATABASE IF NOT EXISTS awing_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user (tùy chọn, có thể dùng root)
CREATE USER IF NOT EXISTS 'awing_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON awing_test.* TO 'awing_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Tạo Bảng

Chạy script SQL từ file `changelog/pirate_treasures.sql`:

```bash
# Từ thư mục gốc dự án
mysql -u root -p awing_test < changelog/pirate_treasures.sql
```

Hoặc copy nội dung file và chạy trong MySQL Workbench/Command Line:

```sql
CREATE TABLE IF NOT EXISTS pirate_treasures (
  pirate_treasure_id char(36) PRIMARY KEY,
  pirate_treasure_name nvarchar(255) NOT NULL,
  map_rows int NOT NULL CHECK (1 <= map_rows AND map_rows <= 500),
  map_columns int NOT NULL CHECK (1 <= map_columns AND map_columns <= 500),
  treasure_chest_number int NOT NULL CHECK (1 <= treasure_chest_number AND treasure_chest_number <= 250000),
  map_data json NOT NULL,
  optimal_path json NOT NULL,
  total_fuel double NOT NULL DEFAULT 0,
  created_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pirate_treasure_name (pirate_treasure_name)
);
```

---

## 🔧 Cài Đặt Backend (.NET)

### 1. Cài Đặt .NET SDK

- Tải .NET SDK từ [dotnet.microsoft.com](https://dotnet.microsoft.com/download)
- Cài đặt và khởi động lại terminal

### 2. Cấu Hình Connection String

Mở file `backend/PirateTreasure/PirateTreasure/appsettings.json` và cập nhật connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=awing_test;User=root;Password=YOUR_PASSWORD;"
  }
}
```

**Lưu ý**: Thay `YOUR_PASSWORD` bằng password MySQL của bạn.

### 3. Restore Dependencies

```bash
# Di chuyển vào thư mục backend
cd backend/PirateTreasure/PirateTreasure

# Restore NuGet packages
dotnet restore
```

### 4. Build Project

```bash
# Build project
dotnet build

# Hoặc build và chạy luôn
dotnet run
```

### 5. Kiểm Tra Backend

Backend sẽ chạy tại:
- **HTTP**: `http://localhost:5029`
- **HTTPS**: `https://localhost:7257`
- **Swagger UI**: `http://localhost:5029` (trong Development mode)

Mở trình duyệt và truy cập `http://localhost:5029` để xem Swagger UI.

---

## ⚛️ Cài Đặt Frontend (React + Vite)

### 1. Cài Đặt Dependencies

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install
```

### 2. Cấu Hình Biến Môi Trường

Tạo file `.env` trong thư mục `frontend` (hoặc copy từ `.env.example` nếu có):

```env
# API Configuration
VITE_API_URL=http://localhost:5029/api
VITE_API_TIMEOUT=30000
VITE_API_LOGGING=true
```

**Lưu ý**: 
- `VITE_API_URL` phải trỏ đến địa chỉ backend của bạn
- Port `5029` là port mặc định của backend (kiểm tra trong `launchSettings.json`)

### 3. Build và Chạy

```bash
# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

### 4. Kiểm Tra Frontend

Frontend sẽ chạy tại `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng).

Mở trình duyệt và truy cập URL được hiển thị trong terminal.

---

## ⚙️ Cấu Hình Môi Trường

### Backend Configuration

File: `backend/PirateTreasure/PirateTreasure/appsettings.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=awing_test;User=root;Password=YOUR_PASSWORD;"
  }
}
```

### Frontend Configuration

File: `frontend/.env`

```env
VITE_API_URL=http://localhost:5029/api
VITE_API_TIMEOUT=30000
VITE_API_LOGGING=true
```

---

## 🚀 Chạy Dự Án

### Cách 1: Chạy Từng Phần Riêng Biệt

#### Terminal 1 - Database
Đảm bảo MySQL đang chạy:
```bash
# Windows
net start MySQL80

# macOS/Linux
sudo systemctl start mysql
# hoặc
brew services start mysql
```

#### Terminal 2 - Backend
```bash
cd backend/PirateTreasure/PirateTreasure
dotnet run
```

#### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```

### Cách 2: Sử Dụng Script (Nếu có)

Bạn có thể tạo script để chạy tất cả cùng lúc, ví dụ:

**Windows (run.bat)**:
```batch
@echo off
start "Backend" cmd /k "cd backend\PirateTreasure\PirateTreasure && dotnet run"
timeout /t 5
start "Frontend" cmd /k "cd frontend && npm run dev"
```

**macOS/Linux (run.sh)**:
```bash
#!/bin/bash
cd backend/PirateTreasure/PirateTreasure && dotnet run &
sleep 5
cd frontend && npm run dev
```

---

## ✅ Kiểm Tra Kết Nối

### 1. Kiểm Tra Database

```bash
# Kết nối MySQL
mysql -u root -p

# Kiểm tra database
USE awing_test;
SHOW TABLES;
SELECT * FROM pirate_treasures;
```

### 2. Kiểm Tra Backend API

- Mở trình duyệt: `http://localhost:5029` (Swagger UI)
- Hoặc test bằng curl:
```bash
curl http://localhost:5029/api/PirateTreasures
```

### 3. Kiểm Tra Frontend

- Mở trình duyệt: `http://localhost:5173`
- Mở Developer Console (F12) và kiểm tra:
  - Không có lỗi kết nối API
  - API requests thành công

---

## 🔍 Troubleshooting

### Lỗi Kết Nối Database

**Vấn đề**: Backend không kết nối được MySQL

**Giải pháp**:
1. Kiểm tra MySQL đang chạy:
   ```bash
   # Windows
   net start MySQL80
   
   # macOS/Linux
   sudo systemctl status mysql
   ```

2. Kiểm tra connection string trong `appsettings.json`:
   - Đúng server, port, database name
   - Đúng username và password
   - Port mặc định là 3306

3. Kiểm tra firewall có chặn port 3306 không

### Lỗi Port Đã Được Sử Dụng

**Vấn đề**: Port 5029 hoặc 5173 đã được sử dụng

**Giải pháp**:
- **Backend**: Thay đổi port trong `launchSettings.json`:
  ```json
  "applicationUrl": "http://localhost:YOUR_PORT"
  ```
  Và cập nhật `VITE_API_URL` trong frontend `.env`

- **Frontend**: Vite sẽ tự động tìm port khác, hoặc chỉ định port:
  ```bash
  npm run dev -- --port 3000
  ```

### Lỗi CORS

**Vấn đề**: Frontend không gọi được API do CORS

**Giải pháp**:
- Kiểm tra CORS đã được cấu hình trong `Program.cs`:
  ```csharp
  builder.Services.AddCors(options => {
      options.AddPolicy("AllowAll", builder => {
          builder.AllowAnyOrigin()
                 .AllowAnyMethod()
                 .AllowAnyHeader();
      });
  });
  ```

### Lỗi Dependencies

**Vấn đề**: `npm install` hoặc `dotnet restore` lỗi

**Giải pháp**:
1. **Frontend**:
   ```bash
   # Xóa node_modules và package-lock.json
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

2. **Backend**:
   ```bash
   # Clear NuGet cache
   dotnet nuget locals all --clear
   dotnet restore
   ```

### Lỗi Build

**Vấn đề**: `dotnet build` hoặc `npm run build` lỗi

**Giải pháp**:
1. Kiểm tra phiên bản .NET SDK: `dotnet --version`
2. Kiểm tra Node.js version: `node --version`
3. Xem chi tiết lỗi trong terminal và sửa theo hướng dẫn

### Lỗi TypeScript

**Vấn đề**: TypeScript compilation errors

**Giải pháp**:
```bash
cd frontend
npm run build
# Xem chi tiết lỗi và sửa
```

---

## 📚 Tài Liệu Tham Khảo

- [.NET Documentation](https://docs.microsoft.com/dotnet/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Material-UI Documentation](https://mui.com/)

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề không được giải quyết trong hướng dẫn này:

1. Kiểm tra logs trong terminal
2. Kiểm tra Developer Console trong trình duyệt (F12)
3. Xem lại cấu hình trong các file `.env` và `appsettings.json`
4. Đảm bảo tất cả services đang chạy (MySQL, Backend, Frontend)

---

**Chúc bạn setup thành công! 🎉**
