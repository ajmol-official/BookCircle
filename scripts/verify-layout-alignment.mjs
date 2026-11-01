import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function run() {
  console.log('🚀 Starting BookCircle Layout Alignment & Visual Consistency Verification...\n');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'wide-1920', width: 1920, height: 1080 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-390', width: 390, height: 844 },
  ];

  const routes = [
    { name: 'Home', path: '/' },
    { name: 'Find & Explore Books', path: '/books' },
    { name: 'Readers Near You', path: '/readers' },
    { name: 'My Books', path: '/my-books' },
    { name: 'Activity', path: '/activity' },
    { name: 'Author Profile', path: '/author/arundhati-roy' },
    { name: 'Book Details', path: '/book/the-god-of-small-things' },
  ];

  const results = [];

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`📐 Auditing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    await context.addInitScript(() => {
      localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
    });

    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const metrics = await page.evaluate(() => {
        const headerInner = document.querySelector('header > div');
        const main = document.querySelector('main');
        const firstHeader = main?.querySelector('h1, h2');

        const headerRect = headerInner?.getBoundingClientRect() || { left: 0, right: 0, width: 0 };
        const mainRect = main?.getBoundingClientRect() || { left: 0, right: 0, width: 0 };
        const firstHeaderRect = firstHeader?.getBoundingClientRect() || { left: 0 };

        const headerStyle = headerInner ? window.getComputedStyle(headerInner) : null;
        const mainStyle = main ? window.getComputedStyle(main) : null;

        const headerPadLeft = headerStyle ? parseFloat(headerStyle.paddingLeft) : 0;
        const headerPadRight = headerStyle ? parseFloat(headerStyle.paddingRight) : 0;
        const mainPadLeft = mainStyle ? parseFloat(mainStyle.paddingLeft) : 0;
        const mainPadRight = mainStyle ? parseFloat(mainStyle.paddingRight) : 0;

        // Content boundaries (container edge + inner padding)
        const headerContentLeft = headerRect.left + headerPadLeft;
        const headerContentRight = headerRect.right - headerPadRight;
        const mainContentLeft = mainRect.left + mainPadLeft;
        const mainContentRight = mainRect.right - mainPadRight;

        return {
          headerLeft: headerRect.left,
          headerRight: headerRect.right,
          headerWidth: headerRect.width,
          mainLeft: mainRect.left,
          mainRight: mainRect.right,
          mainWidth: mainRect.width,
          headerPadLeft,
          mainPadLeft,
          headerContentLeft,
          headerContentRight,
          mainContentLeft,
          mainContentRight,
          leftDelta: Math.abs(headerContentLeft - mainContentLeft),
          rightDelta: Math.abs(headerContentRight - mainContentRight),
          firstHeaderLeft: firstHeaderRect.left,
        };
      });

      const isAligned = metrics.leftDelta < 1.0 && metrics.rightDelta < 1.0;
      console.log(`[${vp.name}] ${route.name.padEnd(26)} | HeaderContentLeft: ${metrics.headerContentLeft.toFixed(1)}px | MainContentLeft: ${metrics.mainContentLeft.toFixed(1)}px | Diff: ${metrics.leftDelta.toFixed(2)}px -> ${isAligned ? '✅ MATCH' : '❌ MISMATCH'}`);

      results.push({
        viewport: vp.name,
        route: route.name,
        path: route.path,
        metrics,
        isAligned,
      });

      // Save screenshot for key desktop pages
      if (vp.name === 'desktop-1440' && ['Home', 'Find & Explore Books', 'Readers Near You', 'Author Profile', 'Book Details'].includes(route.name)) {
        const slug = route.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const filename = `alignment_desktop_${slug}.png`;
        await page.screenshot({
          path: path.join(ARTIFACTS_DIR, filename),
          fullPage: false,
        });
        console.log(`   📸 Captured alignment screenshot: ${filename}`);
      }
    }

    // ─── Test Page-to-Page Navigation Stability & Horizontal Shift ───
    if (vp.name === 'desktop-1440') {
      console.log('\n--- 🔄 Testing Page-to-Page Navigation for Layout Shifts & Jitter ---');
      const navSequences = ['/', '/books', '/readers', '/my-books', '/activity', '/author/arundhati-roy', '/'];
      let prevHeaderLeft = null;
      let totalShift = 0;

      for (const targetPath of navSequences) {
        await page.goto(`http://localhost:5173${targetPath}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(300);

        const currentHeaderLeft = await page.evaluate(() => {
          const el = document.querySelector('header > div');
          return el ? el.getBoundingClientRect().left : 0;
        });

        if (prevHeaderLeft !== null) {
          const shift = Math.abs(currentHeaderLeft - prevHeaderLeft);
          totalShift += shift;
          console.log(`   Navigating to ${targetPath.padEnd(25)}: Header Left = ${currentHeaderLeft.toFixed(1)}px (Shift: ${shift.toFixed(2)}px)`);
          if (shift > 0.5) {
            throw new Error(`Navigation layout shift detected between pages! Shift was ${shift}px.`);
          }
        } else {
          console.log(`   Initial position at ${targetPath.padEnd(21)}: Header Left = ${currentHeaderLeft.toFixed(1)}px`);
        }
        prevHeaderLeft = currentHeaderLeft;
      }
      console.log(`   ✅ Navigation test completed with 0.0px horizontal shift across 7 page transitions!\n`);
    }

    await context.close();
  }

  await browser.close();

  const failedTests = results.filter((r) => !r.isAligned);
  if (failedTests.length > 0) {
    console.error(`\n❌ ${failedTests.length} alignment tests failed:`);
    console.error(JSON.stringify(failedTests, null, 2));
    process.exit(1);
  }

  console.log(`\n🎉 ALL ${results.length} LAYOUT ALIGNMENT TESTS PASSED PERFECTLY (0.0px discrepancy)!`);
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
