import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:4173';
const ARTIFACT_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots');
const DESKTOP_DIR = path.join(SCREENSHOTS_DIR, 'Desktop');
const TABLET_DIR = path.join(SCREENSHOTS_DIR, 'Tablet');
const MOBILE_DIR = path.join(SCREENSHOTS_DIR, 'Mobile');

[SCREENSHOTS_DIR, DESKTOP_DIR, TABLET_DIR, MOBILE_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
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
  wishlist: ['book-1', 'book-4'],
};

const DEMO_SESSION = {
  user: DEMO_USER,
  token: 'bc_qa_audit_token',
  createdAt: Date.now(),
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
};

async function saveScreenshot(page, filename, folder) {
  const rootPath = path.join(SCREENSHOTS_DIR, filename);
  const folderPath = path.join(folder, filename);
  await page.screenshot({ path: rootPath, fullPage: true });
  fs.copyFileSync(rootPath, folderPath);
  console.log(`Saved: ${filename} -> ${folderPath}`);
}

async function run() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const targets = [
    { name: 'Desktop', width: 1440, height: 900, folder: DESKTOP_DIR, suffix: '1440' },
    { name: 'Tablet', width: 768, height: 1024, folder: TABLET_DIR, suffix: '768' },
    { name: 'Mobile', width: 390, height: 844, folder: MOBILE_DIR, suffix: '390' },
  ];

  for (const t of targets) {
    console.log(`\n--- Capturing ${t.name} (${t.width}x${t.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: t.width, height: t.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Inject demo auth session
    await page.goto(BASE_URL);
    await page.evaluate((session) => {
      localStorage.setItem('bookcircle_auth_session', JSON.stringify(session));
      localStorage.setItem('bookcircle_auth_user', JSON.stringify(session.user));
    }, DEMO_SESSION);

    // 1. Activity - Lending Tab
    await page.goto(`${BASE_URL}/activity`);
    await page.waitForTimeout(1000);
    // Click Lending tab if available
    const lendingTab = page.locator('button:has-text("Lending")').first();
    if (await lendingTab.isVisible()) {
      await lendingTab.click();
      await page.waitForTimeout(400);
    }
    await saveScreenshot(page, `${t.name === 'Desktop' ? '16' : t.name === 'Tablet' ? '17' : '18'}_activity_lending_${t.suffix}.png`, t.folder);

    // 2. Activity - Borrowing Tab
    const borrowingTab = page.locator('button:has-text("Borrowing")').first();
    if (await borrowingTab.isVisible()) {
      await borrowingTab.click();
      await page.waitForTimeout(400);
      await saveScreenshot(page, `${t.name === 'Desktop' ? '19' : t.name === 'Tablet' ? '20' : '21'}_activity_borrowing_${t.suffix}.png`, t.folder);
    }

    // 3. Activity - History Tab
    const historyTab = page.locator('button:has-text("History")').first();
    if (await historyTab.isVisible()) {
      await historyTab.click();
      await page.waitForTimeout(400);
      await saveScreenshot(page, `${t.name === 'Desktop' ? '22' : t.name === 'Tablet' ? '23' : '24'}_activity_history_${t.suffix}.png`, t.folder);
    }

    // 4. Profile
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForTimeout(800);
    await saveScreenshot(page, `${t.name === 'Desktop' ? '25' : t.name === 'Tablet' ? '26' : '27'}_profile_${t.suffix}.png`, t.folder);

    await context.close();
  }

  await browser.close();
  console.log('\nAll targeted screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
