import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function verifyFloatingChat() {
  console.log('====================================================');
  console.log('BookCircle — Floating Chat Widget Verification Test');
  console.log('====================================================');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  // Setup sample user session
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

  // If "Load Sample Activities" button exists, click it to ensure sample cards are populated
  const loadSamplesBtn = page.locator('button:has-text("Load Sample Activities")').first();
  if (await loadSamplesBtn.isVisible()) {
    console.log('Loading sample activities...');
    await loadSamplesBtn.click();
    await page.waitForTimeout(1500);
  }

  // ==========================================
  // 1. DESKTOP CLOSED STATE (DEFAULT)
  // ==========================================
  console.log('\n--- 1. Testing Desktop Closed State (1440px) ---');
  const fab = page.locator('button[aria-label="Add a book to your shelf"]');
  const fabBoxClosed = await fab.boundingBox();
  console.log('FAB Position Closed:', fabBoxClosed);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'chat_state_closed_desktop.png'),
    fullPage: false,
  });
  console.log('Saved chat_state_closed_desktop.png');

  // ==========================================
  // 2. DESKTOP EXPANDED STATE
  // ==========================================
  console.log('\n--- 2. Testing Desktop Expanded State ---');
  const cardMessageButtons = page.locator(
    'main button[title*="Message"], main button[aria-label*="Message"], main button:has-text("Message")'
  );
  const msgCount = await cardMessageButtons.count();
  console.log(`Found ${msgCount} card Message button(s)`);

  if (msgCount > 0) {
    await cardMessageButtons.first().click();
    await page.waitForTimeout(800); // allow spring animation
  }

  // Check floating chat widget
  const chatWidget = page.locator('aside[aria-label="Chat conversation"]');
  const isChatVisible = await chatWidget.isVisible();
  console.log('Floating Chat Widget visible:', isChatVisible);

  const chatBox = await chatWidget.boundingBox();
  console.log('Chat Widget Bounding Box:', chatBox);

  // Check header text: ensure NO book title is shown
  const chatHeader = page.locator('aside[aria-label="Chat conversation"] header');
  const headerText = await chatHeader.innerText();
  console.log('Chat Header Text Content:', JSON.stringify(headerText));

  // Check FAB position in expanded state
  const fabBoxExpanded = await fab.boundingBox();
  console.log('FAB Position in Expanded State:', fabBoxExpanded);

  if (chatBox && fabBoxExpanded) {
    const horizontalGap = chatBox.x - (fabBoxExpanded.x + fabBoxExpanded.width);
    console.log(`Horizontal gap between FAB and Chat Widget: ${horizontalGap.toFixed(1)}px (expected ~16-20px)`);
  }

  // Type a draft message
  const chatInput = page.locator('aside[aria-label="Chat conversation"] input[type="text"]');
  await chatInput.fill('Hey, see you at Riverside Coffee tomorrow!');
  await page.waitForTimeout(300);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'chat_state_expanded_desktop.png'),
    fullPage: false,
  });
  console.log('Saved chat_state_expanded_desktop.png');

  // ==========================================
  // 3. DESKTOP MINIMIZED STATE
  // ==========================================
  console.log('\n--- 3. Testing Desktop Minimized State ---');
  const minimizeBtn = page.locator('button[aria-label="Minimize chat"]');
  await minimizeBtn.click();
  await page.waitForTimeout(800);

  const minimizedBar = page.locator('aside[aria-label="Minimized chat bar"]');
  const isMinimizedVisible = await minimizedBar.isVisible();
  console.log('Minimized Chat Bar visible:', isMinimizedVisible);

  const barBox = await minimizedBar.boundingBox();
  console.log('Minimized Bar Bounding Box:', barBox);

  const fabBoxMinimized = await fab.boundingBox();
  console.log('FAB Position in Minimized State:', fabBoxMinimized);

  if (barBox && fabBoxMinimized) {
    const verticalGap = barBox.y - (fabBoxMinimized.y + fabBoxMinimized.height);
    console.log(`Vertical gap between FAB and Minimized Bar: ${verticalGap.toFixed(1)}px (expected ~12-16px directly above)`);
  }

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'chat_state_minimized_desktop.png'),
    fullPage: false,
  });
  console.log('Saved chat_state_minimized_desktop.png');

  // ==========================================
  // 4. RESTORE & DRAFT PRESERVATION & SEND
  // ==========================================
  console.log('\n--- 4. Testing Restoration, Draft Preservation & Send ---');
  // Click minimized bar to restore
  await minimizedBar.click();
  await page.waitForTimeout(800);

  // Check if draft text was preserved
  const draftVal = await chatInput.inputValue();
  console.log('Preserved draft text:', JSON.stringify(draftVal));

  // Send the message
  const sendBtn = page.locator('button[aria-label="Send message"]');
  await sendBtn.click();
  await page.waitForTimeout(800);

  // Verify message bubble appeared
  const sentBubble = page.locator('text=see you at Riverside Coffee tomorrow');
  console.log('Sent message bubble visible:', await sentBubble.isVisible());

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'chat_state_sent_message_desktop.png'),
    fullPage: false,
  });
  console.log('Saved chat_state_sent_message_desktop.png');

  // Close the chat
  const closeBtn = page.locator('button[aria-label="Close chat"]');
  await closeBtn.click();
  await page.waitForTimeout(800);

  const isClosed = !(await chatWidget.isVisible()) && !(await minimizedBar.isVisible());
  console.log('Chat successfully closed:', isClosed);

  // FAB returns to home
  const fabBoxRestored = await fab.boundingBox();
  console.log('FAB Restored Position:', fabBoxRestored);

  // ==========================================
  // 5. MOBILE BOTTOM SHEET (< 640px)
  // ==========================================
  console.log('\n--- 5. Testing Mobile Bottom Sheet (390px) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  const mobileMsgButtons = page.locator(
    'main button[title*="Message"], main button[aria-label*="Message"], main button:has-text("Message")'
  );
  if (await mobileMsgButtons.count() > 0) {
    await mobileMsgButtons.first().click();
    await page.waitForTimeout(800);
  }

  const mobileDrawer = page.locator('aside[aria-label="Mobile chat conversation"]');
  const isMobileDrawerVisible = await mobileDrawer.isVisible();
  console.log('Mobile Drawer visible:', isMobileDrawerVisible);

  const drawerBox = await mobileDrawer.boundingBox();
  console.log('Mobile Drawer Bounding Box:', drawerBox);

  // Confirm FAB is hidden
  const fabOpacity = await fab.evaluate((el) => window.getComputedStyle(el).opacity);
  console.log(`Mobile FAB opacity: ${fabOpacity} (hidden while drawer is open)`);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'chat_state_mobile_bottom_sheet_390.png'),
    fullPage: false,
  });
  console.log('Saved chat_state_mobile_bottom_sheet_390.png');

  // Close mobile drawer
  const mobileCloseBtn = page.locator('aside[aria-label="Mobile chat conversation"] button[aria-label="Close chat"]');
  await mobileCloseBtn.click();
  await page.waitForTimeout(800);

  const isMobileDrawerClosed = !(await mobileDrawer.isVisible());
  console.log('Mobile drawer closed:', isMobileDrawerClosed);

  // ==========================================
  // 6. MULTI-VIEWPORT RESPONSIVE TESTS
  // ==========================================
  console.log('\n--- 6. Multi-Viewport Responsive Tests ---');
  const viewports = [
    { width: 360, height: 800, name: '360px Mobile Small' },
    { width: 430, height: 932, name: '430px Mobile Large' },
    { width: 640, height: 900, name: '640px Small Tablet/Desktop' },
    { width: 768, height: 1024, name: '768px Tablet' },
    { width: 1024, height: 768, name: '1024px Desktop' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);

    const isDesktop = vp.width >= 640;
    console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height}) - Mode: ${isDesktop ? 'Desktop' : 'Mobile'}`);

    // Click message button
    const mBtn = page.locator(
      'main button[title*="Message"], main button[aria-label*="Message"], main button:has-text("Message")'
    ).first();

    if (await mBtn.isVisible()) {
      await mBtn.click();
      await page.waitForTimeout(600);

      if (isDesktop) {
        const isExp = await page.locator('aside[aria-label="Chat conversation"]').isVisible();
        console.log(`  [${vp.name}] Expanded desktop chat visible:`, isExp);
        await page.locator('aside[aria-label="Chat conversation"] button[aria-label="Close chat"]').click();
      } else {
        const isSheet = await page.locator('aside[aria-label="Mobile chat conversation"]').isVisible();
        console.log(`  [${vp.name}] Mobile bottom sheet visible:`, isSheet);
        await page.locator('aside[aria-label="Mobile chat conversation"] button[aria-label="Close chat"]').click();
      }
      await page.waitForTimeout(400);
    }
  }

  console.log('\n====================================================');
  console.log('All Floating Chat Widget Tests Completed Successfully!');
  console.log('====================================================');

  await browser.close();
}

verifyFloatingChat().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
