/**
 * API Route: Logout - Clear the httpOnly cookie
 */

import { serialize } from 'cookie';
import { errorResponse, sanitizeErrorMessage } from './_utils.js';
import { withRateLimit, RATE_LIMITS, composeMiddlewares } from '../_middleware/rateLimit.js';
import { withCSRF } from '../_middleware/csrf.js';

const COOKIE_NAME = 'gdrive_session';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    // Clear the cookie by setting it with maxAge 0
    const cookie = serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

// Apply CSRF protection and auth rate limit
export default composeMiddlewares(
  withCSRF,
  (h) => withRateLimit(h, RATE_LIMITS.AUTH)
)(handler);
