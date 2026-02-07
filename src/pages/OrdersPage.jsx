import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Package, Trash2, ChevronDown, ChevronUp, Edit, X, Printer, Eye, Copy, FileText, MoreVertical, DollarSign, Plus, Search, StickyNote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { useMode } from '../contexts/ModeContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatCurrency, formatDate, formatDateTime, formatQuantityWithBulk } from '../utils/formatters';
import { PrintPreview } from '../components/print/PrintPreview';
import { CUSTOMER_TYPE_LABELS } from '../utils/constants';
import { getCustomerName } from '../utils/customerHelpers';

const MoreActionsMenu = ({ order, onMarkAsPaid, onMarkAsUnpaid, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const handlePaymentToggle = () => {
    if (order.paid) {
      onMarkAsUnpaid(order.id);
    } else {
      onMarkAsPaid(order.id);
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete(order.id);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 224, // 224px = w-56 (14rem)
      });
    }
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside or scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => setIsOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        aria-label="Thêm hành động"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-[9999]"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              onClick={handlePaymentToggle}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
            >
              {order.paid ? (
                <>
                  <X size={16} className="text-rose-500" />
                  <span>Đánh dấu chưa thanh toán</span>
                </>
              ) : (
                <>
                  <DollarSign size={16} className="text-emerald-500" />
                  <span>Đánh dấu đã thanh toán</span>
                </>
              )}
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-rose-50 text-rose-600 flex items-center gap-3"
            >
              <Trash2 size={16} />
              <span>Xóa đơn hàng</span>
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

const OrderItem = ({ order, onMarkAsPaid, onMarkAsUnpaid, onDelete, onEdit, onPrint, onView, customers, isInvoiceMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const items = order.order_items || order.items || [];
  const customer = order.customer || customers.find(c => String(c.id) === String(order.customer_id));

  const handleCardClick = (e) => {
    // Không toggle nếu click vào các button actions
    if (e.target.closest('button') || e.target.closest('.actions-area')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${isInvoiceMode ? 'border-violet-200' : ''}`}
      onClick={handleCardClick}
    >
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
        <div className="flex-1">
          <p className="font-semibold text-gray-800">
            {customer?.short_name || customer?.full_name || customer?.name || order.customer_name || 'Khách hàng'}
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

      {/* Toggle Items Indicator */}
      <div className="flex items-center justify-between py-3 text-sm text-gray-500">
        <span>{items.length} sản phẩm</span>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {/* Items List */}
      {isExpanded && (
        <div className="space-y-2 pb-3 border-b border-gray-100">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <span className="text-gray-700">
                  {isInvoiceMode && item.product?.invoice_name
                    ? item.product.invoice_name
                    : (item.product?.name || item.product_name)}
                </span>
                <span className="text-gray-600 text-xs ml-2 font-medium">
                  {formatQuantityWithBulk(item.quantity, item.product)}
                </span>
                <span className="text-gray-400 text-xs ml-2">
                  @ {formatCurrency(item.unit_price)}
                </span>
              </div>
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

        <div className="flex items-center gap-1 actions-area" onClick={(e) => e.stopPropagation()}>
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
          <button
            onClick={() => onDelete(order.id)}
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label="Xóa đơn hàng"
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
          <MoreActionsMenu
            order={order}
            onMarkAsPaid={onMarkAsPaid}
            onMarkAsUnpaid={onMarkAsUnpaid}
            onDelete={onDelete}
          />
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
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

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
    addToCart,
    updateCartItemDiscount,
    updateCartItemPrice,
    startNewDraft,
    // Invoice cart actions
    setInvoiceSelectedCustomer,
    addToInvoiceCart,
    updateInvoiceCartItemPrice,
    startNewInvoiceDraft,
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
        product: item.product, // Keep product object for invoice_name
        note: item.note || '',
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

  const updateEditingItemNote = (index, note) => {
    setEditingOrder(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], note };
      return { ...prev, items: newItems };
    });
  };

  const addEditingItem = (product) => {
    const existingIndex = editingOrder.items.findIndex(
      item => String(item.product_id) === String(product.id)
    );

    if (existingIndex >= 0) {
      setEditingOrder(prev => {
        const newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
          subtotal: (newItems[existingIndex].quantity + 1) * newItems[existingIndex].unit_price,
        };
        return { ...prev, items: newItems };
      });
    } else {
      setEditingOrder(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            unit_price: product.price,
            subtotal: product.price,
          },
        ],
      }));
    }

    setProductSearch('');
    setShowProductSearch(false);
  };

  const filteredProducts = products.filter(product => {
    const searchLower = productSearch.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.sku && product.sku.toLowerCase().includes(searchLower))
    );
  });

  const handlePrintOrder = (order) => {
    setPrintingOrder(order);
  };

  const handlePrint = () => {
    // For existing orders, just close the print preview
    // The print was already triggered from PrintPreview component
    setPrintingOrder(null);
  };

  const handleCopyOrder = (order) => {
    const customer = order.customer || customers.find(c => String(c.id) === String(order.customer_id));
    const items = order.order_items || order.items || [];

    if (isInvoiceMode) {
      // Start a new invoice draft (don't clear existing drafts)
      startNewInvoiceDraft();

      // Set customer for new draft
      if (customer) {
        setInvoiceSelectedCustomer(customer);
      }

      // Add items to new draft
      items.forEach(item => {
        const product = item.product || products.find(p => String(p.id) === String(item.product_id));
        if (product) {
          addToInvoiceCart(product, item.quantity);
          // Always update custom price from original order
          updateInvoiceCartItemPrice(product.id, item.unit_price);
        }
      });
    } else {
      // Start a new draft (don't clear existing drafts)
      startNewDraft();

      // Set customer for new draft
      if (customer) {
        setStoreCustomer(customer);
      }

      // Add items to new draft
      items.forEach(item => {
        const product = item.product || products.find(p => String(p.id) === String(item.product_id));
        if (product) {
          addToCart(product, item.quantity);
          // Always update custom price from original order
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
                    .sort((a, b) => (a.short_name || a.name || '').localeCompare(b.short_name || b.name || ''))
                    .map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.short_name || customer.name} • {CUSTOMER_TYPE_LABELS[customer.type] || 'Cá nhân'}
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
                Khách hàng: {editingOrder.customer?.short_name || editingOrder.customer?.full_name || editingOrder.customer?.name || editingOrder.customer_name}
              </p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {editingOrder.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-medium text-gray-800">
                        {isInvoiceMode && item.product?.invoice_name
                          ? item.product.invoice_name
                          : item.product_name}
                      </p>
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

                    {/* Item Note - only for real orders, not invoice */}
                    {!isInvoiceMode && (
                      <div className="mt-3 flex items-start gap-2">
                        <StickyNote size={14} className="text-gray-400 flex-shrink-0 mt-2" />
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) => updateEditingItemNote(index, e.target.value)}
                          placeholder="Ghi chú cho sản phẩm này..."
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Product Section */}
              <div className="mt-4">
                {!showProductSearch ? (
                  <button
                    onClick={() => setShowProductSearch(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Thêm sản phẩm
                  </button>
                ) : (
                  <div className="border-2 border-violet-300 rounded-xl p-4 bg-violet-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-700">Thêm sản phẩm</span>
                      <button
                        onClick={() => {
                          setShowProductSearch(false);
                          setProductSearch('');
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative mb-3">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>

                    {/* Product List */}
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {filteredProducts.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {productSearch ? 'Không tìm thấy sản phẩm' : 'Nhập tên sản phẩm để tìm kiếm'}
                        </p>
                      ) : (
                        filteredProducts.slice(0, 10).map(product => {
                          const isInOrder = editingOrder.items.some(
                            item => String(item.product_id) === String(product.id)
                          );
                          return (
                            <button
                              key={product.id}
                              onClick={() => addEditingItem(product)}
                              className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                                isInOrder
                                  ? 'bg-violet-100 border border-violet-300'
                                  : 'bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                              }`}
                            >
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                              </div>
                              {isInOrder ? (
                                <span className="text-xs bg-violet-500 text-white px-2 py-1 rounded-full">
                                  Đã thêm
                                </span>
                              ) : (
                                <Plus size={18} className="text-violet-500" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
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
                  {getCustomerName(viewingOrder.customer_id, viewingOrder.customer, viewingOrder.customer_name, customers)}
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
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {isInvoiceMode && item.product?.invoice_name
                            ? item.product.invoice_name
                            : (item.product_name || item.product?.name)}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>SL: {formatQuantityWithBulk(item.quantity, item.product)}</span>
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
                    {/* Item Note - only for real orders */}
                    {!isInvoiceMode && item.note && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <StickyNote size={12} />
                        {item.note}
                      </p>
                    )}
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
          isInvoiceMode={isInvoiceMode}
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
