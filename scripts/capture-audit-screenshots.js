import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../bookcircle-design-audit');
const DESKTOP_DIR = path.join(OUTPUT_DIR, 'desktop');
const MOBILE_DIR = path.join(OUTPUT_DIR, 'mobile');
const TABLET_DIR = path.join(OUTPUT_DIR, 'tablet');

// Ensure output directories exist
[DESKTOP_DIR, MOBILE_DIR, TABLET_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const DEMO_USER = {
  id: 'user-maya-lin',
  email: 'maya.reader@bookcircle.org',
  phoneNumber: '+44 7700 900077',
  countryCode: '+44',
  displayName: 'Maya Lin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  location: 'Elm Park, North London',
  bio: 'Slow reader. Love novels that feel like long walks. Currently working through Elena Ferrante.',
  memberSince: 'February 2024',
  trustScore: 4.9,
  lendsCount: 18,
  borrowsCount: 24,
  authProvider: 'demo',
  favoriteGenres: ['Fiction', 'Non-fiction', 'History', 'Poetry'],
  isProfileComplete: true,
  notificationPreferences: {
    email: true,
    push: true,
    whatsapp: true,
  },
  wishlist: ['book-1', 'book-4']
};

const DEMO_SESSION = {
  user: DEMO_USER,
  token: 'bc_qa_audit_token',
  createdAt: Date.now(),
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
};

async function disableAnimations(page) {
  try {
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.001s !important;
          animation-delay: 0s !important;
          transition-duration: 0.001s !important;
          transition-delay: 0s !important;
        }
      `
    });
  } catch {}
}

async function waitForStableRender(page, extraWaitMs = 250) {
  try {
    await page.waitForLoadState('networkidle');
  } catch {}
  try {
    await page.evaluate(() => document.fonts.ready);
  } catch {}
  if (extraWaitMs > 0) {
    await page.waitForTimeout(extraWaitMs);
  }
}

async function takeShot(page, filePath, fullPage = false) {
  await disableAnimations(page);
  await waitForStableRender(page, 200);
  await page.screenshot({ path: filePath, fullPage });
  console.log(`[Captured] ${path.basename(filePath)}`);
}

async function runAudit() {
  console.log('🚀 Starting BookCircle Automated Visual Audit Capture...\n');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const captureLog = {
    desktop: [],
    mobile: [],
    tablet: [],
  };

  // Helper for guest context
  async function getGuestPage(width = 1440, height = 900) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const p = await ctx.newPage();
    await p.addInitScript(() => {
      localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
      localStorage.removeItem('bookcircle_auth_session');
    });
    return { ctx, p };
  }

  // Helper for authenticated context
  async function getAuthPage(width = 1440, height = 900) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const p = await ctx.newPage();
    await p.addInitScript((session) => {
      localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
      localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
      localStorage.setItem('bookcircle_wishlist', JSON.stringify(['book-1', 'book-4']));
    }, DEMO_SESSION);
    return { ctx, p };
  }

  // ==========================================
  // SECTION 1: DESKTOP AUDIT (1440 × 900)
  // ==========================================
  console.log('--- 🖥️  Capturing Desktop Suite (1440x900) ---');

  // 1.1 First-time visitor Onboarding Modal
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.addInitScript(() => {
      localStorage.removeItem('bookcircle_onboarding_dismissed');
      localStorage.removeItem('bookcircle_auth_session');
    });
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(DESKTOP_DIR, '01-onboarding-welcome-modal.png'));
    captureLog.desktop.push('01-onboarding-welcome-modal.png');
    await ctx.close();
  }

  // 1.2 Home Page (Guest Full Page)
  {
    const { ctx, p } = await getGuestPage();
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(DESKTOP_DIR, '02-home-guest.png'), true);
    captureLog.desktop.push('02-home-guest.png');

    // 1.3 Home Radius Dropdown Open
    await p.locator('button:has-text("Within 5km")').first().click();
    await p.waitForTimeout(200);
    await takeShot(p, path.join(DESKTOP_DIR, '03-home-radius-dropdown.png'));
    captureLog.desktop.push('03-home-radius-dropdown.png');

    // 1.4 Coffee / Support Community Modal
    await p.locator('button:has-text("Buy us a coffee")').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '04-coffee-support-modal.png'));
    captureLog.desktop.push('04-coffee-support-modal.png');

    await ctx.close();
  }

  // 1.5 Sign In Modal — Selection Screen
  {
    const { ctx, p } = await getGuestPage();
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 300);
    await p.locator('button:has-text("Sign In")').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '05-auth-modal-selection.png'));
    captureLog.desktop.push('05-auth-modal-selection.png');

    // 1.6 Sign In Modal — WhatsApp / Phone Input Screen
    await p.locator('button:has-text("Continue with WhatsApp")').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '06-auth-modal-phone-otp.png'));
    captureLog.desktop.push('06-auth-modal-phone-otp.png');

    // 1.7 Sign In Modal — 6-Digit OTP Verification Screen
    await p.fill('input[type="tel"]', '7700900123');
    await p.locator('button:has-text("Send Verification Code")').first().click();
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(DESKTOP_DIR, '07-auth-modal-otp-verify.png'));
    captureLog.desktop.push('07-auth-modal-otp-verify.png');

    await ctx.close();
  }

  // 1.8 All Available Books Page (Default)
  {
    const { ctx, p } = await getGuestPage();
    await p.goto(`${BASE_URL}/?tab=books`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '08-all-books-default.png'), true);
    captureLog.desktop.push('08-all-books-default.png');

    // 1.9 All Available Books Page (Filtered: Free Gifts + Within 2km)
    await p.locator('input[type="checkbox"]').nth(1).check();
    await p.locator('button:has-text("< 2km")').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '09-all-books-filtered.png'), true);
    captureLog.desktop.push('09-all-books-filtered.png');

    // 1.10 All Available Books Page (Empty Search Results State)
    await p.fill('input[placeholder*="Search books"]', 'nonexistent-book-title-xyz');
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '10-all-books-empty-state.png'));
    captureLog.desktop.push('10-all-books-empty-state.png');

    await ctx.close();
  }

  // 1.11 Book Details Page (Full Page)
  {
    const { ctx, p } = await getGuestPage();
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 300);
    await p.locator('div[role="button"]:has-text("The God of Small Things")').first().click();
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(DESKTOP_DIR, '11-book-details-overview.png'), true);
    captureLog.desktop.push('11-book-details-overview.png');

    // 1.12 Book Details Page (Community Reviews Section)
    const reviewsEl = p.locator('h2:has-text("Community reviews")').first();
    await reviewsEl.scrollIntoViewIfNeeded();
    await p.waitForTimeout(200);
    await takeShot(p, path.join(DESKTOP_DIR, '12-book-details-reviews.png'));
    captureLog.desktop.push('12-book-details-reviews.png');

    // 1.13 Write Community Review Modal
    await p.locator('button:has-text("Write a review")').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '13-book-review-modal.png'));
    captureLog.desktop.push('13-book-review-modal.png');

    // Close review modal
    await p.locator('button:has-text("Cancel")').first().click();
    await p.waitForTimeout(250);

    await ctx.close();
  }

  // 1.14 Action-Guarded Sign In Prompt (Triggered by Borrow click as Guest)
  {
    const { ctx, p } = await getGuestPage();
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 350);
    await p.locator('button:has-text("Borrow")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '14-auth-modal-action-guarded.png'));
    captureLog.desktop.push('14-auth-modal-action-guarded.png');
    await ctx.close();
  }

  // 1.15 Readers Browse Page (Default)
  {
    const { ctx, p } = await getGuestPage();
    await p.goto(`${BASE_URL}/?tab=readers`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '15-readers-browse.png'), true);
    captureLog.desktop.push('15-readers-browse.png');

    // 1.16 Readers Browse Page (Verified Only Filter)
    await p.locator('button:has-text("Verified")').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '16-readers-browse-verified.png'), true);
    captureLog.desktop.push('16-readers-browse-verified.png');

    // 1.17 Readers Browse Page (Empty Search Results State)
    await p.fill('input[placeholder*="Search"]', 'nonexistent-reader-xyz');
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '17-readers-empty-state.png'));
    captureLog.desktop.push('17-readers-empty-state.png');

    await ctx.close();
  }

  // 1.18 Public Reader Profile (Rahim Chowdhury)
  {
    const { ctx, p } = await getGuestPage();
    await p.goto(`${BASE_URL}/?tab=readers`);
    await waitForStableRender(p, 350);
    await p.locator('div[role="button"]:has-text("Rahim Chowdhury")').first().click();
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(DESKTOP_DIR, '18-public-reader-profile.png'), true);
    captureLog.desktop.push('18-public-reader-profile.png');

    // 1.19 Return Reliability System Guide Modal
    await p.locator('button:has-text("5-Tier Guide")').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '19-return-reliability-modal.png'));
    captureLog.desktop.push('19-return-reliability-modal.png');

    await ctx.close();
  }

  // 1.20 404 Not Found Page
  {
    const { ctx, p } = await getGuestPage();
    await p.goto(`${BASE_URL}/?tab=non-existent-route`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '20-not-found-404.png'), true);
    captureLog.desktop.push('20-not-found-404.png');
    await ctx.close();
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DESKTOP EXPERIENCES
  // -------------------------------------------------------------
  // 1.21 Authenticated Home Page
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(DESKTOP_DIR, '21-home-authenticated.png'), true);
    captureLog.desktop.push('21-home-authenticated.png');

    // 1.22 Top Navbar Notifications Dropdown
    await p.locator('button[aria-label="Notifications"]').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '22-navbar-notifications-dropdown.png'));
    captureLog.desktop.push('22-navbar-notifications-dropdown.png');
    await p.locator('button[aria-label="Notifications"]').first().click(); // close

    // 1.23 Top Navbar Profile Dropdown Menu
    await p.locator('header button[aria-haspopup="true"]').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(DESKTOP_DIR, '23-navbar-profile-menu.png'));
    captureLog.desktop.push('23-navbar-profile-menu.png');

    // 1.24 Wishlist & Return Alerts Modal
    await p.locator('button:has-text("Wishlist & Alerts")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '24-wishlist-modal.png'));
    captureLog.desktop.push('24-wishlist-modal.png');

    await ctx.close();
  }

  // 1.25 Floating "+ Add Book" Modal
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 350);
    await p.locator('button[aria-label="Add Book to Community Library"]').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '25-add-book-modal.png'));
    captureLog.desktop.push('25-add-book-modal.png');
    await ctx.close();
  }

  // 1.26 Multi-step Borrow Handover Wizard (All 3 Steps)
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 350);
    await p.locator('button:has-text("Borrow")').first().click();
    await waitForStableRender(p, 350);
    // Step 1: Owner selection & Note
    await takeShot(p, path.join(DESKTOP_DIR, '26-borrow-wizard-step1-condition.png'));
    captureLog.desktop.push('26-borrow-wizard-step1-condition.png');

    // Step 2: Meetup Details & Location Picker
    await p.locator('button:has-text("Continue to meetup")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '27-borrow-wizard-step2-meetup.png'));
    captureLog.desktop.push('27-borrow-wizard-step2-meetup.png');

    // Step 3: Safety Guidelines & Confirmation Receipt
    await p.locator('button:has-text("Review Request")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '28-borrow-wizard-step3-confirmation.png'));
    captureLog.desktop.push('28-borrow-wizard-step3-confirmation.png');

    await ctx.close();
  }

  // 1.29 My Books Page — "My Shelf" Tab
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=my-books`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '29-my-books-shelf.png'), true);
    captureLog.desktop.push('29-my-books-shelf.png');

    // 1.30 My Books Page — "Borrowing" Tab
    await p.locator('button:has-text("Borrowing")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '30-my-books-borrowing.png'), true);
    captureLog.desktop.push('30-my-books-borrowing.png');

    // 1.31 Multi-step Return Handover Wizard (Step 1: Meetup Time & Place)
    await p.locator('button:has-text("Return Book")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '31-return-wizard-step1-meetup.png'));
    captureLog.desktop.push('31-return-wizard-step1-meetup.png');

    // 1.32 Multi-step Return Handover Wizard (Step 2: Confirmation Receipt)
    await p.locator('button:has-text("Review Return Plan")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '32-return-wizard-step2-receipt.png'));
    captureLog.desktop.push('32-return-wizard-step2-receipt.png');

    await ctx.close();
  }

  // 1.33 My Books Page — "History" Tab
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=my-books`);
    await waitForStableRender(p, 350);
    await p.locator('button:has-text("History")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '33-my-books-history.png'), true);
    captureLog.desktop.push('33-my-books-history.png');
    await ctx.close();
  }

  // 1.34 Requests Page (Incoming Borrow Requests)
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=requests`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '34-requests-incoming.png'), true);
    captureLog.desktop.push('34-requests-incoming.png');
    await ctx.close();
  }

  // 1.35 Inbox & Messaging Page (Active Thread & Meetup Banner)
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=messages`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '35-inbox-conversation.png'));
    captureLog.desktop.push('35-inbox-conversation.png');
    await ctx.close();
  }

  // 1.36 Member Profile Page
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=profile`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '36-my-profile.png'), true);
    captureLog.desktop.push('36-my-profile.png');

    // 1.37 Edit Profile Modal
    await p.locator('button:has-text("Edit Profile")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '37-edit-profile-modal.png'));
    captureLog.desktop.push('37-edit-profile-modal.png');

    await ctx.close();
  }

  // 1.38 Settings Modal
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 300);
    await p.locator('header button[aria-haspopup="true"]').first().click();
    await p.locator('button:has-text("Settings")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '38-settings-modal.png'));
    captureLog.desktop.push('38-settings-modal.png');
    await ctx.close();
  }

  // 1.39 Logout Confirmation Dialog
  {
    const { ctx, p } = await getAuthPage();
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 300);
    await p.locator('header button[aria-haspopup="true"]').first().click();
    await p.locator('button:has-text("Log Out")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(DESKTOP_DIR, '39-logout-confirm-dialog.png'));
    captureLog.desktop.push('39-logout-confirm-dialog.png');
    await ctx.close();
  }

  // ==========================================
  // SECTION 2: MOBILE AUDIT (390 × 844)
  // ==========================================
  console.log('\n--- 📱 Capturing Mobile Suite (390x844) ---');

  async function getMobilePage(authenticated = false) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const p = await ctx.newPage();
    await p.addInitScript(({ isAuth, session }) => {
      localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
      if (isAuth) {
        localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
        localStorage.setItem('bookcircle_wishlist', JSON.stringify(['book-1', 'book-4']));
      } else {
        localStorage.removeItem('bookcircle_auth_session');
      }
    }, { isAuth: authenticated, session: DEMO_SESSION });
    return { ctx, p };
  }

  // 2.1 Mobile Onboarding
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.addInitScript(() => {
      localStorage.removeItem('bookcircle_onboarding_dismissed');
      localStorage.removeItem('bookcircle_auth_session');
    });
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '01-onboarding-mobile.png'));
    captureLog.mobile.push('01-onboarding-mobile.png');
    await ctx.close();
  }

  // 2.2 Mobile Home Page (Guest Full Page)
  {
    const { ctx, p } = await getMobilePage(false);
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '02-home-guest-mobile.png'), true);
    captureLog.mobile.push('02-home-guest-mobile.png');

    // 2.3 Mobile Sign In Modal
    await p.locator('button:has-text("Sign In")').first().click();
    await waitForStableRender(p, 300);
    await takeShot(p, path.join(MOBILE_DIR, '03-auth-modal-mobile.png'));
    captureLog.mobile.push('03-auth-modal-mobile.png');

    await ctx.close();
  }

  // 2.4 Mobile All Available Books Page
  {
    const { ctx, p } = await getMobilePage(false);
    await p.goto(`${BASE_URL}/?tab=books`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '04-all-books-mobile.png'), true);
    captureLog.mobile.push('04-all-books-mobile.png');

    // 2.5 Mobile Filter Slide-Over Drawer
    await p.locator('button:has-text("Filters")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '05-all-books-filters-drawer-mobile.png'));
    captureLog.mobile.push('05-all-books-filters-drawer-mobile.png');

    await ctx.close();
  }

  // 2.6 Mobile Book Details Page
  {
    const { ctx, p } = await getMobilePage(false);
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 300);
    await p.locator('div[role="button"]:has-text("The God of Small Things")').first().click();
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(MOBILE_DIR, '06-book-details-mobile.png'), true);
    captureLog.mobile.push('06-book-details-mobile.png');
    await ctx.close();
  }

  // 2.7 Mobile Readers Browse Page
  {
    const { ctx, p } = await getMobilePage(false);
    await p.goto(`${BASE_URL}/?tab=readers`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '07-readers-browse-mobile.png'), true);
    captureLog.mobile.push('07-readers-browse-mobile.png');

    // 2.8 Mobile Public Reader Profile
    await p.locator('div[role="button"]:has-text("Rahim Chowdhury")').first().click();
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(MOBILE_DIR, '08-public-reader-profile-mobile.png'), true);
    captureLog.mobile.push('08-public-reader-profile-mobile.png');

    await ctx.close();
  }

  // 2.9 Mobile Authenticated Views
  {
    const { ctx, p } = await getMobilePage(true);
    await p.goto(`${BASE_URL}/?tab=my-books`);
    await waitForStableRender(p, 350);
    // 2.9 My Books Shelf
    await takeShot(p, path.join(MOBILE_DIR, '09-my-books-shelf-mobile.png'), true);
    captureLog.mobile.push('09-my-books-shelf-mobile.png');

    // 2.10 Mobile Floating Add Book Modal
    await p.locator('button[aria-label="Add Book to Community Library"]').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '10-add-book-mobile.png'));
    captureLog.mobile.push('10-add-book-mobile.png');
    await p.locator('button[aria-label="Close modal"]').first().click();

    // 2.11 Currently Borrowing
    await p.locator('button:has-text("Borrowing")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '11-borrowing-mobile.png'), true);
    captureLog.mobile.push('11-borrowing-mobile.png');

    // 2.12 Mobile Borrow Wizard Modal
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 350);
    await p.locator('button:has-text("Borrow")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '12-borrow-wizard-mobile.png'));
    captureLog.mobile.push('12-borrow-wizard-mobile.png');
    await p.locator('button:has-text("Cancel")').first().click();

    // 2.13 Requests Page
    await p.goto(`${BASE_URL}/?tab=requests`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '13-requests-mobile.png'), true);
    captureLog.mobile.push('13-requests-mobile.png');

    // 2.14 Messages / Inbox
    await p.goto(`${BASE_URL}/?tab=messages`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '14-inbox-mobile.png'));
    captureLog.mobile.push('14-inbox-mobile.png');

    // 2.15 Profile
    await p.goto(`${BASE_URL}/?tab=profile`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '15-my-profile-mobile.png'), true);
    captureLog.mobile.push('15-my-profile-mobile.png');

    // 2.16 Edit Profile Modal
    await p.locator('button:has-text("Edit Profile")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(MOBILE_DIR, '16-edit-profile-modal-mobile.png'));
    captureLog.mobile.push('16-edit-profile-modal-mobile.png');

    await ctx.close();
  }

  // ==========================================
  // SECTION 3: TABLET AUDIT (768 × 1024)
  // ==========================================
  console.log('\n--- 📟 Capturing Tablet Suite (768x1024) ---');

  async function getTabletPage(authenticated = true) {
    const ctx = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      hasTouch: true
    });
    const p = await ctx.newPage();
    await p.addInitScript(({ isAuth, session }) => {
      localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
      if (isAuth) {
        localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
        localStorage.setItem('bookcircle_wishlist', JSON.stringify(['book-1', 'book-4']));
      } else {
        localStorage.removeItem('bookcircle_auth_session');
      }
    }, { isAuth: authenticated, session: DEMO_SESSION });
    return { ctx, p };
  }

  // 3.1 Tablet Home Page
  {
    const { ctx, p } = await getTabletPage(true);
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(TABLET_DIR, '01-home-tablet.png'), true);
    captureLog.tablet.push('01-home-tablet.png');
    await ctx.close();
  }

  // 3.2 Tablet All Available Books
  {
    const { ctx, p } = await getTabletPage(true);
    await p.goto(`${BASE_URL}/?tab=books`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(TABLET_DIR, '02-all-books-tablet.png'), true);
    captureLog.tablet.push('02-all-books-tablet.png');
    await ctx.close();
  }

  // 3.3 Tablet Book Details
  {
    const { ctx, p } = await getTabletPage(true);
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 300);
    await p.locator('div[role="button"]:has-text("The God of Small Things")').first().click();
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(TABLET_DIR, '03-book-details-tablet.png'), true);
    captureLog.tablet.push('03-book-details-tablet.png');
    await ctx.close();
  }

  // 3.4 Tablet Borrow Handover Wizard Modal
  {
    const { ctx, p } = await getTabletPage(true);
    await p.goto(`${BASE_URL}/?tab=home`);
    await waitForStableRender(p, 300);
    await p.locator('button:has-text("Borrow")').first().click();
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(TABLET_DIR, '04-borrow-wizard-tablet.png'));
    captureLog.tablet.push('04-borrow-wizard-tablet.png');
    await ctx.close();
  }

  // 3.5 Tablet Readers Browse Page
  {
    const { ctx, p } = await getTabletPage(true);
    await p.goto(`${BASE_URL}/?tab=readers`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(TABLET_DIR, '05-readers-browse-tablet.png'), true);
    captureLog.tablet.push('05-readers-browse-tablet.png');

    // 3.6 Tablet Public Reader Profile
    await p.locator('div[role="button"]:has-text("Rahim Chowdhury")').first().click();
    await waitForStableRender(p, 400);
    await takeShot(p, path.join(TABLET_DIR, '06-public-reader-profile-tablet.png'), true);
    captureLog.tablet.push('06-public-reader-profile-tablet.png');

    await ctx.close();
  }

  // 3.7 Tablet My Books Shelf View
  {
    const { ctx, p } = await getTabletPage(true);
    await p.goto(`${BASE_URL}/?tab=my-books`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(TABLET_DIR, '07-my-books-shelf-tablet.png'), true);
    captureLog.tablet.push('07-my-books-shelf-tablet.png');
    await ctx.close();
  }

  // 3.8 Tablet Inbox & Messages
  {
    const { ctx, p } = await getTabletPage(true);
    await p.goto(`${BASE_URL}/?tab=messages`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(TABLET_DIR, '08-inbox-tablet.png'));
    captureLog.tablet.push('08-inbox-tablet.png');
    await ctx.close();
  }

  // 3.9 Tablet Member Profile
  {
    const { ctx, p } = await getTabletPage(true);
    await p.goto(`${BASE_URL}/?tab=profile`);
    await waitForStableRender(p, 350);
    await takeShot(p, path.join(TABLET_DIR, '09-my-profile-tablet.png'), true);
    captureLog.tablet.push('09-my-profile-tablet.png');
    await ctx.close();
  }

  await browser.close();

  console.log('\n==========================================');
  console.log('🎉 VISUAL DESIGN AUDIT COMPLETE!');
  console.log(`Desktop Screenshots: ${captureLog.desktop.length}`);
  console.log(`Mobile Screenshots:  ${captureLog.mobile.length}`);
  console.log(`Tablet Screenshots:  ${captureLog.tablet.length}`);
  console.log(`Total Captured:      ${captureLog.desktop.length + captureLog.mobile.length + captureLog.tablet.length}`);
  console.log('==========================================\n');
}

runAudit().catch((err) => {
  console.error('Audit capture failed:', err);
  process.exit(1);
});
