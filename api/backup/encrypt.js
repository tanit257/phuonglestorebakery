/**
 * API Route: Encrypt backup data
 * Receives raw backup data and returns encrypted + compressed data
 * Encryption key is stored server-side only (not exposed to client)
 */

import crypto from 'crypto';
import pako from 'pako';
import { withRateLimit, RATE_LIMITS, composeMiddlewares } from '../_middleware/rateLimit.js';
import { withCSRF } from '../_middleware/csrf.js';

const MAX_PAYLOAD_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Encrypt data using AES-256-CBC
 */
const encryptData = (data, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
  };
};

/**
 * Validate encryption key format
 */
const isValidEncryptionKey = (key) => {
  return typeof key === 'string' && key.length === 32;
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
    const { backup } = req.body;

    // Validate backup data exists
    if (!backup || typeof backup !== 'object') {
      return res.status(400).json({ error: 'Backup data is required', success: false });
    }

    // Get encryption key from server environment (NOT exposed to client)
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;

    if (!isValidEncryptionKey(encryptionKey)) {
      return res.status(500).json({
        error: 'Server encryption key not configured properly',
        success: false,
      });
    }

    // Convert backup to JSON string
    const jsonString = JSON.stringify(backup);

    // Check payload size
    if (jsonString.length > MAX_PAYLOAD_SIZE) {
      return res.status(400).json({
        error: 'Backup data too large. Maximum size is 50MB',
        success: false,
      });
    }

    // Encrypt the data
    const { encrypted, iv } = encryptData(jsonString, encryptionKey);

    // Compress encrypted data
    const compressed = pako.gzip(encrypted);

    // Convert to base64 for transmission
    const base64Content = Buffer.from(compressed).toString('base64');

    // Generate filename with timestamp and IV
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    const fileName = `backup-${timestamp}-iv-${iv}.json.gz`;

    return res.status(200).json({
      success: true,
      fileName,
      fileContent: base64Content,
      iv,
      metadata: {
        ...backup.metadata,
        iv,
        encrypted: true,
        compressed: true,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: sanitizeError(error),
      success: false,
    });
  }
}

// Apply CSRF protection and upload rate limit (strict)
export default composeMiddlewares(
  withCSRF,
  (h) => withRateLimit(h, RATE_LIMITS.UPLOAD)
)(handler);
