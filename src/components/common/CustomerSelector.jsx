import React from 'react';
import { Pencil, ChevronRight, User } from 'lucide-react';
import { CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

/**
 * Common component for selecting customers/suppliers
 * Used in both CreateOrderPage and CreatePurchasePage
 *
 * Supports two display modes:
 * - 'full': Shows full list with title (default, for selection)
 * - 'compact': Shows only selected customer in a compact bar (for sticky header)
 */
export const CustomerSelector = ({
  title = 'Chọn khách hàng',
  selectedCustomer,
  customers,
  onSelect,
  onDeselect,
  emptyMessage = 'Chưa có khách hàng nào',
  emptyActionLabel = 'Thêm khách hàng',
  onEmptyAction,
  bgColor = 'violet',
  displayMode = 'full', // 'full' | 'compact'
}) => {
  const colorClasses = {
    violet: {
      bg: 'bg-violet-50',
      hover: 'hover:bg-violet-100',
      border: 'border-violet-200',
      text: 'text-violet-700',
      icon: 'text-violet-500',
    },
    emerald: {
      bg: 'bg-emerald-50',
      hover: 'hover:bg-emerald-100',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: 'text-emerald-500',
    },
    rose: {
      bg: 'bg-rose-50',
      hover: 'hover:bg-rose-100',
      border: 'border-rose-200',
      text: 'text-rose-700',
      icon: 'text-rose-500',
    },
    amber: {
      bg: 'bg-amber-50',
      hover: 'hover:bg-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-500',
    },
    blue: {
      bg: 'bg-blue-50',
      hover: 'hover:bg-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-500',
    },
  };

  const colors = colorClasses[bgColor] || colorClasses.violet;

  // Compact mode: only show selected customer in a single line
  if (displayMode === 'compact' && selectedCustomer) {
    return (
      <div className={`flex items-center justify-between px-4 py-3 ${colors.bg} border-b ${colors.border}`}>
        <button
          onClick={onDeselect}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className={`w-8 h-8 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}>
            <User size={16} className={colors.icon} />
          </div>
          <div className="text-left">
            <p className={`font-medium ${colors.text}`}>{selectedCustomer.short_name || selectedCustomer.full_name || selectedCustomer.name || 'Không tên'}</p>
            {selectedCustomer.phone && <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>}
          </div>
        </button>
        <button
          onClick={onDeselect}
          className={`flex items-center gap-1.5 px-3 py-1.5 ${colors.hover} rounded-lg transition-colors text-sm ${colors.text}`}
        >
          <Pencil size={14} />
          <span>Đổi khách</span>
        </button>
      </div>
    );
  }

  // Full mode: show title and list/selected customer
  return (
    <>
      <CardTitle>{title}</CardTitle>

      {selectedCustomer ? (
        <div className={`flex items-center justify-between p-3 ${colors.bg} rounded-xl mt-3`}>
          <button
            onClick={onDeselect}
            className="text-left hover:opacity-80 transition-opacity"
          >
            <p className="font-medium text-gray-800">{selectedCustomer.short_name || selectedCustomer.full_name || selectedCustomer.name || 'Không tên'}</p>
            {selectedCustomer.phone && <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>}
          </button>
          <button
            onClick={onDeselect}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${colors.hover} rounded-lg transition-colors text-sm ${colors.text}`}
          >
            <Pencil size={14} />
            <span>Đổi khách</span>
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto">
          {customers.length > 0 ? (
            customers.map(customer => (
              <button
                key={customer.id}
                onClick={() => onSelect(customer)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-800">{customer.short_name || customer.full_name || customer.name || 'Không tên'}</p>
                  {customer.phone && <p className="text-xs text-gray-500">{customer.phone}</p>}
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-3">{emptyMessage}</p>
              {onEmptyAction && (
                <Button variant="secondary" onClick={onEmptyAction}>
                  {emptyActionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CustomerSelector;
