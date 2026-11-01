import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function run() {
  console.log('Launching browser for Author Profiles verification...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // 1. Desktop Context (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await desktopContext.newPage();

  console.log('Dismissing onboarding and navigating to homepage...');
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // If onboarding modal is still visible, click Explore button
  const exploreBtn = page.locator('button:has-text("Explore Books")').or(page.locator('button:has-text("Explore")')).first();
  if (await exploreBtn.isVisible()) {
    await exploreBtn.click();
    await page.waitForTimeout(500);
  }

  // Test 1: Click author name on book card
  console.log('Testing author name click on homepage book card...');
  const authorButton = page.locator('button[title*="Arundhati Roy"]').first();
  await authorButton.waitFor({ state: 'visible', timeout: 5000 });
  await authorButton.click();

  await page.waitForTimeout(1000);
  console.log('Current URL after clicking author:', page.url());

  // Verify URL is /author/arundhati-roy
  if (!page.url().includes('/author/arundhati-roy')) {
    throw new Error(`Expected URL to include /author/arundhati-roy, but got: ${page.url()}`);
  }

  // Verify Header content
  await page.waitForSelector('text=Arundhati Roy', { state: 'visible' });
  await page.waitForSelector('text=Verified Author', { state: 'visible' });
  await page.waitForSelector('text=Man Booker Prize', { state: 'visible' });

  // Capture Desktop Screenshot for Arundhati Roy
  const royScreenshot = path.join(ARTIFACTS_DIR, 'author_profile_arundhati_roy_desktop.png');
  await page.screenshot({ path: royScreenshot, fullPage: false });
  console.log('Saved:', royScreenshot);

  // Test 2: In-page filter / search
  console.log('Testing in-page book filter...');
  const searchInput = page.locator('input[placeholder*="Arundhati"]');
  if (await searchInput.isVisible()) {
    await searchInput.fill('Small Things');
    await page.waitForTimeout(400);
    await searchInput.fill(''); // clear
  }

  // Test 3: Follow author toggle
  console.log('Testing Follow Author button...');
  const followBtn = page.locator('text=+ Follow Author');
  if (await followBtn.isVisible()) {
    await followBtn.click();
    await page.waitForTimeout(300);
    await page.waitForSelector('text=Following', { state: 'visible' });
    console.log('Follow button toggled successfully to "Following"');
  }

  // Test 4: Navigate from Book Details Page
  console.log('Navigating to Book Details for The Night Circus...');
  await page.goto('http://localhost:5173/book/the-night-circus', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const erinAuthorBtn = page.locator('button[title*="Erin Morgenstern"]').first();
  await erinAuthorBtn.waitFor({ state: 'visible', timeout: 5000 });
  await erinAuthorBtn.click();

  await page.waitForTimeout(1000);
  console.log('Current URL after clicking Erin Morgenstern:', page.url());
  await page.waitForSelector('text=Erin Morgenstern', { state: 'visible' });
  await page.waitForSelector('text=The Night Circus', { state: 'visible' });

  const erinScreenshot = path.join(ARTIFACTS_DIR, 'author_profile_erin_morgenstern_desktop.png');
  await page.screenshot({ path: erinScreenshot, fullPage: false });
  console.log('Saved:', erinScreenshot);

  // Test 5: Monogram Fallback (Author without custom photo e.g. Carl Sagan)
  console.log('Testing Monogram Initials Fallback (Carl Sagan)...');
  await page.goto('http://localhost:5173/author/carl-sagan', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.waitForSelector('text=Carl Sagan', { state: 'visible' });
  await page.waitForSelector('text=CS', { state: 'visible' }); // Monogram initials CS

  const monogramScreenshot = path.join(ARTIFACTS_DIR, 'author_profile_monogram_fallback_desktop.png');
  await page.screenshot({ path: monogramScreenshot, fullPage: false });
  console.log('Saved:', monogramScreenshot);

  // Test 6: Empty catalogue state for author with 0 books
  console.log('Testing Dynamic Fallback / Empty State for author without books...');
  await page.goto('http://localhost:5173/author/george-orwell', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.waitForSelector('text=George Orwell', { state: 'visible' });
  await page.waitForSelector('text=No copies by George Orwell are currently listed', { state: 'visible' });

  const emptyStateScreenshot = path.join(ARTIFACTS_DIR, 'author_profile_empty_state_desktop.png');
  await page.screenshot({ path: emptyStateScreenshot, fullPage: false });
  console.log('Saved:', emptyStateScreenshot);

  // 2. Mobile Viewport (390x844 - iPhone 14)
  console.log('Testing Mobile Viewport (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/');
  await mobilePage.evaluate(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });
  await mobilePage.goto('http://localhost:5173/author/arundhati-roy', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  const mobileScreenshot = path.join(ARTIFACTS_DIR, 'author_profile_mobile_390.png');
  await mobilePage.screenshot({ path: mobileScreenshot, fullPage: false });
  console.log('Saved:', mobileScreenshot);

  await browser.close();
  console.log('All Author Profile automated verification tests passed successfully!');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
