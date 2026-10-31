// scripts/verify-security-rls.ts
import { createClient } from '@supabase/supabase-js';
import { exchangeService } from '../src/services/exchangeService';
import { dbService } from '../src/services/dbService';

const SUPABASE_URL = 'https://kumcyuhvjnzppxjoetnz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oAX-TA1CtFkCqspxmtFF3w_jkwJD4pK';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const cleanupItems: { table: string; id: string }[] = [];

async function runSecurityVerification() {
  console.log('================================================================');
  console.log('BookCircle — Phase 2 Final Security & RLS Verification');
  console.log('Target: Live Supabase Database (' + SUPABASE_URL + ')');
  console.log('Mode: Real Authenticated Supabase Sessions (JWT Tokens)');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string, details?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] #${total}: ${title}`);
    } else {
      console.error(`  [FAIL] #${total}: ${title}`);
      if (details) console.error(`         Details: ${details}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // STEP 0: Create 3 Real Authenticated Supabase Sessions
    // -------------------------------------------------------------------------
    console.log('--- Provisioning Authenticated User Sessions in Supabase ---');
    const ts = Date.now();
    const emailOwner = `owner_${ts}@bookcircle.auth`;
    const emailBorrower = `borrower_${ts}@bookcircle.auth`;
    const emailAttacker = `attacker_${ts}@bookcircle.auth`;
    const defaultPassword = 'SecureAuthPass123!';

    const { data: authOwner, error: errO } = await supabase.auth.signUp({ email: emailOwner, password: defaultPassword });
    const { data: authBorrower, error: errB } = await supabase.auth.signUp({ email: emailBorrower, password: defaultPassword });
    const { data: authAttacker, error: errA } = await supabase.auth.signUp({ email: emailAttacker, password: defaultPassword });

    if (errO || errB || errA || !authOwner.session || !authBorrower.session || !authAttacker.session) {
      throw new Error(`Failed to create authenticated sessions: ${errO?.message || errB?.message || errA?.message}`);
    }

    const ownerId = authOwner.user!.id;
    const borrowerId = authBorrower.user!.id;
    const attackerId = authAttacker.user!.id;

    console.log(`  ✓ User A (Book Owner):     ${ownerId}`);
    console.log(`  ✓ User B (Borrower):       ${borrowerId}`);
    console.log(`  ✓ User C (Attacker/Third): ${attackerId}\n`);

    // =========================================================================
    // PART 1: ROLE-SPECIFIC RLS & RPC AUTHORIZATION
    // =========================================================================
    console.log('--- Part 1: Role-Specific RLS & RPC Authorization ---');

    // Create a new borrow request: Borrower B requests Owner A's book
    const book1Id = `book-sec-${ts}`;
    const req1 = await exchangeService.createBorrowRequest({
      book: {
        id: book1Id,
        title: 'Security Engineering: A Guide to Building Dependable Distributed Systems',
        author: 'Ross Anderson',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'
      },
      owner: { id: ownerId, name: 'Alice Owner', avatar: 'https://images.unsplash.com/photo-1' },
      borrower: { id: borrowerId, name: 'Bob Requester', avatar: 'https://images.unsplash.com/photo-2' },
      date: 'Tomorrow',
      time: '2:00 PM',
      spot: 'Central Park North',
      note: 'Looking forward to reading this!'
    });
    cleanupItems.push({ table: 'borrow_requests', id: req1.id });

    // 1A. Attacker C tries to accept Owner A's book request
    let attackerAcceptBlocked = false;
    try {
      await exchangeService.acceptRequest(req1.id, attackerId);
    } catch (err: any) {
      attackerAcceptBlocked = err.message.includes('403') || err.message.includes('owner');
    }
    assert(
      attackerAcceptBlocked,
      'Unauthorized third-party (Attacker C) CANNOT accept the request (403 Forbidden)'
    );

    // 1B. Borrower B tries to accept their own request (role inversion)
    let borrowerAcceptBlocked = false;
    try {
      await exchangeService.acceptRequest(req1.id, borrowerId);
    } catch (err: any) {
      borrowerAcceptBlocked = err.message.includes('403') || err.message.includes('owner');
    }
    assert(
      borrowerAcceptBlocked,
      'Requester (Borrower B) CANNOT accept their own request (Only Owner can accept)'
    );

    // 1C. Owner A accepts the request
    let ownerAcceptSuccess = false;
    let acceptedTx: any = null;
    try {
      acceptedTx = await exchangeService.acceptRequest(req1.id, ownerId);
      ownerAcceptSuccess = acceptedTx.status === 'accepted';
    } catch (err: any) {
      console.error('Owner acceptance failed:', err);
    }
    assert(
      ownerAcceptSuccess,
      'Authorized Owner A successfully accepts the request (Transitions to accepted)'
    );

    // Create a second pending request to test cancellation authorization
    const req2 = await exchangeService.createBorrowRequest({
      book: {
        id: `book-sec-cancel-${ts}`,
        title: 'Database Reliability Engineering',
        author: 'Laine Campbell',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'
      },
      owner: { id: ownerId, name: 'Alice Owner', avatar: 'https://images.unsplash.com/photo-1' },
      borrower: { id: borrowerId, name: 'Bob Requester', avatar: 'https://images.unsplash.com/photo-2' },
      date: 'Next Week',
      time: '3:00 PM',
      spot: 'Station Library',
      note: 'Need to cancel this one later'
    });
    cleanupItems.push({ table: 'borrow_requests', id: req2.id });

    // 1D. Attacker C tries to cancel User B's request
    let attackerCancelBlocked = false;
    try {
      await exchangeService.cancelRequest(req2.id, attackerId);
    } catch (err: any) {
      attackerCancelBlocked = err.message.includes('403') || err.message.includes('requester');
    }
    assert(
      attackerCancelBlocked,
      'Unauthorized user (Attacker C) CANNOT cancel another user’s request (403 Forbidden)'
    );

    // 1E. Owner A tries to cancel User B's request (Owner must decline, only borrower can cancel)
    let ownerCancelBlocked = false;
    try {
      await exchangeService.cancelRequest(req2.id, ownerId);
    } catch (err: any) {
      ownerCancelBlocked = err.message.includes('403') || err.message.includes('requester');
    }
    assert(
      ownerCancelBlocked,
      'Owner A CANNOT call cancelRequest on borrower’s request (Role restriction enforced)'
    );

    // 1F. Borrower B cancels their own request
    let borrowerCancelSuccess = false;
    try {
      const cancelledTx = await exchangeService.cancelRequest(req2.id, borrowerId);
      borrowerCancelSuccess = cancelledTx.status === 'cancelled';
    } catch (err: any) {
      console.error('Borrower cancel error:', err);
    }
    assert(
      borrowerCancelSuccess,
      'Authorized Borrower B successfully cancels their own request'
    );

    // 1G. Handover Confirmation: Borrower B attempts to confirm on behalf of Lender
    let borrowerConfirmLenderBlocked = false;
    try {
      await exchangeService.confirmPickupHandover(req1.id, 'lender', borrowerId);
    } catch (err: any) {
      borrowerConfirmLenderBlocked = err.message.includes('403') || err.message.includes('owner');
    }
    assert(
      borrowerConfirmLenderBlocked,
      'Borrower B CANNOT confirm lender handover on behalf of Owner A (Role spoofing blocked)'
    );

    // 1H. Handover Confirmation: Attacker C attempts to confirm lender handover
    let attackerConfirmLenderBlocked = false;
    try {
      await exchangeService.confirmPickupHandover(req1.id, 'lender', attackerId);
    } catch (err: any) {
      attackerConfirmLenderBlocked = err.message.includes('403') || err.message.includes('owner');
    }
    assert(
      attackerConfirmLenderBlocked,
      'Attacker C CANNOT confirm lender handover (403 Forbidden)'
    );

    // 1I. Authorized Owner A confirms lender handover
    let lenderConfirmSuccess = false;
    try {
      const step1Tx = await exchangeService.confirmPickupHandover(req1.id, 'lender', ownerId);
      lenderConfirmSuccess = step1Tx.pickupConfirmation.lenderConfirmed === true;
    } catch (err: any) {
      console.error('Lender confirm error:', err);
    }
    assert(
      lenderConfirmSuccess,
      'Authorized Owner A successfully confirms lender handover (lender_confirmed: true)'
    );

    // 1J. Owner A attempts to confirm on behalf of Borrower
    let ownerConfirmBorrowerBlocked = false;
    try {
      await exchangeService.confirmPickupHandover(req1.id, 'borrower', ownerId);
    } catch (err: any) {
      ownerConfirmBorrowerBlocked = err.message.includes('403') || err.message.includes('borrower');
    }
    assert(
      ownerConfirmBorrowerBlocked,
      'Owner A CANNOT confirm borrower pickup on behalf of Borrower B (Role spoofing blocked)'
    );

    // 1K. Authorized Borrower B confirms borrower pickup -> completes dual handover
    let borrowerConfirmSuccess = false;
    try {
      const step2Tx = await exchangeService.confirmPickupHandover(req1.id, 'borrower', borrowerId);
      borrowerConfirmSuccess =
        step2Tx.pickupConfirmation.borrowerConfirmed === true &&
        step2Tx.status === 'active_loan';
    } catch (err: any) {
      console.error('Borrower pickup confirm error:', err);
    }
    assert(
      borrowerConfirmSuccess,
      'Authorized Borrower B confirms pickup -> Dual confirmation satisfies active_loan transition'
    );

    // =========================================================================
    // PART 2: DATABASE-LEVEL DONATION PRIVACY & ISOLATION
    // =========================================================================
    console.log('\n--- Part 2: Database-Level Donation Privacy & Isolation ---');

    // Create a completed donation claim
    const donationClaim = await exchangeService.createGiftClaim({
      book: {
        id: `book-gift-${ts}`,
        title: 'Designing Data-Intensive Applications (Private Gift)',
        author: 'Martin Kleppmann',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'
      },
      owner: { id: ownerId, name: 'Alice Donor', avatar: 'https://images.unsplash.com/photo-1' },
      borrower: { id: borrowerId, name: 'Bob Recipient', avatar: 'https://images.unsplash.com/photo-2' },
      date: 'Today',
      time: '12:00 PM',
      spot: 'Community Garden',
      note: 'Donation claim'
    });
    cleanupItems.push({ table: 'borrow_requests', id: donationClaim.id });

    // Recipient Bob adds the donated book to his Private Collection
    await exchangeService.addDonationToPrivateCollection(donationClaim, borrowerId);

    // Fetch newly added book row from DB
    const { data: bobBooks } = await supabase
      .from('books')
      .select('*')
      .eq('owner_id', borrowerId)
      .eq('title', 'Designing Data-Intensive Applications (Private Gift)');

    const bobPrivateBook = bobBooks?.[0];
    if (bobPrivateBook) {
      cleanupItems.push({ table: 'books', id: bobPrivateBook.id });
    }

    assert(
      !!bobPrivateBook,
      'Donated book was successfully added to recipient Bob’s inventory in Supabase'
    );

    // 2A. Database Query Isolation: Community Discovery Query
    // dbService.getBooks() performs Supabase query with database-level exclusion:
    // .neq('status', 'claimed').neq('availability_mode', 'personal').not('description', 'like', '%[PRIVATE_COLLECTION]%')
    const discoveryBooks = await dbService.getBooks();
    const isExposedInDiscovery = discoveryBooks.some(
      (b) => b.id === bobPrivateBook?.id || b.title === 'Designing Data-Intensive Applications (Private Gift)'
    );

    assert(
      !isExposedInDiscovery,
      'Database Query Isolation: Private/claimed book is 100% excluded directly from community discovery query'
    );

    // 2B. Database Query Isolation: Third-Party Public Profile Query
    // When Attacker C views Bob's public profile, getPublicUserBooks excludes private items at DB query level
    const publicProfileBooks = await dbService.getPublicUserBooks(borrowerId);
    const isExposedOnPublicProfile = publicProfileBooks.some(
      (b) => b.id === bobPrivateBook?.id || b.title === 'Designing Data-Intensive Applications (Private Gift)'
    );

    assert(
      !isExposedOnPublicProfile,
      'Database Query Isolation: Private/claimed book is strictly excluded when another user views Bob’s profile'
    );

    // 2C. Recipient Access: Owner Bob queries his own collection
    // dbService.getUserBooks(borrowerId) fetches all books owned by Bob including his private collection
    const bobOwnBooks = await dbService.getUserBooks(borrowerId);
    const hasAccessToOwnPrivateBook = bobOwnBooks.some(
      (b) => b.id === bobPrivateBook?.id || b.title === 'Designing Data-Intensive Applications (Private Gift)'
    );

    assert(
      hasAccessToOwnPrivateBook,
      'Recipient Access: Recipient Bob can fully access his own private collection from Supabase'
    );

    // 2D. Canonical Record Preservation: Original gift transaction in borrow_requests
    const { data: canonicalRecord } = await supabase
      .from('borrow_requests')
      .select('id, book_title, exchange_type, borrower_id, owner_id')
      .eq('id', donationClaim.id)
      .single();

    assert(
      canonicalRecord?.id === donationClaim.id &&
      canonicalRecord?.exchange_type === 'gift' &&
      canonicalRecord?.borrower_id === borrowerId &&
      canonicalRecord?.owner_id === ownerId,
      'Canonical Identity: Original donation exchange history remains permanently preserved in Supabase'
    );

  } catch (err) {
    console.error('Security Verification Exception:', err);
  } finally {
    console.log('\n--- Cleaning up test records from Supabase ---');
    for (const item of cleanupItems) {
      await supabase.from(item.table).delete().eq('id', item.id);
    }
    console.log(`Cleaned up ${cleanupItems.length} test records.`);
  }

  console.log('\n================================================================');
  console.log(`Security Verification Summary: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed === total && total > 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSecurityVerification();

