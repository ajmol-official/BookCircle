import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function verifyBookCard() {
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

  // Take screenshot of Home page with Books section
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'bookcard_01_home_desktop.png'),
    fullPage: false
  });
  console.log('Captured bookcard_01_home_desktop.png');

  // Locate the first book card
  const bookCards = page.locator('div.group.bg-white.rounded-xl');
  const count = await bookCards.count();
  console.log(`Found ${count} book cards`);

  const firstCard = bookCards.first();
  await firstCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Take zoomed screenshot of the first row of cards
  const cardBox = await firstCard.boundingBox();
  console.log('First card bounding box:', cardBox);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'bookcard_02_card_closeup.png'),
    clip: {
      x: 0,
      y: cardBox ? Math.max(0, cardBox.y - 30) : 300,
      width: 1440,
      height: 520
    }
  });
  console.log('Captured bookcard_02_card_closeup.png');

  // Test toggling wishlist heart button
  const wishlistBtn = firstCard.locator('button[aria-label*="wishlist"]').first();
  await wishlistBtn.click();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'bookcard_03_wishlist_active.png'),
    clip: {
      x: 0,
      y: cardBox ? Math.max(0, cardBox.y - 30) : 300,
      width: 1440,
      height: 520
    }
  });
  console.log('Captured bookcard_03_wishlist_active.png');

  // Test mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'bookcard_04_mobile.png'),
    fullPage: false
  });
  console.log('Captured bookcard_04_mobile.png');

  await browser.close();
  console.log('BookCard verification successfully completed!');
}

verifyBookCard().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
