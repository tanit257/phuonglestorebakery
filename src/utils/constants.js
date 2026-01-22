// Customer types
export const CUSTOMER_TYPES = {
  BAKERY: 'bakery',
  INDIVIDUAL: 'individual',
  SUPPLIER: 'supplier',
};

export const CUSTOMER_TYPE_LABELS = {
  [CUSTOMER_TYPES.BAKERY]: 'Tiệm bánh',
  [CUSTOMER_TYPES.INDIVIDUAL]: 'Cá nhân',
  [CUSTOMER_TYPES.SUPPLIER]: 'Nhà cung cấp',
};

// Product units
export const PRODUCT_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'hộp', label: 'Hộp' },
  { value: 'gói', label: 'Gói' },
  { value: 'chai', label: 'Chai' },
  { value: 'lít', label: 'Lít' },
  { value: 'vỉ', label: 'Vỉ' },
  { value: 'lọ', label: 'Lọ' },
  { value: 'cái', label: 'Cái' },
  { value: 'túi', label: 'Túi' },
];

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
};

// Debt overdue threshold (days)
export const OVERDUE_DAYS = 30;

// Store information for printing
export const STORE_INFO = {
  name: 'Cửa hàng nguyên liệu bánh',
  phone: '0123 456 789',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  email: 'contact@store.com',
};

// Sample products data
export const SAMPLE_PRODUCTS = [
  { name: 'Bột mì đa dụng', unit: 'kg', price: 25000, stock: 100 },
  { name: 'Bột mì làm bánh mì', unit: 'kg', price: 28000, stock: 80 },
  { name: 'Bơ lạt Anchor', unit: 'hộp', price: 95000, stock: 50 },
  { name: 'Bơ mặn Lurpak', unit: 'hộp', price: 120000, stock: 30 },
  { name: 'Đường trắng', unit: 'kg', price: 22000, stock: 150 },
  { name: 'Đường đen', unit: 'kg', price: 35000, stock: 60 },
  { name: 'Trứng gà', unit: 'vỉ', price: 35000, stock: 100 },
  { name: 'Sữa tươi TH', unit: 'lít', price: 32000, stock: 80 },
  { name: 'Kem whipping', unit: 'hộp', price: 85000, stock: 40 },
  { name: 'Chocolate đen', unit: 'kg', price: 180000, stock: 25 },
  { name: 'Bột cacao', unit: 'kg', price: 150000, stock: 30 },
  { name: 'Vani', unit: 'lọ', price: 45000, stock: 50 },
  { name: 'Bột nở', unit: 'gói', price: 8000, stock: 200 },
  { name: 'Men nở', unit: 'gói', price: 12000, stock: 150 },
  { name: 'Phô mai cream', unit: 'hộp', price: 75000, stock: 35 },
];

// Sample customers data
export const SAMPLE_CUSTOMERS = [
  { name: 'Tiệm bánh Hạnh Phúc', type: 'bakery', phone: '0901234567', address: '123 Nguyễn Huệ, Q1' },
  { name: 'Bánh ngọt Mimi', type: 'bakery', phone: '0912345678', address: '456 Lê Lợi, Q3' },
  { name: 'Chị Lan', type: 'individual', phone: '0923456789', address: '789 Trần Hưng Đạo, Q5' },
  { name: 'Tiệm ABC Bakery', type: 'bakery', phone: '0934567890', address: '321 Hai Bà Trưng, Q1' },
  { name: 'Anh Minh', type: 'individual', phone: '0945678901', address: '654 Võ Văn Tần, Q3' },
];

// Navigation items
export const NAV_ITEMS = [
  { id: 'home', path: '/', label: 'Trang chủ', icon: 'Home' },
  { id: 'create-order', path: '/create-order', label: 'Tạo đơn', icon: 'ShoppingCart' },
  { id: 'orders', path: '/orders', label: 'Đơn hàng', icon: 'Package' },
  { id: 'purchases', path: '/purchases', label: 'Nhập hàng', icon: 'Truck' },
  { id: 'debt', path: '/debt', label: 'Công nợ', icon: 'CreditCard' },
  { id: 'customers', path: '/customers', label: 'Khách hàng', icon: 'Users' },
];
