import React, { useState, useMemo, useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
} from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeaderSection } from './components/HeaderSection';
import { CategoryPills } from './components/CategoryPills';
import { BooksSection } from './components/BooksSection';
import { ReadersSection } from './components/ReadersSection';
import { WritersSection } from './components/WritersSection';
import { CoffeeModal } from './components/CoffeeModal';
import { BorrowWizardModal, type BorrowHandoverDetails } from './components/borrow/BorrowWizardModal';
import { ClaimGiftModal, type ClaimGiftDetails } from './components/borrow/ClaimGiftModal';
import { AddBookModal } from './components/mybooks/AddBookModal';
import { FloatingAddBookButton } from './components/FloatingAddBookButton';
import { dbService } from './services/dbService';
import type { NotificationItem } from './components/NotificationDropdown';
import { MyBooksPage } from './components/mybooks/MyBooksPage';
import { ActivityPage } from './components/activity/ActivityPage';
import { BookDetailsPage } from './components/bookdetails/BookDetailsPage';
import { BookReviewsPage } from './components/reviews/BookReviewsPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { PublicProfilePage } from './components/profile/PublicProfilePage';
import { WishlistModal } from './components/profile/WishlistModal';
import { cleanAvatarUrl } from './utils/avatarUtils';
import { sanitizeEmbeddedImageUrl } from './utils/imageUtils';
import { InboxPage } from './components/inbox/InboxPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { LogoutConfirmDialog } from './components/LogoutConfirmDialog';
import { MobileNavBar } from './components/MobileNavBar';
import { WelcomeOnboardingModal } from './components/onboarding/WelcomeOnboardingModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal';
import { ReadersBrowsePage } from './components/readers/ReadersBrowsePage';
import { BooksBrowsePage } from './components/books/BooksBrowsePage';
import { WritersBrowsePage } from './components/writers/WritersBrowsePage';
import { AuthorProfilePage } from './components/author/AuthorProfilePage';
import { NotFoundPage } from './components/NotFoundPage';
import { WhoWeArePage } from './components/about/WhoWeArePage';
import { ScrollToTop } from './components/common/ScrollToTop';
import { forceResetBodyScroll } from './hooks/useBodyScrollLock';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WriterProvider, useWriter } from './context/WriterContext';
import { ExchangeProvider, useExchanges } from './context/ExchangeContext';
import { MessagingProvider, useMessaging } from './context/MessagingContext';
import { WriterOnboardingModal } from './components/writer/WriterOnboardingModal';
import { WriterDashboardModal } from './components/writer/WriterDashboardModal';
import { AdminWriterReviewModal } from './components/writer/AdminWriterReviewModal';
import { FloatingChatWidget } from './components/chat/FloatingChatWidget';
import { mockBooks, mockReaders } from './data/mockData';
import {
  getAuthorBySlug,
  getAuthorByName,
  getOrCreateAuthor,
  generateAuthorSlug,
  getBooksByAuthor,
  getAllAuthors
} from './data/authors';
import {
  findCatalogBook,
  canonicalCatalogBooks,
  getCatalogWorksForAuthor
} from './data/canonicalCatalog';
import type { Book, BookCategory, Reader } from './types';
import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, FavouriteIcon } from '@hugeicons/core-free-icons';
import { isPublicDiscoveryBook } from './utils/bookVisibility';

// ─── BOOK DETAILS ROUTE WRAPPER ───────────────────────────────────────
const BookDetailsRoute: React.FC<{
  booksList: Book[];
  isInitialLoading?: boolean;
  onRequestBorrow: (b: Book, owner?: string) => void;
  onSelectOwner: (ownerName: string) => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  onSimulateReturn: (b: Book) => void;
  onOpenAddBook?: (book?: Book) => void;
}> = ({ booksList, isInitialLoading, onRequestBorrow, onSelectOwner, onSelectAuthor, onSimulateReturn, onOpenAddBook }) => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  // 1. Direct copy lookup in booksList
  const matchedCopy = useMemo(() => {
    if (!bookId) return null;
    const clean = decodeURIComponent(bookId).toLowerCase().trim();
    return (
      booksList.find(
        (b) =>
          b.id.toLowerCase() === clean ||
          (b.catalogId && b.catalogId.toLowerCase() === clean) ||
          b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean
      ) || null
    );
  }, [booksList, bookId]);

  // 2. Canonical catalog lookup (supports published books with 0 community copies)
  const canonicalWork = useMemo(() => {
    if (!bookId) return undefined;
    return findCatalogBook(decodeURIComponent(bookId));
  }, [bookId]);

  // 3. Resolve active book metadata
  const book = useMemo(() => {
    if (matchedCopy) return matchedCopy;
    if (canonicalWork) {
      return {
        id: canonicalWork.id,
        catalogId: canonicalWork.id,
        title: canonicalWork.title,
        author: canonicalWork.author,
        authorId: canonicalWork.authorId,
        authorCountry: canonicalWork.authorCountry,
        coverImage: canonicalWork.coverImage,
        category: canonicalWork.category,
        rating: canonicalWork.rating,
        reviewsCount: canonicalWork.reviewsCount,
        description: canonicalWork.synopsis,
        publishedYear: canonicalWork.publishedYear,
        status: 'available' as const,
        distance: '',
        ownersCount: 0,
        ownerName: '',
        ownerAvatar: '',
        ownerTrust: '',
        owner: { name: '', avatar: '', distance: '' }
      };
    }
    return null;
  }, [matchedCopy, canonicalWork]);

  // 4. Calculate all borrowable/claimable community copies belonging to this title (strictly excludes Personal Bookshelf items)
  const communityCopies = useMemo(() => {
    if (!book) return [];
    const targetTitle = book.title.toLowerCase().trim();
    const targetCatalogId = (book.catalogId || book.id).toLowerCase().trim();
    return booksList.filter(
      (b) =>
        isPublicDiscoveryBook(b) &&
        ((b.catalogId && b.catalogId.toLowerCase().trim() === targetCatalogId) ||
          b.title.toLowerCase().trim() === targetTitle)
    );
  }, [book, booksList]);

  if (!book) {
    if (isInitialLoading) {
      return (
        <div className="py-32 text-center max-w-md mx-auto animate-pulse">
          <div className="w-10 h-10 border-2 border-brand/20 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading book details...</p>
        </div>
      );
    }

    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center mb-4">
          <HugeiconsIcon icon={BookOpen01Icon} size={30} />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-800">Book Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The book you are looking for may have been removed or does not exist.
        </p>
        <button
          onClick={() => navigate('/books')}
          className="mt-6 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
        >
          Explore All Books
        </button>
      </div>
    );
  }

  return (
    <BookDetailsPage
      book={book}
      communityCopies={communityCopies}
      onRequestBorrow={onRequestBorrow}
      onSelectOwner={onSelectOwner}
      onSelectAuthor={onSelectAuthor}
      onSimulateReturn={onSimulateReturn}
      onOpenAddBook={onOpenAddBook}
    />
  );
};

