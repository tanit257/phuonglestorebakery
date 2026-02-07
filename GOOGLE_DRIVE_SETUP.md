# Google Drive API Setup Guide

Hướng dẫn này giúp bạn tạo OAuth credentials để kết nối với Google Drive API.

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng Google account của bạn
3. Click vào dropdown "Select a project" ở góc trên bên trái
4. Click "NEW PROJECT"
5. Nhập project name: `PhuongLeStore-Backup`
6. Click "CREATE"
7. Đợi vài giây để Google tạo project

## Bước 2: Enable Google Drive API

1. Trong Google Cloud Console, đảm bảo bạn đang ở project `PhuongLeStore-Backup`
2. Vào menu hamburger (☰) > "APIs & Services" > "Library"
3. Tìm kiếm "Google Drive API"
4. Click vào "Google Drive API"
5. Click "ENABLE"
6. Đợi API được enable (màn hình sẽ chuyển sang API details)

## Bước 3: Tạo OAuth Consent Screen

1. Vào menu hamburger (☰) > "APIs & Services" > "OAuth consent screen"
2. Chọn "External" (vì đây là personal project)
3. Click "CREATE"

### 3.1 App Information
- **App name**: `PhuongLe Store Backup`
- **User support email**: Chọn email của bạn
- **App logo**: (Optional) Upload logo nếu có
- **Application home page**: Để trống hoặc nhập URL Vercel của bạn
- **Authorized domains**: Thêm domain Vercel của bạn (VD: `your-app.vercel.app`)
- **Developer contact information**: Nhập email của bạn
- Click "SAVE AND CONTINUE"

### 3.2 Scopes
1. Click "ADD OR REMOVE SCOPES"
2. Tìm kiếm và chọn các scopes sau:
   - `https://www.googleapis.com/auth/drive.file` - Manage files created by this app
   - `https://www.googleapis.com/auth/drive.appdata` - View and manage app data
3. Click "UPDATE"
4. Click "SAVE AND CONTINUE"

### 3.3 Test Users
1. Click "ADD USERS"
2. Thêm email Google account của bạn (để test)
3. Click "ADD"
4. Click "SAVE AND CONTINUE"

### 3.4 Summary
1. Review thông tin
2. Click "BACK TO DASHBOARD"

## Bước 4: Tạo OAuth Credentials

1. Vào menu hamburger (☰) > "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. Chọn Application type: "Web application"
4. Nhập name: `PhuongLeStore Web Client`

### 4.1 Authorized JavaScript origins
Click "ADD URI" và thêm:
- `http://localhost:5173` (cho development)
- `https://your-app.vercel.app` (thay bằng domain Vercel của bạn)

### 4.2 Authorized redirect URIs
Click "ADD URI" và thêm:
- `http://localhost:5173/auth/google/callback` (cho development)
- `https://your-app.vercel.app/auth/google/callback` (thay bằng domain Vercel của bạn)

5. Click "CREATE"

## Bước 5: Lấy Client ID và Client Secret

1. Sau khi tạo xong, một popup sẽ hiện ra với:
   - **Client ID**: Một chuỗi dài như `123456789-abc...googleusercontent.com`
   - **Client Secret**: Một chuỗi ngắn hơn như `GOCSPX-...`

2. **LƯU LẠI** hai giá trị này! Bạn sẽ cần chúng cho file `.env`

3. Nếu bạn đóng popup, bạn có thể xem lại bằng cách:
   - Vào "Credentials"
   - Click vào OAuth client name (`PhuongLeStore Web Client`)
   - Client ID và Client Secret sẽ hiển thị

## Bước 6: Tạo Service Account (cho Vercel Cron)

Vercel Cron job không thể dùng OAuth (vì không có user interaction), nên ta cần Service Account.

1. Vào "Credentials" > "CREATE CREDENTIALS" > "Service account"
2. Nhập Service account name: `backup-cron`
3. Service account ID: `backup-cron` (auto-generated)
4. Click "CREATE AND CONTINUE"
5. Role: Chọn "Editor" (hoặc "Owner" nếu muốn full access)
6. Click "CONTINUE"
7. Click "DONE"

### 6.1 Tạo Service Account Key

1. Vào "Credentials", scroll xuống "Service Accounts"
2. Click vào service account `backup-cron@...`
3. Vào tab "KEYS"
4. Click "ADD KEY" > "Create new key"
5. Chọn "JSON"
6. Click "CREATE"
7. File JSON sẽ tự động download về máy

**QUAN TRỌNG**: File JSON này chứa private key. **KHÔNG** commit vào Git! Lưu an toàn.

## Bước 7: Share Google Drive folder với Service Account

Sau khi app tạo folder "PhuongLeStore-Backups" trên Google Drive:

1. Mở Google Drive
2. Tìm folder "PhuongLeStore-Backups"
3. Right-click > "Share"
4. Thêm email của service account (VD: `backup-cron@phuongle-store-backup.iam.gserviceaccount.com`)
5. Chọn role: "Editor"
6. Click "Send"

Bây giờ Cron job có thể upload backups vào folder này!

## Bước 8: Cập nhật Environment Variables

Thêm vào file `.env`:

```env
# Google OAuth (cho user manual backup)
VITE_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Google Service Account (cho Vercel Cron)
GOOGLE_SERVICE_ACCOUNT_EMAIL=backup-cron@phuongle-store-backup.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Backup Encryption
BACKUP_ENCRYPTION_KEY=generate_random_32_char_string_here

# Email Alerts (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
ALERT_EMAIL=your_email@example.com

# Cron Secret
CRON_SECRET=generate_random_secret_here
```

## Bước 9: Deploy lên Vercel

1. Thêm environment variables vào Vercel:
   - Vào Vercel Dashboard > Project > Settings > Environment Variables
   - Thêm tất cả biến từ file `.env` ở trên
   - Click "Save"

2. Redeploy project để apply changes

## Bước 10: Test OAuth Flow

1. Chạy app local: `npm run dev`
2. Vào `/backup` page
3. Click "Connect Google Drive"
4. Đăng nhập bằng Google account
5. Cho phép app access Google Drive
6. Nếu thành công, bạn sẽ thấy message "Connected to Google Drive"

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Kiểm tra lại "Authorized redirect URIs" trong Google Cloud Console
- Phải match chính xác với URL trong app

### Error: "Access blocked: This app's request is invalid"
- Kiểm tra lại OAuth consent screen
- Đảm bảo email của bạn được thêm vào "Test users"

### Error: "Invalid client"
- Kiểm tra lại Client ID và Client Secret
- Đảm bảo copy đúng và không có space thừa

### Service Account không có quyền access Drive
- Kiểm tra xem đã share folder "PhuongLeStore-Backups" với service account chưa
- Kiểm tra role của service account (phải là Editor hoặc Owner)

## Bảo mật

- **KHÔNG** commit file service account JSON vào Git
- **KHÔNG** share Client Secret với ai
- Enable 2FA cho Google account
- Thường xuyên rotate credentials (mỗi 6 tháng)
- Monitor Google Cloud audit logs để phát hiện hoạt động bất thường

---

**Sau khi setup xong, quay lại terminal và chạy:**
```bash
npm install
npm run dev
```

Vào `/backup` để test backup system!
