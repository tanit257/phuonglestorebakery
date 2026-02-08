import React, { useState } from 'react';
import { X, Plus, ShoppingCart, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ConfirmDialog } from '../ui/ConfirmDialog';

// Helper function to format relative time
const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút`;
  if (diffHours < 24) return `${diffHours} giờ`;
  return `${diffDays} ngày`;
};

/**
 * DraftCartPanel - Component for managing multiple draft carts
 * Allows users to switch between multiple pending orders for different customers
 *
 * @param {Array} draftCarts - Array of draft cart objects
 * @param {string} activeDraftId - ID of currently active draft
 * @param {Function} onSwitchDraft - Callback when switching to different draft
 * @param {Function} onDeleteDraft - Callback when deleting a draft
 * @param {Function} onCreateDraft - Callback when creating new draft
 * @param {string} bgColor - Theme color ('violet' | 'rose')
 * @param {boolean} isInvoiceMode - Whether in invoice mode
 */
export const DraftCartPanel = ({
  draftCarts = [],
  activeDraftId,
  onSwitchDraft,
  onDeleteDraft,
  onCreateDraft,
  bgColor = 'violet',
  isInvoiceMode = false,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, draft: null });

  const colorClasses = {
    violet: {
      bg: 'bg-violet-50',
      bgActive: 'bg-violet-100',
      border: 'border-violet-200',
      borderActive: 'border-violet-500',
      text: 'text-violet-700',
      textActive: 'text-violet-800',
      badge: 'bg-violet-500',
      hover: 'hover:bg-violet-100',
      button: 'bg-violet-500 hover:bg-violet-600',
    },
    rose: {
      bg: 'bg-rose-50',
      bgActive: 'bg-rose-100',
      border: 'border-rose-200',
      borderActive: 'border-rose-500',
      text: 'text-rose-700',
      textActive: 'text-rose-800',
      badge: 'bg-rose-500',
      hover: 'hover:bg-rose-100',
      button: 'bg-rose-500 hover:bg-rose-600',
    },
    amber: {
      bg: 'bg-amber-50',
      bgActive: 'bg-amber-100',
      border: 'border-amber-200',
      borderActive: 'border-amber-500',
      text: 'text-amber-700',
      textActive: 'text-amber-800',
      badge: 'bg-amber-500',
      hover: 'hover:bg-amber-100',
      button: 'bg-amber-500 hover:bg-amber-600',
    },
    blue: {
      bg: 'bg-blue-50',
      bgActive: 'bg-blue-100',
      border: 'border-blue-200',
      borderActive: 'border-blue-500',
      text: 'text-blue-700',
      textActive: 'text-blue-800',
      badge: 'bg-blue-500',
      hover: 'hover:bg-blue-100',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const colors = colorClasses[bgColor] || colorClasses.violet;

  const handleDeleteClick = (draft) => {
    setDeleteConfirm({ isOpen: true, draft });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.draft) {
      onDeleteDraft(deleteConfirm.draft.id);
    }
    setDeleteConfirm({ isOpen: false, draft: null });
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, draft: null });
  };

  if (draftCarts.length === 0) {
    return null;
  }

  return (
    <>
    <div className={`${colors.bg} border-b ${colors.border} px-4 py-3`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart size={16} className={colors.text} />
          <h3 className={`text-sm font-medium ${colors.text}`}>
            Đơn nháp ({draftCarts.length})
          </h3>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* Draft cards */}
          {draftCarts.map((draft) => {
            const isActive = draft.id === activeDraftId;
            const customerName = draft.customer?.short_name || draft.customer?.full_name || draft.customer?.name || 'Không tên';

            return (
              <div
                key={draft.id}
                className={`
                  relative flex-shrink-0 w-32 p-2.5 rounded-lg border-2 transition-all cursor-pointer min-h-[100px]
                  ${isActive
                    ? `${colors.bgActive} ${colors.borderActive} shadow-md`
                    : `${colors.bg} ${colors.border} ${colors.hover}`
                  }
                `}
                onClick={() => !isActive && onSwitchDraft(draft.id)}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(draft);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors z-10 cursor-pointer"
                  title="Xóa đơn nháp"
                >
                  <X size={12} />
                </button>

                {/* Customer name */}
                <p className={`text-sm font-medium truncate mb-1 ${isActive ? colors.textActive : colors.text}`}>
                  {customerName}
                </p>

                {/* Item count badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white ${colors.badge}`}>
                    {draft.items.length} SP
                  </span>
                </div>

                {/* Total amount */}
                <p className={`text-xs font-semibold ${isActive ? colors.textActive : colors.text}`}>
                  {formatCurrency(draft.total)}
                </p>

                {/* Time ago */}
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={10} className="text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {getRelativeTime(draft.updatedAt || draft.createdAt)}
                  </span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none"></div>
                )}
              </div>
            );
          })}

          {/* Add new draft button */}
          {draftCarts.length < 10 && (
            <button
              onClick={onCreateDraft}
              className={`
                flex-shrink-0 w-32 min-h-[100px] rounded-lg border-2 border-dashed cursor-pointer
                ${colors.border} ${colors.hover}
                flex flex-col items-center justify-center gap-1
                transition-all
              `}
              title="Tạo đơn nháp mới"
            >
              <div className={`w-8 h-8 rounded-full ${colors.button} text-white flex items-center justify-center`}>
                <Plus size={16} />
              </div>
              <span className={`text-xs ${colors.text}`}>Thêm mới</span>
            </button>
          )}
        </div>

        {/* Helper text */}
        <p className="text-xs text-gray-500 mt-2">
          Click vào đơn để chuyển đổi • Tối đa 10 đơn nháp
        </p>
      </div>

      {/* Custom scrollbar hide CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      isOpen={deleteConfirm.isOpen}
      onClose={handleCancelDelete}
      onConfirm={handleConfirmDelete}
      title="Xóa đơn nháp?"
      message={
        deleteConfirm.draft
          ? `Xóa đơn của ${deleteConfirm.draft.customer?.short_name || deleteConfirm.draft.customer?.name || 'khách hàng này'}? (${deleteConfirm.draft.items.length} sản phẩm)`
          : ''
      }
      confirmText="Xóa"
      cancelText="Hủy"
      variant="danger"
    />
    </>
  );
};

export default DraftCartPanel;
