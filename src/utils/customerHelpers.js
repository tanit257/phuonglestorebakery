/**
 * Helper functions for customer/supplier name lookups
 * Prevents "N/A" display issues by providing robust fallback logic
 */

/**
 * Get customer name with robust fallback logic
 * @param {string|number} customerId - Customer ID
 * @param {Object} customerObj - Customer object (if attached to order)
 * @param {string} fallbackName - Denormalized customer_name field
 * @param {Array} customersArray - Full customers array for lookup
 * @returns {string} Customer name or "Khách hàng không xác định"
 */
export const getCustomerName = (customerId, customerObj, fallbackName, customersArray) => {
  // 1. Try denormalized field (fastest and most reliable)
  if (fallbackName && typeof fallbackName === 'string' && fallbackName.trim()) {
    return fallbackName.trim();
  }

  // 2. Try attached customer object
  if (customerObj) {
    const name = customerObj.short_name || customerObj.full_name || customerObj.name;
    if (name && typeof name === 'string' && name.trim()) {
      return name.trim();
    }
  }

  // 3. Lookup in customers array
  if (customersArray && Array.isArray(customersArray) && customerId) {
    const customer = customersArray.find(c => String(c.id) === String(customerId));
    if (customer) {
      const name = customer.short_name || customer.full_name || customer.name;
      if (name && typeof name === 'string' && name.trim()) {
        return name.trim();
      }
    }
  }

  // 4. Last resort - log warning and return fallback
  if (customerId) {
    console.warn(`Customer not found: ${customerId}`);
  }
  return 'Khách hàng không xác định';
};

/**
 * Get supplier name with robust fallback logic
 * @param {string|number} supplierId - Supplier ID
 * @param {Object} supplierObj - Supplier object (if attached to purchase)
 * @param {string} fallbackName - Denormalized supplier_name field
 * @param {Array} customersArray - Full customers array for lookup (suppliers are in customers table)
 * @returns {string} Supplier name or "Nhà cung cấp không xác định"
 */
export const getSupplierName = (supplierId, supplierObj, fallbackName, customersArray) => {
  // 1. Try denormalized field (fastest and most reliable)
  if (fallbackName && typeof fallbackName === 'string' && fallbackName.trim()) {
    return fallbackName.trim();
  }

  // 2. Try attached supplier object
  if (supplierObj) {
    const name = supplierObj.short_name || supplierObj.full_name || supplierObj.name;
    if (name && typeof name === 'string' && name.trim()) {
      return name.trim();
    }
  }

  // 3. Lookup in customers array (suppliers are stored in customers table with type='supplier')
  if (customersArray && Array.isArray(customersArray) && supplierId) {
    const supplier = customersArray.find(c => String(c.id) === String(supplierId));
    if (supplier) {
      const name = supplier.short_name || supplier.full_name || supplier.name;
      if (name && typeof name === 'string' && name.trim()) {
        return name.trim();
      }
    }
  }

  // 4. Last resort - log warning and return fallback
  if (supplierId) {
    console.warn(`Supplier not found: ${supplierId}`);
  }
  return 'Nhà cung cấp không xác định';
};
