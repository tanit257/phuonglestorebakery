# HƯỚNG DẪN TEST TÍNH NĂNG DRAFT CART (ĐƠN NHÁP)

## Tổng quan

Tính năng Draft Cart cho phép bạn tạo và quản lý nhiều đơn hàng đang chờ xử lý cùng lúc. Khi khách hàng thứ 2 tới trong khi bạn đang tạo đơn cho khách hàng thứ nhất, bạn không cần hủy đơn hiện tại.

---

## Kịch bản Test

### Test 1: Tạo đơn nháp đầu tiên

**Bước thực hiện:**
1. Mở ứng dụng và đăng nhập
2. Click vào "Tạo đơn hàng"
3. Chọn khách hàng A từ danh sách
4. Thêm 2-3 sản phẩm vào giỏ hàng
5. Quan sát panel Draft Cart xuất hiện ở trên cùng

**Kết quả mong đợi:**
- ✅ Panel Draft Cart hiển thị với 1 card
- ✅ Card hiển thị: Tên khách hàng, số lượng SP, tổng tiền, thời gian
- ✅ Card có viền đậm (là draft đang active)
- ✅ Nút "+ Thêm mới" hiển thị bên cạnh

---

### Test 2: Thêm đơn nháp thứ 2

**Bước thực hiện:**
1. Trong khi đang có đơn của khách A (từ Test 1)
2. Click nút "+ Thêm mới" ở panel Draft Cart
3. Chọn khách hàng B
4. Thêm 1-2 sản phẩm khác vào giỏ
5. Kiểm tra panel Draft Cart

**Kết quả mong đợi:**
- ✅ Panel hiển thị 2 cards (khách A và khách B)
- ✅ Card của khách B có viền đậm (đang active)
- ✅ Card của khách A vẫn còn với đầy đủ thông tin
- ✅ Giỏ hàng hiển thị sản phẩm của khách B

---

### Test 3: Chuyển đổi giữa các đơn nháp

**Bước thực hiện:**
1. Có 2 đơn nháp (khách A và B) từ Test 2
2. Click vào card của khách A
3. Kiểm tra giỏ hàng
4. Click vào card của khách B
5. Kiểm tra giỏ hàng lại

**Kết quả mong đợi:**
- ✅ Khi click card khách A:
  - Viền card A đậm lên (active)
  - Giỏ hàng hiển thị sản phẩm của khách A
  - Thông tin khách ở sticky bar là khách A
- ✅ Khi click card khách B:
  - Viền card B đậm lên
  - Giỏ hàng hiển thị sản phẩm của khách B
  - Thông tin khách chuyển sang khách B
- ✅ Thông báo "Đã chuyển sang [tên khách]" hiển thị

---

### Test 4: Sửa đổi sản phẩm trong đơn nháp

**Bước thực hiện:**
1. Chọn đơn của khách A (có 2-3 sản phẩm)
2. Thay đổi số lượng sản phẩm thứ nhất
3. Thêm 1 sản phẩm mới
4. Chuyển sang đơn của khách B
5. Chuyển lại đơn của khách A
6. Kiểm tra giỏ hàng

**Kết quả mong đợi:**
- ✅ Tất cả thay đổi được lưu lại
- ✅ Số lượng đã thay đổi vẫn giữ nguyên
- ✅ Sản phẩm mới vẫn còn trong giỏ
- ✅ Tổng tiền trên card cập nhật chính xác
- ✅ Số lượng SP trên card cập nhật

---

### Test 5: Xóa đơn nháp

**Bước thực hiện:**
1. Có ít nhất 2 đơn nháp
2. Hover vào nút X trên card đơn nháp (không phải đơn đang active)
3. Click nút X
4. Xác nhận xóa (nếu có dialog)
5. Kiểm tra panel

**Kết quả mong đợi:**
- ✅ Dialog xác nhận hiển thị với thông tin: "Xóa đơn của [tên khách]? (X sản phẩm)"
- ✅ Sau khi xác nhận:
  - Đơn nháp bị xóa khỏi panel
  - Đơn active không đổi
  - Giỏ hàng không bị ảnh hưởng
- ✅ Thông báo "Đã xóa đơn nháp" hiển thị

---

### Test 6: Xóa đơn nháp đang active

**Bước thực hiện:**
1. Có 3 đơn nháp: A, B, C
2. Đang active đơn B
3. Click nút X trên card đơn B
4. Xác nhận xóa

**Kết quả mong đợi:**
- ✅ Dialog xác nhận hiển thị
- ✅ Sau khi xóa:
  - Đơn B biến mất
  - Tự động chuyển sang đơn A hoặc C
  - Giỏ hàng hiển thị sản phẩm của đơn mới
  - Thông tin khách cập nhật

