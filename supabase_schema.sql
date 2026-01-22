-- ============================================
-- PHUONGLE STORE - SUPABASE DATABASE SCHEMA
-- ============================================
-- Chạy script này trong Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ============================================

-- 1. PRODUCTS TABLE (Sản phẩm)
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'kg',
  price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  stock DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE (Khách hàng & Nhà cung cấp)
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'individual', -- 'bakery', 'individual', 'supplier'
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE (Đơn hàng)
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER_ITEMS TABLE (Chi tiết đơn hàng)
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  quantity DECIMAL(15, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PURCHASES TABLE (Phiếu nhập hàng)
CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  supplier_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PURCHASE_ITEMS TABLE (Chi tiết phiếu nhập)
CREATE TABLE IF NOT EXISTS purchase_items (
  id BIGSERIAL PRIMARY KEY,
  purchase_id BIGINT REFERENCES purchases(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  quantity DECIMAL(15, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (Tăng tốc truy vấn)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_paid ON orders(paid);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_paid ON purchases(paid);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id);

CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Bật RLS cho tất cả các bảng

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES - Cho phép truy cập công khai (anon key)
-- ============================================
-- Lưu ý: Đây là cấu hình đơn giản cho development
-- Trong production, bạn nên thêm authentication

-- Products policies
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON products FOR DELETE USING (true);

-- Customers policies
CREATE POLICY "Allow public read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update customers" ON customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete customers" ON customers FOR DELETE USING (true);

-- Orders policies
CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON orders FOR DELETE USING (true);

-- Order items policies
CREATE POLICY "Allow public read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update order_items" ON order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete order_items" ON order_items FOR DELETE USING (true);

-- Purchases policies
CREATE POLICY "Allow public read purchases" ON purchases FOR SELECT USING (true);
CREATE POLICY "Allow public insert purchases" ON purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update purchases" ON purchases FOR UPDATE USING (true);
CREATE POLICY "Allow public delete purchases" ON purchases FOR DELETE USING (true);

-- Purchase items policies
CREATE POLICY "Allow public read purchase_items" ON purchase_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert purchase_items" ON purchase_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update purchase_items" ON purchase_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete purchase_items" ON purchase_items FOR DELETE USING (true);

-- ============================================
-- UPDATED_AT TRIGGER (Tự động cập nhật thời gian)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Dữ liệu mẫu - Tùy chọn)
-- ============================================
-- Bỏ comment các dòng dưới nếu muốn thêm dữ liệu mẫu

/*
-- Sample Products
INSERT INTO products (name, unit, price, stock) VALUES
  ('Bột mì đa dụng', 'kg', 25000, 100),
  ('Bột mì làm bánh mì', 'kg', 28000, 80),
  ('Bơ lạt Anchor', 'hộp', 95000, 50),
  ('Bơ mặn Lurpak', 'hộp', 120000, 30),
  ('Đường trắng', 'kg', 22000, 150),
  ('Đường đen', 'kg', 35000, 60),
  ('Trứng gà', 'vỉ', 35000, 100),
  ('Sữa tươi TH', 'lít', 32000, 80),
  ('Kem whipping', 'hộp', 85000, 40),
  ('Chocolate đen', 'kg', 180000, 25),
  ('Bột cacao', 'kg', 150000, 30),
  ('Vani', 'lọ', 45000, 50),
  ('Bột nở', 'gói', 8000, 200),
  ('Men nở', 'gói', 12000, 150),
  ('Phô mai cream', 'hộp', 75000, 35);

-- Sample Customers
INSERT INTO customers (name, type, phone, address) VALUES
  ('Tiệm bánh Hạnh Phúc', 'bakery', '0901234567', '123 Nguyễn Huệ, Q1'),
  ('Bánh ngọt Mimi', 'bakery', '0912345678', '456 Lê Lợi, Q3'),
  ('Chị Lan', 'individual', '0923456789', '789 Trần Hưng Đạo, Q5'),
  ('Tiệm ABC Bakery', 'bakery', '0934567890', '321 Hai Bà Trưng, Q1'),
  ('Anh Minh', 'individual', '0945678901', '654 Võ Văn Tần, Q3'),
  ('Công ty TNHH ABC', 'supplier', '0956789012', '100 Lý Tự Trọng, Q1');
*/

-- ============================================
-- INVOICE MODE TABLES (Hóa đơn - Sổ sách thuế)
-- ============================================

-- 7. INVOICE_ORDERS TABLE (Đơn hàng hóa đơn)
CREATE TABLE IF NOT EXISTS invoice_orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVOICE_ORDER_ITEMS TABLE (Chi tiết đơn hàng hóa đơn)
CREATE TABLE IF NOT EXISTS invoice_order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES invoice_orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  quantity DECIMAL(15, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INVOICE_PURCHASES TABLE (Phiếu nhập hàng hóa đơn)
CREATE TABLE IF NOT EXISTS invoice_purchases (
  id BIGSERIAL PRIMARY KEY,
  supplier_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INVOICE_PURCHASE_ITEMS TABLE (Chi tiết phiếu nhập hóa đơn)
CREATE TABLE IF NOT EXISTS invoice_purchase_items (
  id BIGSERIAL PRIMARY KEY,
  purchase_id BIGINT REFERENCES invoice_purchases(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  quantity DECIMAL(15, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. INVOICE_INVENTORY TABLE (Tồn kho hóa đơn)
CREATE TABLE IF NOT EXISTS invoice_inventory (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  stock DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD INVOICE PRICE TO PRODUCTS
-- ============================================

-- Add invoice_price column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS invoice_price DECIMAL(15, 2) DEFAULT 0;

-- ============================================
-- INDEXES FOR INVOICE TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoice_orders_customer_id ON invoice_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoice_orders_paid ON invoice_orders(paid);
CREATE INDEX IF NOT EXISTS idx_invoice_orders_created_at ON invoice_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoice_order_items_order_id ON invoice_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_order_items_product_id ON invoice_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invoice_purchases_supplier_id ON invoice_purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoice_purchases_paid ON invoice_purchases(paid);
CREATE INDEX IF NOT EXISTS idx_invoice_purchases_created_at ON invoice_purchases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoice_purchase_items_purchase_id ON invoice_purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_invoice_purchase_items_product_id ON invoice_purchase_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invoice_inventory_product_id ON invoice_inventory(product_id);

-- ============================================
-- ROW LEVEL SECURITY FOR INVOICE TABLES
-- ============================================

ALTER TABLE invoice_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_inventory ENABLE ROW LEVEL SECURITY;

-- Invoice orders policies
CREATE POLICY "Allow public read invoice_orders" ON invoice_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert invoice_orders" ON invoice_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update invoice_orders" ON invoice_orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete invoice_orders" ON invoice_orders FOR DELETE USING (true);

-- Invoice order items policies
CREATE POLICY "Allow public read invoice_order_items" ON invoice_order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert invoice_order_items" ON invoice_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update invoice_order_items" ON invoice_order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete invoice_order_items" ON invoice_order_items FOR DELETE USING (true);

-- Invoice purchases policies
CREATE POLICY "Allow public read invoice_purchases" ON invoice_purchases FOR SELECT USING (true);
CREATE POLICY "Allow public insert invoice_purchases" ON invoice_purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update invoice_purchases" ON invoice_purchases FOR UPDATE USING (true);
CREATE POLICY "Allow public delete invoice_purchases" ON invoice_purchases FOR DELETE USING (true);

-- Invoice purchase items policies
CREATE POLICY "Allow public read invoice_purchase_items" ON invoice_purchase_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert invoice_purchase_items" ON invoice_purchase_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update invoice_purchase_items" ON invoice_purchase_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete invoice_purchase_items" ON invoice_purchase_items FOR DELETE USING (true);

-- Invoice inventory policies
CREATE POLICY "Allow public read invoice_inventory" ON invoice_inventory FOR SELECT USING (true);
CREATE POLICY "Allow public insert invoice_inventory" ON invoice_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update invoice_inventory" ON invoice_inventory FOR UPDATE USING (true);
CREATE POLICY "Allow public delete invoice_inventory" ON invoice_inventory FOR DELETE USING (true);

-- ============================================
-- TRIGGERS FOR INVOICE TABLES
-- ============================================

CREATE TRIGGER update_invoice_orders_updated_at
  BEFORE UPDATE ON invoice_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_purchases_updated_at
  BEFORE UPDATE ON invoice_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_inventory_updated_at
  BEFORE UPDATE ON invoice_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE!
-- Sau khi chạy script này, cập nhật file .env:
-- VITE_SUPABASE_URL=your_supabase_url
-- VITE_SUPABASE_ANON_KEY=your_anon_key
-- ============================================
