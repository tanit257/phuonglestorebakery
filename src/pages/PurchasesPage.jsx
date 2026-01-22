import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Truck, Calendar, Check, ChevronDown, Eye, X, Trash2 } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';

const PurchasesPage = () => {
  const navigate = useNavigate();
  const {
    purchases,
    customers,
    markPurchaseAsPaid,
    markPurchaseAsUnpaid,
    deletePurchase,
  } = useStore();

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Get list of suppliers
  const suppliers = customers.filter(c => c.type === 'supplier');

  // Generate list of months from purchases
  const getAvailableMonths = () => {
    const months = new Set();
    purchases.forEach(purchase => {
      const date = new Date(purchase.created_at);
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months).sort().reverse();
  };

  const availableMonths = getAvailableMonths();

  // Filter purchases
  const filterPurchases = (purchasesList) => {
    return purchasesList.filter(purchase => {
      // Filter by month
      if (selectedMonth !== 'all') {
        const date = new Date(purchase.created_at);
        const purchaseMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (purchaseMonth !== selectedMonth) return false;
      }

      // Filter by supplier
      if (selectedSupplier !== 'all') {
        const supplierId = purchase.supplier_id || purchase.supplier?.id;
        if (supplierId !== selectedSupplier) return false;
      }

      // Filter by payment status
      if (paymentFilter === 'paid' && !purchase.paid) return false;
      if (paymentFilter === 'unpaid' && purchase.paid) return false;

      return true;
    });
  };

  const filteredPurchases = filterPurchases(purchases);

  const handleDeletePurchase = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa phiếu nhập',
      message: 'Bạn có chắc muốn xóa phiếu nhập này? Lưu ý: Số lượng tồn kho sẽ không được điều chỉnh lại.',
      onConfirm: () => deletePurchase(id),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Nhập hàng"
        rightElement={
          <span className="text-sm text-gray-500">
            {filteredPurchases.length} phiếu nhập
          </span>
        }
      />

      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="page-container">
          {/* Create Button */}
          <Button
            fullWidth
            icon={Plus}
            onClick={() => navigate('/create-purchase')}
            className="mb-4"
          >
            Tạo phiếu nhập mới
          </Button>

          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Month Filter */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="all">Tất cả các tháng</option>
                {availableMonths.map(month => {
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

            {/* Supplier Filter */}
            <div className="relative">
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="all">Tất cả nhà cung cấp</option>
                {suppliers
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="unpaid">Chưa thanh toán</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(selectedMonth !== 'all' || selectedSupplier !== 'all' || paymentFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedMonth('all');
                setSelectedSupplier('all');
                setPaymentFilter('all');
              }}
              className="mb-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          )}

          {/* Purchase List */}
          <div className="space-y-3">
            {filteredPurchases.map(purchase => {
              const supplier = purchase.supplier || customers.find(c => c.id === purchase.supplier_id);

              return (
                <Card key={purchase.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Icon */}
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Truck size={20} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">
                          {supplier?.name || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar size={12} />
                          {formatDate(purchase.created_at)}
                          <span className="text-gray-300">•</span>
                          <span>{formatRelativeTime(purchase.created_at)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          #{purchase.id}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900 mb-2">
                        {formatCurrency(purchase.total)}
                      </p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        purchase.paid
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {purchase.paid ? '✓ Đã thanh toán' : '◷ Chưa thanh toán'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setViewingPurchase(purchase)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Xem chi tiết
                    </button>
                    {!purchase.paid ? (
                      <button
                        onClick={() => markPurchaseAsPaid(purchase.id)}
                        className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Check size={16} />
                        Đã thanh toán
                      </button>
                    ) : (
                      <button
                        onClick={() => markPurchaseAsUnpaid(purchase.id)}
                        className="flex-1 px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                      >
                        Chưa thanh toán
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePurchase(purchase.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa phiếu nhập"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredPurchases.length === 0 && (
            <div className="text-center py-12">
              <Truck size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">Không có phiếu nhập nào</p>
              {(selectedMonth !== 'all' || selectedSupplier !== 'all' || paymentFilter !== 'all') ? (
                <p className="text-sm text-gray-300 mt-1">
                  Thử xóa bộ lọc để xem tất cả
                </p>
              ) : (
                <button
                  onClick={() => navigate('/create-purchase')}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Tạo phiếu nhập đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Detail Modal */}
      {viewingPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết phiếu nhập</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(viewingPurchase.created_at)} • #{viewingPurchase.id}
                </p>
              </div>
              <button
                onClick={() => setViewingPurchase(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Supplier Info */}
              <div className="mb-6 p-4 bg-emerald-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Nhà cung cấp</h4>
                <p className="text-gray-700">
                  {viewingPurchase.supplier?.name || customers.find(c => c.id === viewingPurchase.supplier_id)?.name || 'N/A'}
                </p>
                {viewingPurchase.supplier?.phone && (
                  <p className="text-sm text-gray-600 mt-1">
                    ☎ {viewingPurchase.supplier.phone}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {(viewingPurchase.items || viewingPurchase.purchase_items || []).map((item, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.product_name || item.product?.name}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>SL: {item.quantity}</span>
                        <span>•</span>
                        <span>Giá nhập: {formatCurrency(item.unit_price)}</span>
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
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(viewingPurchase.total)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Trạng thái thanh toán:</span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    viewingPurchase.paid
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {viewingPurchase.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setViewingPurchase(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};

export default PurchasesPage;
