/**
 * Consolidated API Route: Backup encrypt/decrypt
 * Dynamic route handles: /api/backup/encrypt, /api/backup/decrypt
 */

import crypto from 'crypto';
import pako from 'pako';
import { withRateLimit, RATE_LIMITS, composeMiddlewares } from '../_middleware/rateLimit.js';
import { withCSRF } from '../_middleware/csrf.js';

const MAX_ENCRYPT_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DECRYPT_SIZE = 100 * 1024 * 1024; // 100MB (base64 is larger)

const isValidEncryptionKey = (key) => typeof key === 'string' && key.length === 32;
const isValidIV = (iv) => typeof iv === 'string' && /^[a-fA-F0-9]{32}$/.test(iv);

const sanitizeError = (error) => {
  const message = error?.message || 'An error occurred';
  return message
    .replace(/\/[^\s]+\.(js|ts|json)/g, '[file]')
    .replace(/at\s+.+\(.+\)/g, '')
    .substring(0, 200);
};

// ============================================
// ENCRYPT HANDLER
// ============================================

async function encryptHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }

  try {
    const { backup } = req.body;

    if (!backup || typeof backup !== 'object') {
      return res.status(400).json({ error: 'Backup data is required', success: false });
    }

    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
    if (!isValidEncryptionKey(encryptionKey)) {
      return res.status(500).json({ error: 'Server encryption key not configured properly', success: false });
    }

    const jsonString = JSON.stringify(backup);
    if (jsonString.length > MAX_ENCRYPT_SIZE) {
      return res.status(400).json({ error: 'Backup data too large. Maximum size is 50MB', success: false });
    }

    // Encrypt with AES-256-CBC
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const ivHex = iv.toString('hex');

    // Compress and encode
    const compressed = pako.gzip(encrypted);
    const base64Content = Buffer.from(compressed).toString('base64');

    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const fileName = `backup-${timestamp}-iv-${ivHex}.json.gz`;

    return res.status(200).json({
      success: true,
      fileName,
      fileContent: base64Content,
      iv: ivHex,
      metadata: { ...backup.metadata, iv: ivHex, encrypted: true, compressed: true },
    });
  } catch (error) {
    return res.status(500).json({ error: sanitizeError(error), success: false });
  }
}

// ============================================
// DECRYPT HANDLER
// ============================================

async function decryptHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', success: false });
  }

  try {
    const { fileContent, iv } = req.body;

    if (!fileContent || typeof fileContent !== 'string') {
      return res.status(400).json({ error: 'File content is required', success: false });
    }
    if (!isValidIV(iv)) {
      return res.status(400).json({ error: 'Invalid IV format', success: false });
    }
    if (fileContent.length > MAX_DECRYPT_SIZE) {
      return res.status(400).json({ error: 'File content too large', success: false });
    }

    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
    if (!isValidEncryptionKey(encryptionKey)) {
      return res.status(500).json({ error: 'Server encryption key not configured properly', success: false });
    }

    // Decompress and decrypt
    const compressedBuffer = Buffer.from(fileContent, 'base64');
    const decompressed = pako.ungzip(compressedBuffer, { to: 'string' });

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(decompressed, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const backup = JSON.parse(decrypted);

    if (!backup.version || !backup.timestamp || !backup.data) {
      return res.status(400).json({ error: 'Invalid backup structure', success: false });
    }

    return res.status(200).json({ success: true, backup });
  } catch (error) {
    if (error.message?.includes('bad decrypt') || error.message?.includes('wrong final block')) {
      return res.status(400).json({ error: 'Failed to decrypt backup. The encryption key may have changed.', success: false });
    }
    return res.status(500).json({ error: sanitizeError(error), success: false });
  }
}

// ============================================
// ROUTE MAP (pre-composed with middleware)
// ============================================

const routes = {
  encrypt: composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.UPLOAD))(encryptHandler),
  decrypt: composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.DATA))(decryptHandler),
};

export default function handler(req, res) {
  const { action } = req.query;
  const route = routes[action];

  if (!route) {
    return res.status(404).json({ error: 'Not found', success: false });
  }

  return route(req, res);
}
