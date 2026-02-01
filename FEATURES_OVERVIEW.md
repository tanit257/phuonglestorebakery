# PHUONG LE STORE - TỔNG QUAN TÍNH NĂNG

## Giới thiệu hệ thống

**Phuong Le Store** là hệ thống quản lý cửa hàng nguyên liệu làm bánh với chế độ kép (Real/Invoice) và hỗ trợ điều khiển bằng giọng nói tiếng Việt. Hệ thống quản lý kho hàng, khách hàng, đơn hàng, mua hàng và công nợ với dữ liệu thực tế và dữ liệu hóa đơn tách biệt hoàn toàn.

---

## 1. HỆ THỐNG CHỂ ĐỘ KÉP (DUAL MODE) ⭐

### Chế độ Thực tế (Real Mode)
- **Mục đích**: Quản lý hoạt động kinh doanh thực tế
- **Giá sử dụng**: Giá thực tế (`product.price`)
- **Kho hàng**: Tồn kho thực (`products.stock`)
- **Màu sắc**: Xanh dương/Cyan gradient
- **Áp dụng**: Bán hàng hàng ngày, quản lý tồn kho thực tế

### Chế độ Hóa đơn (Invoice Mode)
- **Mục đích**: Quản lý hóa đơn chứng từ cho thuế
- **Giá sử dụng**: Giá hóa đơn (`product.invoice_price` - thường 80% giá thực)
- **Kho hàng**: Tồn kho hóa đơn (`invoice_inventory.stock`)
- **Màu sắc**: Tím/Purple gradient
- **Áp dụng**: Xuất hóa đơn VAT, báo cáo thuế

### Tính năng chuyển đổi
- Chuyển đổi giữa 2 chế độ bằng 1 click
- Dữ liệu hoàn toàn độc lập
- Mỗi chế độ có đơn hàng, mua hàng, tồn kho riêng
- Lưu chế độ ưa thích vào localStorage

### Use Cases
1. **Bán lẻ hàng ngày**: Dùng Real Mode, giá thực tế, có chiết khấu
2. **Xuất hóa đơn thuế**: Dùng Invoice Mode, giá hóa đơn, không chiết khấu
3. **Tách biệt sổ sách**: Real Mode cho quản lý thực tế, Invoice Mode cho báo cáo thuế
4. **Tránh kiểm tra thuế**: Giá hóa đơn thấp hơn giá thực tế hợp lý
5. **Đối chiếu tồn kho**: So sánh tồn kho thực vs tồn kho trên giấy

---

## 2. QUẢN LÝ SẢN PHẨM 📦

### Tính năng chính
- ✅ **Thêm sản phẩm** với giá kép (giá thực tế + giá hóa đơn)
- ✏️ **Sửa sản phẩm** - Cập nhật tên, giá, tồn kho, đơn vị
- 🗑️ **Xóa sản phẩm** - Xóa khỏi danh mục
- 🔍 **Tìm kiếm thông minh** - Fuzzy search hỗ trợ tiếng Việt
- 📊 **Import/Export Excel** - Nhập/xuất hàng loạt qua Excel
- 📦 **Đơn vị bao bì lớn** - Hỗ trợ thùng, xô, bao, kiện, két

### Thông tin sản phẩm
```javascript
{
  name: "Bột mì",                    // Tên sản phẩm
  invoice_name: "Bột mì đa dụng",    // Tên trên hóa đơn (tùy chọn)
  product_code: "BM001",              // Mã sản phẩm (tùy chọn)
  unit: "kg",                         // Đơn vị cơ bản
  price: 25000,                       // Giá thực tế
  invoice_price: 20000,               // Giá hóa đơn (mặc định 80%)
  stock: 500,                         // Tồn kho thực
  bulk_unit: "thùng",                 // Đơn vị bao bì lớn
  bulk_quantity: 20                   // Số lượng trong 1 bao bì (20kg/thùng)
}
```

### Đơn vị hỗ trợ
**Đơn vị cơ bản**: kg, g, hộp, gói, chai, lít, vỉ, lọ, cái, túi

**Đơn vị bao bì**: thùng, xô, bao, kiện, két

### Use Cases
1. **Thêm sản phẩm mới**:
   - Nhập tên, chọn đơn vị
   - Nhập giá thực tế (VD: 25,000đ)
   - Giá hóa đơn tự động = 80% (20,000đ)
   - Nhập tồn kho ban đầu

2. **Cập nhật giá hàng loạt**:
   - Export danh sách sản phẩm ra Excel
   - Sửa giá trong Excel
   - Import lại với chế độ override
   - Tất cả giá được cập nhật tự động

3. **Quản lý bao bì lớn**:
   - Sản phẩm: Bột mì, đơn vị: kg
   - Bao bì: 1 thùng = 20kg
   - Khi bán 40kg → Hiển thị: "40kg (2 thùng)"
   - Dễ tính toán và vận chuyển

4. **Tìm kiếm sản phẩm**:
   - Gõ "bot mi" → Tìm thấy "Bột mì"
   - Gõ "suger" → Tìm thấy "Đường"
   - Hỗ trợ typo và tiếng Việt không dấu

