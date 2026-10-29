import React, { useState, useMemo, useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeaderSection } from './components/HeaderSection';
import { CategoryPills } from './components/CategoryPills';
import { BooksSection } from './components/BooksSection';
import { ReadersSection } from './components/ReadersSection';
import { CoffeeModal } from './components/CoffeeModal';
import { BorrowWizardModal, type BorrowHandoverDetails } from './components/borrow/BorrowWizardModal';
import { ClaimGiftModal, type ClaimGiftDetails } from './components/borrow/ClaimGiftModal';
import { AddBookModal } from './components/mybooks/AddBookModal';
import { FloatingAddBookButton } from './components/FloatingAddBookButton';
import { dbService } from './services/dbService';
import type { NotificationItem } from './components/NotificationDropdown';
import { MyBooksPage } from './components/mybooks/MyBooksPage';
import { BookDetailsPage } from './components/bookdetails/BookDetailsPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { PublicProfilePage } from './components/profile/PublicProfilePage';
import { WishlistModal } from './components/profile/WishlistModal';
import { InboxPage } from './components/inbox/InboxPage';
import { SettingsModal } from './components/SettingsModal';
import { LogoutConfirmDialog } from './components/LogoutConfirmDialog';
import { MobileNavBar } from './components/MobileNavBar';
import { WelcomeOnboardingModal } from './components/onboarding/WelcomeOnboardingModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal';
import { ReadersBrowsePage } from './components/readers/ReadersBrowsePage';
import { BooksBrowsePage } from './components/books/BooksBrowsePage';
import { NotFoundPage } from './components/NotFoundPage';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AuthProvider, useAuth } from './context/AuthContext';
import { mockBooks, mockReaders } from './data/mockData';
import type { Book, Reader } from './types';
import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, FavouriteIcon } from '@hugeicons/core-free-icons';

// ─── BOOK DETAILS ROUTE WRAPPER ───────────────────────────────────────
const BookDetailsRoute: React.FC<{
  booksList: Book[];
  onRequestBorrow: (b: Book, owner?: string) => void;
  onSelectOwner: (ownerName: string) => void;
  onSimulateReturn: (b: Book) => void;
}> = ({ booksList, onRequestBorrow, onSelectOwner, onSimulateReturn }) => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const book = useMemo(() => {
    if (!bookId) return null;
    return (
      booksList.find(
        (b) =>
          b.id === bookId ||
          b.catalogId === bookId ||
          b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === bookId.toLowerCase()
      ) || null
    );
  }, [booksList, bookId]);

  if (!book) {
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
      onRequestBorrow={onRequestBorrow}
      onSelectOwner={onSelectOwner}
      onSimulateReturn={onSimulateReturn}
    />
  );
};

