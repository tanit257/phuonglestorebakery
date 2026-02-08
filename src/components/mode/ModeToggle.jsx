import React from 'react';
import { Package, FileText, ArrowLeftRight } from 'lucide-react';
import { useMode, MODES } from '../../contexts/ModeContext';

export const ModeToggle = ({ compact = false }) => {
  const { mode, toggleMode, config, isTransitioning } = useMode();

  const isReal = mode === MODES.REAL;

  if (compact) {
    return (
      <button
        onClick={toggleMode}
        disabled={isTransitioning}
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm
          transition-all duration-300 transform
          ${isTransitioning ? 'opacity-70' : 'opacity-100'}
          ${isReal
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
          }
          hover:shadow-xl hover:brightness-110 active:brightness-95 cursor-pointer
        `}
        title={`Chuyển sang mode ${isReal ? 'Hóa đơn' : 'Thực tế'}`}
      >
        {isReal ? (
          <Package size={18} className="shrink-0" />
        ) : (
          <FileText size={18} className="shrink-0" />
        )}
        <span className="hidden sm:inline">{config.name}</span>
        <ArrowLeftRight size={14} className="opacity-70" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Mode Label */}
      <div className={`
        hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-300
        ${isReal
          ? 'bg-blue-50 text-blue-700'
          : 'bg-amber-50 text-amber-700'
        }
      `}>
        {isReal ? <Package size={16} /> : <FileText size={16} />}
        <span>Mode: {config.name}</span>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={toggleMode}
        disabled={isTransitioning}
        className={`
          relative flex items-center w-[140px] h-10 p-1 rounded-full cursor-pointer
          transition-all duration-300
          ${isTransitioning ? 'opacity-70' : 'opacity-100'}
          bg-gray-100 border-2
          ${isReal ? 'border-blue-300' : 'border-amber-300'}
        `}
        role="switch"
        aria-checked={!isReal}
        aria-label="Chuyển đổi mode"
      >
        {/* Labels - chỉ hiện text, không có icon */}
        <span className={`
          absolute left-4 text-xs font-semibold transition-colors z-0
          ${isReal ? 'text-transparent' : 'text-gray-400'}
        `}>
          TT
        </span>
        <span className={`
          absolute right-3 text-xs font-semibold transition-colors z-0
          ${!isReal ? 'text-transparent' : 'text-gray-400'}
        `}>
          HĐ
        </span>

        {/* Sliding Indicator - chứa icon và text */}
        <div
          className={`
            absolute w-[66px] h-8 rounded-full z-10
            transition-all duration-300 ease-out
            flex items-center justify-center gap-1.5
            ${isReal
              ? 'left-1 bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40'
              : 'left-[69px] bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/40'
            }
          `}
        >
          {isReal ? (
            <>
              <Package size={14} className="text-white" />
              <span className="text-white text-xs font-semibold">TT</span>
            </>
          ) : (
            <>
              <FileText size={14} className="text-white" />
              <span className="text-white text-xs font-semibold">HĐ</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
};

// Floating Mode Indicator - hiển thị cố định ở góc màn hình
export const ModeIndicator = () => {
  const { mode, config, toggleMode } = useMode();
  const isReal = mode === MODES.REAL;

  return (
    <button
      onClick={toggleMode}
      className={`
        fixed bottom-24 lg:bottom-6 right-4 z-40
        flex items-center gap-2 px-4 py-2.5 rounded-full
        font-semibold text-sm
        transition-all duration-300 cursor-pointer
        shadow-xl hover:shadow-2xl hover:brightness-110 active:brightness-95
        ${isReal
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/40'
          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/40'
        }
      `}
      title={`Đang ở mode ${config.name} - Click để chuyển`}
    >
      {isReal ? (
        <>
          <Package size={18} />
          <span>Thực tế</span>
        </>
      ) : (
        <>
          <FileText size={18} />
          <span>Hóa đơn</span>
        </>
      )}
      <ArrowLeftRight size={14} className="opacity-70 ml-1" />
    </button>
  );
};

// Mode Banner - hiển thị ở đầu trang khi ở mode Invoice
export const ModeBanner = () => {
  const { mode, toggleMode } = useMode();

  if (mode === MODES.REAL) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
      <div className="page-container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} />
          <span className="font-medium text-sm">
            Đang ở chế độ <strong>Hóa đơn</strong> - Dữ liệu sổ sách thuế
          </span>
        </div>
        <button
          onClick={toggleMode}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors cursor-pointer"
        >
          Chuyển về Thực tế
        </button>
      </div>
    </div>
  );
};

export default ModeToggle;
