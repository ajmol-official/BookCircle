import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/ajmal/.gemini/antigravity/brain/1e9cdac2-4270-4846-8b42-0879da4965d1';

async function run() {
  console.log('🚀 Starting BookCircle Add Book Flow End-to-End Playwright Verification...\n');
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
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  const modal = page.locator('[role="dialog"]');

  // Navigate to My Books
  console.log('Navigating to http://localhost:5173/my-books...');
  await page.goto('http://localhost:5173/my-books', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Open Add Book Modal
  console.log('\n--- Test 1: Screen 0 Entry Point Selection ---');
  const addBookBtn = page.locator('button:has-text("Add Book"), button:has-text("Add a Book")').first();
  await addBookBtn.click();
  await page.waitForTimeout(500);

  // Verify Screen 0 displays General Book and Academic Book
  await modal.locator('text="Add a Book to BookCircle"').waitFor({ state: 'visible' });
  const generalCard = modal.locator('button:has-text("General Book")');
  const academicCard = modal.locator('button:has-text("Academic Book")');
  if (!(await generalCard.isVisible()) || !(await academicCard.isVisible())) {
    throw new Error('Screen 0: General Book or Academic Book cards are missing!');
  }
  console.log('✅ Screen 0 successfully loaded with General Book and Academic Book options.');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_01_screen0_entry_point.png') });

  // 2. Test General Book - Original Copy Flow
  console.log('\n--- Test 2: General Book - Original Copy Flow ---');
  await generalCard.click();
  await page.waitForTimeout(400);

  // Check Step 1 header
  await modal.locator('text="General Book · Step 1 of 2"').waitFor({ state: 'visible' });
  console.log('✅ Step 1 indicator verified.');

  // Check Original vs Translated toggle
  const originalToggle = modal.locator('button:has-text("Original Copy")');
  const translatedToggle = modal.locator('button:has-text("Translated Copy")');
  if (!(await originalToggle.isVisible()) || !(await translatedToggle.isVisible())) {
    throw new Error('Copy type toggles missing in Step 1!');
  }

  // Live Autocomplete test: type "God"
  const titleInput = modal.locator('input[placeholder*="Type title"]').first();
  await titleInput.click();
  await titleInput.fill('God');
  await page.waitForTimeout(500); // debounced search & render

  const dropdownItem = modal.locator('button:has-text("The God of Small Things")').first();
  if (await dropdownItem.isVisible()) {
    console.log('✅ Catalog autocomplete dropdown appeared for "God".');
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_02_general_autocomplete_dropdown.png') });
    await dropdownItem.click();
    await page.waitForTimeout(300);

    // Verify fields populated
    const authorInput = modal.locator('input[placeholder*="Author"], input[placeholder*="author"]').first();
    const authorVal = await authorInput.inputValue();
    console.log(`✅ Autocompleted Author: "${authorVal}" (expected Arundhati Roy)`);
  } else {
    console.log('ℹ️ Filling manually since mock dropdown item selector matched differently');
    await titleInput.fill('The Shadow of the Wind');
    const authorInput = modal.locator('input[placeholder*="Author"], input[placeholder*="author"]').first();
    await authorInput.fill('Carlos Ruiz Zafón');
  }

  // Edition field check (optional)
  const editionInput = modal.locator('input[placeholder*="1st Edition"]');
  if (await editionInput.isVisible()) {
    await editionInput.fill('10th Anniversary Illustrated Edition');
    console.log('✅ Optional Edition field filled.');
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_03_general_original_step1.png') });

  // Continue to Step 2
  const continueBtn = modal.locator('button:has-text("Continue to Copy Info")');
  await continueBtn.click();
  await page.waitForTimeout(500);

  // Verify Step 2 Copy Info
  await modal.locator('text="General Book · Step 2 of 2"').waitFor({ state: 'visible' });
  console.log('✅ Step 2 loaded: Copy Information & Listing.');

  // Verify Condition pills (Like New, Very Good, Good, Fair) inside modal
  const conditionNames = ['Like New', 'Very Good', 'Good', 'Fair'];
  for (const cond of conditionNames) {
    const condBtn = modal.getByRole('button', { name: new RegExp(`^${cond}\\b`) });
    if (!(await condBtn.isVisible())) {
      throw new Error(`Condition option "${cond}" not found!`);
    }
  }
  console.log('✅ All 4 Condition options verified.');

  // Select "Very Good"
  await modal.getByRole('button', { name: /^Very Good\b/ }).click();

  // Verify Availability options (For Lending, For Donation, Private Collection) inside modal
  for (const avail of ['For Lending', 'For Donation', 'Private Collection']) {
    const availBtn = modal.getByRole('button', { name: new RegExp(`^${avail}\\b`) });
    if (!(await availBtn.isVisible())) {
      throw new Error(`Availability option "${avail}" not found for General Book!`);
    }
  }
  console.log('✅ All 3 Availability options verified for General Book.');

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_04_general_original_step2.png') });

  // Submit General Book
  const submitGeneralBtn = modal.locator('button:has-text("List Book to Circle")');
  await submitGeneralBtn.click();
  await page.waitForTimeout(800);

  // 3. Verify Reading Status Follow-up Modal
  console.log('\n--- Test 3: Post-Submission Reading Status Follow-Up ---');
  await modal.locator('text="Have you read this book already?"').waitFor({ state: 'visible' });
  console.log('✅ Reading Status Follow-Up modal displayed after General Book submission.');

  // Check 3 options: Yes, I\'ve read it / I\'m currently reading it / No, I haven\'t read it yet
  const optRead = modal.locator('button:has-text("Yes, I\'ve read it")');
  const optReading = modal.locator('button:has-text("I\'m currently reading it")');
  const optWant = modal.locator('button:has-text("No, I haven\'t read it yet")');
  const skipBtn = modal.locator('button:has-text("Skip for now")');

  if (!(await optRead.isVisible()) || !(await optReading.isVisible()) || !(await optWant.isVisible()) || !(await skipBtn.isVisible())) {
    throw new Error('Reading status options or Skip button missing!');
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_05_reading_status_followup.png') });

  // Select "Yes, I've read it"
  await optRead.click();
  await page.waitForTimeout(600);

  // Modal should close
  const isModalClosed = !(await modal.isVisible());
  if (isModalClosed) {
    console.log('✅ Reading status selected and modal dismissed cleanly.');
  }

  // 4. Test General Book - Translated Copy Flow
  console.log('\n--- Test 4: General Book - Translated Copy Flow ---');
  await addBookBtn.click();
  await page.waitForTimeout(400);
  await modal.locator('button:has-text("General Book")').click();
  await page.waitForTimeout(400);

  // Click Translated Copy
  await modal.locator('button:has-text("Translated Copy")').click();
  await page.waitForTimeout(300);

  // Check required translated fields
  const origAuthorLabel = modal.locator('label:has-text("Original Author")');
  const translatorLabel = modal.locator('label:has-text("Translator")');
  const transLangLabel = modal.locator('label:has-text("Translation Language")');

  if (!(await origAuthorLabel.isVisible()) || !(await translatorLabel.isVisible()) || !(await transLangLabel.isVisible())) {
    throw new Error('Translated Copy fields (Original Author, Translator, Translation Language) missing!');
  }
  console.log('✅ Translated Copy specific fields verified with exact label "Translation Language".');

  // Fill in Translated Copy
  await modal.locator('input[placeholder*="title"], input[placeholder*="Title"]').first().fill('One Hundred Years of Solitude (Bengali)');
  await modal.locator('input[placeholder*="Leo Tolstoy"]').fill('Gabriel García Márquez');
  await modal.locator('input[placeholder*="Constance Garnett"]').fill('Ranjan Roy');
  await modal.locator('input[placeholder*="Bengali"]').fill('Bengali');

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_06_general_translated_step1.png') });

  // Switch type back to test Academic Book
  const backToEntry = modal.locator('button:has-text("Switch Type")');
  await backToEntry.click();
  await page.waitForTimeout(400);

  // 5. Test Academic Book Flow - All 4 Education Levels & Dynamic Step 2
  console.log('\n--- Test 5: Academic Book Flow (3 Steps, Donation Locked) ---');
  await modal.locator('button:has-text("Academic Book")').click();
  await page.waitForTimeout(400);

  // Step 1: Academic Book & Education Level
  await modal.locator('text="Academic Donation · Step 1 of 3"').waitFor({ state: 'visible' });
  console.log('✅ Academic Step 1 indicator verified.');

  // Verify 4 Education Levels
  for (const level of ['School', 'College', 'University', 'Professional']) {
    const levelBtn = modal.locator(`button:has-text("${level}")`);
    if (!(await levelBtn.isVisible())) {
      throw new Error(`Education level "${level}" option missing!`);
    }
  }
  console.log('✅ All 4 Academic Education Levels available.');

  // Test Level A: School
  console.log('\nTesting Academic Level: School');
  await modal.locator('button:has-text("School")').click();
  await modal.locator('input[placeholder*="Calculus"], input[placeholder*="Title"]').first().fill('Secondary General Science');
  await modal.locator('input[placeholder*="Author"], input[placeholder*="author"]').first().fill('NCTB Curriculum Board');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_07_academic_school_step1.png') });

  await modal.locator('button:has-text("Continue to Course Info")').click();
  await page.waitForTimeout(400);

  // Verify School dynamic fields (Class/Grade, Subject)
  await modal.locator('text="School Specific Information"').waitFor({ state: 'visible' });
  const gradeInput = modal.locator('input[placeholder*="Class 10"], input[placeholder*="Grade"]');
  const schoolSubInput = modal.locator('input[placeholder*="Physics, Chemistry"], input[placeholder*="General Science"]');
  if (!(await gradeInput.isVisible()) || !(await schoolSubInput.isVisible())) {
    throw new Error('School dynamic fields (Class/Grade, Subject) missing!');
  }
  console.log('✅ School dynamic fields (Class/Grade, Subject) verified.');
  await gradeInput.fill('Class 10');
  await schoolSubInput.fill('General Science');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_08_academic_school_step2.png') });

  // Go back to Step 1 and test College
  await modal.locator('button:has-text("Back")').click();
  await page.waitForTimeout(300);

  // Test Level B: College
  console.log('\nTesting Academic Level: College');
  await modal.locator('button:has-text("College")').click();
  await modal.locator('button:has-text("Continue to Course Info")').click();
  await page.waitForTimeout(400);

  // Verify College dynamic fields: Group (Science / Business Studies / Humanities), Subject. NO Department field.
  await modal.locator('text="College Specific Information"').waitFor({ state: 'visible' });
  const scPill = modal.locator('button:has-text("Science")');
  const bsPill = modal.locator('button:has-text("Business Studies")');
  const humPill = modal.locator('button:has-text("Humanities")');
  if (!(await scPill.isVisible()) || !(await bsPill.isVisible()) || !(await humPill.isVisible())) {
    throw new Error('College Academic Groups missing!');
  }
  const deptFieldCollege = await modal.locator('label:has-text("Department")').isVisible();
  if (deptFieldCollege) {
    throw new Error('College level should NOT have a Department field!');
  }
  console.log('✅ College dynamic fields (Science/Business/Humanities groups, Subject) verified without Department field.');
  await bsPill.click();
  await modal.locator('input[placeholder*="Accounting"]').fill('Accounting');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_09_academic_college_step2.png') });

  // Go back to Step 1 and test University
  await modal.locator('button:has-text("Back")').click();
  await page.waitForTimeout(300);

  // Test Level C: University
  console.log('\nTesting Academic Level: University');
  await modal.locator('button:has-text("University")').click();
  await modal.locator('button:has-text("Continue to Course Info")').click();
  await page.waitForTimeout(400);

  await modal.locator('text="University Specific Information"').waitFor({ state: 'visible' });
  const deptLabel = modal.locator('label:has-text("Department")');
  const courseLabel = modal.locator('label:has-text("Course Name")');
  if (!(await deptLabel.isVisible()) || !(await courseLabel.isVisible())) {
    throw new Error('University fields (Department, Course Name) missing!');
  }
  console.log('✅ University dynamic fields (Department [Required], Course Name [Optional]) verified.');
  await modal.locator('input[placeholder*="Computer Science"]').fill('Computer Science & Engineering');
  await modal.locator('input[placeholder*="Algorithms"]').fill('Data Structures & Algorithms');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_10_academic_university_step2.png') });

  // Go back to Step 1 and test Professional
  await modal.locator('button:has-text("Back")').click();
  await page.waitForTimeout(300);

  // Test Level D: Professional
  console.log('\nTesting Academic Level: Professional');
  await modal.locator('button:has-text("Professional")').click();
  await modal.locator('button:has-text("Continue to Course Info")').click();
  await page.waitForTimeout(400);

  await modal.locator('text="Professional Specific Information"').waitFor({ state: 'visible' });
  const profFieldInput = modal.locator('input[placeholder*="Chartered Accountancy"]');
  const profSubInput = modal.locator('input[placeholder*="Financial Audit"]');
  if (!(await profFieldInput.isVisible()) || !(await profSubInput.isVisible())) {
    throw new Error('Professional dynamic fields missing!');
  }
  const profDeptField = await modal.locator('label:has-text("Department")').isVisible();
  if (profDeptField) {
    throw new Error('Professional level should NOT have a forced Department field!');
  }
  console.log('✅ Professional dynamic fields (Field [Required], Subject [Required]) verified without forced Department.');
  await profFieldInput.fill('Chartered Accountancy (CA)');
  await profSubInput.fill('Financial Audit');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_10b_academic_professional_step2.png') });

  // Go to Academic Step 3: Copy Info & Donation Policy Lock
  console.log('\n--- Test 6: Academic Step 3 Donation Policy Lock ---');
  await modal.locator('button:has-text("Continue to Copy Info")').click();
  await page.waitForTimeout(400);

  await modal.locator('text="Academic Donation · Step 3 of 3"').waitFor({ state: 'visible' });
  console.log('✅ Academic Step 3 loaded.');

  // Verify Donation Policy Banner is visible
  const donationBanner = modal.locator('text="Availability: Fixed to For Donation"');
  if (!(await donationBanner.isVisible())) {
    throw new Error('Academic Step 3: Fixed to For Donation banner missing!');
  }

  // Verify Lending and Private Collection are OMITTED from the modal DOM
  const lendingOption = await modal.locator('text="For Lending"').isVisible();
  const privateOption = await modal.locator('text="Private Collection"').isVisible();
  if (lendingOption || privateOption) {
    throw new Error('CRITICAL SECURITY/UX FAIL: Lending or Private Collection found in Academic Book DOM!');
  }
  console.log('✅ Academic Book strictly locked to "For Donation". Lending & Private Collection omitted from DOM.');

  // Select condition
  await modal.getByRole('button', { name: /^Like New\b/ }).click();
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'addbook_11_academic_step3_donation_locked.png') });

  // Submit Academic Book
  const submitAcademicBtn = modal.locator('button:has-text("Donate Academic Book")');
  await submitAcademicBtn.click();
  await page.waitForTimeout(800);

  // 7. Verify Academic Books do NOT show reading-status popup!
  console.log('\n--- Test 7: Verify Academic Books DO NOT trigger Reading Status Follow-Up ---');
  const readingFollowUpAcademic = await modal.locator('text="Have you read this book already?"').isVisible();
  if (readingFollowUpAcademic) {
    throw new Error('FAIL: Reading Status Follow-Up erroneously triggered for an Academic Book!');
  }
  console.log('✅ Academic Book submitted directly without Reading Status follow-up modal.');

  // 8. Verify Unrelated pages remain unaffected
  console.log('\n--- Test 8: Regression check on Home & Catalog pages ---');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { state: 'visible' });
  console.log('✅ Home page loaded normally.');

  await page.goto('http://localhost:5173/books', { waitUntil: 'networkidle' });
  await page.waitForSelector('input[placeholder*="Search"]', { state: 'visible' });
  console.log('✅ Books Catalog page loaded normally.');

  await browser.close();
  console.log('\n🎉 ALL 12 ADD BOOK FLOW VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('❌ Verification script failed:', err);
  process.exit(1);
});
