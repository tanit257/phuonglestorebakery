import sgMail from '@sendgrid/mail';

/**
 * Initialize SendGrid with API key
 * This function should be called on server-side only (Vercel API routes)
 */
export const initSendGrid = () => {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  sgMail.setApiKey(apiKey);
};

/**
 * Send email alert for backup failure
 * @param {Object} error - Error object
 * @param {string} context - Context where error occurred
 */
export const sendBackupFailureAlert = async (error, context = 'Unknown') => {
  try {
    initSendGrid();

    const alertEmail = process.env.ALERT_EMAIL;

    if (!alertEmail) {
      throw new Error('ALERT_EMAIL not configured');
    }

    const msg = {
      to: alertEmail,
      from: alertEmail, // Must be verified sender in SendGrid
      subject: `⚠️ PhuongLe Store - Backup Failed`,
      text: `
Backup Failed Alert
===================

Time: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
Context: ${context}
Error: ${error.message}

Stack Trace:
${error.stack || 'No stack trace available'}

Please investigate and resolve this issue as soon as possible.

---
This is an automated alert from PhuongLe Store Backup System.
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .alert-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .info-box {
      background: white;
      border-left: 4px solid #ff6b6b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      margin: 10px 0;
    }
    .info-label {
      font-weight: bold;
      min-width: 100px;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .error-box {
      background: #fff5f5;
      border: 1px solid #ff6b6b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #c92a2a;
      overflow-x: auto;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #888;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="alert-icon">⚠️</div>
    <h1 style="margin: 0;">Backup Failed Alert</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">PhuongLe Store Backup System</p>
  </div>

  <div class="content">
    <div class="info-box">
      <div class="info-row">
        <div class="info-label">Time:</div>
        <div class="info-value">${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Context:</div>
        <div class="info-value">${context}</div>
      </div>
    </div>

    <h3 style="color: #c92a2a;">Error Details:</h3>
    <div class="error-box">
      ${error.message}
    </div>

    ${error.stack ? `
    <h3 style="color: #c92a2a;">Stack Trace:</h3>
    <div class="error-box">
      ${error.stack.replace(/\n/g, '<br>')}
    </div>
    ` : ''}

    <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
      <strong>⚡ Action Required:</strong><br>
      Please investigate and resolve this issue as soon as possible to ensure data safety.
    </p>
  </div>

  <div class="footer">
    This is an automated alert from PhuongLe Store Backup System.<br>
    Do not reply to this email.
  </div>
</body>
</html>
      `,
    };

    await sgMail.send(msg);

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // If email fails, log to console (will appear in Vercel logs)
    console.error('Failed to send email alert:', error);

    throw new Error(`Email alert failed: ${error.message}`);
  }
};

/**
 * Send email alert for successful backup
 * @param {Object} backupInfo - Backup information
 */
export const sendBackupSuccessAlert = async (backupInfo) => {
  try {
    initSendGrid();

    const alertEmail = process.env.ALERT_EMAIL;

    if (!alertEmail) {
      throw new Error('ALERT_EMAIL not configured');
    }

    const msg = {
      to: alertEmail,
      from: alertEmail,
      subject: `✅ PhuongLe Store - Backup Successful`,
      text: `
Backup Successful
=================

Time: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
Backup File: ${backupInfo.fileName || 'Unknown'}
File Size: ${backupInfo.size || 'Unknown'}

Backup completed successfully.

---
This is an automated notification from PhuongLe Store Backup System.
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .info-box {
      background: white;
      border-left: 4px solid #51cf66;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      margin: 10px 0;
    }
    .info-label {
      font-weight: bold;
      min-width: 120px;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #888;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="success-icon">✅</div>
    <h1 style="margin: 0;">Backup Successful</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">PhuongLe Store Backup System</p>
  </div>

  <div class="content">
    <p style="font-size: 16px; color: #2b8a3e; font-weight: 500;">
      Your database backup has been completed successfully!
    </p>

    <div class="info-box">
      <div class="info-row">
        <div class="info-label">Time:</div>
        <div class="info-value">${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Backup File:</div>
        <div class="info-value">${backupInfo.fileName || 'Unknown'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">File Size:</div>
        <div class="info-value">${backupInfo.size || 'Unknown'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Location:</div>
        <div class="info-value">Google Drive</div>
      </div>
    </div>

    <p style="margin-top: 30px; padding: 15px; background: #e7f5ff; border-left: 4px solid #339af0; border-radius: 4px;">
      <strong>ℹ️ Note:</strong><br>
      Backups are automatically retained for 30 days. Older backups are deleted automatically.
    </p>
  </div>

  <div class="footer">
    This is an automated notification from PhuongLe Store Backup System.<br>
    Do not reply to this email.
  </div>
</body>
</html>
      `,
    };

    await sgMail.send(msg);

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to send success email:', error);
    // Don't throw error for success emails (not critical)
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send weekly backup summary email
 * @param {Object} summary - Backup summary statistics
 */
export const sendWeeklyBackupSummary = async (summary) => {
  try {
    initSendGrid();

    const alertEmail = process.env.ALERT_EMAIL;

    if (!alertEmail) {
      throw new Error('ALERT_EMAIL not configured');
    }

    const msg = {
      to: alertEmail,
      from: alertEmail,
      subject: `📊 PhuongLe Store - Weekly Backup Summary`,
      text: `
Weekly Backup Summary
=====================

Period: ${summary.periodStart} - ${summary.periodEnd}

Statistics:
- Total Backups: ${summary.totalBackups}
- Successful: ${summary.successful}
- Failed: ${summary.failed}
- Total Storage Used: ${summary.totalStorage}

${summary.failed > 0 ? `⚠️ Warning: ${summary.failed} backup(s) failed this week. Please investigate.` : '✅ All backups completed successfully this week.'}

---
This is an automated summary from PhuongLe Store Backup System.
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      margin: 10px 0;
    }
    .stat-label {
      color: #666;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      color: #888;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">📊 Weekly Backup Summary</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">${summary.periodStart} - ${summary.periodEnd}</p>
  </div>

  <div class="content">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Backups</div>
        <div class="stat-value">${summary.totalBackups}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Successful</div>
        <div class="stat-value" style="color: #51cf66;">${summary.successful}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Failed</div>
        <div class="stat-value" style="color: ${summary.failed > 0 ? '#ff6b6b' : '#51cf66'};">${summary.failed}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Storage Used</div>
        <div class="stat-value" style="font-size: 20px;">${summary.totalStorage}</div>
      </div>
    </div>

    ${summary.failed > 0 ? `
    <p style="margin-top: 20px; padding: 15px; background: #fff5f5; border-left: 4px solid #ff6b6b; border-radius: 4px;">
      <strong>⚠️ Warning:</strong><br>
      ${summary.failed} backup(s) failed this week. Please investigate immediately.
    </p>
    ` : `
    <p style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-left: 4px solid #51cf66; border-radius: 4px;">
      <strong>✅ Great!</strong><br>
      All backups completed successfully this week. Your data is safe!
    </p>
    `}
  </div>

  <div class="footer">
    This is an automated summary from PhuongLe Store Backup System.<br>
    Do not reply to this email.
  </div>
</body>
</html>
      `,
    };

    await sgMail.send(msg);

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to send weekly summary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
