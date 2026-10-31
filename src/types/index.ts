export interface Book {
  id: string;
  catalogId?: string; // Canonical Unique Book Title ID for shared reviews and ratings
  title: string;
  author: string;
  authorCountry?: string;
  coverImage: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  ownersCount: number;
  category: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
  status: 'available' | 'lent_out' | 'donation' | 'claimed';
  ownerName: string;
  ownerAvatar: string;
  ownerTrust: string;
  description?: string;
  condition?: 'Like New' | 'Very Good' | 'Good' | 'Fair';
  availabilityMode?: 'lending' | 'donation' | 'personal';
  bookType?: 'Original Copy' | 'Translated Copy';
  wishlistCount?: number;
}

export interface CatalogBook {
  id: string; // Unique Book ID (e.g. 'the-god-of-small-things')
  title: string;
  author: string;
  authorCountry?: string;
  coverImage: string;
  rating: number;
  reviewsCount: number;
  wishlistCount?: number;
  category: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
  synopsis: string;
  existingOwners: {
    name: string;
    avatar: string;
    condition: string;
    distance?: string;
  }[];
}

export interface Reader {
  id: string;
  name: string;
  avatar: string;
  distance: string;
  location?: string;
  memberSince: string;
  booksAvailable: number;
  booksForLending?: number;
  booksForDonation?: number;
  lentOutCount?: number;
  dueSoon?: number;
  rating: number;
  totalBorrows: number;
  trustTier?: string;
  trustScore?: string;
  bio?: string;
  favoriteGenres?: string[];
  verified?: boolean;
}

// ─── UNIFIED EXCHANGE LIFECYCLE & ACTIVITY TYPES ─────────────────────────────

export type ExchangeType = 'borrow' | 'gift';

export type ExchangeStatus =
  // Borrowing stream
  | 'pending_approval'        // Borrower sent request; waiting for owner decision
  | 'accepted'                // Owner approved; meetup scheduled
  | 'handover_in_progress'    // Meetup arrived; waiting for dual pickup confirmation
  | 'active_loan'             // Both confirmed handover; active 30-day loan
  | 'return_scheduled'        // Return meetup arranged by borrower
  | 'return_in_progress'      // Borrower confirmed handed back; owner reviewing receipt
  | 'completed'               // Return verified by owner; recorded in History
  | 'declined'                // Owner declined request
  | 'cancelled'               // Cancelled before handover
  | 'disputed_handover'       // Issue reported during pickup/return meetup
  // Donation stream
  | 'pending_claim'           // Recipient submitted gift claim
  | 'claim_accepted'          // Donor approved claim; meetup scheduled
  | 'claim_handover'          // Awaiting dual gift handover confirmation
  | 'claim_completed'         // Gift handed over; permanently in History
  | 'claim_declined'          // Donor declined claim
  | 'claim_cancelled';        // Recipient cancelled claim

export interface HandoverConfirmation {
  lenderConfirmed: boolean;
  lenderConfirmedAt?: string;
  borrowerConfirmed: boolean;
  borrowerConfirmedAt?: string;
}

export interface ReturnScheduleDetails {
  trackingCode: string;
  date: string;
  time: string;
  spot: string;
  note?: string;
  borrowerConfirmed: boolean;
  borrowerConfirmedAt?: string;
  lenderConfirmed: boolean;
  lenderConfirmedAt?: string;
  conditionVerified?: 'Like New' | 'Good' | 'Minor Wear' | 'Damaged';
  conditionNotes?: string;
}

export interface ExchangeTransaction {
  id: string;
  bookId: string;
  catalogId?: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  exchangeType: ExchangeType;
  status: ExchangeStatus;

  // Participants
  borrowerId: string;
  borrowerName: string;
  borrowerAvatar: string;
  borrowerTrust?: string;
  borrowerDistance?: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerTrust?: string;

  // Handover & Meetup
  requestDate: string;
  meetupDate: string;
  meetupTime: string;
  meetupSpot: string;
  message?: string;

  // Dual confirmation state
  pickupConfirmation: HandoverConfirmation;

  // Loan Schedule (for borrowing)
  handoverDate?: string;
  dueDate?: string;
  totalDays?: number;
  daysUsed?: number;
  daysLeft?: number;

  // Return Handover Schedule (for borrowing)
  returnSchedule?: ReturnScheduleDetails;

  // History, Rating & Independent Dual Feedback
  completedDate?: string;
  rating?: number;
  feedback?: string;
  lenderRating?: number;
  lenderFeedback?: string;
  lenderRatedAt?: string;
  borrowerRating?: number;
  borrowerFeedback?: string;
  borrowerRatedAt?: string;
  conditionIssue?: boolean;
  conditionVerified?: 'Like New' | 'Good' | 'Minor Wear' | 'Damaged';
  conditionNotes?: string;
  disputeReason?: string;
  disputedAt?: string;
  disputedBy?: string;
  reminderSentAt?: string;
  lastReminderBy?: string;
}


