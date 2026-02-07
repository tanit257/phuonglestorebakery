import { supabase, isSupabaseConfigured } from './supabase';
import { securePost } from '../utils/secureFetch';

const BACKUP_VERSION = '1.0';

/**
 * Export all data from Supabase
 * @returns {Object} All database tables data
 */
const exportSupabaseData = async () => {
  const tables = [
    'products',
    'customers',
    'orders',
    'order_items',
    'purchases',
    'purchase_items',
    'invoice_orders',
    'invoice_order_items',
    'invoice_purchases',
    'invoice_purchase_items',
    'invoice_inventory',
  ];

  const data = {};

  for (const table of tables) {
    const { data: tableData, error } = await supabase.from(table).select('*');

    if (error) {
      throw new Error(`Failed to export ${table}: ${error.message}`);
    }

    data[table] = tableData;
  }

  return data;
};

/**
 * Export all data from localStorage
 * @returns {Object} All localStorage data
 */
const exportLocalStorageData = () => {
  const keys = [
    'phuongle_products',
    'phuongle_customers',
    'phuongle_orders',
    'phuongle_purchases',
    'phuongle_invoice_orders',
    'phuongle_invoice_purchases',
    'phuongle_invoice_inventory',
  ];

  const data = {};

  for (const key of keys) {
    const value = localStorage.getItem(key);
    data[key] = value ? JSON.parse(value) : [];
  }

  return data;
};

/**
 * Calculate metadata statistics
 * @param {Object} data - Backup data
 * @returns {Object} Metadata statistics
 */
const calculateMetadata = (data) => {
  if (isSupabaseConfigured()) {
    return {
      total_products: data.products?.length || 0,
      total_customers: data.customers?.length || 0,
      total_orders: data.orders?.length || 0,
      total_order_items: data.order_items?.length || 0,
      total_purchases: data.purchases?.length || 0,
      total_purchase_items: data.purchase_items?.length || 0,
      total_invoice_orders: data.invoice_orders?.length || 0,
      total_invoice_order_items: data.invoice_order_items?.length || 0,
      total_invoice_purchases: data.invoice_purchases?.length || 0,
      total_invoice_purchase_items: data.invoice_purchase_items?.length || 0,
      total_invoice_inventory: data.invoice_inventory?.length || 0,
    };
  }

  return {
    total_products: data.phuongle_products?.length || 0,
    total_customers: data.phuongle_customers?.length || 0,
    total_orders: data.phuongle_orders?.length || 0,
    total_purchases: data.phuongle_purchases?.length || 0,
    total_invoice_orders: data.phuongle_invoice_orders?.length || 0,
    total_invoice_purchases: data.phuongle_invoice_purchases?.length || 0,
    total_invoice_inventory: data.phuongle_invoice_inventory?.length || 0,
  };
};

/**
 * Create backup of all database data
 * @returns {Object} Backup data structure
 */
export const createBackup = async () => {
  const mode = isSupabaseConfigured() ? 'supabase' : 'localStorage';

  let data;
  if (mode === 'supabase') {
    data = await exportSupabaseData();
  } else {
    data = exportLocalStorageData();
  }

  const metadata = calculateMetadata(data);

  const backup = {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    mode,
    metadata: {
      ...metadata,
      app_version: '1.0.0',
    },
    data,
  };

  return backup;
};

/**
 * Prepare backup for upload (encrypt + compress via server API)
 * Encryption is done server-side to keep the key secure
 * @param {Object} backup - Backup object
 * @returns {Promise<Object>} { fileName, fileContent, metadata, iv }
 */
export const prepareBackupForUpload = async (backup) => {
  const response = await securePost('/api/backup/encrypt', { backup });
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to encrypt backup');
  }

  return {
    fileName: result.fileName,
    fileContent: result.fileContent,
    metadata: result.metadata,
    iv: result.iv,
  };
};

/**
 * Decrypt backup file via server API
 * Decryption is done server-side to keep the key secure
 * @param {string} fileContent - Base64 encoded encrypted backup
 * @param {string} iv - Initialization vector
 * @returns {Promise<Object>} Decrypted backup object
 */
export const decryptBackupFile = async (fileContent, iv) => {
  const response = await securePost('/api/backup/decrypt', { fileContent, iv });
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to decrypt backup');
  }

  return result.backup;
};

/**
 * Validate backup structure
 * @param {Object} backup - Backup object
 * @throws {Error} If backup is invalid
 */
export const validateBackup = (backup) => {
  if (!backup.version) {
    throw new Error('Invalid backup: missing version');
  }

  if (!backup.timestamp) {
    throw new Error('Invalid backup: missing timestamp');
  }

  if (!backup.mode) {
    throw new Error('Invalid backup: missing mode');
  }

  if (!backup.data) {
    throw new Error('Invalid backup: missing data');
  }

  // Check version compatibility
  if (backup.version !== BACKUP_VERSION) {
    throw new Error(
      `Incompatible backup version: ${backup.version} (expected ${BACKUP_VERSION})`
    );
  }

  return true;
};

/**
 * Format file size to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Parse backup filename to extract date
 * @param {string} fileName - Backup filename
 * @returns {Date} Backup date
 */
export const parseBackupDate = (fileName) => {
  // Format: backup-2026-01-31T15-30-00.json.gz
  const match = fileName.match(/backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);

  if (!match) return null;

  const dateString = match[1].replace(/-/g, ':');
  return new Date(dateString);
};

/**
 * Get backup statistics
 * @param {Array} backups - List of backup files
 * @returns {Object} Statistics
 */
export const getBackupStats = (backups) => {
  if (!backups || backups.length === 0) {
    return {
      total: 0,
      oldest: null,
      newest: null,
      totalSize: 0,
    };
  }

  const dates = backups
    .map(b => new Date(b.createdTime))
    .filter(d => !isNaN(d.getTime()));

  const totalSize = backups.reduce((sum, b) => sum + parseInt(b.size || 0), 0);

  return {
    total: backups.length,
    oldest: dates.length > 0 ? new Date(Math.min(...dates)) : null,
    newest: dates.length > 0 ? new Date(Math.max(...dates)) : null,
    totalSize,
  };
};
