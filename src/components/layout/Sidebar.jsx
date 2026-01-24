import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  FileText,
  Truck,
  TrendingUp,
  Warehouse,
  ArrowLeftRight,
  LogOut
} from 'lucide-react';
import { useMode, MODES } from '../../contexts/ModeContext';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode, config } = useMode();
  const { signOut, user } = useAuth();

  const isInvoice = mode === MODES.INVOICE;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/create-order', icon: ShoppingCart, label: 'Tạo đơn' },
    { path: '/orders', icon: FileText, label: 'Đơn hàng' },
    { path: '/create-purchase', icon: Truck, label: 'Nhập hàng' },
    { path: '/purchases', icon: Warehouse, label: 'Phiếu nhập' },
    { path: '/products', icon: Package, label: 'Sản phẩm' },
    { path: '/customers', icon: Users, label: 'Khách hàng' },
    { path: '/debt', icon: CreditCard, label: 'Công nợ' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`
      hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 border-r z-30
      transition-colors duration-300
      ${isInvoice
        ? 'bg-gradient-to-b from-violet-50 to-white border-violet-200'
        : 'bg-white border-gray-200'
      }
    `}>
      {/* Logo */}
      <div className={`
        px-6 py-5 border-b transition-colors duration-300
        ${isInvoice ? 'border-violet-200' : 'border-gray-200'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            transition-all duration-300
            ${isInvoice
              ? 'bg-gradient-to-br from-violet-500 to-purple-600'
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            }
          `}>
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`
              text-lg font-bold transition-colors duration-300
              ${isInvoice ? 'text-violet-900' : 'text-gray-900'}
            `}>
              Phương Lê
            </h1>
            <p className={`
              text-xs font-medium transition-colors duration-300
              ${isInvoice ? 'text-violet-500' : 'text-gray-500'}
            `}>
              Store Management
            </p>
          </div>
        </div>
      </div>

      {/* Mode Indicator */}
      <div className="px-3 py-3">
        <button
          onClick={toggleMode}
          className={`
            w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl
            font-medium text-sm transition-all duration-300
            ${isInvoice
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
            }
            hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
          `}
        >
          <div className="flex items-center gap-2">
            {isInvoice ? <FileText size={18} /> : <Package size={18} />}
            <span>{config.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs opacity-80">
            <ArrowLeftRight size={14} />
            <span className="hidden xl:inline">Chuyển</span>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  font-medium text-sm transition-all duration-200
                  ${active
                    ? isInvoice
                      ? 'bg-violet-100 text-violet-700 shadow-sm'
                      : 'bg-blue-100 text-blue-700 shadow-sm'
                    : isInvoice
                      ? 'text-violet-700 hover:bg-violet-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {active && (
                  <div className={`
                    ml-auto w-1.5 h-1.5 rounded-full
                    ${isInvoice ? 'bg-violet-500' : 'bg-blue-500'}
                  `} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={`
        px-3 py-4 border-t transition-colors duration-300
        ${isInvoice ? 'border-violet-200' : 'border-gray-200'}
      `}>
        {/* User info */}
        {user && (
          <div className={`
            mb-3 px-3 py-2 rounded-lg text-xs
            ${isInvoice ? 'bg-violet-50 text-violet-600' : 'bg-gray-50 text-gray-600'}
          `}>
            <p className="truncate font-medium">{user.email}</p>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleSignOut}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
            font-medium text-sm transition-all duration-200
            ${isInvoice
              ? 'text-violet-600 hover:bg-violet-100 border border-violet-200'
              : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
            }
          `}
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>

        {/* Copyright */}
        <div className={`
          text-xs text-center mt-3 transition-colors duration-300
          ${isInvoice ? 'text-violet-400' : 'text-gray-400'}
        `}>
          <p>© 2026 Phương Lê Store</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
