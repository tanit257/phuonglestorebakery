import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Phone, MapPin, Trash2, Edit, X, Store, User, Truck, CreditCard, Mail, FileText, Eye, Calendar, ShoppingBag, FileSpreadsheet } from 'lucide-react';
import CustomerImportExportModal from '../components/customers/CustomerImportExportModal';
import { useStore } from '../hooks/useStore';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input, Select } from '../components/ui/Input';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CUSTOMER_TYPES, CUSTOMER_TYPE_LABELS } from '../utils/constants';

// Customer Detail Modal Component
const CustomerDetailModal = ({ customer, onClose, orders, debt }) => {
  const navigate = useNavigate();

  if (!customer) return null;

  // Get customer's orders
  const customerOrders = orders.filter(
    o => String(o.customer_id) === String(customer.id) || String(o.customer?.id) === String(customer.id)
  );
  const paidOrders = customerOrders.filter(o => o.paid);
  const totalPurchased = customerOrders.reduce((sum, o) => sum + o.total, 0);

  const getTypeIcon = () => {
    switch (customer.type) {
      case CUSTOMER_TYPES.BAKERY:
        return <Store size={24} />;
      case CUSTOMER_TYPES.SUPPLIER:
        return <Truck size={24} />;
      default:
        return <User size={24} />;
    }
  };

  const getTypeColor = () => {
    switch (customer.type) {
      case CUSTOMER_TYPES.BAKERY:
        return 'bg-amber-100 text-amber-600';
      case CUSTOMER_TYPES.SUPPLIER:
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-detail-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            aria-label="Đóng"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getTypeColor()}`}>
              {getTypeIcon()}
            </div>
            <div>
              <h2 id="customer-detail-title" className="text-xl font-bold text-gray-900">
                {customer.short_name || customer.full_name || 'Chưa có tên'}
              </h2>
              {customer.full_name && (
                <p className="text-sm text-gray-500">{customer.full_name}</p>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor()}`}>
                {CUSTOMER_TYPE_LABELS[customer.type]}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {/* Contact Info */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Thông tin liên hệ</h3>

            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Phone size={18} className="text-gray-400" />
                <span className="text-gray-700">{customer.phone}</span>
              </a>
            )}

            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Mail size={18} className="text-gray-400" />
                <span className="text-gray-700">{customer.email}</span>
              </a>
            )}

            {customer.address && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-400">Địa chỉ giao hàng</span>
                  <p className="text-gray-700">{customer.address}</p>
                </div>
              </div>
            )}

            {customer.billing_address && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-400">Địa chỉ xuất hóa đơn</span>
                  <p className="text-gray-700">{customer.billing_address}</p>
                </div>
              </div>
            )}

            {customer.tax_code && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FileText size={18} className="text-gray-400" />
                <div>
                  <span className="text-xs text-gray-400">Mã số thuế</span>
                  <p className="text-gray-700 font-medium">{customer.tax_code}</p>
                </div>
              </div>
            )}

            {!customer.phone && !customer.email && !customer.address && !customer.tax_code && (
              <p className="text-gray-400 text-sm italic">Chưa có thông tin liên hệ</p>
            )}
          </div>

          {/* Statistics */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Thống kê</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-violet-50 rounded-xl">
                <div className="flex items-center gap-2 text-violet-600 mb-1">
                  <ShoppingBag size={16} />
                  <span className="text-xs font-medium">Tổng đơn hàng</span>
                </div>
                <p className="text-2xl font-bold text-violet-700">{customerOrders.length}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <CreditCard size={16} />
                  <span className="text-xs font-medium">Tổng mua hàng</span>
                </div>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalPurchased)}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Calendar size={16} />
                  <span className="text-xs font-medium">Đã thanh toán</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{paidOrders.length}</p>
              </div>

              <div className={`p-4 rounded-xl ${debt > 0 ? 'bg-rose-50' : 'bg-gray-50'}`}>
                <div className={`flex items-center gap-2 mb-1 ${debt > 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                  <CreditCard size={16} />
                  <span className="text-xs font-medium">Công nợ</span>
                </div>
                <p className={`text-lg font-bold ${debt > 0 ? 'text-rose-700' : 'text-gray-600'}`}>
                  {formatCurrency(debt)}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          {customerOrders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Đơn hàng gần đây</h3>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/orders?customer=${customer.id}`);
                  }}
                  className="text-xs text-violet-600 font-medium hover:text-violet-700"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="space-y-2">
                {customerOrders.slice(0, 3).map(order => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(order.created_at)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.items?.length || order.order_items?.length || 0} sản phẩm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{formatCurrency(order.total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.paid
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {order.paid ? 'Đã TT' : 'Chưa TT'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => {
              onClose();
              navigate(`/debt?customer=${customer.id}`);
            }}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
              debt > 0
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CreditCard size={18} />
            Xem công nợ
          </button>
          <button
            onClick={() => {
              onClose();
              navigate(`/create-order?customer=${customer.id}`);
            }}
            className="flex-1 px-4 py-3 bg-violet-500 text-white rounded-xl font-semibold hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Tạo đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    short_name: '',
    full_name: '',
    type: CUSTOMER_TYPES.BAKERY,
    phone: '',
    email: '',
    address: '',
    billing_address: '',
    tax_code: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.short_name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Tên viết tắt *"
            value={formData.short_name}
            onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
            required
          />

          <Input
            placeholder="Tên đầy đủ (hóa đơn)"
            value={formData.full_name || ''}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
        </div>

        <Select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          options={[
            { value: CUSTOMER_TYPES.BAKERY, label: 'Tiệm bánh' },
            { value: CUSTOMER_TYPES.INDIVIDUAL, label: 'Cá nhân' },
            { value: CUSTOMER_TYPES.SUPPLIER, label: 'Nhà cung cấp' },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="tel"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            type="email"
            placeholder="Email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <Input
          placeholder="Địa chỉ giao hàng"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />

        <Input
          placeholder="Địa chỉ xuất hóa đơn"
          value={formData.billing_address || ''}
          onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
        />

        <Input
          placeholder="Mã số thuế"
          value={formData.tax_code || ''}
          onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
        />

        <div className="flex gap-2">
          <Button type="submit" fullWidth icon={Plus} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý…' : (initialData ? 'Cập nhật' : 'Thêm khách hàng')}
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              <X size={20} />
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

const CustomersPage = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const {
    customers,
    orders,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    importCustomers,
    getCustomerDebt,
  } = useStore();

  const handleAddCustomer = async (data) => {
    await addCustomer(data);
    setShowForm(false);
  };

  const handleUpdateCustomer = async (data) => {
    await updateCustomer(editingCustomer.id, data);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id, customerName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa khách hàng',
      message: `Bạn có chắc muốn xóa khách hàng "${customerName}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => deleteCustomer(id),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Khách hàng"
        rightElement={
          <span className="text-sm text-gray-500">
            {customers.length} khách
          </span>
        }
      />

      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="page-container">
          {/* Action Buttons */}
          {!showForm && !editingCustomer && (
            <div className="flex gap-2 mb-4">
              <Button
                fullWidth
                icon={Plus}
                onClick={() => setShowForm(true)}
              >
                Thêm khách hàng mới
              </Button>
              <Button
                variant="secondary"
                icon={FileSpreadsheet}
                onClick={() => setShowImportExport(true)}
                className="shrink-0"
              >
                Import/Export
              </Button>
            </div>
          )}

          {/* Add Form */}
          {showForm && (
            <CustomerForm
              onSubmit={handleAddCustomer}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Edit Form */}
          {editingCustomer && (
            <CustomerForm
              initialData={editingCustomer}
              onSubmit={handleUpdateCustomer}
              onCancel={() => setEditingCustomer(null)}
            />
          )}

          {/* Customer List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map(customer => {
              const debt = getCustomerDebt(customer.id);

              return (
                <Card key={customer.id} className="group relative">
                  {/* Debt amount tooltip on hover */}
                  {debt > 0 && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow-lg z-10">
                      Nợ: {formatCurrency(debt)}
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        customer.type === CUSTOMER_TYPES.BAKERY
                          ? 'bg-amber-100 text-amber-600'
                          : customer.type === CUSTOMER_TYPES.SUPPLIER
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-blue-100 text-blue-600'
                        }`}>
                        {customer.type === CUSTOMER_TYPES.BAKERY
                          ? <Store size={20} />
                          : customer.type === CUSTOMER_TYPES.SUPPLIER
                          ? <Truck size={20} />
                          : <User size={20} />
                        }
                      </div>

                      {/* Info */}
                      <div>
                        <p className="font-semibold text-gray-800">{customer.short_name || customer.full_name || 'Chưa có tên'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          customer.type === CUSTOMER_TYPES.BAKERY
                            ? 'bg-amber-100 text-amber-600'
                            : customer.type === CUSTOMER_TYPES.SUPPLIER
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-blue-100 text-blue-600'
                          }`}>
                          {CUSTOMER_TYPE_LABELS[customer.type]}
                        </span>
                      </div>
                    </div>

                    {/* Debt Button - Always show "Công nợ" text */}
                    <button
                      onClick={() => navigate(`/debt?customer=${customer.id}`)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        debt > 0
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                      title={debt > 0 ? `Công nợ: ${formatCurrency(debt)}` : 'Xem công nợ'}
                    >
                      <CreditCard size={16} />
                      <span className="text-sm font-medium">Công nợ</span>
                    </button>
                  </div>

                  {/* Contact Info - Always show both rows for consistent layout */}
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {customer.phone ? (
                      <a
                        href={`tel:${customer.phone}`}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600"
                      >
                        <Phone size={14} />
                        <span>{customer.phone}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone size={14} />
                        <span>-</span>
                      </div>
                    )}
                    {customer.address ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span>{customer.address}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin size={14} />
                        <span>-</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setViewingCustomer(customer)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label={`Xem chi tiết ${customer.short_name}`}
                    >
                      <Eye size={18} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setEditingCustomer(customer)}
                      className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                      aria-label={`Chỉnh sửa ${customer.short_name}`}
                    >
                      <Edit size={18} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id, customer.short_name)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      aria-label={`Xóa ${customer.short_name}`}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {customers.length === 0 && !showForm && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">Chưa có khách hàng nào</p>
              <p className="text-sm text-gray-300 mt-1">
                Bấm nút trên để thêm khách hàng
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />

      {/* Customer Detail Modal */}
      {viewingCustomer && (
        <CustomerDetailModal
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          orders={orders}
          debt={getCustomerDebt(viewingCustomer.id)}
        />
      )}

      {/* Import/Export Modal */}
      <CustomerImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        customers={customers}
        onImport={importCustomers}
      />
    </div>
  );
};

export default CustomersPage;
