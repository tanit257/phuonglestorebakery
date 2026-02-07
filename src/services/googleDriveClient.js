/**
 * Google Drive Client Service (Browser-side)
 * Uses httpOnly cookies for secure token storage
 * Tokens are managed server-side, not accessible to JavaScript
 */

import { securePost, secureGet } from '../utils/secureFetch';

const API_BASE = '/api/google-drive';

/**
 * Get authorization URL for user to grant access
 */
export const getAuthUrl = async () => {
  try {
    const response = await secureGet(`${API_BASE}/auth-url`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get auth URL');
    }

    return data.authUrl;
  } catch (error) {
    throw new Error(`Failed to get auth URL: ${error.message}`);
  }
};

/**
 * Exchange authorization code for tokens (stored in httpOnly cookie by server)
 */
export const authenticateWithCode = async (code) => {
  try {
    const response = await securePost(`${API_BASE}/auth-callback`, { code });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to authenticate');
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to authenticate: ${error.message}`);
  }
};

/**
 * Check if user is authenticated (server checks cookie)
 */
export const checkAuthStatus = async () => {
  try {
    const response = await secureGet(`${API_BASE}/auth-status`);
    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    return false;
  }
};

/**
 * Logout (server clears cookie)
 */
export const logout = async () => {
  try {
    const response = await securePost(`${API_BASE}/auth-logout`, {});
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to logout');
    }

    return data.success;
  } catch (error) {
    throw new Error(`Failed to logout: ${error.message}`);
  }
};

/**
 * List all backup files from Google Drive
 * @returns {Array} Array of backup files sorted by creation date (newest first)
 */
export const listBackupsFromDrive = async () => {
  try {
    const response = await securePost(`${API_BASE}/list-backups`, {});
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to list backups');
    }

    return data.files;
  } catch (error) {
    throw new Error(`Failed to list backups: ${error.message}`);
  }
};

/**
 * Upload backup file to Google Drive
 * @param {string} fileName - Name of the backup file
 * @param {Uint8Array} fileContent - Encrypted and compressed backup data
 * @returns {Object} File metadata { id, name, size, createdTime }
 */
export const uploadBackupToDrive = async (fileName, fileContent) => {
  try {
    // fileContent is already base64 string from prepareBackupForUpload
    const response = await securePost(`${API_BASE}/upload-backup`, {
      fileName,
      fileContent,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload backup');
    }

    return data.file;
  } catch (error) {
    throw new Error(`Failed to upload backup: ${error.message}`);
  }
};

/**
 * Download backup file from Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {Uint8Array} File content
 */
export const downloadBackupFromDrive = async (fileId) => {
  try {
    const response = await securePost(`${API_BASE}/download-backup`, { fileId });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to download backup');
    }

    // Return base64 string (used by decrypt API and file download)
    return data.fileContent;
  } catch (error) {
    throw new Error(`Failed to download backup: ${error.message}`);
  }
};

/**
 * Delete backup file from Google Drive
 * @param {string} fileId - Google Drive file ID
 */
export const deleteBackupFromDrive = async (fileId) => {
  try {
    const response = await securePost(`${API_BASE}/delete-backup`, { fileId });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete backup');
    }

    return data.success;
  } catch (error) {
    throw new Error(`Failed to delete backup: ${error.message}`);
  }
};

/**
 * Get Google Drive storage usage
 * @returns {Object} Storage info { used, total, available }
 */
export const getStorageInfo = async () => {
  try {
    const response = await securePost(`${API_BASE}/storage-info`, {});
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get storage info');
    }

    return data.storageInfo;
  } catch (error) {
    throw new Error(`Failed to get storage info: ${error.message}`);
  }
};
