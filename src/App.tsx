import React, { useState, useMemo, useEffect } from 'react';
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

const BookCircleMain: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const tab = new URLSearchParams(window.location.search).get('tab');
      return tab || 'home';
    } catch {
      return 'home';
    }
  });

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') !== activeTab) {
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRadius, setSelectedRadius] = useState<string>('Within 5km');
  const [selectedChatParticipant, setSelectedChatParticipant] = useState<string | null>(null);

  // Modals & Drawers state
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState<boolean>(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);
  const [viewingBookDetails, setViewingBookDetails] = useState<Book | null>(null);
  const [viewingPublicReader, setViewingPublicReader] = useState<Reader | null>(null);
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

  // Notifications State (including message notification)
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

  // Filter books based on category and search query
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

  const handleBrowseReader = (reader: Reader) => {
    setViewingPublicReader(reader);
    setViewingBookDetails(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOwner = (ownerName: string) => {
    const match = readersList.find(
      (r) =>
        r.name.toLowerCase().trim() === ownerName.toLowerCase().trim() ||
        r.name.toLowerCase().includes(ownerName.toLowerCase().trim()) ||
        ownerName.toLowerCase().includes(r.name.toLowerCase().trim())
    );

    if (match) {
      setViewingPublicReader(match);
    } else {
      const ownerBooks = booksList.filter((b) => b.ownerName.toLowerCase().includes(ownerName.toLowerCase()));
      const firstBook = ownerBooks[0];
      const dynamicReader: Reader = {
        id: `reader-${ownerName.toLowerCase().replace(/\s+/g, '-')}`,
        name: ownerName,
        avatar: firstBook?.ownerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        distance: firstBook?.distance || '1.0 km',
        location: `${firstBook?.distance || '1.0 km'} away in neighborhood`,
        memberSince: '2024',
        booksAvailable: ownerBooks.length || 4,
        booksForLending: ownerBooks.filter((b) => b.availabilityMode === 'lending').length || 3,
        booksForDonation: ownerBooks.filter((b) => b.availabilityMode === 'donation').length || 1,
        rating: 4.9,
        totalBorrows: 24,
        trustTier: 'Tier 4 · Highly Reliable',
        trustScore: '100% on schedule · 24/24 on time',
        bio: `Hi, I am ${ownerName}. I love sharing books with my neighbors in BookCircle! Check out my lending and donation shelf below.`,
        favoriteGenres: ['All', 'Fiction', 'History', 'Science'],
        verified: true
      };
      setViewingPublicReader(dynamicReader);
    }
    setViewingBookDetails(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    if (tab !== 'home' && !isAuthenticated) {
      requireAuth({
        title: 'Sign In Required',
        message: 'Sign in to access your personal shelf, incoming requests, and neighbor conversations.',
        targetAction: tab as any,
        onAuthorized: () => {
          setActiveTab(tab);
          setViewingBookDetails(null);
          setViewingPublicReader(null);
        },
      });
      return;
    }
    setActiveTab(tab);
    setViewingBookDetails(null);
    setViewingPublicReader(null);
  };

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false);
    await logout();
    setActiveTab('home');
    setViewingBookDetails(null);
    setViewingPublicReader(null);
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
    dbService.createBorrowRequest({
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
    }).catch(console.error);

    // 3. If viewing this book details, update live
    if (viewingBookDetails?.id === details.book.id) {
      setViewingBookDetails((prev) => (prev ? { ...prev, status: 'claimed' } : null));
    }

    // 4. Trigger celebration toast for claiming a free gift
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
    dbService.createBorrowRequest({
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
    }).catch(console.error);

    // 3. If viewing this book details, update live
    if (viewingBookDetails?.id === details.book.id) {
      setViewingBookDetails((prev) => (prev ? { ...prev, status: 'lent_out' } : null));
    }

    // 4. Trigger celebration toast for borrowing
    setGlobalToast(
      `📖 Borrow Request Sent! Meetup with ${details.owner.name} scheduled for ${details.date} at ${details.time}.`
    );
    setTimeout(() => setGlobalToast(null), 5000);
  };

  const handleFloatingAddBook = () => {
    requireAuth({
      title: 'Sign In to Add Book',
      message: 'Sign in or join BookCircle to list physical books from your collection to lend or donate.',
      targetAction: 'add-book',
      onAuthorized: () => setIsGlobalAddBookOpen(true),
    });
  };

  const handleSimulateReturn = (book: Book) => {
    // 1. Mark book as available in booksList
    setBooksList((prev) =>
      prev.map((b) => (b.id === book.id ? { ...b, status: 'available' } : b))
    );

    // 2. If user is currently viewing this book details, update it live
    if (viewingBookDetails?.id === book.id) {
      setViewingBookDetails((prev) => (prev ? { ...prev, status: 'available' } : null));
    }

    // 3. Dispatch an urgent notification to the notification bell
    const newNotif: NotificationItem = {
      id: `notif-wishlist-${Date.now()}`,
      sender: book.ownerName,
      avatar: book.ownerAvatar,
      action: `returned "${book.title}" to their shelf! It is now available to borrow.`,
      book: book.title,
      time: 'Just now',
      type: 'wishlist_available',
      unread: true,
      targetTab: 'book-details',
      bookId: book.id,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // 4. Trigger global celebration toast
    setGlobalToast(`🎉 Great news! "${book.title}" was returned by ${book.ownerName} and is now ready to borrow.`);
    setTimeout(() => setGlobalToast(null), 5000);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    if (item.type === 'message') {
      setSelectedChatParticipant(item.sender);
      setActiveTab('messages');
      setViewingBookDetails(null);
      setViewingPublicReader(null);
    } else if (item.type === 'wishlist_available' || item.targetTab === 'book-details') {
      const found = booksList.find((b) => b.id === item.bookId || b.title.toLowerCase() === item.book.toLowerCase());
      if (found) {
        setViewingBookDetails(found);
        setViewingPublicReader(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } else if (item.targetTab) {
      setActiveTab(item.targetTab);
      setViewingBookDetails(null);
      setViewingPublicReader(null);
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
          coverImage: newBook.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
          category: newBook.category || 'Fiction',
          status: newBook.status || 'available',
          availabilityMode: newBook.availabilityMode || 'lending',
          condition: newBook.condition || 'Like New',
          description: newBook.description || '',
          distance: '0.1 km away',
          ownersCount: 1,
          rating: 5.0,
          reviewsCount: 1,
          ownerName: currentUser?.displayName || 'You',
          ownerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          ownerTrust: 'Verified Neighbor',
        },
        currentUser?.id
      );
      setBooksList((prev) => [added, ...prev]);
    }

    setGlobalToast(
      `“${newBook.title}” was added to your shelf! Reader ratings & reviews are synced with all community copies.`
    );
    setTimeout(() => setGlobalToast(null), 5000);
  };

  const unreadNotificationsCount = isAuthenticated ? notifications.filter((n) => n.unread).length : 0;
  const isMessagesActive = activeTab === 'messages' && !viewingBookDetails && !viewingPublicReader;

  return (
    <div
      className={`${
        isMessagesActive ? 'h-screen md:h-[100dvh] overflow-hidden' : 'min-h-screen'
      } bg-cream flex flex-col font-sans selection:bg-brand selection:text-white`}
    >
      {/* Top Navbar */}
      <Navbar
        activeTab={viewingBookDetails || viewingPublicReader ? '' : activeTab}
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
        {viewingPublicReader ? (
          <PublicProfilePage
            reader={viewingPublicReader}
            allBooks={booksList}
            onBack={() => setViewingPublicReader(null)}
            onSelectBook={(book) => {
              setViewingBookDetails(book);
              setViewingPublicReader(null);
            }}
            onRequestBorrow={handleDetailsRequestBorrow}
            onSendMessage={(ownerName) => {
              setSelectedChatParticipant(ownerName);
              setActiveTab('messages');
              setViewingPublicReader(null);
            }}
          />
        ) : viewingBookDetails ? (
          <BookDetailsPage
            book={viewingBookDetails}
            onBack={() => setViewingBookDetails(null)}
            onRequestBorrow={handleDetailsRequestBorrow}
            onSelectOwner={handleSelectOwner}
            onSimulateReturn={handleSimulateReturn}
          />
        ) : (
          <>
            {activeTab === 'home' && (
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
                  onSelectBook={(book) => setViewingBookDetails(book)}
                  onQuickBorrow={handleQuickBorrow}
                  onSelectOwner={handleSelectOwner}
                  onSeeAll={() => setActiveTab('books')}
                  selectedRadius={selectedRadius}
                />
                <ReadersSection
                  readers={readersList}
                  onBrowseShelf={handleBrowseReader}
                  onSeeAll={() => setActiveTab('readers')}
                />
              </>
            )}

            {activeTab === 'books' && (
              <BooksBrowsePage
                books={booksList}
                onSelectBook={(book) => setViewingBookDetails(book)}
                onQuickBorrow={handleQuickBorrow}
                onSelectOwner={handleSelectOwner}
                onBack={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'my-books' && (
              <MyBooksPage
                key="my-books-shelf"
                initialSubTab="shelf"
                onBookAdded={handleGlobalBookAdded}
                onNavigateToMessages={(name) => {
                  setSelectedChatParticipant(name);
                  setActiveTab('messages');
                }}
              />
            )}

            {activeTab === 'requests' && (
              <MyBooksPage
                key="my-books-requests"
                initialSubTab="requests"
                onBookAdded={handleGlobalBookAdded}
                onNavigateToMessages={(name) => {
                  setSelectedChatParticipant(name);
                  setActiveTab('messages');
                }}
              />
            )}

            {activeTab === 'messages' && (
              <InboxPage
                initialOwnerName={selectedChatParticipant}
                onSelectBook={(title) => {
                  const match = booksList.find((b) => b.title.toLowerCase() === title.toLowerCase());
                  if (match) setViewingBookDetails(match);
                }}
              />
            )}

            {activeTab === 'profile' && (
              <ProfilePage
                onSelectBook={(book) => setViewingBookDetails(book)}
                myBooks={booksList}
              />
            )}

            {activeTab === 'readers' && (
              <ReadersBrowsePage
                readers={readersList}
                onBrowseShelf={handleBrowseReader}
                onBack={() => setActiveTab('home')}
              />
            )}

            {!['home', 'my-books', 'requests', 'messages', 'profile', 'readers', 'books'].includes(activeTab) && (
              <NotFoundPage
                onGoHome={() => setActiveTab('home')}
                onGoReaders={() => setActiveTab('readers')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer — desktop only, hidden on messages or full profile views */}
      {activeTab !== 'messages' && !viewingBookDetails && !viewingPublicReader && (
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
        activeTab={viewingBookDetails || viewingPublicReader ? '' : activeTab}
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
          setViewingBookDetails(book);
          setViewingPublicReader(null);
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
