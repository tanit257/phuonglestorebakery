/**
 * Shared utilities for Google Drive API routes
 */

import { parse } from 'cookie';
import { google } from 'googleapis';
import crypto from 'crypto';

const COOKIE_NAME = 'gdrive_session';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

// ============================================
// ENCRYPTION UTILITIES
// ============================================

/**
 * Get cookie encryption key from environment
 * Uses BACKUP_ENCRYPTION_KEY for simplicity (same 32-char key)
 */
const getCookieEncryptionKey = () => {
  const key = process.env.BACKUP_ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    return null;
  }
  return key;
};

/**
 * Encrypt data using AES-256-GCM
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data as base64 (iv:authTag:encrypted)
 */
export const encryptToken = (data) => {
  const key = getCookieEncryptionKey();
  if (!key) {
    throw new Error('Encryption key not configured');
  }

  const iv = crypto.randomBytes(12); // GCM recommends 12 bytes
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(key), iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:authTag:encrypted (all hex)
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Encrypted data (iv:authTag:encrypted)
 * @returns {string} Decrypted data
 */
export const decryptToken = (encryptedData) => {
  const key = getCookieEncryptionKey();
  if (!key) {
    throw new Error('Encryption key not configured');
  }

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, authTagHex, encrypted] = parts;

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(key), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

// ============================================
// INPUT VALIDATION UTILITIES
// ============================================

/**
 * Validate that a value is a non-empty string
 */
export const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validate Google Drive file ID format
 * File IDs are alphanumeric with hyphens and underscores, typically 28-44 chars
 */
export const isValidFileId = (fileId) => {
  if (!isNonEmptyString(fileId)) return false;
  // Google Drive file IDs: alphanumeric, hyphens, underscores
  return /^[a-zA-Z0-9_-]{10,100}$/.test(fileId);
};

/**
 * Validate backup file name format
 * Expected: backup-YYYY-MM-DD-HH-mm-ss-iv-HEXSTRING.json.gz
 */
export const isValidBackupFileName = (fileName) => {
  if (!isNonEmptyString(fileName)) return false;
  // Backup file pattern
  return /^backup-\d{4}-\d{2}-\d{2}.*\.json\.gz$/.test(fileName);
};

/**
 * Validate base64 encoded string
 */
export const isValidBase64 = (str) => {
  if (!isNonEmptyString(str)) return false;
  try {
    // Check if it's valid base64
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
};

/**
 * Validate OAuth authorization code
 * Google OAuth codes are URL-safe base64 strings
 */
export const isValidAuthCode = (code) => {
  if (!isNonEmptyString(code)) return false;
  // OAuth codes are typically 50-200 characters, URL-safe
  return /^[a-zA-Z0-9_\-/+=]{20,500}$/.test(code);
};

/**
 * Sanitize error message for client response
 * Removes sensitive information like file paths, stack traces
 */
export const sanitizeErrorMessage = (error) => {
  const message = error?.message || 'An error occurred';

  // Remove file paths
  const sanitized = message
    .replace(/\/[^\s]+\.(js|ts|json)/g, '[file]')
    .replace(/at\s+.+\(.+\)/g, '')
    .replace(/\n\s*at\s+.+/g, '');

  // Limit length
  return sanitized.substring(0, 200);
};

/**
 * Create standardized error response
 */
export const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    error: message,
    success: false,
  });
};

/**
 * Extract and decrypt tokens from httpOnly cookie
 * @param {Object} req - Request object
 * @returns {Object|null} Tokens object or null if not found
 */
export const getTokensFromCookie = (req) => {
  try {
    const cookies = parse(req.headers.cookie || '');
    const encryptedTokens = cookies[COOKIE_NAME];

    if (!encryptedTokens) {
      return null;
    }

    // Decrypt the token data
    const decrypted = decryptToken(encryptedTokens);
    const tokenData = JSON.parse(decrypted);
    return tokenData;
  } catch {
    return null;
  }
};

/**
 * Create authenticated Google Drive client from cookie tokens
 * @param {Object} req - Request object
 * @returns {Object} { drive, error }
 */
export const createDriveClient = (req) => {
  const tokens = getTokensFromCookie(req);

  if (!tokens) {
    return { drive: null, error: 'Not authenticated. Please connect to Google Drive first.' };
  }

  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return { drive: null, error: 'Missing Google OAuth credentials' };
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials(tokens);

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  return { drive, error: null };
};

/**
 * Get or create backup folder in Google Drive
 * @param {Object} drive - Google Drive client
 * @param {string} folderName - Folder name
 * @returns {string} Folder ID
 */
export const getOrCreateBackupFolder = async (drive, folderName = 'PhuongLeStore-Backups') => {
  const searchResponse = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    return searchResponse.data.files[0].id;
  }

  const createResponse = await drive.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  return createResponse.data.id;
};
