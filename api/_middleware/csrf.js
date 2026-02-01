/**
 * CSRF Protection Middleware for Vercel Serverless Functions
 *
 * Uses Custom Header + Origin/Referer Check pattern:
 * - Validates X-Requested-With header (cannot be set cross-origin without CORS preflight)
 * - Validates Origin/Referer header matches allowed origins
 * - Only applies to state-changing methods (POST, PUT, DELETE, PATCH)
 */

/**
 * Get allowed origins from environment
 * @returns {string[]} List of allowed origins
 */
const getAllowedOrigins = () => {
  const origins = [];

  // Production origin from environment
  const productionUrl = process.env.VITE_APP_URL;
  if (productionUrl) {
    origins.push(productionUrl.replace(/\/$/, '')); // Remove trailing slash
  }

  // Vercel preview URLs
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    origins.push(`https://${vercelUrl}`);
  }

  // Local development
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:5173');
    origins.push('http://localhost:3000');
    origins.push('http://127.0.0.1:5173');
    origins.push('http://127.0.0.1:3000');
  }

  return origins;
};

/**
 * Extract origin from request
 * @param {Object} req - Request object
 * @returns {string|null} Origin URL or null
 */
const getRequestOrigin = (req) => {
  // Try Origin header first (most reliable for CORS requests)
  const origin = req.headers.origin;
  if (origin) {
    return origin;
  }

  // Fall back to Referer header
  const referer = req.headers.referer;
  if (referer) {
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch {
      return null;
    }
  }

  return null;
};

/**
 * Check if request origin is allowed
 * @param {Object} req - Request object
 * @returns {boolean} True if origin is valid
 */
const isValidOrigin = (req) => {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = getRequestOrigin(req);

  // If no origin header (same-origin requests from some browsers),
  // check if X-Requested-With is present as additional validation
  if (!requestOrigin) {
    // Allow if it's a same-origin request (no Origin header)
    // but require X-Requested-With for additional security
    return req.headers['x-requested-with'] === 'XMLHttpRequest';
  }

  return allowedOrigins.includes(requestOrigin);
};

/**
 * Check if request has required custom header
 * Browsers don't allow setting X-Requested-With header in cross-origin requests
 * without CORS preflight, providing CSRF protection
 * @param {Object} req - Request object
 * @returns {boolean} True if custom header is present
 */
const hasCustomHeader = (req) => {
  return req.headers['x-requested-with'] === 'XMLHttpRequest';
};

/**
 * CSRF validation result
 * @param {Object} req - Request object
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateCSRF = (req) => {
  const method = req.method?.toUpperCase();

  // Skip CSRF check for safe methods (GET, HEAD, OPTIONS)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(method)) {
    return { valid: true };
  }

  // Check origin/referer
  if (!isValidOrigin(req)) {
    return {
      valid: false,
      error: 'Invalid request origin',
    };
  }

  // Check custom header
  if (!hasCustomHeader(req)) {
    return {
      valid: false,
      error: 'Missing required security header',
    };
  }

  return { valid: true };
};

/**
 * CSRF protection middleware wrapper
 * @param {Function} handler - API handler function
 * @param {Object} options - Options
 * @param {boolean} options.skipCSRF - Skip CSRF check (for special cases like OAuth callback)
 * @returns {Function} Wrapped handler with CSRF protection
 */
export const withCSRF = (handler, options = {}) => {
  return async (req, res) => {
    // Allow skipping CSRF for specific routes (e.g., OAuth callback from Google)
    if (options.skipCSRF) {
      return handler(req, res);
    }

    const { valid, error } = validateCSRF(req);

    if (!valid) {
      return res.status(403).json({
        error: error || 'CSRF validation failed',
        success: false,
      });
    }

    return handler(req, res);
  };
};

export default withCSRF;
