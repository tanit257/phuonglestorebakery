import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Common component for displaying cart items
 * Used in both CreateOrderPage and CreatePurchasePage
 */
export const CartItemList = ({
  items,
  onUpdateQuantity,
  onUpdatePrice,
  onUpdateDiscount,
  onRemove,
  showDiscount = false,
  priceLabel = 'Đơn giá',
  emptyMessage = 'Chưa có sản phẩm nào'
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div
          key={item.product_id}
          className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl"
        >
          {/* Header: Product name and remove button */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-800">{item.product_name}</p>
            </div>
            <button
              onClick={() => onRemove(item.product_id)}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Quantity and Price inputs */}
          <div className="grid grid-cols-2 gap-3">
            {/* Quantity Input */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Số lượng</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    onUpdateQuantity(item.product_id, value);
                  } else if (e.target.value === '') {
                    onUpdateQuantity(item.product_id, 1);
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value || parseFloat(e.target.value) <= 0) {
                    onUpdateQuantity(item.product_id, 1);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-medium"
                placeholder="1"
                min="0.01"
                step="any"
              />
            </div>

            {/* Price Input */}
            {onUpdatePrice && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{priceLabel}</label>
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      onUpdatePrice(item.product_id, value);
                    } else if (e.target.value === '') {
                      onUpdatePrice(item.product_id, 0);
                    }
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseFloat(e.target.value) < 0) {
                      onUpdatePrice(item.product_id, 0);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="any"
                />
              </div>
            )}
          </div>

          {/* Discount (optional) */}
          {showDiscount && onUpdateDiscount && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Giảm giá</label>
                <input
                  type="number"
                  value={item.discount || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      onUpdateDiscount(item.product_id, value, item.discountType);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="any"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Loại giảm</label>
                <select
                  value={item.discountType || 'percent'}
                  onChange={(e) => {
                    onUpdateDiscount(item.product_id, item.discount || 0, e.target.value);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percent">%</option>
                  <option value="fixed">VNĐ</option>
                </select>
              </div>
            </div>
          )}

          {/* Subtotal */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Thành tiền:</span>
            <span className="text-sm font-bold text-gray-800">
              {formatCurrency(item.subtotal)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartItemList;
