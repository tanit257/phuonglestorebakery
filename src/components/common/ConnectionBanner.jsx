import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

const ConnectionBanner = () => {
  const connectionStatus = useStore((state) => state.connectionStatus);
  const retryConnection = useStore((state) => state.retryConnection);

  if (connectionStatus !== 'offline') return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium shadow-md flex items-center justify-center gap-2">
      <WifiOff size={16} />
      <span>Không có kết nối mạng. Bạn có thể xem dữ liệu nhưng không thể tạo/sửa/xóa.</span>
      <button
        onClick={retryConnection}
        className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800 transition-colors"
      >
        <RefreshCw size={12} />
        Thử lại
      </button>
    </div>
  );
};

export default ConnectionBanner;
