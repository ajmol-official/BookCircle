import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  BookOpen01Icon,
  GiftIcon,
  Bookmark02Icon,
  Search01Icon,
  Delete02Icon,
  PencilEdit02Icon,
  MoreVerticalIcon,
  Clock01Icon,
  Tick01Icon,
  Alert01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { AddBookModal } from './AddBookModal';
import { EditBookModal } from './EditBookModal';
import { useExchanges } from '../../context/ExchangeContext';
import type { Book } from '../../types';

interface MyBooksPageProps {
  myBooks?: Book[];
  onUpdateBookStatus?: (bookId: string, newMode: 'lending' | 'donation' | 'personal') => void;
  onDeleteBook?: (bookId: string) => void;
  onBookAdded?: (newBook: any) => void;
  onUpdateBookDetails?: (updated: {
    id: string;
    title: string;
    author: string;
    category: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
    condition: 'Like New' | 'Very Good' | 'Good' | 'Fair';
    description?: string;
  }) => void;
  initialSubTab?: string;
  onNavigateToMessages?: (ownerName: string, bookTitle: string) => void;
}

export const MyBooksPage: React.FC<MyBooksPageProps> = ({
  myBooks: propMyBooks,
  onUpdateBookStatus,
  onDeleteBook,
  onBookAdded,
  onUpdateBookDetails,
}) => {
  const navigate = useNavigate();
  const { isBookInActiveExchange, cancelPendingRequestsForBook } = useExchanges();

  // Local fallback books if not provided
  const [localBooks, setLocalBooks] = useState<Book[]>([
    {
      id: 'avail-1',
      catalogId: 'stoner',
      title: 'Stoner',
      author: 'John Williams',
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200',
      availabilityMode: 'lending',
      status: 'available',
      condition: 'Like New',
      category: 'Fiction',
      rating: 4.8,
      reviewsCount: 14,
      distance: '0.1 km',
      ownersCount: 1,
      ownerName: 'Maya Lin',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      ownerTrust: 'Verified Lender',
    },
    {
      id: 'avail-2',
      catalogId: 'entangled-life',
      title: 'Entangled Life',
      author: 'Merlin Sheldrake',
      coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=200',
      availabilityMode: 'donation',
      status: 'donation',
      condition: 'Very Good',
      category: 'Science',
      rating: 4.9,
      reviewsCount: 22,
      distance: '0.1 km',
      ownersCount: 1,
      ownerName: 'Maya Lin',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      ownerTrust: 'Verified Lender',
    },
    {
      id: 'avail-3',
      catalogId: 'the-sea-the-sea',
      title: 'The Sea, The Sea',
      author: 'Iris Murdoch',
      coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=200',
      availabilityMode: 'personal',
      status: 'available',
      condition: 'Good',
      category: 'Fiction',
      rating: 4.7,
      reviewsCount: 8,
      distance: '0.1 km',
      ownersCount: 1,
      ownerName: 'Maya Lin',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      ownerTrust: 'Verified Lender',
    },
  ]);

  const books = propMyBooks && propMyBooks.length > 0 ? propMyBooks : localBooks;

  // Search & Filter State
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'lending' | 'donation' | 'personal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'author'>('newest');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [activeMenuBookId, setActiveMenuBookId] = useState<string | null>(null);

  // Safety Notice Modals State
  const [lockedModalNotice, setLockedModalNotice] = useState<{ bookTitle: string; reason: string } | null>(null);
  const [pendingCancellationModal, setPendingCancellationModal] = useState<{
    book: Book;
    newMode?: 'lending' | 'donation' | 'personal';
    isDeleteAction?: boolean;
    pendingCount: number;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Close dropdown on click outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuBookId(null);
      }
    };
    if (activeMenuBookId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeMenuBookId]);

  // Dynamic Numerical Shelf Stats
  const lendingCount = books.filter((b) => b.availabilityMode === 'lending').length;
  const donationCount = books.filter((b) => b.availabilityMode === 'donation').length;
  const personalCount = books.filter((b) => b.availabilityMode === 'personal').length;
  const totalCount = books.length;

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        // Status filter
        if (activeStatusFilter === 'lending' && b.availabilityMode !== 'lending') return false;
        if (activeStatusFilter === 'donation' && b.availabilityMode !== 'donation') return false;
        if (activeStatusFilter === 'personal' && b.availabilityMode !== 'personal') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchAuthor = b.author.toLowerCase().includes(q);
          const matchDesc = b.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'author') return a.author.localeCompare(b.author);
        return 0;
      });
  }, [books, activeStatusFilter, searchQuery, sortBy]);

  // Handle status update with safety check
  const handleRequestStatusChange = (book: Book, newMode: 'lending' | 'donation' | 'personal') => {
    setActiveMenuBookId(null);
    if (book.availabilityMode === newMode) return;

    // 1. Check if book is locked in active exchange
    const guard = isBookInActiveExchange(book.id);
    if (guard.isLocked) {
      setLockedModalNotice({
        bookTitle: book.title,
        reason: guard.reason || 'This book is currently involved in an active exchange.',
      });
      return;
    }

    // 2. Check if book has pending requests
    if (guard.hasPendingRequests) {
      setPendingCancellationModal({
        book,
        newMode,
        isDeleteAction: false,
        pendingCount: guard.pendingCount,
      });
      return;
    }

    // 3. Execute change
    applyStatusChange(book.id, newMode);
  };

  const applyStatusChange = (bookId: string, newMode: 'lending' | 'donation' | 'personal') => {
    setLocalBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, availabilityMode: newMode } : b))
    );
    onUpdateBookStatus?.(bookId, newMode);

    const label =
      newMode === 'personal'
        ? 'Private Collection'
        : newMode === 'donation'
        ? 'For Donation'
        : 'For Lending';
    showToast(`Status updated to “${label}”.`);
  };

  // Handle delete request with safety check
  const handleRequestDelete = (book: Book) => {
    setActiveMenuBookId(null);

    // 1. Check if book is locked in active exchange
    const guard = isBookInActiveExchange(book.id);
    if (guard.isLocked) {
      setLockedModalNotice({
        bookTitle: book.title,
        reason: guard.reason || 'This book is currently on loan and cannot be removed.',
      });
      return;
    }

    // 2. Check if book has pending requests
    if (guard.hasPendingRequests) {
      setPendingCancellationModal({
        book,
        isDeleteAction: true,
        pendingCount: guard.pendingCount,
      });
      return;
    }

    // 3. Open delete confirmation modal
    setDeletingBook(book);
  };

  const applyDeleteBook = (bookId: string) => {
    setLocalBooks((prev) => prev.filter((b) => b.id !== bookId));
    onDeleteBook?.(bookId);
    showToast('The book was permanently removed from your personal library.');
    setDeletingBook(null);
  };

  return (
    <div className="pt-8 pb-20 animate-in fade-in duration-200 space-y-8">
      {/* 1. Header with Title & Primary Add Book Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
            My Books
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-normal">
            Manage your personal library, adjust book availability, and curate your shelf.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} />
          <span>Add a Book</span>
        </button>
      </div>

      {/* 2. Library Statistics Strip (Lending · Donation · Private) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card">
          <span className="block font-serif text-2xl sm:text-3xl font-bold text-slate-800">
            {totalCount}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1 block">
            Total in Library
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card">
          <span className="block font-serif text-2xl sm:text-3xl font-bold text-brand">
            {lendingCount}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1 block">
            For Lending
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card">
          <span className="block font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
            {donationCount}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1 block">
            For Donation
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card">
          <span className="block font-serif text-2xl sm:text-3xl font-bold text-slate-600">
            {personalCount}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1 block">
            Private Collection
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <HugeiconsIcon icon={Tick01Icon} size={16} className="text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Filter Chips & Search / Sort Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeStatusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Books ({totalCount})
          </button>

          <button
            onClick={() => setActiveStatusFilter('lending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeStatusFilter === 'lending'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-purple-50 border border-purple-200 text-brand hover:bg-purple-100'
            }`}
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={13} />
            <span>For Lending ({lendingCount})</span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('donation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeStatusFilter === 'donation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <HugeiconsIcon icon={GiftIcon} size={13} />
            <span>For Donation ({donationCount})</span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('personal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeStatusFilter === 'personal'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HugeiconsIcon icon={Bookmark02Icon} size={13} />
            <span>Private Collection ({personalCount})</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <HugeiconsIcon
              icon={Search01Icon}
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your library..."
              className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand shadow-2xs"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-brand shadow-2xs"
          >
            <option value="newest">Sort: Default</option>
            <option value="title">Sort: Title (A-Z)</option>
            <option value="author">Sort: Author (A-Z)</option>
          </select>
        </div>
      </div>

      {/* 4. Book Cards List */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <HugeiconsIcon icon={BookOpen01Icon} size={22} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-800">No books found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No books match “${searchQuery}”. Try clearing your search query.`
              : 'There are no books matching the selected filter.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-1.5 text-xs font-semibold text-brand hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBooks.map((book) => {
            const guard = isBookInActiveExchange(book.id);
            const isMenuOpen = activeMenuBookId === book.id;

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative"
              >
                {/* Left: Cover & Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-xl shadow-xs flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-serif text-base sm:text-lg font-semibold text-slate-800">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{book.author}</p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Status Badges */}
                      {book.availabilityMode === 'donation' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          <HugeiconsIcon icon={GiftIcon} size={12} />
                          <span>For Donation</span>
                        </span>
                      ) : book.availabilityMode === 'personal' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <HugeiconsIcon icon={Bookmark02Icon} size={12} />
                          <span>Private Collection</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                          <HugeiconsIcon icon={BookOpen01Icon} size={12} />
                          <span>For Lending</span>
                        </span>
                      )}

                      {book.condition && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                          {book.condition}
                        </span>
                      )}

                      {/* Active Exchange / Lock indicator */}
                      {guard.isLocked && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                          <HugeiconsIcon icon={Clock01Icon} size={12} />
                          <span>Active Exchange ({guard.borrower || 'Neighbor'})</span>
                        </span>
                      )}

                      {guard.hasPendingRequests && (
                        <span className="text-xs font-semibold text-amber-600">
                          • {guard.pendingCount} request{guard.pendingCount > 1 ? 's' : ''} pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto relative">
                  {guard.isLocked ? (
                    <button
                      onClick={() => navigate('/activity')}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <span>View in Activity</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                    </button>
                  ) : (
                    /* Change Status Dropdown */
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuBookId(isMenuOpen ? null : book.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold transition hover:bg-slate-50 shadow-2xs"
                      >
                        <span>Change Status</span>
                        <HugeiconsIcon icon={MoreVerticalIcon} size={14} className="text-slate-500" />
                      </button>

                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                        >
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Book Status
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRequestStatusChange(book, 'lending')}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition ${
                              book.availabilityMode === 'lending'
                                ? 'bg-brand/5 text-brand font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <HugeiconsIcon icon={BookOpen01Icon} size={14} className="text-brand" />
                              <span>For Lending</span>
                            </span>
                            {book.availabilityMode === 'lending' && (
                              <HugeiconsIcon icon={Tick01Icon} size={14} className="text-brand" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRequestStatusChange(book, 'donation')}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition ${
                              book.availabilityMode === 'donation'
                                ? 'bg-amber-50 text-amber-800 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <HugeiconsIcon icon={GiftIcon} size={14} className="text-amber-600" />
                              <span>For Donation</span>
                            </span>
                            {book.availabilityMode === 'donation' && (
                              <HugeiconsIcon icon={Tick01Icon} size={14} className="text-amber-700" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRequestStatusChange(book, 'personal')}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition ${
                              book.availabilityMode === 'personal'
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <HugeiconsIcon icon={Bookmark02Icon} size={14} className="text-slate-500" />
                              <span>Private Collection</span>
                            </span>
                            {book.availabilityMode === 'personal' && (
                              <HugeiconsIcon icon={Tick01Icon} size={14} className="text-slate-900" />
                            )}
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuBookId(null);
                              setEditingBook(book);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                          >
                            <HugeiconsIcon icon={PencilEdit02Icon} size={14} className="text-slate-500" />
                            <span>Edit Information</span>
                          </button>

                          {/* Delete Book */}
                          <button
                            type="button"
                            onClick={() => handleRequestDelete(book)}
                            className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition font-medium"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={14} className="text-red-500" />
                            <span>Delete Book</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edit button shortcut */}
                  {!guard.isLocked && (
                    <button
                      type="button"
                      onClick={() => setEditingBook(book)}
                      className="p-2 min-w-[36px] min-h-[36px] rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition flex items-center justify-center"
                      title="Edit book details"
                      aria-label="Edit book details"
                    >
                      <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ADD BOOK MODAL                                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={(newBook) => {
          setIsAddModalOpen(false);
          const addedBook: Book = {
            id: `book-${Date.now()}`,
            catalogId: newBook.catalogId,
            title: newBook.title,
            author: newBook.author,
            coverImage: newBook.coverImage,
            availabilityMode: newBook.availability,
            status: newBook.availability === 'donation' ? 'donation' : 'available',
            condition: (newBook.condition || 'Like New') as 'Like New' | 'Very Good' | 'Good' | 'Fair',
            category: newBook.category || 'Fiction',
            rating: 4.8,
            reviewsCount: 1,
            distance: '0.1 km',
            ownersCount: 1,
            ownerName: 'Maya Lin',
            ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            ownerTrust: 'Verified Lender',
          };
          setLocalBooks((prev) => [addedBook, ...prev]);
          onBookAdded?.(newBook);
          showToast(`“${newBook.title}” was added to your library!`);
        }}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* EDIT BOOK MODAL                                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <EditBookModal
        isOpen={Boolean(editingBook)}
        book={editingBook}
        onClose={() => setEditingBook(null)}
        onSave={(updated) => {
          setLocalBooks((prev) =>
            prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
          );
          onUpdateBookDetails?.(updated);
          showToast(`“${updated.title}” details were updated!`);
        }}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PERMANENT DELETE CONFIRMATION MODAL                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {deletingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={Delete02Icon} size={24} />
            </div>

            <h3 className="font-serif text-xl font-semibold text-slate-900">
              Delete Book from Shelf?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>“{deletingBook.title}”</strong> by {deletingBook.author}?
            </p>
            <p className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200/80">
              This will remove the book from your personal shelf and community listings. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingBook(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => applyDeleteBook(deletingBook.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md transition"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ACTIVE LOAN LOCKED NOTICE MODAL                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {lockedModalNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={Clock01Icon} size={24} />
            </div>

            <h3 className="font-serif text-xl font-semibold text-slate-900">
              Active Exchange in Progress
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>“{lockedModalNotice.bookTitle}”</strong> cannot be modified or removed at this time:
            </p>
            <p className="mt-2 text-xs text-slate-700 bg-amber-50 p-3 rounded-xl border border-amber-200/70 font-medium">
              {lockedModalNotice.reason}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              To safeguard ongoing community trust, books in active loans or return handovers are protected until completion.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setLockedModalNotice(null);
                  navigate('/activity');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition"
              >
                View in Activity
              </button>
              <button
                type="button"
                onClick={() => setLockedModalNotice(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SAFER INVENTORY ACTION: PENDING REQUESTS CONFIRMATION MODAL         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {pendingCancellationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={Alert01Icon} size={24} />
            </div>

            <h3 className="font-serif text-xl font-semibold text-slate-900">
              Pending Requests Will Be Cancelled
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>“{pendingCancellationModal.book.title}”</strong> currently has{' '}
              <strong className="text-amber-800">
                {pendingCancellationModal.pendingCount} pending request{pendingCancellationModal.pendingCount > 1 ? 's' : ''}
              </strong>{' '}
              from neighbors awaiting your decision.
            </p>
            <p className="mt-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
              {pendingCancellationModal.isDeleteAction
                ? 'Deleting this book will automatically cancel these pending requests and notify the requesters.'
                : 'Changing the availability status of this book will automatically cancel the pending requests.'}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingCancellationModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition"
              >
                Keep Requests (Cancel)
              </button>
              <button
                type="button"
                onClick={async () => {
                  const book = pendingCancellationModal.book;
                  await cancelPendingRequestsForBook(
                    book.id,
                    pendingCancellationModal.isDeleteAction ? 'Book removed by owner' : 'Status changed by owner'
                  );

                  if (pendingCancellationModal.isDeleteAction) {
                    applyDeleteBook(book.id);
                  } else if (pendingCancellationModal.newMode) {
                    applyStatusChange(book.id, pendingCancellationModal.newMode);
                  }
                  setPendingCancellationModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
              >
                Proceed & Cancel Requests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