5. **Nhập sản phẩm từ Excel**:
   - Tải template Excel
   - Điền thông tin 100 sản phẩm
   - Import 1 lần
   - Kiểm tra trùng lặp tự động

---

## 3. QUẢN LÝ KHÁCH HÀNG 👥

### Loại khách hàng
1. **Tiệm bánh (Bakery)** - Khách hàng kinh doanh (tiệm bánh, quán cà phê)
2. **Cá nhân (Individual)** - Khách lẻ
3. **Nhà cung cấp (Supplier)** - Nhà cung cấp nguyên liệu

### Tính năng
- ✅ **Thêm/Sửa/Xóa khách hàng**
- 📋 **Xem chi tiết khách hàng** - Thông tin đầy đủ, thống kê, đơn hàng gần đây
- 📊 **Import/Export Excel** - Quản lý hàng loạt
- 💰 **Theo dõi công nợ** - Tính nợ theo từng khách
- 🔍 **Tìm kiếm thông minh** - Tìm theo tên, số điện thoại

### Thông tin khách hàng
```javascript
{
  short_name: "Tiệm ABC",             // Tên gọi (bắt buộc)
  full_name: "Tiệm Bánh ABC",         // Tên pháp lý cho hóa đơn
  type: "bakery",                     // bakery/individual/supplier
  phone: "0901234567",                // Số điện thoại
  email: "abc@example.com",           // Email
  address: "123 Nguyễn Văn A, Q1",   // Địa chỉ giao hàng
  billing_address: "456 Lê Văn B",    // Địa chỉ xuất hóa đơn
  tax_code: "0123456789"              // Mã số thuế (doanh nghiệp)
}
```

### Use Cases
1. **Quản lý tiệm bánh**:
   - Thêm thông tin tiệm (tên, địa chỉ, SĐT)
   - Lưu mã số thuế để xuất hóa đơn
   - Theo dõi lịch sử mua hàng
   - Xem tổng công nợ

2. **Khách hàng cá nhân**:
   - Lưu thông tin đơn giản
   - Không cần mã số thuế
   - Theo dõi đơn hàng lẻ

3. **Nhà cung cấp**:
   - Quản lý nhà cung cấp nguyên liệu
   - Theo dõi công nợ phải trả
   - Lịch sử nhập hàng

4. **Xem chi tiết khách hàng**:
   - Click vào khách hàng
   - Xem thống kê: Tổng đơn, tổng tiền, công nợ
   - Xem 10 đơn hàng gần nhất
   - Thông tin liên hệ đầy đủ

5. **Import khách hàng hàng loạt**:
   - Export danh bạ từ hệ thống cũ
   - Format theo template
   - Import vào hệ thống
   - Kiểm tra trùng lặp tự động

---

## 4. QUẢN LÝ ĐỚN HÀNG 📝

### Đơn hàng Chế độ Thực tế (Real Mode)
- Sử dụng giá thực tế (`product.price`)
- Trừ tồn kho thực (`products.stock`)
- Hỗ trợ chiết khấu (% hoặc số tiền cố định)
- Ghi chú cho từng sản phẩm

### Đơn hàng Chế độ Hóa đơn (Invoice Mode)
- Sử dụng giá hóa đơn (`product.invoice_price`)
- Trừ tồn kho hóa đơn (`invoice_inventory.stock`)
- Cho phép sửa giá tùy chỉnh
- Không có hệ thống chiết khấu (tuân thủ thuế)

### Tính năng
- ✅ **Tạo đơn hàng** - Giao diện giỏ hàng
- 📋 **Quản lý đơn nháp (Draft Carts)** ⭐ NEW - Tạo và quản lý nhiều đơn hàng cùng lúc
- ✏️ **Sửa đơn hàng** - Sửa sản phẩm, số lượng, giá
- 🗑️ **Xóa đơn hàng** - Xóa đơn
- 💰 **Đánh dấu Đã trả/Chưa trả** - Theo dõi thanh toán
- 📋 **Sao chép đơn hàng** - Nhân bản đơn cũ nhanh chóng
- 🔍 **Lọc đơn hàng** - Theo tháng, khách hàng, trạng thái
- 🖨️ **In phiếu** - In phiếu giao hàng
- 👁️ **Xem chi tiết** - Thẻ đơn hàng có thể mở rộng

### Cấu trúc đơn hàng
```javascript
{
  customer_id: 1,                    // Khách hàng
  total: 500000,                     // Tổng tiền
  paid: false,                       // Đã thanh toán chưa
  paid_at: null,                     // Thời gian thanh toán
  note: "Giao trước 8h sáng",        // Ghi chú đơn hàng
  order_items: [
    {
      product_id: 1,
      quantity: 5,
      unit_price: 25000,
      subtotal: 125000,
      discount: 5,                   // 5% (Real mode only)
      discountType: "percent",       // percent/fixed
      note: "Bột mì số 13"           // Ghi chú sản phẩm
    }
  ]
}
```

### Quản lý Đơn Nháp (Draft Carts) ⭐ NEW

