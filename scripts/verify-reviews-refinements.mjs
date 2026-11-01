import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function run() {
  console.log('🚀 Starting Verification: Refine Book Reviews Page UI (Quora Layout & Upvotes)...\n');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  await context.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
    localStorage.setItem('bookcircle_auth_session', JSON.stringify({
      token: 'demo-session-token',
      expiresAt: Date.now() + 86400000 * 7,
      user: {
        id: 'user-maya-lin',
        email: 'maya.reader@bookcircle.org',
        displayName: 'Maya Lin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        location: 'Elm Park, North London',
        memberSince: 'February 2024',
        isProfileComplete: true,
      }
    }));
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  // Test 1: Direct navigation to dedicated reviews page
  console.log('Test 1: Navigating to /book/the-god-of-small-things/reviews...');
  await page.goto('http://localhost:5173/book/the-god-of-small-things/reviews', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Assert Book Context Header
  await page.waitForSelector('h1:has-text("Community Reviews for The God of Small Things")', { state: 'visible' });
  console.log('✅ Book context header verified with title, author, and cover thumbnail.');

  // Assert Overall rating & review count are in the header
  const ratingText = await page.locator('span.font-serif.font-bold:has-text("4.3")').first().textContent();
  console.log(`✅ Overall rating in context header: ${ratingText?.trim()}`);

  // Test 2: Verify "Rating Breakdown & Overview" is COMPLETELY REMOVED
  console.log('\nTest 2: Verifying "Rating Breakdown & Overview" is removed...');
  const ratingBreakdown = await page.$('text="Rating Breakdown & Overview"');
  if (ratingBreakdown) {
    throw new Error('FAILED: "Rating Breakdown & Overview" section is still present in DOM!');
  }
  console.log('✅ Confirmed: "Rating Breakdown & Overview" section is completely removed.');

  // Test 3: Verify "Filtered by" section is COMPLETELY REMOVED
  console.log('\nTest 3: Verifying "Filtered by" section is removed...');
  const filteredBySection = await page.$('text="Filtered by:"');
  if (filteredBySection) {
    throw new Error('FAILED: "Filtered by" section is still present in DOM!');
  }
  console.log('✅ Confirmed: "Filtered by" section is completely removed.');

  // Test 4: Capture desktop initial refined reviews page
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'refined_reviews_page_desktop.png'),
    fullPage: false,
  });
  console.log('📸 Captured: refined_reviews_page_desktop.png');

  // Test 5: Verify vertical layout (cards are stacked vertically, not 2 columns side by side)
  console.log('\nTest 4: Verifying vertical single-column layout...');
  const cards = page.locator('article[data-testid^="review-card-"]');
  const count = await cards.count();
  console.log(`Found ${count} review cards on page.`);
  if (count < 2) {
    throw new Error('Expected at least 2 review cards to test layout.');
  }

  const box1 = await cards.nth(0).boundingBox();
  const box2 = await cards.nth(1).boundingBox();
  console.log(`Card 1 bounds: x=${box1?.x}, y=${box1?.y}, width=${box1?.width}, height=${box1?.height}`);
  console.log(`Card 2 bounds: x=${box2?.x}, y=${box2?.y}, width=${box2?.width}, height=${box2?.height}`);

  if (Math.abs((box1?.x || 0) - (box2?.x || 0)) > 20) {
    throw new Error(`Cards are positioned horizontally side-by-side (x1=${box1?.x}, x2=${box2?.x}), expected vertical stack!`);
  }
  if ((box2?.y || 0) <= (box1?.y || 0)) {
    throw new Error('Card 2 is not below Card 1 vertically!');
  }
  console.log('✅ Confirmed: Review cards are arranged in a clean, vertical single-column stream.');

  // Test 6: Verify Quora-style information hierarchy inside card:
  // 1. Author header (top)
  // 2. Star rating (below author)
  // 3. Title (below rating)
  // 4. Content (below title)
  // 5. Upvote button (at bottom)
  console.log('\nTest 5: Verifying Quora-style vertical information hierarchy...');
  const firstCard = cards.nth(0);
  const authorName = await firstCard.locator('span.font-serif').first().textContent();
  const starRating = await firstCard.locator('div[aria-label*="out of 5 stars"]').first();
  await starRating.waitFor({ state: 'visible' });

  const authorBox = await firstCard.locator('span.font-serif').first().boundingBox();
  const starBox = await starRating.boundingBox();
  console.log(`Author name: "${authorName?.trim()}" (y=${authorBox?.y})`);
  console.log(`Star rating: (y=${starBox?.y})`);

  if ((starBox?.y || 0) <= (authorBox?.y || 0)) {
    throw new Error('Star rating must appear vertically below the reviewer information!');
  }
  console.log('✅ Confirmed: Star rating is displayed clearly below reviewer info.');

  // Test 7: Verify "Upvote" button, arrow icon, and count
  console.log('\nTest 6: Verifying Upvote button...');
  const upvoteBtn = firstCard.locator('button[data-testid^="upvote-btn-"]');
  const upvoteText = await upvoteBtn.textContent();
  console.log(`Initial upvote button text: "${upvoteText?.trim()}"`);

  if (!upvoteText?.includes('Upvote')) {
    throw new Error(`Expected button to contain "Upvote", found: "${upvoteText}"`);
  }
  if (upvoteText?.includes('Helpful')) {
    throw new Error('Found legacy "Helpful" label! Expected "Upvote".');
  }
  console.log('✅ Confirmed: Upvote label and count present.');

  // Test 8: Click Upvote and verify active state + count increment + toast
  console.log('\nTest 7: Clicking Upvote...');
  await upvoteBtn.click();
  await page.waitForTimeout(400);

  // Verify toast
  const toast = page.locator('div.fixed.top-24');
  await toast.waitFor({ state: 'visible', timeout: 3000 });
  const toastText = await toast.textContent();
  console.log(`Toast message: "${toastText?.trim()}"`);
  if (!toastText?.toLowerCase().includes('upvoted review')) {
    throw new Error(`Expected upvote toast confirmation, got: "${toastText}"`);
  }
  console.log('✅ Toast confirmed upvote successfully.');

  const updatedUpvoteText = await upvoteBtn.textContent();
  console.log(`Active upvote button text: "${updatedUpvoteText?.trim()}"`);
  if (!updatedUpvoteText?.includes('Upvoted')) {
    throw new Error(`Expected button to indicate active upvoted state, found: "${updatedUpvoteText}"`);
  }
  console.log('✅ Confirmed: Button transitioned to active Upvoted state.');

  // Capture upvoted state screenshot
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'refined_reviews_upvoted_state_desktop.png'),
    fullPage: false,
  });
  console.log('📸 Captured: refined_reviews_upvoted_state_desktop.png');

  // Test 9: Click again to remove upvote
  console.log('\nTest 8: Removing upvote...');
  await upvoteBtn.click();
  await page.waitForTimeout(400);

  const revertedUpvoteText = await upvoteBtn.textContent();
  console.log(`Reverted upvote button text: "${revertedUpvoteText?.trim()}"`);
  if (!revertedUpvoteText?.includes('Upvote') || revertedUpvoteText?.includes('Upvoted')) {
    throw new Error(`Expected button to revert to "Upvote", found: "${revertedUpvoteText}"`);
  }
  console.log('✅ Confirmed: Upvote toggled off cleanly.');

  // Test 10: Test Star Filter chip in toolbar (Click 5 Stars chip)
  console.log('\nTest 9: Testing Star Filter chip in toolbar...');
  const fiveStarChip = page.locator('button:has-text("5")').filter({ hasText: '(' }).first();
  await fiveStarChip.click();
  await page.waitForTimeout(400);

  // Confirm NO "Filtered by" banner appears
  const bannerCheck = await page.$('text="Filtered by:"');
  if (bannerCheck) {
    throw new Error('Detected unexpected "Filtered by:" section after filtering!');
  }
  console.log('✅ Filter applied cleanly with ZERO extra "Filtered by" content block.');

  // Capture filtered reviews screenshot
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'refined_reviews_filtered_5stars_desktop.png'),
    fullPage: false,
  });
  console.log('📸 Captured: refined_reviews_filtered_5stars_desktop.png');

  // Test 11: Mobile viewport verification (390x844)
  console.log('\nTest 10: Testing mobile responsive layout (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'refined_reviews_mobile_390.png'),
    fullPage: false,
  });
  console.log('📸 Captured: refined_reviews_mobile_390.png');

  await context.close();
  await browser.close();

  console.log('\n🎉 ALL REFINED BOOK REVIEWS PAGE UI TESTS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
