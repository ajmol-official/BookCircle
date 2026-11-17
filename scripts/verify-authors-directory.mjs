import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function verifyAuthorsDirectory() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2
  });

  // Dismiss onboarding modal
  await context.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  const page = await context.newPage();

  console.log('1. Navigating to Home page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll to Writers You May Love section
  const writersSection = page.locator('section:has-text("Writers You May Love")');
  await writersSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Find and click "View all Writers" button
  const viewAllBtn = writersSection.locator('button:has-text("View all Writers")');
  console.log('Checking "View all Writers" button...');
  if (await viewAllBtn.isVisible()) {
    console.log('Found "View all Writers" button. Clicking...');
    await viewAllBtn.click();
  } else {
    console.log('"View all Writers" not visible directly, navigating to /authors...');
    await page.goto('http://localhost:5173/authors', { waitUntil: 'networkidle' });
  }

  await page.waitForTimeout(1200);

  // Verify URL is /authors
  console.log('Current URL:', page.url());

  // Capture full desktop authors browse page
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'authors_01_desktop.png'),
    fullPage: false
  });
  console.log('Captured authors_01_desktop.png');

  // Test opening Filter drawer
  const filterBtn = page.locator('button:has-text("Filters")');
  if (await filterBtn.isVisible()) {
    console.log('Clicking Filters button...');
    await filterBtn.click();
    await page.waitForTimeout(800);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'authors_02_drawer_open.png'),
      fullPage: false
    });
    console.log('Captured authors_02_drawer_open.png');

    // Close drawer
    const closeBtn = page.locator('button[aria-label="Close filters"]').or(page.locator('button:has-text("Show")')).last();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Test quick filter pill: "With Available Copies"
  const copiesPill = page.locator('button:has-text("With Available Copies")');
  if (await copiesPill.isVisible()) {
    console.log('Clicking "With Available Copies" filter pill...');
    await copiesPill.click();
    await page.waitForTimeout(600);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'authors_03_filtered_copies.png'),
      fullPage: false
    });
    console.log('Captured authors_03_filtered_copies.png');
  }

  // Test mobile view
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  await mobileContext.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/authors', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'authors_04_mobile.png'),
    fullPage: false
  });
  console.log('Captured authors_04_mobile.png');

  // Test /writers redirect to /authors
  console.log('Testing /writers redirect...');
  await page.goto('http://localhost:5173/writers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  console.log('Redirect target URL:', page.url());

  await browser.close();
  console.log('Verification complete!');
}

verifyAuthorsDirectory().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
