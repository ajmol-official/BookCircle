import { chromium } from 'playwright';

async function testSampleActivitiesFlow() {
  console.log('\n======================================================');
  console.log('Testing Sample Activities Flow for Empty/New User');
  console.log('======================================================\n');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  // Set up a real new user who has 0 activity records
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    const user = {
      id: 'test-user-sample-reader-99',
      email: 'sample.reader@example.com',
      displayName: 'Sample Test Reader',
      authProvider: 'email',
      isProfileComplete: true,
    };
    localStorage.setItem('bookcircle_auth_user', JSON.stringify(user));
    localStorage.setItem('bookcircle_auth_session', JSON.stringify({ user, token: 'test-token' }));
  });

  // Navigate to /activity
  await page.goto('http://localhost:5173/activity', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Initial State: Empty banner visible
  const emptyBanner = await page.locator('text=Explore the Activity Lifecycle').isVisible();
  console.log('1. Empty helper banner visible:', emptyBanner);

  const lendingCardsBefore = await page.locator('.shadow-card').count();
  console.log('   Lending cards before seeding:', lendingCardsBefore);

  // 2. Click "Load Sample Activities"
  console.log('\n2. Clicking "Load Sample Activities"...');
  const seedBtn = page.locator('button:has-text("Load Sample Activities")').first();
  await seedBtn.click();
  await page.waitForTimeout(2000);

  // 3. Verify cards are populated
  const lendingCardsAfter = await page.locator('.shadow-card').count();
  console.log('3. Lending cards after seeding:', lendingCardsAfter);

  // Check section headings
  const pendingRequests = await page.locator('text=Pending Requests').isVisible();
  console.log('   Has Pending Requests section:', pendingRequests);

  const handoverSection = await page.locator('text=Handover Confirmation').isVisible();
  console.log('   Has Handover Confirmation section:', handoverSection);

  const activeLoanSection = await page.locator('text=Currently Lent').isVisible();
  console.log('   Has Currently Lent section:', activeLoanSection);

  const returnsSection = await page.locator('text=Returns to Review').isVisible();
  console.log('   Has Returns to Review section:', returnsSection);

  // 4. Test Borrowing Tab
  console.log('\n4. Switching to Borrowing tab...');
  const borrowingTab = page.locator('button:has-text("Borrowing")').first();
  await borrowingTab.click();
  await page.waitForTimeout(600);
  const borrowCards = await page.locator('.shadow-card').count();
  console.log('   Borrowing cards count:', borrowCards);

  // 5. Test History Tab
  console.log('\n5. Switching to History tab...');
  const historyTab = page.locator('button:has-text("History")').first();
  await historyTab.click();
  await page.waitForTimeout(600);
  const histCards = await page.locator('.shadow-card').count();
  console.log('   History cards count:', histCards);

  // 6. Test Interactive Action: Accept Request in Lending
  console.log('\n6. Testing interactive action: Accept Meetup...');
  const lendingTab = page.locator('button:has-text("Lending")').first();
  await lendingTab.click();
  await page.waitForTimeout(500);

  const acceptBtn = page.locator('button:has-text("Accept Meetup")').first();
  if (await acceptBtn.isVisible()) {
    await acceptBtn.click();
    await page.waitForTimeout(1500);
    console.log('   [PASS] Clicked Accept Meetup successfully!');
  }

  // 7. Clean up sample data
  console.log('\n7. Cleaning up sample test data...');
  const clearBtn = page.locator('button:has-text("Clear Samples")').first();
  if (await clearBtn.isVisible()) {
    await clearBtn.click();
    await page.waitForTimeout(1000);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const lendingCardsFinal = await page.locator('.shadow-card').count();
    console.log('   Lending cards after Clear Samples and reload:', lendingCardsFinal);
  }

  console.log('\n======================================================');
  console.log('All tests completed successfully!');
  console.log('======================================================\n');

  await browser.close();
}

testSampleActivitiesFlow().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
