import React, { useEffect, useRef } from 'react';
import { X, Package, Edit } from 'lucide-react';
import { ProductForm } from './ProductForm';

const ProductEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isInvoiceMode = false,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  const themeColor = isInvoiceMode ? 'blue' : 'blue';
  const isEditing = initialData !== null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-${themeColor}-500`}
            aria-label="Đóng"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 bg-${themeColor}-100 rounded-xl flex items-center justify-center`}
            >
              {isEditing ? (
                <Edit size={24} className={`text-${themeColor}-600`} aria-hidden="true" />
              ) : (
                <Package size={24} className={`text-${themeColor}-600`} aria-hidden="true" />
              )}
            </div>
            <h2
              id="product-modal-title"
              className="text-xl font-bold text-gray-900"
            >
              {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <ProductForm
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
