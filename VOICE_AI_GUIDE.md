# Hướng Dẫn Sử Dụng Voice AI Nâng Cao

## Tính Năng Mới

### 1. **Nhận Diện Giọng Nói Chính Xác Hơn**
- Sử dụng Web Speech API với **5 alternatives** thay vì 1
- Tự động chọn transcript có confidence score cao nhất
- Hỗ trợ tiếng Việt tối ưu

### 2. **Hiển Thị Transcript Realtime**
- **Interim Transcript**: Hiển thị ngay khi bạn đang nói (màu xanh, có hiệu ứng pulse)
- **Final Transcript**: Kết quả cuối cùng với confidence score
- Người dùng thấy rõ AI đang nghe gì

### 3. **Confidence Score**
- Hiển thị độ tin cậy của nhận diện (%)
- 3 mức độ:
  - 🟢 **Chính xác cao** (≥80%): Màu xanh lá
  - 🟡 **Tốt** (65-79%): Màu vàng
  - 🔴 **Thấp** (<65%): Màu đỏ, yêu cầu xác nhận

### 4. **Phiên Bản Thay Thế (Alternatives)**
- Hiển thị 2-4 phiên bản transcript khác nhau
- Người dùng có thể click chọn nếu AI nghe sai
- Mỗi alternative có confidence score riêng

### 5. **Gợi Ý Thông Minh (Smart Suggestions)**
- Sử dụng thuật toán Levenshtein Distance
- So sánh transcript với database sản phẩm và khách hàng
- Gợi ý top 3 kết quả khớp nhất (similarity ≥60%)
- Hiển thị % độ khớp

### 6. **Xử Lý Lỗi Tốt Hơn**
- Thông báo lỗi rõ ràng bằng tiếng Việt
- Xử lý các case: không nghe thấy, từ chối quyền mic, lỗi mạng

## Cách Sử Dụng

### Bước 1: Nhấn Nút Microphone
- Nút mic màu tím ở góc dưới phải màn hình
- Click để bắt đầu nói

### Bước 2: Nói Lệnh
- Khi nút mic chuyển màu đỏ và có hiệu ứng pulse = đang nghe
- **Transcript realtime** sẽ hiện ra ngay khi bạn nói (màu xanh, có chữ "Đang nhận diện...")

### Bước 3: Xem Kết Quả
Sau khi nói xong, hệ thống hiển thị:

1. **Transcript cuối cùng** với confidence score
2. **Nút "Hiện phiên bản khác"** nếu có nhiều alternatives
3. **Gợi ý sản phẩm/khách hàng** nếu tìm thấy kết quả tương tự
4. **Kết quả xử lý lệnh** (tạo đơn, xem công nợ, etc.)

### Bước 4: Chỉnh Sửa Nếu Cần
- Nếu AI nghe sai, click vào **phiên bản khác** để thử lại
- Hoặc click vào **gợi ý thông minh** để chọn đúng sản phẩm/khách hàng

## Ví Dụ Minh Họa

### Ví Dụ 1: Tạo Đơn Hàng
```
Bạn nói: "Tạo đơn cho tiệm ABC, 5kg bột mì và 2 chai dầu ăn"

Hiển thị:
┌─────────────────────────────────────┐
│ 🔊 Kết quả nhận diện                │
├─────────────────────────────────────┤
│ Bạn đã nói:             ✓ Chính xác cao (92%) │
│ "Tạo đơn cho tiệm ABC, 5kg bột mì   │
│  và 2 chai dầu ăn"                  │
│                                     │
│ ⟳ Hiện phiên bản khác (2)          │
│                                     │
│ ✓ Tạo đơn cho Tiệm ABC với 2 sản phẩm │
│   • Bột mì x 5                      │
│   • Dầu ăn x 2                      │
└─────────────────────────────────────┘
```

### Ví Dụ 2: Confidence Thấp
```
Bạn nói: "Tạo đơn cho tiệm XYZ" (nói không rõ)

Hiển thị:
┌─────────────────────────────────────┐
│ Bạn đã nói:             ⚠ Thấp (58%) │
│ "Tạo đơn cho tiệm X Y Zét"          │
│                                     │
│ ⚠ Có thể bạn muốn nói:             │
│   📦 Khách hàng - 85% khớp          │
│   Tiệm XYZ Foods                    │
│   Có phải khách hàng "Tiệm XYZ Foods"? │
│                                     │
│ ⚠ Độ tin cậy thấp (58%).            │
│    Vui lòng nói rõ hơn hoặc kiểm tra lại. │
└─────────────────────────────────────┘
```

