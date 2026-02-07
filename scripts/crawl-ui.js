/**
 * UI Crawler Script
 * Crawl và phân tích HTML/CSS của trang web
 *
 * Usage:
 *   node scripts/crawl-ui.js [url] [output-path]
 *
 * Examples:
 *   node scripts/crawl-ui.js http://localhost:3000 ui-report.json
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const defaultUrl = 'http://localhost:3000';
const defaultOutput = 'ui-report.json';

const url = process.argv[2] || defaultUrl;
const outputPath = process.argv[3] || defaultOutput;

(async () => {
  console.log(`🚀 Starting browser...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log(`📄 Crawling ${url}...`);
    const page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log(`🔍 Analyzing page...`);

    // Extract page information
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        html: document.documentElement.outerHTML,

        // Get all elements
        elements: {
          buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
            text: btn.textContent.trim(),
            id: btn.id,
            className: btn.className,
            disabled: btn.disabled
          })),
          inputs: Array.from(document.querySelectorAll('input')).map(input => ({
            type: input.type,
            name: input.name,
            id: input.id,
            placeholder: input.placeholder,
            value: input.value
          })),
          links: Array.from(document.querySelectorAll('a')).map(link => ({
            text: link.textContent.trim(),
            href: link.href,
            id: link.id,
            className: link.className
          })),
          headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            level: h.tagName,
            text: h.textContent.trim()
          }))
        },

        // Get viewport size
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },

        // Check for common issues
        issues: {
          missingAltText: Array.from(document.querySelectorAll('img:not([alt])')).length,
          emptyButtons: Array.from(document.querySelectorAll('button')).filter(btn => !btn.textContent.trim()).length,
          duplicateIds: (() => {
            const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
            return ids.filter((id, index) => ids.indexOf(id) !== index);
          })()
        }
      };
    });

    // Take screenshot for reference
    const screenshotPath = outputPath.replace('.json', '.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`💾 Saving report...`);

    // Save report
    const report = {
      ...pageInfo,
      crawledAt: new Date().toISOString(),
      screenshotPath
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

    console.log(`✅ Report saved to: ${outputPath}`);
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    // Print summary
    console.log('\n📊 Summary:');
    console.log(`   Buttons: ${report.elements.buttons.length}`);
    console.log(`   Inputs: ${report.elements.inputs.length}`);
    console.log(`   Links: ${report.elements.links.length}`);
    console.log(`   Issues found: ${Object.values(report.issues).reduce((a, b) => {
      if (Array.isArray(b)) return a + b.length;
      return a + b;
    }, 0)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log(`🏁 Done!`);
  }
})();
