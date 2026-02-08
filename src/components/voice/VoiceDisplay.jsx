import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Check,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Volume2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Package,
  User
} from 'lucide-react';
import { useVoiceContext } from '../../contexts/VoiceContext';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';

export const VoiceDisplay = () => {
  const navigate = useNavigate();
  const {
    transcript,
    interimTranscript,
    confidence,
    alternatives,
    result,
    clearResult,
    isListening,
    suggestions,
    retryWithAlternative,
    isWaitingForMore
  } = useVoiceContext();
  const {
    setSelectedCustomer,
    addToCart,
    customers,
    products,
    showNotification,
  } = useStore();
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Handle voice command results
  useEffect(() => {
    if (!result) return;

    if (result.action === 'create_order' && result.data) {
      const { customer_id, items } = result.data;

      // Set customer if found
      if (customer_id) {
        const customer = customers.find(c => c.id === customer_id);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }

      // Add items to cart
      if (items && items.length > 0) {
        items.forEach(item => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            addToCart(product, item.quantity);
          }
        });

        // Navigate to create order page
        navigate('/create-order');
        showNotification(`Đã thêm ${items.length} sản phẩm vào đơn hàng`, 'success');
      }
    } else if (result.action === 'view_debt') {
      navigate('/debt');
    } else if (result.action === 'view_report') {
      navigate('/');
    } else if (result.action === 'add_to_cart' && result.data?.items) {
      // Add items to cart without navigation
      const addedItems = [];
      result.data.items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          addToCart(product, item.quantity);
          addedItems.push(`${item.quantity} ${product.name}`);
        }
      });

      if (addedItems.length > 0) {
        showNotification(`Đã thêm: ${addedItems.join(', ')}`, 'success');
        // Navigate to create-order if not already there
        if (window.location.pathname !== '/create-order') {
          navigate('/create-order');
        }
      }
    }
  }, [result]);

  if (!transcript && !result && !interimTranscript) return null;

  // Check if we have content to display (used for conditional desktop panel rendering)
  const hasContent = transcript || result || interimTranscript;

  const getActionIcon = () => {
    if (!result) return null;
    switch (result.action) {
      case 'create_order': return ShoppingCart;
      case 'view_debt': return CreditCard;
      case 'view_report': return BarChart3;
      case 'low_confidence': return AlertTriangle;
      default: return null;
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'text-green-600 bg-green-50';
    if (conf >= 0.65) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (conf) => {
    if (conf >= 0.8) return 'Chính xác cao';
    if (conf >= 0.65) return 'Tốt';
    return 'Thấp';
  };

  const ActionIcon = getActionIcon();

  return (
    <>
      {/* Mobile: Bottom right corner */}
      <div className="lg:hidden fixed bottom-24 right-4 z-40 w-[min(85vw,380px)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">
              {isListening ? 'Đang nghe...' : isWaitingForMore ? 'Chờ nói thêm...' : 'Kết quả nhận diện'}
            </span>
          </div>
          <button
            onClick={clearResult}
            className="p-1 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <X size={16} className="text-blue-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[min(60vh,500px)] overflow-y-auto">
          {/* Interim Transcript (Realtime) */}
          {interimTranscript && isListening && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl animate-pulse">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <p className="text-xs font-medium text-blue-700">Đang nhận diện...</p>
              </div>
              <p className="text-gray-700 italic">{interimTranscript}</p>
            </div>
          )}

          {/* Final Transcript with Confidence */}
          {transcript && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">
                  {isWaitingForMore ? 'Đang chờ nói thêm...' : 'Bạn đã nói:'}
                </p>
                {confidence > 0 && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(confidence)}`}>
                    {confidence >= 0.8 ? (
                      <CheckCircle size={12} />
                    ) : (
                      <AlertTriangle size={12} />
                    )}
                    <span>{getConfidenceLabel(confidence)} ({(confidence * 100).toFixed(0)}%)</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl border ${isWaitingForMore ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-gray-800 font-medium">{transcript}</p>
                {isWaitingForMore && (
                  <p className="text-xs text-amber-600 mt-2 animate-pulse">
                    Tiếp tục nói hoặc đợi 2.5s để xử lý...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {alternatives && alternatives.length > 1 && (
            <div className="mb-3">
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mb-2"
              >
                <RefreshCw size={12} />
                {showAlternatives ? 'Ẩn' : 'Hiện'} phiên bản khác ({alternatives.length - 1})
              </button>
              {showAlternatives && (
                <div className="space-y-1.5">
                  {alternatives.slice(1).map((alt, idx) => (
                    <button
                      key={idx}
                      onClick={() => retryWithAlternative(alt.transcript)}
                      className="w-full p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-left text-sm text-gray-700 border border-blue-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">#{idx + 2}</span>
                        <span className="text-xs text-gray-500">
                          {(alt.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="mt-1">{alt.transcript}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Smart Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
                <AlertTriangle size={12} />
                Có thể bạn muốn nói:
              </p>
              <div className="space-y-1.5">
                {suggestions.slice(0, 3).map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => retryWithAlternative(sug.suggested)}
                    className="w-full p-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-left text-sm border border-amber-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-amber-700">{sug.type === 'product' ? 'Sản phẩm' : 'Khách hàng'}</span>
                      <span className="text-xs text-gray-500">
                        {(sug.similarity * 100).toFixed(0)}% khớp
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">{sug.suggested}</p>
                    <p className="text-xs text-gray-500 mt-1">{sug.context}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`
            p-3 rounded-xl border-2
            ${result.action === 'unknown' || result.action === 'error'
                ? 'bg-amber-50 border-amber-300'
                : result.action === 'low_confidence'
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-blue-50 border-blue-300'
              }
          `}>
              <div className="flex items-start gap-2">
                {ActionIcon && (
                  <ActionIcon size={18} className={`mt-0.5 flex-shrink-0 ${result.action === 'unknown' || result.action === 'error'
                    ? 'text-amber-600'
                    : result.action === 'low_confidence'
                      ? 'text-orange-600'
                      : 'text-blue-600'
                    }`} />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${result.action === 'unknown' || result.action === 'error'
                    ? 'text-amber-800'
                    : result.action === 'low_confidence'
                      ? 'text-orange-800'
                      : 'text-blue-800'
                    }`}>
                    {result.message}
                  </p>

                  {/* Show items if creating order */}
                  {result.action === 'create_order' && result.data?.items?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {result.data.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                          <span className="text-blue-700 font-medium">
                            • {item.product_name}
                          </span>
                          <span className="text-blue-600">x {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Sidebar panel on right - ONLY show when there's content */}
      {hasContent && (
        <div className="hidden lg:block fixed top-0 right-0 h-screen w-[420px] bg-white shadow-2xl border-l border-gray-200 z-40 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Volume2 size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-blue-700">Voice AI Assistant</h2>
                <p className="text-xs text-blue-600">
                  {isListening ? '🎤 Đang nghe...' : isWaitingForMore ? '⏳ Chờ nói thêm (2.5s)...' : 'Nhận diện giọng nói'}
                </p>
              </div>
            </div>
            <button
              onClick={clearResult}
              className="p-2 hover:bg-blue-200 rounded-xl transition-colors"
            >
              <X size={20} className="text-blue-600" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="h-[calc(100vh-80px)] overflow-y-auto p-6 space-y-4">
            {/* Interim Transcript (Realtime) */}
            {interimTranscript && isListening && (
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                  <p className="text-sm font-semibold text-blue-700">Đang nhận diện...</p>
                </div>
                <p className="text-gray-800 italic text-base">{interimTranscript}</p>
              </div>
            )}

            {/* Final Transcript with Confidence */}
            {transcript && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-600">
                    {isWaitingForMore ? 'Đang chờ nói thêm...' : 'Bạn đã nói:'}
                  </p>
                  {confidence > 0 && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getConfidenceColor(confidence)}`}>
                      {confidence >= 0.8 ? (
                        <CheckCircle size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}
                      <span>{getConfidenceLabel(confidence)} ({(confidence * 100).toFixed(0)}%)</span>
                    </div>
                  )}
                </div>
                <div className={`p-4 rounded-xl border-2 ${isWaitingForMore ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-gray-900 font-medium text-base leading-relaxed">{transcript}</p>
                  {isWaitingForMore && (
                    <p className="text-sm text-amber-600 mt-3 animate-pulse">
                      Tiếp tục nói hoặc đợi 2.5s để xử lý...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {alternatives && alternatives.length > 1 && (
              <div>
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mb-3 transition-colors"
                >
                  <RefreshCw size={14} />
                  {showAlternatives ? 'Ẩn' : 'Hiện'} phiên bản khác ({alternatives.length - 1})
                </button>
                {showAlternatives && (
                  <div className="space-y-2">
                    {alternatives.slice(1).map((alt, idx) => (
                      <button
                        key={idx}
                        onClick={() => retryWithAlternative(alt.transcript)}
                        className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-left border-2 border-blue-200 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-blue-700 font-bold">Phiên bản #{idx + 2}</span>
                          <span className="text-sm text-gray-600 font-medium">
                            {(alt.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-base text-gray-800">{alt.transcript}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Smart Suggestions */}
            {suggestions && suggestions.length > 0 && (
              <div>
                <p className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Có thể bạn muốn nói:
                </p>
                <div className="space-y-2">
                  {suggestions.slice(0, 3).map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => retryWithAlternative(sug.suggested)}
                      className="w-full p-3 bg-amber-50 hover:bg-amber-100 rounded-xl text-left border-2 border-amber-200 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-amber-800">
                          <span className="inline-flex items-center gap-1">{sug.type === 'product' ? <><Package size={14} /> Sản phẩm</> : <><User size={14} /> Khách hàng</>}</span>
                        </span>
                        <span className="text-sm text-gray-600 font-medium">
                          {(sug.similarity * 100).toFixed(0)}% khớp
                        </span>
                      </div>
                      <p className="text-base text-gray-900 font-semibold">{sug.suggested}</p>
                      <p className="text-sm text-gray-600 mt-1">{sug.context}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={`
              p-4 rounded-xl border-2 shadow-lg
              ${result.action === 'unknown' || result.action === 'error'
                  ? 'bg-amber-50 border-amber-400'
                  : result.action === 'low_confidence'
                    ? 'bg-orange-50 border-orange-400'
                    : 'bg-blue-50 border-blue-400'
                }
            `}>
                <div className="flex items-start gap-3">
                  {ActionIcon && (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${result.action === 'unknown' || result.action === 'error'
                      ? 'bg-amber-200'
                      : result.action === 'low_confidence'
                        ? 'bg-orange-200'
                        : 'bg-blue-200'
                      }`}>
                      <ActionIcon size={20} className={`${result.action === 'unknown' || result.action === 'error'
                        ? 'text-amber-700'
                        : result.action === 'low_confidence'
                          ? 'text-orange-700'
                          : 'text-blue-700'
                        }`} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`text-base font-bold mb-2 ${result.action === 'unknown' || result.action === 'error'
                      ? 'text-amber-900'
                      : result.action === 'low_confidence'
                        ? 'text-orange-900'
                        : 'text-blue-900'
                      }`}>
                      {result.message}
                    </p>

                    {/* Show items if creating order */}
                    {result.action === 'create_order' && result.data?.items?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {result.data.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white bg-opacity-70 px-3 py-2 rounded-lg border border-blue-200">
                            <span className="text-blue-800 font-semibold text-sm">
                              • {item.product_name}
                            </span>
                            <span className="text-blue-700 font-bold text-sm">x {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceDisplay;
