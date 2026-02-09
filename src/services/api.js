import { supabase, isSupabaseConfigured } from './supabase';

// ============ LOCAL STORAGE FALLBACK ============
const localStorageDB = {
  products: JSON.parse(localStorage.getItem('phuongle_products') || '[]'),
  customers: JSON.parse(localStorage.getItem('phuongle_customers') || '[]'),
  orders: JSON.parse(localStorage.getItem('phuongle_orders') || '[]'),
  purchases: JSON.parse(localStorage.getItem('phuongle_purchases') || '[]'),
  // Invoice mode data
  invoice_orders: JSON.parse(localStorage.getItem('phuongle_invoice_orders') || '[]'),
  invoice_purchases: JSON.parse(localStorage.getItem('phuongle_invoice_purchases') || '[]'),
  invoice_inventory: JSON.parse(localStorage.getItem('phuongle_invoice_inventory') || '[]'),
};

const saveToLocalStorage = (key, data) => {
  localStorage.setItem(`phuongle_${key}`, JSON.stringify(data));
  localStorageDB[key] = data;
};

// ============ PRODUCTS ============
export const productApi = {
  async getAll() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
    return localStorageDB.products;
  },

  async create(product) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // Check for duplicate within last 2 seconds (prevent double submission)
    const now = new Date().getTime();
    const recentDuplicate = localStorageDB.products.find(p =>
      p.name === product.name &&
      (now - new Date(p.created_at).getTime()) < 2000
    );

    if (recentDuplicate) {
      return recentDuplicate;
    }

    const newProduct = { ...product, id: Date.now(), created_at: new Date().toISOString() };
    localStorageDB.products.push(newProduct);
    saveToLocalStorage('products', localStorageDB.products);
    return newProduct;
  },

  async update(id, updates) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.products.findIndex(p => p.id === id);
    if (index !== -1) {
      localStorageDB.products[index] = { ...localStorageDB.products[index], ...updates };
      saveToLocalStorage('products', localStorageDB.products);
      return localStorageDB.products[index];
    }
    throw new Error('Product not found');
  },

  async delete(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    localStorageDB.products = localStorageDB.products.filter(p => p.id !== id);
    saveToLocalStorage('products', localStorageDB.products);
    return true;
  },
};

// ============ CUSTOMERS ============
export const customerApi = {
  async getAll() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('short_name');
      if (error) throw error;
      return data;
    }
    return localStorageDB.customers;
  },

  async create(customer) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    // Check for duplicate within last 2 seconds (prevent double submission)
    const now = new Date().getTime();
    const recentDuplicate = localStorageDB.customers.find(c =>
      c.short_name === customer.short_name &&
      (now - new Date(c.created_at).getTime()) < 2000
    );

    if (recentDuplicate) {
      return recentDuplicate;
    }

    const newCustomer = { ...customer, id: Date.now(), created_at: new Date().toISOString() };
    localStorageDB.customers.push(newCustomer);
    saveToLocalStorage('customers', localStorageDB.customers);
    return newCustomer;
  },

  async update(id, updates) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      localStorageDB.customers[index] = { ...localStorageDB.customers[index], ...updates };
      saveToLocalStorage('customers', localStorageDB.customers);
      return localStorageDB.customers[index];
    }
    throw new Error('Customer not found');
  },

  async delete(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    localStorageDB.customers = localStorageDB.customers.filter(c => c.id !== id);
    saveToLocalStorage('customers', localStorageDB.customers);
    return true;
  },
};

