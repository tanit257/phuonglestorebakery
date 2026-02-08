import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { Header } from '../components/layout/Header';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';
import { CUSTOMER_TYPES } from '../utils/constants';
import { smartSearch } from '../utils/smartSearch';
import { CartItemList } from '../components/cart/CartItemList';
import { CustomerSelector } from '../components/common/CustomerSelector';
import { ProductSelector } from '../components/common/ProductSelector';

const CreatePurchasePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    products,
    customers,
    purchaseCart,
    selectedSupplier,
    setSelectedSupplier,
    addToPurchaseCart,
    updatePurchaseCartQuantity,
    updatePurchaseCartPrice,
    removeFromPurchaseCart,
    clearPurchaseCart,
    createPurchase,
    getPurchaseCartTotal,
  } = useStore();

  // Filter only suppliers
  const suppliers = customers.filter(c => c.type === CUSTOMER_TYPES.SUPPLIER);

  const filteredProducts = smartSearch(searchTerm, products, 'name');

  const handleCreatePurchase = async () => {
    const purchase = await createPurchase();
    if (purchase) {
      navigate('/purchases');
    }
  };

  const purchaseTotal = getPurchaseCartTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Nhập hàng"
        showBack
        rightElement={
          purchaseCart.length > 0 && (
            <button
              onClick={clearPurchaseCart}
              className="text-sm text-rose-500 font-medium cursor-pointer"
            >
              Xóa tất cả
            </button>
          )
        }
      />

      {/* Sticky Supplier Bar - only show when supplier is selected */}
      {selectedSupplier && (
        <div className="sticky top-0 z-10 shadow-sm bg-white">
          <CustomerSelector
            selectedCustomer={selectedSupplier}
            customers={[]}
            onSelect={() => {}}
            onDeselect={() => setSelectedSupplier(null)}
            bgColor="emerald"
            displayMode="compact"
          />
        </div>
      )}

      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="page-container">
          {/* Supplier Selection - full width, only show when no supplier selected */}
          {!selectedSupplier && (
            <Card className="mb-4">
              <CustomerSelector
                title="Chọn nhà cung cấp"
                selectedCustomer={selectedSupplier}
                customers={suppliers}
                onSelect={setSelectedSupplier}
                onDeselect={() => setSelectedSupplier(null)}
                emptyMessage="Chưa có nhà cung cấp nào"
                emptyActionLabel="Thêm nhà cung cấp"
                onEmptyAction={() => navigate('/customers')}
                bgColor="emerald"
              />
            </Card>
          )}

          {/* Two-column layout: Cart (left) | Products (right) */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
            {/* LEFT COLUMN: Purchase Cart */}
            <div className="space-y-4">
              {purchaseCart.length > 0 ? (
                <Card>
                  <CardTitle>Danh sách sản phẩm nhập ({purchaseCart.length})</CardTitle>

                  <div className="mt-3">
                    <CartItemList
                      items={purchaseCart}
                      onUpdateQuantity={updatePurchaseCartQuantity}
                      onUpdatePrice={updatePurchaseCartPrice}
                      onRemove={removeFromPurchaseCart}
                      priceLabel="Giá nhập"
                      emptyMessage="Chưa có sản phẩm nào"
                    />
                  </div>

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(purchaseTotal)}
                      </span>
                    </div>

                    <Button
                      fullWidth
                      size="lg"
                      icon={Package}
                      onClick={handleCreatePurchase}
                      disabled={!selectedSupplier}
                    >
                      Tạo phiếu nhập hàng
                    </Button>
                    {!selectedSupplier && (
                      <p className="text-xs text-center text-rose-500 mt-2">
                        Vui lòng chọn nhà cung cấp để tạo phiếu
                      </p>
                    )}
                  </div>
                </Card>
              ) : (
                <Card>
                  <CardTitle>Danh sách sản phẩm nhập</CardTitle>
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400">Chưa có sản phẩm nào</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Tìm và thêm sản phẩm bên phải
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* RIGHT COLUMN: Product Selection */}
            <div>
              <Card>
                <ProductSelector
                  title="Chọn sản phẩm"
                  products={filteredProducts}
                  searchTerm={searchTerm}
                  onSearchChange={(e) => setSearchTerm(e.target.value)}
                  onProductSelect={(product) => addToPurchaseCart(product, 1)}
                  showStock={true}
                  plusButtonColor="emerald"
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchasePage;
