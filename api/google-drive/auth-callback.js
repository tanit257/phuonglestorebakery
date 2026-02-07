/**
 * API Route: OAuth Callback - Exchange code for tokens and set httpOnly cookie
 * This replaces the client-side token storage with secure server-side cookies
 * Tokens are encrypted with AES-256-GCM before storing
 */

import { google } from 'googleapis';
import { serialize } from 'cookie';
import { isValidAuthCode, errorResponse, sanitizeErrorMessage, encryptToken } from './_utils.js';
import { withRateLimit, RATE_LIMITS, composeMiddlewares } from '../_middleware/rateLimit.js';
import { withCSRF } from '../_middleware/csrf.js';

// Cookie configuration
const COOKIE_NAME = 'gdrive_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function handler(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { code } = req.body;

    // Validate authorization code format
    if (!isValidAuthCode(code)) {
      return errorResponse(res, 400, 'Invalid authorization code');
    }

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return errorResponse(res, 500, 'Server configuration error');
    }

    // Check encryption key is configured
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
    if (!encryptionKey || encryptionKey.length !== 32) {
      return errorResponse(res, 500, 'Server encryption not configured');
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    // Encrypt tokens before storing in cookie using AES-256-GCM
    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });
    const encryptedTokens = encryptToken(tokenData);

    // Set httpOnly cookie with encrypted tokens
    const cookie = serialize(COOKIE_NAME, encryptedTokens, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
    });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

// Apply CSRF protection and strict rate limit for auth operations
export default composeMiddlewares(
  withCSRF,
  (h) => withRateLimit(h, RATE_LIMITS.AUTH)
)(handler);
