import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, Eye, FileText, Package, StickyNote } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useCustomerPricing } from '../hooks/useCustomerPricing';
import { useMode } from '../contexts/ModeContext';
import { Header } from '../components/layout/Header';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatQuantityWithBulk } from '../utils/formatters';
import { smartSearch } from '../utils/smartSearch';
import { PrintPreview } from '../components/print/PrintPreview';
import { CustomerSelector } from '../components/common/CustomerSelector';
import { ProductSelector } from '../components/common/ProductSelector';
import { DraftCartPanel } from '../components/cart/DraftCartPanel';

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const { isInvoiceMode } = useMode();

  // Real mode store
  const {
    products,
    customers,
    cart,
    selectedCustomer,
    setSelectedCustomer,
    addToCart,
    updateCartQuantity,
    updateCartItemDiscount,
    updateCartItemPrice,
    updateCartItemNote,
    removeFromCart,
    clearCart,
    createOrder,
    getCartTotal,
    isCreatingOrder,
    // Draft cart management
    draftCarts,
    activeDraftId,
    createDraftCart,
    switchDraftCart,
    deleteDraftCart,
    startNewDraft,
    // Invoice mode store
    invoiceCart,
    invoiceSelectedCustomer,
    setInvoiceSelectedCustomer,
    addToInvoiceCart,
    updateInvoiceCartQuantity,
    updateInvoiceCartItemPrice,
    updateInvoiceCartItemNote,
    removeFromInvoiceCart,
    clearInvoiceCart,
    createInvoiceOrder,
    getInvoiceCartTotal,
    getInvoiceProductStock,
    isCreatingInvoiceOrder,
    // Invoice draft cart management
    invoiceDraftCarts,
    activeInvoiceDraftId,
    createInvoiceDraftCart,
    switchInvoiceDraftCart,
    deleteInvoiceDraftCart,
    startNewInvoiceDraft,
  } = useStore();

  // Select the correct cart based on mode
  const currentCart = isInvoiceMode ? invoiceCart : cart;
  const currentCustomer = isInvoiceMode ? invoiceSelectedCustomer : selectedCustomer;
  const currentSetCustomer = isInvoiceMode ? setInvoiceSelectedCustomer : setSelectedCustomer;
  const currentAddToCart = isInvoiceMode ? addToInvoiceCart : addToCart;
  const currentUpdateQuantity = isInvoiceMode ? updateInvoiceCartQuantity : updateCartQuantity;
  const currentUpdatePrice = isInvoiceMode ? updateInvoiceCartItemPrice : updateCartItemPrice;
  const currentUpdateNote = isInvoiceMode ? updateInvoiceCartItemNote : updateCartItemNote;
  const currentRemoveFromCart = isInvoiceMode ? removeFromInvoiceCart : removeFromCart;
  const currentClearCart = isInvoiceMode ? clearInvoiceCart : clearCart;
  const currentCreateOrder = isInvoiceMode ? createInvoiceOrder : createOrder;
  const cartTotal = isInvoiceMode ? getInvoiceCartTotal() : getCartTotal();
  const isCreating = isInvoiceMode ? isCreatingInvoiceOrder : isCreatingOrder;

  // Fetch customer-specific pricing (6 months history)
  const { priceCache: realPriceCache } = useCustomerPricing(selectedCustomer?.id, 6);
  const { priceCache: invoicePriceCache } = useCustomerPricing(invoiceSelectedCustomer?.id, 6);

  const currentPriceCache = isInvoiceMode ? invoicePriceCache : realPriceCache;

  const filteredProducts = smartSearch(searchTerm, products, 'name');

  const handleCreateOrder = async () => {
    const order = await currentCreateOrder();
    if (order) {
      navigate('/');
    }
  };

  const handlePreview = () => {
    if (!currentCustomer) {
      alert('Vui lòng chọn khách hàng');
      return;
    }
    if (currentCart.length === 0) {
      alert('Vui lòng thêm sản phẩm vào giỏ hàng');
      return;
    }
    setShowPrintPreview(true);
  };

  const handlePrint = async () => {
    const order = await currentCreateOrder();
    if (order) {
      setShowPrintPreview(false);
      navigate('/');
    }
  };

  // Handle creating new draft (show customer selector)
  const handleCreateNewDraft = () => {
    // Use the appropriate action based on mode
    if (isInvoiceMode) {
      startNewInvoiceDraft();
    } else {
      startNewDraft();
    }
  };

  // Handle product selection with customer-specific pricing
  const handleProductSelect = (product) => {
    const priceInfo = currentPriceCache[product.id];

    if (priceInfo?.lastPrice) {
      // Use customer's last price
      const productWithCustomPrice = {
        ...product,
        price: priceInfo.lastPrice,
      };
      currentAddToCart(productWithCustomPrice);
    } else {
      // Use default price (new product for this customer)
      currentAddToCart(product);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isInvoiceMode ? 'bg-amber-50/50' : 'bg-gray-50'}`}>
      <Header
        title={isInvoiceMode ? 'Tạo đơn hàng (Hóa đơn)' : 'Tạo đơn hàng (Thực tế)'}
        showBack
        rightElement={
          currentCart.length > 0 && (
            <button
              onClick={currentClearCart}
              className="text-sm text-rose-500 font-medium cursor-pointer"
            >
              Xóa tất cả
            </button>
          )
        }
      />

      {/* Draft Cart Panel - show when drafts exist */}
      {isInvoiceMode ? (
        invoiceDraftCarts.length > 0 && (
          <DraftCartPanel
            draftCarts={invoiceDraftCarts}
            activeDraftId={activeInvoiceDraftId}
            onSwitchDraft={switchInvoiceDraftCart}
            onDeleteDraft={deleteInvoiceDraftCart}
            onCreateDraft={handleCreateNewDraft}
            bgColor="amber"
            isInvoiceMode={true}
          />
        )
      ) : (
        draftCarts.length > 0 && (
          <DraftCartPanel
            draftCarts={draftCarts}
            activeDraftId={activeDraftId}
            onSwitchDraft={switchDraftCart}
            onDeleteDraft={deleteDraftCart}
            onCreateDraft={handleCreateNewDraft}
            bgColor="blue"
            isInvoiceMode={false}
          />
        )
      )}

      {/* Sticky Customer Bar - only show when customer is selected */}
      {currentCustomer && (
        <div className={`sticky top-0 z-10 shadow-sm ${isInvoiceMode ? 'bg-amber-50' : 'bg-white'}`}>
          <CustomerSelector
            selectedCustomer={currentCustomer}
            customers={[]}
            onSelect={() => {}}
            onDeselect={() => currentSetCustomer(null)}
            bgColor={isInvoiceMode ? 'amber' : 'blue'}
            displayMode="compact"
          />
        </div>
      )}

      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="page-container">
          {/* Mode indicator card - full width */}
          <Card className={`mb-4 ${isInvoiceMode ? 'bg-amber-100 border-amber-300' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${isInvoiceMode
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-500 text-white'
                }
              `}>
                {isInvoiceMode ? <FileText size={20} /> : <Package size={20} />}
              </div>
              <div>
                <p className={`font-semibold ${isInvoiceMode ? 'text-amber-800' : 'text-blue-800'}`}>
                  {isInvoiceMode ? 'Chế độ Hóa đơn' : 'Chế độ Thực tế'}
                </p>
                <p className={`text-sm ${isInvoiceMode ? 'text-amber-600' : 'text-blue-600'}`}>
                  {isInvoiceMode
                    ? 'Sử dụng giá hóa đơn và kho hóa đơn'
                    : 'Sử dụng giá thực tế và kho thực tế'
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Customer Selection - full width, only show when no customer selected */}
          {!currentCustomer && (
            <Card className={`mb-4 ${isInvoiceMode ? 'border-amber-200' : ''}`}>
              <CustomerSelector
                title="Chọn khách hàng"
                selectedCustomer={currentCustomer}
                customers={customers.filter(c => c.type !== 'supplier')}
                onSelect={currentSetCustomer}
                onDeselect={() => currentSetCustomer(null)}
                emptyMessage="Chưa có khách hàng. Vui lòng thêm khách hàng trước."
                bgColor={isInvoiceMode ? 'amber' : 'blue'}
              />
            </Card>
          )}

          {/* Two-column layout: Cart (left) | Products (right) */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
            {/* LEFT COLUMN: Cart */}
            <div className="space-y-4">
              {currentCart.length > 0 ? (
                <Card className={isInvoiceMode ? 'border-amber-200' : ''}>
                  <CardTitle className={isInvoiceMode ? 'text-amber-800' : ''}>
                    Giỏ hàng ({currentCart.length} sản phẩm)
                  </CardTitle>

                  <div className="mt-3 space-y-3">
                    {currentCart.map(item => {
                      const hasDiscount = item.discount > 0 || item.customPrice;
                      const originalSubtotal = item.quantity * item.unit_price;
                      const savings = originalSubtotal - item.subtotal;

                      return (
                        <div
                          key={item.product_id}
                          className={`p-3 rounded-xl transition-all ${
                            hasDiscount
                              ? 'bg-emerald-50 border border-emerald-200'
                              : isInvoiceMode
                                ? 'bg-amber-50 border border-amber-200'
                                : 'bg-gray-50'
                          }`}
                        >
                          {/* Product info row */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {isInvoiceMode && item.product?.invoice_name
                                  ? item.product.invoice_name
                                  : (item.product?.name || item.product_name)}
                              </p>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600 font-medium">
                                  {formatQuantityWithBulk(item.quantity, item.product)}
                                </span>
                                {item.customPrice ? (
                                  <>
                                    <span>•</span>
                                    <span className="text-gray-400 line-through">{formatCurrency(item.unit_price)}</span>
                                    <span className="text-emerald-600 font-medium">{formatCurrency(item.customPrice)}</span>
                                  </>
                                ) : (
                                  <>
                                    <span>•</span>
                                    <span className="text-gray-500">{formatCurrency(item.unit_price)}/{item.product?.unit}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-3">
                              <button
                                onClick={() => currentUpdateQuantity(item.product_id, item.quantity - 1)}
                                className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  if (value > 0) currentUpdateQuantity(item.product_id, value);
                                }}
                                className={`w-12 text-center font-medium border rounded-lg px-1 py-1 focus:ring-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                  isInvoiceMode
                                    ? 'border-amber-200 focus:ring-amber-500'
                                    : 'border-gray-200 focus:ring-blue-500'
                                }`}
                              />
                              <button
                                onClick={() => currentUpdateQuantity(item.product_id, item.quantity + 1)}
                                className={`w-8 h-8 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                  isInvoiceMode
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                onClick={() => currentRemoveFromCart(item.product_id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Discount/Price controls - only for real mode or custom price */}
                          <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2">
                            {/* Discount input - only for real mode */}
                            {!isInvoiceMode && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Giảm:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={item.discountType === 'percent' ? 100 : item.quantity * item.unit_price}
                                  value={item.discount || ''}
                                  onChange={(e) => updateCartItemDiscount(item.product_id, Number(e.target.value) || 0, item.discountType)}
                                  className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                  placeholder="0"
                                />
                                <select
                                  value={item.discountType}
                                  onChange={(e) => updateCartItemDiscount(item.product_id, item.discount, e.target.value)}
                                  className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                                >
                                  <option value="percent">%</option>
                                  <option value="fixed">đ</option>
                                </select>
                              </div>
                            )}

                            {/* Custom price input */}
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Giá tùy chỉnh:</span>
                              <input
                                type="number"
                                min="0"
                                value={item.customPrice || ''}
                                onChange={(e) => currentUpdatePrice(item.product_id, Number(e.target.value) || null)}
                                className={`w-24 px-2 py-1 text-sm border rounded-lg focus:ring-1 focus:outline-none ${
                                  isInvoiceMode
                                    ? 'border-amber-200 focus:ring-amber-500'
                                    : 'border-gray-200 focus:ring-blue-500'
                                }`}
                                placeholder={item.unit_price}
                              />
                            </div>

                            {/* Subtotal */}
                            <div className="flex-1 text-right">
                              {hasDiscount && savings > 0 && (
                                <span className="text-xs text-emerald-600 mr-2">-{formatCurrency(savings)}</span>
                              )}
                              <span className={`font-semibold ${isInvoiceMode ? 'text-amber-700' : 'text-gray-800'}`}>
                                {formatCurrency(item.subtotal)}
                              </span>
                            </div>
                          </div>

                          {/* Item Note */}
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <StickyNote size={14} className="text-gray-400 flex-shrink-0" />
                              <input
                                type="text"
                                value={item.note || ''}
                                onChange={(e) => currentUpdateNote(item.product_id, e.target.value)}
                                className={`flex-1 px-2 py-1 text-sm border rounded-lg focus:ring-1 focus:outline-none ${
                                  isInvoiceMode
                                    ? 'border-amber-200 focus:ring-amber-500'
                                    : 'border-gray-200 focus:ring-blue-500'
                                }`}
                                placeholder="Ghi chú cho sản phẩm này..."
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total & Submit */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">Tổng cộng:</span>
                      <span className={`text-2xl font-bold ${isInvoiceMode ? 'text-amber-600' : 'text-blue-600'}`}>
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        fullWidth
                        size="lg"
                        onClick={handlePreview}
                        disabled={!currentCustomer || currentCart.length === 0 || isCreating}
                        icon={Eye}
                        variant="secondary"
                      >
                        Xem trước
                      </Button>
                      <Button
                        fullWidth
                        size="lg"
                        onClick={handleCreateOrder}
                        disabled={!currentCustomer || currentCart.length === 0 || isCreating}
                        icon={ShoppingBag}
                      >
                        {isCreating ? 'Đang tạo...' : 'Tạo đơn'}
                      </Button>
                    </div>

                    {!currentCustomer && (
                      <p className="text-xs text-center text-rose-500 mt-2">
                        Vui lòng chọn khách hàng để tạo đơn
                      </p>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className={isInvoiceMode ? 'border-amber-200' : ''}>
                  <CardTitle className={isInvoiceMode ? 'text-amber-800' : ''}>
                    Giỏ hàng
                  </CardTitle>
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className={isInvoiceMode ? 'mx-auto text-amber-300 mb-3' : 'mx-auto text-gray-300 mb-3'} />
                    <p className={isInvoiceMode ? 'text-amber-400' : 'text-gray-400'}>
                      Chưa có sản phẩm trong giỏ hàng
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      Tìm và thêm sản phẩm bên phải
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* RIGHT COLUMN: Product Search */}
            <div>
              <Card className={isInvoiceMode ? 'border-amber-200' : ''}>
                <ProductSelector
                  title="Thêm sản phẩm"
                  products={filteredProducts.map(p => ({
                    ...p,
                    price: isInvoiceMode ? (p.invoice_price || p.price) : p.price,
                    stock: isInvoiceMode ? getInvoiceProductStock(p.id) : p.stock,
                  }))}
                  searchTerm={searchTerm}
                  onSearchChange={(e) => setSearchTerm(e.target.value)}
                  onProductSelect={handleProductSelect}
                  showStock={true}
                  plusButtonColor={isInvoiceMode ? 'amber' : 'blue'}
                  isInvoiceMode={isInvoiceMode}
                  customerPriceCache={currentPriceCache}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <PrintPreview
          order={{
            items: currentCart,
            total: cartTotal,
            created_at: new Date().toISOString(),
            paid: false,
          }}
          customer={currentCustomer}
          isInvoiceMode={isInvoiceMode}
          onClose={() => setShowPrintPreview(false)}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
};

export default CreateOrderPage;
