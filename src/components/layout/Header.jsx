import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMode, MODES } from '../../contexts/ModeContext';
import { ModeToggle } from '../mode/ModeToggle';

export const Header = ({ title, showBack = false, rightElement = null, showModeToggle = true }) => {
  const navigate = useNavigate();
  const { mode, config, isTransitioning } = useMode();

  const isInvoice = mode === MODES.INVOICE;

  return (
    <>
      {/* Invoice Mode Banner */}
      {isInvoice && (
        <div className={`
          bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2
          transition-all duration-300
          ${isTransitioning ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}
        `}>
          <div className="page-container flex items-center justify-center gap-2 text-sm">
            <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>Chế độ <strong>Hóa đơn</strong> - Sổ sách thuế</span>
          </div>
        </div>
      )}

      <header className={`
        sticky top-0 backdrop-blur-lg border-b px-4 lg:px-8 z-20
        transition-all duration-300 shadow-sm
        ${isInvoice
          ? 'bg-amber-50/90 border-amber-200/80'
          : 'bg-white/85 border-gray-200/60'
        }
      `}>
        <div className="page-container flex items-center justify-between h-16 gap-4">
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className={`
                  p-2 -ml-2 rounded-xl transition-colors cursor-pointer
                  focus-visible:outline-none focus-visible:ring-2
                  ${isInvoice
                    ? 'hover:bg-amber-100 focus-visible:ring-amber-500'
                    : 'hover:bg-gray-100 focus-visible:ring-blue-500'
                  }
                `}
                aria-label="Quay lại"
              >
                <ArrowLeft
                  size={24}
                  className={isInvoice ? 'text-amber-600' : 'text-gray-600'}
                  aria-hidden="true"
                />
              </button>
            )}
            <div className="min-w-0">
              <h1 className={`
                text-xl font-bold truncate
                ${isInvoice ? 'text-amber-800' : 'text-gray-800'}
              `}>
                {title}
              </h1>
              {/* Mode subtitle on mobile */}
              <p className={`
                text-xs font-medium md:hidden
                ${isInvoice ? 'text-amber-500' : 'text-blue-500'}
              `}>
                {config.name}
              </p>
            </div>
          </div>

          {/* Right: Mode Toggle + Custom Element */}
          <div className="flex items-center gap-3 shrink-0">
            {showModeToggle && <ModeToggle />}
            {rightElement}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
