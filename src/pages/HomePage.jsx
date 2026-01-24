import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, TrendingUp, CreditCard, Bell, Plus, Package,
  ChevronRight, Calendar, FileText, ArrowLeftRight, X, Copy
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useVoiceContext } from '../contexts/VoiceContext';
import { useMode } from '../contexts/ModeContext';
import { Card } from '../components/ui/Card';
import { VoiceCommandsPanel } from '../components/voice/VoiceCommandsPanel';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

const HomePage = () => {
  const navigate = useNavigate();
  const { startListening, isSupported } = useVoiceContext();
  const { isInvoiceMode, toggleMode, config } = useMode();
  const [viewingOrder, setViewingOrder] = useState(null);

  const {
    orders,
    invoiceOrders,
    customers,
    products,
    getTodayRevenue,
    getTodayOrders,
    getTotalDebt,
    getOverdueOrders,
    getInvoiceTodayRevenue,
    getInvoiceTodayOrders,
    getInvoiceTotalDebt,
    getInvoiceOverdueOrders,
    // Cart actions for copy
    setSelectedCustomer,
    clearCart,
    addToCart,
    updateCartItemDiscount,
    updateCartItemPrice,
    // Invoice cart actions
    setInvoiceSelectedCustomer,
    clearInvoiceCart,
    addToInvoiceCart,
    updateInvoiceCartItemPrice,
  } = useStore();

  // Mode-specific data
  const currentOrders = isInvoiceMode ? invoiceOrders : orders;
  const todayRevenue = isInvoiceMode ? getInvoiceTodayRevenue() : getTodayRevenue();
  const todayOrdersData = isInvoiceMode ? getInvoiceTodayOrders() : getTodayOrders();
  const totalDebt = isInvoiceMode ? getInvoiceTotalDebt() : getTotalDebt();
  const overdueOrders = isInvoiceMode ? getInvoiceOverdueOrders() : getOverdueOrders();
  const unpaidOrders = currentOrders.filter(o => !o.paid);

  const handleCopyOrder = (order) => {
    if (isInvoiceMode) {
      clearInvoiceCart();
      const customer = order.customer || customers.find(c => String(c.id) === String(order.customer_id));
      if (customer) {
        setInvoiceSelectedCustomer(customer);
      }
      const items = order.order_items || order.items || [];
      items.forEach(item => {
        const product = item.product || products.find(p => String(p.id) === String(item.product_id));
        if (product) {
          addToInvoiceCart(product, item.quantity);
          updateInvoiceCartItemPrice(product.id, item.unit_price);
        }
      });
    } else {
      clearCart();
      const customer = order.customer || customers.find(c => String(c.id) === String(order.customer_id));
      if (customer) {
        setSelectedCustomer(customer);
      }
      const items = order.order_items || order.items || [];
      items.forEach(item => {
        const product = item.product || products.find(p => String(p.id) === String(item.product_id));
        if (product) {
          addToCart(product, item.quantity);
          updateCartItemPrice(product.id, item.unit_price);
          if (item.discount && item.discount > 0) {
            updateCartItemDiscount(product.id, item.discount, item.discountType || 'percent');
          }
        }
      });
    }

    setViewingOrder(null);
    navigate('/create-order');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isInvoiceMode ? 'bg-rose-50/50' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 backdrop-blur-lg border-b px-4 lg:px-8 z-20 transition-colors duration-300 ${
        isInvoiceMode ? 'bg-rose-100/80 border-rose-200' : 'bg-white/80 border-gray-100'
      }`}>
        <div className="page-container flex items-center justify-between h-16">
          <h1 className={`text-xl font-bold ${isInvoiceMode ? 'text-rose-800' : 'text-gray-800'}`}>
            Trang chủ
          </h1>

          <div className="flex items-center gap-3">
            {/* Mode Toggle Button */}
            <button
              onClick={toggleMode}
              className={`
                px-3 py-2 rounded-xl font-medium text-sm flex items-center gap-2
                transition-all duration-300 hover:shadow-lg active:scale-95
                ${isInvoiceMode
                  ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-rose-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30'
                }
              `}
              title={`Chuyển sang mode ${isInvoiceMode ? 'Thực tế' : 'Hóa đơn'}`}
            >
              {isInvoiceMode ? <FileText size={18} /> : <Package size={18} />}
              <span className="hidden sm:inline">{config.name}</span>
              <ArrowLeftRight size={14} className="opacity-70" />
            </button>

            {/* Mobile Voice Button */}
            {isSupported && (
              <button
                onClick={startListening}
                className="lg:hidden px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Bật giọng nói"
              >
                <Mic size={18} aria-hidden="true" />
                <span className="text-sm">Voice</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mode Banner */}
      <div className={`
        px-4 py-3 transition-all duration-300
        ${isInvoiceMode
          ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white'
          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
        }
      `}>
        <div className="page-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              {isInvoiceMode ? <FileText size={22} /> : <Package size={22} />}
            </div>
            <div>
              <p className="font-semibold">
                {isInvoiceMode ? 'Chế độ Hóa đơn' : 'Chế độ Thực tế'}
              </p>
              <p className="text-sm opacity-90">
                {isInvoiceMode
                  ? 'Dữ liệu sổ sách thuế - Giá hóa đơn'
                  : 'Dữ liệu thực tế - Giá bán thực'
                }
              </p>
            </div>
          </div>
          <button
            onClick={toggleMode}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
          >
            Chuyển mode
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6">
        <div className="page-container space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`${isInvoiceMode ? 'border-rose-200 bg-white' : 'border-blue-200 bg-white'}`}>
              <div className={`flex items-center gap-2 mb-2 ${isInvoiceMode ? 'text-rose-400' : 'text-blue-400'}`}>
                <TrendingUp size={18} />
                <span className="text-xs">Doanh thu hôm nay</span>
              </div>
              <p className={`text-xl font-bold ${isInvoiceMode ? 'text-rose-700' : 'text-blue-700'}`}>
                {formatCurrency(todayRevenue)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {todayOrdersData.length} đơn hàng
              </p>
              <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                isInvoiceMode ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {isInvoiceMode ? <FileText size={12} /> : <Package size={12} />}
                {isInvoiceMode ? 'Hóa đơn' : 'Thực tế'}
              </div>
            </Card>

            <Card className={`${isInvoiceMode ? 'border-rose-200 bg-white' : 'border-blue-200 bg-white'}`}>
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <CreditCard size={18} />
                <span className="text-xs">Tổng công nợ</span>
              </div>
              <p className="text-xl font-bold text-rose-500">
                {formatCurrency(totalDebt)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {unpaidOrders.length} đơn chưa thanh toán
              </p>
              <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                isInvoiceMode ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {isInvoiceMode ? <FileText size={12} /> : <Package size={12} />}
                {isInvoiceMode ? 'Hóa đơn' : 'Thực tế'}
              </div>
            </Card>
          </div>

          {/* Two Column Layout - Desktop */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Overdue Alert */}
              {overdueOrders.length > 0 && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-rose-600 mb-2">
                    <Bell size={20} />
                    <span className="font-semibold">Cảnh báo nợ quá hạn</span>
                  </div>
                  <p className="text-sm text-rose-600 mb-3">
                    Có {overdueOrders.length} đơn hàng quá hạn trên 30 ngày
                  </p>
                  <button
                    onClick={() => navigate('/debt')}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl font-medium text-sm hover:bg-rose-700 transition-colors flex items-center gap-2"
                  >
                    Xem chi tiết <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              <Card className={isInvoiceMode ? 'border-rose-200' : ''}>
                <h2 className={`font-semibold mb-4 text-lg ${isInvoiceMode ? 'text-rose-800' : 'text-gray-800'}`}>
                  Thao tác nhanh
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/create-order')}
                    className={`flex items-center gap-3 p-4 rounded-xl hover:shadow-lg transition-all border-2 ${
                      isInvoiceMode
                        ? 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-200 hover:border-rose-300'
                        : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      isInvoiceMode
                        ? 'bg-gradient-to-br from-rose-500 to-red-600'
                        : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    }`}>
                      <Plus size={24} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Tạo đơn</p>
                      <p className="text-xs text-gray-600">
                        {isInvoiceMode ? 'Đơn hóa đơn' : 'Đơn thực tế'}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/products')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl hover:shadow-lg transition-all border-2 border-amber-200 hover:border-amber-300"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Package size={24} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Sản phẩm</p>
                      <p className="text-xs text-gray-600">Quản lý kho</p>
                    </div>
                  </button>
                </div>
              </Card>

              {/* Voice Commands Panel */}
              <VoiceCommandsPanel />
            </div>

            {/* Right Column - Recent Orders */}
            <Card className={`lg:row-span-2 ${isInvoiceMode ? 'border-rose-200' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className={`font-semibold text-lg ${isInvoiceMode ? 'text-rose-800' : 'text-gray-800'}`}>
                    Đơn hàng gần đây
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isInvoiceMode ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {isInvoiceMode ? 'Hóa đơn' : 'Thực tế'}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/orders')}
                  className={`text-sm font-medium flex items-center gap-1 ${
                    isInvoiceMode ? 'text-rose-600 hover:text-rose-700' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Xem tất cả
                  <ChevronRight size={16} />
                </button>
              </div>

              {currentOrders.length > 0 ? (
                <div className="space-y-2">
                  {currentOrders.slice(0, 8).map(order => (
                    <div
                      key={order.id}
                      onClick={() => setViewingOrder(order)}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors border cursor-pointer ${
                        isInvoiceMode
                          ? 'hover:bg-rose-50 border-rose-100'
                          : 'hover:bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {order.customer?.name || order.customer_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar size={12} />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold mb-1 ${isInvoiceMode ? 'text-rose-700' : 'text-gray-900'}`}>
                          {formatCurrency(order.total)}
                        </p>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${order.paid
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                          }`}>
                          {order.paid ? '✓ Đã thanh toán' : '◷ Chưa thanh toán'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  {isInvoiceMode ? (
                    <FileText size={48} className="mx-auto text-rose-300 mb-3" />
                  ) : (
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                  )}
                  <p className={`font-medium ${isInvoiceMode ? 'text-rose-500' : 'text-gray-500'}`}>
                    Chưa có đơn hàng {isInvoiceMode ? 'hóa đơn' : 'thực tế'} nào
                  </p>
                  <button
                    onClick={() => navigate('/create-order')}
                    className={`mt-4 px-4 py-2 text-white rounded-xl text-sm font-medium transition-colors ${
                      isInvoiceMode
                        ? 'bg-rose-500 hover:bg-rose-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Tạo đơn đầu tiên
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* View Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateTime(viewingOrder.created_at)} • #{viewingOrder.id}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Customer Info */}
              <div className={`mb-6 p-4 rounded-xl ${isInvoiceMode ? 'bg-rose-50' : 'bg-violet-50'}`}>
                <h4 className="font-semibold text-gray-900 mb-2">Khách hàng</h4>
                <p className="text-gray-700">
                  {viewingOrder.customer?.name || viewingOrder.customer_name || customers.find(c => String(c.id) === String(viewingOrder.customer_id))?.name || 'N/A'}
                </p>
                {(viewingOrder.customer?.phone || customers.find(c => String(c.id) === String(viewingOrder.customer_id))?.phone) && (
                  <p className="text-sm text-gray-600 mt-1">
                    ☎ {viewingOrder.customer?.phone || customers.find(c => String(c.id) === String(viewingOrder.customer_id))?.phone}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {(viewingOrder.items || viewingOrder.order_items || []).map((item, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.product_name || item.product?.name}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>SL: {item.quantity}</span>
                        <span>•</span>
                        <span>Đơn giá: {formatCurrency(item.unit_price)}</span>
                        {item.discount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600">
                              Giảm: {item.discount}{item.discountType === 'percent' ? '%' : 'đ'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t-2 border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">TỔNG CỘNG:</span>
                  <span className={`text-2xl font-bold ${isInvoiceMode ? 'text-rose-600' : 'text-violet-600'}`}>
                    {formatCurrency(viewingOrder.total)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Trạng thái thanh toán:</span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    viewingOrder.paid
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {viewingOrder.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
                {viewingOrder.paid && viewingOrder.paid_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    Thanh toán lúc: {formatDateTime(viewingOrder.paid_at)}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => handleCopyOrder(viewingOrder)}
                className={`flex-1 px-4 py-2 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  isInvoiceMode
                    ? 'bg-rose-500 hover:bg-rose-600'
                    : 'bg-violet-500 hover:bg-violet-600'
                }`}
              >
                <Copy size={18} />
                Copy đơn hàng
              </button>
              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
