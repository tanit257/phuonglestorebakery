import { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  AlertTriangle,
  Check,
  Phone,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Eye,
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  User
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime } from '../utils/formatters';
import { OVERDUE_DAYS, CUSTOMER_TYPES, CUSTOMER_TYPE_LABELS } from '../utils/constants';

const DebtPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    orders,
    customers,
    markOrderAsPaid,
  } = useStore();

  // State
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to current month
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filter, setFilter] = useState('unpaid'); // 'unpaid' | 'paid' | 'all'
  const [viewingOrder, setViewingOrder] = useState(null);

  // Check if order is overdue (moved before useMemo that uses it)
  const isOverdue = (createdAt) => {
    const orderDate = new Date(createdAt);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - OVERDUE_DAYS);
    return orderDate < threshold;
  };

  // Set customer from URL params
  useEffect(() => {
    const customerParam = searchParams.get('customer');
    if (customerParam) {
      setSelectedCustomerId(customerParam);
    }
  }, [searchParams]);

  // Generate list of months from orders
  const availableMonths = useMemo(() => {
    const months = new Set();
    orders.forEach(order => {
      const date = new Date(order.created_at);
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months).sort().reverse();
  }, [orders]);

  // Get selected customer
  const selectedCustomer = useMemo(() => {
    return customers.find(c => String(c.id) === String(selectedCustomerId));
  }, [customers, selectedCustomerId]);

  // Calculate debt statistics for each customer
  const customersWithDebt = useMemo(() => {
    return customers
      .map(customer => {
        const customerOrders = orders.filter(
          o => String(o.customer_id) === String(customer.id) || String(o.customer?.id) === String(customer.id)
        );

        const unpaidOrders = customerOrders.filter(o => !o.paid);
        const currentDebt = unpaidOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = customerOrders.length;
        const overdueOrders = unpaidOrders.filter(o => isOverdue(o.created_at)).length;

        return {
          ...customer,
          currentDebt,
          unpaidOrdersCount: unpaidOrders.length,
          totalOrders,
          overdueOrders,
        };
      })
      .filter(c => c.totalOrders > 0) // Only show customers with orders
      .sort((a, b) => b.currentDebt - a.currentDebt);
  }, [customers, orders]);

  // Calculate period statistics for selected customer
  const periodStats = useMemo(() => {
    if (!selectedCustomer || selectedMonth === 'all') return null;

    const [year, month] = selectedMonth.split('-').map(Number);
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    // Get all orders for this customer
    const customerOrders = orders.filter(
      o => String(o.customer_id) === String(selectedCustomer.id) ||
           String(o.customer?.id) === String(selectedCustomer.id)
    );

    // Orders created before this period that were unpaid at period start
    const debtAtPeriodStart = customerOrders
      .filter(o => {
        const createdAt = new Date(o.created_at);
        // Created before period AND (not paid OR paid after period start)
        if (createdAt >= periodStart) return false;
        if (!o.paid) return true;
        const paidAt = new Date(o.paid_at);
        return paidAt >= periodStart;
      })
      .reduce((sum, o) => sum + o.total, 0);

    // Orders created during this period
    const ordersInPeriod = customerOrders.filter(o => {
      const createdAt = new Date(o.created_at);
      return createdAt >= periodStart && createdAt <= periodEnd;
    });
    const newDebtInPeriod = ordersInPeriod.reduce((sum, o) => sum + o.total, 0);

    // Payments made during this period (orders paid in this period)
    const paidInPeriod = customerOrders
      .filter(o => {
        if (!o.paid || !o.paid_at) return false;
        const paidAt = new Date(o.paid_at);
        return paidAt >= periodStart && paidAt <= periodEnd;
      })
      .reduce((sum, o) => sum + o.total, 0);

    // Current debt at end of period
    const debtAtPeriodEnd = debtAtPeriodStart + newDebtInPeriod - paidInPeriod;

    return {
      debtAtPeriodStart,
      newDebtInPeriod,
      paidInPeriod,
      debtAtPeriodEnd,
    };
  }, [selectedCustomer, selectedMonth, orders]);

  // Get filtered orders for selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];

    let filtered = orders.filter(
      o => String(o.customer_id) === String(selectedCustomer.id) ||
           String(o.customer?.id) === String(selectedCustomer.id)
    );

    // Filter by month
    if (selectedMonth !== 'all') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const periodStart = new Date(year, month - 1, 1);
      const periodEnd = new Date(year, month, 0, 23, 59, 59);

      filtered = filtered.filter(o => {
        const createdAt = new Date(o.created_at);
        const paidAt = o.paid_at ? new Date(o.paid_at) : null;

        // Include if created in period OR paid in period
        const createdInPeriod = createdAt >= periodStart && createdAt <= periodEnd;
        const paidInPeriod = paidAt && paidAt >= periodStart && paidAt <= periodEnd;

        return createdInPeriod || paidInPeriod;
      });
    }

    // Filter by payment status
    if (filter === 'unpaid') {
      filtered = filtered.filter(o => !o.paid);
    } else if (filter === 'paid') {
      filtered = filtered.filter(o => o.paid);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [selectedCustomer, orders, selectedMonth, filter]);

  // Total debt across all customers
  const totalDebt = useMemo(() => {
    return orders.filter(o => !o.paid).reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  // Handle customer selection
  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    setSearchParams({ customer: customerId });
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedCustomerId(null);
    setSearchParams({});
  };

  // Format month name
  const formatMonthName = (monthStr) => {
    if (monthStr === 'all') return 'Tất cả';
    return new Date(`${monthStr}-01`).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  // ========== CUSTOMER LIST VIEW ==========
  if (!selectedCustomerId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Công nợ" />

        <div className="px-4 lg:px-8 py-4 lg:py-6">
          <div className="page-container">
            {/* Total Debt Summary */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 text-rose-100 mb-1">
                <CreditCard size={20} />
                <span className="text-sm">Tổng công nợ hiện tại</span>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalDebt)}</p>
              <p className="text-rose-100 text-sm mt-2">
                {customersWithDebt.filter(c => c.currentDebt > 0).length} khách hàng còn nợ
              </p>
            </div>

            {/* Customer List */}
            <div className="space-y-3">
              {customersWithDebt.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer.id)}
                  className="w-full text-left"
                >
                  <Card className="hover:border-violet-300 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          customer.currentDebt > 0
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          <User size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800">{customer.short_name || customer.full_name || 'Không tên'}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              customer.type === CUSTOMER_TYPES.BAKERY
                                ? 'bg-violet-100 text-violet-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {CUSTOMER_TYPE_LABELS[customer.type] || 'Cá nhân'}
                            </span>
                          </div>
                          {customer.phone && (
                            <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{customer.totalOrders} đơn hàng</span>
                            {customer.overdueOrders > 0 && (
                              <span className="text-rose-500 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                {customer.overdueOrders} quá hạn
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {customer.currentDebt > 0 ? (
                            <>
                              <p className="text-lg font-bold text-rose-500">
                                {formatCurrency(customer.currentDebt)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {customer.unpaidOrdersCount} đơn chưa trả
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-emerald-500">
                              Không nợ
                            </p>
                          )}
                        </div>
                        <ArrowRight size={20} className="text-gray-300" />
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>

            {/* Empty State */}
            {customersWithDebt.length === 0 && (
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400">Chưa có dữ liệu công nợ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== CUSTOMER DETAIL VIEW ==========
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={`Công nợ: ${selectedCustomer?.short_name || selectedCustomer?.full_name || 'Khách hàng'}`}
        showBack
        onBack={handleBackToList}
      />

      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="page-container">
          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Quay lại danh sách</span>
          </button>

          {/* Customer Info */}
          <Card className="mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                selectedCustomer?.currentDebt > 0
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                <User size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-800">{selectedCustomer?.short_name || selectedCustomer?.full_name || 'Không tên'}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCustomer?.type === CUSTOMER_TYPES.BAKERY
                      ? 'bg-violet-100 text-violet-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {CUSTOMER_TYPE_LABELS[selectedCustomer?.type] || 'Cá nhân'}
                  </span>
                </div>
                {selectedCustomer?.phone && (
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="flex items-center gap-1 text-sm text-violet-600 mt-1"
                  >
                    <Phone size={14} />
                    {selectedCustomer.phone}
                  </a>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Nợ hiện tại</p>
                <p className="text-2xl font-bold text-rose-500">
                  {formatCurrency(
                    orders
                      .filter(o => (String(o.customer_id) === String(selectedCustomer?.id) ||
                                   String(o.customer?.id) === String(selectedCustomer?.id)) && !o.paid)
                      .reduce((sum, o) => sum + o.total, 0)
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Month Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xem theo tháng
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="all">Tất cả các tháng</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {formatMonthName(month)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Period Statistics */}
          {periodStats && selectedMonth !== 'all' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Thống kê {formatMonthName(selectedMonth)}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Nợ đầu kỳ</p>
                  <p className="text-sm font-bold text-gray-700">
                    {formatCurrency(periodStats.debtAtPeriodStart)}
                  </p>
                </div>
                <div className="text-center p-3 bg-rose-50 rounded-xl">
                  <p className="text-xs text-rose-600 mb-1 flex items-center justify-center gap-1">
                    <TrendingUp size={12} />
                    Phát sinh
                  </p>
                  <p className="text-sm font-bold text-rose-600">
                    +{formatCurrency(periodStats.newDebtInPeriod)}
                  </p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-600 mb-1 flex items-center justify-center gap-1">
                    <TrendingDown size={12} />
                    Đã trả
                  </p>
                  <p className="text-sm font-bold text-emerald-600">
                    -{formatCurrency(periodStats.paidInPeriod)}
                  </p>
                </div>
                <div className="text-center p-3 bg-violet-50 rounded-xl">
                  <p className="text-xs text-violet-600 mb-1">Còn nợ</p>
                  <p className="text-sm font-bold text-violet-600">
                    {formatCurrency(periodStats.debtAtPeriodEnd)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 bg-white p-1 rounded-xl border border-gray-200">
            {[
              { value: 'unpaid', label: 'Đang nợ' },
              { value: 'paid', label: 'Đã thanh toán' },
              { value: 'all', label: 'Tất cả' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.value
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {customerOrders.map(order => {
              const overdue = !order.paid && isOverdue(order.created_at);

              return (
                <Card
                  key={order.id}
                  className={overdue ? 'border-rose-200 bg-rose-50/50' : ''}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {formatDate(order.created_at)}
                        </span>
                        {overdue && (
                          <span className="flex items-center gap-1 text-xs text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={12} />
                            Quá hạn
                          </span>
                        )}
                        {order.paid && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check size={12} />
                            Đã trả
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(order.created_at)}
                      </p>
                      {order.paid && order.paid_at && (
                        <p className="text-xs text-emerald-600 mt-1">
                          Thanh toán: {formatDateTime(order.paid_at)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold font-tabular-nums ${
                        order.paid ? 'text-gray-400 line-through' : 'text-gray-800'
                      }`}>
                        {formatCurrency(order.total)}
                      </span>
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      {!order.paid && (
                        <button
                          onClick={() => markOrderAsPaid(order.id)}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          aria-label="Đánh dấu đã thanh toán"
                        >
                          <Check size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {customerOrders.length === 0 && (
            <div className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">
                {filter === 'unpaid'
                  ? 'Không có đơn nào đang nợ'
                  : filter === 'paid'
                    ? 'Không có đơn nào đã thanh toán'
                    : 'Không có đơn hàng nào'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(viewingOrder.created_at)} • #{viewingOrder.id}
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
              {/* Payment Status */}
              <div className={`mb-4 p-3 rounded-xl ${
                viewingOrder.paid
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-rose-50 border border-rose-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    viewingOrder.paid ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {viewingOrder.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                  {viewingOrder.paid && viewingOrder.paid_at && (
                    <span className="text-xs text-emerald-600">
                      {formatDateTime(viewingOrder.paid_at)}
                    </span>
                  )}
                </div>
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
                  <span className="text-2xl font-bold text-violet-600">
                    {formatCurrency(viewingOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              {!viewingOrder.paid && (
                <button
                  onClick={() => {
                    markOrderAsPaid(viewingOrder.id);
                    setViewingOrder(null);
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Đánh dấu đã thanh toán
                </button>
              )}
              <button
                onClick={() => setViewingOrder(null)}
                className={`${viewingOrder.paid ? 'flex-1' : ''} px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors`}
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

export default DebtPage;
