import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  Location01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  BookOpen01Icon,
  GiftIcon,
  StarIcon
} from '@hugeicons/core-free-icons';
import type { ExchangeTransaction } from '../../types';

export interface BorrowRequestCardProps {
  request: ExchangeTransaction;
  onAcceptMeetup: (request: ExchangeTransaction) => void;
  onDecline: (request: ExchangeTransaction) => void;
  onSuggestDifferentTime: (request: ExchangeTransaction) => void;
  onSelectRequester?: (borrowerName: string, borrowerId?: string) => void;
  onSelectBook?: (bookTitle: string, bookId?: string) => void;
}

/**
 * Format schedule display into Figma-style pipe format:
 * e.g. "11:00 AM | Saturday | 23 Apr 2026"
 */
function formatMeetupSchedule(dateStr?: string, timeStr?: string): string {
  const time = timeStr || '11:00 AM';
  const rawDate = dateStr || 'Upcoming';

  // If rawDate already contains day or pipe formatting, return clean combo
  if (rawDate.includes('|')) {
    return `${time} | ${rawDate}`;
  }

  // Attempt parsing as a real date if formatted as ISO or standard date
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime()) && rawDate.includes('-')) {
    const dayName = parsed.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDay = parsed.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${time} | ${dayName} | ${formattedDay}`;
  }

  // Fallback for conversational dates ("Tomorrow", "Saturday", "23 Apr")
  return `${time} | ${rawDate}`;
}

export const BorrowRequestCard: React.FC<BorrowRequestCardProps> = ({
  request,
  onAcceptMeetup,
  onDecline,
  onSuggestDifferentTime,
  onSelectRequester,
  onSelectBook
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const isGiftClaim = request.exchangeType === 'gift';
  const scheduleFormatted = formatMeetupSchedule(request.meetupDate, request.meetupTime);

  // Trust rating helper (defaults to 4.6 if not provided)
  const trustRating = request.borrowerTrust && request.borrowerTrust.match(/\d+(\.\d+)?/)?.[0] || '4.6';
  const trustBadgeText = request.borrowerTrust?.split('·')?.[0]?.trim() || 'Reliable Neighbor';

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between group">
      <div>
        {/* ─── Top Header: Requester Identity & Action Controls ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Requester Identity */}
          <div
            onClick={() => onSelectRequester?.(request.borrowerName, request.borrowerId)}
            className={`flex items-center gap-3.5 ${
              onSelectRequester ? 'cursor-pointer group/requester' : ''
            }`}
            title={`View ${request.borrowerName}'s profile`}
          >
            {request.borrowerAvatar && !avatarError ? (
              <img
                src={request.borrowerAvatar}
                alt={request.borrowerName}
                onError={() => setAvatarError(true)}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 group-hover/requester:ring-brand/40 transition-all flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-brand/10 border-2 border-brand/20 text-brand font-bold text-sm flex items-center justify-center flex-shrink-0 select-none shadow-xs">
                {request.borrowerName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold text-slate-900 group-hover/requester:text-brand transition-colors truncate leading-tight">
                {request.borrowerName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                <span>{trustBadgeText}</span>
                <HugeiconsIcon
                  icon={StarIcon}
                  size={13}
                  className="text-amber-500 fill-amber-500 flex-shrink-0"
                />
                <span className="font-semibold text-slate-700">{trustRating}</span>
              </div>
            </div>
          </div>

          {/* Action Trio (Desktop: inline right / Mobile: styled below) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2.5 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0">
            {/* Suggest Different time Link */}
            <button
              type="button"
              onClick={() => onSuggestDifferentTime(request)}
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand underline decoration-slate-300 hover:decoration-brand underline-offset-4 transition cursor-pointer w-full sm:w-auto text-center sm:text-left order-3 sm:order-1 py-1 sm:py-0"
              title="Propose a different date, time, or location"
            >
              Suggest Different time
            </button>

            {/* Decline Button */}
            <button
              type="button"
              onClick={() => onDecline(request)}
              className="flex-1 sm:flex-initial h-9 px-3.5 sm:px-4 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer order-1 sm:order-2"
              title="Decline this request"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={15} />
              <span>Decline</span>
            </button>

            {/* Accept Meetup Button */}
            <button
              type="button"
              onClick={() => onAcceptMeetup(request)}
              className="flex-1 sm:flex-initial h-9 px-4 sm:px-5 rounded-lg bg-brand hover:bg-brand-dark active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer order-2 sm:order-3"
              title="Accept meetup and schedule book handover"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
              <span>Accept Meetup</span>
            </button>
          </div>
        </div>

        {/* ─── Middle Section: Requested Book Inset Box ─── */}
        <div
          onClick={() => onSelectBook?.(request.bookTitle, request.bookId)}
          className={`bg-[#F8FAFC] rounded-2xl p-3.5 sm:p-4 border border-slate-100 flex items-center gap-3.5 sm:gap-4 my-3.5 ${
            onSelectBook ? 'cursor-pointer group/book hover:bg-slate-100/70' : ''
          } transition`}
          title={`View details for “${request.bookTitle}”`}
        >
          {request.bookCover && !coverError ? (
            <img
              src={request.bookCover}
              alt={request.bookTitle}
              onError={() => setCoverError(true)}
              className="w-12 h-16 sm:w-13 sm:h-18 rounded-lg object-cover shadow-2xs flex-shrink-0 border border-slate-200/80 group-hover/book:scale-102 transition"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-16 sm:w-13 sm:h-18 rounded-lg bg-gradient-to-br from-brand/10 to-amber-500/10 border border-slate-200 shadow-2xs flex flex-col items-center justify-center p-1 text-center flex-shrink-0">
              <HugeiconsIcon icon={BookOpen01Icon} size={18} className="text-brand/70 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-700 line-clamp-1">
                {request.bookTitle?.slice(0, 8) || 'Book'}
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
              Requested Book
            </p>
            <h4 className="font-serif text-base sm:text-lg font-bold text-slate-900 group-hover/book:text-brand transition-colors truncate">
              {request.bookTitle}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              by {request.bookAuthor}
            </p>
          </div>
        </div>

        {/* ─── Personal Note / Message from Requester (Italic prose) ─── */}
        {request.message && request.message.trim().length > 0 && (
          <p className="italic text-xs sm:text-sm text-slate-600 leading-relaxed px-0.5 my-3.5">
            “{request.message.trim()}”
          </p>
        )}
      </div>

      {/* ─── Bottom Shelf: Metadata Bar (Type, Schedule, Spot) ─── */}
      <div className="pt-3.5 mt-1 border-t border-slate-100 flex flex-wrap items-center justify-between gap-y-2.5 gap-x-4 text-xs sm:text-sm">
        {/* Request Type */}
        {isGiftClaim ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
            <HugeiconsIcon icon={GiftIcon} size={15} />
            <span>Free claim</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
            <HugeiconsIcon icon={BookOpen01Icon} size={15} />
            <span>Wants to Borrow</span>
          </span>
        )}

        {/* Schedule */}
        <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
          <HugeiconsIcon icon={Calendar01Icon} size={15} className="text-slate-400 flex-shrink-0" />
          <span>{scheduleFormatted}</span>
        </span>

        {/* Location Spot */}
        <span
          className="inline-flex items-center gap-1.5 text-slate-600 font-medium truncate max-w-[280px]"
          title={request.meetupSpot}
        >
          <HugeiconsIcon icon={Location01Icon} size={15} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{request.meetupSpot || 'Neighborhood meetup spot'}</span>
        </span>
      </div>
    </div>
  );
};
