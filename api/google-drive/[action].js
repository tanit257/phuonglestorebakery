/**
 * Consolidated API Route: Google Drive operations
 * Dynamic route handles all /api/google-drive/* endpoints
 */

import { google } from 'googleapis';
import { Readable } from 'stream';
import { parse, serialize } from 'cookie';
import {
  encryptToken,
  decryptToken,
  isValidAuthCode,
  isValidFileId,
  isValidBackupFileName,
  isNonEmptyString,
  errorResponse,
  sanitizeErrorMessage,
  createDriveClient,
  getOrCreateBackupFolder,
} from './_utils.js';
import { withRateLimit, RATE_LIMITS, composeMiddlewares } from '../_middleware/rateLimit.js';
import { withCSRF } from '../_middleware/csrf.js';

const COOKIE_NAME = 'gdrive_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1.37; // ~68MB base64

// ============================================
// AUTH HANDLERS
// ============================================

async function handleAuthUrl(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth credentials');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata',
      ],
      prompt: 'consent',
    });

    return res.status(200).json({ authUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function handleGetTokens(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth credentials');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    return res.status(200).json({ tokens });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function handleAuthCallback(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { code } = req.body;
    if (!isValidAuthCode(code)) {
      return errorResponse(res, 400, 'Invalid authorization code');
    }

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return errorResponse(res, 500, 'Server configuration error');
    }

    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
    if (!encryptionKey || encryptionKey.length !== 32) {
      return errorResponse(res, 500, 'Server encryption not configured');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });
    const encryptedTokens = encryptToken(tokenData);

    const cookie = serialize(COOKIE_NAME, encryptedTokens, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true, message: 'Authentication successful' });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

async function handleAuthStatus(req, res) {
  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const cookies = parse(req.headers.cookie || '');
    const encryptedTokens = cookies[COOKIE_NAME];

    if (!encryptedTokens) {
      return res.status(200).json({ authenticated: false, success: true });
    }

    const decrypted = decryptToken(encryptedTokens);
    const tokenData = JSON.parse(decrypted);
    const isValid = tokenData.access_token && tokenData.refresh_token;
    const isExpired = tokenData.expiry_date && Date.now() > tokenData.expiry_date - 5 * 60 * 1000;

    return res.status(200).json({ authenticated: isValid, needsRefresh: isExpired, success: true });
  } catch {
    return res.status(200).json({ authenticated: false, success: true });
  }
}

async function handleAuthLogout(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const cookie = serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

// ============================================
// DRIVE OPERATION HANDLERS
// ============================================

async function handleUploadBackup(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { fileName, fileContent } = req.body;

    if (!isValidBackupFileName(fileName)) {
      return errorResponse(res, 400, 'Invalid file name format. Expected: backup-YYYY-MM-DD-*.json.gz');
    }
    if (!isNonEmptyString(fileContent)) {
      return errorResponse(res, 400, 'File content is required');
    }
    if (fileContent.length > MAX_FILE_SIZE) {
      return errorResponse(res, 400, 'File too large. Maximum size is 50MB');
    }

    const { drive, error } = createDriveClient(req);
    if (error) return errorResponse(res, 401, error);

    const folderId = await getOrCreateBackupFolder(drive);
    const buffer = Buffer.from(fileContent, 'base64');

    const response = await drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType: 'application/gzip', body: Readable.from(buffer) },
      fields: 'id, name, size, createdTime',
    });

    return res.status(200).json({ file: response.data, success: true });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

async function handleDownloadBackup(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { fileId } = req.body;
    if (!isValidFileId(fileId)) {
      return errorResponse(res, 400, 'Invalid file ID format');
    }

    const { drive, error } = createDriveClient(req);
    if (error) return errorResponse(res, 401, error);

    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const base64 = Buffer.from(response.data).toString('base64');
    return res.status(200).json({ fileContent: base64, success: true });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

async function handleDeleteBackup(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { fileId } = req.body;
    if (!isValidFileId(fileId)) {
      return errorResponse(res, 400, 'Invalid file ID format');
    }

    const { drive, error } = createDriveClient(req);
    if (error) return errorResponse(res, 401, error);

    await drive.files.delete({ fileId });
    return res.status(200).json({ success: true });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

async function handleListBackups(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { drive, error } = createDriveClient(req);
    if (error) return errorResponse(res, 401, error);

    const folderId = await getOrCreateBackupFolder(drive);
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, size, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    });

    return res.status(200).json({ files: response.data.files || [], success: true });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

async function handleStorageInfo(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { drive, error } = createDriveClient(req);
    if (error) return errorResponse(res, 401, error);

    const response = await drive.about.get({ fields: 'storageQuota' });
    const quota = response.data.storageQuota;

    const storageInfo = {
      used: parseInt(quota.usage, 10),
      total: parseInt(quota.limit, 10),
      available: parseInt(quota.limit, 10) - parseInt(quota.usage, 10),
    };

    return res.status(200).json({ storageInfo, success: true });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

// ============================================
// ROUTE MAP (pre-composed with middleware)
// ============================================

// auth-url and get-tokens have no middleware (original files had none)
const routes = {
  'auth-url': handleAuthUrl,
  'get-tokens': handleGetTokens,
  'auth-callback': composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.AUTH))(handleAuthCallback),
  'auth-status': composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.READ))(handleAuthStatus),
  'auth-logout': composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.AUTH))(handleAuthLogout),
  'upload-backup': composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.UPLOAD))(handleUploadBackup),
  'download-backup': composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.DATA))(handleDownloadBackup),
  'delete-backup': composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.DATA))(handleDeleteBackup),
  'list-backups': composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.READ))(handleListBackups),
  'storage-info': composeMiddlewares(withCSRF, (h) => withRateLimit(h, RATE_LIMITS.READ))(handleStorageInfo),
};

export default function handler(req, res) {
  const { action } = req.query;
  const route = routes[action];

  if (!route) {
    return res.status(404).json({ error: 'Not found', success: false });
  }

  return route(req, res);
}
