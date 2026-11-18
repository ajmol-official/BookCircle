import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function verifyBookDetails() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1600 },
    deviceScaleFactor: 2
  });

  await context.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  const page = await context.newPage();

  console.log('1. Navigating to Book Details...');
  await page.goto('http://localhost:5173/book/the-god-of-small-things', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Full page screenshot
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'bookdetails_01_desktop.png'),
    fullPage: true
  });
  console.log('Captured bookdetails_01_desktop.png');

  // Hero + Copies Section
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'bookdetails_02_hero_and_copies.png'),
    clip: {
      x: 0,
      y: 70,
      width: 1440,
      height: 980
    }
  });
  console.log('Captured bookdetails_02_hero_and_copies.png');

  // Test opening the Sort Dropdown
  const sortBtn = page.locator('button:has-text("Sort:")');
  if (await sortBtn.isVisible()) {
    console.log('Clicking sort dropdown...');
    await sortBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'bookdetails_03_sort_open.png'),
      clip: {
        x: 0,
        y: 400,
        width: 1440,
        height: 600
      }
    });
    console.log('Captured bookdetails_03_sort_open.png');

    // Click outside to close
    await page.mouse.click(10, 10);
    await page.waitForTimeout(300);
  }

  // Scroll to Community Reviews Section
  const reviewsSection = page.locator('section:has-text("Community reviews")');
  await reviewsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const reviewsBox = await reviewsSection.boundingBox();
  if (reviewsBox) {
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'bookdetails_04_reviews.png'),
      clip: {
        x: 0,
        y: Math.max(0, reviewsBox.y - 20),
        width: 1440,
        height: Math.min(reviewsBox.height + 40, 950)
      }
    });
    console.log('Captured bookdetails_04_reviews.png');
  }

  // Mobile Viewport (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  await mobileContext.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/book/the-god-of-small-things', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1200);

  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'bookdetails_05_mobile.png'),
    fullPage: false
  });
  console.log('Captured bookdetails_05_mobile.png');

  await browser.close();
  console.log('Book Details redesign verification completed successfully!');
}

verifyBookDetails().catch(err => {
  console.error(err);
  process.exit(1);
});
