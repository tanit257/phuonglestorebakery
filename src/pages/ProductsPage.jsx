import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit, X, FileText } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useMode } from '../contexts/ModeContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input, Select, SearchInput } from '../components/ui/Input';
import { formatCurrency } from '../utils/formatters';
import { PRODUCT_UNITS } from '../utils/constants';
import { smartSearch } from '../utils/smartSearch';

const ProductForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    unit: 'kg',
    price: '',
    invoice_price: '',
    stock: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        price: Number(formData.price),
        invoice_price: Number(formData.invoice_price) || Math.round(Number(formData.price) * 0.8),
        stock: Number(formData.stock) || 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Tên sản phẩm *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Select
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          options={PRODUCT_UNITS}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Giá bán thực tế (VNĐ) *"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            label="Giá thực tế"
          />
          <Input
            type="number"
            placeholder="Giá hóa đơn (VNĐ)"
            value={formData.invoice_price}
            onChange={(e) => setFormData({ ...formData, invoice_price: e.target.value })}
            label="Giá hóa đơn"
          />
        </div>

        <Input
          type="number"
          placeholder="Tồn kho thực tế"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          label="Tồn kho thực tế"
        />

        <div className="flex gap-2">
          <Button type="submit" fullWidth icon={Plus} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Thêm sản phẩm')}
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

const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const { products, addProduct, updateProduct, deleteProduct, getInvoiceProductStock } = useStore();
  const { isInvoiceMode } = useMode();

  const filteredProducts = smartSearch(searchTerm, products, 'name');

  const handleAddProduct = async (data) => {
    await addProduct(data);
    setShowForm(false);
  };

  const handleUpdateProduct = async (data) => {
    await updateProduct(editingProduct.id, data);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id, productName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa sản phẩm',
      message: `Bạn có chắc muốn xóa sản phẩm "${productName}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => deleteProduct(id),
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isInvoiceMode ? 'bg-violet-50/50' : 'bg-gray-50'}`}>
      <Header
        title="Sản phẩm"
        showBack
        rightElement={
          <span className={`text-sm ${isInvoiceMode ? 'text-violet-500' : 'text-gray-500'}`}>
            {products.length} sản phẩm
          </span>
        }
      />

      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="page-container">
          {/* Add Button */}
          {!showForm && !editingProduct && (
            <Button
              fullWidth
              icon={Plus}
              onClick={() => setShowForm(true)}
              className="mb-4"
            >
              Thêm sản phẩm mới
            </Button>
          )}

          {/* Add Form */}
          {showForm && (
            <ProductForm
              onSubmit={handleAddProduct}
              onCancel={() => setShowForm(false)}
              showInvoicePrice
            />
          )}

          {/* Edit Form */}
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
              showInvoicePrice
            />
          )}

          {/* Search */}
          {!showForm && !editingProduct && (
            <div className="mb-4">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm..."
              />
            </div>
          )}

          {/* Product List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => {
              const invoiceStock = getInvoiceProductStock(product.id);

              return (
                <Card key={product.id} className={`overflow-hidden ${isInvoiceMode ? 'border-violet-200' : ''}`}>
                  {/* Mode indicator stripe */}
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

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{product.name}</p>

                      {/* Prices */}
                      <div className="mt-2 space-y-1">
                        {/* Real price - always show but highlight based on mode */}
                        <div className={`flex items-center gap-2 ${!isInvoiceMode ? 'text-blue-600' : 'text-gray-400'}`}>
                          <Package size={14} />
                          <span className={`text-sm ${!isInvoiceMode ? 'font-semibold' : ''}`}>
                            {formatCurrency(product.price)}/{product.unit}
                          </span>
                          {!isInvoiceMode && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                              Tồn: {product.stock}
                            </span>
                          )}
                        </div>

                        {/* Invoice price - always show but highlight based on mode */}
                        <div className={`flex items-center gap-2 ${isInvoiceMode ? 'text-violet-600' : 'text-gray-400'}`}>
                          <FileText size={14} />
                          <span className={`text-sm ${isInvoiceMode ? 'font-semibold' : ''}`}>
                            {formatCurrency(product.invoice_price || Math.round(product.price * 0.8))}/{product.unit}
                          </span>
                          {isInvoiceMode && (
                            <span className="text-xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded">
                              Tồn: {invoiceStock}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className={`
                          p-2 rounded-lg transition-colors
                          focus-visible:outline-none focus-visible:ring-2
                          ${isInvoiceMode
                            ? 'text-gray-400 hover:text-violet-600 hover:bg-violet-50 focus-visible:ring-violet-500'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500'
                          }
                        `}
                        aria-label={`Chỉnh sửa ${product.name}`}
                      >
                        <Edit size={18} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        aria-label={`Xóa ${product.name}`}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">
                {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
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
    </div>
  );
};

export default ProductsPage;
