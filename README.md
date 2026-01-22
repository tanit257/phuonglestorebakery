# 🧁 Phương Lê Store

Hệ thống quản lý bán hàng nguyên liệu làm bánh với AI giọng nói.

![Version](https://img.shields.io/badge/version-1.0.0-violet)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Tính năng

- 🎤 **AI Giọng nói** - Tạo đơn hàng bằng giọng nói tiếng Việt
- 📦 **Quản lý sản phẩm** - Thêm, sửa, xóa sản phẩm
- 👥 **Quản lý khách hàng** - Tiệm bánh & cá nhân
- 🛒 **Tạo đơn hàng** - Nhanh chóng, dễ dàng
- 💰 **Quản lý công nợ** - Theo dõi nợ từng khách hàng
- ⚠️ **Cảnh báo nợ quá hạn** - Tự động nhắc nhở sau 30 ngày

## 🚀 Cài đặt

### Bước 1: Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/phuongle-store.git
cd phuongle-store
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình Supabase (tùy chọn)

1. Tạo tài khoản tại [supabase.com](https://supabase.com)
2. Tạo project mới
3. Vào **Project Settings > API** để lấy URL và anon key
4. Tạo file `.env`:

```bash
cp .env.example .env
```

5. Điền thông tin vào `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

6. Vào **SQL Editor** trong Supabase và chạy script tạo bảng (xem bên dưới)

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Mở http://localhost:5173

## 📊 Cấu trúc Database (Supabase)

Chạy SQL này trong Supabase SQL Editor:

```sql
-- Products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'kg',
  price DECIMAL(15,2) NOT NULL,
  stock DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'bakery',
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id),
  total DECIMAL(15,2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  quantity DECIMAL(15,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (for simplicity)
CREATE POLICY "Allow all" ON products FOR ALL USING (true);
CREATE POLICY "Allow all" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all" ON order_items FOR ALL USING (true);
```

## 🌐 Deploy lên Vercel

### Cách 1: Deploy từ GitHub (khuyên dùng)

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) và đăng nhập bằng GitHub
3. Click **"New Project"**
4. Import repository `phuongle-store`
5. Thêm Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

### Cách 2: Deploy bằng CLI

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy production
vercel --prod
```

## 🎤 Hướng dẫn sử dụng giọng nói

Bấm nút micro (góc phải dưới) và nói:

| Lệnh | Ví dụ |
|------|-------|
| Tạo đơn | "Tạo đơn cho tiệm Hạnh Phúc, 5kg bột mì, 2 hộp bơ" |
| Xem công nợ | "Xem công nợ của tiệm ABC" |
| Báo cáo | "Báo cáo doanh thu hôm nay" |

## 📁 Cấu trúc thư mục

```
phuongle-store/
├── src/
│   ├── components/
│   │   ├── layout/      # Header, NavBar, Notification
│   │   ├── voice/       # VoiceButton, VoiceDisplay
│   │   └── ui/          # Button, Card, Input
│   ├── pages/           # Các trang
│   ├── hooks/           # useStore, useVoice
│   ├── services/        # API, Supabase, VoiceAI
│   ├── utils/           # Formatters, Constants
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Database:** Supabase (PostgreSQL) / LocalStorage
- **Voice:** Web Speech API
- **Icons:** Lucide React
- **Deploy:** Vercel

## 📝 License

MIT License - Tự do sử dụng và chỉnh sửa.

---

Made with ❤️ for Phương Lê Store
