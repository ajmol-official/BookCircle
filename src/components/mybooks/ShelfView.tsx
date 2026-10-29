import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert01Icon,
  ArrowRight01Icon,
  BubbleChatIcon,
  GiftIcon,
  MoreVerticalIcon,
  Add01Icon,
  BookOpen01Icon,
  Bookmark02Icon,
  Clock01Icon,
  Delete02Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';

export interface ShelfBookItem {
  id: string;
  catalogId?: string;
  title: string;
  author: string;
  cover: string;
  availabilityMode: 'lending' | 'donation' | 'personal';
  status: 'available' | 'lent_out' | 'donation' | 'claimed';
  condition?: string;
  pendingRequests?: number;
  borrower?: string;
  borrowerAvatar?: string;
  dueDate?: string;
  statusType?: 'success' | 'warning' | 'danger';
}

interface ShelfViewProps {
  onOpenAddBook: () => void;
  onOpenRequests: () => void;
  onMessageBorrower: (borrower: string, bookTitle: string) => void;
  availableBooks?: ShelfBookItem[];
  onUpdateBookStatus?: (bookId: string, newMode: 'lending' | 'donation' | 'personal') => void;
  onDeleteBook?: (bookId: string) => void;
}

export const ShelfView: React.FC<ShelfViewProps> = ({
  onOpenAddBook,
  onOpenRequests,
  onMessageBorrower,
  availableBooks: propAvailableBooks,
  onUpdateBookStatus,
  onDeleteBook,
}) => {
  // Active Filter inside My Shelf
  const [activeFilter, setActiveFilter] = useState<'all' | 'lending' | 'donation' | 'personal' | 'lent_out'>('all');

  // Menu & Modal states
  const [openMenuBookId, setOpenMenuBookId] = useState<string | null>(null);
  const [bookToDelete, setBookToDelete] = useState<ShelfBookItem | null>(null);
  const [lockedNoticeBook, setLockedNoticeBook] = useState<ShelfBookItem | null>(null);

  // Close contextual menu when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuBookId(null);
      }
    };
    if (openMenuBookId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openMenuBookId]);

  // Default fallback books if user has not loaded or added books yet
  const defaultBooks: ShelfBookItem[] = [
    {
      id: 'avail-1',
      catalogId: 'stoner',
      title: 'Stoner',
      author: 'John Williams',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200',
      availabilityMode: 'lending',
      status: 'available',
      condition: 'Like New',
      pendingRequests: 2,
    },
    {
      id: 'avail-2',
      catalogId: 'entangled-life',
      title: 'Entangled Life',
      author: 'Merlin Sheldrake',
      cover: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=200',
      availabilityMode: 'donation',
      status: 'donation',
      condition: 'Very Good',
      pendingRequests: 0,
    },
    {
      id: 'avail-3',
      catalogId: 'the-sea-the-sea',
      title: 'The Sea, The Sea',
      author: 'Iris Murdoch',
      cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=200',
      availabilityMode: 'personal',
      status: 'available',
      condition: 'Good',
      pendingRequests: 0,
    },
    {
      id: 'lent-1',
      title: 'The Overstory',
      author: 'Richard Powers',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200',
      availabilityMode: 'lending',
      status: 'lent_out',
      condition: 'Very Good',
      borrower: 'Priya Shah',
      borrowerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      dueDate: 'Due in 18d',
      statusType: 'success',
      pendingRequests: 0,
    },
    {
      id: 'lent-2',
      title: 'Anna Karenina',
      author: 'Leo Tolstoy',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
      availabilityMode: 'lending',
      status: 'lent_out',
      condition: 'Good',
      borrower: 'Amira Khan',
      borrowerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      dueDate: '4d overdue',
      statusType: 'danger',
      pendingRequests: 0,
    },
  ];

  const allShelfBooks = propAvailableBooks && propAvailableBooks.length > 0 ? propAvailableBooks : defaultBooks;

  // Counts across the 3 statuses + active lends
  const lendingCount = allShelfBooks.filter((b) => b.availabilityMode === 'lending' && b.status !== 'lent_out').length;
  const donationCount = allShelfBooks.filter((b) => b.availabilityMode === 'donation' && b.status !== 'lent_out').length;
  const personalCount = allShelfBooks.filter((b) => b.availabilityMode === 'personal' && b.status !== 'lent_out').length;
  const lentOutCount = allShelfBooks.filter((b) => b.status === 'lent_out').length;
  const totalCount = allShelfBooks.length;

  // Filtered books based on selected tab
  const filteredBooks = allShelfBooks.filter((b) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'lending') return b.availabilityMode === 'lending' && b.status !== 'lent_out';
    if (activeFilter === 'donation') return b.availabilityMode === 'donation' && b.status !== 'lent_out';
    if (activeFilter === 'personal') return b.availabilityMode === 'personal' && b.status !== 'lent_out';
    if (activeFilter === 'lent_out') return b.status === 'lent_out';
    return true;
  });

  // Handle status update with transaction safety check
  const handleSelectStatus = (book: ShelfBookItem, newMode: 'lending' | 'donation' | 'personal') => {
    setOpenMenuBookId(null);
    if (book.status === 'lent_out') {
      setLockedNoticeBook(book);
      return;
    }
    if (book.availabilityMode === newMode) return;

    if (onUpdateBookStatus) {
      onUpdateBookStatus(book.id, newMode);
    }
  };

  // Handle deletion request with transaction safety check
  const handleRequestDelete = (book: ShelfBookItem) => {
    setOpenMenuBookId(null);
    if (book.status === 'lent_out') {
      setLockedNoticeBook(book);
      return;
    }
    setBookToDelete(book);
  };

  const handleConfirmDelete = () => {
    if (bookToDelete && onDeleteBook) {
      onDeleteBook(bookToDelete.id);
    }
    setBookToDelete(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Overdue Banner Notice if any book is overdue */}
      {allShelfBooks.some((b) => b.status === 'lent_out' && b.statusType === 'danger') && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-800">
              <HugeiconsIcon icon={Alert01Icon} size={24} />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-amber-900">
                A borrowed book is currently overdue
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Anna Karenina was borrowed by Amira Khan and is 4 days overdue. A friendly reminder can help schedule the return.
              </p>
            </div>
          </div>

          <button
            onClick={() => onMessageBorrower('Amira Khan', 'Anna Karenina')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800/10 hover:bg-amber-800/20 text-amber-900 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap self-end sm:self-auto"
          >
            <span>Message Amira</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>
        </div>
      )}

      {/* 2. Shelf Filter Tabs & Add Book Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">Filter Shelf:</span>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({totalCount})
          </button>

          <button
            onClick={() => setActiveFilter('lending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === 'lending'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-purple-50 border border-purple-200 text-brand hover:bg-purple-100'
            }`}
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={13} />
            <span>For Lending ({lendingCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('donation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === 'donation'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <HugeiconsIcon icon={GiftIcon} size={13} />
            <span>For Donation ({donationCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('personal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === 'personal'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HugeiconsIcon icon={Bookmark02Icon} size={13} />
            <span>Private Collection ({personalCount})</span>
          </button>

          {lentOutCount > 0 && (
            <button
              onClick={() => setActiveFilter('lent_out')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeFilter === 'lent_out'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <HugeiconsIcon icon={Clock01Icon} size={13} />
              <span>Lent Out ({lentOutCount})</span>
            </button>
          )}
        </div>

        <button
          onClick={onOpenAddBook}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} />
          <span>Add a Book</span>
        </button>
      </div>

      {/* 3. Books List */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <HugeiconsIcon icon={BookOpen01Icon} size={22} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-800">No books found in this view</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {activeFilter === 'personal'
              ? 'You have not added any books to your Private Collection yet.'
              : 'There are currently no books matching this status filter.'}
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-brand hover:underline"
          >
            Show all books ({totalCount})
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBooks.map((book) => {
            const isLentOut = book.status === 'lent_out';
            const isMenuOpen = openMenuBookId === book.id;

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-xl shadow-xs flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-serif text-base sm:text-lg font-semibold text-slate-800">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{book.author}</p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Status Badges with Subtle Icons */}
                      {isLentOut ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                          <HugeiconsIcon icon={Clock01Icon} size={12} />
                          <span>Lent Out ({book.dueDate || 'Active'})</span>
                        </span>
                      ) : book.availabilityMode === 'donation' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
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

                      {/* Borrower attribution if lent out */}
                      {isLentOut && book.borrower && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 ml-1">
                          {book.borrowerAvatar && (
                            <img
                              src={book.borrowerAvatar}
                              alt={book.borrower}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                          )}
                          <span>with <strong className="font-medium text-slate-700">{book.borrower}</strong></span>
                        </div>
                      )}

                      {(book.pendingRequests || 0) > 0 && (
                        <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                          • {book.pendingRequests} Request{(book.pendingRequests || 0) > 1 ? 's' : ''} pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto relative">
                  {(book.pendingRequests || 0) > 0 ? (
                    <button
                      onClick={onOpenRequests}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 animate-pulse"
                    >
                      <span>Review Request ({book.pendingRequests})</span>
                    </button>
                  ) : isLentOut ? (
                    <button
                      onClick={() => onMessageBorrower(book.borrower || 'Borrower', book.title)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand hover:text-white text-slate-700 font-semibold text-xs transition"
                    >
                      <HugeiconsIcon icon={BubbleChatIcon} size={14} />
                      <span>Message</span>
                    </button>
                  ) : (
                    /* Quick Status Switcher Dropdown Button */
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuBookId(isMenuOpen ? null : book.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold transition hover:bg-slate-50 shadow-2xs"
                      >
                        <span>Change Status</span>
                        <HugeiconsIcon icon={MoreVerticalIcon} size={14} className="text-slate-400" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                        >
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Book Status
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectStatus(book, 'lending')}
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
                            onClick={() => handleSelectStatus(book, 'donation')}
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
                            onClick={() => handleSelectStatus(book, 'personal')}
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

                          {/* Destructive Delete Action */}
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

                  {/* Contextual More Button for Lent Out books */}
                  {isLentOut && (
                    <button
                      type="button"
                      onClick={() => setLockedNoticeBook(book)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="More details"
                    >
                      <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Active Transaction Locked Modal Notice */}
      {lockedNoticeBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={Clock01Icon} size={24} />
            </div>

            <h3 className="font-serif text-xl font-semibold text-slate-900">
              Active Borrow in Progress
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>“{lockedNoticeBook.title}”</strong> is currently with{' '}
              <strong className="text-slate-800">{lockedNoticeBook.borrower || 'a neighbor'}</strong>.
            </p>
            <p className="mt-2 text-xs text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-200/70">
              To safeguard ongoing community trust and borrow records, this book cannot be changed to another status or deleted until it is marked as returned.
            </p>

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setLockedNoticeBook(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition shadow-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Permanent Delete Confirmation Modal */}
      {bookToDelete && (
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
              Are you sure you want to permanently delete <strong>“{bookToDelete.title}”</strong> by {bookToDelete.author}?
            </p>
            <p className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200/80">
              This will remove the book from your personal shelf and community listings. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md transition"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
