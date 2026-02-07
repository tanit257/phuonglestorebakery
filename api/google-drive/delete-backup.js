/**
 * API Route: Delete backup file from Google Drive
 * Deletes the specified file
 */

import {
  createDriveClient,
  isValidFileId,
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
    const { fileId } = req.body;

    // Validate fileId format
    if (!isValidFileId(fileId)) {
      return errorResponse(res, 400, 'Invalid file ID format');
    }

    const { drive, error } = createDriveClient(req);

    if (error) {
      return errorResponse(res, 401, error);
    }

    await drive.files.delete({ fileId });

    return res.status(200).json({ success: true });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

// Apply CSRF protection and data operation rate limit
export default composeMiddlewares(
  withCSRF,
  (h) => withRateLimit(h, RATE_LIMITS.DATA)
)(handler);