---

### Test 7: Hoàn tất đơn hàng (Tạo đơn)

**Bước thực hiện:**
1. Có 3 đơn nháp: A, B, C
2. Chọn đơn B (làm active)
3. Click nút "Tạo đơn"
4. Đợi đơn được tạo thành công
5. Kiểm tra panel Draft Cart

**Kết quả mong đợi:**
- ✅ Đơn hàng được tạo thành công
- ✅ Thông báo "Tạo đơn hàng thành công!"
- ✅ Đơn B biến mất khỏi panel
- ✅ Tự động chuyển sang đơn A hoặc C
- ✅ Giỏ hàng hiển thị sản phẩm của đơn tiếp theo
- ✅ Nếu chỉ còn 1 đơn và tạo xong → Quay về trạng thái trống

---

### Test 8: Refresh trang (LocalStorage persistence)

**Bước thực hiện:**
1. Tạo 2-3 đơn nháp với sản phẩm khác nhau
2. Ghi nhớ số lượng đơn, tên khách, số sản phẩm
3. Refresh trang (F5 hoặc Cmd+R)
4. Quay lại trang "Tạo đơn hàng"
5. Kiểm tra panel Draft Cart

**Kết quả mong đợi:**
- ✅ Tất cả đơn nháp được khôi phục
- ✅ Số lượng đơn giống như trước
- ✅ Tên khách, số sản phẩm, tổng tiền chính xác
- ✅ Đơn active trước khi refresh vẫn active
- ✅ Giỏ hàng hiển thị đúng sản phẩm

---

### Test 9: Xóa tất cả (Clear Cart)

**Bước thực hiện:**
1. Có 1 đơn nháp với 3 sản phẩm
2. Click nút "Xóa tất cả" ở góc trên bên phải
3. Kiểm tra panel và giỏ hàng

**Kết quả mong đợi:**
- ✅ Dialog xác nhận xóa đơn hiển thị
- ✅ Sau khi xác nhận:
  - Đơn nháp bị xóa khỏi panel
  - Giỏ hàng trống
  - Panel Draft Cart biến mất (vì không còn đơn nào)
  - Customer selector hiển thị lại

---

### Test 10: Tạo nhiều đơn nháp (Giới hạn 10)

**Bước thực hiện:**
1. Tạo 10 đơn nháp khác nhau
2. Thử tạo đơn nháp thứ 11
3. Kiểm tra nút "+ Thêm mới"

**Kết quả mong đợi:**
- ✅ Panel hiển thị 10 cards đơn nháp
- ✅ Nút "+ Thêm mới" biến mất khi đủ 10 đơn
- ✅ Có thể scroll ngang để xem tất cả 10 đơn
- ✅ Vẫn chuyển đổi giữa các đơn bình thường

---

### Test 11: Invoice Mode (Chế độ Hóa đơn)

**Bước thực hiện:**
1. Tạo 2 đơn nháp ở Real Mode
2. Chuyển sang Invoice Mode (toggle ở header)
3. Kiểm tra panel Draft Cart
4. Tạo 1 đơn nháp mới ở Invoice Mode
5. Chuyển lại Real Mode

**Kết quả mong đợi:**
- ✅ Panel Draft Cart ở Real Mode biến mất khi chuyển sang Invoice Mode
- ✅ Panel mới hiển thị ở Invoice Mode (màu hồng/rose)
- ✅ Đơn nháp Invoice Mode hoàn toàn độc lập
- ✅ Chuyển lại Real Mode → panel Real Mode hiển thị với 2 đơn ban đầu
- ✅ Mỗi mode có danh sách đơn nháp riêng

---

### Test 12: Copy đơn hàng (không mất đơn nháp hiện tại)

**Bước thực hiện:**
1. Tạo 2 đơn nháp: Khách A (3 sản phẩm), Khách B (2 sản phẩm)
2. Tạo đơn cho Khách A (hoàn tất)
3. Vào trang "Đơn hàng", tìm đơn của Khách A vừa tạo
4. Click "Copy đơn" trên đơn của Khách A
5. Quay lại trang "Tạo đơn hàng"
6. Kiểm tra panel và giỏ hàng

**Kết quả mong đợi:**
- ✅ Panel hiển thị 2 đơn nháp: Khách B (cũ) + Khách A (mới copy)
- ✅ Đơn nháp của Khách B vẫn còn nguyên vẹn với 2 sản phẩm
- ✅ Đơn nháp mới (copy từ Khách A) có 3 sản phẩm giống đơn cũ
- ✅ Đơn nháp active là đơn vừa copy (Khách A)
- ✅ Giỏ hàng hiển thị 3 sản phẩm của đơn copy
- ✅ Số lượng, giá, chiết khấu giống đơn gốc
- ✅ Có thể chỉnh sửa đơn copy trước khi tạo đơn mới

