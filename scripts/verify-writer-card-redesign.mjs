import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function verifyWriterCard() {
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

  // Take screenshot of the Writers section
  const sectionBox = await writersSection.boundingBox();
  console.log('Writers section bounding box:', sectionBox);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'writercard_01_desktop_grid.png'),
    clip: {
      x: 0,
      y: sectionBox ? Math.max(0, sectionBox.y - 30) : 600,
      width: 1440,
      height: 520
    }
  });
  console.log('Captured writercard_01_desktop_grid.png');

  // Hover over the first writer card to test interaction
  const firstWriterCard = writersSection.locator('div.group.bg-white.rounded-xl').first();
  await firstWriterCard.hover();
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'writercard_02_card_hover.png'),
    clip: {
      x: 0,
      y: sectionBox ? Math.max(0, sectionBox.y - 30) : 600,
      width: 1440,
      height: 520
    }
  });
  console.log('Captured writercard_02_card_hover.png');

  // Mobile viewport test (390px)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await writersSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'writercard_03_mobile.png'),
    fullPage: false
  });
  console.log('Captured writercard_03_mobile.png');

  await browser.close();
  console.log('WriterCard verification successfully completed!');
}

verifyWriterCard().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