**Vấn đề giải quyết**: Trước đây, khi đang tạo đơn cho khách A mà có khách B tới, phải hủy đơn của khách A hoặc để khách B đợi.

**Giải pháp**: Hệ thống đơn nháp cho phép tạo và quản lý nhiều đơn hàng đang chờ xử lý cùng lúc.

#### Tính năng
- 🗂️ **Tạo nhiều đơn nháp** - Tối đa 10 đơn nháp cùng lúc
- 🔄 **Chuyển đổi nhanh** - Click để chuyển giữa các đơn nháp
- 💾 **Tự động lưu** - Tất cả thay đổi được lưu tự động vào localStorage
- 🕐 **Hiển thị thời gian** - Xem đơn nháp đã tạo bao lâu
- 🗑️ **Xóa đơn nháp** - Xóa đơn không cần thiết
- 🎯 **Tự động dọn dẹp** - Đơn nháp cũ hơn 7 ngày tự động xóa
- 🔁 **Khôi phục sau refresh** - Đơn nháp được khôi phục khi tải lại trang
- 🎨 **Hỗ trợ cả 2 chế độ** - Hoạt động độc lập trong Real Mode và Invoice Mode

#### Cách sử dụng
1. **Tạo đơn nháp đầu tiên**:
   - Vào trang Tạo đơn hàng
   - Chọn khách hàng A
   - Thêm sản phẩm vào giỏ
   - Đơn nháp tự động được tạo

2. **Thêm đơn nháp thứ 2** (khi khách B tới):
   - Click nút "+ Thêm mới" ở panel đơn nháp
   - Chọn khách hàng B
   - Thêm sản phẩm của khách B
   - Đơn của khách A vẫn được lưu

3. **Chuyển đổi giữa các đơn**:
   - Click vào card đơn nháp để chuyển
   - Giỏ hàng và thông tin khách tự động thay đổi
   - Đơn hiện tại có viền màu đậm hơn

4. **Hoàn tất đơn**:
   - Chuyển sang đơn cần xử lý
   - Click "Tạo đơn"
   - Đơn nháp tự động bị xóa
   - Chuyển sang đơn nháp tiếp theo (nếu có)

5. **Xóa đơn nháp**:
   - Click nút X trên card đơn nháp
   - Xác nhận xóa (nếu có sản phẩm)
   - Đơn nháp bị xóa vĩnh viễn

#### Draft Cart Panel
```
┌─────────────────────────────────────────────────────┐
│ 📋 Đơn nháp (3)                                     │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐           │
│ │ Tiệm A│ │ Tiệm B│ │ Tiệm C│ │  +    │           │
│ │ 3 SP  │ │ 1 SP  │ │ 5 SP  │ │ Thêm  │           │
│ │150.000│ │ 50.000│ │300.000│ │ mới   │           │
│ │5 phút │ │2 phút │ │1 giờ  │ │       │           │
│ └───────┘ └───────┘ └───────┘ └───────┘           │
│ Click vào đơn để chuyển đổi • Tối đa 10 đơn nháp   │
└─────────────────────────────────────────────────────┘
```

### Use Cases
1. **Tạo đơn hàng hàng ngày** (Real Mode):
   - Khách gọi: "5kg bột mì, 2kg đường"
   - Chọn khách hàng → Thêm sản phẩm
   - Áp dụng chiết khấu 5% (khách quen)
   - Ghi chú: "Giao chiều"
   - Đánh dấu chưa trả (trả cuối tháng)
   - In phiếu giao hàng

2. **Xuất hóa đơn VAT** (Invoice Mode):
   - Chuyển sang Invoice Mode
   - Chọn khách có mã số thuế
   - Thêm sản phẩm (giá hóa đơn)
   - Không chiết khấu
   - In hóa đơn chính thức

3. **Xử lý nhiều khách cùng lúc** (Draft Carts) ⭐:
   - Đang tạo đơn cho Tiệm A (3 sản phẩm)
   - Khách B gọi điện đặt hàng gấp
   - Click "+ Thêm mới" → Chọn khách B
   - Tạo đơn cho khách B → Click "Tạo đơn"
   - Tự động quay lại đơn của Tiệm A
   - Hoàn tất đơn của Tiệm A

4. **Copy đơn hàng với Draft Carts**:
   - Xem đơn hàng cũ của khách C
   - Click "Copy đơn"
   - Hệ thống tạo đơn nháp mới với sản phẩm giống hệt
   - Các đơn nháp khác vẫn giữ nguyên
   - Chỉnh sửa và tạo đơn mới

5. **Sửa đơn hàng sai**:
   - Nhân viên nhập nhầm số lượng
   - Click "Sửa" trên đơn hàng
   - Điều chỉnh số lượng/giá
   - Tồn kho tự động cập nhật lại

4. **Sao chép đơn hàng**:
   - Khách đặt hàng giống tháng trước
   - Tìm đơn cũ → Click "Copy"
   - Điều chỉnh số lượng nếu cần
   - Tạo đơn mới nhanh chóng

5. **Lọc và tìm đơn**:
   - Xem đơn tháng 12/2024
   - Lọc chỉ đơn chưa trả
   - Tìm đơn của Tiệm ABC
   - Export báo cáo Excel

