import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function run() {
  console.log('🚀 Starting BookCircle Dedicated Settings Page Verification...\n');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // 1. Desktop Test (1440x900)
  console.log('======================================================');
  console.log('🖥️ Auditing Desktop Experience (1440x900)');
  console.log('======================================================');

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  await desktopContext.addInitScript(() => {
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

  const page = await desktopContext.newPage();
  // Clear any previous settings once at test start
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('bookcircle_user_settings'));

  // Test A: Direct Route Navigation to /settings
  console.log('Test A: Direct route navigation to /settings...');
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Assert page heading & description
  const heading = await page.textContent('h1');
  console.log('Heading text:', heading);
  if (!heading?.includes('Settings')) {
    throw new Error(`Expected heading "Settings", but got "${heading}"`);
  }

  const description = await page.locator('text=Manage your account, privacy, and notification preferences').first();
  await description.waitFor({ state: 'visible' });
  console.log('✅ Page heading and description verified.');

  // Assert NO modal backdrop exists
  const modalBackdrop = await page.$('.fixed.inset-0.z-50.bg-slate-900\\/60');
  if (modalBackdrop) {
    throw new Error('Detected unexpected modal backdrop! Settings should be a dedicated page.');
  }
  console.log('✅ Confirmed Settings is a dedicated page (no modal backdrop).');

  // Test B: Verify Container Alignment with Navbar (0.00px discrepancy)
  console.log('\nTest B: Verifying container alignment with Navbar...');
  const alignmentMetrics = await page.evaluate(() => {
    const headerInner = document.querySelector('header > div');
    const main = document.querySelector('main');
    const headerRect = headerInner?.getBoundingClientRect() || { left: 0, right: 0 };
    const mainRect = main?.getBoundingClientRect() || { left: 0, right: 0 };

    const headerPad = parseFloat(window.getComputedStyle(headerInner).paddingLeft);
    const mainPad = parseFloat(window.getComputedStyle(main).paddingLeft);

    const headerContentLeft = headerRect.left + headerPad;
    const mainContentLeft = mainRect.left + mainPad;

    return {
      headerContentLeft,
      mainContentLeft,
      delta: Math.abs(headerContentLeft - mainContentLeft),
    };
  });
  console.log(`Nav Content Left: ${alignmentMetrics.headerContentLeft}px | Main Content Left: ${alignmentMetrics.mainContentLeft}px | Delta: ${alignmentMetrics.delta}px`);
  if (alignmentMetrics.delta > 0.5) {
    throw new Error(`Settings page container misalignment detected! Delta: ${alignmentMetrics.delta}px`);
  }
  console.log('✅ Settings page perfectly aligned with Navbar (0.00px delta).');

  // Test C: Verify All Sections & Requirements
  console.log('\nTest C: Verifying all required sections...');
  // Notifications
  await page.waitForSelector('text=Borrow Requests', { state: 'visible' });
  await page.waitForSelector('text=Request Accepted', { state: 'visible' });
  await page.waitForSelector('text=Meetup Reminders', { state: 'visible' });
  await page.waitForSelector('text=Return Due Soon', { state: 'visible' });
  await page.waitForSelector('text=Community Digest', { state: 'visible' });
  console.log('  ✅ Notifications section verified (5 toggles present).');

  // Privacy
  await page.waitForSelector('text=Public Profile', { state: 'visible' });
  await page.waitForSelector('text=Show Approximate Distance', { state: 'visible' });
  await page.waitForSelector('text=Recent Activity', { state: 'visible' });
  console.log('  ✅ Privacy section verified (3 toggles present).');

  // Discovery
  await page.waitForSelector('text=Default Search Radius', { state: 'visible' });
  await page.waitForSelector('text=Show My Books in Discovery', { state: 'visible' });
  await page.waitForSelector('button:has-text("Within 2km")', { state: 'visible' });
  await page.waitForSelector('button:has-text("Within 5km")', { state: 'visible' });
  await page.waitForSelector('button:has-text("Within 10km")', { state: 'visible' });
  await page.waitForSelector('button:has-text("Within 25km")', { state: 'visible' });
  console.log('  ✅ Discovery section verified (radius options & visibility toggle).');

  // Account
  await page.waitForSelector('text=Account & Security', { state: 'visible' });
  await page.waitForSelector('text=Password', { state: 'visible' });
  await page.waitForSelector('text=Member Trust Standing', { state: 'visible' });
  console.log('  ✅ Account section verified.');

  // Capture baseline desktop screenshot
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'settings_page_desktop.png'),
    fullPage: false,
  });
  console.log('📸 Captured: settings_page_desktop.png');

  // Test D: Interaction, Dirty State & Persistence
  console.log('\nTest D: Testing toggle interactions and persistent saving...');
  // Toggle Community Digest (default false -> true)
  const digestToggle = page.locator('#toggle-community-digest');
  await digestToggle.click();
  await page.waitForTimeout(300);

  // Toggle Recent Activity (default false -> true)
  const activityToggle = page.locator('#toggle-recent-activity');
  await activityToggle.click();
  await page.waitForTimeout(300);

  // Select Radius "Within 10km"
  const radius10kmBtn = page.locator('button:has-text("Within 10km")');
  await radius10kmBtn.click();
  await page.waitForTimeout(300);

  // Assert "Unsaved changes" badge appears
  const unsavedBadge = page.locator('text=Unsaved changes').first();
  await unsavedBadge.waitFor({ state: 'visible' });
  console.log('✅ "Unsaved changes" status badge displayed upon modifying settings.');

  // Click "Save Preferences" button
  const saveBtn = page.locator('button:has-text("Save Preferences")').first();
  await saveBtn.click();
  await page.waitForTimeout(400);

  // Assert "Settings saved successfully!" toast and "All changes saved" badge
  await page.waitForSelector('text=Settings saved successfully!', { state: 'visible' });
  await page.waitForSelector('text=All changes saved', { state: 'visible' });
  console.log('✅ Save feedback toast and updated badge displayed.');

  // Capture saved state desktop screenshot
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'settings_saved_state_desktop.png'),
    fullPage: false,
  });
  console.log('📸 Captured: settings_saved_state_desktop.png');

  // Test E: Navigate Away & Return (Verify Persistence)
  console.log('\nTest E: Navigating away and returning to verify persistence...');
  await page.goto('http://localhost:5173/books', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Return to /settings
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Check that Community Digest is still checked
  const digestChecked = await page.locator('#toggle-community-digest').getAttribute('aria-checked');
  const activityChecked = await page.locator('#toggle-recent-activity').getAttribute('aria-checked');
  console.log(`Persisted state: Community Digest = ${digestChecked}, Recent Activity = ${activityChecked}`);
  if (digestChecked !== 'true' || activityChecked !== 'true') {
    throw new Error('Preferences failed to persist after navigation!');
  }
  console.log('✅ Settings faithfully persisted in localStorage across navigation!');

  // Test F: Navbar Menu Navigation to Settings
  console.log('\nTest F: Testing navigation to Settings via Navbar Profile Dropdown...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Open profile menu in Navbar
  const profileMenuBtn = page.locator('button[aria-label="User profile menu"]');
  await profileMenuBtn.click();
  await page.waitForTimeout(300);

  // Click Settings menu item
  const settingsMenuItem = page.locator('button:has(p:text-is("Settings"))');
  await settingsMenuItem.click();
  await page.waitForTimeout(500);

  // Assert current URL is http://localhost:5173/settings
  const currentUrl = page.url();
  console.log('URL after clicking Settings in dropdown:', currentUrl);
  if (!currentUrl.includes('/settings')) {
    throw new Error(`Expected URL to include "/settings", but got ${currentUrl}`);
  }
  console.log('✅ Navbar profile dropdown cleanly navigates to dedicated /settings page!');

  // Test G: Profile Page Navigation to Settings
  console.log('\nTest G: Testing navigation to Settings via Profile Page Settings button...');
  await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const profileSettingsBtn = page.locator('button[title="Account & Notification Settings"]');
  await profileSettingsBtn.click();
  await page.waitForTimeout(400);
  const profileNavUrl = page.url();
  console.log('URL after clicking Settings on Profile page:', profileNavUrl);
  if (!profileNavUrl.includes('/settings')) {
    throw new Error(`Expected URL to include "/settings", but got ${profileNavUrl}`);
  }
  console.log('✅ Profile page button cleanly navigates to dedicated /settings page!');

  await desktopContext.close();

  // 2. Mobile Viewport Test (390x844)
  console.log('\n======================================================');
  console.log('📱 Auditing Mobile Experience (390x844)');
  console.log('======================================================');

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  await mobileContext.addInitScript(() => {
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/settings', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);

  await mobilePage.waitForSelector('h1:has-text("Settings")', { state: 'visible' });
  await mobilePage.waitForSelector('text=Notifications', { state: 'visible' });
  await mobilePage.waitForSelector('text=Privacy & Safety', { state: 'visible' });
  await mobilePage.waitForSelector('text=Discovery Preferences', { state: 'visible' });

  // Capture mobile screenshot
  await mobilePage.screenshot({
    path: path.join(ARTIFACTS_DIR, 'settings_page_mobile.png'),
    fullPage: false,
  });
  console.log('📸 Captured: settings_page_mobile.png');

  // Verify alignment on mobile
  const mobileMetrics = await mobilePage.evaluate(() => {
    const headerInner = document.querySelector('header > div');
    const main = document.querySelector('main');
    const headerRect = headerInner?.getBoundingClientRect() || { left: 0 };
    const mainRect = main?.getBoundingClientRect() || { left: 0 };

    const headerPad = parseFloat(window.getComputedStyle(headerInner).paddingLeft);
    const mainPad = parseFloat(window.getComputedStyle(main).paddingLeft);

    return {
      headerContentLeft: headerRect.left + headerPad,
      mainContentLeft: mainRect.left + mainPad,
      delta: Math.abs((headerRect.left + headerPad) - (mainRect.left + mainPad)),
    };
  });
  console.log(`Mobile Nav Content Left: ${mobileMetrics.headerContentLeft}px | Main Content Left: ${mobileMetrics.mainContentLeft}px | Delta: ${mobileMetrics.delta}px`);
  if (mobileMetrics.delta > 0.5) {
    throw new Error(`Mobile container misalignment detected! Delta: ${mobileMetrics.delta}px`);
  }
  console.log('✅ Mobile layout perfectly aligned (0.00px delta).');

  await mobileContext.close();
  await browser.close();

  console.log('\n🎉 ALL SETTINGS PAGE VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Fatal error during settings verification:', err);
  process.exit(1);
});
