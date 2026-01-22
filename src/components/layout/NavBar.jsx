import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Package, CreditCard, Users, Truck } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Trang chủ' },
  { path: '/create-order', icon: ShoppingCart, label: 'Tạo đơn' },
  { path: '/purchases', icon: Truck, label: 'Nhập hàng' },
  { path: '/debt', icon: CreditCard, label: 'Công nợ' },
  { path: '/customers', icon: Users, label: 'Khách hàng' },
];

export const NavBar = () => {
  return (
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
      </div>
    </nav>
  );
};

export default NavBar;
