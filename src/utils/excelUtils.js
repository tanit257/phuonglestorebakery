import * as XLSX from 'xlsx';
import { PRODUCT_UNITS } from './constants';

// Column headers mapping (Vietnamese)
const EXCEL_HEADERS = {
  name: 'Tên sản phẩm',
  invoice_name: 'Tên hóa đơn',
  product_code: 'Mã hàng hóa',
  unit: 'Đơn vị',
  price: 'Giá bán',
  invoice_price: 'Giá hóa đơn',
  stock: 'Tồn kho',
  bulk_unit: 'Đơn vị lớn',
  bulk_quantity: 'SL/đơn vị lớn',
};

const HEADER_TO_FIELD = Object.entries(EXCEL_HEADERS).reduce(
  (acc, [field, header]) => ({ ...acc, [header]: field }),
  {}
);

const VALID_UNITS = PRODUCT_UNITS.map((u) => u.value);

/**
 * Export products to Excel file
 */
export const exportProductsToExcel = (products, filename = 'san-pham.xlsx') => {
  const exportData = products.map((product) => ({
    [EXCEL_HEADERS.name]: product.name,
    [EXCEL_HEADERS.invoice_name]: product.invoice_name || '',
    [EXCEL_HEADERS.product_code]: product.product_code || '',
    [EXCEL_HEADERS.unit]: product.unit,
    [EXCEL_HEADERS.price]: product.price,
    [EXCEL_HEADERS.invoice_price]:
      product.invoice_price || Math.round(product.price * 0.8),
    [EXCEL_HEADERS.stock]: product.stock || 0,
    [EXCEL_HEADERS.bulk_unit]: product.bulk_unit || '',
    [EXCEL_HEADERS.bulk_quantity]: product.bulk_quantity || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // Tên sản phẩm
    { wch: 30 }, // Tên hóa đơn
    { wch: 15 }, // Mã hàng hóa
    { wch: 12 }, // Đơn vị
    { wch: 15 }, // Giá bán
    { wch: 15 }, // Giá hóa đơn
    { wch: 12 }, // Tồn kho
    { wch: 15 }, // Đơn vị lớn
    { wch: 15 }, // SL/đơn vị lớn
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');

  XLSX.writeFile(workbook, filename);
};

/**
 * Validate a single product row
 */
const validateProductRow = (row, rowIndex) => {
  const errors = [];

  if (!row.name || String(row.name).trim() === '') {
    errors.push(`Dòng ${rowIndex}: Tên sản phẩm không được để trống`);
  }

  if (!row.unit || String(row.unit).trim() === '') {
    errors.push(`Dòng ${rowIndex}: Đơn vị không được để trống`);
  } else if (!VALID_UNITS.includes(row.unit)) {
    errors.push(
      `Dòng ${rowIndex}: Đơn vị "${row.unit}" không hợp lệ. Các đơn vị hợp lệ: ${VALID_UNITS.join(', ')}`
    );
  }

  if (row.price === undefined || row.price === null || row.price === '') {
    errors.push(`Dòng ${rowIndex}: Giá bán không được để trống`);
  } else if (isNaN(Number(row.price)) || Number(row.price) < 0) {
    errors.push(`Dòng ${rowIndex}: Giá bán phải là số không âm`);
  }

  if (
    row.invoice_price !== undefined &&
    row.invoice_price !== '' &&
    (isNaN(Number(row.invoice_price)) || Number(row.invoice_price) < 0)
  ) {
    errors.push(`Dòng ${rowIndex}: Giá hóa đơn phải là số không âm`);
  }

  if (
    row.stock !== undefined &&
    row.stock !== '' &&
    (isNaN(Number(row.stock)) || Number(row.stock) < 0)
  ) {
    errors.push(`Dòng ${rowIndex}: Tồn kho phải là số không âm`);
  }

  return errors;
};

/**
 * Parse Excel file and return products data
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          reject(new Error('File Excel không có dữ liệu'));
          return;
        }

        const allErrors = [];
        const products = [];

        jsonData.forEach((row, index) => {
          const rowIndex = index + 2; // Excel rows start at 1, plus header row

          // Map Vietnamese headers to field names
          const mappedRow = {};
          Object.keys(row).forEach((key) => {
            const fieldName = HEADER_TO_FIELD[key] || key.toLowerCase();
            mappedRow[fieldName] = row[key];
          });

          const errors = validateProductRow(mappedRow, rowIndex);

          if (errors.length > 0) {
            allErrors.push(...errors);
          } else {
            products.push({
              name: String(mappedRow.name).trim(),
              invoice_name: mappedRow.invoice_name
                ? String(mappedRow.invoice_name).trim()
                : null,
              product_code: mappedRow.product_code
                ? String(mappedRow.product_code).trim()
                : null,
              unit: String(mappedRow.unit).trim(),
              price: Number(mappedRow.price),
              invoice_price:
                mappedRow.invoice_price !== undefined &&
                mappedRow.invoice_price !== ''
                  ? Number(mappedRow.invoice_price)
                  : Math.round(Number(mappedRow.price) * 0.8),
              stock:
                mappedRow.stock !== undefined && mappedRow.stock !== ''
                  ? Number(mappedRow.stock)
                  : 0,
              bulk_unit: mappedRow.bulk_unit
                ? String(mappedRow.bulk_unit).trim()
                : null,
              bulk_quantity: mappedRow.bulk_quantity
                ? Number(mappedRow.bulk_quantity)
                : null,
            });
          }
        });

        resolve({
          products,
          errors: allErrors,
          totalRows: jsonData.length,
          validRows: products.length,
        });
      } catch (error) {
        reject(new Error('Không thể đọc file Excel: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Create a sample Excel template
 */
export const downloadExcelTemplate = () => {
  const sampleData = [
    {
      [EXCEL_HEADERS.name]: 'Bột mì đa dụng',
      [EXCEL_HEADERS.invoice_name]: 'Bột mì cao cấp loại 1',
      [EXCEL_HEADERS.product_code]: 'SP001',
      [EXCEL_HEADERS.unit]: 'kg',
      [EXCEL_HEADERS.price]: 25000,
      [EXCEL_HEADERS.invoice_price]: 20000,
      [EXCEL_HEADERS.stock]: 100,
      [EXCEL_HEADERS.bulk_unit]: 'bao',
      [EXCEL_HEADERS.bulk_quantity]: 25,
    },
    {
      [EXCEL_HEADERS.name]: 'Đường trắng',
      [EXCEL_HEADERS.invoice_name]: '',
      [EXCEL_HEADERS.product_code]: '',
      [EXCEL_HEADERS.unit]: 'kg',
      [EXCEL_HEADERS.price]: 22000,
      [EXCEL_HEADERS.invoice_price]: 17600,
      [EXCEL_HEADERS.stock]: 150,
      [EXCEL_HEADERS.bulk_unit]: '',
      [EXCEL_HEADERS.bulk_quantity]: '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  worksheet['!cols'] = [
    { wch: 30 }, // Tên sản phẩm
    { wch: 30 }, // Tên hóa đơn
    { wch: 15 }, // Mã hàng hóa
    { wch: 12 }, // Đơn vị
    { wch: 15 }, // Giá bán
    { wch: 15 }, // Giá hóa đơn
    { wch: 12 }, // Tồn kho
    { wch: 15 }, // Đơn vị lớn
    { wch: 15 }, // SL/đơn vị lớn
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');

  XLSX.writeFile(workbook, 'mau-san-pham.xlsx');
};

/**
 * Normalize product name for comparison
 */
const normalizeName = (name) => String(name).toLowerCase().trim();

/**
 * Categorize imported products into new and existing
 */
export const categorizeProducts = (importedProducts, existingProducts) => {
  const existingMap = new Map(
    existingProducts.map((p) => [normalizeName(p.name), p])
  );

  const newProducts = [];
  const duplicateProducts = [];

  for (const product of importedProducts) {
    const normalizedName = normalizeName(product.name);
    const existing = existingMap.get(normalizedName);

    if (existing) {
      duplicateProducts.push({
        ...product,
        existingId: existing.id,
        existingProduct: existing,
      });
    } else {
      newProducts.push(product);
    }
  }

  return {
    newProducts,
    duplicateProducts,
    newCount: newProducts.length,
    duplicateCount: duplicateProducts.length,
  };
};
