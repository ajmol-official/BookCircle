import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

const DEMO_USER = {
  id: 'user-maya-lin',
  email: 'maya.reader@bookcircle.org',
  phoneNumber: '+44 7700 900077',
  countryCode: '+44',
  displayName: 'Maya Lin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  location: 'Elm Park, North London',
  bio: 'Slow reader. Love novels that feel like long walks.',
  memberSince: 'February 2024',
  trustScore: 4.9,
  lendsCount: 18,
  borrowsCount: 24,
  authProvider: 'demo',
  favoriteGenres: ['Fiction', 'Non-fiction'],
  isProfileComplete: true,
  notificationPreferences: { email: true, push: true, whatsapp: true },
  wishlist: []
};

const DEMO_SESSION = {
  user: DEMO_USER,
  token: 'bc_qa_token',
  createdAt: Date.now(),
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
};

async function verifyWhoWeAre() {
  console.log('🚀 Starting "Who We Are" Page Verification Tests...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const results = [];

  // 1. Desktop Test (1440x900)
  console.log('\n--- 1. Desktop (1440x900) ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.addInitScript(({ session }) => {
    localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  }, { session: DEMO_SESSION });

  // Test footer link from Home
  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const footerLink = desktopPage.locator('footer button:has-text("Who We Are")');
  const footerLinkVisible = await footerLink.isVisible();
  console.log(`  Footer "Who We Are" link visible: ${footerLinkVisible}`);
  results.push({ name: 'Footer Link Visibility', pass: footerLinkVisible });

  // Click footer link to navigate to /who-we-are
  await footerLink.click();
  await desktopPage.waitForTimeout(400);
  const currentUrl = desktopPage.url();
  console.log(`  Navigated to: ${currentUrl}`);
  results.push({ name: 'Footer Link Navigation', pass: currentUrl.includes('/who-we-are') });

  // Verify Section 01: Hero / Our Story
  const heroHeading = await desktopPage.locator('h1').textContent();
  console.log(`  Hero Heading: "${heroHeading?.trim()}"`);
  results.push({
    name: 'Section 1: Hero Headline',
    pass: heroHeading?.includes('A book deserves more than one reader.')
  });

  // Verify Section 02: Mission & Vision
  const pageText = await desktopPage.locator('main').textContent();
  const hasMission = pageText?.includes('Make reading more accessible by connecting people through the simple act of sharing books.');
  const hasVision = pageText?.includes('A world where books continue their journey from one reader to another, building stronger reading communities along the way.');
  console.log(`  Mission present: ${hasMission}, Vision present: ${hasVision}`);
  results.push({ name: 'Section 2: Mission & Vision Text', pass: hasMission && hasVision });

  // Verify Section 03: How BookCircle Works (4 steps)
  const hasStep1 = pageText?.includes('List Your Books');
  const hasStep2 = pageText?.includes('Discover Books');
  const hasStep3 = pageText?.includes('Connect & Exchange');
  const hasStep4 = pageText?.includes('Read & Pass It On');
  console.log(`  4 Steps: ${hasStep1}, ${hasStep2}, ${hasStep3}, ${hasStep4}`);
  results.push({ name: 'Section 3: 4 Steps Present', pass: hasStep1 && hasStep2 && hasStep3 && hasStep4 });

  // Verify Section 04: Sustainability
  const hasSustainabilityHeading = pageText?.includes('Community-powered. Built to last.');
  const hasPillar1 = pageText?.includes('Community Contributions');
  const hasPillar2 = pageText?.includes('Future Advertising');
  const hasPillar3 = pageText?.includes('Our Commitment');
  console.log(`  Sustainability: ${hasSustainabilityHeading}, Pillars: ${hasPillar1 && hasPillar2 && hasPillar3}`);
  results.push({
    name: 'Section 4: Sustainability Model',
    pass: hasSustainabilityHeading && hasPillar1 && hasPillar2 && hasPillar3
  });

  // Verify Section 05: Commitments
  const hasCommitmentsHeading = pageText?.includes('Built on trust, respect, and shared responsibility.');
  const hasPrivacy = pageText?.includes('Privacy First');
  const hasSafe = pageText?.includes('Safe Exchanges');
  const hasRespect = pageText?.includes('Community Respect');
  const hasTransparency = pageText?.includes('Transparency');
  const hasAccessible = pageText?.includes('Accessible Reading');
  results.push({
    name: 'Section 5: Community Commitments',
    pass: hasCommitmentsHeading && hasPrivacy && hasSafe && hasRespect && hasTransparency && hasAccessible
  });

  // Verify Section 06: Join the Circle
  const hasClosingHeadline = pageText?.includes('Every book has another story to share.');
  const hasClosingDesc = pageText?.includes('Be part of a community that believes great books should keep moving.');
  results.push({
    name: 'Section 6: Join the Circle',
    pass: hasClosingHeadline && hasClosingDesc
  });

  // Take full page desktop screenshot
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, 'who_we_are_desktop_1440.png'),
    fullPage: true
  });
  console.log('  Saved desktop screenshot: who_we_are_desktop_1440.png');

  // Test interactive CTAs: Support Our Mission opens Coffee Modal
  const supportBtn = desktopPage.locator('button:has-text("Support Our Mission")').first();
  await supportBtn.click();
  await desktopPage.waitForTimeout(300);
  const coffeeModalVisible = await desktopPage.locator('text="Buy us a coffee"').isVisible();
  console.log(`  Coffee modal opened: ${coffeeModalVisible}`);
  results.push({ name: 'Support Our Mission opens Coffee Modal', pass: coffeeModalVisible });
  // Close coffee modal
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(300);

  // Test Explore Books CTA navigates to /books
  const exploreBtn = desktopPage.locator('button:has-text("Explore Books")').first();
  await exploreBtn.click();
  await desktopPage.waitForTimeout(400);
  const booksUrl = desktopPage.url();
  console.log(`  Explore Books navigated to: ${booksUrl}`);
  results.push({ name: 'Explore Books Navigation', pass: booksUrl.includes('/books') });

  // 2. Tablet Test (768x1024)
  console.log('\n--- 2. Tablet (768x1024) ---');
  const tabletContext = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.addInitScript(({ session }) => {
    localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  }, { session: DEMO_SESSION });

  await tabletPage.goto('http://localhost:5173/who-we-are', { waitUntil: 'networkidle' });
  await tabletPage.screenshot({
    path: path.join(ARTIFACT_DIR, 'who_we_are_tablet_768.png'),
    fullPage: true
  });
  console.log('  Saved tablet screenshot: who_we_are_tablet_768.png');
  results.push({ name: 'Tablet Render', pass: true });

  // 3. Mobile Test (390x844)
  console.log('\n--- 3. Mobile (390x844) ---');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(({ session }) => {
    localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  }, { session: DEMO_SESSION });

  await mobilePage.goto('http://localhost:5173/who-we-are', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, 'who_we_are_mobile_390.png'),
    fullPage: true
  });
  console.log('  Saved mobile screenshot: who_we_are_mobile_390.png');
  results.push({ name: 'Mobile Render', pass: true });

  // 4. Verify existing pages remain completely intact
  console.log('\n--- 4. Regression Check on Existing Pages ---');
  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const homeHeroExists = await desktopPage.locator('h1:has-text("Explore Local Books"), h1:has-text("Good")').first().isVisible();
  console.log(`  Home Page Header intact: ${homeHeroExists}`);
  results.push({ name: 'Home Page Intact', pass: homeHeroExists });

  await desktopPage.goto('http://localhost:5173/books', { waitUntil: 'networkidle' });
  const booksHeaderExists = await desktopPage.locator('h1:has-text("Find & Explore Books")').first().isVisible();
  console.log(`  Books Browse Page intact: ${booksHeaderExists}`);
  results.push({ name: 'Books Page Intact', pass: booksHeaderExists });

  await desktopPage.goto('http://localhost:5173/activity', { waitUntil: 'networkidle' });
  const activityHeaderExists = await desktopPage.locator('h1:has-text("Activity")').first().isVisible();
  console.log(`  Activity Page intact: ${activityHeaderExists}`);
  results.push({ name: 'Activity Page Intact', pass: activityHeaderExists });

  await browser.close();

  console.log('\n=======================================');
  console.log('🏁 WHO WE ARE VERIFICATION SUMMARY');
  console.log('=======================================');
  let allPassed = true;
  for (const r of results) {
    console.log(`  ${r.pass ? '✅ PASS' : '❌ FAIL'}: ${r.name}`);
    if (!r.pass) allPassed = false;
  }
  console.log('=======================================');
  console.log(`OVERALL: ${allPassed ? 'ALL VERIFICATIONS PASSED 🎉' : 'SOME VERIFICATIONS FAILED ⚠️'}`);
  process.exit(allPassed ? 0 : 1);
}

verifyWhoWeAre().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
