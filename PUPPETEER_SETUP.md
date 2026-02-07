# Puppeteer Setup - Hướng dẫn sử dụng

## Đã cài đặt thành công

✅ Puppeteer MCP Server (global)
✅ Puppeteer package (dev dependency)
✅ 3 scripts helper để debug UI

## Cấu hình MCP

File cấu hình đã được tạo tại: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**QUAN TRỌNG:** Khởi động lại Claude Code để MCP server có hiệu lực!

## Scripts có sẵn

### 1. Screenshot Tool

Chụp ảnh màn hình bất kỳ trang nào:

```bash
# Chụp trang chủ
npm run screenshot

# Chụp trang cụ thể
npm run screenshot http://localhost:3000/orders output.png

# Hoặc dùng node trực tiếp
node scripts/screenshot.js http://localhost:3000/inventory inventory.png
```

**Output:** File PNG với full page screenshot

### 2. UI Crawler

Phân tích toàn bộ cấu trúc UI và tìm lỗi:

```bash
# Crawl trang chủ
npm run crawl-ui

# Crawl trang cụ thể
npm run crawl-ui http://localhost:3000/orders orders-report.json

# Hoặc dùng node trực tiếp
node scripts/crawl-ui.js http://localhost:3000/inventory
```

**Output:**
- File JSON với đầy đủ thông tin về UI
- Screenshot kèm theo
- Danh sách các vấn đề tìm thấy (missing alt text, empty buttons, duplicate IDs, etc.)

### 3. UI Flow Tester

Test các user flows:

```bash
# Test login flow
npm run test-ui-flow login

# Test create order flow
npm run test-ui-flow create-order

# Test inventory flow
npm run test-ui-flow inventory
```

**Output:** Screenshots của từng bước trong flow (lưu tại `screenshots/`)

## Các khả năng của Puppeteer

### 1. Debug UI trực quan
- Chụp ảnh màn hình full page
- So sánh UI trước/sau thay đổi
- Test responsive design

### 2. Crawl & Analyze
- Extract HTML/CSS/JavaScript
- Phân tích cấu trúc DOM
- Tìm các lỗi accessibility
- Kiểm tra duplicate IDs
- Validate form elements

### 3. Automated Testing
- Test user flows tự động
- Click buttons, fill forms
- Navigate giữa các trang
- Capture console logs & errors

### 4. Performance Testing
- Đo load time
- Kiểm tra network requests
- Monitor memory usage

## Ví dụ sử dụng

### Debug một trang cụ thể

```bash
# 1. Start dev server
npm run dev

# 2. Chụp screenshot
npm run screenshot http://localhost:3000/orders orders-page.png

# 3. Crawl UI để phân tích
npm run crawl-ui http://localhost:3000/orders orders-analysis.json

# 4. Xem report
cat orders-analysis.json
```

### So sánh UI trước/sau fix bug

```bash
# Trước khi fix
npm run screenshot http://localhost:3000/login before-fix.png

# [Fix bug ở đây]

# Sau khi fix
npm run screenshot http://localhost:3000/login after-fix.png

# So sánh 2 screenshots
```

### Test một flow hoàn chỉnh

```bash
# Test toàn bộ create order flow
npm run test-ui-flow create-order

# Xem screenshots
ls -la screenshots/
```

## Tích hợp với Claude Code

Sau khi khởi động lại Claude Code, bạn có thể yêu cầu:

```
"Hãy chụp ảnh màn hình trang orders của localhost:3000"
"Crawl UI của trang inventory và tìm các lỗi"
"Test login flow và cho tôi biết có vấn đề gì không"
"So sánh UI của trang trước và sau khi tôi sửa CSS"
```

Claude Code sẽ sử dụng Puppeteer MCP server để thực hiện các tác vụ này tự động!

## Troubleshooting

### Lỗi "Browser not found"

```bash
# Tải browser cho Puppeteer
npx puppeteer browsers install chrome
```

### Port 3000 không available

Thay đổi URL trong scripts hoặc truyền URL khác:

```bash
npm run screenshot http://localhost:5173
```

### Permission denied

```bash
chmod +x scripts/*.js
```

## Next Steps

1. ✅ Khởi động lại Claude Code
2. ✅ Start dev server: `npm run dev`
3. ✅ Test scripts: `npm run screenshot`
4. ✅ Yêu cầu Claude chụp ảnh/crawl UI

Enjoy visual debugging! 🎉
