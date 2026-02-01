# Hệ Thống Backup & Restore - PhuongLe Store

Hệ thống backup tự động hàng ngày với mã hóa, lưu trữ trên Google Drive, và khả năng phục hồi dữ liệu an toàn.

## Tổng Quan

### Tính năng chính

- ✅ **Backup tự động hàng ngày** - Chạy vào 12:00 AM UTC (7:00 AM Việt Nam)
- ✅ **Backup thủ công** - Tạo backup bất cứ lúc nào qua UI
- ✅ **Mã hóa AES-256** - Bảo mật dữ liệu trước khi upload
- ✅ **Nén Gzip** - Giảm kích thước file backup
- ✅ **Lưu trữ Google Drive** - Miễn phí 15GB
- ✅ **Retention 30 ngày** - Tự động xóa backups cũ
- ✅ **Restore an toàn** - Safety backup trước khi restore
- ✅ **Email alerts** - Thông báo khi backup thành công/thất bại
- ✅ **Download backup** - Tải backup về máy local

### Cấu trúc file

```
phuongle-store/
├── api/
│   └── cron/
│       └── daily-backup.js         # Vercel Cron job - backup tự động
├── src/
│   ├── services/
│   │   ├── googleDrive.js          # Google Drive API integration
│   │   ├── backup.js               # Backup logic with encryption
│   │   ├── restore.js              # Restore with safety mechanism
│   │   └── emailAlert.js           # SendGrid email alerts
│   └── pages/
│       └── BackupPage.jsx          # UI for backup management
├── vercel.json                     # Vercel Cron config
├── .env.example                    # Environment variables template
├── GOOGLE_DRIVE_SETUP.md           # Google Cloud setup guide
└── BACKUP_SYSTEM.md                # This file
```

## Setup Hướng Dẫn

### Bước 1: Google Cloud Console Setup

Làm theo hướng dẫn chi tiết trong [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)

Tóm tắt:
1. Tạo Google Cloud project
2. Enable Google Drive API
3. Tạo OAuth credentials (cho user)
4. Tạo Service Account (cho Cron job)
5. Share Google Drive folder với Service Account

### Bước 2: SendGrid Setup

1. Đăng ký tài khoản SendGrid: https://sendgrid.com/
2. Verify email sender của bạn
3. Tạo API key:
   - Settings > API Keys > Create API Key
   - Chọn "Full Access"
   - Copy API key
4. Add vào `.env`:
   ```
   SENDGRID_API_KEY=SG.xxx
   ALERT_EMAIL=your_email@example.com
   ```

### Bước 3: Environment Variables

Copy `.env.example` thành `.env` và điền các giá trị:

```bash
cp .env.example .env
```

Các biến quan trọng:

