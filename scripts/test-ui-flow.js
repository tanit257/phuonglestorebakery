/**
 * UI Flow Testing Script
 * Test user flows và tương tác với UI
 *
 * Usage:
 *   node scripts/test-ui-flow.js [flow-name]
 *
 * Available flows:
 *   - login: Test login flow
 *   - create-order: Test create order flow
 *   - inventory: Test inventory management
 *
 * Examples:
 *   node scripts/test-ui-flow.js login
 *   node scripts/test-ui-flow.js create-order
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const flowName = process.argv[2] || 'login';
const baseUrl = 'http://localhost:3000';

// Define test flows
const flows = {
  login: async (page) => {
    console.log('🔐 Testing login flow...');

    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' });

    // Take screenshot before
    await page.screenshot({ path: 'screenshots/login-before.png' });

    // Fill login form
    await page.type('input[type="email"], input[name="email"]', 'test@example.com');
    await page.type('input[type="password"], input[name="password"]', 'testpassword');

    // Take screenshot after filling
    await page.screenshot({ path: 'screenshots/login-filled.png' });

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    await page.waitForTimeout(2000);

    // Take screenshot after submit
    await page.screenshot({ path: 'screenshots/login-after.png' });

    console.log('✅ Login flow tested');
  },

  'create-order': async (page) => {
    console.log('📝 Testing create order flow...');

    await page.goto(`${baseUrl}/orders/create`, { waitUntil: 'networkidle2' });

    await page.screenshot({ path: 'screenshots/create-order-before.png' });

    // Wait for form elements
    await page.waitForSelector('form', { timeout: 5000 });

    // Take screenshot of form
    await page.screenshot({ path: 'screenshots/create-order-form.png' });

    console.log('✅ Create order flow tested');
  },

  inventory: async (page) => {
    console.log('📦 Testing inventory flow...');

    await page.goto(`${baseUrl}/inventory`, { waitUntil: 'networkidle2' });

    await page.screenshot({ path: 'screenshots/inventory-before.png' });

    // Wait for inventory table/grid
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/inventory-loaded.png', fullPage: true });

    console.log('✅ Inventory flow tested');
  }
};

(async () => {
  // Create screenshots directory
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  console.log(`🚀 Starting browser...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    // Enable console logging from page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // Run the specified flow
    if (flows[flowName]) {
      await flows[flowName](page);
    } else {
      console.error(`❌ Unknown flow: ${flowName}`);
      console.log('Available flows:', Object.keys(flows).join(', '));
      process.exit(1);
    }

    console.log(`✅ All screenshots saved to screenshots/ directory`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log(`🏁 Done!`);
  }
})();
