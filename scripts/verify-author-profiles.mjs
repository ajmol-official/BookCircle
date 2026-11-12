import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function run() {
  console.log('Launching browser for Author Profiles & Catalogue Cards verification...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // 1. Desktop Context (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  await desktopContext.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  const page = await desktopContext.newPage();
  console.log('Navigating directly to /author/arundhati-roy...');
  await page.goto('http://localhost:5173/author/arundhati-roy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // ─── Test 1: Deduplication & Catalogue Card Display on Author Profile ───
  console.log('Test 1: Verifying deduplicated published works on Author Profile...');
  await page.waitForSelector('text=Arundhati Roy', { state: 'visible' });
  await page.waitForSelector('text=Verified Author', { state: 'visible' });
  await page.waitForSelector('text=5 works in catalogue', { state: 'visible' });
  await page.waitForSelector('text=3 community copies circulating', { state: 'visible' });

  // Verify The God of Small Things card (has community copies)
  console.log('Verifying The God of Small Things card metrics...');
  const godOfSmallThingsCard = page.locator('div[role="button"]').filter({ has: page.locator('h3', { hasText: 'The God of Small Things' }) });
  await godOfSmallThingsCard.waitFor({ state: 'visible' });
  
  const smallThingsText = await godOfSmallThingsCard.textContent();
  console.log('The God of Small Things card text preview:', smallThingsText?.slice(0, 160));
  if (!smallThingsText?.includes('3 copies') || !smallThingsText?.includes('available')) {
    throw new Error(`Expected "3 copies" and availability on card, but got: ${smallThingsText}`);
  }

  // Verify The Ministry of Utmost Happiness card (zero community copies)
  console.log('Verifying The Ministry of Utmost Happiness card (zero copies)...');
  const ministryCard = page.locator('div[role="button"]').filter({ has: page.locator('h3', { hasText: 'The Ministry of Utmost Happiness' }) });
  await ministryCard.waitFor({ state: 'visible' });

  const ministryText = await ministryCard.textContent();
  console.log('The Ministry of Utmost Happiness card text preview:', ministryText?.slice(0, 160));
  if (!ministryText?.includes('0 Community copies')) {
    throw new Error(`Expected "0 Community copies" on card, but got: ${ministryText}`);
  }
  if (ministryText?.includes('available')) {
    throw new Error(`Expected no availability count for 0 community copies, but found availability in text: ${ministryText}`);
  }

  // Capture Screenshot of Author Profile with Catalogue Cards
  const authorProfileCardsScreenshot = path.join(ARTIFACTS_DIR, 'author_profile_catalog_cards_desktop.png');
  await page.screenshot({ path: authorProfileCardsScreenshot, fullPage: false });
  console.log('Saved:', authorProfileCardsScreenshot);

  // ─── Test 2: Click "Explore Copies" on zero-copies book ───
  console.log('Test 2: Clicking "Explore Copies" on The Ministry of Utmost Happiness...');
  const exploreMinistryBtn = ministryCard.locator('button:has-text("Explore Copies")');
  await exploreMinistryBtn.click();
  await page.waitForTimeout(1000);

  console.log('Current URL after clicking Explore Copies:', page.url());
  if (!page.url().includes('the-ministry-of-utmost-happiness')) {
    throw new Error(`Expected URL to include the-ministry-of-utmost-happiness, got ${page.url()}`);
  }

  // Verify Book Details Page for Zero Copies
  console.log('Verifying Zero Copies Book Details state...');
  await page.waitForSelector('h1:has-text("The Ministry of Utmost Happiness")', { state: 'visible' });
  await page.waitForSelector('text=No community copies available yet.', { state: 'visible' });
  await page.waitForSelector('text=Be the first to share this book with your neighbors!', { state: 'visible' });
  await page.waitForSelector('button:has-text("+ Share a Copy of this Book")', { state: 'visible' });

  // Ensure Borrow and Claim buttons are NOT present
  const borrowButtonsCount = await page.locator('button:has-text("Request to Borrow")').count();
  const claimButtonsCount = await page.locator('button:has-text("Claim Free Gift")').count();
  if (borrowButtonsCount > 0 || claimButtonsCount > 0) {
    throw new Error(`Expected 0 borrow/claim buttons, but found ${borrowButtonsCount} borrow and ${claimButtonsCount} claim buttons!`);
  }
  console.log('Confirmed: 0 borrow/claim buttons present for zero-copies book details.');

  // Capture Screenshot of Zero Copies Book Details Page
  const zeroCopiesDetailsScreenshot = path.join(ARTIFACTS_DIR, 'book_details_zero_copies_desktop.png');
  await page.screenshot({ path: zeroCopiesDetailsScreenshot, fullPage: false });
  console.log('Saved:', zeroCopiesDetailsScreenshot);

  // ─── Test 3: Click "+ Share a Copy of this Book" and check modal pre-fill ───
  console.log('Test 3: Testing "+ Share a Copy of this Book" button pre-fill in AddBookModal...');
  const shareCopyBtn = page.locator('button:has-text("+ Share a Copy of this Book")');
  await shareCopyBtn.click();
  await page.waitForTimeout(800);

  // Verify modal is open and fields pre-filled
  const titleInput = page.locator('input[placeholder*="Title"]').or(page.locator('input[value*="The Ministry of Utmost Happiness"]')).first();
  await titleInput.waitFor({ state: 'visible', timeout: 3000 });
  const titleVal = await titleInput.inputValue();
  console.log('Pre-filled Title in modal:', titleVal);

  const authorInput = page.locator('input[placeholder*="Author"]').or(page.locator('input[value*="Arundhati Roy"]')).first();
  const authorVal = await authorInput.inputValue();
  console.log('Pre-filled Author in modal:', authorVal);

  if (!titleVal.includes('The Ministry of Utmost Happiness') || !authorVal.includes('Arundhati Roy')) {
    throw new Error(`Expected pre-filled title and author, got title="${titleVal}", author="${authorVal}"`);
  }

  // Capture modal screenshot
  const modalScreenshot = path.join(ARTIFACTS_DIR, 'book_details_zero_copies_modal_desktop.png');
  await page.screenshot({ path: modalScreenshot, fullPage: false });
  console.log('Saved:', modalScreenshot);

  // Close modal via Escape or close button
  const closeBtn = page.locator('button[aria-label="Close modal"]').or(page.locator('button:has-text("Cancel")')).or(page.locator('button:has(svg.cancel-icon)')).first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(500);

  // ─── Test 4: Verify book with multiple community copies ───
  console.log('Test 4: Navigating to The God of Small Things (multiple community copies)...');
  await page.goto('http://localhost:5173/book/the-god-of-small-things', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.waitForSelector('h1:has-text("The God of Small Things")', { state: 'visible' });
  await page.waitForSelector('text=copies in your area', { state: 'visible' });
  await page.waitForSelector('text=Available from nearby readers', { state: 'visible' });
  await page.waitForSelector('text=Arif Ahmed', { state: 'visible' });

  // ─── Test 5: Mobile Viewport Verification ───
  console.log('Test 5: Verifying Mobile Viewport (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  await mobileContext.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/author/arundhati-roy', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  const mobileAuthorCardsScreenshot = path.join(ARTIFACTS_DIR, 'author_profile_catalog_cards_mobile.png');
  await mobilePage.screenshot({ path: mobileAuthorCardsScreenshot, fullPage: false });
  console.log('Saved:', mobileAuthorCardsScreenshot);

  await mobilePage.goto('http://localhost:5173/book/the-ministry-of-utmost-happiness', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  const mobileZeroCopiesScreenshot = path.join(ARTIFACTS_DIR, 'book_details_zero_copies_mobile.png');
  await mobilePage.screenshot({ path: mobileZeroCopiesScreenshot, fullPage: false });
  console.log('Saved:', mobileZeroCopiesScreenshot);

  await browser.close();
  console.log('All automated tests passed with flying colors!');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
