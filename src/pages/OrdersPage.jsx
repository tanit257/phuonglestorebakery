import React, { useState } from 'react';
import { Package, Check, Trash2, ChevronDown, ChevronUp, Edit, X, Printer, Eye, Copy, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { useMode } from '../contexts/ModeContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { PrintPreview } from '../components/print/PrintPreview';
import { CUSTOMER_TYPE_LABELS } from '../utils/constants';

const OrderItem = ({ order, onMarkAsPaid, onMarkAsUnpaid, onDelete, onEdit, onPrint, onView, customers, isInvoiceMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const items = order.order_items || order.items || [];
  const customer = order.customer || customers.find(c => c.id === order.customer_id);

  return (
    <Card className={`overflow-hidden ${isInvoiceMode ? 'border-violet-200' : ''}`}>
      {/* Mode indicator */}
      <div className={`
        -mx-4 -mt-4 mb-3 px-4 py-1.5 text-xs font-medium flex items-center gap-1.5
        ${isInvoiceMode
          ? 'bg-violet-100 text-violet-700'
          : 'bg-blue-50 text-blue-600'
        }
      `}>
        {isInvoiceMode ? <FileText size={12} /> : <Package size={12} />}
        {isInvoiceMode ? 'Hóa đơn' : 'Thực tế'}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-800">
            {customer?.name || order.customer_name || 'Khách hàng'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDateTime(order.created_at)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.paid
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-rose-100 text-rose-600'
          }`}>
          {order.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </span>
      </div>

      {/* Toggle Items */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 text-sm text-gray-500 hover:text-gray-700"
      >
        <span>{items.length} sản phẩm</span>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {/* Items List */}
      {isExpanded && (
        <div className="space-y-2 pb-3 border-b border-gray-100">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-600">
                {item.product?.name || item.product_name} x {item.quantity}
              </span>
              <span className="text-gray-800 font-medium">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3">
        <div>
          <span className="text-gray-500 text-sm">Tổng: </span>
          <span className="font-bold text-lg text-gray-800">
            {formatCurrency(order.total)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(order)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Xem chi tiết"
          >
            <Eye size={18} aria-hidden="true" />
          </button>
          <button
            onClick={() => onPrint(order)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="In đơn hàng"
          >
            <Printer size={18} aria-hidden="true" />
          </button>
          <button
            onClick={() => onEdit(order)}
            className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            aria-label="Chỉnh sửa đơn hàng"
          >
            <Edit size={18} aria-hidden="true" />
          </button>
          {!order.paid ? (
            <Button
              size="sm"
              variant="success"
              icon={Check}
              onClick={() => onMarkAsPaid(order.id)}
            >
              Đã thanh toán
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              icon={X}
              onClick={() => onMarkAsUnpaid(order.id)}
            >
              Chưa thanh toán
            </Button>
          )}
          <button
            onClick={() => onDelete(order.id)}
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label="Xóa đơn hàng"
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Paid info */}
      {order.paid && order.paid_at && (
        <p className="text-xs text-emerald-600 mt-2">
          Thanh toán lúc: {formatDateTime(order.paid_at)}
        </p>
      )}
    </Card>
  );
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, unpaid, paid
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [editingOrder, setEditingOrder] = useState(null);
  const [printingOrder, setPrintingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const { isInvoiceMode } = useMode();

  // Get store actions
  const {
    orders: realOrders,
    invoiceOrders,
    markOrderAsPaid,
    markOrderAsUnpaid,
    deleteOrder,
    updateOrder,
    markInvoiceOrderAsPaid,
    markInvoiceOrderAsUnpaid,
    deleteInvoiceOrder,
    updateInvoiceOrder,
    products,
    customers,
    setSelectedCustomer: setStoreCustomer,
    clearCart,
    addToCart,
    updateCartQuantity,
    updateCartItemDiscount,
    updateCartItemPrice,
    // Invoice cart actions
    setInvoiceSelectedCustomer,
    clearInvoiceCart,
    addToInvoiceCart,
    updateInvoiceCartQuantity,
    updateInvoiceCartItemPrice,
  } = useStore();

  // Select orders based on mode
  const orders = isInvoiceMode ? invoiceOrders : realOrders;

  // Generate list of months from orders
  const getAvailableMonths = () => {
    const months = new Set();
    orders.forEach(order => {
      const date = new Date(order.created_at);
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months).sort().reverse();
  };

  const availableMonths = getAvailableMonths();

  const filteredOrders = orders.filter(order => {
    // Filter by payment status
    if (filter === 'unpaid' && order.paid) return false;
    if (filter === 'paid' && !order.paid) return false;

    // Filter by month
    if (selectedMonth !== 'all') {
      const date = new Date(order.created_at);
      const orderMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (orderMonth !== selectedMonth) return false;
    }

    // Filter by customer - convert to string for comparison (ID can be number or string)
    if (selectedCustomer !== 'all') {
      const customerId = order.customer_id || order.customer?.id;
      if (String(customerId) !== String(selectedCustomer)) return false;
    }

    return true;
  });

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa đơn hàng',
      message: 'Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.',
      onConfirm: () => isInvoiceMode ? deleteInvoiceOrder(id) : deleteOrder(id),
    });
  };

  const handleMarkAsPaid = (id) => {
    if (isInvoiceMode) {
      markInvoiceOrderAsPaid(id);
    } else {
      markOrderAsPaid(id);
    }
  };

  const handleMarkAsUnpaid = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Đánh dấu chưa thanh toán',
      message: 'Bạn có chắc muốn đánh dấu đơn hàng này là chưa thanh toán?',
      variant: 'warning',
      onConfirm: () => isInvoiceMode ? markInvoiceOrderAsUnpaid(id) : markOrderAsUnpaid(id),
    });
  };

  const handleEdit = (order) => {
    setEditingOrder({
      ...order,
      items: (order.order_items || order.items || []).map(item => ({
        ...item,
        product_id: item.product_id || item.product?.id,
        product_name: item.product_name || item.product?.name,
      }))
    });
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    const updatedTotal = editingOrder.items.reduce((sum, item) => sum + item.subtotal, 0);

    if (isInvoiceMode) {
      await updateInvoiceOrder(editingOrder.id, {
        items: editingOrder.items,
        total: updatedTotal,
      });
    } else {
      await updateOrder(editingOrder.id, {
        items: editingOrder.items,
        total: updatedTotal,
      });
    }

    setEditingOrder(null);
  };

  const updateEditingItem = (index, field, value) => {
    setEditingOrder(prev => {
      const newItems = [...prev.items];
      if (field === 'quantity') {
        newItems[index] = {
          ...newItems[index],
          quantity: Number(value),
          subtotal: Number(value) * newItems[index].unit_price,
        };
      } else if (field === 'unit_price') {
        newItems[index] = {
          ...newItems[index],
          unit_price: Number(value),
          subtotal: newItems[index].quantity * Number(value),
        };
      }
      return { ...prev, items: newItems };
    });
  };

  const removeEditingItem = (index) => {
    setEditingOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handlePrintOrder = (order) => {
    setPrintingOrder(order);
  };

  const handlePrint = () => {
    // For existing orders, just close the print preview
    // The print was already triggered from PrintPreview component
    setPrintingOrder(null);
  };

  const handleCopyOrder = (order) => {
    if (isInvoiceMode) {
      clearInvoiceCart();
      const customer = order.customer || customers.find(c => c.id === order.customer_id);
      if (customer) {
        setInvoiceSelectedCustomer(customer);
      }
      const items = order.order_items || order.items || [];
      items.forEach(item => {
        const product = item.product || products.find(p => p.id === item.product_id);
        if (product) {
          addToInvoiceCart(product, item.quantity);
          if (item.unit_price !== (product.invoice_price || product.price)) {
            updateInvoiceCartItemPrice(product.id, item.unit_price);
          }
          updateInvoiceCartQuantity(product.id, item.quantity);
        }
      });
    } else {
      clearCart();
      const customer = order.customer || customers.find(c => c.id === order.customer_id);
      if (customer) {
        setStoreCustomer(customer);
      }
      const items = order.order_items || order.items || [];
      items.forEach(item => {
        const product = item.product || products.find(p => p.id === item.product_id);
        if (product) {
          addToCart(product, item.quantity);
          if (item.unit_price !== product.price) {
            updateCartItemPrice(product.id, item.unit_price);
          }
          if (item.discount && item.discount > 0) {
            updateCartItemDiscount(product.id, item.discount, item.discountType || 'percent');
          }
          updateCartQuantity(product.id, item.quantity);
        }
      });
    }

    setViewingOrder(null);
    navigate('/create-order');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isInvoiceMode ? 'bg-violet-50/50' : 'bg-gray-50'}`}>
      <Header title={isInvoiceMode ? 'Đơn hàng (Hóa đơn)' : 'Đơn hàng (Thực tế)'} />

      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="page-container">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 bg-white p-1 rounded-xl">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'unpaid', label: 'Chưa thanh toán' },
              { value: 'paid', label: 'Đã thanh toán' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === tab.value
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo tháng
              </label>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="all">Tất cả các tháng</option>
                  {availableMonths.map(month => {
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(`${month}-01`).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
                    return (
                      <option key={month} value={month}>
                        {monthName}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Customer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo khách hàng
              </label>
              <div className="relative">
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="all">Tất cả khách hàng</option>
                  {customers
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} • {CUSTOMER_TYPE_LABELS[customer.type] || 'Cá nhân'}
                      </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(selectedMonth !== 'all' || selectedCustomer !== 'all') && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedMonth('all');
                  setSelectedCustomer('all');
                }}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                ✕ Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <OrderItem
                key={order.id}
                order={order}
                customers={customers}
                isInvoiceMode={isInvoiceMode}
                onMarkAsPaid={handleMarkAsPaid}
                onMarkAsUnpaid={handleMarkAsUnpaid}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onPrint={handlePrintOrder}
                onView={setViewingOrder}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">
                {filter === 'all'
                  ? 'Chưa có đơn hàng nào'
                  : filter === 'unpaid'
                    ? 'Không có đơn chưa thanh toán'
                    : 'Không có đơn đã thanh toán'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa đơn hàng</h2>
              <p className="text-sm text-gray-500 mt-1">
                Khách hàng: {editingOrder.customer?.name || editingOrder.customer_name}
              </p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {editingOrder.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-medium text-gray-800">{item.product_name}</p>
                      <button
                        onClick={() => removeEditingItem(index)}
                        className="p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Số lượng</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateEditingItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Đơn giá</label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateEditingItem(index, 'unit_price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Thành tiền</label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium">
                          {formatCurrency(item.subtotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 p-4 bg-violet-50 border-2 border-violet-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-violet-600">
                    {formatCurrency(editingOrder.items.reduce((sum, item) => sum + item.subtotal, 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateOrder}
                disabled={editingOrder.items.length === 0}
                className="flex-1 px-4 py-2.5 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="mb-6 p-4 bg-violet-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Khách hàng</h4>
                <p className="text-gray-700">
                  {viewingOrder.customer?.name || customers.find(c => c.id === viewingOrder.customer_id)?.name || 'N/A'}
                </p>
                {viewingOrder.customer?.phone && (
                  <p className="text-sm text-gray-600 mt-1">
                    ☎ {viewingOrder.customer.phone}
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
                  <span className="text-2xl font-bold text-violet-600">
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
                className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
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

      {/* Print Preview Modal */}
      {printingOrder && (
        <PrintPreview
          order={printingOrder}
          customer={customers.find(c => c.id === (printingOrder.customer_id || printingOrder.customer?.id))}
          onClose={() => setPrintingOrder(null)}
          onPrint={handlePrint}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant || 'danger'}
      />
    </div>
  );
};

export default OrdersPage;
