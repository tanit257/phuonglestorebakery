import React from 'react';
import { Plus, Check } from 'lucide-react';
import { CardTitle } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

/**
 * Common component for selecting products
 * Used in both CreateOrderPage and CreatePurchasePage
 */
export const ProductSelector = ({
  title = 'Chọn sản phẩm',
  products,
  searchTerm,
  onSearchChange,
  onProductSelect,
  showStock = true,
  plusButtonColor = 'violet',
  isInvoiceMode = false,
  customerPriceCache = {}, // { product_id: { lastPrice, lastSoldAt } }
}) => {
  const colorClasses = {
    violet: 'bg-violet-500 hover:bg-violet-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
    rose: 'bg-rose-500 hover:bg-rose-600',
    amber: 'bg-amber-500 hover:bg-amber-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
  };

  const buttonColor = colorClasses[plusButtonColor] || colorClasses.violet;

  const iconColorMap = {
    violet: 'text-violet-500',
    emerald: 'text-emerald-500',
    rose: 'text-rose-500',
    amber: 'text-amber-500',
    blue: 'text-blue-500',
  };
  const iconColor = iconColorMap[plusButtonColor] || iconColorMap.violet;

  return (
    <>
      <CardTitle>{title}</CardTitle>

      <SearchInput
        placeholder="Tìm sản phẩm..."
        value={searchTerm}
        onChange={onSearchChange}
        className="mt-3"
      />

      <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto">
        {products.map(product => {
          const priceInfo = customerPriceCache[product.id];
          const hasHistory = priceInfo !== undefined;
          const lastPrice = priceInfo?.lastPrice;
          const defaultPrice = product.price;

          return (
            <button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-gray-200/60 transition-all cursor-pointer"
            >
              <div className="text-left flex-1">
                <p className="font-medium text-gray-800">
                  {isInvoiceMode && product.invoice_name ? product.invoice_name : product.name}
                </p>

                {/* Price display with customer history */}
                <div className="flex items-center gap-2 text-xs mt-1">
                  {hasHistory ? (
                    <>
                      <span
                        className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 cursor-help relative group"
                        title={`Bán lần cuối: ${formatDateTime(priceInfo.lastSoldAt)}`}
                      >
                        <span className="text-emerald-700 font-bold">
                          {formatCurrency(lastPrice)}
                        </span>
                        <Check size={12} className="text-emerald-600 inline" />
                        <span className="text-emerald-600">Giá gần nhất</span>

                        {/* Tooltip */}
                        <span className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg">
                          Bán lần cuối: {formatDateTime(priceInfo.lastSoldAt)}
                          <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                        </span>
                      </span>
                      {lastPrice !== defaultPrice && (
                        <span className="text-gray-400 text-xs line-through">
                          {formatCurrency(defaultPrice)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {formatCurrency(defaultPrice)}
                    </span>
                  )}

                  {showStock && (
                    <span className="text-gray-500">
                      • Tồn: {product.stock}{product.unit || ''}
                    </span>
                  )}

                  {product.bulk_unit && product.bulk_quantity && (
                    <span className="text-gray-500">
                      • {product.bulk_quantity}{product.unit}/{product.bulk_unit}
                    </span>
                  )}
                </div>
              </div>
              <Plus size={18} className={`${iconColor} flex-shrink-0`} />
            </button>
          );
        })}

        {products.length === 0 && (
          <p className="text-center text-gray-400 py-4">
            Không tìm thấy sản phẩm
          </p>
        )}
      </div>
    </>
  );
};

export default ProductSelector;
