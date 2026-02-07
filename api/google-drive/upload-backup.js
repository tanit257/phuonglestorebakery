/**
 * API Route: Upload backup file to Google Drive
 * Receives encrypted backup data and uploads to Google Drive
 */

import {
  createDriveClient,
  getOrCreateBackupFolder,
  isValidBackupFileName,
  isNonEmptyString,
  errorResponse,
  sanitizeErrorMessage,
} from './_utils.js';
import { withRateLimit, RATE_LIMITS, composeMiddlewares } from '../_middleware/rateLimit.js';
import { withCSRF } from '../_middleware/csrf.js';

// Max file size: 50MB (base64 encoded)
const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1.37; // ~68MB base64

async function handler(req, res) {
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { fileName, fileContent } = req.body;

    // Validate fileName
    if (!isValidBackupFileName(fileName)) {
      return errorResponse(res, 400, 'Invalid file name format. Expected: backup-YYYY-MM-DD-*.json.gz');
    }

    // Validate fileContent
    if (!isNonEmptyString(fileContent)) {
      return errorResponse(res, 400, 'File content is required');
    }

    // Check file size
    if (fileContent.length > MAX_FILE_SIZE) {
      return errorResponse(res, 400, 'File too large. Maximum size is 50MB');
    }

    const { drive, error } = createDriveClient(req);

    if (error) {
      return errorResponse(res, 401, error);
    }

    // Get or create backup folder
    const folderId = await getOrCreateBackupFolder(drive);

    // Convert base64 to Buffer
    const buffer = Buffer.from(fileContent, 'base64');

    // Upload file
    const response = await drive.files.create({
      resource: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: 'application/gzip',
        body: buffer,
      },
      fields: 'id, name, size, createdTime',
    });

    return res.status(200).json({ file: response.data, success: true });
  } catch (error) {
    return errorResponse(res, 500, sanitizeErrorMessage(error));
  }
}

// Apply CSRF protection and strict rate limit for upload operations
export default composeMiddlewares(
  withCSRF,
  (h) => withRateLimit(h, RATE_LIMITS.UPLOAD)
)(handler);
