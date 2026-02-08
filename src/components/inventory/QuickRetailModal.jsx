import { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useMode } from '../../contexts/ModeContext';
import { formatCurrency } from '../../utils/formatters';

export default function QuickRetailModal({ isOpen, onClose }) {
  const { products, createQuickRetailOrder, createQuickInvoiceRetailOrder } = useStore();
  const { isInvoiceMode } = useMode();

  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProduct = products.find(p => String(p.id) === selectedProductId);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;

    const price = customPrice ? parseFloat(customPrice) : (isInvoiceMode ? (selectedProduct.invoice_price || selectedProduct.price) : selectedProduct.price);

    const existingIndex = items.findIndex(item => String(item.product_id) === String(selectedProduct.id));

    if (existingIndex !== -1) {
      setItems(prev => prev.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setItems(prev => [...prev, {
        product_id: selectedProduct.id,
        product_name: isInvoiceMode && selectedProduct.invoice_name
          ? selectedProduct.invoice_name
          : selectedProduct.name,
        quantity,
        unit_price: price,
        unit: selectedProduct.unit,
        note,
      }]);
    }

    // Reset form
    setSelectedProductId('');
    setQuantity(1);
    setCustomPrice('');
    setNote('');
    setSearchTerm('');
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      if (isInvoiceMode) {
        await createQuickInvoiceRetailOrder(items);
      } else {
        await createQuickRetailOrder(items);
      }
      setItems([]);
      onClose();
    } catch (error) {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Bán lẻ nhanh</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add item form */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
            {/* Product search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sản phẩm
              </label>
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedProductId('');
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              {searchTerm && !selectedProductId && (
                <div className="mt-1 max-h-40 overflow-y-auto bg-white border rounded-lg shadow-lg">
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-gray-500 text-sm">Không tìm thấy sản phẩm</div>
                  ) : (
                    filteredProducts.slice(0, 10).map(product => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSelectedProductId(String(product.id));
                          setSearchTerm(isInvoiceMode && product.invoice_name ? product.invoice_name : product.name);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-amber-50 flex justify-between items-center cursor-pointer"
                      >
                        <span>{isInvoiceMode && product.invoice_name ? product.invoice_name : product.name}</span>
                        <span className="text-sm text-gray-500">
                          {formatCurrency(isInvoiceMode ? (product.invoice_price || product.price) : product.price)}/{product.unit}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Quantity and price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng {selectedProduct ? `(${selectedProduct.unit})` : ''}
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn giá (tùy chọn)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder={selectedProduct ? formatCurrency(isInvoiceMode ? (selectedProduct.invoice_price || selectedProduct.price) : selectedProduct.price) : ''}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ghi chú cho sản phẩm này..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Add button */}
            <button
              onClick={handleAddItem}
              disabled={!selectedProductId || quantity <= 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm sản phẩm
            </button>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Danh sách ({items.length})</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-gray-500">
                        {item.quantity} {item.unit} x {formatCurrency(item.unit_price)}
                      </div>
                      {item.note && (
                        <div className="text-xs text-gray-400 mt-1">{item.note}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-amber-600">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Tổng cộng:</span>
            <span className="text-xl font-bold text-amber-600">
              {formatCurrency(total)}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={items.length === 0 || isSubmitting}
              className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo đơn lẻ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
