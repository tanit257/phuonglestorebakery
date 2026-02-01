-- ============================================
-- PHUONGLE STORE - SUPABASE DATABASE SCHEMA
-- ============================================
-- Chạy script này trong Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ============================================
-- LƯU Ý: Policies chỉ cho phép AUTHENTICATED users
-- Hãy tắt Sign Up trong Authentication Settings
-- ============================================

-- 1. PRODUCTS TABLE (Sản phẩm)
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  invoice_name VARCHAR(255) DEFAULT NULL,           -- Tên hàng hóa đơn (dùng khi xuất hóa đơn, để trống = dùng name)
  product_code VARCHAR(100) DEFAULT NULL,           -- Mã hàng hóa (optional)
  unit VARCHAR(50) NOT NULL DEFAULT 'kg',
  price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  invoice_price DECIMAL(15, 2) DEFAULT 0,
  stock DECIMAL(15, 2) NOT NULL DEFAULT 0,
  bulk_unit VARCHAR(50) DEFAULT NULL,               -- Đơn vị đóng gói lớn: "thùng", "xô", "bao"...
  bulk_quantity DECIMAL(15, 2) DEFAULT NULL,        -- Số lượng đơn vị cơ bản trong 1 đơn vị lớn (VD: 20kg = 1 thùng)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE (Khách hàng & Nhà cung cấp)
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  short_name VARCHAR(255) NOT NULL,              -- Tên viết tắt để dễ nhận diện
  full_name VARCHAR(255),                        -- Tên đầy đủ (phục vụ xuất hóa đơn)
  type VARCHAR(50) NOT NULL DEFAULT 'individual', -- 'bakery', 'individual', 'supplier'
  phone VARCHAR(20),
  email VARCHAR(255),                            -- Email khách hàng
  address TEXT,                                  -- Địa chỉ giao hàng
  billing_address TEXT,                          -- Địa chỉ xuất hóa đơn
  tax_code VARCHAR(20),                          -- Mã số thuế (phục vụ xuất hóa đơn)
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
  note TEXT,
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
  note TEXT,
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
-- ROW LEVEL SECURITY (RLS) - ENABLE
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_inventory ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES - CHỈ CHO PHÉP AUTHENTICATED USERS
-- ============================================
-- Chỉ user đã đăng nhập mới có thể truy cập
-- auth.uid() IS NOT NULL = phải đăng nhập

-- Products policies
CREATE POLICY "Authenticated users can read products" ON products
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Customers policies
CREATE POLICY "Authenticated users can read customers" ON customers
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update customers" ON customers
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete customers" ON customers
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Orders policies
CREATE POLICY "Authenticated users can read orders" ON orders
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete orders" ON orders
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Order items policies
CREATE POLICY "Authenticated users can read order_items" ON order_items
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert order_items" ON order_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update order_items" ON order_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete order_items" ON order_items
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Purchases policies
CREATE POLICY "Authenticated users can read purchases" ON purchases
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update purchases" ON purchases
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete purchases" ON purchases
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Purchase items policies
CREATE POLICY "Authenticated users can read purchase_items" ON purchase_items
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert purchase_items" ON purchase_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update purchase_items" ON purchase_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete purchase_items" ON purchase_items
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Invoice orders policies
CREATE POLICY "Authenticated users can read invoice_orders" ON invoice_orders
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert invoice_orders" ON invoice_orders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update invoice_orders" ON invoice_orders
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete invoice_orders" ON invoice_orders
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Invoice order items policies
CREATE POLICY "Authenticated users can read invoice_order_items" ON invoice_order_items
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert invoice_order_items" ON invoice_order_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update invoice_order_items" ON invoice_order_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete invoice_order_items" ON invoice_order_items
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Invoice purchases policies
CREATE POLICY "Authenticated users can read invoice_purchases" ON invoice_purchases
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert invoice_purchases" ON invoice_purchases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update invoice_purchases" ON invoice_purchases
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete invoice_purchases" ON invoice_purchases
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Invoice purchase items policies
CREATE POLICY "Authenticated users can read invoice_purchase_items" ON invoice_purchase_items
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert invoice_purchase_items" ON invoice_purchase_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update invoice_purchase_items" ON invoice_purchase_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete invoice_purchase_items" ON invoice_purchase_items
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Invoice inventory policies
CREATE POLICY "Authenticated users can read invoice_inventory" ON invoice_inventory
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert invoice_inventory" ON invoice_inventory
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update invoice_inventory" ON invoice_inventory
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete invoice_inventory" ON invoice_inventory
  FOR DELETE USING (auth.uid() IS NOT NULL);

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
-- ============================================
-- Sau khi chạy script này:
-- 1. Vào Authentication > Settings > tắt "Enable Sign Up"
-- 2. Tạo 1 user duy nhất trong Authentication > Users
-- 3. Cập nhật file .env với VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY
-- ============================================
