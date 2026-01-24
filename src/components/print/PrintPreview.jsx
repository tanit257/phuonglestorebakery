import React, { useState } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { STORE_INFO } from '../../utils/constants';

export const PrintPreview = ({ order, customer, onClose, onPrint, onPrintOnly }) => {
  const [paperSize, setPaperSize] = useState('A4'); // A4 or A5
  const [note, setNote] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handlePrintClick = () => {
    // Trigger browser print dialog
    window.print();
    // After print dialog closes, ask user if they want to save order
    setShowConfirmDialog(true);
  };

  const handleConfirmSaveOrder = () => {
    setShowConfirmDialog(false);
    onPrint({ ...order, note, paperSize });
  };

  const handleCancelSaveOrder = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  const items = order.items || order.order_items || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 print-preview-modal">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col print-preview-container">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between no-print">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Xem trước phiếu đơn hàng</h2>
            <p className="text-sm text-gray-500 mt-1">Kiểm tra thông tin trước khi in</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-4 no-print">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Khổ giấy:</label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="A4">A4 (210 x 297 mm)</option>
              <option value="A5">A5 (148 x 210 mm)</option>
            </select>
          </div>

          <div className="flex-1">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú đơn hàng (tùy chọn)"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 print-preview-wrapper">
          <div
            id="print-content"
            className={`bg-white mx-auto shadow-lg ${
              paperSize === 'A4' ? 'max-w-[210mm]' : 'max-w-[148mm]'
            }`}
            style={{
              padding: paperSize === 'A4' ? '20mm' : '15mm',
            }}
          >
            {/* Store Header */}
            <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{STORE_INFO.name}</h1>
              <p className="text-sm text-gray-600">{STORE_INFO.address}</p>
              <p className="text-sm text-gray-600">
                ☎ {STORE_INFO.phone} • ✉ {STORE_INFO.email}
              </p>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-center mb-6 uppercase">Phiếu Đơn Hàng</h2>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-600">Mã đơn hàng:</p>
                <p className="font-semibold">#{order.id || 'Mới'}</p>
              </div>
              <div>
                <p className="text-gray-600">Ngày tạo:</p>
                <p className="font-semibold">{formatDateTime(order.created_at || new Date().toISOString())}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Thông tin khách hàng</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-600">Tên:</span> <span className="font-medium">{customer?.name || order.customer_name || 'N/A'}</span></p>
                {customer?.phone && (
                  <p><span className="text-gray-600">Điện thoại:</span> <span className="font-medium">{customer.phone}</span></p>
                )}
                {customer?.address && (
                  <p><span className="text-gray-600">Địa chỉ:</span> <span className="font-medium">{customer.address}</span></p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2 font-semibold">STT</th>
                    <th className="text-left py-2 font-semibold">Sản phẩm</th>
                    <th className="text-right py-2 font-semibold">SL</th>
                    <th className="text-right py-2 font-semibold">Đơn giá</th>
                    <th className="text-right py-2 font-semibold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr className={item.note ? '' : 'border-b border-gray-200'}>
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">{item.product_name || item.product?.name}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">{formatCurrency(item.unit_price)}</td>
                        <td className="text-right py-2 font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                      {item.note && (
                        <tr className="border-b border-gray-200">
                          <td></td>
                          <td colSpan="4" className="pb-2 text-xs text-gray-600 italic">
                            Ghi chú: {item.note}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-2 border-t-2 border-gray-800">
                  <span className="font-bold text-lg">TỔNG CỘNG:</span>
                  <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Note */}
            {note && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm"><span className="font-semibold">Ghi chú:</span> {note}</p>
              </div>
            )}

            {/* Signature */}
            <div className="grid grid-cols-2 gap-8 mt-12 text-center text-sm">
              <div>
                <p className="font-semibold mb-12">Người lập phiếu</p>
                <p className="text-gray-600">(Ký, ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-semibold mb-12">Khách hàng</p>
                <p className="text-gray-600">(Ký, ghi rõ họ tên)</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              <p>Cảm ơn quý khách đã tin tùng sử dụng dịch vụ!</p>
              <p className="mt-1">In lúc: {formatDateTime(new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handlePrintClick}
            className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            In đơn hàng
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Lưu đơn hàng?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có muốn lưu đơn hàng này vào hệ thống không?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancelSaveOrder}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Không lưu
              </button>
              <button
                onClick={handleConfirmSaveOrder}
                className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                Lưu đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything */
          body * {
            visibility: hidden !important;
          }

          /* Show only print content and its children */
          #print-content,
          #print-content * {
            visibility: visible !important;
          }

          /* Position print content at top of page */
          #print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          /* Ensure table prints correctly */
          #print-content table {
            page-break-inside: avoid;
          }

          #print-content tr {
            page-break-inside: avoid;
          }

          @page {
            size: ${paperSize === 'A4' ? 'A4' : 'A5'};
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};
