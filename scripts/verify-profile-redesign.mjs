import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function run() {
  console.log('🚀 Starting BookCircle Profile Redesign Playwright Verification...\n');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  await context.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
    localStorage.setItem(
      'bookcircle_auth_session',
      JSON.stringify({
        token: 'demo-session-token',
        expiresAt: Date.now() + 86400000 * 7,
        user: {
          id: 'user-ajmol-hossain',
          email: 'ajmol.hossain@bookcircle.org',
          displayName: 'Ajmol Hossain',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          location: 'Elm Park, North London',
          memberSince: 'February 2024',
          bio: 'Slow reader. Love novels that feel like long walks. Currently working through the Neapolitan quartet for a second time.',
          isProfileComplete: true,
        },
      })
    );
  });

  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  try {
    // 1. Visit Own Profile
    console.log('Step 1: Navigating to /profile...');
    await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify Hero Card
    await page.waitForSelector('text=Ajmol Hossain');
    await page.waitForSelector('text=Elm Park, North London');
    await page.waitForSelector('text=Always returned on time');
    await page.waitForSelector('text=Community Contribution');
    await page.waitForSelector('text=Active borrower');
    await page.waitForSelector('text=Generous Lister');

    console.log('✅ Own Profile Hero Card verified.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_01_own_desktop.png'), fullPage: true });

    // Step 2: Test Sub-Tabs on Own Profile
    console.log('Step 2: Testing Meetup Spots tab...');
    await page.click('button:has-text("Meetup Spots")');
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Your Preferred Handover Spots');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_02_meetup_spots.png'), fullPage: true });
    console.log('✅ Meetup Spots tab verified.');

    console.log('Step 3: Testing Reviews tab...');
    await page.click('button:has-text("Reviews")');
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Reviews by Ajmol Hossain');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_03_reviews.png'), fullPage: true });
    console.log('✅ Reviews tab verified.');

    console.log('Step 4: Testing Feedback tab...');
    await page.click('button:has-text("Feedback")');
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Community Endorsements');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_04_feedback.png'), fullPage: true });
    console.log('✅ Feedback tab verified.');

    // Step 5: Test Edit Profile Modal
    console.log('Step 5: Testing Edit Profile modal...');
    await page.click('button:has-text("My Library")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Edit Profile")');
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Edit Profile & Preferences');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_05_edit_modal.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    console.log('✅ Edit Profile modal verified.');

    // Step 6: Test 5-Tier Return Reliability Modal
    console.log('Step 6: Testing 5-Tier Reliability modal...');
    await page.click('text=Always returned on time');
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Return Reliability System');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_06_reliability_modal.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    console.log('✅ 5-Tier Reliability modal verified.');

    // Step 7: Visit Public Reader Profile
    console.log('Step 7: Navigating to public reader profile /reader/Rahim%20Chowdhury...');
    await page.goto('http://localhost:5173/reader/Rahim%20Chowdhury', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify Public Profile Elements
    await page.waitForSelector('text=Rahim Chowdhury');
    await page.waitForSelector('input[placeholder*="Search Rahim"]');
    await page.waitForSelector('button:has-text("Community Contribution")');
    console.log('✅ Public Profile verified.');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_07_public_desktop.png'), fullPage: true });

    // Step 8: Community Contribution tab on Public Profile
    console.log('Step 8: Testing Community Contribution tab...');
    await page.click('button:has-text("Community Contribution")');
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Rahim’s Community Impact');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_08_contributions.png'), fullPage: true });
    console.log('✅ Community Contribution tab verified.');

    // Step 9: Mobile Viewport Verification
    console.log('Step 9: Testing Mobile Viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_09_mobile_own.png'), fullPage: true });

    await page.goto('http://localhost:5173/reader/Rahim%20Chowdhury', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'profile_10_mobile_public.png'), fullPage: true });
    console.log('✅ Mobile Viewport screenshots captured.');

    console.log('\n🎉 ALL 10 PLAYWRIGHT PROFILE VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Playwright Verification Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