### Ví Dụ 3: Realtime Transcript
```
Khi đang nói: "Tạo đơn cho..."

Hiển thị:
┌─────────────────────────────────────┐
│ 🔊 Đang nghe...                     │
├─────────────────────────────────────┤
│ ⚫ Đang nhận diện... (pulse effect) │
│ "Tạo đơn cho..." (màu xám, italic) │
└─────────────────────────────────────┘

Khi nói tiếp: "tiệm ABC"

Hiển thị:
┌─────────────────────────────────────┐
│ ⚫ Đang nhận diện...                 │
│ "Tạo đơn cho tiệm ABC"              │
└─────────────────────────────────────┘
```

## Tính Năng Kỹ Thuật

### 1. Enhanced Speech Recognition API
```javascript
createSpeechRecognition(onTranscriptUpdate)
```
- `maxAlternatives: 5` - Lấy 5 phiên bản transcript
- `interimResults: true` - Hiển thị realtime
- `lang: 'vi-VN'` - Tối ưu tiếng Việt

### 2. Confidence-Based Processing
```javascript
processVoiceCommandWithConfidence(transcript, confidence, products, customers, minConfidence = 0.65)
```
- Kiểm tra threshold trước khi xử lý
- Yêu cầu xác nhận nếu confidence thấp

### 3. Smart Suggestions
```javascript
suggestCorrections(transcript, products, customers)
```
- Thuật toán Levenshtein Distance
- So sánh với database
- Trả về top 3 gợi ý

### 4. Real-time Updates
```javascript
handleTranscriptUpdate(update)
```
- `update.isFinal: false` → Interim transcript
- `update.isFinal: true` → Final transcript
- `update.error` → Error handling
- `update.ended` → Session ended

## So Sánh Cũ vs Mới

| Tính Năng | Cũ | Mới |
|-----------|-----|-----|
| Alternatives | 1 | 5 |
| Realtime Display | ❌ | ✅ |
| Confidence Score | ❌ | ✅ (hiển thị %, màu sắc) |
| Smart Suggestions | ❌ | ✅ (Levenshtein Distance) |
| Error Messages | Tiếng Anh | Tiếng Việt |
| Alternative Selection | ❌ | ✅ (click để thử lại) |
| Confidence Threshold | ❌ | ✅ (65% cho tiếng Việt) |
| Transcript History | ❌ | ✅ |

## Lưu Ý

1. **Trình duyệt**: Chỉ hoạt động trên Chrome, Edge, Safari (Web Speech API)
2. **Microphone**: Cần cấp quyền sử dụng mic
3. **Internet**: Cần kết nối internet (Google Speech API)
4. **Tiếng Việt**: Nói rõ ràng để tăng confidence score
5. **Threshold**: Ngưỡng tin cậy đặt ở 65% (thấp hơn 80% mặc định) để phù hợp với tiếng Việt

## Khắc Phục Sự Cố

### Confidence Score Thấp?
- Nói chậm hơn và rõ ràng hơn
- Đảm bảo môi trường yên tĩnh
- Kiểm tra chất lượng microphone

### AI Nghe Sai?
- Click "Hiện phiên bản khác" để xem alternatives
- Chọn gợi ý từ "Smart Suggestions"
- Thử nói lại với từ ngữ khác

### Không Hiển Thị Gì?
- Kiểm tra quyền microphone
- Reload trang
- Thử trình duyệt khác (Chrome recommended)

## API Free Sử Dụng

Hệ thống sử dụng **Web Speech API** - API miễn phí được tích hợp sẵn trong trình duyệt:
- **Google Cloud Speech-to-Text** (backend của Web Speech API)
- **Không cần API key**
- **Không giới hạn requests**
- **Hoàn toàn miễn phí**
- **Hỗ trợ 120+ ngôn ngữ** (bao gồm tiếng Việt)

## Tương Lai

Các tính năng có thể thêm:
1. Voice feedback (text-to-speech)
2. Custom wake word ("Hey Phuong Le")
3. Voice training (học giọng người dùng)
4. Offline mode (Web Speech API không hỗ trợ, cần model khác)
5. Transcript history panel
6. Voice commands shortcuts