---

## 5. QUẢN LÝ MUA HÀNG (Nhập kho) 🛒

### Tính năng
- ✅ **Tạo đơn mua hàng** - Nhập hàng từ nhà cung cấp
- 💰 **Đánh dấu Đã trả/Chưa trả** - Theo dõi công nợ nhà cung cấp
- 🗑️ **Xóa đơn mua** - Xóa phiếu nhập
- 🔍 **Lọc đơn mua** - Theo tháng, nhà cung cấp, trạng thái
- 👁️ **Xem chi tiết** - Xem sản phẩm và giá nhập
- 📈 **Tự động cập nhật tồn** - Tăng tồn kho tự động

### Quy trình nhập hàng
```
1. Chọn nhà cung cấp (type = 'supplier')
2. Thêm sản phẩm vào giỏ
3. Nhập giá nhập cho từng sản phẩm
4. Tạo đơn mua hàng
5. Tồn kho tự động tăng
6. Theo dõi trạng thái thanh toán
```

### Cấu trúc đơn mua hàng
```javascript
{
  supplier_id: 5,                    // Nhà cung cấp
  total: 10000000,                   // Tổng tiền nhập
  paid: false,                       // Đã trả nhà cung cấp chưa
  paid_at: null,                     // Thời gian thanh toán
  note: "Đợt nhập đầu tháng",        // Ghi chú
  purchase_items: [
    {
      product_id: 1,
      quantity: 100,                 // 100kg
      unit_price: 20000,             // Giá nhập 20k/kg
      subtotal: 2000000
    }
  ]
}
```

### Use Cases
1. **Nhập hàng từ nhà cung cấp**:
   - Nhà cung cấp giao 100kg bột mì
   - Tạo đơn mua hàng
   - Nhập giá: 20,000đ/kg
   - Tổng: 2,000,000đ
   - Tồn kho tự động +100kg
   - Đánh dấu chưa trả (trả sau 15 ngày)

2. **Theo dõi công nợ phải trả**:
   - Xem danh sách đơn mua chưa trả
   - Tính tổng nợ phải trả nhà cung cấp
   - Lọc theo nhà cung cấp
   - Đánh dấu đã trả khi chuyển khoản

3. **Phân tích giá nhập**:
   - Xem lịch sử nhập hàng
   - So sánh giá nhập theo thời gian
   - Tìm nhà cung cấp giá tốt nhất
   - Đàm phán giá dựa trên số liệu

4. **Nhập hàng định kỳ**:
   - Đầu tháng nhập hàng thường xuyên
   - Tạo đơn mua từ lịch sử
   - Điều chỉnh số lượng theo nhu cầu
   - Tự động cập nhật tồn kho

5. **Quản lý nhiều nhà cung cấp**:
   - Nhà cung cấp A: Bột mì, đường
   - Nhà cung cấp B: Bơ, sữa
   - Theo dõi riêng từng nhà cung cấp
   - So sánh giá và chất lượng

---

## 6. QUẢN LÝ CÔNG NỢ 💰

### Tính năng chính
- 📊 **Danh sách công nợ** - Tất cả khách hàng có nợ
- 👤 **Chi tiết công nợ khách** - Phân tích nợ từng khách
- 📅 **Thống kê theo kỳ** - Theo dõi công nợ theo tháng:
  - Nợ đầu kỳ
  - Nợ phát sinh trong kỳ
  - Thanh toán trong kỳ
  - Nợ cuối kỳ
- ⚠️ **Cảnh báo quá hạn** - Highlight nợ >30 ngày
- 🔍 **Lọc theo tháng** - Xem nợ theo thời gian
- 💵 **Lọc trạng thái** - Đã trả/Chưa trả/Tất cả
- ⚡ **Thanh toán nhanh** - Đánh dấu đã trả từ trang công nợ

### Cách tính công nợ
```javascript
// Công nợ khách hàng
debt = SUM(unpaid_orders.total)

// Nợ quá hạn (>30 ngày)
overdue_debt = SUM(unpaid_orders WHERE created_at < NOW() - 30 days)

// Thống kê theo tháng
beginning_debt = Previous month's ending debt
new_debt = SUM(unpaid_orders created in month)
payments = SUM(orders paid in month)
ending_debt = beginning_debt + new_debt - payments
```

### Giao diện công nợ
```
┌────────────────────────────────────────────────┐
│ 🔴 CẢN BÁO: 3 khách nợ quá 30 ngày            │
├────────────────────────────────────────────────┤
│ Tiệm ABC          ⚠️ 5,000,000đ (45 ngày)     │
│ Tiệm XYZ          ✅ 2,000,000đ (15 ngày)     │
│ Chị Lan           ⚠️ 1,500,000đ (60 ngày)     │
└────────────────────────────────────────────────┘
```

### Use Cases
1. **Kiểm tra công nợ hàng ngày**:
   - Mở trang Công nợ
   - Xem tổng quan nợ
   - Kiểm tra cảnh báo đỏ (>30 ngày)
   - Gọi điện nhắc khách trả nợ

