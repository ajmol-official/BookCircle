import React, { useState } from 'react';
import { ShelfStats } from './ShelfStats';
import { ShelfView, type ShelfBookItem } from './ShelfView';
import { BorrowingView } from './BorrowingView';
import { RequestsView } from './RequestsView';
import { HistoryView } from './HistoryView';
import { AddBookModal } from './AddBookModal';
import type { Book } from '../../types';

interface MyBooksPageProps {
  initialSubTab?: 'shelf' | 'borrowing' | 'requests' | 'history';
  onNavigateToMessages?: (ownerName: string, bookTitle: string) => void;
  onBookAdded?: (newBook: any) => void;
  myBooks?: Book[];
  onUpdateBookStatus?: (bookId: string, newMode: 'lending' | 'donation' | 'personal') => void;
  onDeleteBook?: (bookId: string) => void;
}

export const MyBooksPage: React.FC<MyBooksPageProps> = ({
  initialSubTab = 'shelf',
  onNavigateToMessages,
  onBookAdded,
  myBooks,
  onUpdateBookStatus,
  onDeleteBook,
}) => {
  const [currentTab, setCurrentTab] = useState<'shelf' | 'borrowing' | 'requests' | 'history'>(initialSubTab);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local fallback books if not passed via props
  const [localBooks, setLocalBooks] = useState<ShelfBookItem[]>([
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
  ]);

  // Map real user books from props if provided, otherwise local state
  const shelfBooks: ShelfBookItem[] =
    myBooks && myBooks.length > 0
      ? myBooks.map((b) => ({
          id: b.id,
          catalogId: b.catalogId,
          title: b.title,
          author: b.author,
          cover: b.coverImage,
          availabilityMode: b.availabilityMode || (b.status === 'donation' ? 'donation' : 'lending'),
          status: b.status,
          condition: b.condition || 'Like New',
          pendingRequests: 0,
          borrower: b.status === 'lent_out' ? 'Priya Shah' : undefined,
          borrowerAvatar:
            b.status === 'lent_out'
              ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
              : undefined,
          dueDate: b.status === 'lent_out' ? 'Due in 18d' : undefined,
          statusType: b.status === 'lent_out' ? 'success' : undefined,
        }))
      : localBooks;

  const tabs = [
    { id: 'shelf', label: 'My shelf' },
    { id: 'borrowing', label: 'Borrowing' },
    { id: 'requests', label: 'Requests', badge: '1' },
    { id: 'history', label: 'History' },
  ];

  const handleMessage = (name: string, bookTitle: string) => {
    if (onNavigateToMessages) {
      onNavigateToMessages(name, bookTitle);
    } else {
      setToastMessage(`Opened message thread with ${name} regarding “${bookTitle}”`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleUpdateStatus = (bookId: string, newMode: 'lending' | 'donation' | 'personal') => {
    setLocalBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, availabilityMode: newMode } : b))
    );
    if (onUpdateBookStatus) {
      onUpdateBookStatus(bookId, newMode);
    }
    const label =
      newMode === 'personal'
        ? 'Private Collection'
        : newMode === 'donation'
        ? 'For Donation'
        : 'For Lending';
    setToastMessage(`Status updated to “${label}”.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = (bookId: string) => {
    setLocalBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (onDeleteBook) {
      onDeleteBook(bookId);
    }
    setToastMessage('The book was permanently removed from your shelf.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dynamic Shelf Counts
  const listedCount = shelfBooks.length;
  const lentOutCount = shelfBooks.filter((b) => b.status === 'lent_out').length;
  const forLendingCount = shelfBooks.filter(
    (b) => b.availabilityMode === 'lending' && b.status !== 'lent_out'
  ).length;
  const forDonationCount = shelfBooks.filter(
    (b) => b.availabilityMode === 'donation' && b.status !== 'lent_out'
  ).length;

  return (
    <div className="pt-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
          My Books
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-normal">
          Manage your library, switch book availability, and monitor active community borrows.
        </p>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="mt-6 flex items-center gap-8 border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`relative pb-3 text-base sm:text-lg font-serif transition-colors flex items-center gap-2 ${
                isActive
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-5 h-5 rounded-full bg-brand text-white text-[11px] font-sans font-bold flex items-center justify-center">
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

      {/* Shelf Numerical Stats with Live Counts */}
      <ShelfStats
        listedCount={listedCount}
        lentOutCount={lentOutCount}
        forLendingCount={forLendingCount}
        forDonationCount={forDonationCount}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-brand/10 border border-brand/20 text-brand text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* View Switcher */}
      {currentTab === 'shelf' && (
        <ShelfView
          availableBooks={shelfBooks}
          onOpenAddBook={() => setIsAddBookOpen(true)}
          onOpenRequests={() => setCurrentTab('requests')}
          onMessageBorrower={handleMessage}
          onUpdateBookStatus={handleUpdateStatus}
          onDeleteBook={handleDelete}
        />
      )}

      {currentTab === 'borrowing' && <BorrowingView onMessageOwner={handleMessage} />}

      {currentTab === 'requests' && <RequestsView />}

      {currentTab === 'history' && <HistoryView />}

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onBookAdded={(newBook) => {
          const newShelfItem: ShelfBookItem = {
            id: `book-${Date.now()}`,
            catalogId: newBook.catalogId,
            title: newBook.title,
            author: newBook.author,
            cover: newBook.coverImage,
            availabilityMode: newBook.availability,
            status: newBook.availability === 'donation' ? 'donation' : 'available',
            condition: newBook.condition,
            pendingRequests: 0,
          };
          setLocalBooks((prev) => [newShelfItem, ...prev]);
          onBookAdded?.(newBook);
          setToastMessage(
            `“${newBook.title}” was added to your shelf as ${
              newBook.availability === 'personal'
                ? 'Private Collection'
                : newBook.availability === 'donation'
                ? 'For Donation'
                : 'For Lending'
            }!`
          );
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />
    </div>
  );
};
