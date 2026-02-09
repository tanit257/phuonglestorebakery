import { create } from 'zustand';
import { productApi, customerApi, orderApi, purchaseApi, invoiceOrderApi, invoicePurchaseApi, invoiceInventoryApi } from '../services/api';
import { OVERDUE_DAYS, RETAIL_CUSTOMER_NAME, CUSTOMER_TYPES } from '../utils/constants';
import { connectionMonitor } from '../services/connectionMonitor';

export const useStore = create((set, get) => ({
  // ============ STATE ============
  products: [],
  customers: [],
  orders: [],
  purchases: [],
  isLoading: true,
  isCreatingOrder: false,
  isCreatingPurchase: false,
  error: null,
  notification: null,
  connectionStatus: 'online', // 'online' | 'offline'

  // Cart state (keeping for backward compatibility)
  cart: [],
  selectedCustomer: null,

  // Purchase cart state
  purchaseCart: [],
  selectedSupplier: null,

  // Draft cart state for handling multiple orders simultaneously
  draftCarts: [], // Array of {id, customerId, customer, items, total, createdAt, updatedAt}
  activeDraftId: null, // Currently active draft ID

  // ============ INVOICE MODE STATE ============
  invoiceOrders: [],
  invoicePurchases: [],
  invoiceInventory: [],
  isCreatingInvoiceOrder: false,
  isCreatingInvoicePurchase: false,

  // Invoice cart state
  invoiceCart: [],
  invoiceSelectedCustomer: null,
  invoicePurchaseCart: [],
  invoiceSelectedSupplier: null,

  // Invoice draft cart state
  invoiceDraftCarts: [],
  activeInvoiceDraftId: null,
  
  // ============ INITIALIZATION ============
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Seed initial data if needed
      // await seedData(SAMPLE_PRODUCTS, SAMPLE_CUSTOMERS);

      // Load all data including invoice mode data
      let [products, customers, orders, purchases, invoiceOrders, invoicePurchases, invoiceInventory] = await Promise.all([
        productApi.getAll(),
        customerApi.getAll(),
        orderApi.getAll(),
        purchaseApi.getAll(),
        invoiceOrderApi.getAll(),
        invoicePurchaseApi.getAll(),
        invoiceInventoryApi.getAll(),
      ]);

      // Only seed sample data in development mode
      if (orders.length === 0 && import.meta.env.VITE_DEV_MODE === 'true') {
        const { generateSeedData } = await import('../utils/seedData');
        const seedDataResult = generateSeedData();

        customers = seedDataResult.customers;
        products = seedDataResult.products;
        orders = seedDataResult.orders;
        invoiceOrders = seedDataResult.invoiceOrders || [];
        invoiceInventory = seedDataResult.invoiceInventory || [];

        // Save to localStorage (must match keys in api.js: phuongle_xxx)
        localStorage.setItem('phuongle_products', JSON.stringify(products));
        localStorage.setItem('phuongle_customers', JSON.stringify(customers));
        localStorage.setItem('phuongle_orders', JSON.stringify(orders));
        localStorage.setItem('phuongle_invoice_orders', JSON.stringify(invoiceOrders));
        localStorage.setItem('phuongle_invoice_inventory', JSON.stringify(invoiceInventory));
      }

      // Load draft carts from localStorage
      const loadedDraftCarts = get().loadDraftsFromStorage();
      const loadedInvoiceDraftCarts = get().loadInvoiceDraftsFromStorage();

      set({
        products,
        customers,
        orders,
        purchases,
        invoiceOrders,
        invoicePurchases,
        invoiceInventory,
        draftCarts: loadedDraftCarts.drafts,
        activeDraftId: loadedDraftCarts.activeId,
        invoiceDraftCarts: loadedInvoiceDraftCarts.drafts,
        activeInvoiceDraftId: loadedInvoiceDraftCarts.activeId,
        isLoading: false,
      });
      // Subscribe to connection status changes
      connectionMonitor.onStatusChange((status) => {
        set({ connectionStatus: status });
      });

    } catch (error) {
      // Check if it's a network error
      const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network') || !navigator.onLine;
      if (isNetworkError) {
        connectionMonitor.markOffline();
        set({ error: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.', isLoading: false, connectionStatus: 'offline' });
      } else {
        set({ error: error.message, isLoading: false });
      }
    }
  },

  // ============ CONNECTION ============
  retryConnection: async () => {
    const isOnline = await connectionMonitor.checkConnection();
    if (isOnline) {
      set({ connectionStatus: 'online', error: null });
      get().initialize();
    } else {
      get().showNotification('Vẫn không có kết nối mạng', 'error');
    }
  },

  // ============ NOTIFICATIONS ============
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => set({ notification: null }), 3000);
  },
  
  clearNotification: () => set({ notification: null }),
  
  // ============ PRODUCTS ============
  addProduct: async (product) => {
    try {
      const newProduct = await productApi.create(product);

      set(state => {
        // Check if product already exists in state (prevent duplicate)
        const exists = state.products.some(p => p.id === newProduct.id);
        if (exists) {
          return state; // Return unchanged state
        }

        return { products: [...state.products, newProduct] };
      });

      get().showNotification('Thêm sản phẩm thành công!', 'success');
      return newProduct;
    } catch (error) {
      get().showNotification('Lỗi khi thêm sản phẩm', 'error');
      throw error;
    }
  },
  
  updateProduct: async (id, updates) => {
    try {
      const updated = await productApi.update(id, updates);
      set(state => ({
        products: state.products.map(p => p.id === id ? updated : p),
      }));
      get().showNotification('Cập nhật sản phẩm thành công!', 'success');
      return updated;
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật sản phẩm', 'error');
      throw error;
    }
  },
  
  deleteProduct: async (id) => {
    try {
      await productApi.delete(id);
      set(state => ({
        products: state.products.filter(p => p.id !== id),
      }));
      get().showNotification('Xóa sản phẩm thành công!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi xóa sản phẩm', 'error');
      throw error;
    }
  },
  
  // ============ CUSTOMERS ============
  addCustomer: async (customer) => {
    try {
      const newCustomer = await customerApi.create(customer);

      set(state => {
        // Check if customer already exists in state (prevent duplicate)
        const exists = state.customers.some(c => c.id === newCustomer.id);
        if (exists) {
          return state; // Return unchanged state
        }

        return { customers: [...state.customers, newCustomer] };
      });

      get().showNotification('Thêm khách hàng thành công!', 'success');
      return newCustomer;
    } catch (error) {
      get().showNotification('Lỗi khi thêm khách hàng', 'error');
      throw error;
    }
  },
  
  updateCustomer: async (id, updates) => {
    try {
      const updated = await customerApi.update(id, updates);
      set(state => ({
        customers: state.customers.map(c => c.id === id ? updated : c),
      }));
      get().showNotification('Cập nhật khách hàng thành công!', 'success');
      return updated;
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật khách hàng', 'error');
      throw error;
    }
  },
  
  deleteCustomer: async (id) => {
    try {
      await customerApi.delete(id);
      set(state => ({
        customers: state.customers.filter(c => c.id !== id),
      }));
      get().showNotification('Xóa khách hàng thành công!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi xóa khách hàng', 'error');
      throw error;
    }
  },

  importCustomers: async (categorized, mode) => {
    try {
      const { newCustomers, duplicateCustomers } = categorized;
      let addedCount = 0;
      let updatedCount = 0;

      // Add new customers
      for (const customer of newCustomers) {
        await customerApi.create(customer);
        addedCount++;
      }

      // Update duplicates if mode is 'override'
      if (mode === 'override') {
        for (const customer of duplicateCustomers) {
          await customerApi.update(customer.existingId, {
            short_name: customer.short_name,
            full_name: customer.full_name,
            type: customer.type,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            billing_address: customer.billing_address,
            tax_code: customer.tax_code,
          });
          updatedCount++;
        }
      }

      // Reload customers from API
      const customers = await customerApi.getAll();
      set({ customers });

      const message = mode === 'override'
        ? `Import thành công: ${addedCount} mới, ${updatedCount} cập nhật`
        : `Import thành công: ${addedCount} khách hàng mới`;

      get().showNotification(message, 'success');
    } catch (error) {
      get().showNotification('Lỗi khi import khách hàng', 'error');
      throw error;
    }
  },

  // ============ ORDERS ============
  createOrder: async () => {
    // Prevent duplicate orders from double-clicking
    if (get().isCreatingOrder) {
      return null;
    }
    
    const { cart, selectedCustomer } = get();
    
    if (!selectedCustomer) {
      get().showNotification('Vui lòng chọn khách hàng', 'error');
      return null;
    }
    
    if (cart.length === 0) {
      get().showNotification('Vui lòng thêm sản phẩm vào đơn hàng', 'error');
      return null;
    }
    
    // Set creating flag
    set({ isCreatingOrder: true });
    
    try {
      // Normalize items: use customPrice as unit_price if set
      const normalizedItems = cart.map(item => ({
        ...item,
        unit_price: item.customPrice || item.unit_price,
      }));

      const order = {
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.short_name || selectedCustomer.full_name || selectedCustomer.name,
        items: normalizedItems,
        total: cart.reduce((sum, item) => sum + item.subtotal, 0),
      };

      const newOrder = await orderApi.create(order);

      // Add full order data for local display
      const fullOrder = {
        ...newOrder,
        customer: selectedCustomer,
        order_items: normalizedItems.map(item => ({
          ...item,
          product: get().products.find(p => p.id === item.product_id),
        })),
      };

      // Update stock after successful order creation
      const updatedProducts = get().products.map(product => {
        const orderItem = cart.find(item => String(item.product_id) === String(product.id));
        if (orderItem) {
          return {
            ...product,
            stock: Math.max(0, product.stock - orderItem.quantity),
          };
        }
        return product;
      });

      // Update stock in database
      for (const item of cart) {
        const product = updatedProducts.find(p => String(p.id) === String(item.product_id));
        if (product) {
          await productApi.update(item.product_id, { stock: product.stock });
        }
      }

      // Delete active draft after successful order creation
      const { activeDraftId, draftCarts } = get();
      const newDraftCarts = activeDraftId
        ? draftCarts.filter(d => d.id !== activeDraftId)
        : draftCarts;

      // Switch to next draft if available
      const nextDraft = newDraftCarts[0];

      set(state => ({
        orders: [fullOrder, ...state.orders],
        products: updatedProducts,
        cart: nextDraft ? [...nextDraft.items] : [],
        selectedCustomer: nextDraft ? nextDraft.customer : null,
        draftCarts: newDraftCarts,
        activeDraftId: nextDraft ? nextDraft.id : null,
      }));

      get().saveDraftsToStorage();
      get().showNotification('Tạo đơn hàng thành công!', 'success');
      return fullOrder;
    } catch (error) {
      get().showNotification('Lỗi khi tạo đơn hàng', 'error');
      throw error;
    } finally {
      // Always reset the creating flag
      set({ isCreatingOrder: false });
    }
  },
  
  markOrderAsPaid: async (id) => {
    try {
      await orderApi.markAsPaid(id);
      set(state => ({
        orders: state.orders.map(o =>
          o.id === id ? { ...o, paid: true, paid_at: new Date().toISOString() } : o
        ),
      }));
      get().showNotification('Đã ghi nhận thanh toán!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật thanh toán', 'error');
      throw error;
    }
  },

  markOrderAsUnpaid: async (id) => {
    try {
      await orderApi.markAsUnpaid(id);
      set(state => ({
        orders: state.orders.map(o =>
          o.id === id ? { ...o, paid: false, paid_at: null } : o
        ),
      }));
      get().showNotification('Đã đánh dấu chưa thanh toán!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật trạng thái', 'error');
      throw error;
    }
  },

  updateOrder: async (id, updates) => {
    try {
      await orderApi.update(id, updates);
      set(state => ({
        orders: state.orders.map(o =>
          o.id === id
            ? {
                ...o,
                ...updates,
                order_items: updates.items || o.order_items,
                items: updates.items || o.items,
              }
            : o
        ),
      }));
      get().showNotification('Cập nhật đơn hàng thành công!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật đơn hàng', 'error');
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      await orderApi.delete(id);
      set(state => ({
        orders: state.orders.filter(o => o.id !== id),
      }));
      get().showNotification('Xóa đơn hàng thành công!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi xóa đơn hàng', 'error');
      throw error;
    }
  },

  // ============ CART ============
  setSelectedCustomer: (customer) => {
    set({ selectedCustomer: customer });

    // Create draft if customer is selected and no active draft
    if (customer && !get().activeDraftId) {
      get().createDraftCart(customer);
    } else if (customer && get().activeDraftId) {
      // Sync customer change to active draft immediately
      setTimeout(() => get().syncActiveDraft(), 0);
    }
  },
  
  addToCart: (product, quantity = 1) => {
    set(state => {
      const existing = state.cart.find(item => item.product_id === product.id);

      if (existing) {
        return {
          cart: state.cart.map(item =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  subtotal: (item.quantity + quantity) * item.unit_price,
                }
              : item
          ),
        };
      }

      return {
        cart: [
          ...state.cart,
          {
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price: product.price,
            discount: 0,
            discountType: 'percent', // 'percent' or 'fixed'
            customPrice: null, // Override price per unit
            note: '', // Note for this item
            subtotal: quantity * product.price,
            product,
          },
        ],
      };
    });

    // Sync to draft cart
    setTimeout(() => get().syncActiveDraft(), 0);
  },
  
  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set(state => ({
      cart: state.cart.map(item => {
        if (item.product_id !== productId) return item;
        const effectivePrice = item.customPrice || item.unit_price;
        const baseSubtotal = quantity * effectivePrice;
        const discountAmount = item.discountType === 'percent'
          ? baseSubtotal * (item.discount / 100)
          : item.discount;
        return {
          ...item,
          quantity,
          subtotal: baseSubtotal - discountAmount,
        };
      }),
    }));

    // Sync to draft cart
    setTimeout(() => get().syncActiveDraft(), 0);
  },
  
  // Update discount for cart item
  updateCartItemDiscount: (productId, discount, discountType = 'percent') => {
    set(state => ({
      cart: state.cart.map(item => {
        if (item.product_id !== productId) return item;
        const effectivePrice = item.customPrice || item.unit_price;
        const baseSubtotal = item.quantity * effectivePrice;
        const discountAmount = discountType === 'percent'
          ? baseSubtotal * (discount / 100)
          : discount;
        return {
          ...item,
          discount,
          discountType,
          subtotal: Math.max(0, baseSubtotal - discountAmount),
        };
      }),
    }));

    // Sync to draft cart
    setTimeout(() => get().syncActiveDraft(), 0);
  },
  
  // Update custom price for cart item
  updateCartItemPrice: (productId, customPrice) => {
    set(state => ({
      cart: state.cart.map(item => {
        if (item.product_id !== productId) return item;
        const effectivePrice = customPrice || item.unit_price;
        const baseSubtotal = item.quantity * effectivePrice;
        const discountAmount = item.discountType === 'percent'
          ? baseSubtotal * (item.discount / 100)
          : item.discount;
        return {
          ...item,
          customPrice,
          subtotal: Math.max(0, baseSubtotal - discountAmount),
        };
      }),
    }));

    // Sync to draft cart
    setTimeout(() => get().syncActiveDraft(), 0);
  },

  // Update note for cart item
  updateCartItemNote: (productId, note) => {
    set(state => ({
      cart: state.cart.map(item =>
        item.product_id === productId ? { ...item, note } : item
      ),
    }));

    // Sync to draft cart
    setTimeout(() => get().syncActiveDraft(), 0);
  },
  
  removeFromCart: (productId) => {
    set(state => ({
      cart: state.cart.filter(item => item.product_id !== productId),
    }));

    // Sync to draft cart
    setTimeout(() => get().syncActiveDraft(), 0);
  },
  
  clearCart: () => {
    const { activeDraftId } = get();

    // Delete active draft when clearing cart
    if (activeDraftId) {
      get().deleteDraftCart(activeDraftId);
    } else {
      set({ cart: [], selectedCustomer: null });
    }
  },

  // ============ PURCHASES ============
  createPurchase: async () => {
    // Prevent duplicate purchases from double-clicking
    if (get().isCreatingPurchase) {
      return null;
    }

    const { purchaseCart, selectedSupplier } = get();

    if (!selectedSupplier) {
      get().showNotification('Vui lòng chọn nhà cung cấp', 'error');
      return null;
    }

    if (purchaseCart.length === 0) {
      get().showNotification('Vui lòng thêm sản phẩm vào phiếu nhập', 'error');
      return null;
    }

    // Set creating flag
    set({ isCreatingPurchase: true });

    try {
      const purchase = {
        supplier_id: selectedSupplier.id,
        supplier_name: selectedSupplier.short_name || selectedSupplier.full_name || selectedSupplier.name,
        items: purchaseCart,
        total: purchaseCart.reduce((sum, item) => sum + item.subtotal, 0),
      };

      const newPurchase = await purchaseApi.create(purchase);

      // Add full purchase data for local display
      const fullPurchase = {
        ...newPurchase,
        supplier: selectedSupplier,
        purchase_items: purchaseCart.map(item => ({
          ...item,
          product: get().products.find(p => p.id === item.product_id),
        })),
      };

      // Update local products state with new stock
      const updatedProducts = get().products.map(product => {
        const purchaseItem = purchaseCart.find(item => item.product_id === product.id);
        if (purchaseItem) {
          return {
            ...product,
            stock: product.stock + purchaseItem.quantity,
          };
        }
        return product;
      });

      set(state => ({
        purchases: [fullPurchase, ...state.purchases],
        products: updatedProducts,
        purchaseCart: [],
        selectedSupplier: null,
      }));

      get().showNotification('Tạo phiếu nhập hàng thành công!', 'success');
      return fullPurchase;
    } catch (error) {
      get().showNotification('Lỗi khi tạo phiếu nhập hàng', 'error');
      throw error;
    } finally {
      // Always reset the creating flag
      set({ isCreatingPurchase: false });
    }
  },

  markPurchaseAsPaid: async (id) => {
    try {
      await purchaseApi.markAsPaid(id);
      set(state => ({
        purchases: state.purchases.map(p =>
          p.id === id ? { ...p, paid: true, paid_at: new Date().toISOString() } : p
        ),
      }));
      get().showNotification('Đã ghi nhận thanh toán!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật thanh toán', 'error');
      throw error;
    }
  },

  markPurchaseAsUnpaid: async (id) => {
    try {
      await purchaseApi.markAsUnpaid(id);
      set(state => ({
        purchases: state.purchases.map(p =>
          p.id === id ? { ...p, paid: false, paid_at: null } : p
        ),
      }));
      get().showNotification('Đã đánh dấu chưa thanh toán!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật trạng thái', 'error');
      throw error;
    }
  },

  deletePurchase: async (id) => {
    try {
      await purchaseApi.delete(id);
      set(state => ({
        purchases: state.purchases.filter(p => p.id !== id),
      }));
      get().showNotification('Xóa phiếu nhập hàng thành công!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi xóa phiếu nhập hàng', 'error');
      throw error;
    }
  },

  // ============ PURCHASE CART ============
  setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),

  addToPurchaseCart: (product, quantity = 1, purchasePrice = null) => {
    set(state => {
      const existing = state.purchaseCart.find(item => item.product_id === product.id);

      if (existing) {
        return {
          purchaseCart: state.purchaseCart.map(item =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  subtotal: (item.quantity + quantity) * item.unit_price,
                }
              : item
          ),
        };
      }

      return {
        purchaseCart: [
          ...state.purchaseCart,
          {
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price: purchasePrice || product.price || 0,
            subtotal: quantity * (purchasePrice || product.price || 0),
            product,
          },
        ],
      };
    });
  },

  updatePurchaseCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromPurchaseCart(productId);
      return;
    }

    set(state => ({
      purchaseCart: state.purchaseCart.map(item => {
        if (item.product_id !== productId) return item;
        return {
          ...item,
          quantity,
          subtotal: quantity * item.unit_price,
        };
      }),
    }));
  },

  updatePurchaseCartPrice: (productId, price) => {
    set(state => ({
      purchaseCart: state.purchaseCart.map(item => {
        if (item.product_id !== productId) return item;
        return {
          ...item,
          unit_price: price,
          subtotal: item.quantity * price,
        };
      }),
    }));
  },

  removeFromPurchaseCart: (productId) => {
    set(state => ({
      purchaseCart: state.purchaseCart.filter(item => item.product_id !== productId),
    }));
  },

  clearPurchaseCart: () => set({ purchaseCart: [], selectedSupplier: null }),

  // ============ COMPUTED VALUES ============
  getCustomerDebt: (customerId) => {
    return get().orders
      .filter(o => (String(o.customer_id) === String(customerId) || String(o.customer?.id) === String(customerId)) && !o.paid)
      .reduce((sum, o) => sum + o.total, 0);
  },
  
  getTotalDebt: () => {
    return get().orders
      .filter(o => !o.paid)
      .reduce((sum, o) => sum + o.total, 0);
  },
  
  getOverdueOrders: () => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - OVERDUE_DAYS);
    
    return get().orders.filter(o => 
      !o.paid && new Date(o.created_at) < threshold
    );
  },
  
  getTodayRevenue: () => {
    const today = new Date().toDateString();
    return get().orders
      .filter(o => new Date(o.created_at).toDateString() === today)
      .reduce((sum, o) => sum + o.total, 0);
  },
  
  getTodayOrders: () => {
    const today = new Date().toDateString();
    return get().orders.filter(o => 
      new Date(o.created_at).toDateString() === today
    );
  },
  
  getCartTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getPurchaseCartTotal: () => {
    return get().purchaseCart.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getTotalPurchaseDebt: () => {
    return get().purchases
      .filter(p => !p.paid)
      .reduce((sum, p) => sum + p.total, 0);
  },

  getSupplierDebt: (supplierId) => {
    return get().purchases
      .filter(p => (String(p.supplier_id) === String(supplierId) || String(p.supplier?.id) === String(supplierId)) && !p.paid)
      .reduce((sum, p) => sum + p.total, 0);
  },

  // ============ INVOICE MODE - ORDERS ============
  createInvoiceOrder: async () => {
    if (get().isCreatingInvoiceOrder) {
      return null;
    }

    const { invoiceCart, invoiceSelectedCustomer } = get();

    if (!invoiceSelectedCustomer) {
      get().showNotification('Vui lòng chọn khách hàng', 'error');
      return null;
    }

    if (invoiceCart.length === 0) {
      get().showNotification('Vui lòng thêm sản phẩm vào đơn hàng', 'error');
      return null;
    }

    set({ isCreatingInvoiceOrder: true });

    try {
      // Normalize items: use customPrice as unit_price if set
      const normalizedItems = invoiceCart.map(item => ({
        ...item,
        unit_price: item.customPrice || item.unit_price,
      }));

      const order = {
        customer_id: invoiceSelectedCustomer.id,
        customer_name: invoiceSelectedCustomer.short_name || invoiceSelectedCustomer.full_name || invoiceSelectedCustomer.name,
        items: normalizedItems,
        total: invoiceCart.reduce((sum, item) => sum + item.subtotal, 0),
      };

      const newOrder = await invoiceOrderApi.create(order);

      const fullOrder = {
        ...newOrder,
        customer: invoiceSelectedCustomer,
        order_items: normalizedItems.map(item => ({
          ...item,
          product: get().products.find(p => p.id === item.product_id),
        })),
      };

      // Update invoice inventory in state
      const updatedInventory = [...get().invoiceInventory];
      for (const item of invoiceCart) {
        const invIndex = updatedInventory.findIndex(i => i.product_id === item.product_id);
        if (invIndex !== -1) {
          updatedInventory[invIndex] = {
            ...updatedInventory[invIndex],
            stock: Math.max(0, updatedInventory[invIndex].stock - item.quantity),
          };
        }
      }

      // Delete active invoice draft after successful order creation
      const { activeInvoiceDraftId, invoiceDraftCarts } = get();
      const newInvoiceDraftCarts = activeInvoiceDraftId
        ? invoiceDraftCarts.filter(d => d.id !== activeInvoiceDraftId)
        : invoiceDraftCarts;

      // Switch to next draft if available
      const nextDraft = newInvoiceDraftCarts[0];

      set(state => ({
        invoiceOrders: [fullOrder, ...state.invoiceOrders],
        invoiceInventory: updatedInventory,
        invoiceCart: nextDraft ? [...nextDraft.items] : [],
        invoiceSelectedCustomer: nextDraft ? nextDraft.customer : null,
        invoiceDraftCarts: newInvoiceDraftCarts,
        activeInvoiceDraftId: nextDraft ? nextDraft.id : null,
      }));

      get().saveInvoiceDraftsToStorage();
      get().showNotification('Tạo đơn hàng hóa đơn thành công!', 'success');
      return fullOrder;
    } catch (error) {
      get().showNotification('Lỗi khi tạo đơn hàng hóa đơn', 'error');
      throw error;
    } finally {
      set({ isCreatingInvoiceOrder: false });
    }
  },

  markInvoiceOrderAsPaid: async (id) => {
    try {
      await invoiceOrderApi.markAsPaid(id);
      set(state => ({
        invoiceOrders: state.invoiceOrders.map(o =>
          o.id === id ? { ...o, paid: true, paid_at: new Date().toISOString() } : o
        ),
      }));
      get().showNotification('Đã ghi nhận thanh toán!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật thanh toán', 'error');
      throw error;
    }
  },

  markInvoiceOrderAsUnpaid: async (id) => {
    try {
      await invoiceOrderApi.markAsUnpaid(id);
      set(state => ({
        invoiceOrders: state.invoiceOrders.map(o =>
          o.id === id ? { ...o, paid: false, paid_at: null } : o
        ),
      }));
      get().showNotification('Đã đánh dấu chưa thanh toán!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật trạng thái', 'error');
      throw error;
    }
  },

  updateInvoiceOrder: async (id, updates) => {
    try {
      await invoiceOrderApi.update(id, updates);
      set(state => ({
        invoiceOrders: state.invoiceOrders.map(o =>
          o.id === id
            ? {
                ...o,
                ...updates,
                order_items: updates.items || o.order_items,
                items: updates.items || o.items,
              }
            : o
        ),
      }));
      get().showNotification('Cập nhật đơn hàng thành công!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật đơn hàng', 'error');
      throw error;
    }
  },

  deleteInvoiceOrder: async (id) => {
    try {
      await invoiceOrderApi.delete(id);
      set(state => ({
        invoiceOrders: state.invoiceOrders.filter(o => o.id !== id),
      }));
      get().showNotification('Xóa đơn hàng thành công!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi xóa đơn hàng', 'error');
      throw error;
    }
  },

  // ============ INVOICE MODE - CART ============
  setInvoiceSelectedCustomer: (customer) => {
    set({ invoiceSelectedCustomer: customer });

    // Create draft if customer is selected and no active draft
    if (customer && !get().activeInvoiceDraftId) {
      get().createInvoiceDraftCart(customer);
    } else if (customer && get().activeInvoiceDraftId) {
      // Sync customer change to active invoice draft immediately
      setTimeout(() => get().syncActiveInvoiceDraft(), 0);
    }
  },

  addToInvoiceCart: (product, quantity = 1) => {
    set(state => {
      const existing = state.invoiceCart.find(item => item.product_id === product.id);
      const invoicePrice = product.invoice_price || product.price;

      if (existing) {
        return {
          invoiceCart: state.invoiceCart.map(item =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  subtotal: (item.quantity + quantity) * item.unit_price,
                }
              : item
          ),
        };
      }

      return {
        invoiceCart: [
          ...state.invoiceCart,
          {
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price: invoicePrice,
            discount: 0,
            discountType: 'percent',
            customPrice: null,
            note: '', // Note for this item
            subtotal: quantity * invoicePrice,
            product,
          },
        ],
      };
    });

    // Sync to invoice draft cart
    setTimeout(() => get().syncActiveInvoiceDraft(), 0);
  },

  updateInvoiceCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromInvoiceCart(productId);
      return;
    }

    set(state => ({
      invoiceCart: state.invoiceCart.map(item => {
        if (item.product_id !== productId) return item;
        const effectivePrice = item.customPrice || item.unit_price;
        const baseSubtotal = quantity * effectivePrice;
        const discountAmount = item.discountType === 'percent'
          ? baseSubtotal * (item.discount / 100)
          : item.discount;
        return {
          ...item,
          quantity,
          subtotal: baseSubtotal - discountAmount,
        };
      }),
    }));

    // Sync to invoice draft cart
    setTimeout(() => get().syncActiveInvoiceDraft(), 0);
  },

  updateInvoiceCartItemPrice: (productId, customPrice) => {
    set(state => ({
      invoiceCart: state.invoiceCart.map(item => {
        if (item.product_id !== productId) return item;
        const effectivePrice = customPrice || item.unit_price;
        const baseSubtotal = item.quantity * effectivePrice;
        const discountAmount = item.discountType === 'percent'
          ? baseSubtotal * (item.discount / 100)
          : item.discount;
        return {
          ...item,
          customPrice,
          subtotal: Math.max(0, baseSubtotal - discountAmount),
        };
      }),
    }));

    // Sync to invoice draft cart
    setTimeout(() => get().syncActiveInvoiceDraft(), 0);
  },

  // Update note for invoice cart item
  updateInvoiceCartItemNote: (productId, note) => {
    set(state => ({
      invoiceCart: state.invoiceCart.map(item =>
        item.product_id === productId ? { ...item, note } : item
      ),
    }));

    // Sync to invoice draft cart
    setTimeout(() => get().syncActiveInvoiceDraft(), 0);
  },

  removeFromInvoiceCart: (productId) => {
    set(state => ({
      invoiceCart: state.invoiceCart.filter(item => item.product_id !== productId),
    }));

    // Sync to invoice draft cart
    setTimeout(() => get().syncActiveInvoiceDraft(), 0);
  },

  clearInvoiceCart: () => {
    const { activeInvoiceDraftId } = get();

    // Delete active draft when clearing cart
    if (activeInvoiceDraftId) {
      get().deleteInvoiceDraftCart(activeInvoiceDraftId);
    } else {
      set({ invoiceCart: [], invoiceSelectedCustomer: null });
    }
  },

  // ============ INVOICE MODE - PURCHASES ============
  createInvoicePurchase: async () => {
    if (get().isCreatingInvoicePurchase) {
      return null;
    }

    const { invoicePurchaseCart, invoiceSelectedSupplier } = get();

    if (!invoiceSelectedSupplier) {
      get().showNotification('Vui lòng chọn nhà cung cấp', 'error');
      return null;
    }

    if (invoicePurchaseCart.length === 0) {
      get().showNotification('Vui lòng thêm sản phẩm vào phiếu nhập', 'error');
      return null;
    }

    set({ isCreatingInvoicePurchase: true });

    try {
      const purchase = {
        supplier_id: invoiceSelectedSupplier.id,
        supplier_name: invoiceSelectedSupplier.short_name || invoiceSelectedSupplier.full_name || invoiceSelectedSupplier.name,
        items: invoicePurchaseCart,
        total: invoicePurchaseCart.reduce((sum, item) => sum + item.subtotal, 0),
      };

      const newPurchase = await invoicePurchaseApi.create(purchase);

      const fullPurchase = {
        ...newPurchase,
        supplier: invoiceSelectedSupplier,
        purchase_items: invoicePurchaseCart.map(item => ({
          ...item,
          product: get().products.find(p => p.id === item.product_id),
        })),
      };

      // Update invoice inventory in state
      const updatedInventory = [...get().invoiceInventory];
      for (const item of invoicePurchaseCart) {
        const invIndex = updatedInventory.findIndex(i => i.product_id === item.product_id);
        if (invIndex !== -1) {
          updatedInventory[invIndex] = {
            ...updatedInventory[invIndex],
            stock: updatedInventory[invIndex].stock + item.quantity,
          };
        } else {
          updatedInventory.push({
            id: Date.now() + Math.random(),
            product_id: item.product_id,
            stock: item.quantity,
            created_at: new Date().toISOString(),
          });
        }
      }

      set(state => ({
        invoicePurchases: [fullPurchase, ...state.invoicePurchases],
        invoiceInventory: updatedInventory,
        invoicePurchaseCart: [],
        invoiceSelectedSupplier: null,
      }));

      get().showNotification('Tạo phiếu nhập hóa đơn thành công!', 'success');
      return fullPurchase;
    } catch (error) {
      get().showNotification('Lỗi khi tạo phiếu nhập hóa đơn', 'error');
      throw error;
    } finally {
      set({ isCreatingInvoicePurchase: false });
    }
  },

  markInvoicePurchaseAsPaid: async (id) => {
    try {
      await invoicePurchaseApi.markAsPaid(id);
      set(state => ({
        invoicePurchases: state.invoicePurchases.map(p =>
          p.id === id ? { ...p, paid: true, paid_at: new Date().toISOString() } : p
        ),
      }));
      get().showNotification('Đã ghi nhận thanh toán!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật thanh toán', 'error');
      throw error;
    }
  },

  markInvoicePurchaseAsUnpaid: async (id) => {
    try {
      await invoicePurchaseApi.markAsUnpaid(id);
      set(state => ({
        invoicePurchases: state.invoicePurchases.map(p =>
          p.id === id ? { ...p, paid: false, paid_at: null } : p
        ),
      }));
      get().showNotification('Đã đánh dấu chưa thanh toán!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật trạng thái', 'error');
      throw error;
    }
  },

  deleteInvoicePurchase: async (id) => {
    try {
      await invoicePurchaseApi.delete(id);
      set(state => ({
        invoicePurchases: state.invoicePurchases.filter(p => p.id !== id),
      }));
      get().showNotification('Xóa phiếu nhập thành công!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi xóa phiếu nhập', 'error');
      throw error;
    }
  },

  // ============ INVOICE MODE - PURCHASE CART ============
  setInvoiceSelectedSupplier: (supplier) => set({ invoiceSelectedSupplier: supplier }),

  addToInvoicePurchaseCart: (product, quantity = 1, purchasePrice = null) => {
    set(state => {
      const existing = state.invoicePurchaseCart.find(item => item.product_id === product.id);
      const price = purchasePrice || product.invoice_price || product.price || 0;

      if (existing) {
        return {
          invoicePurchaseCart: state.invoicePurchaseCart.map(item =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  subtotal: (item.quantity + quantity) * item.unit_price,
                }
              : item
          ),
        };
      }

      return {
        invoicePurchaseCart: [
          ...state.invoicePurchaseCart,
          {
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price: price,
            subtotal: quantity * price,
            product,
          },
        ],
      };
    });
  },

  updateInvoicePurchaseCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromInvoicePurchaseCart(productId);
      return;
    }

    set(state => ({
      invoicePurchaseCart: state.invoicePurchaseCart.map(item => {
        if (item.product_id !== productId) return item;
        return {
          ...item,
          quantity,
          subtotal: quantity * item.unit_price,
        };
      }),
    }));
  },

  updateInvoicePurchaseCartPrice: (productId, price) => {
    set(state => ({
      invoicePurchaseCart: state.invoicePurchaseCart.map(item => {
        if (item.product_id !== productId) return item;
        return {
          ...item,
          unit_price: price,
          subtotal: item.quantity * price,
        };
      }),
    }));
  },

  removeFromInvoicePurchaseCart: (productId) => {
    set(state => ({
      invoicePurchaseCart: state.invoicePurchaseCart.filter(item => item.product_id !== productId),
    }));
  },

  clearInvoicePurchaseCart: () => set({ invoicePurchaseCart: [], invoiceSelectedSupplier: null }),

  // ============ INVOICE MODE - INVENTORY ============
  updateInvoiceInventoryStock: async (productId, stock) => {
    try {
      await invoiceInventoryApi.updateStock(productId, stock);
      set(state => {
        const existingIndex = state.invoiceInventory.findIndex(i => i.product_id === productId);
        if (existingIndex !== -1) {
          const updated = [...state.invoiceInventory];
          updated[existingIndex] = { ...updated[existingIndex], stock };
          return { invoiceInventory: updated };
        } else {
          return {
            invoiceInventory: [
              ...state.invoiceInventory,
              { id: Date.now(), product_id: productId, stock, created_at: new Date().toISOString() },
            ],
          };
        }
      });
      get().showNotification('Cập nhật tồn kho thành công!', 'success');
    } catch (error) {
      get().showNotification('Lỗi khi cập nhật tồn kho', 'error');
      throw error;
    }
  },

  getInvoiceProductStock: (productId) => {
    const inv = get().invoiceInventory.find(i => String(i.product_id) === String(productId));
    return inv ? inv.stock : 0;
  },

  // ============ INVOICE MODE - COMPUTED VALUES ============
  getInvoiceTotalDebt: () => {
    return get().invoiceOrders
      .filter(o => !o.paid)
      .reduce((sum, o) => sum + o.total, 0);
  },

  getInvoiceCustomerDebt: (customerId) => {
    return get().invoiceOrders
      .filter(o => (String(o.customer_id) === String(customerId) || String(o.customer?.id) === String(customerId)) && !o.paid)
      .reduce((sum, o) => sum + o.total, 0);
  },

  getInvoiceTodayRevenue: () => {
    const today = new Date().toDateString();
    return get().invoiceOrders
      .filter(o => new Date(o.created_at).toDateString() === today)
      .reduce((sum, o) => sum + o.total, 0);
  },

  getInvoiceTodayOrders: () => {
    const today = new Date().toDateString();
    return get().invoiceOrders.filter(o =>
      new Date(o.created_at).toDateString() === today
    );
  },

  getInvoiceOverdueOrders: () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return get().invoiceOrders.filter(o =>
      !o.paid && new Date(o.created_at) < thirtyDaysAgo
    );
  },

  getInvoiceCartTotal: () => {
    return get().invoiceCart.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getInvoicePurchaseCartTotal: () => {
    return get().invoicePurchaseCart.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getInvoiceTotalPurchaseDebt: () => {
    return get().invoicePurchases
      .filter(p => !p.paid)
      .reduce((sum, p) => sum + p.total, 0);
  },

  getInvoiceSupplierDebt: (supplierId) => {
    return get().invoicePurchases
      .filter(p => (String(p.supplier_id) === String(supplierId) || String(p.supplier?.id) === String(supplierId)) && !p.paid)
      .reduce((sum, p) => sum + p.total, 0);
  },

  // ============ DRAFT CART MANAGEMENT (REAL MODE) ============

  // Load drafts from localStorage
  loadDraftsFromStorage: () => {
    try {
      const draftsJson = localStorage.getItem('draftCarts');
      const activeIdJson = localStorage.getItem('activeDraftId');

      if (!draftsJson) {
        return { drafts: [], activeId: null };
      }

      const drafts = JSON.parse(draftsJson);
      const activeId = activeIdJson ? JSON.parse(activeIdJson) : null;

      // Clean up stale drafts (older than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const validDrafts = drafts.filter(draft => {
        const draftDate = new Date(draft.createdAt);
        return draftDate > sevenDaysAgo;
      });

      // Limit to max 10 drafts
      const limitedDrafts = validDrafts.slice(0, 10);

      // If active draft was removed, clear activeId
      const validActiveId = limitedDrafts.find(d => d.id === activeId) ? activeId : null;

      return { drafts: limitedDrafts, activeId: validActiveId };
    } catch {
      return { drafts: [], activeId: null };
    }
  },

  // Save drafts to localStorage
  saveDraftsToStorage: () => {
    try {
      const { draftCarts, activeDraftId } = get();
      localStorage.setItem('draftCarts', JSON.stringify(draftCarts));
      localStorage.setItem('activeDraftId', JSON.stringify(activeDraftId));
    } catch (error) {
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        get().showNotification('Bộ nhớ đầy. Vui lòng xóa bớt đơn nháp.', 'error');
      }
    }
  },

  // Create new draft cart
  createDraftCart: (customer) => {
    const { draftCarts, cart } = get();

    // Check if draft already exists for this customer
    const existingDraft = draftCarts.find(d => d.customerId === customer.id);
    if (existingDraft) {
      // Switch to existing draft instead
      get().switchDraftCart(existingDraft.id);
      get().showNotification(`Đã chuyển sang đơn của ${customer.short_name || customer.name}`, 'info');
      return existingDraft;
    }

    // Create new draft
    const newDraft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      customerId: customer.id,
      customer,
      items: [...cart], // Copy current cart items
      total: get().getCartTotal(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      draftCarts: [...state.draftCarts, newDraft],
      activeDraftId: newDraft.id,
      cart: newDraft.items,
      selectedCustomer: customer,
    }));

    get().saveDraftsToStorage();
    get().showNotification('Đã tạo đơn nháp mới', 'success');
    return newDraft;
  },

  // Start creating a new draft (clear current selection to allow new draft)
  startNewDraft: () => {
    const { activeDraftId } = get();

    // Save current draft before starting new one
    if (activeDraftId) {
      get().syncActiveDraft();
    }

    // Clear selection to show customer selector
    set({
      activeDraftId: null,
      cart: [],
      selectedCustomer: null,
    });

    get().saveDraftsToStorage();
  },

  // Switch to different draft cart
  switchDraftCart: (draftId) => {
    const { draftCarts, activeDraftId } = get();

    // Save current draft before switching
    if (activeDraftId) {
      get().syncActiveDraft();
    }

    const targetDraft = draftCarts.find(d => d.id === draftId);
    if (!targetDraft) {
      get().showNotification('Không tìm thấy đơn nháp', 'error');
      return;
    }

    set({
      activeDraftId: draftId,
      cart: [...targetDraft.items],
      selectedCustomer: targetDraft.customer,
    });

    get().saveDraftsToStorage();
    get().showNotification(`Đã chuyển sang ${targetDraft.customer.short_name || targetDraft.customer.name}`, 'success');
  },

  // Update active draft with current cart state
  syncActiveDraft: () => {
    const { activeDraftId, cart, selectedCustomer } = get();

    if (!activeDraftId) return;

    set(state => ({
      draftCarts: state.draftCarts.map(draft =>
        draft.id === activeDraftId
          ? {
              ...draft,
              items: [...cart],
              total: get().getCartTotal(),
              customer: selectedCustomer || draft.customer,
              updatedAt: new Date().toISOString(),
            }
          : draft
      ),
    }));

    get().saveDraftsToStorage();
  },

  // Delete draft cart (no confirmation - handle in UI layer)
  deleteDraftCart: (draftId) => {
    const { draftCarts, activeDraftId } = get();

    const draft = draftCarts.find(d => d.id === draftId);
    if (!draft) return;

    const newDraftCarts = draftCarts.filter(d => d.id !== draftId);

    // If deleting active draft, switch to another or clear
    if (activeDraftId === draftId) {
      const nextDraft = newDraftCarts[0];
      if (nextDraft) {
        set({
          draftCarts: newDraftCarts,
          activeDraftId: nextDraft.id,
          cart: [...nextDraft.items],
          selectedCustomer: nextDraft.customer,
        });
      } else {
        set({
          draftCarts: [],
          activeDraftId: null,
          cart: [],
          selectedCustomer: null,
        });
      }
    } else {
      set({ draftCarts: newDraftCarts });
    }

    get().saveDraftsToStorage();
    get().showNotification('Đã xóa đơn nháp', 'success');
  },

  // ============ INVOICE DRAFT CART MANAGEMENT ============

  // Load invoice drafts from localStorage
  loadInvoiceDraftsFromStorage: () => {
    try {
      const draftsJson = localStorage.getItem('invoiceDraftCarts');
      const activeIdJson = localStorage.getItem('activeInvoiceDraftId');

      if (!draftsJson) {
        return { drafts: [], activeId: null };
      }

      const drafts = JSON.parse(draftsJson);
      const activeId = activeIdJson ? JSON.parse(activeIdJson) : null;

      // Clean up stale drafts (older than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const validDrafts = drafts.filter(draft => {
        const draftDate = new Date(draft.createdAt);
        return draftDate > sevenDaysAgo;
      });

      // Limit to max 10 drafts
      const limitedDrafts = validDrafts.slice(0, 10);

      // If active draft was removed, clear activeId
      const validActiveId = limitedDrafts.find(d => d.id === activeId) ? activeId : null;

      return { drafts: limitedDrafts, activeId: validActiveId };
    } catch {
      return { drafts: [], activeId: null };
    }
  },

  // Save invoice drafts to localStorage
  saveInvoiceDraftsToStorage: () => {
    try {
      const { invoiceDraftCarts, activeInvoiceDraftId } = get();
      localStorage.setItem('invoiceDraftCarts', JSON.stringify(invoiceDraftCarts));
      localStorage.setItem('activeInvoiceDraftId', JSON.stringify(activeInvoiceDraftId));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        get().showNotification('Bộ nhớ đầy. Vui lòng xóa bớt đơn nháp.', 'error');
      }
    }
  },

  // Create new invoice draft cart
  createInvoiceDraftCart: (customer) => {
    const { invoiceDraftCarts, invoiceCart } = get();

    // Check if draft already exists for this customer
    const existingDraft = invoiceDraftCarts.find(d => d.customerId === customer.id);
    if (existingDraft) {
      get().switchInvoiceDraftCart(existingDraft.id);
      get().showNotification(`Đã chuyển sang đơn của ${customer.short_name || customer.name}`, 'info');
      return existingDraft;
    }

    const newDraft = {
      id: `invoice_draft_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      customerId: customer.id,
      customer,
      items: [...invoiceCart],
      total: get().getInvoiceCartTotal(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      invoiceDraftCarts: [...state.invoiceDraftCarts, newDraft],
      activeInvoiceDraftId: newDraft.id,
      invoiceCart: newDraft.items,
      invoiceSelectedCustomer: customer,
    }));

    get().saveInvoiceDraftsToStorage();
    get().showNotification('Đã tạo đơn nháp mới (Hóa đơn)', 'success');
    return newDraft;
  },

  // Switch to different invoice draft cart
  switchInvoiceDraftCart: (draftId) => {
    const { invoiceDraftCarts, activeInvoiceDraftId } = get();

    // Save current draft before switching
    if (activeInvoiceDraftId) {
      get().syncActiveInvoiceDraft();
    }

    const targetDraft = invoiceDraftCarts.find(d => d.id === draftId);
    if (!targetDraft) {
      get().showNotification('Không tìm thấy đơn nháp', 'error');
      return;
    }

    set({
      activeInvoiceDraftId: draftId,
      invoiceCart: [...targetDraft.items],
      invoiceSelectedCustomer: targetDraft.customer,
    });

    get().saveInvoiceDraftsToStorage();
    get().showNotification(`Đã chuyển sang ${targetDraft.customer.short_name || targetDraft.customer.name}`, 'success');
  },

  // Update active invoice draft with current cart state
  syncActiveInvoiceDraft: () => {
    const { activeInvoiceDraftId, invoiceCart, invoiceSelectedCustomer } = get();

    if (!activeInvoiceDraftId) return;

    set(state => ({
      invoiceDraftCarts: state.invoiceDraftCarts.map(draft =>
        draft.id === activeInvoiceDraftId
          ? {
              ...draft,
              items: [...invoiceCart],
              total: get().getInvoiceCartTotal(),
              customer: invoiceSelectedCustomer || draft.customer,
              updatedAt: new Date().toISOString(),
            }
          : draft
      ),
    }));

    get().saveInvoiceDraftsToStorage();
  },

  // Start creating a new invoice draft
  startNewInvoiceDraft: () => {
    const { activeInvoiceDraftId } = get();

    // Save current draft before starting new one
    if (activeInvoiceDraftId) {
      get().syncActiveInvoiceDraft();
    }

    // Clear selection to show customer selector
    set({
      activeInvoiceDraftId: null,
      invoiceCart: [],
      invoiceSelectedCustomer: null,
    });

    get().saveInvoiceDraftsToStorage();
  },

  // Delete invoice draft cart (no confirmation - handle in UI layer)
  deleteInvoiceDraftCart: (draftId) => {
    const { invoiceDraftCarts, activeInvoiceDraftId } = get();

    const draft = invoiceDraftCarts.find(d => d.id === draftId);
    if (!draft) return;

    const newDraftCarts = invoiceDraftCarts.filter(d => d.id !== draftId);

    if (activeInvoiceDraftId === draftId) {
      const nextDraft = newDraftCarts[0];
      if (nextDraft) {
        set({
          invoiceDraftCarts: newDraftCarts,
          activeInvoiceDraftId: nextDraft.id,
          invoiceCart: [...nextDraft.items],
          invoiceSelectedCustomer: nextDraft.customer,
        });
      } else {
        set({
          invoiceDraftCarts: [],
          activeInvoiceDraftId: null,
          invoiceCart: [],
          invoiceSelectedCustomer: null,
        });
      }
    } else {
      set({ invoiceDraftCarts: newDraftCarts });
    }

    get().saveInvoiceDraftsToStorage();
    get().showNotification('Đã xóa đơn nháp', 'success');
  },

  // ============ RETAIL CUSTOMER (KHÁCH LẺ) ============

  // Get or create retail customer
  getOrCreateRetailCustomer: async () => {
    const { customers } = get();

    // Find existing retail customer
    let retailCustomer = customers.find(c => c.short_name === RETAIL_CUSTOMER_NAME);

    if (!retailCustomer) {
      // Create new retail customer
      retailCustomer = await customerApi.create({
        short_name: RETAIL_CUSTOMER_NAME,
        full_name: 'Khách hàng lẻ',
        type: CUSTOMER_TYPES.INDIVIDUAL,
        phone: '',
        address: '',
      });

      set(state => ({
        customers: [...state.customers, retailCustomer],
      }));
    }

    return retailCustomer;
  },

  // Create quick retail order (Real mode)
  createQuickRetailOrder: async (items) => {
    if (items.length === 0) {
      get().showNotification('Vui lòng thêm sản phẩm', 'error');
      return null;
    }

    try {
      // Get retail customer
      const retailCustomer = await get().getOrCreateRetailCustomer();

      const order = {
        customer_id: retailCustomer.id,
        customer_name: retailCustomer.short_name,
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.quantity * item.unit_price,
          note: item.note || '',
        })),
        total: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
        paid: true,
        paid_at: new Date().toISOString(),
      };

      const newOrder = await orderApi.create(order);

      const fullOrder = {
        ...newOrder,
        customer: retailCustomer,
        order_items: order.items.map(item => ({
          ...item,
          product: get().products.find(p => String(p.id) === String(item.product_id)),
        })),
      };

      // Update stock
      const updatedProducts = get().products.map(product => {
        const orderItem = items.find(item => String(item.product_id) === String(product.id));
        if (orderItem) {
          return {
            ...product,
            stock: Math.max(0, product.stock - orderItem.quantity),
          };
        }
        return product;
      });

      // Update stock in database
      for (const item of items) {
        const product = updatedProducts.find(p => String(p.id) === String(item.product_id));
        if (product) {
          await productApi.update(item.product_id, { stock: product.stock });
        }
      }

      set(state => ({
        orders: [fullOrder, ...state.orders],
        products: updatedProducts,
      }));

      get().showNotification('Tạo đơn bán lẻ thành công!', 'success');
      return fullOrder;
    } catch (error) {
      get().showNotification('Lỗi khi tạo đơn bán lẻ', 'error');
      throw error;
    }
  },

  // Create quick retail order (Invoice mode)
  createQuickInvoiceRetailOrder: async (items) => {
    if (items.length === 0) {
      get().showNotification('Vui lòng thêm sản phẩm', 'error');
      return null;
    }

    try {
      const retailCustomer = await get().getOrCreateRetailCustomer();

      const order = {
        customer_id: retailCustomer.id,
        customer_name: retailCustomer.short_name,
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.quantity * item.unit_price,
          note: item.note || '',
        })),
        total: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
        paid: true,
        paid_at: new Date().toISOString(),
      };

      const newOrder = await invoiceOrderApi.create(order);

      const fullOrder = {
        ...newOrder,
        customer: retailCustomer,
        order_items: order.items.map(item => ({
          ...item,
          product: get().products.find(p => String(p.id) === String(item.product_id)),
        })),
      };

      // Update invoice inventory
      const updatedInventory = [...get().invoiceInventory];
      for (const item of items) {
        const invIndex = updatedInventory.findIndex(i => String(i.product_id) === String(item.product_id));
        if (invIndex !== -1) {
          updatedInventory[invIndex] = {
            ...updatedInventory[invIndex],
            stock: Math.max(0, updatedInventory[invIndex].stock - item.quantity),
          };
        }
      }

      set(state => ({
        invoiceOrders: [fullOrder, ...state.invoiceOrders],
        invoiceInventory: updatedInventory,
      }));

      get().showNotification('Tạo đơn bán lẻ thành công!', 'success');
      return fullOrder;
    } catch (error) {
      get().showNotification('Lỗi khi tạo đơn bán lẻ', 'error');
      throw error;
    }
  },

  // ============ INVENTORY REPORT ============

  // Get inventory report for a month (Real mode)
  getInventoryReport: (month) => {
    const { products, orders, purchases } = get();

    // Parse month (format: "YYYY-MM")
    const [year, monthNum] = month.split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Get retail customer ID
    const retailCustomer = get().customers.find(c => c.short_name === RETAIL_CUSTOMER_NAME);
    const retailCustomerId = retailCustomer ? String(retailCustomer.id) : null;

    return products.map(product => {
      const productId = String(product.id);

      // Calculate purchased quantity in month
      const purchased = purchases
        .filter(p => {
          const date = new Date(p.created_at);
          return date >= startOfMonth && date <= endOfMonth;
        })
        .reduce((sum, p) => {
          const items = p.purchase_items || p.items || [];
          const item = items.find(i => String(i.product_id) === productId);
          return sum + (item ? item.quantity : 0);
        }, 0);

      // Calculate sold quantity (excluding retail)
      const soldOrder = orders
        .filter(o => {
          const date = new Date(o.created_at);
          const customerId = String(o.customer_id || o.customer?.id);
          return date >= startOfMonth && date <= endOfMonth && customerId !== retailCustomerId;
        })
        .reduce((sum, o) => {
          const items = o.order_items || o.items || [];
          const item = items.find(i => String(i.product_id) === productId);
          return sum + (item ? item.quantity : 0);
        }, 0);

      // Calculate retail sold quantity
      const soldRetail = orders
        .filter(o => {
          const date = new Date(o.created_at);
          const customerId = String(o.customer_id || o.customer?.id);
          return date >= startOfMonth && date <= endOfMonth && customerId === retailCustomerId;
        })
        .reduce((sum, o) => {
          const items = o.order_items || o.items || [];
          const item = items.find(i => String(i.product_id) === productId);
          return sum + (item ? item.quantity : 0);
        }, 0);

      // Current stock (closing stock)
      const closingStock = product.stock;

      // Opening stock = Closing - Purchased + Sold
      const openingStock = closingStock - purchased + soldOrder + soldRetail;

      return {
        product,
        openingStock,
        purchased,
        soldOrder,
        soldRetail,
        closingStock,
      };
    });
  },

  // Get inventory report for a month (Invoice mode)
  getInvoiceInventoryReport: (month) => {
    const { products, invoiceOrders, invoicePurchases, invoiceInventory } = get();

    const [year, monthNum] = month.split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const retailCustomer = get().customers.find(c => c.short_name === RETAIL_CUSTOMER_NAME);
    const retailCustomerId = retailCustomer ? String(retailCustomer.id) : null;

    return products.map(product => {
      const productId = String(product.id);

      // Get current invoice stock
      const inv = invoiceInventory.find(i => String(i.product_id) === productId);
      const closingStock = inv ? inv.stock : 0;

      // Calculate purchased quantity in month
      const purchased = invoicePurchases
        .filter(p => {
          const date = new Date(p.created_at);
          return date >= startOfMonth && date <= endOfMonth;
        })
        .reduce((sum, p) => {
          const items = p.purchase_items || p.items || [];
          const item = items.find(i => String(i.product_id) === productId);
          return sum + (item ? item.quantity : 0);
        }, 0);

      // Calculate sold quantity (excluding retail)
      const soldOrder = invoiceOrders
        .filter(o => {
          const date = new Date(o.created_at);
          const customerId = String(o.customer_id || o.customer?.id);
          return date >= startOfMonth && date <= endOfMonth && customerId !== retailCustomerId;
        })
        .reduce((sum, o) => {
          const items = o.order_items || o.items || [];
          const item = items.find(i => String(i.product_id) === productId);
          return sum + (item ? item.quantity : 0);
        }, 0);

      // Calculate retail sold quantity
      const soldRetail = invoiceOrders
        .filter(o => {
          const date = new Date(o.created_at);
          const customerId = String(o.customer_id || o.customer?.id);
          return date >= startOfMonth && date <= endOfMonth && customerId === retailCustomerId;
        })
        .reduce((sum, o) => {
          const items = o.order_items || o.items || [];
          const item = items.find(i => String(i.product_id) === productId);
          return sum + (item ? item.quantity : 0);
        }, 0);

      const openingStock = closingStock - purchased + soldOrder + soldRetail;

      return {
        product,
        openingStock,
        purchased,
        soldOrder,
        soldRetail,
        closingStock,
      };
    });
  },

  // Get product movements for a month (Real mode)
  getProductMovements: (productId, month) => {
    const { orders, purchases, customers } = get();

    const [year, monthNum] = month.split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);
    const pid = String(productId);

    // Get sales
    const sales = orders
      .filter(o => {
        const date = new Date(o.created_at);
        if (date < startOfMonth || date > endOfMonth) return false;
        const items = o.order_items || o.items || [];
        return items.some(i => String(i.product_id) === pid);
      })
      .map(o => {
        const items = o.order_items || o.items || [];
        const item = items.find(i => String(i.product_id) === pid);
        const customer = customers.find(c => String(c.id) === String(o.customer_id)) || o.customer;
        return {
          date: o.created_at,
          type: 'sale',
          quantity: item.quantity,
          customerName: customer?.short_name || customer?.name || 'N/A',
          orderId: o.id,
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get purchases
    const purchasesList = purchases
      .filter(p => {
        const date = new Date(p.created_at);
        if (date < startOfMonth || date > endOfMonth) return false;
        const items = p.purchase_items || p.items || [];
        return items.some(i => String(i.product_id) === pid);
      })
      .map(p => {
        const items = p.purchase_items || p.items || [];
        const item = items.find(i => String(i.product_id) === pid);
        const supplier = customers.find(c => String(c.id) === String(p.supplier_id)) || p.supplier;
        return {
          date: p.created_at,
          type: 'purchase',
          quantity: item.quantity,
          supplierName: supplier?.short_name || supplier?.name || 'N/A',
          purchaseId: p.id,
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return { sales, purchases: purchasesList };
  },

  // Get product movements for a month (Invoice mode)
  getInvoiceProductMovements: (productId, month) => {
    const { invoiceOrders, invoicePurchases, customers } = get();

    const [year, monthNum] = month.split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);
    const pid = String(productId);

    const sales = invoiceOrders
      .filter(o => {
        const date = new Date(o.created_at);
        if (date < startOfMonth || date > endOfMonth) return false;
        const items = o.order_items || o.items || [];
        return items.some(i => String(i.product_id) === pid);
      })
      .map(o => {
        const items = o.order_items || o.items || [];
        const item = items.find(i => String(i.product_id) === pid);
        const customer = customers.find(c => String(c.id) === String(o.customer_id)) || o.customer;
        return {
          date: o.created_at,
          type: 'sale',
          quantity: item.quantity,
          customerName: customer?.short_name || customer?.name || 'N/A',
          orderId: o.id,
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const purchasesList = invoicePurchases
      .filter(p => {
        const date = new Date(p.created_at);
        if (date < startOfMonth || date > endOfMonth) return false;
        const items = p.purchase_items || p.items || [];
        return items.some(i => String(i.product_id) === pid);
      })
      .map(p => {
        const items = p.purchase_items || p.items || [];
        const item = items.find(i => String(i.product_id) === pid);
        const supplier = customers.find(c => String(c.id) === String(p.supplier_id)) || p.supplier;
        return {
          date: p.created_at,
          type: 'purchase',
          quantity: item.quantity,
          supplierName: supplier?.short_name || supplier?.name || 'N/A',
          purchaseId: p.id,
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return { sales, purchases: purchasesList };
  },

  // Get available months from orders and purchases
  getAvailableMonths: () => {
    const { orders, purchases } = get();
    const months = new Set();

    [...orders, ...purchases].forEach(item => {
      if (item.created_at) {
        const date = new Date(item.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }
    });

    // Add current month if not present
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    months.add(currentMonth);

    return Array.from(months).sort().reverse();
  },

  // Get available months for invoice mode
  getInvoiceAvailableMonths: () => {
    const { invoiceOrders, invoicePurchases } = get();
    const months = new Set();

    [...invoiceOrders, ...invoicePurchases].forEach(item => {
      if (item.created_at) {
        const date = new Date(item.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }
    });

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    months.add(currentMonth);

    return Array.from(months).sort().reverse();
  },
}));
