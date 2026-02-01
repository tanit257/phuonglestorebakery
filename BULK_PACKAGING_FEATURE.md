# Tính năng Quản lý Bao bì Lớn

## Tổng quan

Tính năng này cho phép hiển thị số lượng sản phẩm theo đơn vị bao bì lớn (thùng, xô, bao, kiện, két) giúp dễ dàng tính toán và vận chuyển.

## Cách hoạt động

### 1. Thiết lập sản phẩm có bao bì lớn

Khi thêm/sửa sản phẩm, điền thông tin:
- **Đơn vị lớn**: Chọn loại bao bì (thùng, xô, bao, kiện, két)
- **SL/đơn vị lớn**: Nhập số lượng đơn vị cơ bản trong 1 bao bì

**Ví dụ:**
```
Sản phẩm: Bột mì
Đơn vị: kg
Đơn vị lớn: thùng
SL/đơn vị lớn: 20
→ Nghĩa là: 1 thùng = 20kg
```

### 2. Hiển thị tự động

Hệ thống sẽ tự động hiển thị số lượng với bao bì lớn ở các vị trí:

#### A. Giỏ hàng (CreateOrderPage)
- Hiển thị: `40kg (2 thùng)` hoặc `45kg (2 thùng + 5kg)`

#### B. Phiếu in (PrintPreview)
- Cột số lượng hiển thị: `40kg (2 thùng)`

#### C. Danh sách đơn hàng (OrdersPage)
- Item trong đơn: `Bột mì • 40kg (2 thùng) @ 25,000đ`
- Chi tiết đơn: `SL: 40kg (2 thùng)`

#### D. Danh sách sản phẩm (ProductsPage)
- Hiển thị thông tin: `📦 Bao bì: 20kg/thùng`

#### E. Tìm kiếm sản phẩm (ProductSelector)
- Hiển thị: `Giá bán: 25,000đ • Tồn kho: 500kg • 20kg/thùng`

#### F. Phiếu nhập hàng (PurchasesPage)
- Chi tiết item: `SL: 100kg (5 thùng)`

## Logic tính toán

Hàm `formatQuantityWithBulk(quantity, product)` tự động tính:

### Trường hợp 1: Đủ số lượng, không dư
```javascript
Quantity: 40kg
Bulk: 20kg/thùng
→ Hiển thị: "40kg (2 thùng)"
```

### Trường hợp 2: Có số lượng dư
```javascript
Quantity: 45kg
Bulk: 20kg/thùng
→ Hiển thị: "45kg (2 thùng + 5kg)"
```

### Trường hợp 3: Chưa đủ 1 bao bì
```javascript
Quantity: 10kg
Bulk: 20kg/thùng
→ Hiển thị: "10kg"
```

### Trường hợp 4: Không có bao bì lớn
```javascript
Product không có bulk_unit hoặc bulk_quantity
→ Hiển thị: "10kg" (bình thường)
```

## Files đã được cập nhật

1. ✅ **src/utils/formatters.js** - Thêm hàm `formatQuantityWithBulk()`
2. ✅ **src/pages/CreateOrderPage.jsx** - Hiển thị bao bì trong giỏ hàng
3. ✅ **src/components/print/PrintPreview.jsx** - Hiển thị bao bì trong phiếu in
4. ✅ **src/pages/OrdersPage.jsx** - Hiển thị bao bì trong danh sách và chi tiết đơn
5. ✅ **src/components/common/ProductSelector.jsx** - Hiển thị thông tin bao bì khi chọn sản phẩm
6. ✅ **src/pages/ProductsPage.jsx** - Hiển thị thông tin bao bì trong danh sách sản phẩm
7. ✅ **src/pages/PurchasesPage.jsx** - Hiển thị bao bì trong phiếu nhập hàng

## Backward Compatibility

- ✅ Sản phẩm cũ không có `bulk_unit` vẫn hiển thị bình thường
- ✅ Không ảnh hưởng đến dữ liệu hiện có
- ✅ Tùy chọn, không bắt buộc phải nhập

## Test Cases

### Test 1: Sản phẩm có bao bì lớn
```javascript
Product: {
  name: "Bột mì",
  unit: "kg",
  bulk_unit: "thùng",
  bulk_quantity: 20
}
Quantity: 40
Expected: "40kg (2 thùng)"
```

### Test 2: Sản phẩm có số lượng dư
```javascript
Product: {
  name: "Đường",
  unit: "kg",
  bulk_unit: "bao",
  bulk_quantity: 25
}
Quantity: 52
Expected: "52kg (2 bao + 2kg)"
```

### Test 3: Sản phẩm không đủ 1 bao bì
```javascript
Product: {
  name: "Chocolate",
  unit: "kg",
  bulk_unit: "thùng",
  bulk_quantity: 10
}
Quantity: 5
Expected: "5kg"
```

### Test 4: Sản phẩm không có bao bì
```javascript
Product: {
  name: "Trứng",
  unit: "vỉ",
  bulk_unit: null,
  bulk_quantity: null
}
Quantity: 10
Expected: "10vỉ"
```

## Lợi ích

1. ✅ **Dễ tính toán** - Nhìn là biết cần bao nhiêu thùng/bao
2. ✅ **Tiện vận chuyển** - Đóng gói chính xác số lượng
3. ✅ **Giảm sai sót** - Không cần tính toán thủ công
4. ✅ **Chuyên nghiệp** - Phiếu in rõ ràng, dễ hiểu
5. ✅ **Linh hoạt** - Áp dụng cho mọi loại sản phẩm

## Ghi chú

- Tính năng này hoàn toàn tự động, không cần can thiệp thủ công
- Chỉ cần thiết lập 1 lần trong thông tin sản phẩm
- Database schema đã có sẵn trường `bulk_unit` và `bulk_quantity`
