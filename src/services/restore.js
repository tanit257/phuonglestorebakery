import { supabase, isSupabaseConfigured } from './supabase';
import { validateBackup } from './backup';

const SAFETY_BACKUP_KEY = 'phuongle_safety_backup';
const SAFETY_BACKUP_EXPIRY_KEY = 'phuongle_safety_backup_expiry';
const SAFETY_BACKUP_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Create safety backup before restore (stored in sessionStorage)
 * This allows rollback if restore fails
 */
export const createSafetyBackup = async () => {
  const mode = isSupabaseConfigured() ? 'supabase' : 'localStorage';

  let data;
  if (mode === 'supabase') {
    data = await exportSupabaseDataForSafety();
  } else {
    data = exportLocalStorageDataForSafety();
  }

  const safetyBackup = {
    timestamp: new Date().toISOString(),
    mode,
    data,
  };

  // Store in sessionStorage (persists during browser session)
  sessionStorage.setItem(SAFETY_BACKUP_KEY, JSON.stringify(safetyBackup));

  // Set expiry time (1 hour from now)
  const expiryTime = Date.now() + SAFETY_BACKUP_DURATION;
  sessionStorage.setItem(SAFETY_BACKUP_EXPIRY_KEY, expiryTime.toString());

  return safetyBackup;
};

/**
 * Load safety backup from sessionStorage
 */
export const loadSafetyBackup = () => {
  const safetyBackup = sessionStorage.getItem(SAFETY_BACKUP_KEY);
  const expiryTime = sessionStorage.getItem(SAFETY_BACKUP_EXPIRY_KEY);

  if (!safetyBackup || !expiryTime) {
    return null;
  }

  // Check if expired
  if (Date.now() > parseInt(expiryTime)) {
    clearSafetyBackup();
    return null;
  }

  return JSON.parse(safetyBackup);
};

/**
 * Clear safety backup from sessionStorage
 */
export const clearSafetyBackup = () => {
  sessionStorage.removeItem(SAFETY_BACKUP_KEY);
  sessionStorage.removeItem(SAFETY_BACKUP_EXPIRY_KEY);
};

/**
 * Export Supabase data for safety backup
 */
const exportSupabaseDataForSafety = async () => {
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
      throw new Error(`Failed to export ${table} for safety backup: ${error.message}`);
    }

    data[table] = tableData;
  }

  return data;
};

/**
 * Export localStorage data for safety backup
 */