```env
# Google OAuth (cho manual backup từ browser)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Google Service Account (cho Vercel Cron)
GOOGLE_SERVICE_ACCOUNT_EMAIL=backup-cron@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Encryption key (32 characters)
VITE_BACKUP_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
BACKUP_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")

# SendGrid
SENDGRID_API_KEY=SG.xxx
ALERT_EMAIL=your_email@example.com

# Cron Secret
CRON_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

**Lưu ý:**
- `VITE_*` variables được sử dụng trong browser (client-side)
- Variables không có `VITE_` chỉ dùng trong Vercel API routes (server-side)
- **KHÔNG** commit file `.env` vào Git!

### Bước 4: Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Thêm environment variables vào Vercel:
   - Vào Project Settings > Environment Variables
   - Thêm tất cả variables từ `.env`
   - Click "Save"
4. Deploy

## Cách Sử Dụng

### 1. Kết nối Google Drive

1. Truy cập `/backup` page
2. Click "Kết nối Google Drive"
3. Đăng nhập Google account
4. Cho phép app access Google Drive
5. Redirect về app (đã kết nối)

### 2. Tạo Backup Thủ Công

1. Vào `/backup` page
2. Click "Tạo backup ngay"
3. Confirm
4. Đợi backup hoàn thành (hiển thị notification)
5. Backup mới xuất hiện trong danh sách

### 3. Xem Danh Sách Backups

- Vào `/backup` page
- Danh sách hiển thị:
  - Tên file backup
  - Ngày tạo
  - Kích thước file
  - Actions (Download, Restore, Delete)

### 4. Download Backup

1. Click icon Download trên backup muốn tải
2. File sẽ tự động download về máy
3. File format: `backup-YYYY-MM-DDTHH-mm-ss.json.gz`

### 5. Restore Backup

⚠️ **CẢNH BÁO:** Restore sẽ **XÓA TOÀN BỘ** data hiện tại!

1. Click icon Restore trên backup muốn phục hồi
2. Xem preview data sẽ được restore
3. Check "Tôi hiểu rủi ro"
4. Click "Xác nhận"
5. Đợi restore hoàn thành
6. Trang tự động reload

**Safety Mechanism:**
- Trước khi restore, hệ thống tạo safety backup trong sessionStorage
- Nếu restore failed, tự động rollback về state cũ
- Safety backup tồn tại 1 giờ

### 6. Xóa Backup

1. Click icon Delete trên backup muốn xóa
2. Confirm
3. Backup bị xóa khỏi Google Drive

## Backup Tự Động

### Vercel Cron Job

Backup tự động chạy theo lịch:

- **Tần suất:** Mỗi ngày
- **Thời gian:** 12:00 AM UTC = 7:00 AM VN
- **Endpoint:** `/api/cron/daily-backup`
- **Authentication:** Bearer token với `CRON_SECRET`

### Quy trình backup tự động

1. Vercel Cron trigger endpoint `/api/cron/daily-backup`
2. Verify `CRON_SECRET` để chặn unauthorized access
3. Export toàn bộ data từ Supabase
4. Encrypt data với AES-256
5. Compress với Gzip
6. Upload lên Google Drive (qua Service Account)
7. Cleanup backups cũ hơn 30 ngày
8. Send email alert (success/failure)

### Monitoring

**Email alerts được gửi khi:**
- ✅ Backup thành công (optional, có thể tắt)
- ❌ Backup thất bại (luôn gửi)

**Logs:**
- Xem logs tại Vercel Dashboard > Deployments > Functions
- Filter by `/api/cron/daily-backup`

**Troubleshooting:**
- Nếu backup không chạy, kiểm tra Vercel Cron configuration
- Nếu không nhận email, kiểm tra SendGrid API key
- Nếu upload failed, kiểm tra Service Account permissions

## Backup File Format

### Cấu trúc backup

```json
{
  "version": "1.0",
  "timestamp": "2026-01-31T15:30:00Z",
  "mode": "supabase",
  "metadata": {
    "total_products": 50,
    "total_customers": 30,
    "total_orders": 120,
    "app_version": "1.0.0"
  },
  "data": {
    "products": [...],
    "customers": [...],
    "orders": [...],
    "order_items": [...],
    "purchases": [...],
    "purchase_items": [...],
    "invoice_orders": [...],
    "invoice_order_items": [...],
    "invoice_purchases": [...],
    "invoice_purchase_items": [...],
    "invoice_inventory": [...]
  }
}
```

### Encryption

- **Algorithm:** AES-256-CBC
- **Key:** 32 characters (256 bits)
- **IV:** Random 16 bytes per backup
- **IV Storage:** Included in metadata

### Compression

- **Algorithm:** Gzip
- **Compression ratio:** ~70-80% (depends on data)
- **Example:** 1MB JSON → 200-300KB gzipped

## Security Best Practices

### 1. Bảo vệ Credentials

❌ **KHÔNG:**
- Commit `.env` vào Git
- Share Client Secret hoặc Service Account key
- Để Private Key trong public repositories
- Hardcode credentials trong code

✅ **NÊN:**
- Sử dụng `.gitignore` cho `.env`
- Lưu credentials trong Vercel Environment Variables
- Rotate credentials mỗi 6 tháng
- Enable 2FA cho Google account

### 2. Encryption Key Management

- Generate strong random key (32 chars)
- **KHÔNG** share encryption key với ai
- Store key an toàn (password manager)
- Nếu mất key, **KHÔNG THỂ** decrypt backups cũ

### 3. Access Control

- Chỉ admin account có quyền access `/backup` page
- Implement role-based access control nếu nhiều users
- Monitor Google Drive audit logs

### 4. Backup Verification

- Test restore định kỳ (mỗi tháng)
- Verify backup integrity với checksum
- Đảm bảo backup không corrupt

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Nguyên nhân:** Redirect URI không match với Google OAuth config

**Giải pháp:**
1. Vào Google Cloud Console > Credentials
2. Edit OAuth client
3. Thêm exact redirect URI:
   - `http://localhost:5173/auth/google/callback` (local)
   - `https://your-app.vercel.app/auth/google/callback` (production)
4. Save và thử lại

### Error: "Invalid client"

**Nguyên nhân:** Client ID hoặc Secret sai

**Giải pháp:**
1. Kiểm tra `VITE_GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`
2. Đảm bảo không có space thừa
3. Copy lại từ Google Cloud Console

