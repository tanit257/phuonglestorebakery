import * as XLSX from 'xlsx';
import { CUSTOMER_TYPES } from './constants';

// Column headers mapping (Vietnamese)
const CUSTOMER_EXCEL_HEADERS = {
  short_name: 'Tên viết tắt',
  full_name: 'Tên đầy đủ',
  type: 'Loại KH',
  phone: 'Điện thoại',
  email: 'Email',
  address: 'Địa chỉ giao hàng',
  billing_address: 'Địa chỉ hóa đơn',
  tax_code: 'Mã số thuế',
};

const HEADER_TO_FIELD = Object.entries(CUSTOMER_EXCEL_HEADERS).reduce(
  (acc, [field, header]) => ({ ...acc, [header]: field }),
  {}
);

const VALID_TYPES = Object.values(CUSTOMER_TYPES);

const TYPE_LABELS = {
  bakery: 'Tiệm bánh',
  individual: 'Cá nhân',
  supplier: 'Nhà cung cấp',
};

const LABEL_TO_TYPE = {
  'Tiệm bánh': CUSTOMER_TYPES.BAKERY,
  'Cá nhân': CUSTOMER_TYPES.INDIVIDUAL,
  'Nhà cung cấp': CUSTOMER_TYPES.SUPPLIER,
  bakery: CUSTOMER_TYPES.BAKERY,
  individual: CUSTOMER_TYPES.INDIVIDUAL,
  supplier: CUSTOMER_TYPES.SUPPLIER,
};

/**
 * Export customers to Excel file
 */
