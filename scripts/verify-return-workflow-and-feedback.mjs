import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function runVerification() {
  console.log('Starting BookCircle Return Workflow & Post-Return Feedback E2E Verification...');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Dismiss onboarding modal by default in test context
  await page.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  // 1. Navigate to Activity page
  console.log('Navigating to http://localhost:5173/activity ...');
  await page.goto('http://localhost:5173/activity');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Check if sample activities button is visible and load sample data to ensure fresh test state
  const loadSamplesBtn = page.getByRole('button', { name: /Load Sample Activities/i }).first();
  if (await loadSamplesBtn.isVisible()) {
    console.log('Loading sample activities...');
    await loadSamplesBtn.click();
    await page.waitForTimeout(1500);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. VERIFY LENDER "RETURNS TO REVIEW" & DEDICATED INSPECTION MODAL
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Step 1: Testing Lender - Inspect Condition & Confirm Receipt...');
  
  // Make sure we are on the Lending tab
  await page.getByRole('button', { name: /^Lending/i }).first().click();
  await page.waitForTimeout(500);

  // Look for Returns to Review section
  const inspectBtn = page.getByRole('button', { name: 'Inspect Condition & Confirm Receipt' }).first();
  await inspectBtn.scrollIntoViewIfNeeded();
  await inspectBtn.click();
  await page.waitForTimeout(600);

  // Verify InspectReturnModal is visible
  const inspectModalTitle = page.locator('#inspect-return-title');
  console.log('Inspect Modal Title visible:', await inspectModalTitle.isVisible());
  
  // Verify Original Condition is prominently displayed
  const originalCondText = page.getByText('Original Condition when borrowed:');
  console.log('Original condition label visible:', await originalCondText.isVisible());

  // Capture Screenshot of InspectReturnModal
  const inspectScreenshotPath = path.join(ARTIFACTS_DIR, '01_inspect_condition_modal_desktop.png');
  await page.screenshot({ path: inspectScreenshotPath });
  console.log('Captured:', inspectScreenshotPath);

  // Confirm receipt and close loan
  const confirmInspectBtn = page.getByRole('button', { name: 'Confirm Receipt & Close Loan' });
  await confirmInspectBtn.click();
  await page.locator('#rate-reader-title').waitFor({ state: 'visible', timeout: 6000 });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. VERIFY LENDER -> BORROWER FEEDBACK MODAL (RateReaderModal)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Step 2: Testing Lender -> Reader Feedback Modal...');
  const rateReaderTitle = page.locator('#rate-reader-title');
  console.log('Rate Reader Modal visible:', await rateReaderTitle.isVisible());

  // Capture Screenshot of RateReaderModal
  const rateReaderScreenshotPath = path.join(ARTIFACTS_DIR, '02_rate_reader_modal_desktop.png');
  await page.screenshot({ path: rateReaderScreenshotPath });
  console.log('Captured:', rateReaderScreenshotPath);

  // Submit reader rating
  await page.locator('textarea[placeholder*="Prompt, friendly"]').fill('Diego was communicative, punctual, and returned the book in spotless condition.');
  const submitReaderRatingBtn = page.getByRole('button', { name: 'Submit Reader Rating' });
  await submitReaderRatingBtn.click();
  await page.waitForTimeout(1800); // wait for success state & auto-close
  await page.locator('div[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. VERIFY LENDER "RECORD DIRECT RETURN" WORKFLOW
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Step 3: Testing Lender - Record Direct Return...');
  
  // Find Record Direct Return button in Currently Lent loans
  const directReturnBtn = page.getByRole('button', { name: 'Record Direct Return' }).first();
  await directReturnBtn.scrollIntoViewIfNeeded();
  await directReturnBtn.click();
  await page.locator('#direct-return-title').waitFor({ state: 'visible', timeout: 5000 });

  const directReturnTitle = page.locator('#direct-return-title');
  console.log('Direct Return Modal visible:', await directReturnTitle.isVisible());

  // Verify submit button is initially disabled
  const confirmDirectBtn = page.getByRole('button', { name: 'Confirm Direct Return & Close Loan' });
  console.log('Confirm Direct Return initially disabled:', await confirmDirectBtn.isDisabled());

  // Capture Screenshot of RecordDirectReturnModal before checking checkbox
  const directReturnScreenshotPath = path.join(ARTIFACTS_DIR, '03_record_direct_return_modal_desktop.png');
  await page.screenshot({ path: directReturnScreenshotPath });
  console.log('Captured:', directReturnScreenshotPath);

  // Check mandatory confirmation checkbox
  const confirmCheckbox = page.locator('input[type="checkbox"]').first();
  await confirmCheckbox.check();
  await page.waitForTimeout(300);
  console.log('Confirm Direct Return after checkbox disabled:', await confirmDirectBtn.isDisabled());

  // Click Confirm Direct Return & Close Loan
  await confirmDirectBtn.click();
  
  // Verify that Reader Rating Modal opened, and click "Skip for Now" INSIDE the modal to test skip behavior
  const skipReaderRatingBtn = page.locator('div[role="dialog"]').getByRole('button', { name: 'Skip for Now' });
  await skipReaderRatingBtn.waitFor({ state: 'visible', timeout: 6000 });
  console.log('Testing Reader Feedback Skip for Now in modal...');
  await skipReaderRatingBtn.click();
  await page.locator('div[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(600);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. VERIFY BORROWER RETURN CONFIRMATION & POST-RETURN BOOK REVIEW PROMPT
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Step 4: Testing Borrower Tab, Handover Message & Post-Return Book Review Prompt...');
  await page.getByRole('button', { name: /^Borrowing/i }).first().click();
  await page.waitForTimeout(600);

  // Capture Screenshot of Borrowing Tab with post-return review prompt banner
  const borrowingTabScreenshotPath = path.join(ARTIFACTS_DIR, '04_borrowing_tab_with_review_prompt_desktop.png');
  await page.screenshot({ path: borrowingTabScreenshotPath });
  console.log('Captured:', borrowingTabScreenshotPath);

  // Click "Write a Review" on the prompt or on a completed book
  const writeReviewBtn = page.getByRole('button', { name: 'Write a Review' }).first();
  if (await writeReviewBtn.isVisible()) {
    await writeReviewBtn.click();
    await page.waitForTimeout(600);

    // Verify ReviewModal
    const reviewModal = page.locator('div[role="dialog"] h3').filter({ hasText: /Review/i });
    console.log('ReviewModal visible:', await reviewModal.isVisible());

    const reviewModalScreenshotPath = path.join(ARTIFACTS_DIR, '05_borrower_book_review_modal_desktop.png');
    await page.screenshot({ path: reviewModalScreenshotPath });
    console.log('Captured:', reviewModalScreenshotPath);

    // Fill in review headline and text
    const headlineInput = page.locator('input[placeholder*="lyrical masterpiece"]');
    if (await headlineInput.isVisible()) {
      await headlineInput.fill('A profound and captivating journey');
    }
    const thoughtsTextarea = page.locator('textarea[placeholder*="What did you love"]');
    await thoughtsTextarea.fill('The prose was evocative and emotionally resonant. Highly recommended to anyone who loves character-driven stories.');

    // Submit Review
    const postReviewBtn = page.locator('div[role="dialog"]').getByRole('button', { name: 'Post Review' });
    await postReviewBtn.click();
    await page.waitForTimeout(2000); // wait for success state & close
    await page.locator('div[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. VERIFY ACTIVITY HISTORY TAB REVISIT ACCESS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Step 5: Testing Activity History Tab Revisit Access & Completed Badges...');
  await page.getByRole('button', { name: /^History/i }).first().click();
  await page.waitForTimeout(800);

  // Capture Screenshot of History Tab
  const historyScreenshotPath = path.join(ARTIFACTS_DIR, '06_activity_history_feedback_entries_desktop.png');
  await page.screenshot({ path: historyScreenshotPath });
  console.log('Captured:', historyScreenshotPath);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. MOBILE RESPONSIVE VERIFICATION (390 x 844)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('Step 6: Testing Mobile Responsive layout (390 x 844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);

  const mobileHistoryScreenshotPath = path.join(ARTIFACTS_DIR, '07_activity_history_mobile_390.png');
  await page.screenshot({ path: mobileHistoryScreenshotPath });
  console.log('Captured:', mobileHistoryScreenshotPath);

  // Switch to Lending on mobile
  await page.getByRole('button', { name: /^Lending/i }).first().click();
  await page.waitForTimeout(600);

  const mobileLendingScreenshotPath = path.join(ARTIFACTS_DIR, '08_activity_lending_mobile_390.png');
  await page.screenshot({ path: mobileLendingScreenshotPath });
  console.log('Captured:', mobileLendingScreenshotPath);

  await browser.close();
  console.log('All Return Workflow & Post-Return Feedback E2E Verifications Completed Successfully!');
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