// ─── READER PROFILE ROUTE WRAPPER ─────────────────────────────────────
const ReaderProfileRoute: React.FC<{
  readersList: Reader[];
  booksList: Book[];
  onSelectBook: (book: Book) => void;
  onRequestBorrow: (b: Book, owner?: string) => void;
  onSendMessage: (ownerName: string) => void;
}> = ({ readersList, booksList, onSelectBook, onRequestBorrow, onSendMessage }) => {
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
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      distance: '1.2 km away',
      location: 'Local Neighborhood',
      memberSince: 'March 2026',
      booksAvailable: booksList.filter(
        (b) => b.ownerName.toLowerCase().trim() === decoded
      ).length,
      rating: 4.9,
      totalBorrows: 24,
      trustTier: 'Tier 4 · Highly Reliable',
      trustScore: '100% on schedule · 24/24 on time',
      bio: `Hi, I am ${decodeURIComponent(
        readerId
      )}. I love sharing books with my neighbors in BookCircle! Check out my lending and donation shelf below.`,
      favoriteGenres: ['All', 'Fiction', 'History', 'Science'],
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
      onRequestBorrow={onRequestBorrow}
      onSendMessage={onSendMessage}
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

  // Scroll to top upon route change
  useEffect(() => {
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
          : tabParam === 'requests'
          ? '/requests'
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
    if (path === '/requests') return 'requests';
    if (path === '/messages') return 'messages';
    if (path === '/profile') return 'profile';
    if (path === '/readers') return 'readers';
    return '';
  }, [location.pathname]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRadius, setSelectedRadius] = useState<string>('Within 5km');
  const [selectedChatParticipant, setSelectedChatParticipant] = useState<string | null>(null);

  // Modals & Drawers state
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState<boolean>(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);
  const [selectedBorrowBook, setSelectedBorrowBook] = useState<Book | null>(null);
  const [selectedClaimBook, setSelectedClaimBook] = useState<Book | null>(null);
  const [isGlobalAddBookOpen, setIsGlobalAddBookOpen] = useState<boolean>(false);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  // Dynamic books collection with live availability tracking
  const [booksList, setBooksList] = useState<Book[]>(mockBooks);
  const [readersList, setReadersList] = useState<Reader[]>(mockReaders);

  // Load live books and readers from database (Supabase) if available, with graceful fallback to mock data
  useEffect(() => {
    dbService.getBooks().then((books) => {
      if (books && books.length > 0) {
        setBooksList(books);
      }
    });
    dbService.getReaders().then((readers) => {
      if (readers && readers.length > 0) {
        setReadersList(readers);
      }
    });
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      sender: 'Hana Yamada',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      action: 'wants to borrow',
      book: 'Pachinko',
      time: '3 hours ago',
      type: 'request',
      unread: true,
      targetTab: 'requests',
    },
    {
      id: 'notif-2',
      sender: 'Diego Ramirez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      action: 'sent you a message about',
      book: 'The Overstory',
      time: '10:14 AM',
      type: 'message',
      unread: true,
      targetTab: 'messages',
    },
    {
      id: 'notif-3',
      sender: 'Jonas Meier',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      action: 'approved your request for',
      book: 'The Night Circus',
      time: '1 day ago',
      type: 'approved',
      unread: false,
      targetTab: 'my-books',
    },
    {
      id: 'notif-4',
      sender: 'Priya Shah',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      action: 'confirmed meetup at Riverside Coffee for',
      book: 'Sapiens',
      time: '3 days ago',
      type: 'meetup',
      unread: false,
      targetTab: 'requests',
    },
  ]);

  const categories = ['All', 'Fiction', 'Non-fiction', 'Science', 'History', 'Poetry'];

  // Filter books based on category and search query for homepage
  const filteredBooks = useMemo(() => {
    return booksList.filter((book) => {
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
  }, [booksList, selectedCategory, searchQuery]);

  const handleSelectBook = (book: Book) => {
    navigate(`/book/${book.id}`);
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
        : tab === 'requests'
        ? '/requests'
        : tab === 'messages'
        ? '/messages'
        : tab === 'profile'
        ? '/profile'
        : tab === 'readers'
        ? '/readers'
        : `/${tab}`;

    if (tab !== 'home' && tab !== 'books' && tab !== 'readers' && !isAuthenticated) {
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

    // 2. Persist to DB if connected
    dbService
      .createBorrowRequest({
        bookId: details.book.id,
        bookTitle: details.book.title,
        borrowerId: currentUser?.id,
        borrowerName: currentUser?.displayName || 'Community Reader',
        ownerId: details.owner.id,
        ownerName: details.owner.name,
        exchangeType: 'gift',
        meetupDate: details.date,
        meetupTime: details.time,
        meetupSpot: details.spot,
        message: details.note,
      })
      .catch(console.error);

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

    // 2. Persist to DB if connected
    dbService
      .createBorrowRequest({
        bookId: details.book.id,
        bookTitle: details.book.title,
        borrowerId: currentUser?.id,
        borrowerName: currentUser?.displayName || 'Community Reader',
        ownerId: details.owner.id,
        ownerName: details.owner.name,
        exchangeType: 'borrow',
        meetupDate: details.date,
        meetupTime: details.time,
        meetupSpot: details.spot,
        message: details.note,
      })
      .catch(console.error);

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
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
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleGlobalBookAdded = async (newBook: any) => {
    setIsGlobalAddBookOpen(false);
    if (newBook?.title && newBook?.author) {
      const added = await dbService.addBook(
        {
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
          description: newBook.description || '',
          rating: 4.8,
          reviewsCount: 1,
          distance: '0.1 km',
          ownersCount: 1,
          ownerName: currentUser?.displayName || 'You',
          ownerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          ownerTrust: 'Verified Lender',
        },
        currentUser?.id || 'demo-user'
      );
      setBooksList((prev) => [added, ...prev]);
    }

    const statusLabel =
      newBook.availability === 'personal'
        ? 'Private Collection'
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
    const list = booksList.filter((b) => {
      if (currentUser?.displayName) {
        if (b.ownerName.toLowerCase().trim() === currentUser.displayName.toLowerCase().trim()) {
          return true;
        }
      }
      return b.ownerName === 'You' || b.ownerName === 'Maya Lin';
    });
    return list.length > 0 ? list : booksList.slice(0, 4);
  }, [booksList, currentUser]);

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
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRequestLogout={() => setIsLogoutDialogOpen(true)}
        onOpenWishlistModal={() => setIsWishlistModalOpen(true)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        unreadCount={unreadNotificationsCount}
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
            ? 'min-h-0 flex flex-col overflow-hidden px-0 sm:px-4 md:px-6 pb-16 md:pb-3.5'
            : 'px-4 sm:px-6 pb-20 md:pb-0'
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
                  onQuickBorrow={handleQuickBorrow}
                  onSelectOwner={handleSelectOwner}
                  onSeeAll={() => navigate('/books')}
                  selectedRadius={selectedRadius}
                />
                <ReadersSection
                  readers={readersList}
                  onBrowseShelf={handleBrowseReader}
                  onSeeAll={() => navigate('/readers')}
                />
              </>
            }
          />

          <Route
            path="/books"
            element={
              <BooksBrowsePage
                books={booksList}
                onSelectBook={handleSelectBook}
                onQuickBorrow={handleQuickBorrow}
                onSelectOwner={handleSelectOwner}
              />
            }
          />

          <Route
            path="/book/:bookId"
            element={
              <BookDetailsRoute
                booksList={booksList}
                onRequestBorrow={handleDetailsRequestBorrow}
                onSelectOwner={handleSelectOwner}
                onSimulateReturn={handleSimulateReturn}
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
                onUpdateBookStatus={handleUpdateBookStatus}
                onDeleteBook={handleDeleteBook}
                onBookAdded={handleGlobalBookAdded}
                onNavigateToMessages={(name) => {
                  setSelectedChatParticipant(name);
                  navigate(`/messages?chat=${encodeURIComponent(name)}`);
                }}
              />
            }
          />

          <Route
            path="/requests"
            element={
              <MyBooksPage
                key="my-books-requests"
                initialSubTab="requests"
                myBooks={currentUserShelfBooks}
                onUpdateBookStatus={handleUpdateBookStatus}
                onDeleteBook={handleDeleteBook}
                onBookAdded={handleGlobalBookAdded}
                onNavigateToMessages={(name) => {
                  setSelectedChatParticipant(name);
                  navigate(`/messages?chat=${encodeURIComponent(name)}`);
                }}
              />
            }
          />

          <Route
            path="/messages"
            element={
              <MessagesRoute
                booksList={booksList}
                selectedChatParticipant={selectedChatParticipant}
                onSelectBook={handleSelectBook}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <ProfilePage
                onSelectBook={handleSelectBook}
                myBooks={currentUserShelfBooks}
              />
            }
          />

          <Route
            path="/readers"
            element={
              <ReadersBrowsePage
                readers={readersList}
                onBrowseShelf={handleBrowseReader}
              />
            }
          />

          <Route
            path="/reader/:readerId"
            element={
              <ReaderProfileRoute
                readersList={readersList}
                booksList={booksList}
                onSelectBook={handleSelectBook}
                onRequestBorrow={handleDetailsRequestBorrow}
                onSendMessage={(name) => {
                  setSelectedChatParticipant(name);
                  navigate(`/messages?chat=${encodeURIComponent(name)}`);
                }}
              />
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
        unreadMessages={isAuthenticated ? 1 : 0}
        pendingRequests={isAuthenticated ? 1 : 0}
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
        onClose={() => setSelectedBorrowBook(null)}
        onRequestSubmitted={handleBorrowSubmitted}
      />

      {/* Free Gift Claim Modal (Exclusively for permanent community gifts) */}
      <ClaimGiftModal
        isOpen={!!selectedClaimBook}
        book={selectedClaimBook}
        initialOwnerName={selectedClaimBook?.ownerName}
        onClose={() => setSelectedClaimBook(null)}
        onClaimSubmitted={handleClaimSubmitted}
      />

      {/* Floating "+ Add Book" Button (Responsive across mobile, tablet, desktop) */}
      <FloatingAddBookButton
        onClick={handleFloatingAddBook}
        isMessagesActive={isMessagesActive}
      />

      {/* Global Add Book Modal */}
      <AddBookModal
        isOpen={isGlobalAddBookOpen}
        onClose={() => setIsGlobalAddBookOpen(false)}
        onBookAdded={handleGlobalBookAdded}
      />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Wishlist & Return Alerts Modal */}
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        wishlistBookIds={wishlist}
        allBooks={booksList}
        onSelectBook={(book) => {
          setIsWishlistModalOpen(false);
          handleSelectBook(book);
        }}
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
      <BookCircleMain />
    </AuthProvider>
  );
};

export default App;
