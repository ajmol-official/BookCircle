import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function run() {
  console.log('🚀 Starting BookCircle Author Profile Redesign Playwright Verification...\n');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  await context.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  try {
    // 1. Visit Arundhati Roy's Author Profile
    console.log('Step 1: Navigating to /author/arundhati-roy...');
    await page.goto('http://localhost:5173/author/arundhati-roy', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify Hero Card Elements
    await page.waitForSelector('text=Arundhati Roy');
    await page.waitForSelector('text=Novelist, Essayist & Human Rights Activist');
    await page.waitForSelector('text=Born 1961');
    await page.waitForSelector('text=Shillong, Meghalaya, India');
    await page.waitForSelector('text=works in catalogue');
    await page.waitForSelector('text=community copies');
    await page.waitForSelector('button:has-text("Follow Author")');
    await page.waitForSelector('text=Literary achievements & Recognition');
    await page.waitForSelector('text=Man Booker Prize for Fiction');
    await page.waitForSelector('text=Official Author Website');

    console.log('✅ Author Hero Card verified.');

    // Verify Published Works Section
    await page.waitForSelector('text=Published Works by Arundhati Roy');
    await page.waitForSelector('input[placeholder*="Search Arundhati"]');
    await page.waitForSelector('text=community copies');
    await page.waitForSelector('button:has-text("Explore Copies")');

    console.log('✅ Published Works Grid verified.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'author_01_desktop.png'), fullPage: true });

    // Step 2: Test In-Author Search Filter
    console.log('Step 2: Testing in-author search filter...');
    const searchInput = page.locator('input[placeholder*="Search Arundhati"]');
    await searchInput.fill('God of Small Things');
    await page.waitForTimeout(500);
    await page.waitForSelector('text=The God of Small Things');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'author_02_search_filter.png'), fullPage: true });

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(500);
    console.log('✅ In-author search filter verified.');

    // Step 3: Test Toggle Follow
    console.log('Step 3: Testing Follow Author toggle...');
    const followButton = page.locator('button:has-text("Follow Author")');
    await followButton.click();
    await page.waitForTimeout(500);
    await page.waitForSelector('button:has-text("Following")');
    console.log('✅ Follow Author toggle verified.');

    // Step 4: Test Mobile Viewport
    console.log('Step 4: Testing Mobile Viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/author/arundhati-roy', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'author_03_mobile.png'), fullPage: true });
    console.log('✅ Mobile Viewport screenshots captured.');

    console.log('\n🎉 ALL AUTHOR PROFILE PLAYWRIGHT VERIFICATION CHECKS PASSED!\n');
  } catch (err) {
    console.error('❌ Playwright Verification Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
