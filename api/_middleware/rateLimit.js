/**
 * Simple in-memory rate limiting for Vercel serverless functions
 * Note: This resets when functions cold start, but provides basic protection
 * For production at scale, consider using Upstash Redis or Vercel KV
 */

// In-memory store for rate limiting
// Key: IP address, Value: { count, resetTime }
const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

/**
 * Clean up expired rate limit entries
 */
const cleanup = () => {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

/**
 * Get client IP from request
 * Handles Vercel's x-forwarded-for header
 */
const getClientIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

/**
 * Rate limit configuration presets
 */
export const RATE_LIMITS = {
  // Auth endpoints - stricter limits
  AUTH: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute

  // Data operations - moderate limits
  DATA: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute

  // Read operations - more lenient
  READ: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 requests per minute

  // Upload/heavy operations - strict
  UPLOAD: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 requests per minute
};

/**
 * Check if request should be rate limited
 * @param {Object} req - Request object
 * @param {Object} options - Rate limit options
 * @returns {Object} { limited: boolean, remaining: number, resetIn: number }
 */
export const checkRateLimit = (req, options = RATE_LIMITS.DATA) => {
  cleanup();

  const { maxRequests, windowMs } = options;
  const ip = getClientIP(req);
  const key = `${ip}:${req.url}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Create new record
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);

    return {
      limited: false,
      remaining: maxRequests - 1,
      resetIn: Math.ceil(windowMs / 1000),
    };
  }

  // Increment count
  record.count += 1;
  rateLimitStore.set(key, record);

  const remaining = Math.max(0, maxRequests - record.count);
  const resetIn = Math.ceil((record.resetTime - now) / 1000);

  return {
    limited: record.count > maxRequests,
    remaining,
    resetIn,
  };
};

/**
 * Rate limit middleware wrapper
 * @param {Function} handler - API handler function
 * @param {Object} options - Rate limit options
 * @returns {Function} Wrapped handler
 */
export const withRateLimit = (handler, options = RATE_LIMITS.DATA) => {
  return async (req, res) => {
    const { limited, remaining, resetIn } = checkRateLimit(req, options);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetIn);

    if (limited) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: resetIn,
        success: false,
      });
    }

    return handler(req, res);
  };
};

/**
 * Compose multiple middlewares together
 * Usage: composeMiddlewares(withCSRF(), withRateLimit(RATE_LIMITS.DATA))(handler)
 * @param  {...Function} middlewareFactories - Middleware wrapper functions
 * @returns {Function} Composed middleware that wraps a handler
 */
export const composeMiddlewares = (...middlewareFactories) => {
  return (handler) => {
    return middlewareFactories.reduceRight(
      (wrappedHandler, middleware) => middleware(wrappedHandler),
      handler
    );
  };
};
