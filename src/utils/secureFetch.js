/**
 * Secure Fetch Wrapper
 * Automatically adds CSRF protection headers to all requests
 * Used for API calls that require CSRF validation
 */

/**
 * Create fetch options with CSRF headers
 * @param {RequestInit} options - Original fetch options
 * @returns {RequestInit} Options with CSRF headers added
 */
const addCSRFHeaders = (options = {}) => {
  const headers = new Headers(options.headers || {});

  // Add X-Requested-With header for CSRF protection
  // This header cannot be set cross-origin without CORS preflight
  headers.set('X-Requested-With', 'XMLHttpRequest');

  return {
    ...options,
    headers,
    credentials: 'include', // Always include cookies
  };
};

/**
 * Secure fetch wrapper that adds CSRF protection
 * @param {string} url - Request URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const secureFetch = async (url, options = {}) => {
  const secureOptions = addCSRFHeaders(options);
  return fetch(url, secureOptions);
};

/**
 * Secure POST request
 * @param {string} url - Request URL
 * @param {Object} body - Request body (will be JSON stringified)
 * @returns {Promise<Response>} Fetch response
 */
export const securePost = async (url, body = {}) => {
  return secureFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

/**
 * Secure GET request
 * @param {string} url - Request URL
 * @returns {Promise<Response>} Fetch response
 */
export const secureGet = async (url) => {
  return secureFetch(url, {
    method: 'GET',
  });
};

export default secureFetch;
