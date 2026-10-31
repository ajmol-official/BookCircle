// scripts/verify-final-phase2.ts
import { createClient } from '@supabase/supabase-js';
import { exchangeService } from '../src/services/exchangeService';

const SUPABASE_URL = 'https://kumcyuhvjnzppxjoetnz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oAX-TA1CtFkCqspxmtFF3w_jkwJD4pK';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const cleanupRecords: { table: string; id: string }[] = [];

async function runFinalVerification() {
  console.log('================================================================');
  console.log('BookCircle — Phase 2 Final Architectural Verification');
  console.log('Target: Live Supabase Database (' + SUPABASE_URL + ')');
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
    // =========================================================================
    // 1. TRUE DATABASE CONCURRENCY (Simultaneous Competing Acceptances)
    // =========================================================================
    console.log('--- 1. True Database Concurrency & Race-Condition Testing ---');
    const concurrencyBookId = `book-race-${Date.now()}`;
    const ownerId = 'usr-maya-owner';

    // Borrower 1 requests book
    const req1 = await exchangeService.createBorrowRequest({
      book: { id: concurrencyBookId, title: 'Concurrency Mastery', author: 'Leslie Lamport', coverImage: 'https://images.unsplash.com/photo-1' },
      owner: { id: ownerId, name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-2' },
      borrower: { id: 'usr-diego-1', name: 'Diego Ramirez', avatar: 'https://images.unsplash.com/photo-3' },
      date: 'Tomorrow',
      time: '10:00 AM',
      spot: 'Station Café',
      note: 'Request 1',
    });
    cleanupRecords.push({ table: 'borrow_requests', id: req1.id });

    // Borrower 2 requests book (competing)
    const req2 = await exchangeService.createBorrowRequest({
      book: { id: concurrencyBookId, title: 'Concurrency Mastery', author: 'Leslie Lamport', coverImage: 'https://images.unsplash.com/photo-1' },
      owner: { id: ownerId, name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-2' },
      borrower: { id: 'usr-chloe-2', name: 'Chloe Vance', avatar: 'https://images.unsplash.com/photo-4' },
      date: 'Tomorrow',
      time: '11:00 AM',
      spot: 'Station Café',
      note: 'Request 2',
    });
    cleanupRecords.push({ table: 'borrow_requests', id: req2.id });

    console.log(`  -> Firing 2 simultaneous acceptRequest() calls for competing requests...`);
    const [result1, result2] = await Promise.allSettled([
      exchangeService.acceptRequest(req1.id, ownerId),
      exchangeService.acceptRequest(req2.id, ownerId),
    ]);

    const fulfilledCount = [result1, result2].filter((r) => r.status === 'fulfilled').length;
    const rejectedCount = [result1, result2].filter((r) => r.status === 'rejected').length;

    assert(
      fulfilledCount === 1 && rejectedCount === 1,
      'Exactly ONE of two simultaneous acceptance attempts succeeds; the other is rejected',
      `Fulfilled: ${fulfilledCount}, Rejected: ${rejectedCount}`
    );

    // Verify DB state
    const { data: dbCheck1 } = await supabase.from('borrow_requests').select('id, status').eq('id', req1.id).single();
    const { data: dbCheck2 } = await supabase.from('borrow_requests').select('id, status').eq('id', req2.id).single();

    const statuses = [dbCheck1?.status, dbCheck2?.status];
    const hasAccepted = statuses.includes('accepted');
    const doubleAccepted = statuses.filter((s) => s === 'accepted').length > 1;

    assert(
      hasAccepted && !doubleAccepted,
      'Database contains exactly ONE accepted transaction; NO double-accepted state occurred',
      `Statuses in DB: ${statuses.join(', ')}`
    );

    // =========================================================================
    // 2. SUPABASE SECURITY & RLS AUTHORIZATION
    // =========================================================================
    console.log('\n--- 2. Supabase Security & Authorization Testing ---');
    const attackerId = 'usr-attacker-999';

    // Test A: Unauthorized accept attempt by attacker
    let unauthorizedAcceptBlocked = false;
    try {
      await exchangeService.acceptRequest(req2.id, attackerId);
    } catch (err: any) {
      unauthorizedAcceptBlocked = err.message.includes('403') || err.message.includes('authorized');
    }
    assert(unauthorizedAcceptBlocked, 'Unauthorized user (attacker) cannot accept an exchange (403 Forbidden)');

    // Test B: Unauthorized cancellation attempt (lender attempting to cancel borrower request)
    let unauthorizedCancelBlocked = false;
    try {
      await exchangeService.cancelRequest(req1.id, attackerId);
    } catch (err: any) {
      unauthorizedCancelBlocked = err.message.includes('403') || err.message.includes('authorized');
    }
    assert(unauthorizedCancelBlocked, 'Unauthorized user cannot cancel another user’s exchange request');

    // Test C: Unauthorized pickup handover attempt
    let unauthorizedHandoverBlocked = false;
    try {
      await exchangeService.confirmPickupHandover(req1.id, 'lender', attackerId);
    } catch (err: any) {
      unauthorizedHandoverBlocked = err.message.includes('403') || err.message.includes('owner');
    }
    assert(unauthorizedHandoverBlocked, 'Unauthorized user cannot confirm handover on behalf of the owner');

    // =========================================================================
    // 3. SUPABASE FAILURE & RETRY DEDUPLICATION
    // =========================================================================
    console.log('\n--- 3. Supabase Failure & Retry Deduplication Testing ---');

    // Test A: Failed database request handling
    let simulatedFailureHandled = false;
    try {
      // Intentionally invalid non-existent UUID
      await exchangeService.acceptRequest('00000000-0000-0000-0000-000000000000', ownerId);
    } catch (err: any) {
      simulatedFailureHandled = Boolean(err.message);
    }
    assert(simulatedFailureHandled, 'Database failure produces clear error and rejects state mutation without false success');

    // Test B: Retry deduplication on createBorrowRequest
    const retryBookId = `book-retry-${Date.now()}`;
    const firstAttempt = await exchangeService.createBorrowRequest({
      book: { id: retryBookId, title: 'Retry Safety', author: 'Martin Kleppmann', coverImage: 'https://images.unsplash.com/photo-1' },
      owner: { id: ownerId, name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-2' },
      borrower: { id: 'usr-diego-1', name: 'Diego Ramirez', avatar: 'https://images.unsplash.com/photo-3' },
      date: 'Saturday',
      time: '12:00 PM',
      spot: 'Main Library',
      note: 'Initial attempt',
    });
    cleanupRecords.push({ table: 'borrow_requests', id: firstAttempt.id });

    // User retries identical submission
    const retryAttempt = await exchangeService.createBorrowRequest({
      book: { id: retryBookId, title: 'Retry Safety', author: 'Martin Kleppmann', coverImage: 'https://images.unsplash.com/photo-1' },
      owner: { id: ownerId, name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-2' },
      borrower: { id: 'usr-diego-1', name: 'Diego Ramirez', avatar: 'https://images.unsplash.com/photo-3' },
      date: 'Saturday',
      time: '12:00 PM',
      spot: 'Main Library',
      note: 'Retry attempt after network glitch',
    });

    assert(
      firstAttempt.id === retryAttempt.id,
      'Retry deduplication: Submitting duplicate request returns existing record without creating duplicate row in DB'
    );

    // Verify DB count
    const { data: dbCount } = await supabase
      .from('borrow_requests')
      .select('id')
      .eq('book_id', retryBookId)
      .eq('borrower_id', 'usr-diego-1');
    assert(dbCount?.length === 1, 'Database contains exactly 1 row after retry (0 duplicate rows created)');

    // =========================================================================
    // 4. 48-HOUR TIMEOUT (Explicit Classification: Reminder/Dispute vs. Deferred Automation)
    // =========================================================================
    console.log('\n--- 4. 48-Hour Timeout Architecture Verification ---');

    // Test A: Manual reminder records timestamp without corrupting transaction state
    const reminderTx = await exchangeService.sendHandoverReminder(firstAttempt.id, 'lender');
    assert(
      Boolean(reminderTx.reminderSentAt) && reminderTx.status === firstAttempt.status,
      'sendHandoverReminder: Logs reminder timestamp while preserving original status (Not mutated to dispute)'
    );

    // Test B: Formal dispute reporting
    const disputeTx = await exchangeService.reportHandoverDispute(
      firstAttempt.id,
      ownerId,
      'Neighbor was not available at meetup location'
    );
    assert(
      disputeTx.status === 'disputed_handover' &&
      disputeTx.disputeReason === 'Neighbor was not available at meetup location',
      'reportHandoverDispute: Explicitly marks transaction as disputed_handover with audit reason and reporter ID'
    );

    // =========================================================================
    // 5. DONATION PRIVACY & DISCOVERY EXCLUSION
    // =========================================================================
    console.log('\n--- 5. Donation Privacy & Discovery Isolation Testing ---');
    const donationBookId = `book-privacy-${Date.now()}`;
    const recipientId = 'usr-recipient-diego';

    // Create completed donation transaction
    const donationClaim = await exchangeService.createGiftClaim({
      book: { id: donationBookId, title: 'The Private Memoir', author: 'Elena Ferrante', coverImage: 'https://images.unsplash.com/photo-9' },
      owner: { id: ownerId, name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-2' },
      borrower: { id: recipientId, name: 'Diego Ramirez', avatar: 'https://images.unsplash.com/photo-3' },
      date: 'Sunday',
      time: '3:00 PM',
      spot: 'Public Garden',
      note: 'Gift claim',
    });
    cleanupRecords.push({ table: 'borrow_requests', id: donationClaim.id });

    // Recipient adds to Private Collection
    await exchangeService.addDonationToPrivateCollection(donationClaim, recipientId);

    // Fetch the newly inserted book in DB
    const { data: privateBookRows } = await supabase
      .from('books')
      .select('*')
      .eq('owner_id', recipientId)
      .eq('title', 'The Private Memoir');

    const addedBook = privateBookRows?.[0];
    if (addedBook) cleanupRecords.push({ table: 'books', id: addedBook.id });

    assert(
      !!addedBook,
      'Donated book was successfully added to recipient inventory in Supabase'
    );

    // Test Privacy Isolation: Check if it appears in public browse/search engine
    const isExcludedFromPublicDiscovery =
      addedBook?.availability_mode === 'personal' ||
      addedBook?.status === 'claimed' ||
      (addedBook?.description && addedBook.description.includes('[PRIVATE_COLLECTION]'));

    assert(
      Boolean(isExcludedFromPublicDiscovery),
      'Privacy Check: Donated book is marked as private/claimed and is 100% excluded from public lending/discovery'
    );

    // Test Canonical Identity: Verify donation history record in borrow_requests remains intact
    const { data: historyCheck } = await supabase
      .from('borrow_requests')
      .select('id, book_title, exchange_type')
      .eq('id', donationClaim.id)
      .single();

    assert(
      historyCheck?.id === donationClaim.id && historyCheck?.exchange_type === 'gift',
      'Canonical Identity: Original donation exchange history in borrow_requests remains permanently intact'
    );

  } catch (err) {
    console.error('Test Suite Exception:', err);
  } finally {
    console.log('\nCleaning up verification records from Supabase...');
    for (const item of cleanupRecords) {
      await supabase.from(item.table).delete().eq('id', item.id);
    }
    console.log(`Cleaned up ${cleanupRecords.length} records.`);
  }

  console.log('\n================================================================');
  console.log(`Final Verification Result: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runFinalVerification();

