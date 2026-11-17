import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function verifyBadge() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2
  });

  await context.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  const page = await context.newPage();

  console.log('1. Navigating to Home page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll to Writers You May Love
  const writersSection = page.locator('section:has-text("Writers You May Love")');
  await writersSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Screenshot first writer card (Arundhati Roy)
  const firstCard = writersSection.locator('div.group.bg-white.rounded-xl').first();
  await firstCard.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verified_badge_home_card.png')
  });
  console.log('Captured verified_badge_home_card.png');

  // Screenshot all 4 cards in the section
  const sectionBox = await writersSection.boundingBox();
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verified_badge_home_section.png'),
    clip: {
      x: 0,
      y: sectionBox ? Math.max(0, sectionBox.y - 20) : 600,
      width: 1440,
      height: 520
    }
  });
  console.log('Captured verified_badge_home_section.png');

  // Navigate to /authors
  console.log('2. Navigating to /authors...');
  await page.goto('http://localhost:5173/authors', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'verified_badge_authors_directory.png'),
    fullPage: false
  });
  console.log('Captured verified_badge_authors_directory.png');

  await browser.close();
  console.log('Verification finished successfully!');
}

verifyBadge().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
