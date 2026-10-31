import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  Location01Icon,
  CheckmarkCircle02Icon,
  BubbleChatIcon,
  BookOpen01Icon,
  StarIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  Notification01Icon,
} from '@hugeicons/core-free-icons';
import { useExchanges } from '../../context/ExchangeContext';
import { useAuth } from '../../context/AuthContext';
import { ReturnWizardModal, type BorrowedBookItem, type ReturnHandoverDetails } from '../borrow/ReturnWizardModal';
import type { ExchangeTransaction } from '../../types';

interface ActivityPageProps {
  initialTab?: 'lending' | 'borrowing' | 'history';
  onNavigateToMessages?: (participantName: string, bookTitle: string) => void;
  onOpenAddBook?: () => void;
}

interface SafeAvatarProps {
  src?: string;
  name: string;
  sizeClass?: string;
  className?: string;
}

const SafeAvatar: React.FC<SafeAvatarProps> = ({
  src,
  name,
  sizeClass = 'w-12 h-12',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => {
    if (!name) return 'R';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-brand/10 border-2 border-brand/20 text-brand font-bold text-xs sm:text-sm flex items-center justify-center flex-shrink-0 select-none shadow-xs ${className}`}
        aria-label={name}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className={`${sizeClass} rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0 ${className}`}
      loading="lazy"
    />
  );
};

interface SafeBookThumbnailProps {
  src?: string;
  title: string;
  sizeClass?: string;
  className?: string;
}

const SafeBookThumbnail: React.FC<SafeBookThumbnailProps> = ({
  src,
  title,
  sizeClass = 'w-12 h-16',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} rounded-xl bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center p-1.5 text-center flex-shrink-0 select-none ${className}`}
        title={title}
      >
        <HugeiconsIcon icon={BookOpen01Icon} size={18} className="text-brand/70 mb-0.5" />
        <span className="text-[10px] font-bold text-slate-700 line-clamp-1 leading-tight px-0.5">
          {title ? title.slice(0, 10) : 'Book'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      onError={() => setHasError(true)}
      className={`${sizeClass} object-cover rounded-xl shadow-xs flex-shrink-0 border border-slate-200/80 ${className}`}
      loading="lazy"
    />
  );
};

export const ActivityPage: React.FC<ActivityPageProps> = ({
  initialTab = 'lending',
  onNavigateToMessages,
  onOpenAddBook,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Clean isolation: only use demo fallbacks when in demo mode or without real user
  const isDemoSession = !currentUser || currentUser.authProvider === 'demo' || currentUser.email === 'maya.reader@bookcircle.org';
  const currentUserId = currentUser?.id || 'demo-user';
  const currentUserDisplayName = currentUser?.displayName || (isDemoSession ? 'Maya Lin' : 'Reader');

  const {
    exchanges,
    error,
    clearError,
    refreshExchanges,
    actionRequiredTotal,
    actionRequiredLending,
    actionRequiredBorrowing,
    acceptRequest,
    declineRequest,
    cancelRequest,
    confirmPickupHandover,
    sendHandoverReminder,
    reportHandoverDispute,
    initiateReturn,
    confirmReturnHandedBack,
    confirmReturnReceipt,
    submitRating,
    addDonationToPrivateCollection,
    seedSampleActivities,
    clearSampleActivities,
  } = useExchanges();

  const [activeTab, setActiveTab] = useState<'lending' | 'borrowing' | 'history'>(initialTab);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'lent' | 'borrowed' | 'gift'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  const handleSeedSampleActivities = async () => {
    setIsSeeding(true);
    try {
      await seedSampleActivities();
      showToast('Sample activities loaded! You can now test approving meetups, confirming handovers, and returns.');
    } catch (err: any) {
      showToast(`Error loading samples: ${err?.message || 'Database error'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearSampleActivities = async () => {
    setIsSeeding(true);
    try {
      await clearSampleActivities();
      showToast('Sample activities cleared.');
    } catch (err: any) {
      showToast(`Error clearing samples: ${err?.message || 'Database error'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Return Wizard Modal State
  const [returnModalTarget, setReturnModalTarget] = useState<ExchangeTransaction | null>(null);

  // Condition Inspection Modal State (when lender confirms receipt)
  const [inspectingExchange, setInspectingExchange] = useState<ExchangeTransaction | null>(null);
  const [conditionSelected, setConditionSelected] = useState<'Like New' | 'Good' | 'Minor Wear' | 'Damaged'>('Good');
  const [conditionNotes, setConditionNotes] = useState('');

  // Rating Modal State (for history)
  const [ratingTarget, setRatingTarget] = useState<ExchangeTransaction | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingModalError, setRatingModalError] = useState<string | null>(null);

  // Handover Dispute Modal State
  const [disputeTarget, setDisputeTarget] = useState<ExchangeTransaction | null>(null);
  const [disputeReasonSelection, setDisputeReasonSelection] = useState('Neighbor did not arrive at scheduled meetup spot');
  const [disputeCustomText, setDisputeCustomText] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Modal Scroll Lock and Escape Listener
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      returnModalTarget || inspectingExchange || ratingTarget || disputeTarget
    );
    if (!isAnyModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReturnModalTarget(null);
        setInspectingExchange(null);
        setRatingTarget(null);
        setDisputeTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [returnModalTarget, inspectingExchange, ratingTarget, disputeTarget]);

  // Track donations added to private collection in this session
  const [addedDonationIds, setAddedDonationIds] = useState<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Helper: Is current user the owner?
  const isOwner = (e: ExchangeTransaction) =>
    Boolean(e.ownerId && e.ownerId === currentUserId) ||
    Boolean(currentUserDisplayName && e.ownerName && e.ownerName.toLowerCase().trim() === currentUserDisplayName.toLowerCase().trim()) ||
    Boolean(isDemoSession && (e.ownerName === 'Maya Lin' || e.ownerName === 'You'));

  // Helper: Is current user the borrower?
  const isBorrower = (e: ExchangeTransaction) =>
    Boolean(e.borrowerId && e.borrowerId === currentUserId) ||
    Boolean(currentUserDisplayName && e.borrowerName && e.borrowerName.toLowerCase().trim() === currentUserDisplayName.toLowerCase().trim()) ||
    Boolean(isDemoSession && (e.borrowerName === 'Maya Lin' || e.borrowerName === 'You'));

  // ─── LENDING TAB DATA ─────────────────────────────────────────────────────
  const lendingExchanges = useMemo(() => exchanges.filter(isOwner), [exchanges, currentUserId, currentUserDisplayName]);

  // Section 1: Pending Requests (Action Required)
  const pendingLendingRequests = useMemo(
    () => lendingExchanges.filter((e) => e.status === 'pending_approval' || e.status === 'pending_claim'),
    [lendingExchanges]
  );

  // Section 2: Handover Confirmation
  const pendingLendingHandovers = useMemo(
    () =>
      lendingExchanges.filter(
        (e) =>
          e.status === 'accepted' ||
          e.status === 'handover_in_progress' ||
          e.status === 'claim_accepted' ||
          e.status === 'claim_handover'
      ),
    [lendingExchanges]
  );

  // Section 3: Currently Lent Out (Active Loans)
  const currentlyLentLoans = useMemo(
    () => lendingExchanges.filter((e) => e.status === 'active_loan'),
    [lendingExchanges]
  );

  // Section 4: Returns to Review
  const returnsToReview = useMemo(
    () => lendingExchanges.filter((e) => e.status === 'return_in_progress'),
    [lendingExchanges]
  );

  // ─── BORROWING TAB DATA ───────────────────────────────────────────────────
  const borrowingExchanges = useMemo(() => exchanges.filter(isBorrower), [exchanges, currentUserId, currentUserDisplayName]);

  // Section 1: Requests Sent (Awaiting owner)
  const sentBorrowRequests = useMemo(
    () => borrowingExchanges.filter((e) => e.status === 'pending_approval' || e.status === 'pending_claim'),
    [borrowingExchanges]
  );

  // Section 2: Handover Confirmation
  const pendingBorrowHandovers = useMemo(
    () =>
      borrowingExchanges.filter(
        (e) =>
          e.status === 'accepted' ||
          e.status === 'handover_in_progress' ||
          e.status === 'claim_accepted' ||
          e.status === 'claim_handover'
      ),
    [borrowingExchanges]
  );

  // Section 3: Currently Borrowed (In Possession)
  const currentlyBorrowedLoans = useMemo(
    () => borrowingExchanges.filter((e) => e.status === 'active_loan'),
    [borrowingExchanges]
  );

  // Section 4: Returns in Progress
  const returnsInProgress = useMemo(
    () => borrowingExchanges.filter((e) => e.status === 'return_scheduled' || e.status === 'return_in_progress'),
    [borrowingExchanges]
  );

  // ─── HISTORY TAB DATA ─────────────────────────────────────────────────────
  const userHistoryList = useMemo(() => {
    return exchanges.filter((e) => isOwner(e) || isBorrower(e));
  }, [exchanges, currentUserId, currentUserDisplayName]);

  const historyExchanges = useMemo(() => {
    const list = userHistoryList.filter(
      (e) => e.status === 'completed' || e.status === 'claim_completed'
    );
    if (historyFilter === 'lent') return list.filter(isOwner);
    if (historyFilter === 'borrowed') return list.filter(isBorrower);
    if (historyFilter === 'gift') return list.filter((e) => e.exchangeType === 'gift');
    return list;
  }, [userHistoryList, historyFilter, currentUserId, currentUserDisplayName]);

  // Handle return handover scheduling callback
  const handleReturnScheduledCallback = async (details: ReturnHandoverDetails) => {
    if (returnModalTarget) {
      await initiateReturn(returnModalTarget.id, {
        date: details.date,
        time: details.time,
        spot: details.spot,
        note: details.note,
        trackingCode: details.trackingCode,
      });
      showToast(`Return handover #${details.trackingCode} scheduled with ${returnModalTarget.ownerName}!`);
      setReturnModalTarget(null);
    }
  };

  // Convert ExchangeTransaction to BorrowedBookItem for ReturnWizardModal
  const borrowedBookForModal: BorrowedBookItem | null = useMemo(() => {
    if (!returnModalTarget) return null;
    return {
      id: returnModalTarget.id,
      catalogId: returnModalTarget.catalogId,
      title: returnModalTarget.bookTitle,
      author: returnModalTarget.bookAuthor,
      cover: returnModalTarget.bookCover,
      owner: returnModalTarget.ownerName,
      ownerAvatar: returnModalTarget.ownerAvatar,
      collectedDate: returnModalTarget.handoverDate || 'Recently',
      dueDate: returnModalTarget.dueDate || 'Due in 30 days',
      daysUsed: returnModalTarget.daysUsed || 12,
      totalDays: returnModalTarget.totalDays || 30,
      daysLeft: returnModalTarget.daysLeft || 18,
      status: 'active',
    };
  }, [returnModalTarget]);

  return (
    <div className="pt-8 pb-20 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
            Activity
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-normal">
            Track your neighborhood borrowing and lending handovers, meetups, and returns in one central place.
          </p>
        </div>

        {/* Global Action Required Pill if any pending actions */}
        {actionRequiredTotal > 0 && (
          <div className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              {actionRequiredTotal} action{actionRequiredTotal > 1 ? 's' : ''} require your attention
            </span>
          </div>
        )}
      </div>

      {/* 2. Primary Tabs: Lending | Borrowing | History */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-8">
          {[
            {
              id: 'lending',
              label: 'Lending',
              badge: actionRequiredLending > 0 ? actionRequiredLending : null,
            },
            {
              id: 'borrowing',
              label: 'Borrowing',
              badge: actionRequiredBorrowing > 0 ? actionRequiredBorrowing : null,
            },
            {
              id: 'history',
              label: 'History',
              badge: null,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative pb-3 text-base sm:text-lg font-serif transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-700 font-medium'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-brand text-white text-[11px] font-sans font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full transition-all" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick sample controls */}
        <div className="flex items-center gap-2 pb-2 self-end sm:self-auto">
          {lendingExchanges.length > 0 || borrowingExchanges.length > 0 || historyExchanges.length > 0 ? (
            <button
              onClick={handleClearSampleActivities}
              disabled={isSeeding}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 px-2 py-1 transition"
              title="Clear sample activities"
            >
              Clear Samples
            </button>
          ) : null}
          <button
            onClick={handleSeedSampleActivities}
            disabled={isSeeding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand border border-purple-200/80 text-xs font-semibold shadow-2xs transition active:scale-95 disabled:opacity-75"
            title="Load sample activities to test the exchange engine"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
            <span>{isSeeding ? 'Loading...' : 'Load Sample Activities'}</span>
          </button>
        </div>
      </div>

      {/* Helper Banner when all tabs are empty */}
      {lendingExchanges.length === 0 && borrowingExchanges.length === 0 && historyExchanges.length === 0 && (
        <div className="mt-6 p-5 sm:p-6 bg-gradient-to-r from-purple-50 via-[#FDF8F2] to-amber-50 rounded-2xl border border-brand/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <HugeiconsIcon icon={BookOpen01Icon} size={20} />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-slate-800">
                Explore the Activity Lifecycle
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Your account currently has no active requests. Load interactive sample activities to test approving meetups, confirming handovers, and return inspections.
              </p>
            </div>
          </div>
          <button
            onClick={handleSeedSampleActivities}
            disabled={isSeeding}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-75"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
            <span>{isSeeding ? 'Loading Samples...' : 'Load Sample Activities'}</span>
          </button>
        </div>
      )}

      {/* Database / Network Error Banner with Retry */}
      {error && (
        <div className="my-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-semibold flex items-center justify-between gap-4 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={AlertCircleIcon} size={18} className="text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => refreshExchanges()}
              className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
            >
              Retry
            </button>
            <button
              onClick={clearError}
              className="p-1 rounded-lg text-red-400 hover:text-red-700 font-bold transition"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="my-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB A: LENDING (I AM THE BOOK OWNER / LENDER)                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lending' && (
        <div className="mt-8 space-y-10">
          {/* SECTION 1: Pending Requests (Action Required) */}
          {pendingLendingRequests.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                  Pending Requests ({pendingLendingRequests.length})
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Neighbors who would like to borrow or receive books from your shelf.
              </p>

              <div className="space-y-4 mt-2">
                {pendingLendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl p-5 sm:p-7 border border-brand/30 shadow-card hover:shadow-card-hover transition-all"
                  >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-5 sm:gap-6">
                      {/* Left: Requester Info & Book */}
                      <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0 w-full">
                        <SafeAvatar
                          src={req.borrowerAvatar}
                          name={req.borrowerName}
                          sizeClass="w-12 h-12 sm:w-14 sm:h-14"
                        />
                        <div className="space-y-2.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-sans font-semibold text-base sm:text-lg text-slate-900">
                              {req.borrowerName}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                req.exchangeType === 'gift'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                  : 'bg-brand/10 text-brand'
                              }`}
                            >
                              {req.exchangeType === 'gift' ? 'Wants Free Gift' : 'Wants to Borrow'}
                            </span>
                            {req.borrowerTrust && (
                              <span className="text-xs text-slate-500 font-medium">· {req.borrowerTrust}</span>
                            )}
                          </div>

                          {/* Requested Book Box */}
                          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <SafeBookThumbnail
                              src={req.bookCover}
                              title={req.bookTitle}
                              sizeClass="w-11 h-15 sm:w-12 sm:h-16"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] text-slate-500 font-medium">Requested Book</p>
                              <h4 className="font-serif text-sm sm:text-base font-semibold text-slate-800 truncate">
                                “{req.bookTitle}”
                              </h4>
                              <p className="text-xs text-slate-500 truncate">by {req.bookAuthor}</p>
                            </div>
                          </div>

                          {req.message && (
                            <p className="text-xs sm:text-sm text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                              {req.message}
                            </p>
                          )}

                          {/* Proposed Meetup Details */}
                          <div className="pt-1 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                              <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-brand flex-shrink-0" />
                              <span>{req.meetupDate} at {req.meetupTime}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                              <HugeiconsIcon icon={Location01Icon} size={14} className="text-brand flex-shrink-0" />
                              <span>{req.meetupSpot}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right/Footer: Action Buttons */}
                      <div className="flex items-center justify-end gap-2.5 w-full lg:w-auto pt-3.5 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-shrink-0">
                        <button
                          onClick={async () => {
                            await declineRequest(req.id, 'Book unavailable at this time');
                            showToast(`Declined request for “${req.bookTitle}”.`);
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition text-center"
                        >
                          Decline
                        </button>
                        <button
                          onClick={async () => {
                            await acceptRequest(req.id);
                            showToast(`Approved meetup with ${req.borrowerName} for “${req.bookTitle}”!`);
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 text-center"
                        >
                          Accept Meetup
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Handover Confirmation (Meetup Scheduled) */}
          {pendingLendingHandovers.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                Handover Confirmation ({pendingLendingHandovers.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Meetups arranged with neighbors. Confirm handover once the book is delivered.
              </p>

              <div className="space-y-3 mt-2">
                {pendingLendingHandovers.map((item) => {
                  const lenderConfirmed = item.pickupConfirmation.lenderConfirmed;
                  const isDisputed = item.status === 'disputed_handover';

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-5 border shadow-card flex flex-col gap-3 transition ${
                        isDisputed ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                          <SafeBookThumbnail
                            src={item.bookCover}
                            title={item.bookTitle}
                            sizeClass="w-12 h-16"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-brand">
                                Handover Scheduled
                              </span>
                              <span className="text-xs text-slate-500">· With {item.borrowerName}</span>
                              {isDisputed && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                                  Issue Flagged
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif text-base font-semibold text-slate-800 mt-1 truncate">
                              {item.bookTitle}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{item.meetupDate} @ {item.meetupTime}</span>
                              <span>·</span>
                              <span className="truncate">{item.meetupSpot}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:justify-start gap-2.5 flex-wrap w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {lenderConfirmed ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                                <span>You confirmed handover</span>
                              </div>
                              {item.reminderSentAt ? (
                                <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                                  Reminder sent
                                </span>
                              ) : (
                                <button
                                  onClick={async () => {
                                    await sendHandoverReminder(item.id, 'lender');
                                    showToast(`Reminder sent to ${item.borrowerName}!`);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition"
                                  title="Send handover reminder"
                                >
                                  <HugeiconsIcon icon={Notification01Icon} size={13} />
                                  <span>Remind</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setDisputeTarget(item);
                                  setDisputeCustomText('');
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 text-amber-900 text-xs font-semibold transition"
                              >
                                Report Issue
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={async () => {
                                await confirmPickupHandover(item.id, 'lender');
                                showToast(`Confirmed handing over “${item.bookTitle}” to ${item.borrowerName}!`);
                              }}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 text-center"
                            >
                              I Handed Over Book
                            </button>
                          )}

                          <button
                            onClick={() => onNavigateToMessages?.(item.borrowerName, item.bookTitle)}
                            className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center justify-center flex-shrink-0"
                            title="Message neighbor"
                            aria-label={`Message ${item.borrowerName}`}
                          >
                            <HugeiconsIcon icon={BubbleChatIcon} size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Disputed Status Notice */}
                      {isDisputed && (
                        <div className="pt-2 border-t border-amber-200/60 flex items-start gap-2 text-xs text-amber-900">
                          <HugeiconsIcon icon={AlertCircleIcon} size={15} className="text-amber-700 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Handover Issue Reported:</strong> {item.disputeReason || 'Issue flagged during meetup.'} — Community support has been notified.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: Currently Lent (Active Loans) */}
          {currentlyLentLoans.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                Currently Lent ({currentlyLentLoans.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Books currently in the hands of neighborhood readers.
              </p>

              <div className="space-y-3 mt-2">
                {currentlyLentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      <SafeBookThumbnail
                        src={loan.bookCover}
                        title={loan.bookTitle}
                        sizeClass="w-12 h-16"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            Active Loan
                          </span>
                          <span className="text-xs text-amber-700 font-semibold">· {loan.dueDate || 'Due in 30 days'}</span>
                        </div>
                        <h4 className="font-serif text-base font-semibold text-slate-800 mt-1 truncate">
                          {loan.bookTitle}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>With <strong>{loan.borrowerName}</strong></span>
                          <span>· Handed over {loan.handoverDate || 'Recently'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        onClick={() => onNavigateToMessages?.(loan.borrowerName, loan.bookTitle)}
                        className="flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex-1 sm:flex-initial justify-center"
                      >
                        <HugeiconsIcon icon={BubbleChatIcon} size={14} />
                        <span>Message</span>
                      </button>

                      <button
                        onClick={() => setInspectingExchange(loan)}
                        className="px-3.5 py-2 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex-1 sm:flex-initial text-center"
                      >
                        Mark Returned
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: Returns to Review */}
          {returnsToReview.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                  Returns to Review ({returnsToReview.length})
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Borrowers who have handed back books. Review condition and confirm receipt to complete the loan.
              </p>

              <div className="space-y-3 mt-2">
                {returnsToReview.map((item) => (
                  <div
                    key={item.id}
                    className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      <SafeBookThumbnail
                        src={item.bookCover}
                        title={item.bookTitle}
                        sizeClass="w-12 h-16"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                            Return Handover #{item.returnSchedule?.trackingCode || 'RET-AUDIT'}
                          </span>
                        </div>
                        <h4 className="font-serif text-base font-semibold text-slate-800 mt-1 truncate">
                          {item.bookTitle}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 truncate">
                          {item.borrowerName} confirmed return at {item.returnSchedule?.spot || 'Meetup spot'}.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectingExchange(item)}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition active:scale-95 text-center"
                    >
                      Inspect Condition & Confirm Receipt
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State for Lending Tab */}
          {pendingLendingRequests.length === 0 &&
            pendingLendingHandovers.length === 0 &&
            currentlyLentLoans.length === 0 &&
            returnsToReview.length === 0 && (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-brand/10 text-brand mx-auto flex items-center justify-center mb-3">
                  <HugeiconsIcon icon={BookOpen01Icon} size={26} />
                </div>
                <h3 className="font-serif text-xl font-semibold text-slate-800">No active lending activities</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  When neighbors request books from your shelf or schedule returns, they will appear right here.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleSeedSampleActivities}
                    disabled={isSeeding}
                    className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                    <span>{isSeeding ? 'Loading Samples...' : 'Load Sample Activities (See How It Works)'}</span>
                  </button>
                  {onOpenAddBook && (
                    <button
                      onClick={onOpenAddBook}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                    >
                      + Add a Book to Your Shelf
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB B: BORROWING (I AM THE BORROWER / RECIPIENT)                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'borrowing' && (
        <div className="mt-8 space-y-10">
          {/* SECTION 1: Requests Sent (Awaiting Owner Decision) */}
          {sentBorrowRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                Requests Sent ({sentBorrowRequests.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Requests awaiting the book owner’s review and approval.
              </p>

              <div className="space-y-3 mt-2">
                {sentBorrowRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      <SafeBookThumbnail
                        src={req.bookCover}
                        title={req.bookTitle}
                        sizeClass="w-12 h-16"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
                            Awaiting Owner Response
                          </span>
                          <span className="text-xs text-slate-500">· Sent {req.requestDate}</span>
                        </div>
                        <h4 className="font-serif text-base font-semibold text-slate-800 mt-1 truncate">
                          {req.bookTitle}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          Owner: <strong>{req.ownerName}</strong> · Proposed meetup: {req.meetupDate} at {req.meetupTime}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        await cancelRequest(req.id);
                        showToast(`Cancelled request for “${req.bookTitle}”.`);
                      }}
                      className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition text-center"
                    >
                      Cancel Request
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Handover Confirmation */}
          {pendingBorrowHandovers.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                Handover Confirmation ({pendingBorrowHandovers.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Confirm receipt when meeting your neighbor to collect the book.
              </p>

              <div className="space-y-3 mt-2">
                {pendingBorrowHandovers.map((item) => {
                  const borrowerConfirmed = item.pickupConfirmation.borrowerConfirmed;
                  const isDisputed = item.status === 'disputed_handover';

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-5 border shadow-card flex flex-col gap-3 transition ${
                        isDisputed ? 'border-amber-300 bg-amber-50/20' : 'border-brand/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                          <SafeBookThumbnail
                            src={item.bookCover}
                            title={item.bookTitle}
                            sizeClass="w-12 h-16"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-brand">
                                Ready for Collection
                              </span>
                              <span className="text-xs text-slate-500">· Owner: {item.ownerName}</span>
                              {isDisputed && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                                  Issue Flagged
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif text-base font-semibold text-slate-800 mt-1 truncate">
                              {item.bookTitle}
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                              <HugeiconsIcon icon={Calendar01Icon} size={13} className="text-brand flex-shrink-0" />
                              <span className="truncate">{item.meetupDate} at {item.meetupTime} ({item.meetupSpot})</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:justify-start gap-2.5 flex-wrap w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {borrowerConfirmed ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                                <span>You confirmed receipt</span>
                              </div>
                              {item.reminderSentAt ? (
                                <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
                                  Reminder sent
                                </span>
                              ) : (
                                <button
                                  onClick={async () => {
                                    await sendHandoverReminder(item.id, 'borrower');
                                    showToast(`Reminder sent to ${item.ownerName}!`);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition"
                                  title="Send handover reminder"
                                >
                                  <HugeiconsIcon icon={Notification01Icon} size={13} />
                                  <span>Remind</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setDisputeTarget(item);
                                  setDisputeCustomText('');
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 text-amber-900 text-xs font-semibold transition"
                              >
                                Report Issue
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={async () => {
                                await confirmPickupHandover(item.id, 'borrower');
                                showToast(`Confirmed receipt of “${item.bookTitle}” from ${item.ownerName}! Enjoy reading.`);
                              }}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 text-center"
                            >
                              I Received the Book
                            </button>
                          )}

                          <button
                            onClick={() => onNavigateToMessages?.(item.ownerName, item.bookTitle)}
                            className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center justify-center flex-shrink-0"
                            title="Message owner"
                            aria-label={`Message ${item.ownerName}`}
                          >
                            <HugeiconsIcon icon={BubbleChatIcon} size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Disputed Status Notice */}
                      {isDisputed && (
                        <div className="pt-2 border-t border-amber-200/60 flex items-start gap-2 text-xs text-amber-900">
                          <HugeiconsIcon icon={AlertCircleIcon} size={15} className="text-amber-700 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Handover Issue Reported:</strong> {item.disputeReason || 'Issue flagged during meetup.'} — Community support has been notified.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: Currently Borrowed (In Possession with Countdown) */}
          {currentlyBorrowedLoans.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                Currently Borrowed ({currentlyBorrowedLoans.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Books currently in your possession. Keep an eye on return schedules.
              </p>

              <div className="space-y-4 mt-2">
                {currentlyBorrowedLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <SafeBookThumbnail
                        src={loan.bookCover}
                        title={loan.bookTitle}
                        sizeClass="w-14 h-20 sm:w-16 sm:h-22"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            Reading Now
                          </span>
                          <span className="text-xs font-semibold text-amber-700">· {loan.dueDate || 'Due in 30 days'}</span>
                        </div>

                        <h3 className="font-serif text-lg font-semibold text-slate-800 truncate">
                          {loan.bookTitle}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate">{loan.bookAuthor}</p>

                        <div className="pt-2 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                          <span>Owner: <strong className="font-semibold text-slate-700">{loan.ownerName}</strong></span>
                          <span>· Collected: {loan.handoverDate || '12 days ago'}</span>
                        </div>

                        {/* Progress Bar for Loan */}
                        <div className="pt-2 w-full max-w-md">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                            <span>12 of 30 days used</span>
                            <span className="text-brand font-semibold">18 days left</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-brand rounded-full transition-all" style={{ width: '40%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <button
                        onClick={() => setReturnModalTarget(loan)}
                        className="flex-1 lg:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition active:scale-95 text-center"
                      >
                        Schedule Return Handover
                      </button>

                      <button
                        onClick={() => onNavigateToMessages?.(loan.ownerName, loan.bookTitle)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition text-center"
                      >
                        Message Owner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: Returns in Progress */}
          {returnsInProgress.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                Returns in Progress ({returnsInProgress.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Return meetups scheduled with book owners.
              </p>

              <div className="space-y-3 mt-2">
                {returnsInProgress.map((item) => {
                  const borrowerConfirmed = item.returnSchedule?.borrowerConfirmed;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <SafeBookThumbnail
                          src={item.bookCover}
                          title={item.bookTitle}
                          sizeClass="w-12 h-16"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-brand">
                              Return Code #{item.returnSchedule?.trackingCode || 'RET-AUDIT'}
                            </span>
                          </div>
                          <h4 className="font-serif text-base font-semibold text-slate-800 mt-1 truncate">
                            {item.bookTitle}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">
                            Meetup with {item.ownerName}: {item.returnSchedule?.date} at {item.returnSchedule?.time} ({item.returnSchedule?.spot})
                          </p>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex justify-end pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {borrowerConfirmed ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-full sm:w-auto justify-center">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                            <span>Handed back · Awaiting owner confirmation</span>
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              await confirmReturnHandedBack(item.id);
                              showToast(`Confirmed handing back “${item.bookTitle}” to ${item.ownerName}!`);
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition active:scale-95"
                          >
                            I Handed Back the Book
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State for Borrowing Tab */}
          {sentBorrowRequests.length === 0 &&
            pendingBorrowHandovers.length === 0 &&
            currentlyBorrowedLoans.length === 0 &&
            returnsInProgress.length === 0 && (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                  <HugeiconsIcon icon={BookOpen01Icon} size={26} />
                </div>
                <h3 className="font-serif text-xl font-semibold text-slate-800">No active borrows right now</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Explore books in your neighborhood to borrow, read, and return with trust!
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleSeedSampleActivities}
                    disabled={isSeeding}
                    className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                    <span>{isSeeding ? 'Loading Samples...' : 'Load Sample Activities (See How It Works)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/books')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95"
                  >
                    + Explore Community Books
                  </button>
                </div>
              </div>
            )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB C: HISTORY (COMPLETED EXCHANGES)                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                Completed Exchanges ({historyExchanges.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Permanent record of your loans, borrows, and community gifts.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Exchanges' },
                { id: 'lent', label: 'Lent Out' },
                { id: 'borrowed', label: 'Borrowed' },
                { id: 'gift', label: 'Free Gifts' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setHistoryFilter(chip.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    historyFilter === chip.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {historyExchanges.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 mx-auto flex items-center justify-center mb-3">
                <HugeiconsIcon icon={BookOpen01Icon} size={26} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-slate-800">No completed exchanges yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Completed loans, verified returns, and gift claims will be archived here.
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  onClick={handleSeedSampleActivities}
                  disabled={isSeeding}
                  className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center gap-2"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                  <span>{isSeeding ? 'Loading Samples...' : 'Load Sample Activities (See How It Works)'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 mt-4">
            {historyExchanges.map((item) => {
              const userIsLender = isOwner(item);
              const partnerName = userIsLender ? item.borrowerName : item.ownerName;
              const partnerRole = userIsLender ? 'Borrower' : 'Lender';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <SafeBookThumbnail
                      src={item.bookCover}
                      title={item.bookTitle}
                      sizeClass="w-12 h-16"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.exchangeType === 'gift'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                              : userIsLender
                              ? 'bg-brand/10 text-brand'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.exchangeType === 'gift'
                            ? userIsLender
                              ? 'Gift Donated'
                              : 'Gift Claimed'
                            : userIsLender
                            ? 'Lent Out'
                            : 'Borrowed'}
                        </span>
                        <span className="text-xs text-slate-500">· Completed {item.completedDate || 'Recently'}</span>
                        {item.conditionIssue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                            Inspection: {item.conditionVerified || 'Condition Issue'}
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif text-base font-semibold text-slate-800 mt-1">
                        {item.bookTitle}
                      </h4>
                      <p className="text-xs text-slate-500">
                        With <strong>{partnerName}</strong> ({partnerRole})
                      </p>

                      {item.feedback && (
                        <p className="text-xs text-slate-600 mt-1 italic">
                          “{item.feedback}”
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                      <span>Verified Complete</span>
                    </div>

                    {/* Donation Recipient Action: Add to My Private Collection */}
                    {item.exchangeType === 'gift' && !userIsLender && (
                      addedDonationIds.has(item.id) ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                          ✓ In Private Collection
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            await addDonationToPrivateCollection(item);
                            setAddedDonationIds((prev) => new Set(prev).add(item.id));
                            showToast(`“${item.bookTitle}” added to your Private Collection! Visible only to you.`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand border border-purple-200/80 text-xs font-semibold shadow-2xs transition active:scale-95"
                        >
                          + Add to My Private Collection
                        </button>
                      )
                    )}

                    {/* Independent Dual Rating */}
                    {(() => {
                      const userAlreadyRated = userIsLender ? Boolean(item.lenderRating) : Boolean(item.borrowerRating);
                      const userScore = userIsLender ? item.lenderRating : item.borrowerRating;

                      if (userAlreadyRated) {
                        return (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span className="text-[11px] text-slate-500">You rated:</span>
                            <div className="flex items-center text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <HugeiconsIcon
                                  key={i}
                                  icon={StarIcon}
                                  size={12}
                                  className={i < Math.floor(userScore || 5) ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          onClick={() => {
                            setRatingTarget(item);
                            setRatingScore(5);
                            setRatingFeedback('');
                            setRatingModalError(null);
                            setIsSubmittingRating(false);
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/60 text-xs font-semibold transition"
                        >
                          Rate {partnerRole}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* RETURN WIZARD MODAL (BORROWER)                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <ReturnWizardModal
        isOpen={Boolean(returnModalTarget)}
        book={borrowedBookForModal}
        onClose={() => setReturnModalTarget(null)}
        onReturnScheduled={handleReturnScheduledCallback}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CONDITION INSPECTION & CONFIRM RECEIPT MODAL (LENDER)               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {inspectingExchange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="condition-inspection-title"
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={ShieldCheckIcon} size={24} />
            </div>

            <h3 id="condition-inspection-title" className="font-serif text-xl sm:text-2xl font-semibold text-slate-900">
              Confirm Receipt & Book Condition
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              You are confirming that <strong>“{inspectingExchange.bookTitle}”</strong> was received back from{' '}
              {inspectingExchange.borrowerName}.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Condition of Returned Copy
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Like New', 'Good', 'Minor Wear', 'Damaged'] as const).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setConditionSelected(cond)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        conditionSelected === cond
                          ? 'border-brand bg-brand/5 text-brand shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {conditionSelected === 'Damaged' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                    <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Condition Recorded:</strong>
                      Recording damage logs this in the permanent exchange audit history for transparency, while safely completing the return so your book is unlocked in your library.
                    </div>
                  </div>
                  {onNavigateToMessages && (
                    <button
                      type="button"
                      onClick={() => {
                        const borrower = inspectingExchange.borrowerName;
                        const title = inspectingExchange.bookTitle;
                        onNavigateToMessages(borrower, title);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-brand hover:text-brand-dark font-medium underline-offset-2 hover:underline pt-0.5"
                    >
                      <HugeiconsIcon icon={BubbleChatIcon} size={14} />
                      <span>Optional: Message {inspectingExchange.borrowerName} about this issue</span>
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Notes / Feedback
                </label>
                <textarea
                  rows={2}
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="e.g. Returned cleanly with no bent pages, thanks!"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setInspectingExchange(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await confirmReturnReceipt(inspectingExchange.id, conditionSelected, conditionNotes);
                  showToast(`Confirmed receipt for “${inspectingExchange.bookTitle}”! Moved to History.`);
                  setInspectingExchange(null);
                  setConditionNotes('');
                }}
                className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
              >
                Complete Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* RATING & REVIEW MODAL (HISTORY)                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {ratingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-modal-title"
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={StarIcon} size={24} className="fill-amber-400" />
            </div>

            <h3 id="rating-modal-title" className="font-serif text-xl sm:text-2xl font-semibold text-slate-900">
              Rate Your Experience
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Exchange with <strong>{isOwner(ratingTarget) ? ratingTarget.borrowerName : ratingTarget.ownerName}</strong> for “{ratingTarget.bookTitle}”.
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={28}
                      className={star <= ratingScore ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Community Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Leave a short note about this exchange..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            {ratingModalError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {ratingModalError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmittingRating}
                onClick={() => setRatingTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRating}
                onClick={async () => {
                  setIsSubmittingRating(true);
                  setRatingModalError(null);
                  try {
                    await submitRating(
                      ratingTarget.id,
                      isOwner(ratingTarget) ? 'lender' : 'borrower',
                      ratingScore,
                      ratingFeedback
                    );
                    showToast(`Thank you for rating your exchange!`);
                    setRatingTarget(null);
                  } catch (err: any) {
                    setRatingModalError(err?.message || 'Failed to submit rating. Please try again.');
                  } finally {
                    setIsSubmittingRating(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 disabled:opacity-75 flex items-center gap-1.5"
              >
                {isSubmittingRating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Rating</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HANDOVER DISPUTE / EXCEPTION MODAL                                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {disputeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dispute-modal-title"
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={AlertCircleIcon} size={24} />
            </div>

            <h3 id="dispute-modal-title" className="font-serif text-xl sm:text-2xl font-semibold text-slate-900">
              Report Handover Issue
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Having trouble completing the book handover for “{disputeTarget.bookTitle}”? Let us know what happened.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select the issue that best describes what happened:
                </label>
                <div className="space-y-2">
                  {[
                    'Neighbor did not arrive at scheduled meetup spot',
                    'Book condition did not match description or was damaged',
                    'Unable to coordinate via messages or phone',
                    'Other issue or cancellation requested',
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                        disputeReasonSelection === reason
                          ? 'border-brand bg-brand/5 text-slate-900 font-semibold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="disputeReasonSelection"
                        checked={disputeReasonSelection === reason}
                        onChange={() => setDisputeReasonSelection(reason)}
                        className="accent-brand"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={disputeCustomText}
                  onChange={(e) => setDisputeCustomText(e.target.value)}
                  placeholder="Add any extra context for our support team..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDisputeTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingDispute}
                onClick={async () => {
                  setIsSubmittingDispute(true);
                  try {
                    const fullReason = disputeCustomText
                      ? `${disputeReasonSelection} (${disputeCustomText})`
                      : disputeReasonSelection;
                    await reportHandoverDispute(disputeTarget.id, fullReason);
                    showToast(`Handover issue reported. Our community support team is reviewing it.`);
                    setDisputeTarget(null);
                    setDisputeCustomText('');
                  } finally {
                    setIsSubmittingDispute(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isSubmittingDispute ? 'Submitting...' : 'Submit Issue Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
