import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, CreditCard, Users, Truck, MoreHorizontal, LogOut, X, Package, FileText, Warehouse } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/', icon: Home, label: 'Trang chủ' },
  { path: '/create-order', icon: ShoppingCart, label: 'Tạo đơn' },
  { path: '/purchases', icon: Truck, label: 'Nhập hàng' },
  { path: '/debt', icon: CreditCard, label: 'Công nợ' },
];

const moreItems = [
  { path: '/orders', icon: FileText, label: 'Đơn hàng' },
  { path: '/create-purchase', icon: Warehouse, label: 'Tạo phiếu nhập' },
  { path: '/products', icon: Package, label: 'Sản phẩm' },
  { path: '/customers', icon: Users, label: 'Khách hàng' },
];

export const NavBar = () => {
  const [showMore, setShowMore] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 animate-slide-up">
            {/* User info */}
            {user && (
              <div className="px-3 py-2 mb-2 bg-violet-50 rounded-lg">
                <p className="text-xs text-violet-600 truncate font-medium">{user.email}</p>
              </div>
            )}

            {/* More navigation items */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {moreItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 p-3 rounded-xl transition-all
                    ${isActive
                      ? 'text-violet-600 bg-violet-50'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all border border-red-200"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-30 shadow-lg shadow-gray-900/5">
        <div className="max-w-lg mx-auto flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center py-2 px-3 rounded-xl transition-all
                ${isActive
                  ? 'text-violet-600 bg-violet-50'
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <item.icon size={24} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`
              flex flex-col items-center py-2 px-3 rounded-xl transition-all
              ${showMore
                ? 'text-violet-600 bg-violet-50'
                : 'text-gray-400 hover:text-gray-600'
              }
            `}
          >
            {showMore ? <X size={24} /> : <MoreHorizontal size={24} />}
            <span className="text-xs mt-1 font-medium">Thêm</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
