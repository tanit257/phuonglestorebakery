/**
 * Vercel Cron Job - Daily Backup
 * This function runs automatically every day at midnight UTC (7 AM Vietnam time)
 *
 * Configured in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-backup",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import sgMail from '@sendgrid/mail';
import pako from 'pako';
import crypto from 'crypto';

const BACKUP_VERSION = '1.0';
const BACKUP_FOLDER_NAME = 'PhuongLeStore-Backups';

// Utility: Encrypt data
const encryptData = (data, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encrypted, iv: iv.toString('hex') };
};

// Utility: Export Supabase data
const exportSupabaseData = async (supabase) => {
  const tables = [
    'products', 'customers', 'orders', 'order_items',
    'purchases', 'purchase_items', 'invoice_orders', 'invoice_order_items',
    'invoice_purchases', 'invoice_purchase_items', 'invoice_inventory',
  ];

  const data = {};
  for (const table of tables) {
    const { data: tableData, error } = await supabase.from(table).select('*');
    if (error) throw new Error(`Failed to export ${table}: ${error.message}`);
    data[table] = tableData;
  }

  return data;
};

// Utility: Calculate metadata
const calculateMetadata = (data) => {
  return {
    total_products: data.products?.length || 0,
    total_customers: data.customers?.length || 0,
    total_orders: data.orders?.length || 0,
    total_order_items: data.order_items?.length || 0,
    total_purchases: data.purchases?.length || 0,
    total_purchase_items: data.purchase_items?.length || 0,
    total_invoice_orders: data.invoice_orders?.length || 0,
    total_invoice_order_items: data.invoice_order_items?.length || 0,
    total_invoice_purchases: data.invoice_purchases?.length || 0,
    total_invoice_purchase_items: data.invoice_purchase_items?.length || 0,
    total_invoice_inventory: data.invoice_inventory?.length || 0,
  };
};

// Utility: Upload to Google Drive
const uploadToGoogleDrive = async (fileName, fileContent) => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // Get or create backup folder
  const searchResponse = await drive.files.list({
    q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  });

  let folderId;
  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    folderId = searchResponse.data.files[0].id;
  } else {
    const createResponse = await drive.files.create({
      resource: { name: BACKUP_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id',
    });
    folderId = createResponse.data.id;
  }

  // Upload file
  const response = await drive.files.create({
    resource: { name: fileName, parents: [folderId] },
    media: { mimeType: 'application/gzip', body: Buffer.from(fileContent) },
    fields: 'id, name, size, createdTime',
  });

  return response.data;
};

// Utility: Cleanup old backups
const cleanupOldBackups = async (retentionDays = 30) => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const searchResponse = await drive.files.list({
    q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  });

  if (!searchResponse.data.files || searchResponse.data.files.length === 0) return 0;

  const folderId = searchResponse.data.files[0].id;
  const backupsResponse = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, createdTime)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  });

  const backups = backupsResponse.data.files || [];
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  let deletedCount = 0;

  for (const backup of backups) {
    if (new Date(backup.createdTime) < cutoffDate) {
      await drive.files.delete({ fileId: backup.id });
      deletedCount++;
    }
  }

  return deletedCount;
};

// Utility: Send email alert
const sendEmail = async (subject, text, html) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const alertEmail = process.env.ALERT_EMAIL;

  await sgMail.send({
    to: alertEmail,
    from: alertEmail,
    subject,
    text,
    html,
  });
};

// Main handler
export default async function handler(req, res) {
  // Verify cron secret
  const authHeader = req.headers['authorization'];
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Initialize Supabase
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    // Export data
    const data = await exportSupabaseData(supabase);
    const metadata = calculateMetadata(data);

    // Create backup object
    const backup = {
      version: BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      mode: 'supabase',
      metadata: { ...metadata, app_version: '1.0.0' },
      data,
    };

    // Encrypt and compress
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
    const jsonString = JSON.stringify(backup);
    const { encrypted, iv } = encryptData(jsonString, encryptionKey);
    const compressed = pako.gzip(encrypted);

    // Generate filename with IV (required for restore)
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const fileName = `backup-${timestamp}-iv-${iv}.json.gz`;

    // Upload to Google Drive
    const uploadResult = await uploadToGoogleDrive(fileName, compressed);

    // Cleanup old backups
    const deletedCount = await cleanupOldBackups(30);

    // Send success email
    try {
      await sendEmail(
        '✅ PhuongLe Store - Daily Backup Successful',
        `Backup completed successfully at ${new Date().toLocaleString('vi-VN')}`,
        `<h2>✅ Daily Backup Successful</h2>
         <p>Backup file: ${fileName}</p>
         <p>Size: ${(uploadResult.size / 1024).toFixed(2)} KB</p>
         <p>Old backups deleted: ${deletedCount}</p>`
      );
    } catch (emailError) {
      console.error('Failed to send success email:', emailError);
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      backup: {
        fileName,
        size: uploadResult.size,
        id: uploadResult.id,
      },
      cleanup: {
        deletedCount,
      },
    });
  } catch (error) {
    console.error('Backup failed:', error);

    // Send failure email
    try {
      await sendEmail(
        '⚠️ PhuongLe Store - Daily Backup Failed',
        `Backup failed: ${error.message}`,
        `<h2>⚠️ Daily Backup Failed</h2>
         <p><strong>Error:</strong> ${error.message}</p>
         <pre>${error.stack}</pre>`
      );
    } catch (emailError) {
      console.error('Failed to send failure email:', emailError);
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
