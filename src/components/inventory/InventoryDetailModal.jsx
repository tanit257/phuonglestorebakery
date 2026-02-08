import { useMemo } from 'react';
import { X, TrendingDown, TrendingUp, Package } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useMode } from '../../contexts/ModeContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { RETAIL_CUSTOMER_NAME } from '../../utils/constants';

export default function InventoryDetailModal({ isOpen, onClose, product, month, reportData }) {
  const { getProductMovements, getInvoiceProductMovements } = useStore();
  const { isInvoiceMode } = useMode();

  const movements = useMemo(() => {
    if (!product || !month) return { sales: [], purchases: [] };
    return isInvoiceMode
      ? getInvoiceProductMovements(product.id, month)
      : getProductMovements(product.id, month);
  }, [product, month, isInvoiceMode, getProductMovements, getInvoiceProductMovements]);

  const formatMonthDisplay = (monthStr) => {
    const [year, monthNum] = monthStr.split('-');
    return `Tháng ${monthNum}/${year}`;
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-semibold">
                {isInvoiceMode && product.invoice_name ? product.invoice_name : product.name}
              </h2>
              <p className="text-sm text-white/80">{formatMonthDisplay(month)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50">
          <div className="bg-white p-3 rounded-xl text-center">
            <div className="text-sm text-gray-500">Tồn đầu kỳ</div>
            <div className="text-lg font-bold text-gray-800">
              {reportData?.openingStock?.toFixed(1) || 0} {product.unit}
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl text-center">
            <div className="text-sm text-gray-500">Nhập</div>
            <div className="text-lg font-bold text-emerald-600">
              +{reportData?.purchased?.toFixed(1) || 0} {product.unit}
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl text-center">
            <div className="text-sm text-gray-500">Xuất</div>
            <div className="text-lg font-bold text-rose-600">
              -{((reportData?.soldOrder || 0) + (reportData?.soldRetail || 0)).toFixed(1)} {product.unit}
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl text-center">
            <div className="text-sm text-gray-500">Tồn cuối kỳ</div>
            <div className="text-lg font-bold text-blue-600">
              {reportData?.closingStock?.toFixed(1) || 0} {product.unit}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Sales section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-gray-800">
                Chi tiết xuất hàng ({movements.sales.length})
              </h3>
            </div>
            {movements.sales.length === 0 ? (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl">
                Không có xuất hàng trong tháng này
              </div>
            ) : (
              <div className="space-y-2">
                {movements.sales.map((sale, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-rose-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500 w-20">
                        {formatDate(sale.date)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {sale.customerName}
                        </div>
                        {sale.customerName === RETAIL_CUSTOMER_NAME && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            Bán lẻ
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-rose-600 font-medium">
                      -{sale.quantity} {product.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Purchases section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-800">
                Chi tiết nhập hàng ({movements.purchases.length})
              </h3>
            </div>
            {movements.purchases.length === 0 ? (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl">
                Không có nhập hàng trong tháng này
              </div>
            ) : (
              <div className="space-y-2">
                {movements.purchases.map((purchase, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500 w-20">
                        {formatDate(purchase.date)}
                      </div>
                      <div className="font-medium">
                        {purchase.supplierName}
                      </div>
                    </div>
                    <div className="text-emerald-600 font-medium">
                      +{purchase.quantity} {product.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
