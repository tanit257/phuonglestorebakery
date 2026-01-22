# Test Dual Mode - Checklist

## Tổng quan tính năng

Hệ thống có 2 mode hoạt động độc lập:
- **Mode Thực tế (Real)**: Quản lý kho hàng và đơn hàng thực tế, giá bán thực
- **Mode Hóa đơn (Invoice)**: Quản lý sổ sách thuế, giá hóa đơn (thường thấp hơn 20%)

### Dữ liệu chia sẻ giữa 2 mode:
- Danh sách khách hàng
- Danh sách nhà cung cấp
- Danh sách sản phẩm (với 2 loại giá)

### Dữ liệu riêng biệt:
- Đơn hàng (orders vs invoiceOrders)
- Phiếu nhập (purchases vs invoicePurchases)
- Tồn kho (stock vs invoiceInventory)

---

## Flow Test

### 1. Khởi động app
```bash
pnpm dev
```

Mở browser tại http://localhost:5173

**Kiểm tra:**
- [ ] Trang chủ hiển thị với Mode Banner (mặc định: Mode Thực tế - màu xanh dương)
- [ ] Có nút toggle mode ở header
- [ ] Stats cards hiển thị đúng dữ liệu mode thực tế

---

### 2. Test Chuyển Mode

**Bước 1:** Click nút toggle mode ở header hoặc banner

**Kiểm tra:**
- [ ] Giao diện chuyển từ màu xanh dương sang màu tím
- [ ] Banner hiển thị "Chế độ Hóa đơn"
- [ ] Stats cards update với dữ liệu mode hóa đơn
- [ ] Recent Orders hiển thị đơn hàng hóa đơn

**Bước 2:** Click lại để chuyển về Mode Thực tế
- [ ] Giao diện chuyển lại màu xanh
- [ ] Dữ liệu hiển thị lại mode thực tế

---

### 3. Test Trang Sản phẩm (/products)

**Bước 1:** Vào trang Sản phẩm

**Kiểm tra ở Mode Thực tế:**
- [ ] Mỗi sản phẩm hiển thị 2 giá: Giá thực tế (highlight) + Giá hóa đơn (mờ)
- [ ] Tồn kho thực tế được highlight
- [ ] Stripe indicator màu xanh "Thực tế"

**Kiểm tra ở Mode Hóa đơn:**
- [ ] Giá hóa đơn được highlight (màu tím)
- [ ] Tồn kho hóa đơn được highlight
- [ ] Stripe indicator màu tím "Hóa đơn"

**Bước 2:** Thử thêm sản phẩm mới
- [ ] Form có field nhập cả 2 giá
- [ ] Sản phẩm mới xuất hiện với đầy đủ thông tin

---

### 4. Test Tạo Đơn Hàng (/create-order)

**Test ở Mode Thực tế:**

1. Chọn khách hàng
2. Thêm sản phẩm vào giỏ hàng

**Kiểm tra:**
- [ ] Mode indicator card hiển thị "Chế độ Thực tế" (màu xanh)
- [ ] Giá sản phẩm là giá thực tế
- [ ] Tồn kho hiển thị là tồn kho thực tế
- [ ] Có thể nhập giảm giá (discount)
- [ ] Có thể nhập giá tùy chỉnh

3. Click "Tạo đơn"
- [ ] Đơn được tạo thành công
- [ ] Redirect về trang chủ

**Test ở Mode Hóa đơn:**

1. Chuyển sang Mode Hóa đơn
2. Vào trang Tạo đơn hàng

**Kiểm tra:**
- [ ] Mode indicator card hiển thị "Chế độ Hóa đơn" (màu tím)
- [ ] Giá sản phẩm là giá hóa đơn (thấp hơn ~20%)
- [ ] Tồn kho hiển thị là tồn kho hóa đơn
- [ ] KHÔNG có field giảm giá (discount)
- [ ] Có thể nhập giá tùy chỉnh

3. Click "Tạo đơn"
- [ ] Đơn hóa đơn được tạo thành công
- [ ] Đơn này KHÔNG xuất hiện trong danh sách đơn thực tế

---

