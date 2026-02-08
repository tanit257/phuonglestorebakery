import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit, FileText, FileSpreadsheet, BoxSelect } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useMode } from '../contexts/ModeContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SearchInput } from '../components/ui/Input';
import { formatCurrency } from '../utils/formatters';
import { smartSearch } from '../utils/smartSearch';
import ImportExportModal from '../components/products/ImportExportModal';
import ProductEditModal from '../components/products/ProductEditModal';

const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [showImportExport, setShowImportExport] = useState(false);

  const { products, addProduct, updateProduct, deleteProduct, getInvoiceProductStock, showNotification } = useStore();
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

  const handleImportProducts = async (categorized, mode) => {
    let addedCount = 0;
    let updatedCount = 0;

    // Add new products
    for (const product of categorized.newProducts) {
      try {
        await addProduct(product);
        addedCount++;
      } catch (error) {
        // Continue with next product
      }
    }

    // Update existing products if override mode
    if (mode === 'override') {
      for (const product of categorized.duplicateProducts) {
        try {
          const { existingId, existingProduct, ...productData } = product;
          await updateProduct(existingId, productData);
          updatedCount++;
        } catch (error) {
          // Continue with next product
        }
      }
    }

    // Show notification
    const messages = [];
    if (addedCount > 0) {
      messages.push(`thêm ${addedCount} sản phẩm mới`);
    }
    if (updatedCount > 0) {
      messages.push(`cập nhật ${updatedCount} sản phẩm`);
    }

    if (messages.length > 0) {
      showNotification(`Đã ${messages.join(', ')}`, 'success');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isInvoiceMode ? 'bg-amber-50/50' : 'bg-gray-50'}`}>
      <Header
        title="Sản phẩm"
        showBack
        rightElement={
          <span className={`text-sm ${isInvoiceMode ? 'text-amber-500' : 'text-gray-500'}`}>
            {products.length} sản phẩm
          </span>
        }
      />

      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="page-container">
          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              fullWidth
              icon={Plus}
              onClick={() => setShowForm(true)}
            >
              Thêm sản phẩm mới
            </Button>
            <Button
              variant="secondary"
              icon={FileSpreadsheet}
              onClick={() => setShowImportExport(true)}
              className="shrink-0"
            >
              Excel
            </Button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm sản phẩm..."
            />
          </div>

          {/* Product List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => {
              const invoiceStock = getInvoiceProductStock(product.id);

              return (
                <Card key={product.id} className={`overflow-hidden cursor-pointer ${isInvoiceMode ? 'border-amber-200' : ''}`}>
                  {/* Mode indicator stripe */}
                  <div className={`
                    -mx-4 -mt-4 mb-3 px-4 py-1.5 text-xs font-medium flex items-center gap-1.5
                    ${isInvoiceMode
                      ? 'bg-amber-100 text-amber-700'
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
                              Tồn: {product.stock}{product.unit}
                            </span>
                          )}
                        </div>

                        {/* Invoice price - always show but highlight based on mode */}
                        <div className={`flex items-center gap-2 ${isInvoiceMode ? 'text-amber-600' : 'text-gray-400'}`}>
                          <FileText size={14} />
                          <span className={`text-sm ${isInvoiceMode ? 'font-semibold' : ''}`}>
                            {formatCurrency(product.invoice_price || Math.round(product.price * 0.8))}/{product.unit}
                          </span>
                          {isInvoiceMode && (
                            <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">
                              Tồn: {invoiceStock}{product.unit}
                            </span>
                          )}
                        </div>

                        {/* Bulk unit info */}
                        {product.bulk_unit && product.bulk_quantity && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <BoxSelect size={12} className="inline-block" />
                            <span> Bao bì: {product.bulk_quantity}{product.unit}/{product.bulk_unit}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className={`
                          p-2 rounded-lg transition-colors cursor-pointer
                          focus-visible:outline-none focus-visible:ring-2
                          ${isInvoiceMode
                            ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50 focus-visible:ring-amber-500'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500'
                          }
                        `}
                        aria-label={`Chỉnh sửa ${product.name}`}
                      >
                        <Edit size={18} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        products={products}
        onImport={handleImportProducts}
        isInvoiceMode={isInvoiceMode}
      />

      {/* Product Edit Modal */}
      <ProductEditModal
        isOpen={showForm || editingProduct !== null}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
        initialData={editingProduct}
        isInvoiceMode={isInvoiceMode}
      />
    </div>
  );
};

export default ProductsPage;