// ============ ORDERS ============
export const orderApi = {
  async getAll() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(id, short_name, full_name, phone),
          order_items(
            id,
            quantity,
            unit_price,
            subtotal,
            product:products(id, name, unit)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return localStorageDB.orders;
  },

  async create(order) {
    // VALIDATION: Ensure customer_name exists (prevent "N/A" display issues)
    if (!order.customer_name || typeof order.customer_name !== 'string' || order.customer_name.trim() === '') {
      throw new Error('Order must include customer_name. Please provide a valid customer name.');
    }

    if (isSupabaseConfigured()) {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: order.customer_id,
          total: order.total,
          paid: false,
        }])
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Create order items
      const orderItems = order.items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        note: item.note || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return orderData;
    }

    // Local storage
    const newOrder = {
      ...order,
      id: Date.now(),
      paid: false,
      created_at: new Date().toISOString(),
    };
    localStorageDB.orders.unshift(newOrder);
    saveToLocalStorage('orders', localStorageDB.orders);
    return newOrder;
  },

  async markAsPaid(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .update({ paid: true, paid_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      localStorageDB.orders[index] = {
        ...localStorageDB.orders[index],
        paid: true,
        paid_at: new Date().toISOString(),
      };
      saveToLocalStorage('orders', localStorageDB.orders);
      return localStorageDB.orders[index];
    }
    throw new Error('Order not found');
  },

  async markAsUnpaid(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .update({ paid: false, paid_at: null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      localStorageDB.orders[index] = {
        ...localStorageDB.orders[index],
        paid: false,
        paid_at: null,
      };
      saveToLocalStorage('orders', localStorageDB.orders);
      return localStorageDB.orders[index];
    }
    throw new Error('Order not found');
  },

  async update(id, updates) {
    if (isSupabaseConfigured()) {
      // Update order total and note if items changed
      if (updates.items) {
        const updateData = { total: updates.total };
        if (updates.note !== undefined) {
          updateData.note = updates.note;
        }

        const { error: orderError } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', id);
        if (orderError) throw orderError;

        // Delete old items
        await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id);

        // Insert new items
        const orderItems = updates.items.map(item => ({
          order_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          note: item.note || null,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        if (itemsError) throw itemsError;
      }

      return true;
    }

    // Local storage
    const index = localStorageDB.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      localStorageDB.orders[index] = {
        ...localStorageDB.orders[index],
        ...updates,
      };
      saveToLocalStorage('orders', localStorageDB.orders);
      return localStorageDB.orders[index];
    }
    throw new Error('Order not found');
  },

  async delete(id) {
    if (isSupabaseConfigured()) {
      // Delete order items first
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    localStorageDB.orders = localStorageDB.orders.filter(o => o.id !== id);
    saveToLocalStorage('orders', localStorageDB.orders);
    return true;
  },

  /**
   * Get last prices for products purchased by a specific customer
   * @param {string|number} customerId - Customer ID
   * @param {number} monthsBack - Number of months to look back (default: 6)
   * @returns {Promise<Array>} Array of { product_id, last_price, last_sold_at }
   */
  async getCustomerLastPrices(customerId, monthsBack = 6) {
    if (isSupabaseConfigured()) {
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);

      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          unit_price,
          orders!inner(customer_id, created_at)
        `)
        .eq('orders.customer_id', customerId)
        .gte('orders.created_at', cutoffDate.toISOString())
        .order('orders.created_at', { ascending: false });

      if (error) throw error;

      // Group by product_id and get the most recent price
      const priceMap = {};
      for (const item of data) {
        if (!priceMap[item.product_id]) {
          priceMap[item.product_id] = {
            product_id: item.product_id,
            last_price: item.unit_price,
            last_sold_at: item.orders.created_at,
          };
        }
      }

      return Object.values(priceMap);
    }

    // Local storage implementation
    const orders = localStorageDB.orders;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);

    // Filter orders by customer and time range
    const recentOrders = orders
      .filter(o => {
        const orderCustomerId = String(o.customer_id);
        const targetCustomerId = String(customerId);
        const orderDate = new Date(o.created_at);

        return orderCustomerId === targetCustomerId && orderDate >= cutoffDate;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Build price map (only keep the most recent price for each product)
    const priceMap = {};

    for (const order of recentOrders) {
      const items = order.items || order.order_items || [];

      for (const item of items) {
        const productId = String(item.product_id);

        if (!priceMap[productId]) {
          priceMap[productId] = {
            product_id: item.product_id,
            last_price: item.unit_price,
            last_sold_at: order.created_at,
          };
        }
      }
    }

    return Object.values(priceMap);
  },
};

// ============ PURCHASES ============
export const purchaseApi = {
  async getAll() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          supplier:customers(id, short_name, full_name, phone),
          purchase_items(
            id,
            quantity,
            unit_price,
            subtotal,
            product:products(id, name, unit)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return localStorageDB.purchases;
  },

  async create(purchase) {
    // VALIDATION: Ensure supplier_name exists (prevent "N/A" display issues)
    if (!purchase.supplier_name || typeof purchase.supplier_name !== 'string' || purchase.supplier_name.trim() === '') {
      throw new Error('Purchase must include supplier_name. Please provide a valid supplier name.');
    }

    if (isSupabaseConfigured()) {
      // Create purchase
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert([{
          supplier_id: purchase.supplier_id,
          total: purchase.total,
          paid: false,
        }])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Create purchase items
      const purchaseItems = purchase.items.map(item => ({
        purchase_id: purchaseData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of purchase.items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock + item.quantity })
            .eq('id', item.product_id);
        }
      }

      return purchaseData;
    }

    // Local storage
    const newPurchase = {
      ...purchase,
      id: Date.now(),
      paid: false,
      created_at: new Date().toISOString(),
    };
    localStorageDB.purchases.unshift(newPurchase);
    saveToLocalStorage('purchases', localStorageDB.purchases);

    // Update product stock in local storage
    for (const item of purchase.items) {
      const productIndex = localStorageDB.products.findIndex(p => p.id === item.product_id);
      if (productIndex !== -1) {
        localStorageDB.products[productIndex].stock += item.quantity;
        // Save purchase price history
        if (!localStorageDB.products[productIndex].purchase_history) {
          localStorageDB.products[productIndex].purchase_history = [];
        }
        localStorageDB.products[productIndex].purchase_history.push({
          date: newPurchase.created_at,
          price: item.unit_price,
          quantity: item.quantity,
        });
      }
    }
    saveToLocalStorage('products', localStorageDB.products);

    return newPurchase;
  },

  async markAsPaid(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('purchases')
        .update({ paid: true, paid_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.purchases.findIndex(p => p.id === id);
    if (index !== -1) {
      localStorageDB.purchases[index] = {
        ...localStorageDB.purchases[index],
        paid: true,
        paid_at: new Date().toISOString(),
      };
      saveToLocalStorage('purchases', localStorageDB.purchases);
      return localStorageDB.purchases[index];
    }
    throw new Error('Purchase not found');
  },

  async markAsUnpaid(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('purchases')
        .update({ paid: false, paid_at: null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.purchases.findIndex(p => p.id === id);
    if (index !== -1) {
      localStorageDB.purchases[index] = {
        ...localStorageDB.purchases[index],
        paid: false,
        paid_at: null,
      };
      saveToLocalStorage('purchases', localStorageDB.purchases);
      return localStorageDB.purchases[index];
    }
    throw new Error('Purchase not found');
  },

  async delete(id) {
    if (isSupabaseConfigured()) {
      // Delete purchase items first
      await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', id);

      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    localStorageDB.purchases = localStorageDB.purchases.filter(p => p.id !== id);
    saveToLocalStorage('purchases', localStorageDB.purchases);
    return true;
  },
};

// ============ INVOICE ORDERS ============
export const invoiceOrderApi = {
  async getAll() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('invoice_orders')
        .select(`
          *,
          customer:customers(id, short_name, full_name, phone),
          invoice_order_items(
            id,
            quantity,
            unit_price,
            subtotal,
            product:products(id, name, unit)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(order => ({
        ...order,
        order_items: order.invoice_order_items,
      }));
    }
    return localStorageDB.invoice_orders;
  },

  async create(order) {
    // VALIDATION: Ensure customer_name exists (prevent "N/A" display issues)
    if (!order.customer_name || typeof order.customer_name !== 'string' || order.customer_name.trim() === '') {
      throw new Error('Invoice order must include customer_name. Please provide a valid customer name.');
    }

    if (isSupabaseConfigured()) {
      const { data: orderData, error: orderError } = await supabase
        .from('invoice_orders')
        .insert([{
          customer_id: order.customer_id,
          total: order.total,
          paid: false,
          note: order.note || null,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = order.items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update invoice inventory
      for (const item of order.items) {
        const { data: inv } = await supabase
          .from('invoice_inventory')
          .select('stock')
          .eq('product_id', item.product_id)
          .single();

        if (inv) {
          await supabase
            .from('invoice_inventory')
            .update({ stock: Math.max(0, inv.stock - item.quantity) })
            .eq('product_id', item.product_id);
        }
      }

      return orderData;
    }

    // Local storage
    const newOrder = {
      ...order,
      id: Date.now(),
      paid: false,
      created_at: new Date().toISOString(),
    };
    localStorageDB.invoice_orders.unshift(newOrder);
    saveToLocalStorage('invoice_orders', localStorageDB.invoice_orders);

    // Update invoice inventory
    for (const item of order.items) {
      const invIndex = localStorageDB.invoice_inventory.findIndex(i => i.product_id === item.product_id);
      if (invIndex !== -1) {
        localStorageDB.invoice_inventory[invIndex].stock = Math.max(0, localStorageDB.invoice_inventory[invIndex].stock - item.quantity);
        saveToLocalStorage('invoice_inventory', localStorageDB.invoice_inventory);
      }
    }

    return newOrder;
  },

  async markAsPaid(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('invoice_orders')
        .update({ paid: true, paid_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.invoice_orders.findIndex(o => o.id === id);
    if (index !== -1) {
      localStorageDB.invoice_orders[index] = {
        ...localStorageDB.invoice_orders[index],
        paid: true,
        paid_at: new Date().toISOString(),
      };
      saveToLocalStorage('invoice_orders', localStorageDB.invoice_orders);
      return localStorageDB.invoice_orders[index];
    }
    throw new Error('Invoice order not found');
  },

  async markAsUnpaid(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('invoice_orders')
        .update({ paid: false, paid_at: null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.invoice_orders.findIndex(o => o.id === id);
    if (index !== -1) {
      localStorageDB.invoice_orders[index] = {
        ...localStorageDB.invoice_orders[index],
        paid: false,
        paid_at: null,
      };
      saveToLocalStorage('invoice_orders', localStorageDB.invoice_orders);
      return localStorageDB.invoice_orders[index];
    }
    throw new Error('Invoice order not found');
  },

  async update(id, updates) {
    if (isSupabaseConfigured()) {
      if (updates.items) {
        const updateData = { total: updates.total };
        if (updates.note !== undefined) {
          updateData.note = updates.note;
        }

        const { error: orderError } = await supabase
          .from('invoice_orders')
          .update(updateData)
          .eq('id', id);
        if (orderError) throw orderError;

        await supabase
          .from('invoice_order_items')
          .delete()
          .eq('order_id', id);

        const orderItems = updates.items.map(item => ({
          order_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_order_items')
          .insert(orderItems);
        if (itemsError) throw itemsError;
      }
      return true;
    }

    const index = localStorageDB.invoice_orders.findIndex(o => o.id === id);
    if (index !== -1) {
      localStorageDB.invoice_orders[index] = {
        ...localStorageDB.invoice_orders[index],
        ...updates,
      };
      saveToLocalStorage('invoice_orders', localStorageDB.invoice_orders);
      return localStorageDB.invoice_orders[index];
    }
    throw new Error('Invoice order not found');
  },

  async delete(id) {
    if (isSupabaseConfigured()) {
      await supabase
        .from('invoice_order_items')
        .delete()
        .eq('order_id', id);

      const { error } = await supabase
        .from('invoice_orders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    localStorageDB.invoice_orders = localStorageDB.invoice_orders.filter(o => o.id !== id);
    saveToLocalStorage('invoice_orders', localStorageDB.invoice_orders);
    return true;
  },
};

// ============ INVOICE PURCHASES ============
export const invoicePurchaseApi = {
  async getAll() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('invoice_purchases')
        .select(`
          *,
          supplier:customers(id, short_name, full_name, phone),
          invoice_purchase_items(
            id,
            quantity,
            unit_price,
            subtotal,
            product:products(id, name, unit)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(purchase => ({
        ...purchase,
        purchase_items: purchase.invoice_purchase_items,
      }));
    }
    return localStorageDB.invoice_purchases;
  },

  async create(purchase) {
    // VALIDATION: Ensure supplier_name exists (prevent "N/A" display issues)
    if (!purchase.supplier_name || typeof purchase.supplier_name !== 'string' || purchase.supplier_name.trim() === '') {
      throw new Error('Invoice purchase must include supplier_name. Please provide a valid supplier name.');
    }

    if (isSupabaseConfigured()) {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('invoice_purchases')
        .insert([{
          supplier_id: purchase.supplier_id,
          total: purchase.total,
          paid: false,
          note: purchase.note || null,
        }])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      const purchaseItems = purchase.items.map(item => ({
        purchase_id: purchaseData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_purchase_items')
        .insert(purchaseItems);

      if (itemsError) throw itemsError;

      // Update invoice inventory
      for (const item of purchase.items) {
        const { data: inv } = await supabase
          .from('invoice_inventory')
          .select('stock')
          .eq('product_id', item.product_id)
          .single();

        if (inv) {
          await supabase
            .from('invoice_inventory')
            .update({ stock: inv.stock + item.quantity })
            .eq('product_id', item.product_id);
        } else {
          await supabase
            .from('invoice_inventory')
            .insert([{ product_id: item.product_id, stock: item.quantity }]);
        }
      }

      return purchaseData;
    }

    // Local storage
    const newPurchase = {
      ...purchase,
      id: Date.now(),
      paid: false,
      created_at: new Date().toISOString(),
    };
    localStorageDB.invoice_purchases.unshift(newPurchase);
    saveToLocalStorage('invoice_purchases', localStorageDB.invoice_purchases);

    // Update invoice inventory
    for (const item of purchase.items) {
      const invIndex = localStorageDB.invoice_inventory.findIndex(i => i.product_id === item.product_id);
      if (invIndex !== -1) {
        localStorageDB.invoice_inventory[invIndex].stock += item.quantity;
      } else {
        localStorageDB.invoice_inventory.push({
          id: Date.now() + Math.random(),
          product_id: item.product_id,
          stock: item.quantity,
          created_at: new Date().toISOString(),
        });
      }
    }
    saveToLocalStorage('invoice_inventory', localStorageDB.invoice_inventory);

    return newPurchase;
  },

  async markAsPaid(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('invoice_purchases')
        .update({ paid: true, paid_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.invoice_purchases.findIndex(p => p.id === id);
    if (index !== -1) {
      localStorageDB.invoice_purchases[index] = {
        ...localStorageDB.invoice_purchases[index],
        paid: true,
        paid_at: new Date().toISOString(),
      };
      saveToLocalStorage('invoice_purchases', localStorageDB.invoice_purchases);
      return localStorageDB.invoice_purchases[index];
    }
    throw new Error('Invoice purchase not found');
  },

  async markAsUnpaid(id) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('invoice_purchases')
        .update({ paid: false, paid_at: null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const index = localStorageDB.invoice_purchases.findIndex(p => p.id === id);
    if (index !== -1) {
      localStorageDB.invoice_purchases[index] = {
        ...localStorageDB.invoice_purchases[index],
        paid: false,
        paid_at: null,
      };
      saveToLocalStorage('invoice_purchases', localStorageDB.invoice_purchases);
      return localStorageDB.invoice_purchases[index];
    }
    throw new Error('Invoice purchase not found');
  },

  async delete(id) {
    if (isSupabaseConfigured()) {
      await supabase
        .from('invoice_purchase_items')
        .delete()
        .eq('purchase_id', id);

      const { error } = await supabase
        .from('invoice_purchases')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    localStorageDB.invoice_purchases = localStorageDB.invoice_purchases.filter(p => p.id !== id);
    saveToLocalStorage('invoice_purchases', localStorageDB.invoice_purchases);
    return true;
  },
};

// ============ INVOICE INVENTORY ============
export const invoiceInventoryApi = {
  async getAll() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('invoice_inventory')
        .select(`
          *,
          product:products(id, name, unit, price, invoice_price)
        `);
      if (error) throw error;
      return data;
    }
    return localStorageDB.invoice_inventory;
  },

  async updateStock(productId, stock) {
    if (isSupabaseConfigured()) {
      const { data: existing } = await supabase
        .from('invoice_inventory')
        .select('id')
        .eq('product_id', productId)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('invoice_inventory')
          .update({ stock })
          .eq('product_id', productId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('invoice_inventory')
          .insert([{ product_id: productId, stock }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    }

    const index = localStorageDB.invoice_inventory.findIndex(i => i.product_id === productId);
    if (index !== -1) {
      localStorageDB.invoice_inventory[index].stock = stock;
    } else {
      localStorageDB.invoice_inventory.push({
        id: Date.now(),
        product_id: productId,
        stock,
        created_at: new Date().toISOString(),
      });
    }
    saveToLocalStorage('invoice_inventory', localStorageDB.invoice_inventory);
    return localStorageDB.invoice_inventory.find(i => i.product_id === productId);
  },
};

// ============ PRODUCTION GUARD ============
const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

if (!isSupabaseConfigured() && !isDevMode) {
  console.error(
    '[CRITICAL] Supabase is not configured and app is not in dev mode. ' +
    'Data operations will use empty localStorage. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or set VITE_DEV_MODE=true for local development.'
  );
}