### 5. Test Trang Đơn Hàng (/orders)

**Ở Mode Thực tế:**
- [ ] Chỉ hiển thị đơn hàng thực tế
- [ ] Mỗi đơn có badge "Thực tế" màu xanh
- [ ] Filter theo tháng/khách hàng hoạt động bình thường

**Ở Mode Hóa đơn:**
- [ ] Chỉ hiển thị đơn hàng hóa đơn
- [ ] Mỗi đơn có badge "Hóa đơn" màu tím
- [ ] Giao diện tổng thể chuyển sang tone tím

**Kiểm tra độc lập:**
- [ ] Đánh dấu thanh toán đơn ở mode này KHÔNG ảnh hưởng mode kia
- [ ] Xóa đơn ở mode này KHÔNG ảnh hưởng mode kia

---

### 6. Test Dashboard Stats

**Ở Mode Thực tế:**
- Doanh thu hôm nay: Tính từ đơn thực tế đã thanh toán
- Tổng công nợ: Tính từ đơn thực tế chưa thanh toán

**Ở Mode Hóa đơn:**
- Doanh thu hôm nay: Tính từ đơn hóa đơn đã thanh toán
- Tổng công nợ: Tính từ đơn hóa đơn chưa thanh toán

**Kiểm tra:**
- [ ] Số liệu 2 mode khác nhau
- [ ] Số liệu mode hóa đơn thường thấp hơn (vì giá hóa đơn thấp hơn)

---

### 7. Test Persistence (LocalStorage)

1. Chuyển sang Mode Hóa đơn
2. Refresh trang (F5)

**Kiểm tra:**
- [ ] Mode vẫn giữ nguyên là Hóa đơn sau khi refresh
- [ ] Dữ liệu vẫn được giữ nguyên

---

## Dữ liệu mẫu (Seed Data)

### Products với 2 giá:
| Sản phẩm | Giá thực tế | Giá hóa đơn |
|----------|-------------|-------------|
| Đường trắng | 25,000 | 20,000 |
| Đường đen | 30,000 | 24,000 |
| Bột cacao | 120,000 | 96,000 |
| Socola đen | 150,000 | 120,000 |
| Hạt hạnh nhân | 200,000 | 160,000 |

### Tồn kho (khác nhau giữa 2 mode):
| Sản phẩm | Tồn thực tế | Tồn hóa đơn |
|----------|-------------|-------------|
| Đường trắng | 100 | 80 |
| Bột mì | 150 | 120 |
| Gà | 25 | 20 |

---

## Visual Guide

### Mode Thực tế (Real):
- **Primary color**: Blue (#3B82F6)
- **Background**: Gray tones
- **Icons**: Package icon
- **Labels**: "Thực tế", "TT"

### Mode Hóa đơn (Invoice):
- **Primary color**: Violet (#8B5CF6)
- **Background**: Violet tones
- **Icons**: FileText icon
- **Labels**: "Hóa đơn", "HĐ"

---

## Common Issues

### Issue 1: Dữ liệu không load
**Nguyên nhân**: LocalStorage trống hoặc bị corrupt
**Solution**: Xóa localStorage và refresh
```javascript
localStorage.clear();
location.reload();
```

### Issue 2: Mode không chuyển
**Nguyên nhân**: ModeContext chưa được wrap
**Solution**: Kiểm tra App.jsx có ModeProvider wrapper

### Issue 3: Giá hiển thị sai
**Nguyên nhân**: Product không có invoice_price
**Solution**: Kiểm tra products có field invoice_price

---

## Files liên quan

### Core:
- `src/contexts/ModeContext.jsx` - Mode state management
- `src/hooks/useStore.js` - Invoice state & actions

### Components:
- `src/components/mode/ModeToggle.jsx` - Toggle UI

### Pages (updated for dual mode):
- `src/pages/HomePage.jsx`
- `src/pages/ProductsPage.jsx`
- `src/pages/OrdersPage.jsx`
- `src/pages/CreateOrderPage.jsx`

### Data:
- `src/utils/seedData.js` - Sample data với invoice support
- `supabase_schema.sql` - Database schema