2. **Theo dõi công nợ theo tháng**:
   - Chọn tháng 12/2024
   - Xem nợ đầu tháng: 10,000,000đ
   - Phát sinh mới: 5,000,000đ
   - Thu về: 8,000,000đ
   - Nợ cuối tháng: 7,000,000đ

3. **Nhắc nợ khách hàng**:
   - Lọc nợ >30 ngày
   - Có 5 khách nợ quá hạn
   - Gọi điện từng khách
   - Ghi chú ngày hẹn trả
   - Theo dõi thanh toán

4. **Đối chiếu công nợ**:
   - Xuất Excel danh sách công nợ
   - Khách hàng đối chiếu
   - Phát hiện sai sót (nếu có)
   - Điều chỉnh đơn hàng

5. **Phân tích khách hàng**:
   - Khách nào hay nợ lâu
   - Khách nào trả đúng hạn
   - Quyết định chính sách:
     - Khách tốt: Cho nợ dài hạn
     - Khách xấu: Yêu cầu trả trước

---

## 7. ĐIỀU KHIỂN GIỌNG NÓI AI (Vietnamese) 🎤

### Lệnh hỗ trợ

#### Tạo đơn hàng
```
"Tạo đơn cho tiệm ABC, 5kg bột mì, 2 hộp bơ"
"Đơn hàng anh Quân, 3kg đường, 1kg chocolate"
"Lập đơn chị Lan, 10kg bột mì số 13"
```

#### Thêm vào giỏ
```
"Thêm 5kg bột mì"
"Bỏ vào 2 hộp bơ"
"Cho thêm 3 chai sữa tươi"
```

#### Xem công nợ
```
"Xem công nợ tiệm ABC"
"Nợ của chị Lan"
"Tiệm Hạnh Phúc nợ bao nhiêu"
```

#### Tìm sản phẩm
```
"Giá bột mì"
"Sản phẩm chocolate"
"Còn bao nhiêu đường"
```

#### Tìm khách hàng
```
"Khách hàng tiệm ABC"
"Tiệm Hạnh Phúc"
"Thông tin anh Quân"
```

### Công nghệ Voice AI
- 🇻🇳 **Hỗ trợ tiếng Việt** (vi-VN)
- 🎯 **Fuzzy matching** với Levenshtein distance
- ✏️ **Chịu lỗi chính tả** - "bot mi" → "bột mì"
- 🔄 **Nhiều phương án** - Chọn kết quả tốt nhất
- 📊 **Đánh giá độ tin cậy** - Confidence scoring
- 🧠 **Nhận biết ngữ cảnh** - Context-aware parsing
- 🔤 **Nhận dạng thanh điệu** - Vietnamese tone-aware
- 🔢 **Nhận số chữ** - "một", "hai", "ba" → 1, 2, 3

### Thuật toán nhận dạng
```javascript
// Example: "Tạo đơn cho tiệm ABC, 5kg bột mì"

1. Speech-to-text: Chuyển giọng nói → text
2. Parse intent: "tạo đơn" → CREATE_ORDER
3. Extract customer: "tiệm ABC" → fuzzy search → Customer #12
4. Extract products: "5kg bột mì" → Product #3, quantity: 5
5. Auto-create order with parsed data
6. Confirm with user: "Đã tạo đơn cho Tiệm ABC: 5kg Bột mì"
```

### Use Cases
1. **Tạo đơn tay bận**:
   - Đang đóng gói hàng
   - Khách gọi điện đặt hàng
   - Nói: "Tạo đơn tiệm ABC, 5kg bột mì, 2kg đường"
   - Hệ thống tự động tạo đơn
   - Không cần chạm màn hình

2. **Tra cứu nhanh**:
   - Khách hỏi: "Bột mì giá bao nhiêu?"
   - Nói: "Giá bột mì"
   - Hiển thị thông tin sản phẩm
   - Nhanh hơn gõ tìm kiếm

3. **Kiểm tra công nợ**:
   - Khách hàng đến trả nợ
   - Nói: "Xem công nợ tiệm ABC"
   - Hiển thị chi tiết công nợ
   - Đánh dấu đã trả

4. **Người dùng khó gõ**:
   - Người lớn tuổi không quen gõ
   - Sử dụng giọng nói tiện lợi
   - Tăng tốc độ làm việc
   - Giảm sai sót

5. **Môi trường ồn**:
   - Cửa hàng đông khách
   - Giọng nói rõ ràng hơn gõ
   - Đa nhiệm hiệu quả
   - Phục vụ nhanh hơn

---

## 8. THỐNG KÊ & DASHBOARD 📊

### Chỉ số trang chủ (Theo chế độ)

#### Chế độ Thực tế (Real Mode)
- 💰 **Doanh thu hôm nay** (giá thực tế)
- 📋 **Tổng công nợ** từ đơn chưa trả
- 📦 **Số đơn hôm nay**
- 🕐 **Danh sách đơn gần đây**
- ⚠️ **Cảnh báo nợ quá hạn**

#### Chế độ Hóa đơn (Invoice Mode)
- 💰 **Doanh thu hóa đơn hôm nay**
- 📋 **Công nợ hóa đơn**
- 📦 **Số hóa đơn hôm nay**
- 🕐 **Hóa đơn gần đây**