---

### Test 13: Thời gian hiển thị (Time Display)

**Bước thực hiện:**
1. Tạo đơn nháp mới
2. Kiểm tra thời gian hiển thị dưới card (ví dụ: "Vừa xong")
3. Đợi 2-3 phút
4. Kiểm tra lại thời gian
5. Refresh trang
6. Kiểm tra thời gian

**Kết quả mong đợi:**
- ✅ Ngay sau khi tạo: "Vừa xong"
- ✅ Sau 2-3 phút: "2 phút" hoặc "3 phút"
- ✅ Sau refresh: Thời gian vẫn chính xác
- ✅ Sau 1 giờ: "1 giờ"
- ✅ Sau 1 ngày: "1 ngày"

---

### Test 14: Auto-cleanup (Tự động dọn dẹp)

**Bước thực hiện:**
1. Tạo 1 đơn nháp
2. Sử dụng DevTools để chỉnh sửa localStorage:
   ```javascript
   // Mở Console trong DevTools
   const drafts = JSON.parse(localStorage.getItem('draftCarts'));
   drafts[0].createdAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(); // 8 ngày trước
   localStorage.setItem('draftCarts', JSON.stringify(drafts));
   ```
3. Refresh trang
4. Kiểm tra panel Draft Cart

**Kết quả mong đợi:**
- ✅ Đơn nháp cũ hơn 7 ngày tự động bị xóa
- ✅ Panel trống (không hiển thị)
- ✅ Không có lỗi trong console

---

## Checklist tổng quan

### Chức năng cơ bản
- [ ] Tạo đơn nháp đầu tiên
- [ ] Thêm đơn nháp mới
- [ ] Chuyển đổi giữa các đơn nháp
- [ ] Sửa đổi sản phẩm trong đơn nháp
- [ ] Xóa đơn nháp không active
- [ ] Xóa đơn nháp đang active
- [ ] Hoàn tất đơn hàng (tạo đơn)
- [ ] Xóa tất cả sản phẩm

### Persistence & Performance
- [ ] Refresh trang - đơn nháp được khôi phục
- [ ] LocalStorage lưu chính xác
- [ ] Giới hạn 10 đơn nháp
- [ ] Auto-cleanup đơn cũ hơn 7 ngày
- [ ] Không lag khi có nhiều đơn nháp

### Dual Mode
- [ ] Draft Cart hoạt động ở Real Mode
- [ ] Draft Cart hoạt động ở Invoice Mode
- [ ] 2 mode có danh sách đơn nháp độc lập
- [ ] Chuyển mode không mất đơn nháp

### Edge Cases
- [ ] Copy đơn hàng tạo đơn nháp mới
- [ ] Thời gian hiển thị chính xác
- [ ] Tổng tiền cập nhật khi sửa sản phẩm
- [ ] Số lượng SP cập nhật chính xác
- [ ] Toast notifications hiển thị đúng

### UI/UX
- [ ] Panel hiển thị đẹp trên desktop
- [ ] Panel hiển thị đẹp trên mobile
- [ ] Scroll ngang hoạt động tốt
- [ ] Màu sắc phù hợp với theme
- [ ] Viền active card rõ ràng
- [ ] Nút X dễ nhấn
- [ ] Thông báo rõ ràng

---

## Báo lỗi

Nếu phát hiện lỗi, vui lòng ghi lại:
1. Kịch bản test đang thực hiện
2. Các bước đã làm
3. Kết quả mong đợi
4. Kết quả thực tế
5. Screenshot (nếu có)
6. Thông báo lỗi trong Console (F12 → Console)

---

## Ghi chú kỹ thuật

### LocalStorage Keys
- `draftCarts` - Danh sách đơn nháp Real Mode
- `activeDraftId` - ID đơn nháp đang active (Real Mode)
- `invoiceDraftCarts` - Danh sách đơn nháp Invoice Mode
- `activeInvoiceDraftId` - ID đơn nháp đang active (Invoice Mode)

### Cấu trúc Draft Cart
```javascript
{
  id: "draft_1707654321_abc123",
  customerId: 1,
  customer: { /* customer object */ },
  items: [ /* cart items */ ],
  total: 150000,
  createdAt: "2024-02-01T10:00:00Z",
  updatedAt: "2024-02-01T10:15:00Z"
}
```

---

**Chúc bạn test tốt! 🚀**
