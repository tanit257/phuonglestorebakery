/**
 * API Route: Check authentication status
 * Returns whether user has valid Google Drive tokens in cookie
 */

import { parse } from 'cookie';
import { errorResponse, decryptToken } from './_utils.js';
import { withRateLimit, RATE_LIMITS, composeMiddlewares } from '../_middleware/rateLimit.js';
import { withCSRF } from '../_middleware/csrf.js';

const COOKIE_NAME = 'gdrive_session';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const cookies = parse(req.headers.cookie || '');
    const encryptedTokens = cookies[COOKIE_NAME];

    if (!encryptedTokens) {
      return res.status(200).json({
        authenticated: false,
        success: true,
      });
    }

    // Decrypt and validate tokens
    const decrypted = decryptToken(encryptedTokens);
    const tokenData = JSON.parse(decrypted);

    // Check if tokens exist and have required fields
    const isValid = tokenData.access_token && tokenData.refresh_token;

    // Check if access token is expired (with 5 minute buffer)
    const isExpired = tokenData.expiry_date && Date.now() > tokenData.expiry_date - 5 * 60 * 1000;

    return res.status(200).json({
      authenticated: isValid,
      needsRefresh: isExpired,
      success: true,
    });
  } catch {
    // If cookie is malformed or decryption fails, treat as not authenticated
    return res.status(200).json({
      authenticated: false,
      success: true,
    });
  }
}

// Apply CSRF protection and read rate limit
export default composeMiddlewares(
  withCSRF,
  (h) => withRateLimit(h, RATE_LIMITS.READ)
)(handler);
