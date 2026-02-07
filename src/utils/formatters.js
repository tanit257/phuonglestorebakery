// Format currency to VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format date to Vietnamese locale
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format relative time (e.g., "2 ngày trước")
export const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Hôm nay';
  if (diffInDays === 1) return 'Hôm qua';
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
  return `${Math.floor(diffInDays / 365)} năm trước`;
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format quantity with bulk unit display
// Example: 40kg (2 thùng) or 45kg (2 thùng + 5kg)
export const formatQuantityWithBulk = (quantity, product) => {
  if (!product?.bulk_unit || !product?.bulk_quantity || product.bulk_quantity <= 0) {
    // No bulk unit, just display regular quantity
    return `${quantity}${product?.unit || ''}`;
  }

  const bulkCount = Math.floor(quantity / product.bulk_quantity);
  const remainder = quantity % product.bulk_quantity;

  if (bulkCount > 0 && remainder > 0) {
    // Example: "45kg (2 thùng + 5kg)"
    return `${quantity}${product.unit} (${bulkCount} ${product.bulk_unit} + ${remainder}${product.unit})`;
  } else if (bulkCount > 0) {
    // Example: "40kg (2 thùng)"
    return `${quantity}${product.unit} (${bulkCount} ${product.bulk_unit})`;
  } else {
    // Less than 1 bulk unit, just display regular
    return `${quantity}${product.unit}`;
  }
};
