/**
 * API Route: List all backup files from Google Drive
 * Returns array of backup files sorted by creation date (newest first)
 */

import {
  createDriveClient,
  getOrCreateBackupFolder,
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

    // Get or create backup folder
    const folderId = await getOrCreateBackupFolder(drive);

    // List backups
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

// Apply CSRF protection and read operation rate limit (more lenient)
export default composeMiddlewares(
  withCSRF,
  (h) => withRateLimit(h, RATE_LIMITS.READ)
)(handler);
