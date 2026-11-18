import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Comment01Icon,
  MoreVerticalIcon,
  Notification01Icon,
  AlertCircleIcon,
  BookOpen01Icon,
  TimeQuarterPassIcon,
} from '@hugeicons/core-free-icons';
import type { ExchangeTransaction } from '../../types';

export interface CurrentlyLentCardProps {
  loan: ExchangeTransaction;
  onRecordDirectReturn: (loan: ExchangeTransaction) => void;
  onSendReminder?: (loan: ExchangeTransaction) => Promise<void> | void;
  onOfferExtension?: (loan: ExchangeTransaction) => void;
  onReportIssue?: (loan: ExchangeTransaction) => void;
  onMessage?: (partnerName: string, bookTitle: string) => void;
  onSelectBook?: (bookTitle: string, bookId?: string) => void;
  onSelectParticipant?: (name: string, id?: string) => void;
  unreadCount?: number;
}

export const CurrentlyLentCard: React.FC<CurrentlyLentCardProps> = ({
  loan,
  onRecordDirectReturn,
  onSendReminder,
  onOfferExtension,
  onReportIssue,
  onMessage,
  onSelectBook,
  onSelectParticipant,
  unreadCount = 0,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [hasReminderBeenSent, setHasReminderBeenSent] = useState(Boolean(loan.reminderSentAt));
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or escape key
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Determine loan duration metrics
  const totalDays = loan.totalDays || 30;
  const daysUsed = loan.daysUsed !== undefined ? loan.daysUsed : 12;
  const rawDaysLeft = loan.daysLeft !== undefined ? loan.daysLeft : 18;

  // Determine if overdue
  const isOverdue =
    rawDaysLeft < 0 ||
    Boolean(loan.dueDate?.toLowerCase().includes('overdue')) ||
    daysUsed > totalDays;

  const daysOverdue = isOverdue
    ? Math.abs(rawDaysLeft < 0 ? rawDaysLeft : daysUsed - totalDays || 12)
    : 0;

  const daysLeft = Math.max(0, rawDaysLeft);

  // Format handover text
  const handoverText = loan.handoverDate || `${daysUsed} days ago`;
  const handoverFormatted = handoverText.toLowerCase().startsWith('handed over')
    ? handoverText
    : `Handed over ${handoverText}`;

  const handleReminderClick = async () => {
    if (isSendingReminder || hasReminderBeenSent || !onSendReminder) return;
    setIsSendingReminder(true);
    try {
      await onSendReminder(loan);
      setHasReminderBeenSent(true);
      setIsMenuOpen(false);
    } finally {
      setIsSendingReminder(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-200 ${
        isOverdue
          ? 'border-red-200/90 shadow-card hover:shadow-md'
          : 'border-slate-200/90 shadow-card hover:shadow-md'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Thumbnail & Details */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {/* Book Thumbnail */}
          <div
            onClick={() => onSelectBook?.(loan.bookTitle, loan.catalogId || loan.bookId)}
            className="cursor-pointer flex-shrink-0 transition-transform active:scale-95"
          >
            {!loan.bookCover || imageError ? (
              <div
                className="w-14 h-20 sm:w-16 sm:h-22 rounded-xl bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center p-1.5 text-center select-none"
                title={loan.bookTitle}
              >
                <HugeiconsIcon icon={BookOpen01Icon} size={20} className="text-brand/70 mb-0.5" />
                <span className="text-[10px] font-bold text-slate-700 line-clamp-2 leading-tight px-0.5">
                  {loan.bookTitle ? loan.bookTitle.slice(0, 16) : 'Book'}
                </span>
              </div>
            ) : (
              <img
                src={loan.bookCover}
                alt={loan.bookTitle}
                onError={() => setImageError(true)}
                className="w-14 h-20 sm:w-16 sm:h-22 object-cover rounded-xl shadow-xs border border-slate-200/80"
                loading="lazy"
              />
            )}
          </div>

          {/* Details Column */}
          <div className="min-w-0 flex-1">
            {/* Row 1: Handed over metadata above title */}
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-normal truncate">
              {handoverFormatted}
            </p>

            {/* Row 2: Book Title in Serif */}
            <h4
              onClick={() => onSelectBook?.(loan.bookTitle, loan.catalogId || loan.bookId)}
              className="font-serif text-base sm:text-lg font-semibold text-slate-900 mt-0.5 sm:mt-1 truncate cursor-pointer hover:text-brand transition"
              title={loan.bookTitle}
            >
              {loan.bookTitle}
            </h4>

            {/* Row 3: Status Pill & Borrower Name */}
            <div className="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap">
              {isOverdue ? (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FEECEE] text-[#D93025] whitespace-nowrap">
                  {daysOverdue} days overdue
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EEF0FD] text-brand whitespace-nowrap">
                  {daysLeft === 0 ? 'Due today' : `Due in ${daysLeft} days`}
                </span>
              )}

              <span className="text-xs sm:text-[13px] text-slate-500 font-normal truncate">
                · With{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (loan.borrowerName) {
                      onSelectParticipant?.(loan.borrowerName, loan.borrowerId);
                    }
                  }}
                  className="font-semibold text-slate-700 hover:text-brand hover:underline cursor-pointer transition text-left inline"
                  title={`View ${loan.borrowerName}'s profile & shelf`}
                >
                  {loan.borrowerName}
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-2.5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={() => onRecordDirectReturn(loan)}
            className="flex-1 sm:flex-initial h-10 px-4 sm:px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 flex items-center justify-center whitespace-nowrap text-center"
          >
            Record Direct Return
          </button>

          {/* Message Borrower Button */}
          <button
            type="button"
            onClick={() => onMessage?.(loan.borrowerName, loan.bookTitle)}
            className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center justify-center relative flex-shrink-0 active:scale-95"
            title={`Message ${loan.borrowerName}`}
            aria-label={`Message ${loan.borrowerName}`}
          >
            <HugeiconsIcon icon={Comment01Icon} size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Overflow Menu Button [⋮] */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`w-10 h-10 rounded-xl border transition flex items-center justify-center flex-shrink-0 active:scale-95 ${
                isMenuOpen
                  ? 'border-brand text-brand bg-purple-50/50'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              title="More options"
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 px-1 z-30 animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Option 1: Send Return Reminder */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleReminderClick}
                  disabled={hasReminderBeenSent || isSendingReminder}
                  className={`w-full px-3 py-2 text-left rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 transition ${
                    hasReminderBeenSent || isSendingReminder
                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <HugeiconsIcon icon={Notification01Icon} size={16} className="text-slate-500" />
                  <div className="flex-1 min-w-0">
                    <div>Remind {loan.borrowerName}</div>
                    {hasReminderBeenSent && (
                      <div className="text-[11px] text-slate-400 font-normal">Reminder sent</div>
                    )}
                  </div>
                </button>

                {/* Option 2: Offer Loan Extension */}
                {onOfferExtension && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOfferExtension(loan);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                    <HugeiconsIcon icon={TimeQuarterPassIcon} size={16} className="text-slate-500" />
                    <span>Offer Loan Extension</span>
                  </button>
                )}

                <div className="my-1 border-t border-slate-100" />

                {/* Option 3: Report an Issue */}
                {onReportIssue && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onReportIssue(loan);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs sm:text-sm font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition"
                  >
                    <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-600" />
                    <span>Report an Issue</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
