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

  // Scroll to Authors You May Love
  const authorsSection = page.locator('section:has-text("Authors You May Love")');
  await authorsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Screenshot all 4 cards in the section
  const sectionBox = await authorsSection.boundingBox();
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'authors_home_section_updated.png'),
    clip: {
      x: 0,
      y: sectionBox ? Math.max(0, sectionBox.y - 20) : 600,
      width: 1440,
      height: 520
    }
  });
  console.log('Captured authors_home_section_updated.png');

  await browser.close();
  console.log('Verification finished successfully!');
}

verifyBadge().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
