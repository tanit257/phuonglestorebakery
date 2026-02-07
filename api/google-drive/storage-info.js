/**
 * API Route: Get Google Drive storage information
 * Returns storage quota (used, total, available)
 */

import {
  createDriveClient,
  errorResponse,
  sanitizeErrorMessage,
} from './_utils.js';
import { withRateLimit, RATE_LIMITS, composeMiddlewares } from '../_middleware/rateLimit.js';
import { withCSRF } from '../_middleware/csrf.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { drive, error } = createDriveClient(req);

    if (error) {
      return errorResponse(res, 401, error);
    }

    const response = await drive.about.get({
      fields: 'storageQuota',
    });

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

// Apply CSRF protection and read rate limit
export default composeMiddlewares(
  withCSRF,
  (h) => withRateLimit(h, RATE_LIMITS.READ)
)(handler);