// ─── BOOK REVIEWS ROUTE WRAPPER ───────────────────────────────────────
const BookReviewsRoute: React.FC<{
  booksList: Book[];
  isInitialLoading?: boolean;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
}> = ({ booksList, isInitialLoading, onSelectAuthor }) => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  // 1. Direct copy lookup in booksList
  const matchedCopy = useMemo(() => {
    if (!bookId) return null;
    const clean = decodeURIComponent(bookId).toLowerCase().trim();
    return (
      booksList.find(
        (b) =>
          b.id.toLowerCase() === clean ||
          (b.catalogId && b.catalogId.toLowerCase() === clean) ||
          b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean
      ) || null
    );
  }, [booksList, bookId]);

  // 2. Canonical catalog lookup
  const canonicalWork = useMemo(() => {
    if (!bookId) return undefined;
    return findCatalogBook(decodeURIComponent(bookId));
  }, [bookId]);

  // 3. Resolve active book metadata
  const book = useMemo(() => {
    if (matchedCopy) return matchedCopy;
    if (canonicalWork) {
      return {
        id: canonicalWork.id,
        catalogId: canonicalWork.id,
        title: canonicalWork.title,
        author: canonicalWork.author,
        authorId: canonicalWork.authorId,
        authorCountry: canonicalWork.authorCountry,
        coverImage: canonicalWork.coverImage,
        category: canonicalWork.category,
        rating: canonicalWork.rating,
        reviewsCount: canonicalWork.reviewsCount,
        description: canonicalWork.synopsis,
        publishedYear: canonicalWork.publishedYear,
        status: 'available' as const,
        distance: '',
        ownersCount: 0,
        ownerName: '',
        ownerAvatar: '',
        ownerTrust: '',
        owner: { name: '', avatar: '', distance: '' }
      };
    }
    return null;
  }, [matchedCopy, canonicalWork]);

  if (!book) {
    if (isInitialLoading) {
      return (
        <div className="py-32 text-center max-w-md mx-auto animate-pulse">
          <div className="w-10 h-10 border-2 border-brand/20 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading reviews...</p>
        </div>
      );
    }

    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center mb-4">
          <HugeiconsIcon icon={BookOpen01Icon} size={30} />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-800">Book Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The book whose reviews you are trying to view could not be found.
        </p>
        <button
          onClick={() => navigate('/books')}
          className="mt-6 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
        >
          Explore All Books
        </button>
      </div>
    );
  }

  return <BookReviewsPage book={book} onSelectAuthor={onSelectAuthor} />;
};

// ─── READER PROFILE ROUTE WRAPPER ─────────────────────────────────────
const ReaderProfileRoute: React.FC<{
  readersList: Reader[];
  booksList: Book[];
  onSelectBook: (book: Book) => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  onRequestBorrow: (b: Book, owner?: string) => void;
  onSendMessage: (ownerName: string) => void;
}> = ({ readersList, booksList, onSelectBook, onSelectAuthor, onRequestBorrow, onSendMessage }) => {
  const { readerId } = useParams<{ readerId: string }>();
  const navigate = useNavigate();

  const reader = useMemo(() => {
    if (!readerId) return null;
    const decoded = decodeURIComponent(readerId).toLowerCase().trim();
    const match = readersList.find(
      (r) =>
        r.id.toLowerCase() === decoded ||
        r.name.toLowerCase().trim() === decoded
    );
    if (match) return match;

    // Dynamic reader fallback if navigated by name
    return {
      id: `reader-${decoded.replace(/\s+/g, '-')}`,
      name: decodeURIComponent(readerId),
      avatar: '',
      distance: 'Nearby Neighborhood',
      location: 'Nearby Neighborhood',
      memberSince: 'Recently Joined',
      booksAvailable: booksList.filter(
        (b) => b.ownerName.toLowerCase().trim() === decoded
      ).length,
      rating: 5.0,
      totalBorrows: 0,
      trustTier: 'Tier 1 · Novice Reader',
      trustScore: 'New Reader',
      bio: '',
      favoriteGenres: ['All', 'Fiction', 'Non-fiction'],
      verified: true,
    } as Reader;
  }, [readersList, booksList, readerId]);

  if (!reader) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold font-serif text-slate-800">Reader Profile Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The reader profile you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate('/readers')}
          className="mt-6 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
        >
          Explore All Readers
        </button>
      </div>
    );
  }

  return (
    <PublicProfilePage
      reader={reader}
      allBooks={booksList}
      onSelectBook={onSelectBook}
      onSelectAuthor={onSelectAuthor}
      onRequestBorrow={onRequestBorrow}
      onSendMessage={onSendMessage}
    />
  );
};

