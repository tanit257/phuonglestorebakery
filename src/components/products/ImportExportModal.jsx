import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  FileDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  exportProductsToExcel,
  parseExcelFile,
  downloadExcelTemplate,
  categorizeProducts,
} from '../../utils/excelUtils';

const ImportExportModal = ({
  isOpen,
  onClose,
  products,
  onImport,
  isInvoiceMode,
}) => {
  const [activeTab, setActiveTab] = useState('export');
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMode, setImportMode] = useState('add_new');
  const [categorized, setCategorized] = useState(null);
  const fileInputRef = useRef(null);
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

  useEffect(() => {
    if (!isOpen) {
      setImportFile(null);
      setImportResult(null);
      setIsProcessing(false);
      setImportMode('add_new');
      setCategorized(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    exportProductsToExcel(products, `san-pham-${date}.xlsx`);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setIsProcessing(true);
    setImportResult(null);
    setCategorized(null);

    try {
      const result = await parseExcelFile(file);
      setImportResult(result);

      if (result.products.length > 0) {
        const category = categorizeProducts(result.products, products);
        setCategorized(category);
        setImportMode(category.newCount > 0 ? 'add_new' : 'override');
      }
    } catch (error) {
      setImportResult({
        products: [],
        errors: [error.message],
        totalRows: 0,
        validRows: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!importResult || !categorized) return;

    const hasProducts =
      importMode === 'add_new'
        ? categorized.newCount > 0
        : categorized.newCount > 0 || categorized.duplicateCount > 0;

    if (!hasProducts) return;

    setIsProcessing(true);
    try {
      await onImport(categorized, importMode);
      onClose();
    } catch (error) {
      setImportResult({
        ...importResult,
        errors: [...(importResult.errors || []), error.message],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const themeColor = isInvoiceMode ? 'violet' : 'blue';

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-export-title"
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
            aria-label="Dong"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 bg-${themeColor}-100 rounded-xl flex items-center justify-center`}
            >
              <FileSpreadsheet
                size={24}
                className={`text-${themeColor}-600`}
                aria-hidden="true"
              />
            </div>
            <h2
              id="import-export-title"
              className="text-xl font-bold text-gray-900"
            >
              Import / Export Excel
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'export'
                  ? `bg-${themeColor}-500 text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Download size={16} className="inline mr-2" />
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'import'
                  ? `bg-${themeColor}-500 text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload size={16} className="inline mr-2" />
              Import
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm mb-3">
                  Xuất danh sach <strong>{products.length}</strong> san pham ra
                  file Excel.
                </p>
                <p className="text-gray-500 text-xs">
                  File se bao gom: Ten san pham, Don vi, Gia ban, Gia hoa don,
                  Ton kho, Don vi lon, SL/don vi lon.
                </p>
              </div>

              <Button
                fullWidth
                icon={Download}
                onClick={handleExport}
                className={`bg-${themeColor}-500 hover:bg-${themeColor}-600`}
              >
                Tai xuong file Excel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Template download */}
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-blue-800 text-sm mb-2">
                  Chua co file mau? Tai file mau de dien san pham.
                </p>
                <button
                  onClick={downloadExcelTemplate}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  <FileDown size={16} />
                  Tai file mau
                </button>
              </div>

              {/* File upload */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  importFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {importFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <FileSpreadsheet size={24} />
                    <span className="font-medium">{importFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 text-sm mb-2">
                      Chon file Excel (.xlsx, .xls)
                    </p>
                  </>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                    importFile
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : `bg-${themeColor}-100 text-${themeColor}-700 hover:bg-${themeColor}-200`
                  }`}
                >
                  {importFile ? 'Chon file khac' : 'Chon file'}
                </button>
              </div>

              {/* Processing indicator */}
              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 text-sm mt-2">Dang xu ly...</p>
                </div>
              )}

              {/* Import result */}
              {importResult && !isProcessing && (
                <div className="space-y-3">
                  {importResult.errors.length > 0 && (
                    <div className="bg-rose-50 rounded-xl p-4">
                      <div className="flex items-start gap-2 text-rose-700">
                        <AlertCircle
                          size={20}
                          className="shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-medium">
                            Co {importResult.errors.length} loi
                          </p>
                          <ul className="text-sm mt-1 space-y-1">
                            {importResult.errors.slice(0, 5).map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                            {importResult.errors.length > 5 && (
                              <li>
                                ...va {importResult.errors.length - 5} loi khac
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {importResult.validRows > 0 && categorized && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle size={20} aria-hidden="true" />
                        <span>
                          <strong>{importResult.validRows}</strong>/
                          {importResult.totalRows} san pham hop le
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-green-600">
                        <span className="inline-block mr-3">
                          Moi: <strong>{categorized.newCount}</strong>
                        </span>
                        <span className="inline-block">
                          Trung: <strong>{categorized.duplicateCount}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Import mode selection */}
                  {categorized && importResult.validRows > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Che do import:
                      </p>
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          importMode === 'add_new'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="add_new"
                          checked={importMode === 'add_new'}
                          onChange={() => setImportMode('add_new')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            Chi them moi
                          </p>
                          <p className="text-xs text-gray-500">
                            Them {categorized.newCount} san pham moi, bo qua{' '}
                            {categorized.duplicateCount} san pham da ton tai
                          </p>
                        </div>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          importMode === 'override'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="override"
                          checked={importMode === 'override'}
                          onChange={() => setImportMode('override')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            Ghi de trung
                          </p>
                          <p className="text-xs text-gray-500">
                            Them {categorized.newCount} san pham moi, cap nhat{' '}
                            {categorized.duplicateCount} san pham trung ten
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {categorized &&
                    (importMode === 'add_new'
                      ? categorized.newCount > 0
                      : categorized.newCount > 0 ||
                        categorized.duplicateCount > 0) && (
                      <Button
                        fullWidth
                        icon={Upload}
                        onClick={handleImportConfirm}
                        disabled={isProcessing}
                        className={`bg-${themeColor}-500 hover:bg-${themeColor}-600`}
                      >
                        {importMode === 'add_new'
                          ? `Them ${categorized.newCount} san pham moi`
                          : `Import ${categorized.newCount + categorized.duplicateCount} san pham`}
                      </Button>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;