### Giao diện Dashboard
```
┌─────────────────────────────────────────────────┐
│           PHUONG LE STORE                       │
│           Chế độ: [THỰC TẾ] 🔵                  │
├─────────────────────────────────────────────────┤
│  💰 Doanh thu hôm nay      📋 Tổng công nợ      │
│     15,000,000đ               25,000,000đ       │
│                                                 │
│  📦 Đơn hàng hôm nay      ⚠️ Nợ quá hạn         │
│     12 đơn                     3 khách          │
├─────────────────────────────────────────────────┤
│  🕐 ĐƠN HÀNG GẦN ĐÂY                            │
│  ✅ Tiệm ABC - 2,500,000đ - Đã trả             │
│  ⏳ Tiệm XYZ - 1,800,000đ - Chưa trả           │
│  ✅ Chị Lan - 500,000đ - Đã trả                │
└─────────────────────────────────────────────────┘
```

### Use Cases
1. **Kiểm tra doanh thu hàng ngày**:
   - Mở app → Xem dashboard
   - Doanh thu hôm nay: 15 triệu
   - So với hôm qua: +2 triệu
   - Phân tích xu hướng

2. **Theo dõi công nợ**:
   - Tổng công nợ: 25 triệu
   - Cảnh báo: 3 khách nợ quá hạn
   - Tổng nợ quá hạn: 10 triệu
   - Ưu tiên thu hồi

3. **Xem đơn hàng gần đây**:
   - 8 đơn gần nhất
   - Trạng thái thanh toán
   - Click vào xem chi tiết
   - In phiếu nếu cần

4. **So sánh Real vs Invoice**:
   - Real Mode: Doanh thu 15 triệu
   - Invoice Mode: Doanh thu 12 triệu
   - Chênh lệch: 3 triệu
   - Hợp lý (giá hóa đơn thấp hơn)

5. **Báo cáo cuối ngày**:
   - Screenshot dashboard
   - Gửi cho chủ tiệm
   - Tổng quan hoạt động
   - Quyết định ngày mai

---

## 9. IMPORT/EXPORT EXCEL 📊

### Import/Export Sản phẩm

#### Export sản phẩm
```
Click "Xuất Excel" → Download file:
┌──────────┬──────────┬───────┬──────┬──────────┬────────────┬──────┐
│ Tên      │ Tên HĐ   │ Mã    │ ĐVT  │ Giá      │ Giá HĐ     │ Tồn  │
├──────────┼──────────┼───────┼──────┼──────────┼────────────┼──────┤
│ Bột mì   │ Bột mì   │ BM001 │ kg   │ 25,000   │ 20,000     │ 500  │
│ Đường    │ Đường    │ D001  │ kg   │ 18,000   │ 14,400     │ 300  │
└──────────┴──────────┴───────┴──────┴──────────┴────────────┴──────┘
```

#### Import sản phẩm
```
1. Tải template Excel
2. Điền dữ liệu:
   - Tên sản phẩm (bắt buộc)
   - Đơn vị (bắt buộc)
   - Giá (bắt buộc)
   - Các trường khác (tùy chọn)
3. Upload file
4. Chọn chế độ:
   - Bỏ qua trùng lặp
   - Cập nhật trùng lặp
5. Xác nhận import
```

### Import/Export Khách hàng

#### Export khách hàng
```
┌────────────┬─────────────┬──────┬──────────┬───────────┬──────────┐
│ Tên gọi    │ Tên đầy đủ  │ Loại │ SĐT      │ Địa chỉ   │ MST      │
├────────────┼─────────────┼──────┼──────────┼───────────┼──────────┤
│ Tiệm ABC   │ Tiệm Bánh   │ ba.. │ 0901..   │ 123 Nguy..│ 012345.. │
│ Chị Lan    │ Nguyễn Lan  │ in.. │ 0907..   │ 456 Lê..  │          │
└────────────┴─────────────┴──────┴──────────┴───────────┴──────────┘
```

#### Tính năng Import
- ✅ **Phát hiện trùng lặp** - Tìm khách hàng đã tồn tại
- 🔄 **Chế độ ghi đè** - Cập nhật hoặc bỏ qua
- ✔️ **Validate dữ liệu** - Kiểm tra trước khi import
- 📋 **Template chuẩn** - Tải template để điền

### Use Cases
1. **Chuyển đổi từ hệ thống cũ**:
   - Export dữ liệu từ Excel cũ
   - Format theo template mới
   - Import vào Phuong Le Store
   - Kiểm tra và điều chỉnh

2. **Cập nhật giá hàng loạt**:
   - Export 200 sản phẩm
   - Sửa giá trong Excel
   - Import với chế độ "Cập nhật"
   - Tất cả giá được cập nhật

3. **Backup dữ liệu**:
   - Export sản phẩm hàng tuần
   - Export khách hàng hàng tuần
   - Lưu vào Google Drive
   - Phòng mất dữ liệu

