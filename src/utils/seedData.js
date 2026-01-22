// Seed data for testing debt page with multiple months
export const generateSeedData = () => {
  const now = new Date();

  // Generate dates for last 6 months
  const getDateMonthsAgo = (monthsAgo, day = 15) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - monthsAgo);
    date.setDate(day);
    return date.toISOString();
  };

  // Sample customers
  const customers = [
    {
      id: 'cust-1',
      name: 'Anh Quân',
      type: 'bakery',
      phone: '0901234567',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'cust-2',
      name: 'Chị Hương',
      type: 'individual',
      phone: '0912345678',
      created_at: getDateMonthsAgo(5)
    },
    {
      id: 'cust-3',
      name: 'Anh Tuấn',
      type: 'bakery',
      phone: '0923456789',
      created_at: getDateMonthsAgo(4)
    },
    {
      id: 'cust-4',
      name: 'Chị Linh',
      type: 'individual',
      phone: '0934567890',
      created_at: getDateMonthsAgo(3)
    },
    {
      id: 'cust-5',
      name: 'Anh Minh',
      type: 'individual',
      phone: '0945678901',
      created_at: getDateMonthsAgo(2)
    },
    {
      id: 'supplier-1',
      name: 'Công ty TNHH Bột Mì Sài Gòn',
      type: 'supplier',
      phone: '0283456789',
      address: '123 Đường 3/2, Quận 10, TP.HCM',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'supplier-2',
      name: 'Nhà phân phối Nguyên liệu Á Châu',
      type: 'supplier',
      phone: '0287654321',
      address: '456 Lý Thường Kiệt, Quận 11, TP.HCM',
      created_at: getDateMonthsAgo(6)
    }
  ];

  // Sample products with both real price and invoice price
  const products = [
    {
      id: 'prod-1',
      name: 'Đường trắng',
      price: 25000,          // Giá thực tế
      invoice_price: 20000,  // Giá hóa đơn (thấp hơn 20%)
      stock: 100,
      unit: 'kg',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'prod-2',
      name: 'Đường đen',
      price: 30000,
      invoice_price: 24000,
      stock: 80,
      unit: 'kg',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'prod-3',
      name: 'Bột cacao',
      price: 120000,
      invoice_price: 96000,
      stock: 50,
      unit: 'kg',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'prod-4',
      name: 'Socola đen',
      price: 150000,
      invoice_price: 120000,
      stock: 40,
      unit: 'kg',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'prod-5',
      name: 'Hạt hạnh nhân',
      price: 200000,
      invoice_price: 160000,
      stock: 30,
      unit: 'kg',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'prod-6',
      name: 'Bột mì',
      price: 35000,
      invoice_price: 28000,
      stock: 150,
      unit: 'kg',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'prod-7',
      name: 'Bột Khai',
      price: 45000,
      invoice_price: 36000,
      stock: 60,
      unit: 'kg',
      created_at: getDateMonthsAgo(5)
    },
    {
      id: 'prod-8',
      name: 'Gà',
      price: 180000,
      invoice_price: 144000,
      stock: 25,
      unit: 'kg',
      created_at: getDateMonthsAgo(5)
    },
    {
      id: 'prod-9',
      name: 'Phô mai cream',
      price: 75000,
      invoice_price: 60000,
      stock: 45,
      unit: 'hộp',
      created_at: getDateMonthsAgo(4)
    },
    {
      id: 'prod-10',
      name: 'Ba Hưng',
      price: 55000,
      invoice_price: 44000,
      stock: 70,
      unit: 'kg',
      created_at: getDateMonthsAgo(4)
    }
  ];

  // Generate orders across multiple months
  const orders = [
    // Month 5 ago - Anh Quân
    {
      id: 'order-1',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 5, unit_price: 25000, subtotal: 125000 },
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 2, unit_price: 120000, subtotal: 240000 }
      ],
      total: 365000,
      paid: true,
      created_at: getDateMonthsAgo(5, 5)
    },
    {
      id: 'order-2',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 3, unit_price: 150000, subtotal: 450000 }
      ],
      total: 450000,
      paid: false,
      created_at: getDateMonthsAgo(5, 20)
    },

    // Month 4 ago - Chị Hương
    {
      id: 'order-3',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 2, unit_price: 200000, subtotal: 400000 },
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 10, unit_price: 35000, subtotal: 350000 }
      ],
      total: 750000,
      paid: false,
      created_at: getDateMonthsAgo(4, 8)
    },
    {
      id: 'order-4',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 5, unit_price: 45000, subtotal: 225000 }
      ],
      total: 225000,
      paid: true,
      created_at: getDateMonthsAgo(4, 25)
    },

    // Month 3 ago - Anh Tuấn
    {
      id: 'order-5',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 4, unit_price: 180000, subtotal: 720000 },
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 5, unit_price: 30000, subtotal: 150000 }
      ],
      total: 870000,
      paid: false,
      created_at: getDateMonthsAgo(3, 10)
    },

    // Month 2 ago - Chị Linh
    {
      id: 'order-6',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 6, unit_price: 75000, subtotal: 450000 },
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 8, unit_price: 25000, subtotal: 200000 }
      ],
      total: 650000,
      paid: false,
      created_at: getDateMonthsAgo(2, 12)
    },
    {
      id: 'order-7',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 3, unit_price: 55000, subtotal: 165000 }
      ],
      total: 165000,
      paid: false,
      created_at: getDateMonthsAgo(2, 22)
    },

    // Month 1 ago - Anh Minh
    {
      id: 'order-8',
      customer_id: 'cust-5',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 5, unit_price: 120000, subtotal: 600000 },
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 4, unit_price: 150000, subtotal: 600000 }
      ],
      total: 1200000,
      paid: true,
      created_at: getDateMonthsAgo(1, 5)
    },
    {
      id: 'order-9',
      customer_id: 'cust-5',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 3, unit_price: 200000, subtotal: 600000 }
      ],
      total: 600000,
      paid: false,
      created_at: getDateMonthsAgo(1, 18)
    },

    // Current month - Multiple customers
    {
      id: 'order-10',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 15, unit_price: 35000, subtotal: 525000 }
      ],
      total: 525000,
      paid: false,
      created_at: getDateMonthsAgo(0, 3)
    },
    {
      id: 'order-11',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 2, unit_price: 180000, subtotal: 360000 },
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 4, unit_price: 75000, subtotal: 300000 }
      ],
      total: 660000,
      paid: false,
      created_at: getDateMonthsAgo(0, 10)
    },
    {
      id: 'order-12',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 10, unit_price: 30000, subtotal: 300000 },
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 8, unit_price: 45000, subtotal: 360000 }
      ],
      total: 660000,
      paid: true,
      created_at: getDateMonthsAgo(0, 15)
    }
  ];

  // Invoice orders (using invoice_price) - Đơn hàng hóa đơn cho sổ sách thuế
  const invoiceOrders = [
    // Month 5 ago - Anh Quân
    {
      id: 'inv-order-1',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 5, unit_price: 20000, subtotal: 100000 },
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 2, unit_price: 96000, subtotal: 192000 }
      ],
      total: 292000,
      paid: true,
      created_at: getDateMonthsAgo(5, 5)
    },
    {
      id: 'inv-order-2',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 3, unit_price: 120000, subtotal: 360000 }
      ],
      total: 360000,
      paid: false,
      created_at: getDateMonthsAgo(5, 20)
    },

    // Month 4 ago - Chị Hương
    {
      id: 'inv-order-3',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 2, unit_price: 160000, subtotal: 320000 },
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 10, unit_price: 28000, subtotal: 280000 }
      ],
      total: 600000,
      paid: false,
      created_at: getDateMonthsAgo(4, 8)
    },

    // Month 3 ago - Anh Tuấn
    {
      id: 'inv-order-4',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 4, unit_price: 144000, subtotal: 576000 },
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 5, unit_price: 24000, subtotal: 120000 }
      ],
      total: 696000,
      paid: false,
      created_at: getDateMonthsAgo(3, 10)
    },

    // Month 2 ago - Chị Linh
    {
      id: 'inv-order-5',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 6, unit_price: 60000, subtotal: 360000 },
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 8, unit_price: 20000, subtotal: 160000 }
      ],
      total: 520000,
      paid: false,
      created_at: getDateMonthsAgo(2, 12)
    },

    // Month 1 ago - Anh Minh
    {
      id: 'inv-order-6',
      customer_id: 'cust-5',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 5, unit_price: 96000, subtotal: 480000 },
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 4, unit_price: 120000, subtotal: 480000 }
      ],
      total: 960000,
      paid: true,
      created_at: getDateMonthsAgo(1, 5)
    },

    // Current month - Multiple customers
    {
      id: 'inv-order-7',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 15, unit_price: 28000, subtotal: 420000 }
      ],
      total: 420000,
      paid: false,
      created_at: getDateMonthsAgo(0, 3)
    },
    {
      id: 'inv-order-8',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 2, unit_price: 144000, subtotal: 288000 },
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 4, unit_price: 60000, subtotal: 240000 }
      ],
      total: 528000,
      paid: false,
      created_at: getDateMonthsAgo(0, 10)
    }
  ];

  // Invoice inventory - tồn kho hóa đơn (thường khác với tồn kho thực tế)
  const invoiceInventory = [
    { product_id: 'prod-1', quantity: 80 },   // Đường trắng - tồn kho hóa đơn thấp hơn thực tế
    { product_id: 'prod-2', quantity: 65 },   // Đường đen
    { product_id: 'prod-3', quantity: 40 },   // Bột cacao
    { product_id: 'prod-4', quantity: 35 },   // Socola đen
    { product_id: 'prod-5', quantity: 25 },   // Hạt hạnh nhân
    { product_id: 'prod-6', quantity: 120 },  // Bột mì
    { product_id: 'prod-7', quantity: 50 },   // Bột Khai
    { product_id: 'prod-8', quantity: 20 },   // Gà
    { product_id: 'prod-9', quantity: 35 },   // Phô mai cream
    { product_id: 'prod-10', quantity: 55 },  // Ba Hưng
  ];

  return { customers, products, orders, invoiceOrders, invoiceInventory };
};
