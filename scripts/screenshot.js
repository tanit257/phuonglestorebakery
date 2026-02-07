/**
 * Screenshot Helper Script
 * Chụp ảnh màn hình của ứng dụng để debug UI
 *
 * Usage:
 *   node scripts/screenshot.js [url] [output-path]
 *
 * Examples:
 *   node scripts/screenshot.js http://localhost:3000 debug-screenshot.png
 *   node scripts/screenshot.js http://localhost:3000/orders orders-page.png
 */

const puppeteer = require('puppeteer');

const defaultUrl = 'http://localhost:3000';
const defaultOutput = 'debug-screenshot.png';

const url = process.argv[2] || defaultUrl;
const outputPath = process.argv[3] || defaultOutput;

(async () => {
  console.log(`🚀 Starting browser...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log(`📄 Opening ${url}...`);
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for any animations
    await page.waitForTimeout(1000);

    console.log(`📸 Taking screenshot...`);

    // Take screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: true
    });

    console.log(`✅ Screenshot saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log(`🏁 Done!`);
  }
})();