// ─── AUTHOR PROFILE ROUTE WRAPPER ─────────────────────────────────────
const AuthorProfileRoute: React.FC<{
  booksList: Book[];
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorName: string, authorId?: string) => void;
  onSelectOwner: (ownerName: string) => void;
  onQuickBorrow?: (book: Book) => void;
  onOpenAddBook?: (initialBook?: any) => void;
}> = ({ booksList, onSelectBook, onSelectAuthor, onSelectOwner, onQuickBorrow, onOpenAddBook }) => {
  const { authorId } = useParams<{ authorId: string }>();
  const navigate = useNavigate();
  const { allAuthors } = useWriter();

  const author = useMemo(() => {
    if (!authorId) return undefined;
    const decoded = decodeURIComponent(authorId).trim();
    const normalized = decoded.toLowerCase();

    // 1. Check in allAuthors (includes approved / updated / custom authors)
    const authorMatch = allAuthors.find(
      (a) =>
        a.slug.toLowerCase() === normalized ||
        a.id.toLowerCase() === normalized ||
        a.name.toLowerCase().trim() === normalized ||
        generateAuthorSlug(a.name) === normalized
    );
    if (authorMatch) return authorMatch;

    // 2. Direct slug or ID lookup in default authors
    const found = getAuthorBySlug(decoded) || getAuthorByName(decoded);
    if (found) return found;

    // 3. Look through canonical catalog books
    const catalogBook = canonicalCatalogBooks.find(
      (b) =>
        (b.authorId && b.authorId.toLowerCase() === decoded.toLowerCase()) ||
        generateAuthorSlug(b.author) === generateAuthorSlug(decoded) ||
        b.author.toLowerCase().trim() === decoded.toLowerCase()
    );
    if (catalogBook) {
      return getOrCreateAuthor(catalogBook.author, catalogBook.authorCountry);
    }

    // 4. Look through books in community listings
    const matchingBook = booksList.find(
      (b) =>
        generateAuthorSlug(b.author) === generateAuthorSlug(decoded) ||
        b.author.toLowerCase().trim() === decoded.toLowerCase()
    );

    if (matchingBook) {
      return getOrCreateAuthor(matchingBook.author, matchingBook.authorCountry);
    }

    // 5. Fallback: format slug to title case for unknown author
    const formattedName = decoded
      .split(/[-_]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return getOrCreateAuthor(formattedName);
  }, [authorId, booksList, allAuthors]);

  // Compute canonical works for this author (published bibliography with live copy counts)
  const authorWorks = useMemo(() => {
    if (!author) return [];
    return getCatalogWorksForAuthor(author.name, booksList);
  }, [author, booksList]);

  const authorCopies = useMemo(() => {
    if (!author) return [];
    return getBooksByAuthor(booksList, author.name);
  }, [booksList, author]);

  return (
    <AuthorProfilePage
      author={author}
      works={authorWorks}
      books={authorCopies}
      onSelectWork={(work) => navigate(`/book/${encodeURIComponent(work.id)}`)}
      onSelectBook={onSelectBook}
      onSelectAuthor={onSelectAuthor}
      onSelectOwner={onSelectOwner}
      onQuickBorrow={onQuickBorrow}
      onOpenAddBook={() => onOpenAddBook?.({ author: author?.name })}
      onBack={() => navigate('/books')}
    />
  );
};

// ─── USER PROFILE ROUTE WRAPPER (READER OR WRITER PROFILE) ─────────────
const UserProfileRoute: React.FC<{
  booksList: Book[];
  currentUserShelfBooks: Book[];
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorName: string, authorId?: string) => void;
  onSelectOwner: (ownerName: string) => void;
  onQuickBorrow?: (book: Book) => void;
  onOpenAddBook?: (initialBook?: any) => void;
}> = ({
  booksList,
  currentUserShelfBooks,
  onSelectBook,
  onSelectAuthor,
  onSelectOwner,
  onQuickBorrow,
  onOpenAddBook,
}) => {
  const { experienceMode, activeWriterProfile, allAuthors } = useWriter();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Robust target writer resolution
  const targetWriter = useMemo(() => {
    if (activeWriterProfile) return activeWriterProfile;
    if (currentUser?.writerStatus === 'approved') {
      const target = (currentUser.writerProfileId || currentUser.displayName)?.trim().toLowerCase();
      if (target) {
        return (
          allAuthors.find(
            (a) =>
              a.id.toLowerCase() === target ||
              a.slug.toLowerCase() === target ||
              a.name.toLowerCase() === target
          ) || null
        );
      }
    }
    return null;
  }, [activeWriterProfile, currentUser, allAuthors]);

  // If in Writer Mode with an approved Writer profile, render the official Writer Profile!
  if (experienceMode === 'writer' && (activeWriterProfile || targetWriter)) {
    const writer = activeWriterProfile || targetWriter!;
    const authorWorks = getCatalogWorksForAuthor(writer.name, booksList);
    const authorCopies = getBooksByAuthor(booksList, writer.name);

    return (
      <AuthorProfilePage
        author={writer}
        works={authorWorks}
        books={authorCopies}
        onSelectWork={(work) => navigate(`/book/${encodeURIComponent(work.id)}`)}
        onSelectBook={onSelectBook}
        onSelectAuthor={onSelectAuthor}
        onSelectOwner={onSelectOwner}
        onQuickBorrow={onQuickBorrow}
        onOpenAddBook={() => onOpenAddBook?.({ author: writer.name })}
        onBack={() => navigate('/books')}
        isUserProfileView={true}
      />
    );
  }

  // Otherwise, render the standard Reader Profile
  return (
    <ProfilePage
      onSelectBook={onSelectBook}
      onSelectAuthor={onSelectAuthor}
      myBooks={currentUserShelfBooks}
    />
  );
};

// ─── MESSAGES ROUTE WRAPPER ───────────────────────────────────────────
const MessagesRoute: React.FC<{
  booksList: Book[];
  selectedChatParticipant: string | null;
  onSelectBook: (book: Book) => void;
}> = ({ booksList, selectedChatParticipant, onSelectBook }) => {
  const [searchParams] = useSearchParams();
  const chatOwner = searchParams.get('chat') || selectedChatParticipant;

  return (
    <InboxPage
      initialOwnerName={chatOwner}
      onSelectBook={(title) => {
        const match = booksList.find((b) => b.title.toLowerCase() === title.toLowerCase());
        if (match) onSelectBook(match);
      }}
    />
  );
};