4. **Chia sẻ với kế toán**:
   - Export danh sách sản phẩm
   - Export danh sách khách hàng
   - Export báo cáo công nợ
   - Gửi file Excel cho kế toán

5. **Nhập dữ liệu ban đầu**:
   - Cửa hàng mới setup
   - Có 500 sản phẩm từ trước
   - Nhập hàng loạt qua Excel
   - Tiết kiệm thời gian

---

## 10. TÍNH NĂNG KỸ THUẬT ⚙️

### Lưu trữ dữ liệu
- **☁️ Supabase (Production)** - PostgreSQL database
  - Row-Level Security
  - Realtime subscriptions
  - Auto-backup

- **💾 LocalStorage (Fallback)** - Offline mode
  - Hoạt động không cần backend
  - Lưu trữ local browser
  - Đồng bộ khi có mạng

- **🔄 Dual Mode Data** - Dữ liệu Real/Invoice tách biệt hoàn toàn

### Xác thực
- **🔧 Dev Mode** - Không cần đăng nhập
- **🔐 Production Mode** - Supabase authentication
- **🛡️ Row-Level Security** - Chỉ user đã xác thực

### Quản lý State
- **⚡ Zustand** - Global state management
- **💾 Persistent Mode** - Lưu chế độ vào localStorage
- **🔄 Real-time Updates** - Cập nhật UI tức thì

### Hiệu năng
- **🔍 Smart Search** - Fuzzy matching algorithm
- **⏳ Lazy Loading** - Load dữ liệu hiệu quả
- **✨ Optimistic Updates** - UI phản hồi ngay lập tức

### Hệ thống In
- **👁️ Print Preview Modal** - Xem trước khi in
- **🎨 Customizable Template** - Tùy chỉnh thông tin cửa hàng
- **📄 Order Details** - Sản phẩm, giá, tổng tiền
- **👤 Customer Info** - Tên, SĐT, địa chỉ

### Responsive Design
- **📱 Mobile-first** - Tối ưu cho điện thoại
- **💻 Desktop-optimized** - Màn hình lớn hiệu quả
- **🎨 Tailwind CSS** - Utility-first styling
- **🎭 Theme System** - Chế độ Real/Invoice khác màu

---

## MA TRẬN TÍNH NĂNG

| Tính năng | Real Mode | Invoice Mode | Ghi chú |
|-----------|-----------|--------------|---------|
| Sản phẩm | ✓ | ✓ | Danh mục chung |
| Khách hàng | ✓ | ✓ | Database chung |
| Đơn hàng | ✓ | ✓ | Bảng riêng biệt |
| Mua hàng | ✓ | ✓ | Bảng riêng biệt |
| Tồn kho | products.stock | invoice_inventory.stock | Tách biệt hoàn toàn |
| Giá | product.price | product.invoice_price | Giá kép |
| Chiết khấu | ✓ | ✗ | Chỉ Real Mode |
| Ghi chú SP | ✓ | ✓ | Cả 2 chế độ |
| Công nợ | ✓ | ✓ | Tính riêng biệt |
| Voice Commands | ✓ | ✓ | Nhận biết chế độ |
| Import/Export | ✓ | ✓ | Hỗ trợ cả 2 |
| In phiếu | ✓ | ✓ | Cả 2 chế độ |

---

## KỊCH BẢN SỬ DỤNG THỰC TẾ

### Kịch bản 1: Bán hàng hàng ngày (Real Mode)
```
📞 Khách gọi điện:
   "Tiệm ABC cần 5kg bột mì, 2kg đường"

🎤 Nhân viên dùng voice:
   "Tạo đơn tiệm ABC, 5kg bột mì, 2kg đường"

💻 Hệ thống:
   ✓ Tự động tạo đơn
   ✓ Tính tiền: 153,000đ
   ✓ Áp dụng giảm 5% (khách quen): 145,350đ

🖨️ In phiếu giao hàng

💰 Đánh dấu "Chưa trả" (trả cuối tháng)

📊 Tồn kho tự động giảm:
   - Bột mì: 500kg → 495kg
   - Đường: 300kg → 298kg
```

### Kịch bản 2: Xuất hóa đơn VAT (Invoice Mode)
```
🔄 Chuyển sang Invoice Mode (click nút toggle)

👤 Chọn khách hàng có mã số thuế:
   Tiệm XYZ - MST: 0123456789

📦 Thêm sản phẩm (giá hóa đơn):
   - 10kg bột mì @ 20,000đ = 200,000đ
   - 5kg đường @ 14,400đ = 72,000đ

💵 Tổng: 272,000đ (Không chiết khấu)

🖨️ In hóa đơn chính thức

💾 Lưu vào hệ thống hóa đơn

📊 Tồn kho hóa đơn giảm:
   - Bột mì (HĐ): 400kg → 390kg
   - Đường (HĐ): 250kg → 245kg

✅ Đánh dấu đã trả (khách trả ngay)
```

