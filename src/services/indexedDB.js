import { openDB } from 'idb';

const DB_NAME = 'phuongle_store_cache';
const DB_VERSION = 1;

const STORES = [
  'products',
  'customers',
  'orders',
  'purchases',
  'invoice_orders',
  'invoice_purchases',
  'invoice_inventory',
  'metadata',
];

let dbPromise = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: store === 'metadata' ? 'key' : 'id' });
          }
        }
      },
    });
  }
  return dbPromise;
};

export const idbCache = {
  async getAll(storeName) {
    try {
      const db = await getDB();
      return await db.getAll(storeName);
    } catch (err) {
      console.warn(`IndexedDB getAll(${storeName}) failed:`, err.message);
      return [];
    }
  },

  async putAll(storeName, items) {
    try {
      const db = await getDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.clear();
      for (const item of items) {
        if (item && item.id != null) {
          await store.put(item);
        }
      }
      await tx.done;
    } catch (err) {
      console.warn(`IndexedDB putAll(${storeName}) failed:`, err.message);
    }
  },

  async clear(storeName) {
    try {
      const db = await getDB();
      await db.clear(storeName);
    } catch (err) {
      console.warn(`IndexedDB clear(${storeName}) failed:`, err.message);
    }
  },

  async clearAll() {
    try {
      const db = await getDB();
      const tx = db.transaction(STORES, 'readwrite');
      for (const store of STORES) {
        tx.objectStore(store).clear();
      }
      await tx.done;
    } catch (err) {
      console.warn('IndexedDB clearAll failed:', err.message);
    }
  },

  async getMeta(key) {
    try {
      const db = await getDB();
      const result = await db.get('metadata', key);
      return result ? result.value : null;
    } catch {
      return null;
    }
  },

  async setMeta(key, value) {
    try {
      const db = await getDB();
      await db.put('metadata', { key, value });
    } catch (err) {
      console.warn(`IndexedDB setMeta(${key}) failed:`, err.message);
    }
  },

  async cacheAllData(data) {
    const entries = [
      ['products', data.products],
      ['customers', data.customers],
      ['orders', data.orders],
      ['purchases', data.purchases],
      ['invoice_orders', data.invoiceOrders],
      ['invoice_purchases', data.invoicePurchases],
      ['invoice_inventory', data.invoiceInventory],
    ];

    await Promise.all(
      entries
        .filter(([, items]) => Array.isArray(items))
        .map(([store, items]) => this.putAll(store, items))
    );

    await this.setMeta('lastCachedAt', new Date().toISOString());
  },

  async loadAllCached() {
    const [products, customers, orders, purchases, invoiceOrders, invoicePurchases, invoiceInventory] =
      await Promise.all([
        this.getAll('products'),
        this.getAll('customers'),
        this.getAll('orders'),
        this.getAll('purchases'),
        this.getAll('invoice_orders'),
        this.getAll('invoice_purchases'),
        this.getAll('invoice_inventory'),
      ]);

    return { products, customers, orders, purchases, invoiceOrders, invoicePurchases, invoiceInventory };
  },

  async hasCachedData() {
    const products = await this.getAll('products');
    return products.length > 0;
  },
};