export const exportCustomersToExcel = (customers, filename = 'khach-hang.xlsx') => {
  const exportData = customers.map((customer) => ({
    [CUSTOMER_EXCEL_HEADERS.short_name]: customer.short_name,
    [CUSTOMER_EXCEL_HEADERS.full_name]: customer.full_name || '',
    [CUSTOMER_EXCEL_HEADERS.type]: TYPE_LABELS[customer.type] || 'Tiệm bánh',
    [CUSTOMER_EXCEL_HEADERS.phone]: customer.phone || '',
    [CUSTOMER_EXCEL_HEADERS.email]: customer.email || '',
    [CUSTOMER_EXCEL_HEADERS.address]: customer.address || '',
    [CUSTOMER_EXCEL_HEADERS.billing_address]: customer.billing_address || '',
    [CUSTOMER_EXCEL_HEADERS.tax_code]: customer.tax_code || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Tên viết tắt
    { wch: 30 }, // Tên đầy đủ
    { wch: 15 }, // Loại KH
    { wch: 15 }, // Điện thoại
    { wch: 25 }, // Email
    { wch: 35 }, // Địa chỉ giao hàng
    { wch: 35 }, // Địa chỉ hóa đơn
    { wch: 15 }, // Mã số thuế
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Khách hàng');

  XLSX.writeFile(workbook, filename);
};

/**
 * Validate a single customer row
 */
const validateCustomerRow = (row, rowIndex) => {
  const errors = [];

  if (!row.short_name || String(row.short_name).trim() === '') {
    errors.push(`Dòng ${rowIndex}: Tên viết tắt không được để trống`);
  }

  if (row.type && !LABEL_TO_TYPE[row.type]) {
    errors.push(
      `Dòng ${rowIndex}: Loại KH "${row.type}" không hợp lệ. Các loại hợp lệ: Tiệm bánh, Cá nhân, Nhà cung cấp`
    );
  }

  if (row.email && row.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email.trim())) {
      errors.push(`Dòng ${rowIndex}: Email "${row.email}" không hợp lệ`);
    }
  }

  return errors;
};

/**
 * Parse Excel file and return customers data
 */
export const parseCustomerExcelFile = (file) => {
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
        const customers = [];

        jsonData.forEach((row, index) => {
          const rowIndex = index + 2; // Excel rows start at 1, plus header row

          // Map Vietnamese headers to field names
          const mappedRow = {};
          Object.keys(row).forEach((key) => {
            const fieldName = HEADER_TO_FIELD[key] || key.toLowerCase();
            mappedRow[fieldName] = row[key];
          });

          const errors = validateCustomerRow(mappedRow, rowIndex);

          if (errors.length > 0) {
            allErrors.push(...errors);
          } else {
            const typeValue = mappedRow.type
              ? LABEL_TO_TYPE[mappedRow.type] || CUSTOMER_TYPES.BAKERY
              : CUSTOMER_TYPES.BAKERY;

            customers.push({
              short_name: String(mappedRow.short_name).trim(),
              full_name: mappedRow.full_name
                ? String(mappedRow.full_name).trim()
                : '',
              type: typeValue,
              phone: mappedRow.phone ? String(mappedRow.phone).trim() : '',
              email: mappedRow.email ? String(mappedRow.email).trim() : '',
              address: mappedRow.address ? String(mappedRow.address).trim() : '',
              billing_address: mappedRow.billing_address
                ? String(mappedRow.billing_address).trim()
                : '',
              tax_code: mappedRow.tax_code
                ? String(mappedRow.tax_code).trim()
                : '',
            });
          }
        });

        resolve({
          customers,
          errors: allErrors,
          totalRows: jsonData.length,
          validRows: customers.length,
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
 * Create a sample Excel template for customers
 */
export const downloadCustomerExcelTemplate = () => {
  const sampleData = [
    {
      [CUSTOMER_EXCEL_HEADERS.short_name]: 'Tiệm ABC',
      [CUSTOMER_EXCEL_HEADERS.full_name]: 'Tiệm bánh ABC - Chi nhánh 1',
      [CUSTOMER_EXCEL_HEADERS.type]: 'Tiệm bánh',
      [CUSTOMER_EXCEL_HEADERS.phone]: '0901234567',
      [CUSTOMER_EXCEL_HEADERS.email]: 'abc@email.com',
      [CUSTOMER_EXCEL_HEADERS.address]: '123 Nguyễn Văn A, Q1, TP.HCM',
      [CUSTOMER_EXCEL_HEADERS.billing_address]: '456 Lê Văn B, Q2, TP.HCM',
      [CUSTOMER_EXCEL_HEADERS.tax_code]: '0123456789',
    },
    {
      [CUSTOMER_EXCEL_HEADERS.short_name]: 'Chị Mai',
      [CUSTOMER_EXCEL_HEADERS.full_name]: '',
      [CUSTOMER_EXCEL_HEADERS.type]: 'Cá nhân',
      [CUSTOMER_EXCEL_HEADERS.phone]: '0909876543',
      [CUSTOMER_EXCEL_HEADERS.email]: '',
      [CUSTOMER_EXCEL_HEADERS.address]: '789 Trần Hưng Đạo, Q5',
      [CUSTOMER_EXCEL_HEADERS.billing_address]: '',
      [CUSTOMER_EXCEL_HEADERS.tax_code]: '',
    },
    {
      [CUSTOMER_EXCEL_HEADERS.short_name]: 'NCC Bột Việt',
      [CUSTOMER_EXCEL_HEADERS.full_name]: 'Công ty TNHH Bột Việt Nam',
      [CUSTOMER_EXCEL_HEADERS.type]: 'Nhà cung cấp',
      [CUSTOMER_EXCEL_HEADERS.phone]: '02812345678',
      [CUSTOMER_EXCEL_HEADERS.email]: 'contact@botviet.vn',
      [CUSTOMER_EXCEL_HEADERS.address]: 'KCN Tân Bình, TP.HCM',
      [CUSTOMER_EXCEL_HEADERS.billing_address]: 'KCN Tân Bình, TP.HCM',
      [CUSTOMER_EXCEL_HEADERS.tax_code]: '0987654321',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 35 },
    { wch: 35 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Khách hàng');

  XLSX.writeFile(workbook, 'mau-khach-hang.xlsx');
};

/**
 * Normalize customer name for comparison
 */
const normalizeName = (name) => String(name).toLowerCase().trim();

/**
 * Categorize imported customers into new and existing
 */
export const categorizeCustomers = (importedCustomers, existingCustomers) => {
  const existingMap = new Map(
    existingCustomers.map((c) => [normalizeName(c.short_name), c])
  );

  const newCustomers = [];
  const duplicateCustomers = [];

  for (const customer of importedCustomers) {
    const normalizedName = normalizeName(customer.short_name);
    const existing = existingMap.get(normalizedName);

    if (existing) {
      duplicateCustomers.push({
        ...customer,
        existingId: existing.id,
        existingCustomer: existing,
      });
    } else {
      newCustomers.push(customer);
    }
  }

  return {
    newCustomers,
    duplicateCustomers,
    newCount: newCustomers.length,
    duplicateCount: duplicateCustomers.length,
  };
};
