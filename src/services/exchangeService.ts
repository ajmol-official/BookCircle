import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  ExchangeTransaction,
  ExchangeType,
  ExchangeStatus,
  ReturnScheduleDetails,
} from '../types';

// Metadata prefix for structured exchange metadata when stored in message
const META_TAG = '[BC_META]:';

const encodeMessageWithMeta = (userMessage: string = '', meta: Record<string, any>): string => {
  const cleanMsg = userMessage.replace(/\n?\[BC_META\]:.*$/s, '').trim();
  return `${cleanMsg}\n${META_TAG}${JSON.stringify(meta)}`;
};

const decodeMessageAndMeta = (rawMessage?: string): { message: string; meta: Record<string, any> } => {
  if (!rawMessage) return { message: '', meta: {} };
  const idx = rawMessage.indexOf(META_TAG);
  if (idx === -1) return { message: rawMessage, meta: {} };

  const message = rawMessage.substring(0, idx).trim();
  const jsonStr = rawMessage.substring(idx + META_TAG.length).trim();
  try {
    const meta = JSON.parse(jsonStr);
    return { message, meta };
  } catch {
    return { message: rawMessage, meta: {} };
  }
};

// Map database row to Frontend ExchangeTransaction
const mapRowToTransaction = (item: any): ExchangeTransaction => {
  const { message: cleanMessage, meta } = decodeMessageAndMeta(item.message);

  const substatus = meta.substatus || (item.status as ExchangeStatus);

  // Status backward compatibility mapping
  let resolvedStatus: ExchangeStatus = substatus;
  if (item.status === 'pending' && !meta.substatus) {
    resolvedStatus = item.exchange_type === 'gift' ? 'pending_claim' : 'pending_approval';
  } else if (item.status === 'handed_over' && !meta.substatus) {
    resolvedStatus = 'active_loan';
  } else if (item.status === 'returned' && !meta.substatus) {
    resolvedStatus = 'completed';
  } else if (item.status === 'claimed' && !meta.substatus) {
    resolvedStatus = 'claim_completed';
  }

  const pickupConfirmation = meta.pickupConfirmation || {
    lenderConfirmed: Boolean(item.lender_confirmed || meta.lenderConfirmed),
    lenderConfirmedAt: item.lender_confirmed_at || meta.lenderConfirmedAt,
    borrowerConfirmed: Boolean(item.borrower_confirmed || meta.borrowerConfirmed),
    borrowerConfirmedAt: item.borrower_confirmed_at || meta.borrowerConfirmedAt,
  };

  const returnSchedule: ReturnScheduleDetails | undefined = meta.returnSchedule || (item.return_tracking_code ? {
    trackingCode: item.return_tracking_code,
    date: item.return_date || '',
    time: item.return_time || '',
    spot: item.return_spot || '',
    note: item.return_note || meta.returnNote,
    borrowerConfirmed: Boolean(item.return_borrower_confirmed || meta.returnBorrowerConfirmed),
    borrowerConfirmedAt: item.return_borrower_confirmed_at || meta.returnBorrowerConfirmedAt,
    lenderConfirmed: Boolean(item.return_lender_confirmed || meta.returnLenderConfirmed),
    lenderConfirmedAt: item.return_lender_confirmed_at || meta.returnLenderConfirmedAt,
    conditionVerified: item.condition_at_return || meta.conditionVerified || 'Good',
    conditionNotes: item.condition_notes || meta.conditionNotes,
  } : undefined);

  return {
    id: item.id,
    bookId: item.book_id,
    catalogId: meta.catalogId || item.book_id,
    bookTitle: item.book_title || 'Book Title',
    bookAuthor: meta.bookAuthor || 'Author',
    bookCover:
      meta.bookCover ||
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
    exchangeType: (item.exchange_type || 'borrow') as ExchangeType,
    status: resolvedStatus,
    borrowerId: item.borrower_id || meta.borrowerId || '',
    borrowerName: item.borrower_name || 'Community Reader',
    borrowerAvatar:
      meta.borrowerAvatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    borrowerTrust: meta.borrowerTrust,
    borrowerDistance: meta.borrowerDistance,
    ownerId: item.owner_id || meta.ownerId || '',
    ownerName: item.owner_name || 'Book Owner',
    ownerAvatar:
      meta.ownerAvatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    ownerTrust: meta.ownerTrust,
    requestDate: meta.requestDate || (item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'),
    meetupDate: item.meetup_date || 'Upcoming',
    meetupTime: item.meetup_time || '10:00 AM',
    meetupSpot: item.meetup_spot || 'Riverside Coffee',
    message: cleanMessage,
    pickupConfirmation,
    handoverDate: item.handover_date || meta.handoverDate,
    dueDate: item.due_date || meta.dueDate,
    totalDays: item.total_days || meta.totalDays || 30,
    daysUsed: meta.daysUsed || 12,
    daysLeft: meta.daysLeft || 18,
    returnSchedule,
    // Dual Ratings
    lenderRating: item.lender_rating ? Number(item.lender_rating) : meta.lenderRating,
    lenderFeedback: item.lender_feedback || meta.lenderFeedback,
    lenderRatedAt: item.lender_rated_at || meta.lenderRatedAt,
    borrowerRating: item.borrower_rating ? Number(item.borrower_rating) : meta.borrowerRating,
    borrowerFeedback: item.borrower_feedback || meta.borrowerFeedback,
    borrowerRatedAt: item.borrower_rated_at || meta.borrowerRatedAt,
    rating: item.rating ? Number(item.rating) : (meta.rating || meta.lenderRating || meta.borrowerRating),
    feedback: item.feedback || meta.feedback || meta.lenderFeedback || meta.borrowerFeedback,
    conditionIssue: Boolean(item.condition_issue || meta.conditionIssue),
    conditionVerified: meta.conditionVerified || returnSchedule?.conditionVerified,
    conditionNotes: meta.conditionNotes || returnSchedule?.conditionNotes,
    disputeReason: item.dispute_reason || meta.disputeReason,
    disputedAt: item.disputed_at || meta.disputedAt,
    disputedBy: item.disputed_by || meta.disputedBy,
    reminderSentAt: item.reminder_sent_at || meta.reminderSentAt,
    lastReminderBy: meta.lastReminderBy,
    completedDate: item.completed_at ? new Date(item.completed_at).toLocaleDateString() : meta.completedDate,
  };
};

export const exchangeService = {
  /**
   * Fetch all authoritative exchange transactions from Supabase.
   * Throws if Supabase query fails.
   */
  async getExchanges(_userId: string = 'demo-user', _userDisplayName?: string): Promise<ExchangeTransaction[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase
      .from('borrow_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch exchanges from Supabase:', error);
      throw new Error(`Database error loading exchanges: ${error.message}`);
    }

    return (data || []).map(mapRowToTransaction);
  },

  /**
   * Compute Action Required Count for Badges:
   * Only items requiring immediate user action are counted.
   */
  getActionRequiredCount(
    userId: string = 'demo-user',
    userDisplayName?: string,
    exchanges: ExchangeTransaction[] = []
  ): { total: number; lending: number; borrowing: number } {
    const isOwner = (e: ExchangeTransaction) =>
      e.ownerId === userId ||
      (userDisplayName && e.ownerName.toLowerCase().trim() === userDisplayName.toLowerCase().trim()) ||
      e.ownerName === 'Maya Lin' ||
      e.ownerName === 'You';

    const isBorrower = (e: ExchangeTransaction) =>
      e.borrowerId === userId ||
      (userDisplayName && e.borrowerName.toLowerCase().trim() === userDisplayName.toLowerCase().trim()) ||
      e.borrowerName === 'Maya Lin' ||
      e.borrowerName === 'You';

    let lendingCount = 0;
    exchanges.forEach((e) => {
      if (isOwner(e)) {
        if (e.status === 'pending_approval' || e.status === 'pending_claim') {
          lendingCount += 1;
        } else if (e.status === 'return_in_progress' && !e.returnSchedule?.lenderConfirmed) {
          lendingCount += 1;
        } else if (
          (e.status === 'handover_in_progress' || e.status === 'accepted') &&
          e.pickupConfirmation.borrowerConfirmed &&
          !e.pickupConfirmation.lenderConfirmed
        ) {
          lendingCount += 1;
        }
      }
    });

    let borrowingCount = 0;
    exchanges.forEach((e) => {
      if (isBorrower(e)) {
        if (
          (e.status === 'handover_in_progress' || e.status === 'accepted') &&
          e.pickupConfirmation.lenderConfirmed &&
          !e.pickupConfirmation.borrowerConfirmed
        ) {
          borrowingCount += 1;
        } else if (e.status === 'return_scheduled' && !e.returnSchedule?.borrowerConfirmed) {
          borrowingCount += 1;
        }
      }
    });

    return {
      total: lendingCount + borrowingCount,
      lending: lendingCount,
      borrowing: borrowingCount,
    };
  },

  /**
   * Submit a new borrowing request directly to Supabase.
   * Concurrency Protection: checks for existing active loans before creating.
   */
  async createBorrowRequest(params: {
    book: { id: string; title: string; author: string; coverImage: string };
    owner: { id: string; name: string; avatar: string; trust?: string };
    borrower: { id: string; name: string; avatar: string; trust?: string };
    date: string;
    time: string;
    spot: string;
    note: string;
  }): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase client not configured.');
    }

    // 1. Concurrency Check: Verify book is not already loaned out
    const { data: existingActive, error: checkErr } = await supabase
      .from('borrow_requests')
      .select('id, status')
      .eq('book_id', params.book.id)
      .in('status', ['accepted', 'handed_over', 'active_loan']);

    if (!checkErr && existingActive && existingActive.length > 0) {
      throw new Error(`“${params.book.title}” already has an active loan in progress.`);
    }

    // Deduplication check: if a pending request from this borrower already exists for this book, return it safely (prevents duplicate submission on retry)
    if (params.borrower.id) {
      const { data: existingPending } = await supabase
        .from('borrow_requests')
        .select('*')
        .eq('book_id', params.book.id)
        .eq('borrower_id', params.borrower.id)
        .in('status', ['pending', 'pending_approval', 'pending_claim'])
        .limit(1);

      if (existingPending && existingPending.length > 0) {
        return mapRowToTransaction(existingPending[0]);
      }
    }

    // 2. Prepare structured metadata
    const meta = {
      substatus: 'pending_approval',
      bookAuthor: params.book.author,
      bookCover: params.book.coverImage,
      borrowerAvatar: params.borrower.avatar,
      borrowerTrust: params.borrower.trust || 'Community Reader',
      ownerAvatar: params.owner.avatar,
      ownerTrust: params.owner.trust || 'Verified Lender',
      requestDate: 'Just now',
      pickupConfirmation: { lenderConfirmed: false, borrowerConfirmed: false },
    };

    const messageWithMeta = encodeMessageWithMeta(params.note, meta);

    const { data, error } = await supabase
      .from('borrow_requests')
      .insert({
        book_id: params.book.id,
        book_title: params.book.title,
        borrower_id: params.borrower.id || null,
        borrower_name: params.borrower.name,
        owner_id: params.owner.id || null,
        owner_name: params.owner.name,
        exchange_type: 'borrow',
        status: 'pending',
        meetup_date: params.date,
        meetup_time: params.time,
        meetup_spot: params.spot,
        message: messageWithMeta,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create borrow request in Supabase: ${error?.message || 'Unknown database error'}`);
    }

    return mapRowToTransaction(data);
  },

  /**
   * Submit a free gift claim directly to Supabase.
   */
  async createGiftClaim(params: {
    book: { id: string; title: string; author: string; coverImage: string };
    owner: { id: string; name: string; avatar: string; trust?: string };
    borrower: { id: string; name: string; avatar: string; trust?: string };
    date: string;
    time: string;
    spot: string;
    note: string;
  }): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase client not configured.');
    }

    // Deduplication check: if a pending gift claim from this recipient already exists for this book, return it safely (prevents duplicate submission on retry)
    if (params.borrower.id) {
      const { data: existingPending } = await supabase
        .from('borrow_requests')
        .select('*')
        .eq('book_id', params.book.id)
        .eq('borrower_id', params.borrower.id)
        .in('status', ['pending', 'pending_approval', 'pending_claim'])
        .limit(1);

      if (existingPending && existingPending.length > 0) {
        return mapRowToTransaction(existingPending[0]);
      }
    }

    const meta = {
      substatus: 'pending_claim',
      bookAuthor: params.book.author,
      bookCover: params.book.coverImage,
      borrowerAvatar: params.borrower.avatar,
      borrowerTrust: params.borrower.trust || 'Community Reader',
      ownerAvatar: params.owner.avatar,
      ownerTrust: params.owner.trust || 'Community Giver',
      requestDate: 'Just now',
      pickupConfirmation: { lenderConfirmed: false, borrowerConfirmed: false },
    };

    const messageWithMeta = encodeMessageWithMeta(params.note, meta);

    const { data, error } = await supabase
      .from('borrow_requests')
      .insert({
        book_id: params.book.id,
        book_title: params.book.title,
        borrower_id: params.borrower.id || null,
        borrower_name: params.borrower.name,
        owner_id: params.owner.id || null,
        owner_name: params.owner.name,
        exchange_type: 'gift',
        status: 'pending',
        meetup_date: params.date,
        meetup_time: params.time,
        meetup_spot: params.spot,
        message: messageWithMeta,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create gift claim in Supabase: ${error?.message || 'Database error'}`);
    }

    return mapRowToTransaction(data);
  },

  /**
   * Owner accepts an incoming request in Supabase.
   * Atomically declines competing requests for this book.
   */
  async acceptRequest(exchangeId: string, executingUserId?: string): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase client not configured.');
    }

    // 1. Fetch current transaction row
    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) {
      throw new Error(`Could not find request #${exchangeId}: ${fetchErr?.message}`);
    }

    let callerId = executingUserId;
    if (!callerId) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) callerId = authData.user.id;
      } catch {
        // ignore
      }
    }

    // Authorization Guard: Only the book owner is authorized to accept this request
    if (callerId && current.owner_id && current.owner_id !== callerId) {
      throw new Error('403 Forbidden: Only the book owner is authorized to accept this request.');
    }

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const nextSubstatus = current.exchange_type === 'gift' ? 'claim_accepted' : 'accepted';
    const updatedMeta = { ...meta, substatus: nextSubstatus };

    // 2. Concurrency protection: Verify no other active exchange on this book
    const { data: activeOthers } = await supabase
      .from('borrow_requests')
      .select('id, status')
      .eq('book_id', current.book_id)
      .neq('id', exchangeId)
      .in('status', [
        'accepted',
        'handed_over',
        'active_loan',
        'handover_in_progress',
        'return_scheduled',
        'return_in_progress',
        'claim_accepted',
        'claim_handover',
      ]);

    if (activeOthers && activeOthers.length > 0) {
      throw new Error('This book already has an active loan or accepted exchange in progress.');
    }

    // 3. Update target request atomically (guarded on status being pending)
    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        status: 'accepted',
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .in('status', ['pending', 'pending_approval', 'pending_claim'])
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to accept request in Supabase: ${updateErr?.message || 'Request is no longer pending or was already accepted'}`);
    }

    // 4. Concurrency Arbitration Guard:
    // If two competing requests race simultaneously, deterministically elect the unique winner
    const { data: activeList } = await supabase
      .from('borrow_requests')
      .select('id, created_at')
      .eq('book_id', current.book_id)
      .in('status', ['accepted', 'handed_over', 'active_loan'])
      .order('created_at', { ascending: true });

    if (activeList && activeList.length > 1) {
      const winnerId = activeList[0].id;
      if (winnerId !== exchangeId) {
        // This request lost the concurrent race! Roll back target to cancelled and throw conflict error
        await supabase
          .from('borrow_requests')
          .update({
            status: 'cancelled',
            message: encodeMessageWithMeta(cleanMsg, {
              ...meta,
              substatus: 'cancelled',
              cancelReason: 'Concurrent conflict: another competing request was accepted first.',
            }),
          })
          .eq('id', exchangeId);

        throw new Error('Concurrency Conflict: Another request for this book was accepted simultaneously.');
      }
    }

    // 5. Concurrency Guard: Atomically decline any competing requests for this book
    try {
      await supabase
        .from('borrow_requests')
        .update({
          status: 'cancelled',
        })
        .eq('book_id', current.book_id)
        .neq('id', exchangeId)
        .in('status', ['pending', 'pending_approval', 'pending_claim']);
    } catch (e) {
      console.warn('Could not auto-decline competing requests:', e);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Owner declines a request in Supabase.
   */
  async declineRequest(exchangeId: string, reason?: string, executingUserId?: string): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase client not configured.');
    }

    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) throw new Error('Request not found.');

    let callerId = executingUserId;
    if (!callerId) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) callerId = authData.user.id;
      } catch {
        // ignore
      }
    }

    // Authorization Guard: Only the book owner is authorized to decline this request
    if (callerId && current.owner_id && current.owner_id !== callerId) {
      throw new Error('403 Forbidden: Only the book owner is authorized to decline this request.');
    }

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const nextSubstatus = current.exchange_type === 'gift' ? 'claim_declined' : 'declined';
    const updatedMeta = { ...meta, substatus: nextSubstatus, declineReason: reason };

    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        status: 'cancelled',
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to decline request in Supabase: ${updateErr?.message}`);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Borrower cancels a request prior to handover.
   */
  async cancelRequest(exchangeId: string, executingUserId?: string): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) throw new Error('Supabase client not configured.');

    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) throw new Error('Request not found.');

    let callerId = executingUserId;
    if (!callerId) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) callerId = authData.user.id;
      } catch {
        // ignore
      }
    }

    // Authorization Guard: Only the borrower who made the request can cancel it
    if (callerId && current.borrower_id && current.borrower_id !== callerId) {
      throw new Error('403 Forbidden: Only the requester is authorized to cancel this request.');
    }

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const nextSubstatus = current.exchange_type === 'gift' ? 'claim_cancelled' : 'cancelled';
    const updatedMeta = { ...meta, substatus: nextSubstatus };

    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        status: 'cancelled',
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to cancel request in Supabase: ${updateErr?.message}`);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Dual Handover Pickup Confirmation:
   * When both confirmations are recorded, transitions status in Supabase.
   */
  async confirmPickupHandover(
    exchangeId: string,
    role: 'lender' | 'borrower',
    executingUserId?: string
  ): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) throw new Error('Supabase client not configured.');

    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) throw new Error('Request not found.');

    let callerId = executingUserId;
    if (!callerId) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) callerId = authData.user.id;
      } catch {
        // ignore
      }
    }

    // Authorization Guard: Ensure the user confirming matches their role in this transaction
    if (role === 'lender' && callerId && current.owner_id && current.owner_id !== callerId) {
      throw new Error('403 Forbidden: Only the book owner can confirm lender handover.');
    }
    if (role === 'borrower' && callerId && current.borrower_id && current.borrower_id !== callerId) {
      throw new Error('403 Forbidden: Only the borrower can confirm borrower pickup.');
    }

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const pickup = meta.pickupConfirmation || { lenderConfirmed: false, borrowerConfirmed: false };
    const nowIso = new Date().toISOString();

    if (role === 'lender') {
      pickup.lenderConfirmed = true;
      pickup.lenderConfirmedAt = nowIso;
    } else {
      pickup.borrowerConfirmed = true;
      pickup.borrowerConfirmedAt = nowIso;
    }

    const bothConfirmed = pickup.lenderConfirmed && pickup.borrowerConfirmed;

    let nextDbStatus = current.status;
    let nextSubstatus = meta.substatus;
    let handoverDate = meta.handoverDate;
    let dueDate = meta.dueDate;

    if (current.exchange_type === 'gift') {
      if (bothConfirmed) {
        nextDbStatus = 'claimed';
        nextSubstatus = 'claim_completed';
      } else {
        nextDbStatus = 'accepted';
        nextSubstatus = 'claim_handover';
      }
    } else {
      if (bothConfirmed) {
        nextDbStatus = 'handed_over';
        nextSubstatus = 'active_loan';
        handoverDate = 'Today';
        dueDate = 'Due in 30 days';
      } else {
        nextDbStatus = 'accepted';
        nextSubstatus = 'handover_in_progress';
      }
    }

    const updatedMeta = {
      ...meta,
      substatus: nextSubstatus,
      pickupConfirmation: pickup,
      handoverDate,
      dueDate,
      completedDate: nextSubstatus === 'claim_completed' ? 'Today' : meta.completedDate,
    };

    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        status: nextDbStatus,
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to confirm handover in Supabase: ${updateErr?.message}`);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Borrower schedules return handover via ReturnWizard.
   */
  async initiateReturn(
    exchangeId: string,
    returnDetails: { date: string; time: string; spot: string; note: string; trackingCode: string }
  ): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) throw new Error('Supabase client not configured.');

    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) throw new Error('Request not found.');

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const returnSchedule: ReturnScheduleDetails = {
      trackingCode: returnDetails.trackingCode,
      date: returnDetails.date,
      time: returnDetails.time,
      spot: returnDetails.spot,
      note: returnDetails.note,
      borrowerConfirmed: false,
      lenderConfirmed: false,
    };

    const updatedMeta = {
      ...meta,
      substatus: 'return_scheduled',
      returnSchedule,
    };

    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to schedule return in Supabase: ${updateErr?.message}`);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Borrower confirms handing book back during meetup.
   */
  async confirmReturnHandedBack(exchangeId: string): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) throw new Error('Supabase client not configured.');

    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) throw new Error('Request not found.');

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const returnSchedule = meta.returnSchedule || {
      trackingCode: 'RET-8192-BC',
      date: 'Today',
      time: '4:30 PM',
      spot: 'Riverside Coffee',
    };

    const updatedSchedule = {
      ...returnSchedule,
      borrowerConfirmed: true,
      borrowerConfirmedAt: new Date().toISOString(),
    };

    const updatedMeta = {
      ...meta,
      substatus: 'return_in_progress',
      returnSchedule: updatedSchedule,
    };

    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to confirm return in Supabase: ${updateErr?.message}`);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Owner confirms receipt of returned book & logs condition assessment.
   * Condition damage is recorded in the audit trail without blocking return completion.
   */
  async confirmReturnReceipt(
    exchangeId: string,
    conditionVerified: 'Like New' | 'Good' | 'Minor Wear' | 'Damaged',
    conditionNotes?: string,
    executingUserId?: string
  ): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) throw new Error('Supabase client not configured.');

    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) throw new Error('Request not found.');

    // Authorization Guard: Only the book owner is authorized to inspect condition and confirm return receipt
    if (executingUserId && current.owner_id && current.owner_id !== executingUserId) {
      throw new Error('403 Forbidden: Only the book owner is authorized to confirm return receipt.');
    }

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const hasDamage = conditionVerified === 'Damaged' || conditionVerified === 'Minor Wear';

    const schedule = meta.returnSchedule || {
      trackingCode: 'RET-8192-BC',
      date: 'Today',
      time: '4:30 PM',
      spot: 'Riverside Coffee',
      borrowerConfirmed: true,
    };

    const updatedSchedule = {
      ...schedule,
      lenderConfirmed: true,
      lenderConfirmedAt: new Date().toISOString(),
      conditionVerified,
      conditionNotes,
    };

    const updatedMeta = {
      ...meta,
      substatus: 'completed',
      completedDate: 'Today',
      conditionIssue: hasDamage,
      returnSchedule: updatedSchedule,
    };

    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        status: 'returned',
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to complete return in Supabase: ${updateErr?.message}`);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Send a reminder for a pending handover confirmation.
   * Records timestamp and sender role without altering transaction state to disputed.
   */
  async sendHandoverReminder(
    exchangeId: string,
    senderRole: 'lender' | 'borrower'
  ): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) throw new Error('Supabase client not configured.');

    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) throw new Error('Request not found.');

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const nowIso = new Date().toISOString();

    const updatedMeta = {
      ...meta,
      reminderSentAt: nowIso,
      lastReminderBy: senderRole,
    };

    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to send reminder in Supabase: ${updateErr?.message}`);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Formal dispute report / issue at meetup.
   */
  async reportHandoverDispute(
    exchangeId: string,
    reportingUserId: string,
    disputeReason: string
  ): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) throw new Error('Supabase client not configured.');

    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) throw new Error('Request not found.');

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const updatedMeta = {
      ...meta,
      substatus: 'disputed_handover',
      disputeReason,
      disputedAt: new Date().toISOString(),
      disputedBy: reportingUserId,
    };

    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to report dispute in Supabase: ${updateErr?.message}`);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Submit Independent Dual Rating:
   * Lender and borrower can rate each other independently.
   * Prevents duplicate ratings for the same participant.
   */
  async submitRating(
    exchangeId: string,
    role: 'lender' | 'borrower',
    rating: number,
    feedback: string,
    executingUserId?: string
  ): Promise<ExchangeTransaction> {
    if (!isSupabaseConfigured()) throw new Error('Supabase client not configured.');

    const { data: current, error: fetchErr } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('id', exchangeId)
      .single();

    if (fetchErr || !current) throw new Error('Request not found.');

    // Authorization Guard: verify participant identity
    if (role === 'lender' && executingUserId && current.owner_id && current.owner_id !== executingUserId) {
      throw new Error('403 Forbidden: Only the lender can submit a lender review.');
    }
    if (role === 'borrower' && executingUserId && current.borrower_id && current.borrower_id !== executingUserId) {
      throw new Error('403 Forbidden: Only the borrower can submit a borrower review.');
    }

    const { message: cleanMsg, meta } = decodeMessageAndMeta(current.message);
    const nowIso = new Date().toISOString();

    // Prevent duplicate rating from same participant
    if (role === 'lender' && meta.lenderRating) {
      throw new Error('You have already submitted a rating for this exchange.');
    }
    if (role === 'borrower' && meta.borrowerRating) {
      throw new Error('You have already submitted a rating for this exchange.');
    }

    const updatedMeta = {
      ...meta,
      ...(role === 'lender'
        ? { lenderRating: rating, lenderFeedback: feedback, lenderRatedAt: nowIso }
        : { borrowerRating: rating, borrowerFeedback: feedback, borrowerRatedAt: nowIso }),
      rating, // primary display rating
      feedback,
    };

    const { data: updated, error: updateErr } = await supabase
      .from('borrow_requests')
      .update({
        message: encodeMessageWithMeta(cleanMsg, updatedMeta),
      })
      .eq('id', exchangeId)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Failed to submit rating in Supabase: ${updateErr?.message}`);
    }

    return mapRowToTransaction(updated);
  },

  /**
   * Donation Recipient Action: "Add to My Private Collection"
   * Adds the donated book to recipient's private inventory without making it publicly discoverable.
   */
  async addDonationToPrivateCollection(
    exchange: ExchangeTransaction,
    recipientId: string
  ): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase client not configured.');

    // 1. Try primary insertion with availability_mode: 'personal'
    const { error: insertErr } = await supabase.from('books').insert({
      title: exchange.bookTitle,
      author: exchange.bookAuthor,
      cover_image: exchange.bookCover,
      category: 'Fiction',
      condition: 'Very Good',
      availability_mode: 'personal', // Stored strictly as Private Collection
      status: 'available',
      description: `🎁 Community gift received from ${exchange.ownerName}. Added to private collection.`,
      owner_name: exchange.borrowerName,
      owner_avatar: exchange.borrowerAvatar,
      owner_id: recipientId,
    });

    if (insertErr) {
      // Backward-compatible fallback if remote DB check constraint has not been migrated yet:
      // status 'claimed' safely removes it from public lending discovery
      const { error: fallbackErr } = await supabase.from('books').insert({
        title: exchange.bookTitle,
        author: exchange.bookAuthor,
        cover_image: exchange.bookCover,
        category: 'Fiction',
        condition: 'Very Good',
        availability_mode: 'lending',
        status: 'claimed',
        description: `[PRIVATE_COLLECTION] 🎁 Community gift received from ${exchange.ownerName}. Added to private collection.`,
        owner_name: exchange.borrowerName,
        owner_avatar: exchange.borrowerAvatar,
        owner_id: recipientId,
      });

      if (fallbackErr) {
        throw new Error(`Failed to add donated book to private collection: ${fallbackErr.message}`);
      }
    }
  },

  /**
   * Cancel pending requests on a book when owner changes status or deletes it.
   */
  async cancelPendingRequestsForBook(bookId: string, reason?: string): Promise<number> {
    if (!isSupabaseConfigured()) return 0;

    const { data, error } = await supabase
      .from('borrow_requests')
      .update({
        status: 'cancelled',
        message: reason
          ? `(Cancelled by book owner: ${reason})`
          : '(Cancelled by book owner)',
      })
      .eq('book_id', bookId)
      .in('status', ['pending', 'pending_approval', 'pending_claim'])
      .select();

    if (error) {
      console.warn('Could not cancel pending requests in Supabase:', error);
      return 0;
    }

    return data?.length || 0;
  },

  /**
   * Inventory Locking Helper:
   * Inspects live exchange state to prevent modifying or removing books in active loans.
   */
  isBookInActiveExchange(
    bookId: string,
    exchanges: ExchangeTransaction[]
  ): {
    isLocked: boolean;
    hasPendingRequests: boolean;
    pendingCount: number;
    reason?: string;
    borrower?: string;
    status?: ExchangeStatus;
  } {
    const active = exchanges.find(
      (e) =>
        e.bookId === bookId &&
        [
          'accepted',
          'handover_in_progress',
          'active_loan',
          'return_scheduled',
          'return_in_progress',
          'claim_accepted',
          'claim_handover',
        ].includes(e.status)
    );

    if (active) {
      return {
        isLocked: true,
        hasPendingRequests: false,
        pendingCount: 0,
        reason:
          active.status === 'active_loan'
            ? `Currently on active 30-day loan with ${active.borrowerName} (${active.dueDate || 'Active'})`
            : active.status === 'return_in_progress' || active.status === 'return_scheduled'
            ? `Return meetup in progress with ${active.borrowerName}`
            : `Accepted meetup scheduled with ${active.borrowerName}`,
        borrower: active.borrowerName,
        status: active.status,
      };
    }

    const pendings = exchanges.filter(
      (e) =>
        e.bookId === bookId &&
        (e.status === 'pending_approval' || e.status === 'pending_claim')
    );

    return {
      isLocked: false,
      hasPendingRequests: pendings.length > 0,
      pendingCount: pendings.length,
      borrower: pendings[0]?.borrowerName,
      status: pendings[0]?.status,
    };
  },
};
