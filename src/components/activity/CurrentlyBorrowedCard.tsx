import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Comment01Icon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons';
import type { ExchangeTransaction } from '../../types';

export interface CurrentlyBorrowedCardProps {
  loan: ExchangeTransaction;
  onScheduleReturn: (loan: ExchangeTransaction) => void;
  onRequestExtension?: (loan: ExchangeTransaction) => void;
  onMessage?: (partnerName: string, bookTitle: string) => void;
  onSelectBook?: (bookTitle: string, bookId?: string) => void;
  onSelectParticipant?: (name: string, id?: string) => void;
  unreadCount?: number;
}

export const CurrentlyBorrowedCard: React.FC<CurrentlyBorrowedCardProps> = ({
  loan,
  onScheduleReturn,
  onRequestExtension,
  onMessage,
  onSelectBook,
  onSelectParticipant,
  unreadCount = 0,
}) => {
  const [imageError, setImageError] = useState(false);

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
    ? Math.abs(rawDaysLeft < 0 ? rawDaysLeft : daysUsed - totalDays || 10)
    : 0;

  const daysLeft = Math.max(0, rawDaysLeft);

  // Progress percentage
  const progressPercent = isOverdue
    ? 100
    : Math.min(100, Math.max(0, Math.round((daysUsed / totalDays) * 100)));

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-200 ${
        isOverdue
          ? 'border-red-200/90 shadow-card hover:shadow-md'
          : 'border-slate-200/90 shadow-card hover:shadow-md'
      }`}
    >
      <div className="flex flex-col gap-3.5">
        {/* Top Section: Book thumbnail, Title, Status, and Actions */}
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
              {/* Row 1: Book Title in Serif */}
              <h4
                onClick={() => onSelectBook?.(loan.bookTitle, loan.catalogId || loan.bookId)}
                className="font-serif text-base sm:text-lg font-bold text-slate-900 truncate cursor-pointer hover:text-brand transition"
                title={loan.bookTitle}
              >
                {loan.bookTitle}
              </h4>

              {/* Row 2: Status Pill & Partner Name */}
              <div className="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap">
                {isOverdue ? (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FEECEE] text-[#D93025] whitespace-nowrap">
                    {daysOverdue} days overdue
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EEF0FD] text-brand whitespace-nowrap">
                    Reading Now
                  </span>
                )}

                <span className="text-xs sm:text-[13px] text-slate-500 font-normal truncate">
                  · With{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (loan.ownerName) {
                        onSelectParticipant?.(loan.ownerName, loan.ownerId);
                      }
                    }}
                    className="font-semibold text-slate-700 hover:text-brand hover:underline cursor-pointer transition text-left inline"
                    title={`View ${loan.ownerName}'s profile & shelf`}
                  >
                    {loan.ownerName}
                  </button>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-2.5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
            <button
              type="button"
              onClick={() => onScheduleReturn(loan)}
              className="flex-1 sm:flex-initial h-10 px-4 sm:px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 flex items-center justify-center whitespace-nowrap text-center"
            >
              Schedule Return Handover
            </button>

            {/* Message Owner Button with Unread Badge */}
            <button
              type="button"
              onClick={() => onMessage?.(loan.ownerName, loan.bookTitle)}
              className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center justify-center relative flex-shrink-0 active:scale-95"
              title={`Message ${loan.ownerName}`}
              aria-label={`Message ${loan.ownerName}`}
            >
              <HugeiconsIcon icon={Comment01Icon} size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Section: Countdown / Overdue Note + Usage metrics + Full-Width Progress Track */}
        <div className="space-y-1.5 pt-1 sm:pt-0">
          {/* Labels Row */}
          <div className="flex items-center justify-between text-xs sm:text-[13px] gap-2 flex-wrap">
            {isOverdue ? (
              <div className="text-slate-600 flex items-center gap-1.5 flex-wrap">
                <span>Please talk to the lender to extend your time.</span>
                {onRequestExtension && (
                  <button
                    type="button"
                    onClick={() => onRequestExtension(loan)}
                    className="text-brand font-semibold hover:underline cursor-pointer inline-flex items-center"
                  >
                    Request Extension
                  </button>
                )}
              </div>
            ) : (
              <div className="text-slate-600 flex items-center gap-2">
                <span>Due in {daysLeft} days</span>
                {onRequestExtension && (
                  <button
                    type="button"
                    onClick={() => onRequestExtension(loan)}
                    className="text-slate-400 hover:text-brand text-xs transition cursor-pointer"
                    title="Need more time? Request an extension"
                  >
                    (Extend Time)
                  </button>
                )}
              </div>
            )}

            <div
              className={`text-right flex-shrink-0 font-normal ${
                isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'
              }`}
            >
              {isOverdue
                ? `30-day loan · ${daysOverdue} days past due`
                : `${daysUsed} of ${totalDays} days used`}
            </div>
          </div>

          {/* Full-Width Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[#E5E9F2] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverdue ? 'bg-rose-500' : 'bg-brand'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
