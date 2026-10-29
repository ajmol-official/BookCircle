import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BubbleChatIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Cancel01Icon,
  Location01Icon,
  Calendar01Icon,
  ShieldCheckIcon,
  ArrowRight02Icon,
  Tick01Icon
} from '@hugeicons/core-free-icons';
import { ReturnWizardModal, type BorrowedBookItem, type ReturnHandoverDetails } from '../borrow/ReturnWizardModal';

interface BorrowingViewProps {
  onMessageOwner: (owner: string, bookTitle: string) => void;
}

const getRelativeDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

export const BorrowingView: React.FC<BorrowingViewProps> = ({ onMessageOwner }) => {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBookItem[]>([
    {
      id: 'borrow-1',
      catalogId: 'the-overstory',
      title: 'The Overstory',
      author: 'Richard Powers',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200',
      owner: 'Diego Ramirez',
      ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      collectedDate: getRelativeDate(-12),
      dueDate: getRelativeDate(18),
      daysUsed: 12,
      totalDays: 30,
      daysLeft: 18,
      status: 'active'
    },
    {
      id: 'borrow-2',
      catalogId: 'sapiens',
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      cover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=200',
      owner: 'Hana Yamada',
      ownerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      collectedDate: getRelativeDate(-22),
      dueDate: getRelativeDate(8),
      daysUsed: 22,
      totalDays: 30,
      daysLeft: 8,
      status: 'warning'
    }
  ]);

  const [awaitingApproval, setAwaitingApproval] = useState([
    {
      id: 'await-1',
      title: 'The Night Circus',
      author: 'Erin Morgenstern',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
      owner: 'Jonas Meier',
      ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      sentTime: 'Yesterday'
    }
  ]);

  // Return modal state
  const [selectedBookForReturn, setSelectedBookForReturn] = useState<BorrowedBookItem | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Notice banner state
  const [returnNotice, setReturnNotice] = useState<{
    message: string;
    trackingCode?: string;
  } | null>(null);

  const handleOpenReturnModal = (book: BorrowedBookItem) => {
    setSelectedBookForReturn(book);
    setIsReturnModalOpen(true);
  };

  const handleReturnScheduled = (details: ReturnHandoverDetails) => {
    setBorrowedBooks((prev) =>
      prev.map((b) => {
        if (b.id === details.bookId) {
          return {
            ...b,
            status: 'return_pending',
            returnSchedule: {
              trackingCode: details.trackingCode,
              date: details.date,
              time: details.time,
              spot: details.spot,
              status: 'pending_owner'
            }
          };
        }
        return b;
      })
    );

    const targetBook = borrowedBooks.find((b) => b.id === details.bookId);
    setReturnNotice({
      message: `Return handover #${details.trackingCode} scheduled with ${targetBook?.owner || 'owner'} for ${details.date} @ ${details.time} at ${details.spot}. Both parties will verify receipt on meetup!`,
      trackingCode: details.trackingCode
    });

    setTimeout(() => {
      setReturnNotice(null);
    }, 6000);
  };

  const handleCompleteHandover = (bookId: string) => {
    const book = borrowedBooks.find((b) => b.id === bookId);
    setBorrowedBooks((prev) => prev.filter((b) => b.id !== bookId));
    setReturnNotice({
      message: `🎉 Handover complete! “${book?.title}” successfully returned to ${book?.owner}. Trust scores updated!`,
      trackingCode: book?.returnSchedule?.trackingCode
    });

    setTimeout(() => {
      setReturnNotice(null);
    }, 5000);
  };

  const handleCancelRequest = (id: string) => {
    setAwaitingApproval((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Toast Notification Banner */}
      {returnNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">{returnNotice.message}</p>
              {returnNotice.trackingCode && (
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Traceable Audit ID: <span className="font-mono font-bold">#{returnNotice.trackingCode}</span> · Synced with BookCircle Trust Registry
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setReturnNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1.5 rounded-full hover:bg-emerald-100/60 transition"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      )}

      {/* Traceable Process Information Card */}
      <div className="p-4 rounded-2xl bg-white border border-brand/20 shadow-xs flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
            <HugeiconsIcon icon={ShieldCheckIcon} size={22} />
          </div>
          <div>
            <h4 className="font-serif text-sm sm:text-base font-semibold text-slate-900">
              Structured Handover & Return Protocol
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Select verified meetup spots, time, and record condition for every book exchange to keep returns safe, transparent, and accountable.
            </p>
          </div>
        </div>
      </div>

      {/* Active Borrows */}
      <div>
        <div className="mb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
            Currently Borrowing ({borrowedBooks.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Keep track of return countdowns and coordinate structured handovers with owners.
          </p>
        </div>

        <div className="space-y-4">
          {borrowedBooks.map((book) => {
            const percent = Math.round((book.daysUsed / book.totalDays) * 100);
            const isNearDue = book.daysLeft <= 8;
            const isReturnScheduled = Boolean(book.returnSchedule);

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col gap-4"
              >
                {/* Book & Owner Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-14 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-serif text-lg font-semibold text-slate-800">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{book.author}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        From <strong className="text-slate-700 font-medium">{book.owner}</strong> · Collected {book.collectedDate}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
                    {isReturnScheduled ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCompleteHandover(book.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95"
                          title="Confirm physical book handover at meeting spot"
                        >
                          <HugeiconsIcon icon={Tick01Icon} size={15} />
                          <span>Complete Return</span>
                        </button>
                        <button
                          onClick={() => handleOpenReturnModal(book)}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-medium transition"
                        >
                          Reschedule
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenReturnModal(book)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95"
                      >
                        <HugeiconsIcon icon={Calendar01Icon} size={16} />
                        <span>Return Book</span>
                      </button>
                    )}

                    <button
                      onClick={() => onMessageOwner(book.owner, book.title)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition"
                    >
                      <HugeiconsIcon icon={BubbleChatIcon} size={16} />
                      <span className="hidden sm:inline">Message</span>
                    </button>
                  </div>
                </div>

                {/* Return Handover Status Banner (if scheduled) */}
                {book.returnSchedule && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-800 flex items-center gap-1">
                          <HugeiconsIcon icon={Clock01Icon} size={14} />
                          Return Handover Scheduled
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                          #{book.returnSchedule.trackingCode}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                          Pending owner confirmation
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-emerald-900 text-[11px] flex-wrap">
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={Calendar01Icon} size={12} />
                          {book.returnSchedule.date} at {book.returnSchedule.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={Location01Icon} size={12} />
                          {book.returnSchedule.spot}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenReturnModal(book)}
                      className="text-xs text-brand hover:underline font-semibold flex items-center gap-1 whitespace-nowrap self-end sm:self-auto"
                    >
                      <span>View handover plan</span>
                      <HugeiconsIcon icon={ArrowRight02Icon} size={13} />
                    </button>
                  </div>
                )}

                {/* Progress bar container */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">
                      {book.daysUsed} of {book.totalDays} days used - due {book.dueDate}
                    </span>
                    <span className={`font-semibold ${isNearDue ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {book.daysLeft} days left
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNearDue ? 'bg-amber-badge' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Awaiting Approval */}
      <div>
        <div className="mb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
            Awaiting Approval ({awaitingApproval.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Requests you’ve sent to local book owners.
          </p>
        </div>

        {awaitingApproval.length > 0 ? (
          <div className="space-y-3">
            {awaitingApproval.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={req.cover}
                    alt={req.title}
                    className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-serif text-base font-semibold text-slate-800">
                      {req.title}
                    </h4>
                    <p className="text-xs text-slate-500">{req.author}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <HugeiconsIcon icon={Clock01Icon} size={13} />
                      <span>Request sent to {req.owner} · {req.sentTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => handleCancelRequest(req.id)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs sm:text-sm font-semibold transition"
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center text-slate-400 text-xs sm:text-sm">
            No pending borrow requests right now.
          </div>
        )}
      </div>

      {/* Return Multistep Wizard Modal */}
      <ReturnWizardModal
        isOpen={isReturnModalOpen}
        book={selectedBookForReturn}
        onClose={() => setIsReturnModalOpen(false)}
        onReturnScheduled={handleReturnScheduled}
      />

    </div>
  );
};
