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
      short_name: 'Tiệm Anh Quân',
      full_name: 'Tiệm bánh Anh Quân',
      type: 'bakery',
      phone: '0901234567',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'cust-2',
      short_name: 'Chị Hương',
      full_name: 'Nguyễn Thị Hương',
      type: 'individual',
      phone: '0912345678',
      created_at: getDateMonthsAgo(5)
    },
    {
      id: 'cust-3',
      short_name: 'Tiệm Anh Tuấn',
      full_name: 'Tiệm bánh Anh Tuấn',
      type: 'bakery',
      phone: '0934567890',
      created_at: getDateMonthsAgo(4)
    },
    {
      id: 'cust-4',
      short_name: 'Chị Linh',
      full_name: 'Trần Thị Linh',
      type: 'individual',
      phone: '0934567890',
      created_at: getDateMonthsAgo(3)
    },
    {
      id: 'cust-5',
      short_name: 'Anh Minh',
      full_name: 'Lê Văn Minh',
      type: 'individual',
      phone: '0945678901',
      created_at: getDateMonthsAgo(2)
    },
    {
      id: 'supplier-1',
      short_name: 'Bột Mì SG',
      full_name: 'Công ty TNHH Bột Mì Sài Gòn',
      type: 'supplier',
      phone: '0283456789',
      address: '123 Đường 3/2, Quận 10, TP.HCM',
      created_at: getDateMonthsAgo(6)
    },
    {
      id: 'supplier-2',
      short_name: 'NL Á Châu',
      full_name: 'Nhà phân phối Nguyên liệu Á Châu',
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
  // Thêm nhiều đơn hàng thực tế cho Anh Quân (cust-1) và Anh Tuấn (cust-3)
  const orders = [
    // ============ Month 5 ago ============
    // Anh Quân - 5 đơn
    {
      id: 'order-1',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 5, unit_price: 25000, subtotal: 125000 },
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 2, unit_price: 120000, subtotal: 240000 }
      ],
      total: 365000,
      paid: true,
      created_at: getDateMonthsAgo(5, 2)
    },
    {
      id: 'order-2',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 3, unit_price: 150000, subtotal: 450000 }
      ],
      total: 450000,
      paid: false,
      created_at: getDateMonthsAgo(5, 8)
    },
    {
      id: 'order-3',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 20, unit_price: 35000, subtotal: 700000 },
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 10, unit_price: 30000, subtotal: 300000 }
      ],
      total: 1000000,
      paid: true,
      created_at: getDateMonthsAgo(5, 15)
    },
    {
      id: 'order-4',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 2, unit_price: 200000, subtotal: 400000 }
      ],
      total: 400000,
      paid: false,
      created_at: getDateMonthsAgo(5, 20)
    },
    {
      id: 'order-5',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 3, unit_price: 180000, subtotal: 540000 }
      ],
      total: 540000,
      paid: true,
      created_at: getDateMonthsAgo(5, 26)
    },
    // Anh Tuấn - 4 đơn
    {
      id: 'order-6',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 8, unit_price: 25000, subtotal: 200000 },
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 5, unit_price: 45000, subtotal: 225000 }
      ],
      total: 425000,
      paid: true,
      created_at: getDateMonthsAgo(5, 5)
    },
    {
      id: 'order-7',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 6, unit_price: 75000, subtotal: 450000 }
      ],
      total: 450000,
      paid: false,
      created_at: getDateMonthsAgo(5, 12)
    },
    {
      id: 'order-8',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 4, unit_price: 120000, subtotal: 480000 },
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 6, unit_price: 55000, subtotal: 330000 }
      ],
      total: 810000,
      paid: true,
      created_at: getDateMonthsAgo(5, 22)
    },
    {
      id: 'order-9',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 15, unit_price: 35000, subtotal: 525000 }
      ],
      total: 525000,
      paid: false,
      created_at: getDateMonthsAgo(5, 28)
    },

    // ============ Month 4 ago ============
    // Anh Quân - 6 đơn
    {
      id: 'order-10',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 12, unit_price: 30000, subtotal: 360000 }
      ],
      total: 360000,
      paid: true,
      created_at: getDateMonthsAgo(4, 3)
    },
    {
      id: 'order-11',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 8, unit_price: 45000, subtotal: 360000 },
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 10, unit_price: 25000, subtotal: 250000 }
      ],
      total: 610000,
      paid: false,
      created_at: getDateMonthsAgo(4, 7)
    },
    {
      id: 'order-12',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 5, unit_price: 150000, subtotal: 750000 }
      ],
      total: 750000,
      paid: true,
      created_at: getDateMonthsAgo(4, 12)
    },
    {
      id: 'order-13',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 10, unit_price: 75000, subtotal: 750000 }
      ],
      total: 750000,
      paid: false,
      created_at: getDateMonthsAgo(4, 18)
    },
    {
      id: 'order-14',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 25, unit_price: 35000, subtotal: 875000 },
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 3, unit_price: 120000, subtotal: 360000 }
      ],
      total: 1235000,
      paid: true,
      created_at: getDateMonthsAgo(4, 22)
    },
    {
      id: 'order-15',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 4, unit_price: 180000, subtotal: 720000 }
      ],
      total: 720000,
      paid: false,
      created_at: getDateMonthsAgo(4, 28)
    },
    // Anh Tuấn - 5 đơn
    {
      id: 'order-16',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 3, unit_price: 200000, subtotal: 600000 }
      ],
      total: 600000,
      paid: true,
      created_at: getDateMonthsAgo(4, 4)
    },
    {
      id: 'order-17',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 15, unit_price: 25000, subtotal: 375000 },
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 8, unit_price: 30000, subtotal: 240000 }
      ],
      total: 615000,
      paid: false,
      created_at: getDateMonthsAgo(4, 10)
    },
    {
      id: 'order-18',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 4, unit_price: 150000, subtotal: 600000 }
      ],
      total: 600000,
      paid: true,
      created_at: getDateMonthsAgo(4, 16)
    },
    {
      id: 'order-19',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 10, unit_price: 55000, subtotal: 550000 }
      ],
      total: 550000,
      paid: false,
      created_at: getDateMonthsAgo(4, 23)
    },
    {
      id: 'order-20',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 20, unit_price: 35000, subtotal: 700000 },
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 6, unit_price: 45000, subtotal: 270000 }
      ],
      total: 970000,
      paid: true,
      created_at: getDateMonthsAgo(4, 29)
    },

    // ============ Month 3 ago ============
    // Anh Quân - 5 đơn
    {
      id: 'order-21',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 5, unit_price: 120000, subtotal: 600000 }
      ],
      total: 600000,
      paid: true,
      created_at: getDateMonthsAgo(3, 2)
    },
    {
      id: 'order-22',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 20, unit_price: 25000, subtotal: 500000 },
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 2, unit_price: 200000, subtotal: 400000 }
      ],
      total: 900000,
      paid: false,
      created_at: getDateMonthsAgo(3, 8)
    },
    {
      id: 'order-23',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 8, unit_price: 75000, subtotal: 600000 }
      ],
      total: 600000,
      paid: true,
      created_at: getDateMonthsAgo(3, 15)
    },
    {
      id: 'order-24',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 6, unit_price: 150000, subtotal: 900000 }
      ],
      total: 900000,
      paid: false,
      created_at: getDateMonthsAgo(3, 21)
    },
    {
      id: 'order-25',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 30, unit_price: 35000, subtotal: 1050000 }
      ],
      total: 1050000,
      paid: true,
      created_at: getDateMonthsAgo(3, 27)
    },
    // Anh Tuấn - 6 đơn
    {
      id: 'order-26',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 4, unit_price: 180000, subtotal: 720000 },
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 5, unit_price: 30000, subtotal: 150000 }
      ],
      total: 870000,
      paid: false,
      created_at: getDateMonthsAgo(3, 3)
    },
    {
      id: 'order-27',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 3, unit_price: 120000, subtotal: 360000 }
      ],
      total: 360000,
      paid: true,
      created_at: getDateMonthsAgo(3, 7)
    },
    {
      id: 'order-28',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 10, unit_price: 45000, subtotal: 450000 },
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 12, unit_price: 25000, subtotal: 300000 }
      ],
      total: 750000,
      paid: false,
      created_at: getDateMonthsAgo(3, 13)
    },
    {
      id: 'order-29',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 4, unit_price: 200000, subtotal: 800000 }
      ],
      total: 800000,
      paid: true,
      created_at: getDateMonthsAgo(3, 18)
    },
    {
      id: 'order-30',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 5, unit_price: 75000, subtotal: 375000 }
      ],
      total: 375000,
      paid: false,
      created_at: getDateMonthsAgo(3, 23)
    },
    {
      id: 'order-31',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 3, unit_price: 150000, subtotal: 450000 },
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 5, unit_price: 55000, subtotal: 275000 }
      ],
      total: 725000,
      paid: true,
      created_at: getDateMonthsAgo(3, 28)
    },

    // ============ Month 2 ago ============
    // Anh Quân - 6 đơn
    {
      id: 'order-32',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 15, unit_price: 30000, subtotal: 450000 }
      ],
      total: 450000,
      paid: true,
      created_at: getDateMonthsAgo(2, 2)
    },
    {
      id: 'order-33',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 5, unit_price: 180000, subtotal: 900000 }
      ],
      total: 900000,
      paid: false,
      created_at: getDateMonthsAgo(2, 6)
    },
    {
      id: 'order-34',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 18, unit_price: 35000, subtotal: 630000 },
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 7, unit_price: 45000, subtotal: 315000 }
      ],
      total: 945000,
      paid: true,
      created_at: getDateMonthsAgo(2, 12)
    },
    {
      id: 'order-35',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 4, unit_price: 120000, subtotal: 480000 }
      ],
      total: 480000,
      paid: false,
      created_at: getDateMonthsAgo(2, 17)
    },
    {
      id: 'order-36',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 8, unit_price: 55000, subtotal: 440000 }
      ],
      total: 440000,
      paid: true,
      created_at: getDateMonthsAgo(2, 22)
    },
    {
      id: 'order-37',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 3, unit_price: 200000, subtotal: 600000 },
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 2, unit_price: 150000, subtotal: 300000 }
      ],
      total: 900000,
      paid: false,
      created_at: getDateMonthsAgo(2, 28)
    },
    // Anh Tuấn - 5 đơn
    {
      id: 'order-38',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 25, unit_price: 25000, subtotal: 625000 }
      ],
      total: 625000,
      paid: true,
      created_at: getDateMonthsAgo(2, 4)
    },
    {
      id: 'order-39',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 22, unit_price: 35000, subtotal: 770000 },
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 10, unit_price: 30000, subtotal: 300000 }
      ],
      total: 1070000,
      paid: false,
      created_at: getDateMonthsAgo(2, 10)
    },
    {
      id: 'order-40',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 7, unit_price: 75000, subtotal: 525000 }
      ],
      total: 525000,
      paid: true,
      created_at: getDateMonthsAgo(2, 15)
    },
    {
      id: 'order-41',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 3, unit_price: 180000, subtotal: 540000 }
      ],
      total: 540000,
      paid: false,
      created_at: getDateMonthsAgo(2, 21)
    },
    {
      id: 'order-42',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 5, unit_price: 120000, subtotal: 600000 },
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 4, unit_price: 45000, subtotal: 180000 }
      ],
      total: 780000,
      paid: true,
      created_at: getDateMonthsAgo(2, 27)
    },

    // ============ Month 1 ago ============
    // Anh Quân - 5 đơn
    {
      id: 'order-43',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 18, unit_price: 25000, subtotal: 450000 }
      ],
      total: 450000,
      paid: true,
      created_at: getDateMonthsAgo(1, 3)
    },
    {
      id: 'order-44',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 4, unit_price: 150000, subtotal: 600000 },
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 3, unit_price: 120000, subtotal: 360000 }
      ],
      total: 960000,
      paid: false,
      created_at: getDateMonthsAgo(1, 9)
    },
    {
      id: 'order-45',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 12, unit_price: 75000, subtotal: 900000 }
      ],
      total: 900000,
      paid: true,
      created_at: getDateMonthsAgo(1, 15)
    },
    {
      id: 'order-46',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 28, unit_price: 35000, subtotal: 980000 }
      ],
      total: 980000,
      paid: false,
      created_at: getDateMonthsAgo(1, 21)
    },
    {
      id: 'order-47',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 6, unit_price: 180000, subtotal: 1080000 }
      ],
      total: 1080000,
      paid: true,
      created_at: getDateMonthsAgo(1, 27)
    },
    // Anh Tuấn - 6 đơn
    {
      id: 'order-48',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 5, unit_price: 200000, subtotal: 1000000 }
      ],
      total: 1000000,
      paid: true,
      created_at: getDateMonthsAgo(1, 2)
    },
    {
      id: 'order-49',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 12, unit_price: 30000, subtotal: 360000 },
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 15, unit_price: 25000, subtotal: 375000 }
      ],
      total: 735000,
      paid: false,
      created_at: getDateMonthsAgo(1, 7)
    },
    {
      id: 'order-50',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 12, unit_price: 55000, subtotal: 660000 }
      ],
      total: 660000,
      paid: true,
      created_at: getDateMonthsAgo(1, 12)
    },
    {
      id: 'order-51',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 5, unit_price: 150000, subtotal: 750000 }
      ],
      total: 750000,
      paid: false,
      created_at: getDateMonthsAgo(1, 18)
    },
    {
      id: 'order-52',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 25, unit_price: 35000, subtotal: 875000 },
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 6, unit_price: 75000, subtotal: 450000 }
      ],
      total: 1325000,
      paid: true,
      created_at: getDateMonthsAgo(1, 23)
    },
    {
      id: 'order-53',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 8, unit_price: 45000, subtotal: 360000 }
      ],
      total: 360000,
      paid: false,
      created_at: getDateMonthsAgo(1, 28)
    },

    // ============ Current month ============
    // Anh Quân - 7 đơn
    {
      id: 'order-54',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 15, unit_price: 35000, subtotal: 525000 }
      ],
      total: 525000,
      paid: false,
      created_at: getDateMonthsAgo(0, 2)
    },
    {
      id: 'order-55',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 6, unit_price: 120000, subtotal: 720000 }
      ],
      total: 720000,
      paid: true,
      created_at: getDateMonthsAgo(0, 5)
    },
    {
      id: 'order-56',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 22, unit_price: 25000, subtotal: 550000 },
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 10, unit_price: 30000, subtotal: 300000 }
      ],
      total: 850000,
      paid: false,
      created_at: getDateMonthsAgo(0, 8)
    },
    {
      id: 'order-57',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 4, unit_price: 200000, subtotal: 800000 }
      ],
      total: 800000,
      paid: true,
      created_at: getDateMonthsAgo(0, 11)
    },
    {
      id: 'order-58',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 5, unit_price: 180000, subtotal: 900000 }
      ],
      total: 900000,
      paid: false,
      created_at: getDateMonthsAgo(0, 14)
    },
    {
      id: 'order-59',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 3, unit_price: 150000, subtotal: 450000 },
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 5, unit_price: 75000, subtotal: 375000 }
      ],
      total: 825000,
      paid: true,
      created_at: getDateMonthsAgo(0, 17)
    },
    {
      id: 'order-60',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 10, unit_price: 45000, subtotal: 450000 }
      ],
      total: 450000,
      paid: false,
      created_at: getDateMonthsAgo(0, 20)
    },
    // Anh Tuấn - 8 đơn
    {
      id: 'order-61',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 2, unit_price: 180000, subtotal: 360000 },
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 4, unit_price: 75000, subtotal: 300000 }
      ],
      total: 660000,
      paid: false,
      created_at: getDateMonthsAgo(0, 1)
    },
    {
      id: 'order-62',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 20, unit_price: 25000, subtotal: 500000 }
      ],
      total: 500000,
      paid: true,
      created_at: getDateMonthsAgo(0, 4)
    },
    {
      id: 'order-63',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 18, unit_price: 35000, subtotal: 630000 }
      ],
      total: 630000,
      paid: false,
      created_at: getDateMonthsAgo(0, 7)
    },
    {
      id: 'order-64',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 4, unit_price: 120000, subtotal: 480000 },
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 2, unit_price: 200000, subtotal: 400000 }
      ],
      total: 880000,
      paid: true,
      created_at: getDateMonthsAgo(0, 10)
    },
    {
      id: 'order-65',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 14, unit_price: 30000, subtotal: 420000 }
      ],
      total: 420000,
      paid: false,
      created_at: getDateMonthsAgo(0, 13)
    },
    {
      id: 'order-66',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 9, unit_price: 55000, subtotal: 495000 }
      ],
      total: 495000,
      paid: true,
      created_at: getDateMonthsAgo(0, 15)
    },
    {
      id: 'order-67',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 4, unit_price: 150000, subtotal: 600000 },
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 5, unit_price: 45000, subtotal: 225000 }
      ],
      total: 825000,
      paid: false,
      created_at: getDateMonthsAgo(0, 18)
    },
    {
      id: 'order-68',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 8, unit_price: 75000, subtotal: 600000 }
      ],
      total: 600000,
      paid: true,
      created_at: getDateMonthsAgo(0, 21)
    }
  ];

  // Invoice orders (using invoice_price) - Đơn hàng hóa đơn cho sổ sách thuế
  // Thêm nhiều đơn hàng để test filter theo tháng và khách hàng
  const invoiceOrders = [
    // ============ Month 5 ago ============
    // Anh Quân - 3 đơn
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
      created_at: getDateMonthsAgo(5, 12)
    },
    {
      id: 'inv-order-3',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 20, unit_price: 28000, subtotal: 560000 }
      ],
      total: 560000,
      paid: true,
      created_at: getDateMonthsAgo(5, 20)
    },
    // Chị Hương - 2 đơn
    {
      id: 'inv-order-4',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 8, unit_price: 24000, subtotal: 192000 }
      ],
      total: 192000,
      paid: true,
      created_at: getDateMonthsAgo(5, 8)
    },
    {
      id: 'inv-order-5',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 6, unit_price: 36000, subtotal: 216000 },
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 4, unit_price: 44000, subtotal: 176000 }
      ],
      total: 392000,
      paid: false,
      created_at: getDateMonthsAgo(5, 25)
    },

    // ============ Month 4 ago ============
    // Anh Tuấn - 3 đơn
    {
      id: 'inv-order-6',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 2, unit_price: 160000, subtotal: 320000 },
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 10, unit_price: 28000, subtotal: 280000 }
      ],
      total: 600000,
      paid: false,
      created_at: getDateMonthsAgo(4, 3)
    },
    {
      id: 'inv-order-7',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 5, unit_price: 144000, subtotal: 720000 }
      ],
      total: 720000,
      paid: true,
      created_at: getDateMonthsAgo(4, 15)
    },
    {
      id: 'inv-order-8',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 8, unit_price: 60000, subtotal: 480000 }
      ],
      total: 480000,
      paid: false,
      created_at: getDateMonthsAgo(4, 28)
    },
    // Chị Linh - 2 đơn
    {
      id: 'inv-order-9',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 15, unit_price: 20000, subtotal: 300000 },
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 10, unit_price: 24000, subtotal: 240000 }
      ],
      total: 540000,
      paid: true,
      created_at: getDateMonthsAgo(4, 10)
    },
    {
      id: 'inv-order-10',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 3, unit_price: 96000, subtotal: 288000 }
      ],
      total: 288000,
      paid: false,
      created_at: getDateMonthsAgo(4, 22)
    },
    // Anh Minh - 1 đơn
    {
      id: 'inv-order-11',
      customer_id: 'cust-5',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 6, unit_price: 120000, subtotal: 720000 }
      ],
      total: 720000,
      paid: true,
      created_at: getDateMonthsAgo(4, 18)
    },

    // ============ Month 3 ago ============
    // Anh Quân - 2 đơn
    {
      id: 'inv-order-12',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 4, unit_price: 144000, subtotal: 576000 },
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 5, unit_price: 24000, subtotal: 120000 }
      ],
      total: 696000,
      paid: false,
      created_at: getDateMonthsAgo(3, 5)
    },
    {
      id: 'inv-order-13',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 3, unit_price: 160000, subtotal: 480000 }
      ],
      total: 480000,
      paid: true,
      created_at: getDateMonthsAgo(3, 18)
    },
    // Chị Hương - 2 đơn
    {
      id: 'inv-order-14',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 25, unit_price: 28000, subtotal: 700000 }
      ],
      total: 700000,
      paid: false,
      created_at: getDateMonthsAgo(3, 10)
    },
    {
      id: 'inv-order-15',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 5, unit_price: 60000, subtotal: 300000 },
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 6, unit_price: 44000, subtotal: 264000 }
      ],
      total: 564000,
      paid: true,
      created_at: getDateMonthsAgo(3, 25)
    },
    // Anh Tuấn - 1 đơn
    {
      id: 'inv-order-16',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 10, unit_price: 36000, subtotal: 360000 }
      ],
      total: 360000,
      paid: false,
      created_at: getDateMonthsAgo(3, 20)
    },

    // ============ Month 2 ago ============
    // Chị Linh - 3 đơn
    {
      id: 'inv-order-17',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 6, unit_price: 60000, subtotal: 360000 },
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 8, unit_price: 20000, subtotal: 160000 }
      ],
      total: 520000,
      paid: false,
      created_at: getDateMonthsAgo(2, 5)
    },
    {
      id: 'inv-order-18',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 4, unit_price: 120000, subtotal: 480000 }
      ],
      total: 480000,
      paid: true,
      created_at: getDateMonthsAgo(2, 12)
    },
    {
      id: 'inv-order-19',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 3, unit_price: 144000, subtotal: 432000 }
      ],
      total: 432000,
      paid: false,
      created_at: getDateMonthsAgo(2, 22)
    },
    // Anh Minh - 2 đơn
    {
      id: 'inv-order-20',
      customer_id: 'cust-5',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 4, unit_price: 96000, subtotal: 384000 },
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 2, unit_price: 160000, subtotal: 320000 }
      ],
      total: 704000,
      paid: true,
      created_at: getDateMonthsAgo(2, 8)
    },
    {
      id: 'inv-order-21',
      customer_id: 'cust-5',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 30, unit_price: 28000, subtotal: 840000 }
      ],
      total: 840000,
      paid: false,
      created_at: getDateMonthsAgo(2, 18)
    },
    // Anh Quân - 1 đơn
    {
      id: 'inv-order-22',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 12, unit_price: 24000, subtotal: 288000 },
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 8, unit_price: 36000, subtotal: 288000 }
      ],
      total: 576000,
      paid: true,
      created_at: getDateMonthsAgo(2, 28)
    },

    // ============ Month 1 ago ============
    // Anh Minh - 2 đơn
    {
      id: 'inv-order-23',
      customer_id: 'cust-5',
      items: [
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 5, unit_price: 96000, subtotal: 480000 },
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 4, unit_price: 120000, subtotal: 480000 }
      ],
      total: 960000,
      paid: true,
      created_at: getDateMonthsAgo(1, 5)
    },
    {
      id: 'inv-order-24',
      customer_id: 'cust-5',
      items: [
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 10, unit_price: 60000, subtotal: 600000 }
      ],
      total: 600000,
      paid: false,
      created_at: getDateMonthsAgo(1, 15)
    },
    // Chị Hương - 2 đơn
    {
      id: 'inv-order-25',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 20, unit_price: 20000, subtotal: 400000 }
      ],
      total: 400000,
      paid: true,
      created_at: getDateMonthsAgo(1, 8)
    },
    {
      id: 'inv-order-26',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 6, unit_price: 144000, subtotal: 864000 }
      ],
      total: 864000,
      paid: false,
      created_at: getDateMonthsAgo(1, 22)
    },
    // Anh Tuấn - 2 đơn
    {
      id: 'inv-order-27',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 8, unit_price: 44000, subtotal: 352000 },
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 15, unit_price: 28000, subtotal: 420000 }
      ],
      total: 772000,
      paid: true,
      created_at: getDateMonthsAgo(1, 12)
    },
    {
      id: 'inv-order-28',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 4, unit_price: 160000, subtotal: 640000 }
      ],
      total: 640000,
      paid: false,
      created_at: getDateMonthsAgo(1, 28)
    },

    // ============ Current month ============
    // Anh Quân - 3 đơn
    {
      id: 'inv-order-29',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 15, unit_price: 28000, subtotal: 420000 }
      ],
      total: 420000,
      paid: false,
      created_at: getDateMonthsAgo(0, 3)
    },
    {
      id: 'inv-order-30',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 10, unit_price: 20000, subtotal: 200000 },
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 3, unit_price: 96000, subtotal: 288000 }
      ],
      total: 488000,
      paid: true,
      created_at: getDateMonthsAgo(0, 8)
    },
    {
      id: 'inv-order-31',
      customer_id: 'cust-1',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 5, unit_price: 120000, subtotal: 600000 }
      ],
      total: 600000,
      paid: false,
      created_at: getDateMonthsAgo(0, 15)
    },
    // Anh Tuấn - 2 đơn
    {
      id: 'inv-order-32',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-8', product_name: 'Gà', quantity: 2, unit_price: 144000, subtotal: 288000 },
        { product_id: 'prod-9', product_name: 'Phô mai cream', quantity: 4, unit_price: 60000, subtotal: 240000 }
      ],
      total: 528000,
      paid: false,
      created_at: getDateMonthsAgo(0, 5)
    },
    {
      id: 'inv-order-33',
      customer_id: 'cust-3',
      items: [
        { product_id: 'prod-2', product_name: 'Đường đen', quantity: 15, unit_price: 24000, subtotal: 360000 }
      ],
      total: 360000,
      paid: true,
      created_at: getDateMonthsAgo(0, 12)
    },
    // Chị Linh - 2 đơn
    {
      id: 'inv-order-34',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-7', product_name: 'Bột Khai', quantity: 12, unit_price: 36000, subtotal: 432000 }
      ],
      total: 432000,
      paid: false,
      created_at: getDateMonthsAgo(0, 7)
    },
    {
      id: 'inv-order-35',
      customer_id: 'cust-4',
      items: [
        { product_id: 'prod-5', product_name: 'Hạt hạnh nhân', quantity: 3, unit_price: 160000, subtotal: 480000 },
        { product_id: 'prod-10', product_name: 'Ba Hưng', quantity: 5, unit_price: 44000, subtotal: 220000 }
      ],
      total: 700000,
      paid: true,
      created_at: getDateMonthsAgo(0, 18)
    },
    // Anh Minh - 1 đơn
    {
      id: 'inv-order-36',
      customer_id: 'cust-5',
      items: [
        { product_id: 'prod-6', product_name: 'Bột mì', quantity: 20, unit_price: 28000, subtotal: 560000 },
        { product_id: 'prod-1', product_name: 'Đường trắng', quantity: 12, unit_price: 20000, subtotal: 240000 }
      ],
      total: 800000,
      paid: false,
      created_at: getDateMonthsAgo(0, 10)
    },
    // Chị Hương - 1 đơn
    {
      id: 'inv-order-37',
      customer_id: 'cust-2',
      items: [
        { product_id: 'prod-4', product_name: 'Socola đen', quantity: 3, unit_price: 120000, subtotal: 360000 },
        { product_id: 'prod-3', product_name: 'Bột cacao', quantity: 2, unit_price: 96000, subtotal: 192000 }
      ],
      total: 552000,
      paid: true,
      created_at: getDateMonthsAgo(0, 20)
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

  // ============ ENRICH ORDERS WITH CUSTOMER_NAME ============
  // Add denormalized customer_name to prevent "N/A" display issues
  const enrichOrdersWithCustomerName = (ordersArray) => {
    return ordersArray.map(order => {
      const customer = customers.find(c => c.id === order.customer_id);
      if (!customer) {
        console.warn(`Customer not found for order ${order.id}: ${order.customer_id}`);
        return order;
      }

      return {
        ...order,
        customer_name: customer.short_name || customer.full_name || customer.name,
      };
    });
  };

  // ============ ENRICH PURCHASES WITH SUPPLIER_NAME ============
  // Add denormalized supplier_name to prevent "N/A" display issues
  const enrichPurchasesWithSupplierName = (purchasesArray) => {
    return purchasesArray.map(purchase => {
      const supplier = customers.find(c => c.id === purchase.supplier_id);
      if (!supplier) {
        console.warn(`Supplier not found for purchase ${purchase.id}: ${purchase.supplier_id}`);
        return purchase;
      }

      return {
        ...purchase,
        supplier_name: supplier.short_name || supplier.full_name || supplier.name,
      };
    });
  };

  // Enrich all orders and purchases
  const enrichedOrders = enrichOrdersWithCustomerName(orders);
  const enrichedInvoiceOrders = enrichOrdersWithCustomerName(invoiceOrders);

  return {
    customers,
    products,
    orders: enrichedOrders,
    invoiceOrders: enrichedInvoiceOrders,
    invoiceInventory,
  };
};
