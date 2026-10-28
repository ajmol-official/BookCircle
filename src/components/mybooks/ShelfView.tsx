import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert01Icon,
  ArrowRight01Icon,
  BubbleChatIcon,
  GiftIcon,
  MoreVerticalIcon,
  Add01Icon,
  BookOpen01Icon
} from '@hugeicons/core-free-icons';

export interface AvailableBookItem {
  id: string;
  catalogId?: string;
  title: string;
  author: string;
  cover: string;
  type: 'lending' | 'donation';
  condition?: string;
  pendingRequests: number;
}

interface ShelfViewProps {
  onOpenAddBook: () => void;
  onOpenRequests: () => void;
  onMessageBorrower: (borrower: string, bookTitle: string) => void;
  availableBooks?: AvailableBookItem[];
}

export const ShelfView: React.FC<ShelfViewProps> = ({
  onOpenAddBook,
  onOpenRequests,
  onMessageBorrower,
  availableBooks: propAvailableBooks
}) => {
  const lentOutBooks = [
    {
      id: 'lent-1',
      title: 'The Overstory',
      author: 'Richard Powers',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200',
      borrower: 'Priya Shah',
      borrowerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      status: 'Due in 18d',
      statusType: 'success'
    },
    {
      id: 'lent-2',
      title: 'Anna Karenina',
      author: 'Leo Tolstoy',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
      borrower: 'Amira Khan',
      borrowerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      status: '4d overdue',
      statusType: 'danger'
    },
    {
      id: 'lent-3',
      title: 'The Idiot',
      author: 'Fyodor Dostoevsky',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=200',
      borrower: 'Jonas Meier',
      borrowerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      status: 'Due in 3d',
      statusType: 'warning'
    }
  ];

  const defaultAvailableBooks: AvailableBookItem[] = [
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
  ];

  const availableBooks = propAvailableBooks || defaultAvailableBooks;

  return (
    <div className="space-y-10 pb-16">
      
      {/* Overdue Banner Notice */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-800">
            <HugeiconsIcon icon={Alert01Icon} size={24} />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-semibold text-amber-900">
              The “Karenina” is 4 days overdue
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Amira Khan borrowed this on March 12. A friendly nudge can help arrange the return.
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

      {/* Section 1: Lent Out Books */}
      <div>
        <div className="mb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
            Lent out ({lentOutBooks.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pick a time and place that works for you both. You can always reschedule later.
          </p>
        </div>

        <div className="space-y-3">
          {lentOutBooks.map((book) => {
            let statusBadge = (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">
                {book.status}
              </span>
            );
            if (book.statusType === 'danger') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700 animate-pulse">
                  {book.status}
                </span>
              );
            } else if (book.statusType === 'warning') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800">
                  {book.status}
                </span>
              );
            }

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-serif text-base sm:text-lg font-semibold text-slate-800">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{book.author}</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      {statusBadge}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <img
                          src={book.borrowerAvatar}
                          alt={book.borrower}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>Lent to <strong className="font-medium text-slate-700">{book.borrower}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => onMessageBorrower(book.borrower, book.title)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-brand hover:text-white text-slate-700 font-medium text-xs sm:text-sm transition-all"
                  >
                    <HugeiconsIcon icon={BubbleChatIcon} size={16} />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Available Books on Shelf */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
              Available ({availableBooks.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Toggle each book between lending and permanent donation.
            </p>
          </div>

          <button
            onClick={onOpenAddBook}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} />
            <span>Add Book</span>
          </button>
        </div>

        <div className="space-y-3">
          {availableBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-14 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
                />
                <div>
                    <h4 className="font-serif text-base sm:text-lg font-semibold text-slate-800">
                      {book.title}
                    </h4>
                  <p className="text-xs text-slate-500 font-medium">{book.author}</p>
                  
                  <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                    {book.type === 'lending' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand/10 text-brand">
                        <HugeiconsIcon icon={BookOpen01Icon} size={12} />
                        <span>For Lending</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800">
                        <HugeiconsIcon icon={GiftIcon} size={12} />
                        <span>For Donation</span>
                      </span>
                    )}

                    {book.condition && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        {book.condition}
                      </span>
                    )}

                    {book.pendingRequests > 0 && (
                      <span className="text-xs font-semibold text-amber-badge">
                        • {book.pendingRequests} Requests pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                {book.pendingRequests > 0 ? (
                  <button
                    onClick={onOpenRequests}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 animate-pulse"
                  >
                    <span>Review Request ({book.pendingRequests})</span>
                  </button>
                ) : (
                  <button className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition">
                    Edit
                  </button>
                )}

                <button 
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="More actions"
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