### Kịch bản 3: Nhập hàng từ nhà cung cấp
```
🚚 Nhà cung cấp giao hàng:
   - 100kg bột mì
   - 50kg đường

📝 Tạo đơn mua hàng:
   Nhà cung cấp: Công ty ABC

📦 Thêm sản phẩm:
   - 100kg bột mì @ 20,000đ = 2,000,000đ
   - 50kg đường @ 12,000đ = 600,000đ

💰 Tổng: 2,600,000đ

✅ Tạo đơn mua

📊 Tồn kho tự động tăng:
   - Bột mì: 495kg → 595kg
   - Đường: 298kg → 348kg

💳 Đánh dấu "Chưa trả" (trả sau 15 ngày)

📋 Theo dõi công nợ phải trả: +2,600,000đ
```

### Kịch bản 4: Đối chiếu công nợ cuối tháng
```
📅 Cuối tháng 12/2024

📊 Vào trang Công nợ → Chọn tháng 12

📈 Thống kê:
   ┌──────────────────────────────────┐
   │ Nợ đầu tháng:    10,000,000đ    │
   │ Phát sinh mới:   15,000,000đ    │
   │ Thu về:          18,000,000đ    │
   │ Nợ cuối tháng:    7,000,000đ    │
   └──────────────────────────────────┘

⚠️ Cảnh báo nợ quá hạn:
   - Tiệm ABC: 5,000,000đ (45 ngày) 🔴
   - Chị Lan: 1,500,000đ (60 ngày) 🔴
   - Tiệm XYZ: 500,000đ (35 ngày) 🟡

📞 Gọi nhắc nợ:
   ✓ Tiệm ABC: Hẹn trả 5/1
   ✓ Chị Lan: Trả ngay 1,000,000đ
   ✓ Tiệm XYZ: Trả hết 500,000đ

💰 Cập nhật thanh toán:
   - Chị Lan: Đánh dấu 2 đơn đã trả
   - Tiệm XYZ: Đánh dấu 1 đơn đã trả

📊 Nợ cuối tháng sau cập nhật: 5,500,000đ
```

### Kịch bản 5: Cập nhật giá hàng loạt
```
📢 Nhà cung cấp tăng giá 10%

📊 Export danh sách sản phẩm ra Excel:
   - 200 sản phẩm

💻 Sửa giá trong Excel:
   - Bột mì: 25,000đ → 27,500đ
   - Đường: 18,000đ → 19,800đ
   - ... (198 sản phẩm khác)

📥 Import Excel:
   - Chọn chế độ "Cập nhật trùng lặp"
   - Upload file
   - Xác nhận

✅ Tất cả giá được cập nhật tự động

📱 Thông báo nhân viên: Giá đã cập nhật

💰 Giá hóa đơn tự động = 80% giá mới:
   - Bột mì HĐ: 20,000đ → 22,000đ
   - Đường HĐ: 14,400đ → 15,840đ
```

---

## KẾT LUẬN

**Phuong Le Store** là hệ thống quản lý kinh doanh toàn diện với chế độ kép, được thiết kế đặc biệt cho nhà cung cấp nguyên liệu làm bánh tại Việt Nam. Hệ thống giúp quản lý cả hoạt động kinh doanh thực tế và tuân thủ thuế một cách riêng biệt, đồng thời tích hợp AI giọng nói tiếng Việt để tăng hiệu quả làm việc.

### Điểm mạnh nổi bật

✨ **Chế độ kép độc đáo**
   - Tách biệt hoàn toàn dữ liệu thực tế và hóa đơn
   - Đáp ứng yêu cầu thuế Việt Nam
   - Quản lý 2 bộ sổ sách song song

🎤 **Voice AI tiếng Việt**
   - Điều khiển bằng giọng nói
   - Nhận dạng tiếng Việt có dấu
   - Chịu lỗi chính tả thông minh

📊 **Import/Export Excel**
   - Nhập/xuất hàng loạt
   - Tương thích Excel/Google Sheets
   - Phát hiện trùng lặp thông minh

💰 **Quản lý công nợ mạnh mẽ**
   - Theo dõi công nợ theo khách
   - Cảnh báo nợ quá hạn
   - Thống kê theo tháng/quý/năm

🔒 **Hoạt động offline**
   - LocalStorage fallback
   - Không cần internet
   - Đồng bộ khi có mạng

📱 **Responsive design**
   - Tối ưu mobile
   - Hoạt động trên mọi thiết bị
   - Giao diện thân thiện

### Đối tượng người dùng

👥 **Phù hợp với:**
- Cửa hàng nguyên liệu làm bánh vừa và nhỏ
- Nhà phân phối nguyên liệu
- Doanh nghiệp cần tách biệt sổ sách
- Người dùng tiếng Việt
- Người muốn quản lý công nợ chặt chẽ

🎯 **Mục tiêu phục vụ:**
- Tăng tốc độ bán hàng (Voice AI)
- Giảm sai sót (Tự động hóa)
- Tuân thủ thuế (Chế độ Invoice)
- Quản lý công nợ hiệu quả
- Phân tích kinh doanh (Thống kê)

---

**📧 Liên hệ hỗ trợ**: support@phuonglestore.com
**📱 Hotline**: 1900-xxxx-xxx
**🌐 Website**: https://phuonglestore.com

---

*Cập nhật lần cuối: 31/01/2026*
*Phiên bản: 1.0.0*
