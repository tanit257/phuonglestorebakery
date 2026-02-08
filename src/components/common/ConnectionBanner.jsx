import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

const ConnectionBanner = () => {
  const connectionStatus = useStore((state) => state.connectionStatus);
  const retryConnection = useStore((state) => state.retryConnection);

  if (connectionStatus !== 'offline') return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white px-4 py-2.5 text-center text-sm font-medium shadow-lg flex items-center justify-center gap-3">
      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <WifiOff size={14} />
      </div>
      <span>Không có kết nối mạng. Bạn có thể xem dữ liệu nhưng không thể tạo/sửa/xóa.</span>
      <button
        onClick={retryConnection}
        className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white rounded-lg text-xs font-semibold hover:bg-white/30 transition-colors cursor-pointer"
      >
        <RefreshCw size={12} />
        Thử lại
      </button>
    </div>
  );
};

export default ConnectionBanner;