const exportLocalStorageDataForSafety = () => {
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
 * Clear all data from Supabase
 */
const clearSupabaseData = async () => {
  const tables = [
    // Delete in reverse order to respect foreign keys
    'order_items',
    'orders',
    'purchase_items',
    'purchases',
    'invoice_order_items',
    'invoice_orders',
    'invoice_purchase_items',
    'invoice_purchases',
    'invoice_inventory',
    'products',
    'customers',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', 0);

    if (error) {
      throw new Error(`Failed to clear ${table}: ${error.message}`);
    }
  }
};

/**
 * Clear all data from localStorage
 */
const clearLocalStorageData = () => {
  const keys = [
    'phuongle_products',
    'phuongle_customers',
    'phuongle_orders',
    'phuongle_purchases',
    'phuongle_invoice_orders',
    'phuongle_invoice_purchases',
    'phuongle_invoice_inventory',
  ];

  for (const key of keys) {
    localStorage.removeItem(key);
  }
};

/**
 * Restore data to Supabase
 */
const restoreSupabaseData = async (data) => {
  const tables = [
    // Insert in order to respect foreign keys
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

  const results = {};

  for (const table of tables) {
    const tableData = data[table];

    if (!tableData || tableData.length === 0) {
      results[table] = { inserted: 0 };
      continue;
    }

    const { data: insertedData, error } = await supabase
      .from(table)
      .insert(tableData)
      .select();

    if (error) {
      throw new Error(`Failed to restore ${table}: ${error.message}`);
    }

    results[table] = { inserted: insertedData.length };
  }

  return results;
};

/**
 * Restore data to localStorage
 */
const restoreLocalStorageData = (data) => {
  const keyMapping = {
    phuongle_products: 'phuongle_products',
    phuongle_customers: 'phuongle_customers',
    phuongle_orders: 'phuongle_orders',
    phuongle_purchases: 'phuongle_purchases',
    phuongle_invoice_orders: 'phuongle_invoice_orders',
    phuongle_invoice_purchases: 'phuongle_invoice_purchases',
    phuongle_invoice_inventory: 'phuongle_invoice_inventory',
  };

  const results = {};

  for (const [key, storageKey] of Object.entries(keyMapping)) {
    const keyData = data[key] || [];
    localStorage.setItem(storageKey, JSON.stringify(keyData));
    results[key] = { inserted: keyData.length };
  }

  return results;
};

/**
 * Verify restored data counts match backup
 */
const verifyRestoreResults = (backup, results) => {
  const mode = backup.mode;

  if (mode === 'supabase') {
    const tables = Object.keys(results);

    for (const table of tables) {
      const backupCount = backup.data[table]?.length || 0;
      const restoredCount = results[table]?.inserted || 0;

      if (backupCount !== restoredCount) {
        throw new Error(
          `Restore verification failed for ${table}: expected ${backupCount}, got ${restoredCount}`
        );
      }
    }
  } else {
    const keys = Object.keys(results);

    for (const key of keys) {
      const backupCount = backup.data[key]?.length || 0;
      const restoredCount = results[key]?.inserted || 0;

      if (backupCount !== restoredCount) {
        throw new Error(
          `Restore verification failed for ${key}: expected ${backupCount}, got ${restoredCount}`
        );
      }
    }
  }

  return true;
};

/**
 * Rollback to safety backup
 */
export const rollbackToSafetyBackup = async () => {
  const safetyBackup = loadSafetyBackup();

  if (!safetyBackup) {
    throw new Error('No safety backup found');
  }

  const mode = safetyBackup.mode;

  // Clear current data
  if (mode === 'supabase') {
    await clearSupabaseData();
  } else {
    clearLocalStorageData();
  }

  // Restore safety backup
  let results;
  if (mode === 'supabase') {
    results = await restoreSupabaseData(safetyBackup.data);
  } else {
    results = restoreLocalStorageData(safetyBackup.data);
  }

  // Clear safety backup after successful rollback
  clearSafetyBackup();

  return results;
};

/**
 * Main restore function
 * @param {Object} backup - Backup object to restore
 * @returns {Object} Restore results
 */
export const restoreBackup = async (backup) => {
  // STEP 1: Validate backup
  validateBackup(backup);

  const currentMode = isSupabaseConfigured() ? 'supabase' : 'localStorage';

  // Check mode compatibility
  if (backup.mode !== currentMode) {
    throw new Error(
      `Backup mode mismatch: backup is ${backup.mode}, current mode is ${currentMode}`
    );
  }

  // STEP 2: Create safety backup
  await createSafetyBackup();

  try {
    // STEP 3: Clear current data
    if (currentMode === 'supabase') {
      await clearSupabaseData();
    } else {
      clearLocalStorageData();
    }

    // STEP 4: Restore data
    let results;
    if (currentMode === 'supabase') {
      results = await restoreSupabaseData(backup.data);
    } else {
      results = restoreLocalStorageData(backup.data);
    }

    // STEP 5: Verify restoration
    verifyRestoreResults(backup, results);

    // STEP 6: Clear safety backup (restore successful)
    clearSafetyBackup();

    return {
      success: true,
      results,
      timestamp: new Date().toISOString(),
      backupTimestamp: backup.timestamp,
    };
  } catch (error) {
    // Restore failed - rollback to safety backup
    try {
      await rollbackToSafetyBackup();

      throw new Error(
        `Restore failed: ${error.message}. Rolled back to previous state.`
      );
    } catch (rollbackError) {
      throw new Error(
        `Restore failed AND rollback failed: ${error.message} | ${rollbackError.message}. CRITICAL: Data may be lost!`
      );
    }
  }
};

/**
 * Get restore preview (what will be restored)
 * @param {Object} backup - Backup object
 * @returns {Object} Preview information
 */
export const getRestorePreview = (backup) => {
  validateBackup(backup);

  const mode = backup.mode;
  const preview = {
    mode,
    timestamp: backup.timestamp,
    version: backup.version,
    metadata: backup.metadata,
    tables: {},
  };

  if (mode === 'supabase') {
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

    for (const table of tables) {
      preview.tables[table] = backup.data[table]?.length || 0;
    }
  } else {
    const keys = [
      'phuongle_products',
      'phuongle_customers',
      'phuongle_orders',
      'phuongle_purchases',
      'phuongle_invoice_orders',
      'phuongle_invoice_purchases',
      'phuongle_invoice_inventory',
    ];

    for (const key of keys) {
      preview.tables[key] = backup.data[key]?.length || 0;
    }
  }

  return preview;
};

/**
 * Check if safety backup exists and is valid
 */
export const hasSafetyBackup = () => {
  const safetyBackup = loadSafetyBackup();
  return safetyBackup !== null;
};