### Error: "Service Account không có quyền"

**Nguyên nhân:** Service Account chưa được share folder

**Giải pháp:**
1. Vào Google Drive
2. Tìm folder "PhuongLeStore-Backups"
3. Right-click > Share
4. Thêm service account email
5. Chọn role "Editor"

### Error: "Encryption key must be 32 characters"

**Nguyên nhân:** Encryption key sai độ dài

**Giải pháp:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
Copy output vào `VITE_BACKUP_ENCRYPTION_KEY`

### Backup không chạy tự động

**Kiểm tra:**
1. Vercel Cron có enabled không?
   - Project Settings > Cron Jobs
2. `CRON_SECRET` đúng chưa?
3. Service Account credentials đúng chưa?
4. Xem logs: Vercel > Functions > `/api/cron/daily-backup`

### Email không gửi được

**Kiểm tra:**
1. SendGrid API key còn valid không?
2. `ALERT_EMAIL` đã verify chưa?
3. SendGrid quota còn không? (Free: 100 emails/day)
4. Check SendGrid Activity Feed

### Restore thất bại

**Quy trình:**
1. Hệ thống tự động rollback về state cũ
2. Kiểm tra error message
3. Verify backup file không corrupt:
   ```bash
   # Download backup
   # Try decrypt locally
   ```
4. Nếu vẫn failed, contact admin

## FAQ

### Q: Backup có bao gồm attachments/files không?

A: Không. Backup chỉ bao gồm database (Supabase tables). Nếu có files (images, PDFs), cần backup riêng hoặc lưu trên cloud storage.

### Q: Tôi có thể restore backup từ ngày cũ không?

A: Có, nhưng lưu ý:
- Mọi data từ ngày backup đến hiện tại sẽ bị mất
- Nên tạo manual backup hiện tại trước khi restore backup cũ

### Q: Backup có hoạt động với localStorage mode không?

A: Hiện tại Cron job chỉ support Supabase mode. Với localStorage, bạn chỉ có thể tạo manual backup từ browser.

### Q: Tôi có thể thay đổi thời gian backup tự động không?

A: Có, edit `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/daily-backup",
    "schedule": "0 2 * * *"  // 2:00 AM UTC
  }]
}
```

### Q: Backup có tốn tiền không?

A: Không, nếu:
- Google Drive: Dưới 15GB (free tier)
- Vercel: Dưới 100GB-Hours functions (free tier)
- SendGrid: Dưới 100 emails/day (free tier)

### Q: Tôi mất encryption key thì sao?

A: **KHÔNG THỂ** decrypt backups cũ. Hãy:
1. Tạo key mới
2. Tạo backup mới với key mới
3. Xóa backups cũ (vì không decrypt được)

### Q: Làm sao để test restore trên staging?

A:
1. Tạo Supabase project riêng cho staging
2. Deploy app lên Vercel với staging URL
3. Restore backup trên staging
4. Verify data
5. Nếu OK, mới restore trên production

## Performance

### Backup Size

| Records | JSON Size | Compressed | Upload Time |
|---------|-----------|------------|-------------|
| 100     | ~50 KB    | ~10 KB     | <1s         |
| 1,000   | ~500 KB   | ~100 KB    | ~2s         |
| 10,000  | ~5 MB     | ~1 MB      | ~5s         |
| 100,000 | ~50 MB    | ~10 MB     | ~30s        |

### Restore Time

| Records | Restore Time |
|---------|--------------|
| 100     | ~2s          |
| 1,000   | ~5s          |
| 10,000  | ~20s         |
| 100,000 | ~2min        |

**Lưu ý:** Times trên là ước tính, phụ thuộc vào network speed và Supabase performance.

## Roadmap

Future improvements:

- [ ] Incremental backups (chỉ backup data thay đổi)
- [ ] Multiple backup destinations (Google Drive + Dropbox)
- [ ] Backup scheduling UI (cho phép user chọn giờ backup)
- [ ] Backup diff viewer (xem thay đổi giữa 2 backups)
- [ ] Backup compression options (Brotli, Zstandard)
- [ ] Point-in-time recovery (restore về specific timestamp)
- [ ] Backup encryption with user password (thay vì env key)
- [ ] Webhook notifications (Slack, Discord)

## Support

Nếu gặp vấn đề:

1. Kiểm tra [Troubleshooting](#troubleshooting)
2. Xem logs tại Vercel Dashboard
3. Kiểm tra Google Drive audit logs
4. Create issue trên GitHub

---

**Last updated:** 2026-01-31

**Version:** 1.0.0

**Author:** Claude Sonnet 4.5
