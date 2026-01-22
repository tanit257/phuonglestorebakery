import { create } from 'zustand';
import { productApi, customerApi, orderApi, purchaseApi, invoiceOrderApi, invoicePurchaseApi, invoiceInventoryApi, seedData } from '../services/api';
import { SAMPLE_PRODUCTS, SAMPLE_CUSTOMERS, OVERDUE_DAYS } from '../utils/constants';

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

  // Cart state (keeping for backward compatibility)
  cart: [],
  selectedCustomer: null,

  // Purchase cart state
  purchaseCart: [],
  selectedSupplier: null,

  // Multi-cart state for handling multiple orders simultaneously
  carts: [], // Array of {id, customer, items, createdAt}
  activeCartId: null, // Currently active cart ID

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
  
  // ============ INITIALIZATION ============
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Seed initial data if needed
      await seedData(SAMPLE_PRODUCTS, SAMPLE_CUSTOMERS);

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

      // If no orders exist, load sample seed data
      if (orders.length === 0) {
        const { generateSeedData } = await import('../utils/seedData');
        const seedDataResult = generateSeedData();

        customers = seedDataResult.customers;
        products = seedDataResult.products;
        orders = seedDataResult.orders;
        invoiceOrders = seedDataResult.invoiceOrders || [];
        invoiceInventory = seedDataResult.invoiceInventory || [];

        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('customers', JSON.stringify(customers));
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('invoiceOrders', JSON.stringify(invoiceOrders));
        localStorage.setItem('invoiceInventory', JSON.stringify(invoiceInventory));
      }

      set({
        products,
        customers,
        orders,
        purchases,
        invoiceOrders,
        invoicePurchases,
        invoiceInventory,
        isLoading: false,
      });
    } catch (error) {
      console.error('Initialize error:', error);
      set({ error: error.message, isLoading: false });
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
          console.warn('Product already exists in state! Skipping duplicate.');
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
      console.log('useStore.addCustomer called with:', customer);
      const newCustomer = await customerApi.create(customer);
      console.log('customerApi.create returned:', newCustomer);

      set(state => {
        console.log('Current customers count:', state.customers.length);
        console.log('Current customers IDs:', state.customers.map(c => c.id));

        // Check if customer already exists in state (prevent duplicate)
        const exists = state.customers.some(c => c.id === newCustomer.id);
        if (exists) {
          console.warn('Customer already exists in state! Skipping duplicate.');
          return state; // Return unchanged state
        }

        console.log('Adding new customer with ID:', newCustomer.id);
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
  
  // ============ ORDERS ============
  createOrder: async () => {
    // Prevent duplicate orders from double-clicking
    if (get().isCreatingOrder) {
      console.log('Order creation already in progress');
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
      const order = {
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.subtotal, 0),
      };
      
      const newOrder = await orderApi.create(order);
      
      // Add full order data for local display
      const fullOrder = {
        ...newOrder,
        customer: selectedCustomer,
        order_items: cart.map(item => ({
          ...item,
          product: get().products.find(p => p.id === item.product_id),
        })),
      };
      
      set(state => ({
        orders: [fullOrder, ...state.orders],
        cart: [],
        selectedCustomer: null,
      }));
      
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
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  
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
            subtotal: quantity * product.price,
            product,
          },
        ],
      };
    });
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
  },
  
  removeFromCart: (productId) => {
    set(state => ({
      cart: state.cart.filter(item => item.product_id !== productId),
    }));
  },
  
  clearCart: () => set({ cart: [], selectedCustomer: null }),

  // ============ PURCHASES ============
  createPurchase: async () => {
    // Prevent duplicate purchases from double-clicking
    if (get().isCreatingPurchase) {
      console.log('Purchase creation already in progress');
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
        supplier_name: selectedSupplier.name,
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
      console.log('Invoice order creation already in progress');
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
      const order = {
        customer_id: invoiceSelectedCustomer.id,
        customer_name: invoiceSelectedCustomer.name,
        items: invoiceCart,
        total: invoiceCart.reduce((sum, item) => sum + item.subtotal, 0),
      };

      const newOrder = await invoiceOrderApi.create(order);

      const fullOrder = {
        ...newOrder,
        customer: invoiceSelectedCustomer,
        order_items: invoiceCart.map(item => ({
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

      set(state => ({
        invoiceOrders: [fullOrder, ...state.invoiceOrders],
        invoiceInventory: updatedInventory,
        invoiceCart: [],
        invoiceSelectedCustomer: null,
      }));

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
  setInvoiceSelectedCustomer: (customer) => set({ invoiceSelectedCustomer: customer }),

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
            subtotal: quantity * invoicePrice,
            product,
          },
        ],
      };
    });
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
  },

  removeFromInvoiceCart: (productId) => {
    set(state => ({
      invoiceCart: state.invoiceCart.filter(item => item.product_id !== productId),
    }));
  },

  clearInvoiceCart: () => set({ invoiceCart: [], invoiceSelectedCustomer: null }),

  // ============ INVOICE MODE - PURCHASES ============
  createInvoicePurchase: async () => {
    if (get().isCreatingInvoicePurchase) {
      console.log('Invoice purchase creation already in progress');
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
        supplier_name: invoiceSelectedSupplier.name,
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
}));
