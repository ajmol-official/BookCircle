import React, { useState } from 'react';
import { ShelfStats } from './ShelfStats';
import { ShelfView, type AvailableBookItem } from './ShelfView';
import { BorrowingView } from './BorrowingView';
import { RequestsView } from './RequestsView';
import { HistoryView } from './HistoryView';
import { AddBookModal } from './AddBookModal';

interface MyBooksPageProps {
  initialSubTab?: 'shelf' | 'borrowing' | 'requests' | 'history';
  onNavigateToMessages?: (ownerName: string, bookTitle: string) => void;
}

export const MyBooksPage: React.FC<MyBooksPageProps> = ({
  initialSubTab = 'shelf',
  onNavigateToMessages
}) => {
  const [currentTab, setCurrentTab] = useState<'shelf' | 'borrowing' | 'requests' | 'history'>(initialSubTab);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [availableBooks, setAvailableBooks] = useState<AvailableBookItem[]>([
    {
      id: 'avail-1',
      catalogId: 'stoner',
      title: 'Stoner',
      author: 'John Williams',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200',
      type: 'lending',
      condition: 'Like New',
      pendingRequests: 2
    },
    {
      id: 'avail-2',
      catalogId: 'entangled-life',
      title: 'Entangled Life',
      author: 'Merlin Sheldrake',
      cover: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=200',
      type: 'donation',
      condition: 'Very Good',
      pendingRequests: 0
    },
    {
      id: 'avail-3',
      catalogId: 'the-sea-the-sea',
      title: 'The Sea, The Sea',
      author: 'Iris Murdoch',
      cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=200',
      type: 'lending',
      condition: 'Good',
      pendingRequests: 0
    }
  ]);

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

  return (
    <div className="pt-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
          My Books
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-normal">
          Track your shelf, active borrows, and past exchanges.
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
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-sans font-bold leading-none text-white bg-amber-badge rounded-full">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full transition-all duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Shelf Numerical Stats */}
      <ShelfStats />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-brand/10 border border-brand/20 text-brand text-xs sm:text-sm font-medium animate-in fade-in">
          💬 {toastMessage}
        </div>
      )}

      {/* View Switcher */}
      {currentTab === 'shelf' && (
        <ShelfView
          availableBooks={availableBooks}
          onOpenAddBook={() => setIsAddBookOpen(true)}
          onOpenRequests={() => setCurrentTab('requests')}
          onMessageBorrower={handleMessage}
        />
      )}

      {currentTab === 'borrowing' && (
        <BorrowingView
          onMessageOwner={handleMessage}
        />
      )}

      {currentTab === 'requests' && (
        <RequestsView />
      )}

      {currentTab === 'history' && (
        <HistoryView />
      )}

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onBookAdded={(newBook) => {
          const newShelfItem: AvailableBookItem = {
            id: `avail-${Date.now()}`,
            catalogId: newBook.catalogId,
            title: newBook.title,
            author: newBook.author,
            cover: newBook.coverImage,
            type: newBook.availability,
            condition: newBook.condition,
            pendingRequests: 0
          };
          setAvailableBooks((prev) => [newShelfItem, ...prev]);
          setToastMessage(
            `“${newBook.title}” was added to your shelf! Reader ratings & reviews are synced with all community copies.`
          );
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />

    </div>
  );
};
