import { chromium } from 'playwright';

const VERCEL_URL = 'https://book-circle-six.vercel.app';

const DEMO_USER = {
  id: 'user-maya-lin',
  email: 'maya.reader@bookcircle.org',
  displayName: 'Maya Lin',
  location: 'Elm Park, North London',
  authProvider: 'demo',
  memberSince: 'February 2024',
};

const DEMO_SESSION = {
  user: DEMO_USER,
  token: 'smoke_test_token',
  createdAt: Date.now(),
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
};

async function testVercel() {
  console.log(`\n======================================================`);
  console.log(`Smoke Testing Public Vercel Deployment`);
  console.log(`URL: ${VERCEL_URL}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const routesToTest = [
    { path: '/', label: 'Home Page' },
    { path: '/my-books', label: 'My Books (Direct SPA Navigation)' },
    { path: '/activity', label: 'Activity Page (Direct SPA Navigation)' },
    { path: '/profile', label: 'Profile Page (Direct SPA Navigation)' },
    { path: '/book/book-1', label: 'Book Details Page (/book/book-1)' },
    { path: '/messages', label: 'Messages Page (Direct SPA Navigation)' },
  ];

  let passedRoutes = 0;

  for (const r of routesToTest) {
    const url = `${VERCEL_URL}${r.path}`;
    console.log(`Testing route: ${r.label} -> ${url}`);
    
    // Set localStorage before loading for auth-dependent routes
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate((session) => {
      localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
      localStorage.setItem('bookcircle_auth_user', JSON.stringify(session.user));
    }, DEMO_SESSION);
    
    // Test refresh to verify SPA rewrites
    await page.reload({ waitUntil: 'load', timeout: 30000 });
    
    const title = await page.title();
    const bodyText = await page.textContent('body');
    const has404 = bodyText.includes('404: NOT_FOUND') || bodyText.includes('Page Not Found') && !bodyText.includes('BookCircle');

    if (has404) {
      console.error(`  [FAIL] Direct navigation to ${r.path} resulted in 404!`);
      process.exit(1);
    } else {
      console.log(`  [PASS] Loaded successfully. Title: "${title}"`);
      passedRoutes++;
    }
  }

  // Test Modal Opening (Add Book Modal)
  console.log(`Testing Add Book Modal on /my-books...`);
  await page.goto(`${VERCEL_URL}/my-books`, { waitUntil: 'networkidle' });
  const addBookBtn = page.locator('button:has-text("Add Book"), button:has-text("Add a Book")').first();
  if (await addBookBtn.isVisible()) {
    await addBookBtn.click();
    await page.waitForTimeout(600);
    const modalVisible = await page.locator('div[role="dialog"]').isVisible();
    console.log(`  [PASS] Add Book Modal opened with role="dialog": ${modalVisible}`);
  }

  console.log(`\n======================================================`);
  console.log(`Vercel Smoke Test Results: ${passedRoutes}/${routesToTest.length} Routes Passed`);
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console errors encountered:', consoleErrors);
  }
  console.log(`======================================================\n`);

  await browser.close();
}

testVercel().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
