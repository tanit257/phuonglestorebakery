import { useState, useMemo } from 'react';
import { Package, ShoppingBag, TrendingUp, TrendingDown, ChevronDown, Search, Printer } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useMode } from '../contexts/ModeContext';
import { formatCurrency } from '../utils/formatters';
import QuickRetailModal from '../components/inventory/QuickRetailModal';
import InventoryDetailModal from '../components/inventory/InventoryDetailModal';
import { PrintInventoryReport } from '../components/print/PrintInventoryReport';

export default function InventoryReportPage() {
  const {
    products,
    getInventoryReport,
    getInvoiceInventoryReport,
    getAvailableMonths,
    getInvoiceAvailableMonths,
    orders,
    purchases,
    invoiceOrders,
    invoicePurchases,
  } = useStore();
  const { isInvoiceMode } = useMode();

  // Get current month as default
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRetailModal, setShowRetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Get available months
  const availableMonths = useMemo(() => {
    return isInvoiceMode ? getInvoiceAvailableMonths() : getAvailableMonths();
  }, [isInvoiceMode, getAvailableMonths, getInvoiceAvailableMonths]);

  // Get inventory report
  const report = useMemo(() => {
    return isInvoiceMode
      ? getInvoiceInventoryReport(selectedMonth)
      : getInventoryReport(selectedMonth);
  }, [selectedMonth, isInvoiceMode, getInventoryReport, getInvoiceInventoryReport]);

  // Filter by search term
  const filteredReport = useMemo(() => {
    if (!searchTerm) return report;
    return report.filter(item =>
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [report, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredReport.reduce(
      (acc, item) => ({
        purchased: acc.purchased + item.purchased,
        soldOrder: acc.soldOrder + item.soldOrder,
        soldRetail: acc.soldRetail + item.soldRetail,
      }),
      { purchased: 0, soldOrder: 0, soldRetail: 0 }
    );
  }, [filteredReport]);

  const formatMonthDisplay = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return `Tháng ${month}/${year}`;
  };

  const handleProductClick = (item) => {
    setSelectedProduct(item.product);
    setShowDetailModal(true);
  };

  const selectedReportData = useMemo(() => {
    if (!selectedProduct) return null;
    return report.find(item => String(item.product.id) === String(selectedProduct.id));
  }, [selectedProduct, report]);

  const themeColor = isInvoiceMode ? 'amber' : 'emerald';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className={`bg-gradient-to-r ${isInvoiceMode ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'} text-white p-4 pt-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            <h1 className="text-xl font-bold">Xuất nhập tồn</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintReport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In báo cáo</span>
            </button>
            <button
              onClick={() => setShowRetailModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bán lẻ nhanh</span>
            </button>
          </div>
        </div>

        {/* Month selector */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {availableMonths.map(month => (
              <option key={month} value={month} className="text-gray-800">
                {formatMonthDisplay(month)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 p-4 -mt-2">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200/60">
          <div className="flex items-center gap-1 text-emerald-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Nhập</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {totals.purchased.toFixed(1)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200/60">
          <div className="flex items-center gap-1 text-blue-600 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs">Xuất đơn</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {totals.soldOrder.toFixed(1)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200/60">
          <div className="flex items-center gap-1 text-amber-600 mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs">Xuất lẻ</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {totals.soldRetail.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table header */}
      <div className="px-4 mb-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-3">
          <div className="col-span-4">Sản phẩm</div>
          <div className="col-span-2 text-right">Đầu kỳ</div>
          <div className="col-span-2 text-right text-emerald-600">Nhập</div>
          <div className="col-span-2 text-right text-rose-600">Xuất</div>
          <div className="col-span-2 text-right">Cuối kỳ</div>
        </div>
      </div>

      {/* Products list */}
      <div className="px-4 space-y-2">
        {filteredReport.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có dữ liệu'}
          </div>
        ) : (
          filteredReport.map((item) => {
            const totalSold = item.soldOrder + item.soldRetail;
            const hasMovement = item.purchased > 0 || totalSold > 0;

            return (
              <div
                key={item.product.id}
                onClick={() => handleProductClick(item)}
                className={`bg-white rounded-xl p-3 shadow-sm border border-gray-200/60 cursor-pointer transition-all hover:shadow-md ${
                  hasMovement ? 'border-l-4 border-l-' + themeColor + '-500' : ''
                }`}
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <div className="font-medium text-gray-800 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.product.unit}
                    </div>
                  </div>
                  <div className="col-span-2 text-right text-gray-600">
                    {item.openingStock.toFixed(1)}
                  </div>
                  <div className="col-span-2 text-right">
                    {item.purchased > 0 ? (
                      <span className="text-emerald-600 font-medium">
                        +{item.purchased.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    {totalSold > 0 ? (
                      <div>
                        <span className="text-rose-600 font-medium">
                          -{totalSold.toFixed(1)}
                        </span>
                        {item.soldRetail > 0 && (
                          <div className="text-xs text-amber-600">
                            (lẻ: {item.soldRetail.toFixed(1)})
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`font-bold ${
                      item.closingStock <= 0 ? 'text-red-600' :
                      item.closingStock < 10 ? 'text-amber-600' :
                      'text-gray-800'
                    }`}>
                      {item.closingStock.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Retail Modal */}
      <QuickRetailModal
        isOpen={showRetailModal}
        onClose={() => setShowRetailModal(false)}
      />

      {/* Inventory Detail Modal */}
      <InventoryDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        month={selectedMonth}
        reportData={selectedReportData}
      />

      {/* Print Inventory Report Modal */}
      {showPrintReport && (
        <PrintInventoryReport
          month={selectedMonth}
          isInvoiceMode={isInvoiceMode}
          purchases={isInvoiceMode ? invoicePurchases : purchases}
          orders={isInvoiceMode ? invoiceOrders : orders}
          onClose={() => setShowPrintReport(false)}
        />
      )}
    </div>
  );
}
