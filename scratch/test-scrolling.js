import { chromium } from 'playwright';

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

async function runTests() {
  console.log('🚀 Starting Scrolling Verification Tests...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.addInitScript(({ session }) => {
    localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  }, { session: DEMO_SESSION });

  const results = [];

  const checkScrollable = async (pageDesc) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(50);
    const beforeScroll = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(100);
    const afterScroll = await page.evaluate(() => window.scrollY);
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    const isScrollable = afterScroll > 0;
    await page.evaluate(() => window.scrollTo(0, 0));
    console.log(`  [${pageDesc}] body.style.overflow: "${bodyOverflow}", scrolled: ${afterScroll}px (Scrollable: ${isScrollable})`);
    return { isScrollable, bodyOverflow, scrolled: afterScroll };
  };

  // Test 1: Home page scrolling
  console.log('\n--- Test 1: Home Page ---');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const homeRes = await checkScrollable('Home Page');
  results.push({ name: 'Home Page Scroll', pass: homeRes.isScrollable && homeRes.bodyOverflow === '' });

  // Test 2: My Books page + Add Book Modal open & close
  console.log('\n--- Test 2: My Books Page & Add Book Modal ---');
  await page.goto('http://localhost:5173/my-books', { waitUntil: 'networkidle' });
  let myBooksRes = await checkScrollable('My Books initial');
  
  // Click "Add a Book" button
  const addBookBtn = page.locator('button:has-text("Add a Book"), button:has-text("Add Book")').first();
  await addBookBtn.click({ timeout: 5000 });
  await page.waitForTimeout(300);
  
  let overflowWhileOpen = await page.evaluate(() => document.body.style.overflow);
  console.log(`  Add Book Modal Open: body.style.overflow = "${overflowWhileOpen}"`);
  
  // Close modal via Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  
  myBooksRes = await checkScrollable('My Books after modal close');
  results.push({
    name: 'Add Book Modal Scroll Lock & Restore',
    pass: overflowWhileOpen === 'hidden' && myBooksRes.bodyOverflow === '' && myBooksRes.isScrollable
  });

  // Test 3: Profile Page & Edit Profile Modal
  console.log('\n--- Test 3: Profile Page & Edit Profile Modal ---');
  await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle' });
  let profileRes = await checkScrollable('Profile initial');
  
  const editProfileBtn = page.locator('button:has-text("Edit Profile")').first();
  if (await editProfileBtn.isVisible()) {
    await editProfileBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    overflowWhileOpen = await page.evaluate(() => document.body.style.overflow);
    console.log(`  Edit Profile Modal Open: body.style.overflow = "${overflowWhileOpen}"`);
    
    // Press Escape to close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    profileRes = await checkScrollable('Profile after modal close');
    results.push({
      name: 'Edit Profile Modal Scroll Lock & Restore',
      pass: overflowWhileOpen === 'hidden' && profileRes.bodyOverflow === '' && profileRes.isScrollable
    });
  }

  // Test 4: Coffee Modal
  console.log('\n--- Test 4: Coffee Modal & Activity Page ---');
  await page.goto('http://localhost:5173/activity', { waitUntil: 'networkidle' });
  
  // Open Coffee Modal via Navbar button
  const coffeeBtn = page.locator('button:has-text("Buy us a coffee"), button[title*="coffee" i]').first();
  if (await coffeeBtn.isVisible()) {
    await coffeeBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    overflowWhileOpen = await page.evaluate(() => document.body.style.overflow);
    console.log(`  Coffee Modal Open: body.style.overflow = "${overflowWhileOpen}"`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const coffeeRes = await checkScrollable('Activity Page after Coffee Modal close');
    results.push({
      name: 'Coffee Modal Scroll Lock & Restore',
      pass: overflowWhileOpen === 'hidden' && coffeeRes.bodyOverflow === '' && coffeeRes.isScrollable
    });
  }

  // Test 5: Route navigation from /messages back to other pages
  console.log('\n--- Test 5: Route Navigation from /messages ---');
  await page.goto('http://localhost:5173/messages', { waitUntil: 'networkidle' });
  const messagesOverflow = await page.evaluate(() => document.body.style.overflow);
  console.log(`  Messages page body overflow: "${messagesOverflow}"`);

  // Navigate to /books
  await page.goto('http://localhost:5173/books', { waitUntil: 'networkidle' });
  const booksRes = await checkScrollable('Books Browse Page after leaving /messages');
  results.push({
    name: 'Navigate from /messages to /books',
    pass: booksRes.bodyOverflow === '' && booksRes.isScrollable
  });

  // Test 6: Mobile Viewport (390x844)
  console.log('\n--- Test 6: Mobile Viewport (390x844) ---');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(({ session }) => {
    localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
    localStorage.setItem('bookcircle_onboarding_dismissed', 'true');
  }, { session: DEMO_SESSION });

  await mobilePage.goto('http://localhost:5173/activity', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(50);
  await mobilePage.evaluate(() => window.scrollTo(0, 200));
  await mobilePage.waitForTimeout(100);
  const afterMobile = await mobilePage.evaluate(() => window.scrollY);
  const mobileOverflow = await mobilePage.evaluate(() => document.body.style.overflow);
  console.log(`  Mobile Activity Page: body.style.overflow = "${mobileOverflow}", scrolled: ${afterMobile}px`);
  results.push({
    name: 'Mobile Activity Scroll',
    pass: mobileOverflow === '' && afterMobile > 0
  });

  await browser.close();

  console.log('\n=======================================');
  console.log('🏁 TEST RESULTS SUMMARY');
  console.log('=======================================');
  let allPassed = true;
  for (const r of results) {
    console.log(`  ${r.pass ? '✅ PASS' : '❌ FAIL'}: ${r.name}`);
    if (!r.pass) allPassed = false;
  }
  console.log('=======================================');
  console.log(`OVERALL: ${allPassed ? 'ALL TESTS PASSED 🎉' : 'SOME TESTS FAILED ⚠️'}`);
  process.exit(allPassed ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});
