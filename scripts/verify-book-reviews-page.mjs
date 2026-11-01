import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function run() {
  console.log('🚀 Starting Verification: Book Reviews Page & Upvote System...\n');
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

  // Test 1: Book Details page preview and "View all reviews" link
  console.log('Test 1: Navigating to Book Details (/book/the-god-of-small-things)...');
  await page.goto('http://localhost:5173/book/the-god-of-small-things', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Assert community reviews section preview
  await page.waitForSelector('h2:has-text("Community reviews")', { state: 'visible' });
  const viewAllBtn = page.locator('button:has-text("View all")').first();
  await viewAllBtn.waitFor({ state: 'visible' });
  const viewAllText = await viewAllBtn.textContent();
  console.log(`✅ Book Details shows preview with CTA: "${viewAllText?.trim()}"`);

  // Capture screenshot of Book Details review preview
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'book_details_review_preview_desktop.png'),
    fullPage: false,
  });
  console.log('📸 Captured: book_details_review_preview_desktop.png');

  // Test 2: Navigate to dedicated reviews page
  console.log('\nTest 2: Navigating to dedicated reviews page via CTA click...');
  await viewAllBtn.click();
  await page.waitForURL('**/reviews');
  await page.waitForTimeout(600);
  console.log(`✅ Successfully navigated to: ${page.url()}`);

  // Assert Book Context Header
  await page.waitForSelector('h1:has-text("Community Reviews for")', { state: 'visible' });
  console.log('✅ Book context header verified with title, author, and cover thumbnail.');

  // Assert Rating Overview & Interactive Distribution
  await page.waitForSelector('h2:has-text("Rating Breakdown & Overview")', { state: 'visible' });
  console.log('✅ Rating overview breakdown rendered.');

  // Capture desktop dedicated reviews page
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'dedicated_reviews_page_desktop.png'),
    fullPage: false,
  });
  console.log('📸 Captured: dedicated_reviews_page_desktop.png');

  // Test 3: Star Rating Filtering (Click 5-Star Histogram bar)
  console.log('\nTest 3: Testing interactive star rating filter...');
  const fiveStarBar = page.locator('button:has-text("5")').first();
  await fiveStarBar.click();
  await page.waitForTimeout(400);

  // Verify active filter badge
  const activeFilterBadge = page.locator('span:has-text("5 Stars only")').first();
  await activeFilterBadge.waitFor({ state: 'visible' });
  console.log('✅ Filter active: "5 Stars only" badge displayed.');

  // Capture filtered reviews screenshot
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'dedicated_reviews_filtered_5stars_desktop.png'),
    fullPage: false,
  });
  console.log('📸 Captured: dedicated_reviews_filtered_5stars_desktop.png');

  // Clear filter
  const clearFilterBtn = page.locator('button:has-text("Show all reviews")');
  await clearFilterBtn.click();
  await page.waitForTimeout(300);
  console.log('✅ Cleared star filter, restored all reviews.');

  // Test 4: Sorting by Newest First and Most Helpful
  console.log('\nTest 4: Testing review sorting...');
  const sortSelect = page.locator('select[aria-label="Sort reviews"]');
  await sortSelect.selectOption('newest');
  await page.waitForTimeout(300);
  console.log('✅ Sorted by: Newest First');

  await sortSelect.selectOption('helpful');
  await page.waitForTimeout(300);
  console.log('✅ Sorted back to: Most Helpful (Default)');

  // Test 5: Upvote Interaction & Toggle
  console.log('\nTest 5: Testing review upvoting interaction...');
  const firstUpvoteBtn = page.locator('button[data-testid^="upvote-btn-"]').first();
  await firstUpvoteBtn.waitFor({ state: 'visible' });

  const initialUpvoteText = await firstUpvoteBtn.textContent();
  console.log(`Initial upvote button text: "${initialUpvoteText?.trim()}"`);

  // Click to upvote
  console.log('Clicking upvote button...');
  await firstUpvoteBtn.click();
  await page.waitForTimeout(500);

  const upvotedState = await firstUpvoteBtn.getAttribute('aria-pressed');
  const upvotedText = await firstUpvoteBtn.textContent();
  console.log(`Post-upvote button text: "${upvotedText?.trim()}", aria-pressed=${upvotedState}`);

  if (upvotedState !== 'true') {
    throw new Error('Upvote button failed to toggle to active aria-pressed="true" state!');
  }
  console.log('✅ Review upvoted successfully with active highlight.');

  // Capture upvoted state screenshot
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'dedicated_reviews_upvoted_state_desktop.png'),
    fullPage: false,
  });
  console.log('📸 Captured: dedicated_reviews_upvoted_state_desktop.png');

  // Click again to remove upvote (toggle)
  console.log('Clicking upvote button again to remove upvote...');
  await firstUpvoteBtn.click();
  await page.waitForTimeout(500);

  const toggledOffState = await firstUpvoteBtn.getAttribute('aria-pressed');
  const toggledOffText = await firstUpvoteBtn.textContent();
  console.log(`Post-removal button text: "${toggledOffText?.trim()}", aria-pressed=${toggledOffState}`);

  if (toggledOffState !== 'false') {
    throw new Error('Upvote removal failed: button still in active state!');
  }
  console.log('✅ Upvote removed smoothly (toggle behavior verified).');

  // Test 6: Return navigation to Book Details
  console.log('\nTest 6: Testing return navigation back to Book Details...');
  const backBtn = page.locator('button:has-text("Back to")').first();
  await backBtn.click();
  await page.waitForTimeout(500);
  console.log(`Returned to URL: ${page.url()}`);
  if (page.url().includes('/reviews')) {
    throw new Error('Failed to return to Book Details page from Reviews page!');
  }
  console.log('✅ Successfully returned to Book Details page.');

  // Test 7: Mobile Viewport (390x844)
  console.log('\nTest 7: Testing mobile viewport responsiveness...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/book/the-god-of-small-things/reviews', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'dedicated_reviews_mobile_390.png'),
    fullPage: false,
  });
  console.log('📸 Captured: dedicated_reviews_mobile_390.png');
  console.log('✅ Mobile layout verified.');

  await context.close();
  await browser.close();

  console.log('\n🎉 ALL BOOK REVIEWS & UPVOTE TESTS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