// ─── MAIN APP CONTAINER ───────────────────────────────────────────────
const BookCircleMain: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    currentUser,
    isAuthenticated,
    requireAuth,
    isOnboardingOpen,
    dismissOnboarding,
    setIsAuthModalOpen,
    logout,
    wishlist,
    toggleWishlist,
  } = useAuth();

  const { exchanges, actionRequiredTotal, createBorrowRequest, createGiftClaim } = useExchanges();
  const { openFloatingChat, totalUnreadCount, conversations } = useMessaging();
  const { isAdminReviewOpen, closeAdminReview } = useWriter();

  const handleOpenFloatingChat = (name: string, bookTitle?: string) => {
    openFloatingChat(name, bookTitle);
  };

  // Scroll to top upon route change and safely unlock body scroll if no dialogs remain
  useEffect(() => {
    const hasModalInDom = Boolean(
      document.querySelector('[role="dialog"], [role="alertdialog"]')
    );
    if (!hasModalInDom) {
      forceResetBodyScroll();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Handle legacy ?tab= query parameters and redirect to clean routes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      const target =
        tabParam === 'home'
          ? '/'
          : tabParam === 'books'
          ? '/books'
          : tabParam === 'my-books'
          ? '/my-books'
          : tabParam === 'activity' || tabParam === 'requests'
          ? '/activity'
          : tabParam === 'messages'
          ? '/messages'
          : tabParam === 'readers'
          ? '/readers'
          : tabParam === 'profile'
          ? '/profile'
          : `/${tabParam}`;
      navigate(target, { replace: true });
    }
  }, [navigate]);

  // Active tab derived from route path
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '') return 'home';
    if (path === '/books') return 'books';
    if (path === '/my-books') return 'my-books';
    if (path === '/activity' || path === '/requests') return 'activity';
    if (path === '/messages') return 'messages';
    if (path === '/profile') return 'profile';
    if (path === '/readers') return 'readers';
    if (path === '/settings') return 'settings';
    if (path === '/who-we-are' || path === '/how-it-works') return 'who-we-are';
    return '';
  }, [location.pathname]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRadius, setSelectedRadius] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('bookcircle_user_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.radius && ['Nearby', 'Within 5km', 'Within 10km', 'Any distance'].includes(parsed.radius)) {
          return parsed.radius;
        }
      }
    } catch (e) {
      // fallback
    }
    return 'Nearby';
  });
  const [selectedChatParticipant, setSelectedChatParticipant] = useState<string | null>(null);

  // Modals & Drawers state
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState<boolean>(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState<boolean>(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);
  const [selectedBorrowBook, setSelectedBorrowBook] = useState<Book | null>(null);
  const [selectedClaimBook, setSelectedClaimBook] = useState<Book | null>(null);
  const [isGlobalAddBookOpen, setIsGlobalAddBookOpen] = useState<boolean>(false);
  const [addBookInitialData, setAddBookInitialData] = useState<{
    title?: string;
    author?: string;
    catalogId?: string;
    coverImage?: string;
    category?: BookCategory;
  } | null>(null);

  const handleOpenAddBook = (initial?: {
    title?: string;
    author?: string;
    catalogId?: string;
    coverImage?: string;
    category?: any;
  }) => {
    setAddBookInitialData(initial || null);
    setIsGlobalAddBookOpen(true);
  };
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  // Dynamic books collection with live availability tracking
  const [booksList, setBooksList] = useState<Book[]>(mockBooks);
  const [readersList, setReadersList] = useState<Reader[]>(mockReaders);
  const authorsList = useMemo(() => getAllAuthors(), []);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Load live books and readers from database (Supabase) if available, with graceful fallback to mock data
  useEffect(() => {
    Promise.all([
      dbService.getBooks().then((books) => {
        if (books && books.length > 0) {
          setBooksList(books);
        }
      }),
      dbService.getReaders().then((readers) => {
        if (readers && readers.length > 0) {
          setReadersList(readers);
        }
      })
    ]).finally(() => {
      setIsInitialLoading(false);
    });
  }, []);

  // Derive live borrowable/claimable book counts per reader from booksList (single source of truth)
  // Strictly excludes 'personal' (unavailable showcase) and 'lent_out'/'claimed' copies
  const syncedReadersList = useMemo(() => {
    return readersList.map((reader) => {
      if (reader.id.startsWith('reader-')) {
        return reader;
      }

      const readerNameNormalized = reader.name.toLowerCase().trim();
      const readerIdNormalized = (reader.id || '').toLowerCase().trim();

      const ownedBooks = booksList.filter((book) => {
        const ownerNormalized = (book.ownerName || '').toLowerCase().trim();
        const ownerIdNormalized = (book.ownerId || '').toLowerCase().trim();
        const isOwner =
          (readerIdNormalized && ownerIdNormalized && ownerIdNormalized === readerIdNormalized) ||
          (readerNameNormalized && ownerNormalized === readerNameNormalized);

        if (!isOwner) return false;
        if (
          book.status === 'claimed' ||
          (book.description && book.description.includes('[STRICTLY_PRIVATE]'))
        ) {
          return false;
        }
        return true;
      });

      const booksForLending = ownedBooks.filter(
        (b) => (b.availabilityMode === 'lending' || !b.availabilityMode) && b.status === 'available'
      ).length;

      const booksForDonation = ownedBooks.filter(
        (b) => (b.availabilityMode === 'donation' || b.status === 'donation') && b.status !== 'claimed'
      ).length;

      const lentOutCount = ownedBooks.filter((b) => b.status === 'lent_out').length;
      const booksAvailable = booksForLending + booksForDonation;

      const isCurrentUser = Boolean(
        currentUser?.id && reader.id.toLowerCase() === currentUser.id.toLowerCase()
      );

      return {
        ...reader,
        name: isCurrentUser && currentUser?.displayName ? currentUser.displayName : reader.name,
        avatar: isCurrentUser ? currentUser!.avatar : reader.avatar,
        location: isCurrentUser && currentUser?.location ? currentUser.location : reader.location,
        bio: isCurrentUser && currentUser?.bio !== undefined ? currentUser.bio : reader.bio,
        booksAvailable,
        booksForLending,
        booksForDonation,
        lentOutCount,
      };
    });
  }, [readersList, booksList, currentUser]);

  // Enrich book ownerAvatar and ownerName from syncedReadersList so profile photo updates reflect everywhere
  const syncedBooksList = useMemo(() => {
    return booksList.map((book) => {
      const ownerIdNorm = (book.ownerId || '').toLowerCase().trim();
      const ownerNameNorm = (book.ownerName || '').toLowerCase().trim();
      const matchedReader = syncedReadersList.find(
        (r) =>
          (ownerIdNorm && r.id.toLowerCase() === ownerIdNorm) ||
          (ownerNameNorm && r.name.toLowerCase().trim() === ownerNameNorm)
      );

      if (!matchedReader) return book;

      return {
        ...book,
        ownerName: matchedReader.name || book.ownerName,
        ownerAvatar: matchedReader.avatar,
      };
    });
  }, [booksList, syncedReadersList]);

  // Public discovery books: strictly For Lending & For Donation (excludes Personal Bookshelf & claimed gifts)
  const discoveryBooksList = useMemo(() => {
    return syncedBooksList.filter(isPublicDiscoveryBook);
  }, [syncedBooksList]);

  // Read notification IDs stored in localStorage per user
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    try {
      const key = `bc_read_notifs_${currentUser?.id || 'guest'}`;
      const saved = localStorage.getItem(key);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Re-sync read notifications when user account changes
  useEffect(() => {
    try {
      const key = `bc_read_notifs_${currentUser?.id || 'guest'}`;
      const saved = localStorage.getItem(key);
      setReadNotificationIds(saved ? new Set(JSON.parse(saved)) : new Set<string>());
    } catch {
      setReadNotificationIds(new Set<string>());
    }
  }, [currentUser?.id]);

  // Dynamically derived notifications from live exchanges and active chat conversations
  const notifications: NotificationItem[] = useMemo(() => {
    if (!isAuthenticated) return [];

    const list: NotificationItem[] = [];

    // 1. Live Exchange Notifications from Supabase
    (exchanges || []).forEach((e) => {
      const isOwner =
        (e.ownerId && e.ownerId === currentUser?.id) ||
        (currentUser?.displayName && e.ownerName?.toLowerCase().trim() === currentUser.displayName.toLowerCase().trim());

      const isBorrower =
        (e.borrowerId && e.borrowerId === currentUser?.id) ||
        (currentUser?.displayName && e.borrowerName?.toLowerCase().trim() === currentUser.displayName.toLowerCase().trim());

      // Incoming request waiting for owner approval
      if (isOwner && (e.status === 'pending_approval' || e.status === 'pending_claim')) {
        const notifId = `req-${e.id}`;
        list.push({
          id: notifId,
          sender: e.borrowerName || 'Community Reader',
          avatar: cleanAvatarUrl(e.borrowerAvatar),
          action: e.exchangeType === 'gift' ? 'wants to claim' : 'wants to borrow',
          book: e.bookTitle,
          time: e.requestDate || 'Recently',
          type: 'request',
          unread: !readNotificationIds.has(notifId),
          targetTab: 'activity',
        });
      }

      // Requester notification when owner approves request
      if (isBorrower && e.status === 'accepted') {
        const notifId = `acc-${e.id}`;
        list.push({
          id: notifId,
          sender: e.ownerName || 'Book Owner',
          avatar: cleanAvatarUrl(e.ownerAvatar),
          action: 'approved your request for',
          book: e.bookTitle,
          time: e.meetupDate || 'Recently',
          type: 'approved',
          unread: !readNotificationIds.has(notifId),
          targetTab: 'activity',
        });
      }

      // Active loan notification
      if ((isOwner || isBorrower) && e.status === 'active_loan') {
        const notifId = `loan-${e.id}`;
        const partnerName = isOwner ? e.borrowerName : e.ownerName;
        const partnerAvatar = isOwner ? e.borrowerAvatar : e.ownerAvatar;
        list.push({
          id: notifId,
          sender: partnerName || 'Neighbor',
          avatar: cleanAvatarUrl(partnerAvatar),
          action: 'handover completed for',
          book: e.bookTitle,
          time: 'Active Loan',
          type: 'meetup',
          unread: !readNotificationIds.has(notifId),
          targetTab: 'activity',
        });
      }
    });

    // 2. Unread Chat Messages
    (conversations || []).forEach((c) => {
      if (c.unreadCount && c.unreadCount > 0) {
        const notifId = `msg-${c.id}-${c.lastMessageTime || ''}`;
        list.push({
          id: notifId,
          sender: c.participantName,
          avatar: cleanAvatarUrl(c.participantAvatar),
          action: 'sent you a message about',
          book: c.bookTitle || 'Book',
          time: c.lastMessageTime || 'Recently',
          type: 'message',
          unread: !readNotificationIds.has(notifId),
          targetTab: 'messages',
        });
      }
    });

    return list;
  }, [isAuthenticated, exchanges, currentUser, conversations, readNotificationIds]);

  const categories = ['All', 'Fiction', 'Non-fiction', 'Science', 'History', 'Poetry'];

  // Filter books based on category and search query for homepage (public discovery only)
  const filteredBooks = useMemo(() => {
    return discoveryBooksList.filter((book) => {
      const matchesCategory =
        selectedCategory === 'All' || book.category.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.ownerName.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [discoveryBooksList, selectedCategory, searchQuery]);

  const handleSelectBook = (book: Book) => {
    navigate(`/book/${book.id}`);
  };

  const handleSelectAuthor = (authorNameOrSlug: string, authorId?: string) => {
    const slug = authorId || generateAuthorSlug(authorNameOrSlug);
    navigate(`/author/${encodeURIComponent(slug)}`);
  };

  const handleBrowseReader = (reader: Reader) => {
    navigate(`/reader/${encodeURIComponent(reader.id || reader.name)}`);
  };

  const handleSelectOwner = (ownerName: string) => {
    navigate(`/reader/${encodeURIComponent(ownerName)}`);
  };

  const handleTabChange = (tab: string) => {
    const targetPath =
      tab === 'home'
        ? '/'
        : tab === 'books'
        ? '/books'
        : tab === 'my-books'
        ? '/my-books'
        : tab === 'activity' || tab === 'requests'
        ? '/activity'
        : tab === 'messages'
        ? '/messages'
        : tab === 'profile'
        ? '/profile'
        : tab === 'readers'
        ? '/readers'
        : tab === 'settings'
        ? '/settings'
        : tab === 'who-we-are' || tab === 'how-it-works'
        ? '/who-we-are'
        : `/${tab}`;

    if (
      tab !== 'home' &&
      tab !== 'books' &&
      tab !== 'readers' &&
      tab !== 'settings' &&
      tab !== 'my-books' &&
      tab !== 'activity' &&
      tab !== 'who-we-are' &&
      tab !== 'how-it-works' &&
      !isAuthenticated
    ) {
      requireAuth({
        title: 'Sign In Required',
        message: 'Sign in to access your personal shelf, incoming requests, and neighbor conversations.',
        targetAction: tab as any,
        onAuthorized: () => {
          navigate(targetPath);
        },
      });
      return;
    }
    navigate(targetPath);
  };

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false);
    await logout();
    navigate('/');
    setGlobalToast('You have been signed out. You can continue exploring BookCircle as a guest.');
    setTimeout(() => setGlobalToast(null), 4000);
  };

  const handleQuickBorrow = (book: Book) => {
    const isDonation = book.availabilityMode === 'donation' || book.status === 'donation';

    if (isDonation) {
      requireAuth({
        title: 'Sign In to Claim Free Gift',
        message: `Sign in or join BookCircle to claim "${book.title}" as a free community gift from ${book.ownerName}.`,
        targetAction: 'claim',
        bookTitle: book.title,
        ownerName: book.ownerName,
        onAuthorized: () => setSelectedClaimBook(book),
      });
    } else {
      requireAuth({
        title: 'Sign In to Borrow',
        message: `Sign in or join BookCircle to borrow "${book.title}" from ${book.ownerName}.`,
        targetAction: 'borrow',
        bookTitle: book.title,
        ownerName: book.ownerName,
        onAuthorized: () => setSelectedBorrowBook(book),
      });
    }
  };

  const handleDetailsRequestBorrow = (b: Book, owner?: string) => {
    const ownerName = owner || b.ownerName;
    const isDonation = b.availabilityMode === 'donation' || b.status === 'donation';

    if (isDonation) {
      requireAuth({
        title: 'Sign In to Claim Free Gift',
        message: `Connect with ${ownerName} to collect "${b.title}" as a free community gift to keep forever.`,
        targetAction: 'claim',
        bookTitle: b.title,
        ownerName,
        onAuthorized: () => setSelectedClaimBook(owner ? { ...b, ownerName } : b),
      });
    } else {
      requireAuth({
        title: 'Sign In to Request Book',
        message: `Connect with ${ownerName} to arrange a friendly community meetup for "${b.title}".`,
        targetAction: 'borrow',
        bookTitle: b.title,
        ownerName,
        onAuthorized: () => setSelectedBorrowBook(owner ? { ...b, ownerName } : b),
      });
    }
  };

  const handleClaimSubmitted = (details: ClaimGiftDetails) => {
    // 1. Mark book as 'claimed' in booksList
    setBooksList((prev) =>
      prev.map((b) => (b.id === details.book.id ? { ...b, status: 'claimed' } : b))
    );

    const resolvedOwnerId =
      details.owner.id && details.owner.id !== 'owner-target'
        ? details.owner.id
        : details.book.ownerId || details.owner.id;

    // 2. Persist to ExchangeContext & DB
    createGiftClaim({
      book: details.book,
      owner: {
        ...details.owner,
        id: resolvedOwnerId,
      },
      borrower: {
        id: currentUser?.id || 'demo-user',
        name: currentUser?.displayName || 'Maya Lin',
        avatar: cleanAvatarUrl(currentUser?.avatar),
      },
      date: details.date,
      time: details.time,
      spot: details.spot,
      note:
        details.note?.trim() ||
        `Hi ${details.owner?.name || 'there'}, thank you so much for offering this book as a community gift! Looking forward to meeting you.`,
    });

    // 3. Trigger celebration toast for claiming a free gift
    setGlobalToast(
      `🎁 Free Gift Claimed! Meetup with ${details.owner.name} scheduled for ${details.date} at ${details.time}. It is yours to keep forever!`
    );
    setTimeout(() => setGlobalToast(null), 5000);
  };

  const handleBorrowSubmitted = (details: BorrowHandoverDetails) => {
    // 1. Mark book as 'lent_out' in booksList
    setBooksList((prev) =>
      prev.map((b) => (b.id === details.book.id ? { ...b, status: 'lent_out' } : b))
    );

    const resolvedOwnerId =
      details.owner.id && details.owner.id !== 'owner-target'
        ? details.owner.id
        : details.book.ownerId || details.owner.id;

    // 2. Persist to ExchangeContext & DB
    createBorrowRequest({
      book: details.book,
      owner: {
        ...details.owner,
        id: resolvedOwnerId,
      },
      borrower: {
        id: currentUser?.id || 'demo-user',
        name: currentUser?.displayName || 'Maya Lin',
        avatar: cleanAvatarUrl(currentUser?.avatar),
      },
      date: details.date,
      time: details.time,
      spot: details.spot,
      note:
        details.note?.trim() ||
        `Hi ${details.owner?.name || 'there'}, thank you so much for offering this book as a community gift! Looking forward to meeting you.`,
    });

    // 3. Trigger friendly confirmation toast
    setGlobalToast(
      `🎉 Borrow Request Sent! Meetup scheduled with ${details.owner.name} on ${details.date} at ${details.time}.`
    );
    setTimeout(() => setGlobalToast(null), 5000);
  };

  const handleSimulateReturn = (book: Book) => {
    setBooksList((prev) =>
      prev.map((b) => (b.id === book.id ? { ...b, status: 'available' } : b))
    );

    setGlobalToast(`📖 "${book.title}" was marked as returned! It is now available for new readers.`);
    setTimeout(() => setGlobalToast(null), 4000);
  };

  const handleFloatingAddBook = () => {
    requireAuth({
      title: 'Sign In to Share Books',
      message: 'Join BookCircle to lend or gift your physical books to neighbors and build community trust.',
      targetAction: 'add-book',
      onAuthorized: () => setIsGlobalAddBookOpen(true),
    });
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Persist read status in localStorage per user
    const key = `bc_read_notifs_${currentUser?.id || 'guest'}`;
    const newSet = new Set(readNotificationIds);
    newSet.add(String(item.id));
    setReadNotificationIds(newSet);
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(newSet)));
    } catch (e) {
      console.warn('Failed to save read notification to localStorage:', e);
    }

    if (item.type === 'message') {
      setSelectedChatParticipant(item.sender);
      navigate(`/messages?chat=${encodeURIComponent(item.sender)}`);
    } else if (item.type === 'wishlist_available' || item.targetTab === 'book-details') {
      const found = booksList.find(
        (b) => b.id === item.bookId || b.title.toLowerCase() === item.book.toLowerCase()
      );
      if (found) {
        navigate(`/book/${found.id}`);
        return;
      }
    } else if (item.targetTab) {
      handleTabChange(item.targetTab);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    const key = `bc_read_notifs_${currentUser?.id || 'guest'}`;
    const newSet = new Set(readNotificationIds);
    notifications.forEach((n) => newSet.add(String(n.id)));
    setReadNotificationIds(newSet);
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(newSet)));
    } catch (e) {
      console.warn('Failed to save read notifications to localStorage:', e);
    }
  };

  const handleGlobalBookAdded = async (newBook: any) => {
    if (newBook?.title && newBook?.author) {
      const added = await dbService.addBook(
        {
          catalogId: newBook.catalogId,
          title: newBook.title,
          author: newBook.author,
          coverImage:
            newBook.coverImage ||
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
          category: newBook.category || 'Fiction',
          status: newBook.availability === 'donation' ? 'donation' : 'available',
          availabilityMode: newBook.availability || 'lending',
          condition: newBook.condition || 'Like New',
          bookType: newBook.bookType || 'Original Copy',
          bookClassification: newBook.bookClassification || 'general',
          generalType: newBook.generalType || 'original',
          translator: newBook.translator,
          translationLanguage: newBook.translationLanguage,
          edition: newBook.edition,
          educationLevel: newBook.educationLevel,
          academicMetadata: newBook.academicMetadata,
          description: newBook.description || '',
          rating: 4.8,
          reviewsCount: 1,
          distance: '0.1 km',
          ownersCount: 1,
          ownerName: currentUser?.displayName || 'You',
          ownerAvatar: sanitizeEmbeddedImageUrl(cleanAvatarUrl(currentUser?.avatar), 16000),
          ownerTrust: 'Verified Lender',
        },
        currentUser?.id || 'demo-user'
      );
      setBooksList((prev) => [added, ...prev]);
    }

    const statusLabel =
      newBook.availability === 'personal'
        ? 'Personal Bookshelf'
        : newBook.availability === 'donation'
        ? 'For Donation'
        : 'For Lending';

    setGlobalToast(
      `“${newBook.title}” was added to your shelf as ${statusLabel}!`
    );
    setTimeout(() => setGlobalToast(null), 5000);
  };

  const handleUpdateBookStatus = async (
    bookId: string,
    newMode: 'lending' | 'donation' | 'personal'
  ) => {
    // 1. Optimistically update local booksList state
    setBooksList((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? {
              ...b,
              availabilityMode: newMode,
              status: newMode === 'donation' ? 'donation' : 'available',
            }
          : b
      )
    );

    // 2. Persist to Supabase if configured
    try {
      await dbService.updateBookStatus(bookId, newMode);
    } catch (e) {
      console.warn('Could not update book status in database:', e);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    // 1. Optimistically remove from local booksList state
    setBooksList((prev) => prev.filter((b) => b.id !== bookId));

    // 2. Delete from Supabase if configured
    try {
      await dbService.deleteBook(bookId);
    } catch (e) {
      console.warn('Could not delete book from database:', e);
    }
  };

  // Derive current user's personal shelf books
  const currentUserShelfBooks = useMemo(() => {
    if (!currentUser) return [];
    return syncedBooksList.filter((b) => {
      if (b.ownerId && currentUser.id && b.ownerId === currentUser.id) {
        return true;
      }
      if (currentUser.displayName && b.ownerName) {
        if (b.ownerName.toLowerCase().trim() === currentUser.displayName.toLowerCase().trim()) {
          return true;
        }
      }
      return b.ownerName === 'You';
    });
  }, [syncedBooksList, currentUser]);

  const unreadNotificationsCount = isAuthenticated ? notifications.filter((n) => n.unread).length : 0;
  const isMessagesActive = location.pathname === '/messages';
  const isDetailPage =
    location.pathname.startsWith('/book/') || location.pathname.startsWith('/reader/');

  return (
    <div
      className={`${
        isMessagesActive ? 'h-screen md:h-[100dvh] overflow-hidden' : 'min-h-screen'
      } bg-cream flex flex-col font-sans selection:bg-brand selection:text-white`}
    >
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenCoffeeModal={() => setIsCoffeeModalOpen(true)}
        onOpenSettings={() => navigate('/settings')}
        onRequestLogout={() => setIsLogoutDialogOpen(true)}
        onOpenWishlistModal={() => setIsWishlistModalOpen(true)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        unreadCount={unreadNotificationsCount}
        activityBadgeCount={isAuthenticated ? actionRequiredTotal : 0}
        unreadMessagesCount={isAuthenticated ? totalUnreadCount : 0}
      />

      {/* Global Toast Message */}
      {globalToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white text-xs sm:text-sm font-medium shadow-2xl border border-slate-700/60 animate-in fade-in slide-in-from-top-4 flex items-center gap-2 max-w-md text-center">
          <span>✨</span>
          <span>{globalToast}</span>
        </div>
      )}

      {/* Main Container */}
      <main
        className={`flex-1 max-w-[1248px] w-full mx-auto ${
          isMessagesActive
            ? 'min-h-0 flex flex-col overflow-hidden px-0 sm:px-6 pb-16 md:pb-3.5'
            : 'px-4 sm:px-6 pb-28 sm:pb-24 md:pb-0'
        }`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeaderSection
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedRadius={selectedRadius}
                  setSelectedRadius={setSelectedRadius}
                />
                <CategoryPills
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
                <BooksSection
                  books={filteredBooks}
                  onSelectBook={handleSelectBook}
                  onSelectAuthor={handleSelectAuthor}
                  onQuickBorrow={handleQuickBorrow}
                  onSelectOwner={handleSelectOwner}
                  onSeeAll={() => navigate('/books')}
                  selectedRadius={selectedRadius}
                />
                <WritersSection
                  books={discoveryBooksList}
                  onSelectAuthor={handleSelectAuthor}
                  onSeeAll={() => navigate('/authors')}
                />
                <ReadersSection
                  readers={syncedReadersList}
                  onBrowseShelf={handleBrowseReader}
                  onSeeAll={() => navigate('/readers')}
                  maxDisplay={5}
                />
              </>
            }
          />

          <Route
            path="/books"
            element={
              <BooksBrowsePage
                books={discoveryBooksList}
                onSelectBook={handleSelectBook}
                onSelectAuthor={handleSelectAuthor}
                onQuickBorrow={handleQuickBorrow}
                onSelectOwner={handleSelectOwner}
              />
            }
          />

          <Route
            path="/book/:bookId"
            element={
              <BookDetailsRoute
                booksList={syncedBooksList}
                isInitialLoading={isInitialLoading}
                onRequestBorrow={handleDetailsRequestBorrow}
                onSelectOwner={handleSelectOwner}
                onSelectAuthor={handleSelectAuthor}
                onSimulateReturn={handleSimulateReturn}
                onOpenAddBook={handleOpenAddBook}
              />
            }
          />

          <Route
            path="/book/:bookId/reviews"
            element={
              <BookReviewsRoute
                booksList={syncedBooksList}
                isInitialLoading={isInitialLoading}
                onSelectAuthor={handleSelectAuthor}
              />
            }
          />

          <Route
            path="/author/:authorId"
            element={
              <AuthorProfileRoute
                booksList={discoveryBooksList}
                onSelectBook={handleSelectBook}
                onSelectAuthor={handleSelectAuthor}
                onSelectOwner={handleSelectOwner}
                onQuickBorrow={handleQuickBorrow}
                onOpenAddBook={handleOpenAddBook}
              />
            }
          />

          <Route
            path="/my-books"
            element={
              <MyBooksPage
                key="my-books-shelf"
                initialSubTab="shelf"
                myBooks={currentUserShelfBooks}
                onSelectAuthor={handleSelectAuthor}
                onUpdateBookStatus={handleUpdateBookStatus}
                onDeleteBook={handleDeleteBook}
                onBookAdded={handleGlobalBookAdded}
                onNavigateToMessages={(name, bookTitle) => {
                  handleOpenFloatingChat(name, bookTitle);
                }}
              />
            }
          />

          <Route
            path="/activity"
            element={
              <ActivityPage
                onNavigateToMessages={(name, bookTitle) => {
                  handleOpenFloatingChat(name, bookTitle);
                }}
                onOpenAddBook={() => setIsGlobalAddBookOpen(true)}
              />
            }
          />

          {/* Backward compatibility: redirect /requests to /activity */}
          <Route
            path="/requests"
            element={
              <ActivityPage
                initialTab="lending"
                onNavigateToMessages={(name, bookTitle) => {
                  handleOpenFloatingChat(name, bookTitle);
                }}
                onOpenAddBook={() => setIsGlobalAddBookOpen(true)}
              />
            }
          />

          <Route
            path="/messages"
            element={
              <MessagesRoute
                booksList={syncedBooksList}
                selectedChatParticipant={selectedChatParticipant}
                onSelectBook={handleSelectBook}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <UserProfileRoute
                booksList={discoveryBooksList}
                currentUserShelfBooks={currentUserShelfBooks}
                onSelectBook={handleSelectBook}
                onSelectAuthor={handleSelectAuthor}
                onSelectOwner={handleSelectOwner}
                onQuickBorrow={handleQuickBorrow}
                onOpenAddBook={handleOpenAddBook}
              />
            }
          />

          <Route
            path="/settings"
            element={
              <SettingsPage
                onBack={() => navigate(-1)}
                onRadiusChange={(r) => setSelectedRadius(r)}
              />
            }
          />

          <Route
            path="/readers"
            element={
              <ReadersBrowsePage
                readers={syncedReadersList}
                onBrowseShelf={handleBrowseReader}
              />
            }
          />

          <Route
            path="/authors"
            element={
              <WritersBrowsePage
                authors={authorsList}
                books={discoveryBooksList}
                onSelectAuthor={handleSelectAuthor}
                onBack={() => navigate('/')}
              />
            }
          />

          <Route
            path="/writers"
            element={<Navigate to="/authors" replace />}
          />

          <Route
            path="/reader/:readerId"
            element={
              <ReaderProfileRoute
                readersList={syncedReadersList}
                booksList={syncedBooksList}
                onSelectBook={handleSelectBook}
                onSelectAuthor={handleSelectAuthor}
                onRequestBorrow={handleDetailsRequestBorrow}
                onSendMessage={(name) => {
                  handleOpenFloatingChat(name);
                }}
              />
            }
          />

          <Route
            path="/who-we-are"
            element={
              <WhoWeArePage
                onExploreBooks={() => navigate('/books')}
                onSupportMission={() => setIsCoffeeModalOpen(true)}
                onGoHome={() => navigate('/')}
              />
            }
          />
          <Route path="/how-it-works" element={<Navigate to="/who-we-are" replace />} />

          <Route
            path="/admin/writers"
            element={
              <div className="py-12 px-4 max-w-4xl mx-auto text-center">
                <AdminWriterReviewModal
                  isOpen={true}
                  onClose={() => navigate('/')}
                />
              </div>
            }
          />

          <Route
            path="*"
            element={
              <NotFoundPage
                onGoHome={() => navigate('/')}
                onGoReaders={() => navigate('/readers')}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer — desktop only, hidden on messages or full detail/profile views */}
      {!isMessagesActive && !isDetailPage && (
        <footer className="hidden md:block border-t border-slate-200/80 bg-white/60 py-6 mt-auto">
          <div className="max-w-[1248px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center text-white">
                <HugeiconsIcon icon={BookOpen01Icon} size={14} />
              </div>
              <span className="font-serif font-semibold text-slate-700 text-sm">BookCircle</span>
              <span>· Connecting local readers, one book at a time.</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/who-we-are')}
                className="hover:text-brand transition"
              >
                Who We Are
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setIsCoffeeModalOpen(true)}
                className="hover:text-brand flex items-center gap-1 transition"
              >
                <HugeiconsIcon icon={FavouriteIcon} size={13} className="text-red-500 fill-red-500" />
                <span>Support Community</span>
              </button>
              <span className="text-slate-300">|</span>
              <span>© 2026 BookCircle. All rights reserved.</span>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileNavBar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        unreadMessages={isAuthenticated ? totalUnreadCount : 0}
        activityBadgeCount={isAuthenticated ? actionRequiredTotal : 0}
      />

      {/* First-Visit Dismissible Onboarding Modal */}
      <WelcomeOnboardingModal
        isOpen={isOnboardingOpen}
        onExplore={() => dismissOnboarding(true)}
        onGetStarted={() => {
          dismissOnboarding(true);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Unified Authentication Modal (Google & WhatsApp Phone OTP) */}
      <AuthModal />

      {/* First-time Profile Setup Modal */}
      <ProfileSetupModal />

      {/* Interactive Support / Coffee Modal */}
      <CoffeeModal isOpen={isCoffeeModalOpen} onClose={() => setIsCoffeeModalOpen(false)} />

      {/* Borrow Handover Wizard Modal (Exclusively for lending & 30-day loans) */}
      <BorrowWizardModal
        isOpen={!!selectedBorrowBook}
        book={selectedBorrowBook}
        initialOwnerName={selectedBorrowBook?.ownerName}
        targetOwnerId={selectedBorrowBook?.ownerId}
        onClose={() => setSelectedBorrowBook(null)}
        onRequestSubmitted={handleBorrowSubmitted}
      />

      {/* Free Gift Claim Modal (Exclusively for permanent community gifts) */}
      <ClaimGiftModal
        isOpen={!!selectedClaimBook}
        book={selectedClaimBook}
        initialOwnerName={selectedClaimBook?.ownerName}
        targetOwnerId={selectedClaimBook?.ownerId}
        onClose={() => setSelectedClaimBook(null)}
        onClaimSubmitted={handleClaimSubmitted}
      />

      {/* Floating "+ Add Book" Button (Responsive across mobile, tablet, desktop) */}
      <FloatingAddBookButton
        onClick={handleFloatingAddBook}
        isMessagesActive={isMessagesActive}
      />

      {/* Contextual Floating Chat Widget */}
      <FloatingChatWidget />

      {/* Global Add Book Modal */}
      <AddBookModal
        isOpen={isGlobalAddBookOpen}
        onClose={() => {
          setIsGlobalAddBookOpen(false);
          setAddBookInitialData(null);
        }}
        initialBook={addBookInitialData}
        onBookAdded={handleGlobalBookAdded}
      />


      {/* Writer Onboarding Modal */}
      <WriterOnboardingModal />

      {/* Writer Dashboard Modal */}
      <WriterDashboardModal
        booksList={discoveryBooksList}
        onNavigateToAuthorProfile={(authorSlug) => navigate(`/author/${authorSlug}`)}
      />

      {/* Admin Writer Review Modal */}
      <AdminWriterReviewModal
        isOpen={isAdminReviewOpen}
        onClose={closeAdminReview}
      />

      {/* Wishlist & Return Alerts Modal */}
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        wishlistBookIds={wishlist}
        allBooks={syncedBooksList}
        onSelectBook={(book) => {
          setIsWishlistModalOpen(false);
          handleSelectBook(book);
        }}
        onSelectAuthor={handleSelectAuthor}
        onRequestBorrow={(book, ownerName) => {
          handleDetailsRequestBorrow(book, ownerName);
        }}
        onRemoveWishlist={(bookId) => {
          toggleWishlist(bookId);
        }}
        onSimulateReturn={handleSimulateReturn}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      />

      {/* Scroll To Top Button (Positioned above floating Add Book button, never overlapping) */}
      <ScrollToTop isMessagesActive={isMessagesActive} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WriterProvider>
        <ExchangeProvider>
          <MessagingProvider>
            <BookCircleMain />
          </MessagingProvider>
        </ExchangeProvider>
      </WriterProvider>
    </AuthProvider>
  );
};

export default App;
