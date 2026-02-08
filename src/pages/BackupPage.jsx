import React, { useState, useEffect } from 'react';
import { Database, Cloud, Download, RotateCcw, Trash2, AlertTriangle, Loader } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useStore } from '../hooks/useStore';
import {
  getAuthUrl,
  authenticateWithCode,
  checkAuthStatus,
  logout,
  listBackupsFromDrive,
  downloadBackupFromDrive,
  deleteBackupFromDrive,
  getStorageInfo,
  uploadBackupToDrive,
} from '../services/googleDriveClient';
import {
  createBackup,
  prepareBackupForUpload,
  decryptBackupFile,
  formatFileSize,
  getBackupStats,
} from '../services/backup';
import { restoreBackup, getRestorePreview } from '../services/restore';

const BackupPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    danger: false,
  });
  const [restorePreview, setRestorePreview] = useState(null);

  const { showNotification } = useStore();

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Load backups when connected
  useEffect(() => {
    if (isConnected) {
      loadBackups();
      loadStorageInfo();
    }
  }, [isConnected]);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      handleOAuthCallback(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkConnection = async () => {
    try {
      setIsCheckingAuth(true);
      const authenticated = await checkAuthStatus();
      setIsConnected(authenticated);
    } catch {
      setIsConnected(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleOAuthCallback = async (code) => {
    try {
      setLoading(true);
      await authenticateWithCode(code);
      setIsConnected(true);
      showNotification('Đã kết nối Google Drive thành công!', 'success');
    } catch (error) {
      showNotification(`Lỗi kết nối: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      showNotification(`Lỗi: ${error.message}`, 'error');
    }
  };

  const handleDisconnect = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Ngắt kết nối Google Drive',
      message: 'Bạn có chắc muốn ngắt kết nối? Bạn sẽ không thể backup/restore cho đến khi kết nối lại.',
      onConfirm: async () => {
        try {
          await logout();
          setIsConnected(false);
          setBackups([]);
          setStorageInfo(null);
          showNotification('Đã ngắt kết nối Google Drive', 'success');
        } catch (error) {
          showNotification(`Lỗi ngắt kết nối: ${error.message}`, 'error');
        }
      },
      danger: true,
    });
  };

  const loadBackups = async () => {
    try {
      setLoading(true);
      const backupList = await listBackupsFromDrive();
      setBackups(backupList);
    } catch (error) {
      showNotification(`Lỗi tải danh sách backup: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch {
      // Silently fail for storage info
    }
  };

  const handleCreateBackup = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Tạo backup mới',
      message: 'Bạn có chắc muốn tạo backup toàn bộ database hiện tại?',
      onConfirm: async () => {
        try {
          setCreating(true);

          // Create backup data
          const backup = await createBackup();

          // Encrypt via server API (key is not exposed to client)
          const { fileName, fileContent } = await prepareBackupForUpload(backup);

          // Upload to Google Drive
          await uploadBackupToDrive(fileName, fileContent);

          showNotification('Tạo backup thành công!', 'success');
          await loadBackups();
          await loadStorageInfo();
        } catch (error) {
          showNotification(`Lỗi tạo backup: ${error.message}`, 'error');
        } finally {
          setCreating(false);
        }
      },
    });
  };

  const handleDownloadBackup = async (backup) => {
    try {
      setLoading(true);

      const base64Content = await downloadBackupFromDrive(backup.id);

      // Convert base64 to binary for file download
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/gzip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification('Tải backup thành công!', 'success');
    } catch (error) {
      showNotification(`Lỗi tải backup: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backup) => {
    try {
      setLoading(true);

      // Download encrypted backup from Google Drive (returns base64 string)
      const base64Content = await downloadBackupFromDrive(backup.id);

      // Extract IV from filename (format: backup-YYYY-MM-DDTHH-mm-ss-iv-HEXSTRING.json.gz)
      const ivMatch = backup.name.match(/iv-([a-f0-9]+)/);
      if (!ivMatch) {
        showNotification('Không tìm thấy IV trong tên file backup', 'error');
        setLoading(false);
        return;
      }
      const iv = ivMatch[1];

      // Decrypt via server API (base64 string passed directly)
      const decryptedBackup = await decryptBackupFile(base64Content, iv);
      const preview = getRestorePreview(decryptedBackup);
      setRestorePreview({ backup: decryptedBackup, preview, backupName: backup.name });

      setConfirmDialog({
        isOpen: true,
        title: 'Xác nhận phục hồi',
        message: (
          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">CẢNH BÁO QUAN TRỌNG</p>
                  <p className="text-sm text-red-700 mt-1">
                    Hành động này sẽ XÓA TOÀN BỘ dữ liệu hiện tại và thay thế bằng backup từ ngày:
                  </p>
                  <p className="text-sm font-bold text-red-800 mt-2">
                    {new Date(preview.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <p className="font-semibold text-blue-900 mb-2">Dữ liệu sẽ được phục hồi:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(preview.tables).map(([table, count]) => (
                  <div key={table} className="flex justify-between">
                    <span className="text-blue-700">{table}:</span>
                    <span className="font-semibold text-blue-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium">Tôi hiểu rủi ro và muốn tiếp tục</span>
            </label>
          </div>
        ),
        onConfirm: async () => {
          try {
            setLoading(true);

            await restoreBackup(decryptedBackup);

            showNotification('Phục hồi database thành công! Đang tải lại trang...', 'success');

            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (error) {
            showNotification(`Lỗi phục hồi: ${error.message}`, 'error');
            setLoading(false);
          }
        },
        danger: true,
      });
    } catch (error) {
      showNotification(`Lỗi đọc backup: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = (backup) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa backup',
      message: `Bạn có chắc muốn xóa backup "${backup.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteBackupFromDrive(backup.id);
          showNotification('Xóa backup thành công!', 'success');
          await loadBackups();
          await loadStorageInfo();
        } catch (error) {
          showNotification(`Lỗi xóa backup: ${error.message}`, 'error');
        } finally {
          setLoading(false);
        }
      },
      danger: true,
    });
  };

  const stats = getBackupStats(backups);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Sao lưu & Phục hồi" icon={Database} />
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Sao lưu & Phục hồi" icon={Database} />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Connection Status */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Cloud className={`w-8 h-8 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <h2 className="text-xl font-bold">Google Drive</h2>
                <p className="text-sm text-gray-600">
                  {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                </p>
              </div>
            </div>

            {isConnected ? (
              <Button variant="secondary" onClick={handleDisconnect}>
                Ngắt kết nối
              </Button>
            ) : (
              <Button onClick={handleConnect}>
                <Cloud className="w-4 h-4 mr-2" />
                Kết nối Google Drive
              </Button>
            )}
          </div>

          {isConnected && storageInfo && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Dung lượng đã dùng:</span>
                <span className="font-semibold">{formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.total)}</span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </Card>

        {isConnected && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tổng số backup</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Backup mới nhất</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {stats.newest ? new Date(stats.newest).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Backup cũ nhất</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {stats.oldest ? new Date(stats.oldest).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tổng dung lượng</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {formatFileSize(stats.totalSize)}
                  </p>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <Card>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Tạo backup thủ công</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Backup tự động chạy hàng ngày lúc 12:00 AM UTC (7:00 AM VN)
                  </p>
                </div>
                <Button onClick={handleCreateBackup} disabled={creating}>
                  {creating ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Tạo backup ngay
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Backup List */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Danh sách Backup</h3>
                <Button variant="secondary" onClick={loadBackups} disabled={loading}>
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {loading && backups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Loader className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  Đang tải...
                </div>
              ) : backups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có backup nào
                </div>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{backup.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(backup.createdTime).toLocaleString('vi-VN')} · {formatFileSize(parseInt(backup.size))}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownloadBackup(backup)}
                          title="Tải về"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRestoreBackup(backup)}
                          title="Phục hồi"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteBackup(backup)}
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText={confirmDialog.danger ? 'Xác nhận' : 'OK'}
        danger={confirmDialog.danger}
      />
    </div>
  );
};

export default BackupPage;
