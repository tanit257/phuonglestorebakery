import { useState, useMemo, useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { STORE_INFO } from '../../utils/constants';

export const PrintInventoryReport = ({
  month,
  isInvoiceMode,
  purchases,
  orders,
  onClose,
}) => {
  const [paperSize, setPaperSize] = useState('A4');

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter and sort data for the selected month
  const { filteredPurchases, filteredOrders, purchaseTotal, orderTotal } = useMemo(() => {
    const [year, monthNum] = month.split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const filterByMonth = (items) =>
      (items || [])
        .filter((item) => {
          const date = new Date(item.created_at);
          return date >= startOfMonth && date <= endOfMonth;
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const filteredPurchases = filterByMonth(purchases);
    const filteredOrders = filterByMonth(orders);

    return {
      filteredPurchases,
      filteredOrders,
      purchaseTotal: filteredPurchases.reduce((sum, p) => sum + (p.total || 0), 0),
      orderTotal: filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    };
  }, [month, purchases, orders]);

  // Format month for display
  const formatMonthDisplay = (monthStr) => {
    const [year, monthNum] = monthStr.split('-');
    return `Tháng ${monthNum}/${year}`;
  };

  // Get items from purchase/order
  const getItems = (record, type) => {
    const items = type === 'purchase'
      ? (record.purchase_items || record.items || [])
      : (record.order_items || record.items || []);
    return items;
  };

  // Format items for display
  const formatItemsSummary = (items) => {
    if (!items || items.length === 0) return '-';
    return items
      .map((item) => `${item.product_name || item.product?.name || 'SP'} (${item.quantity})`)
      .join(', ');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-report-title"
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - No Print */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between no-print">
          <div>
            <h2 id="print-report-title" className="text-xl font-bold text-gray-900">
              Báo cáo xuất nhập hàng
            </h2>
            <p className="text-sm text-gray-500 mt-1">{formatMonthDisplay(month)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Controls - No Print */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-4 no-print">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Khổ giấy:</label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 ${
                isInvoiceMode ? 'focus:ring-blue-500' : 'focus:ring-emerald-500'
              }`}
            >
              <option value="A4">A4 (210 x 297 mm)</option>
              <option value="A5">A5 (148 x 210 mm)</option>
            </select>
          </div>
          <div className="flex-1 text-sm text-gray-500">
            {filteredPurchases.length} phiếu nhập, {filteredOrders.length} đơn xuất
          </div>
        </div>

        {/* Print Content Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 print-preview-wrapper">
          <div
            id="print-inventory-report"
            className={`bg-white mx-auto shadow-lg ${
              paperSize === 'A4' ? 'max-w-[210mm]' : 'max-w-[148mm]'
            }`}
            style={{ padding: paperSize === 'A4' ? '15mm' : '10mm' }}
          >
            {/* Store Header */}
            <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{STORE_INFO.name}</h1>
              <p className="text-sm text-gray-600">{STORE_INFO.address}</p>
              <p className="text-sm text-gray-600">
                SĐT: {STORE_INFO.phone} | Email: {STORE_INFO.email}
              </p>
            </div>

            {/* Report Title */}
            <h2 className="text-xl font-bold text-center mb-2 uppercase">
              Báo cáo xuất nhập hàng
            </h2>
            <p className="text-center text-gray-600 mb-6">
              {formatMonthDisplay(month)} • {isInvoiceMode ? 'Sổ hóa đơn' : 'Sổ thực tế'}
            </p>

            {/* Section 1: Purchases */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
                I. NHẬP HÀNG ({filteredPurchases.length} phiếu)
              </h3>
              {filteredPurchases.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-800">
                      <th className="text-left py-2 font-semibold w-10">STT</th>
                      <th className="text-left py-2 font-semibold w-24">Ngày</th>
                      <th className="text-left py-2 font-semibold">Nhà cung cấp</th>
                      <th className="text-left py-2 font-semibold">Chi tiết</th>
                      <th className="text-right py-2 font-semibold w-28">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase, idx) => (
                      <tr key={purchase.id} className="border-b border-gray-200">
                        <td className="py-2">{idx + 1}</td>
                        <td className="py-2">{formatDate(purchase.created_at)}</td>
                        <td className="py-2">{purchase.supplier_name || 'N/A'}</td>
                        <td className="py-2 text-xs">
                          {formatItemsSummary(getItems(purchase, 'purchase'))}
                        </td>
                        <td className="py-2 text-right font-medium">
                          {formatCurrency(purchase.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-800">
                      <td colSpan="4" className="py-2 text-right font-bold">
                        Tổng nhập:
                      </td>
                      <td className="py-2 text-right font-bold text-emerald-600">
                        {formatCurrency(purchaseTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="text-gray-500 italic py-4">
                  Không có phiếu nhập trong tháng này
                </p>
              )}
            </div>

            {/* Section 2: Orders */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
                II. XUẤT HÀNG ({filteredOrders.length} đơn)
              </h3>
              {filteredOrders.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-800">
                      <th className="text-left py-2 font-semibold w-10">STT</th>
                      <th className="text-left py-2 font-semibold w-24">Ngày</th>
                      <th className="text-left py-2 font-semibold">Khách hàng</th>
                      <th className="text-left py-2 font-semibold">Chi tiết</th>
                      <th className="text-right py-2 font-semibold w-28">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, idx) => (
                      <tr key={order.id} className="border-b border-gray-200">
                        <td className="py-2">{idx + 1}</td>
                        <td className="py-2">{formatDate(order.created_at)}</td>
                        <td className="py-2">{order.customer_name || 'N/A'}</td>
                        <td className="py-2 text-xs">
                          {formatItemsSummary(getItems(order, 'order'))}
                        </td>
                        <td className="py-2 text-right font-medium">
                          {formatCurrency(order.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-800">
                      <td colSpan="4" className="py-2 text-right font-bold">
                        Tổng xuất:
                      </td>
                      <td className="py-2 text-right font-bold text-blue-600">
                        {formatCurrency(orderTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="text-gray-500 italic py-4">
                  Không có đơn hàng trong tháng này
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="border-t-2 border-gray-800 pt-4">
              <h3 className="font-bold text-gray-800 mb-3">TỔNG KẾT</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tổng nhập hàng:</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(purchaseTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng xuất hàng:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Chênh lệch (Xuất - Nhập):</span>
                  <span
                    className={`font-bold ${
                      orderTotal - purchaseTotal >= 0
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {orderTotal - purchaseTotal >= 0 ? '+' : ''}
                    {formatCurrency(orderTotal - purchaseTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              <p>In lúc: {formatDateTime(new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions - No Print */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className={`px-6 py-2 text-white rounded-lg flex items-center gap-2 transition-colors ${
              isInvoiceMode
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            <Printer size={18} />
            In báo cáo
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-inventory-report,
          #print-inventory-report * {
            visibility: visible !important;
          }
          #print-inventory-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            padding: 10mm !important;
            margin: 0 !important;
            background: white !important;
          }
          #print-inventory-report table {
            page-break-inside: auto;
          }
          #print-inventory-report tr {
            page-break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: ${paperSize === 'A4' ? 'A4' : 'A5'};
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};

PrintInventoryReport.propTypes = {
  month: PropTypes.string.isRequired,
  isInvoiceMode: PropTypes.bool.isRequired,
  purchases: PropTypes.array.isRequired,
  orders: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};
