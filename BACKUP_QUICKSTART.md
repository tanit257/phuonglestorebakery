# Backup System - Quick Start Guide

Hướng dẫn nhanh để setup hệ thống backup cho PhuongLe Store.

## 📋 Prerequisites

- [x] Google account
- [x] SendGrid account (free tier OK)
- [x] Vercel account
- [x] Node.js installed

## 🚀 Quick Setup (5 bước)

### 1. Google Cloud Console

```bash
# Truy cập: https://console.cloud.google.com/
# Làm theo: GOOGLE_DRIVE_SETUP.md (10-15 phút)
```

**Kết quả cần có:**
- ✅ Google OAuth Client ID & Secret
- ✅ Service Account Email & Private Key
- ✅ Google Drive API enabled

### 2. SendGrid Setup

```bash
# Đăng ký: https://sendgrid.com/
# Tạo API key: Settings > API Keys > Create API Key
# Verify email: Settings > Sender Authentication
```

**Kết quả cần có:**
- ✅ SendGrid API Key
- ✅ Verified sender email

### 3. Environment Variables

```bash
# Copy template
cp .env.example .env

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate cron secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env và điền tất cả values
```

**Variables cần điền:**
```env
VITE_GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="xxx"
VITE_BACKUP_ENCRYPTION_KEY=xxx (32 chars)
BACKUP_ENCRYPTION_KEY=xxx (32 chars)
SENDGRID_API_KEY=SG.xxx
ALERT_EMAIL=xxx@example.com
CRON_SECRET=xxx
```

### 4. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "feat: add backup system"
git push

# Import to Vercel
# Add environment variables in Vercel dashboard
# Deploy
```

### 5. Test Backup

1. Truy cập `https://your-app.vercel.app/backup`
2. Click "Kết nối Google Drive"
3. Đăng nhập Google
4. Click "Tạo backup ngay"
5. ✅ Xem backup trong danh sách

## ⚙️ Automatic Backup

Backup tự động sẽ chạy hàng ngày vào:
- **12:00 AM UTC** = **7:00 AM Vietnam**

Kiểm tra logs:
- Vercel Dashboard > Functions > `/api/cron/daily-backup`

## 📧 Email Alerts

Bạn sẽ nhận email khi:
- ❌ Backup failed (cần action ngay)
- ✅ Backup success (optional)

## 🔒 Security Checklist

- [ ] Đã add `.env` vào `.gitignore`
- [ ] Đã add tất cả env vars vào Vercel
- [ ] Đã enable 2FA cho Google account
- [ ] Đã save encryption key an toàn (password manager)
- [ ] Đã verify SendGrid sender email

## 📖 Full Documentation

Xem [BACKUP_SYSTEM.md](./BACKUP_SYSTEM.md) để biết:
- Chi tiết cách hoạt động
- Troubleshooting guide
- Security best practices
- FAQ

## 🆘 Common Issues

### "redirect_uri_mismatch"
→ Add exact redirect URI vào Google OAuth config

### "Invalid client"
→ Kiểm tra lại Client ID & Secret

### Backup không chạy tự động
→ Kiểm tra Vercel Cron config và logs

### Email không gửi
→ Verify sender email trong SendGrid

## ✅ Testing Checklist

- [ ] Manual backup works
- [ ] Backup xuất hiện trong Google Drive
- [ ] Download backup works
- [ ] Restore backup works (test trên staging!)
- [ ] Email alerts works
- [ ] Automatic backup chạy đúng giờ

## 📊 Monitoring

**Daily checks:**
- [ ] Check email alerts (backup success/fail)
- [ ] Verify backup trong Google Drive

**Weekly checks:**
- [ ] Xem Vercel function logs
- [ ] Check Google Drive storage usage
- [ ] Verify backup count (should be ≤30)

**Monthly checks:**
- [ ] Test restore trên staging environment
- [ ] Review security logs
- [ ] Update credentials nếu cần

## 💡 Pro Tips

1. **Test restore định kỳ** - Backup vô dụng nếu không restore được
2. **Giữ encryption key an toàn** - Mất key = mất hết backups
3. **Monitor email alerts** - Đừng ignore backup failed emails
4. **Use staging environment** - Test restore trước khi restore production
5. **Document everything** - Ghi chú lại mọi thay đổi về credentials

## 🎯 Next Steps

Sau khi setup xong:

1. ✅ Tạo 1 manual backup để test
2. ✅ Test download backup
3. ✅ Test restore trên staging (nếu có)
4. ✅ Đợi automatic backup chạy (sáng mai 7:00 AM)
5. ✅ Verify nhận email alert
6. ✅ Setup monitoring dashboards

---

**Need help?** Xem [BACKUP_SYSTEM.md](./BACKUP_SYSTEM.md) hoặc [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)

**Last updated:** 2026-01-31
