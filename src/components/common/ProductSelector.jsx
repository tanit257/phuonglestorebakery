import React from 'react';
import { Plus } from 'lucide-react';
import { CardTitle } from '../ui/Card';
import { SearchInput } from '../ui/Input';
import { formatCurrency } from '../../utils/formatters';

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
}) => {
  const colorClasses = {
    violet: 'bg-violet-500 hover:bg-violet-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
  };

  const buttonColor = colorClasses[plusButtonColor] || colorClasses.violet;

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
        {products.map(product => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
          >
            <div className="text-left flex-1">
              <p className="font-medium text-gray-800">{product.name}</p>
              <p className="text-xs text-gray-500">
                Giá bán: {formatCurrency(product.price)}
                {showStock && ` • Tồn kho: ${product.stock}`}
              </p>
            </div>
            <Plus size={18} className={`${buttonColor.includes('violet') ? 'text-violet-500' : 'text-emerald-500'} flex-shrink-0`} />
          </button>
        ))}

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
