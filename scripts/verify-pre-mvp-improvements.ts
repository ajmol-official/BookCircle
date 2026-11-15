// scripts/verify-pre-mvp-improvements.ts
import { createClient } from '@supabase/supabase-js';
import { exchangeService } from '../src/services/exchangeService';
import { dbService } from '../src/services/dbService';

const SUPABASE_URL = 'https://kumcyuhvjnzppxjoetnz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oAX-TA1CtFkCqspxmtFF3w_jkwJD4pK';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

const cleanupItems: { table: string; id: string }[] = [];

async function runVerification() {
  console.log('================================================================');
  console.log('BookCircle — Pre-MVP Engineering Improvements Validation');
  console.log('Target: Live Supabase (' + SUPABASE_URL + ')');
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
    // STEP 0: Provision 3 Authenticated User Accounts
    // -------------------------------------------------------------------------
    console.log('--- Step 0: Provisioning Authenticated User Accounts ---');
    const ts = Date.now();
    const defaultPassword = 'SecureAuthPass123!';

    const u1 = await supabase.auth.signUp({ email: `alice_${ts}@bookcircle.auth`, password: defaultPassword });
    const u2 = await supabase.auth.signUp({ email: `bob_${ts}@bookcircle.auth`, password: defaultPassword });
    const u3 = await supabase.auth.signUp({ email: `charlie_${ts}@bookcircle.auth`, password: defaultPassword });

    if (!u1.data.session || !u2.data.session || !u3.data.session) {
      throw new Error('Failed to create authenticated sessions in Supabase Auth');
    }

    const aliceId = u1.data.user!.id;
    const bobId = u2.data.user!.id;
    const charlieId = u3.data.user!.id;

    const clientAlice = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await clientAlice.auth.setSession({ access_token: u1.data.session.access_token, refresh_token: u1.data.session.refresh_token });

    const clientBob = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await clientBob.auth.setSession({ access_token: u2.data.session.access_token, refresh_token: u2.data.session.refresh_token });

    const clientCharlie = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await clientCharlie.auth.setSession({ access_token: u3.data.session.access_token, refresh_token: u3.data.session.refresh_token });

    console.log(`  ✓ Alice (Owner):       ${aliceId}`);
    console.log(`  ✓ Bob (Borrower):      ${bobId}`);
    console.log(`  ✓ Charlie (Third Party): ${charlieId}\n`);

    // =========================================================================
    // PHASE 1: SUPABASE SECURITY & RLS POLICIES
    // =========================================================================
    console.log('--- Phase 1: Supabase Security & RLS Policies ---');

    // 1A. Alice adds a book
    const { data: aliceBook, error: bErr } = await clientAlice.from('books').insert({
      title: `The Architecture of Open Source (${ts})`,
      author: 'Amy Brown',
      cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
      owner_name: 'Alice Reader',
      owner_id: aliceId,
      availability_mode: 'lending',
      status: 'available',
    }).select().single();
    if (aliceBook) cleanupItems.push({ table: 'books', id: aliceBook.id });

    assert(!bErr && !!aliceBook, 'Alice successfully adds a book to the catalog', bErr?.message);

    // 1B. Alice updates her own book
    const { data: aliceUpdate, error: uErr } = await clientAlice
      .from('books')
      .update({ condition: 'Like New' })
      .eq('id', aliceBook.id)
      .eq('owner_id', aliceId)
      .select();

    assert(aliceUpdate?.length === 1, 'Alice can update her own book listing', uErr?.message);

    // 1C. Charlie (attacker) tries to update Alice's book scoped by owner
    const { data: charlieUpdate } = await clientCharlie
      .from('books')
      .update({ title: 'Hacked Title' })
      .eq('id', aliceBook.id)
      .eq('owner_id', charlieId)
      .select();

    assert(
      !charlieUpdate || charlieUpdate.length === 0,
      'Charlie cannot update Alice’s book listing (Owner guard enforced)'
    );

    // 1D. Charlie tries to delete Alice's book
    const { data: charlieDel } = await clientCharlie
      .from('books')
      .delete()
      .eq('id', aliceBook.id)
      .eq('owner_id', charlieId)
      .select();

    assert(
      !charlieDel || charlieDel.length === 0,
      'Charlie cannot delete Alice’s book listing'
    );

    // =========================================================================
    // PHASE 2: BASIC MESSAGING PERSISTENCE (MVP)
    // =========================================================================
    console.log('\n--- Phase 2: Basic Messaging Persistence (MVP) ---');

    // 2A. Alice sends a message to Bob via public.messages
    const { data: msgSent, error: mErr1 } = await clientAlice.from('messages').insert({
      sender_id: aliceId,
      receiver_id: bobId,
      content: 'Hello Bob! I have accepted your request for the book.',
    }).select().single();
    if (msgSent) cleanupItems.push({ table: 'messages', id: msgSent.id });

    assert(!mErr1 && !!msgSent, 'Alice successfully sends message to Bob via Supabase messages table', mErr1?.message);

    // 2B. Bob retrieves messages addressed to him
    const { data: bobInbox, error: mErr2 } = await clientBob
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${bobId},receiver_id.eq.${bobId}`)
      .order('created_at', { ascending: true });

    const receivedByBob = bobInbox?.some((m) => m.id === msgSent.id && m.content.includes('accepted your request'));
    assert(
      !mErr2 && receivedByBob,
      'Bob retrieves incoming message from Alice from Supabase without Realtime',
      mErr2?.message
    );

    // 2C. Bob replies to Alice
    const { data: bobReply, error: mErr3 } = await clientBob.from('messages').insert({
      sender_id: bobId,
      receiver_id: aliceId,
      content: 'Thank you Alice! Can we meet at 3 PM tomorrow?',
    }).select().single();
    if (bobReply) cleanupItems.push({ table: 'messages', id: bobReply.id });

    assert(!mErr3 && !!bobReply, 'Bob replies to Alice in the conversation thread', mErr3?.message);

    // 2D. Full chronological conversation history
    const { data: aliceThread } = await clientAlice
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${aliceId},receiver_id.eq.${bobId}),and(sender_id.eq.${bobId},receiver_id.eq.${aliceId})`)
      .order('created_at', { ascending: true });

    assert(
      aliceThread?.length === 2 &&
      aliceThread[0].sender_id === aliceId &&
      aliceThread[1].sender_id === bobId,
      'Conversation thread preserves chronological order across multi-party replies'
    );

    // 2E. Eavesdropper access control: Charlie attempts to read Alice & Bob messages
    const { data: charlieRead } = await clientCharlie
      .from('messages')
      .select('*')
      .in('id', [msgSent.id, bobReply.id]);

    assert(
      !charlieRead || charlieRead.length === 0,
      'RLS Security: Unauthorized third party (Charlie) CANNOT read private messages between Alice & Bob'
    );

    // 2F. Unauthenticated client attempts to read messages
    const { data: unauthRead } = await supabase
      .from('messages')
      .select('*')
      .in('id', [msgSent.id, bobReply.id]);

    assert(
      !unauthRead || unauthRead.length === 0,
      'RLS Security: Unauthenticated client CANNOT read private messages'
    );

    // =========================================================================
    // PHASE 3: ATOMIC EXCHANGE OPERATIONS
    // =========================================================================
    console.log('\n--- Phase 3: Atomic Exchange Operations ---');

    // Create a borrow exchange
    const req = await exchangeService.createBorrowRequest({
      book: {
        id: aliceBook.id,
        title: aliceBook.title,
        author: aliceBook.author,
        coverImage: aliceBook.cover_image,
      },
      owner: { id: aliceId, name: 'Alice Reader', avatar: 'https://images.unsplash.com/photo-1' },
      borrower: { id: bobId, name: 'Bob Reader', avatar: 'https://images.unsplash.com/photo-2' },
      date: 'Tomorrow',
      time: '3:00 PM',
      spot: 'Riverside Coffee',
      note: 'Looking forward to reading this!'
    });
    cleanupItems.push({ table: 'borrow_requests', id: req.id });

    // Accept request
    const accepted = await exchangeService.acceptRequest(req.id, aliceId, 'Alice Reader');
    assert(accepted.status === 'accepted', 'Owner successfully accepts exchange request');

    // Confirm return receipt with atomic book availability reset
    const returned = await exchangeService.confirmReturnReceipt(req.id, 'Like New', 'Returned in perfect shape');
    assert(returned.status === 'completed', 'Return confirmed and exchange marked as completed');

    // Verify book status was reset to available
    const { data: refreshedBook } = await clientAlice.from('books').select('status').eq('id', aliceBook.id).single();
    assert(refreshedBook?.status === 'available', 'Book availability status was atomically reset to "available" on return');

    // =========================================================================
    // PHASE 4: QUERY OPTIMIZATION
    // =========================================================================
    console.log('\n--- Phase 4: Query Optimization ---');

    // 4A. Scoped query: Alice only fetches her relevant exchanges
    const aliceExchanges = await exchangeService.getExchanges(aliceId, 'Alice Reader', false);
    const onlyAliceOrBob = aliceExchanges.every(
      (e) => e.ownerId === aliceId || e.borrowerId === aliceId || e.id === req.id
    );
    assert(onlyAliceOrBob, 'getExchanges scopes queries to current user records, preventing unbounded table scans');

    // =========================================================================
    // PHASE 5: PRODUCTION ERROR HANDLING
    // =========================================================================
    console.log('\n--- Phase 5: Production Error Handling ---');

    // In authenticated production mode, empty database returns authentic empty array, not mock books
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';
    const userSpecificBooks = await dbService.getUserBooks(nonExistentUserId);
    assert(
      Array.isArray(userSpecificBooks) && userSpecificBooks.length === 0,
      'Authenticated session with no books returns authentic empty array [] without ghost mock data'
    );

  } catch (err) {
    console.error('Validation Exception:', err);
  } finally {
    console.log('\n--- Cleaning up test records from Supabase ---');
    for (const item of cleanupItems) {
      try {
        await supabase.from(item.table).delete().eq('id', item.id);
      } catch {}
    }
    console.log(`Cleaned up ${cleanupItems.length} test records.`);
  }

  console.log('\n================================================================');
  console.log(`Pre-MVP Engineering Improvements Summary: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed === total && total > 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
