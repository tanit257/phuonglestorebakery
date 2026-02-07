/**
 * API Route: Decrypt backup data
 * Receives encrypted backup data and returns decrypted backup object
 * Encryption key is stored server-side only (not exposed to client)
 */

import crypto from 'crypto';
import pako from 'pako';
import { withRateLimit, RATE_LIMITS, composeMiddlewares } from '../_middleware/rateLimit.js';
import { withCSRF } from '../_middleware/csrf.js';

const MAX_PAYLOAD_SIZE = 100 * 1024 * 1024; // 100MB (base64 is larger)

/**
 * Decrypt data using AES-256-CBC
 */
const decryptData = (encryptedData, iv, key) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key),
    Buffer.from(iv, 'hex')
  );

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Validate encryption key format
 */
const isValidEncryptionKey = (key) => {
  return typeof key === 'string' && key.length === 32;
};

/**
 * Validate IV format (32 hex characters = 16 bytes)
 */
const isValidIV = (iv) => {
  return typeof iv === 'string' && /^[a-fA-F0-9]{32}$/.test(iv);
};

/**
 * Sanitize error message
 */
const sanitizeError = (error) => {
  const message = error?.message || 'An error occurred';
  return message
    .replace(/\/[^\s]+\.(js|ts|json)/g, '[file]')
    .replace(/at\s+.+\(.+\)/g, '')
    .substring(0, 200);
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }

  try {
    const { fileContent, iv } = req.body;

    // Validate inputs
    if (!fileContent || typeof fileContent !== 'string') {
      return res.status(400).json({
        error: 'File content is required',
        success: false,
      });
    }

    if (!isValidIV(iv)) {
      return res.status(400).json({
        error: 'Invalid IV format',
        success: false,
      });
    }

    // Check payload size
    if (fileContent.length > MAX_PAYLOAD_SIZE) {
      return res.status(400).json({
        error: 'File content too large',
        success: false,
      });
    }

    // Get encryption key from server environment
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;

    if (!isValidEncryptionKey(encryptionKey)) {
      return res.status(500).json({
        error: 'Server encryption key not configured properly',
        success: false,
      });
    }

    // Decode base64 to buffer
    const compressedBuffer = Buffer.from(fileContent, 'base64');

    // Decompress
    const decompressed = pako.ungzip(compressedBuffer, { to: 'string' });

    // Decrypt
    const decrypted = decryptData(decompressed, iv, encryptionKey);

    // Parse JSON
    const backup = JSON.parse(decrypted);

    // Validate backup structure
    if (!backup.version || !backup.timestamp || !backup.data) {
      return res.status(400).json({
        error: 'Invalid backup structure',
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      backup,
    });
  } catch (error) {
    // Handle decryption errors gracefully
    if (error.message?.includes('bad decrypt') || error.message?.includes('wrong final block')) {
      return res.status(400).json({
        error: 'Failed to decrypt backup. The encryption key may have changed.',
        success: false,
      });
    }

    return res.status(500).json({
      error: sanitizeError(error),
      success: false,
    });
  }
}

// Apply CSRF protection and data rate limit
export default composeMiddlewares(
  withCSRF,
  (h) => withRateLimit(h, RATE_LIMITS.DATA)
)(handler);
