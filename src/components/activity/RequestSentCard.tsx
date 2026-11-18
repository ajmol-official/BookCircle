import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Comment01Icon,
  BookOpen01Icon,
  Calendar01Icon,
  Location01Icon,
  GiftIcon,
} from '@hugeicons/core-free-icons';
import type { ExchangeTransaction } from '../../types';

export interface RequestSentCardProps {
  request: ExchangeTransaction;
  onCancelRequest: (request: ExchangeTransaction) => void;
  onMessage?: (partnerName: string, bookTitle: string) => void;
  onSelectBook?: (bookTitle: string, bookId?: string) => void;
  onSelectParticipant?: (name: string, id?: string) => void;
}

/**
 * Format date & time matching Figma exactly:
 * "11:00 AM | Saturday | 23 Apr, 2026"
 */
export function formatRequestedMeetupDateTime(
  timeStr?: string,
  dateStr?: string
): string {
  const time = (timeStr || '11:00 AM').trim();
  const rawDate = (dateStr || 'Saturday').trim();

  // If already formatted with pipe segments: e.g. "11:00 AM | Saturday | 23 Apr, 2026"
  const pipeParts = rawDate.split('|').map((s) => s.trim());
  if (pipeParts.length === 3) {
    if (pipeParts[0].includes(':') || pipeParts[0].includes('AM') || pipeParts[0].includes('PM')) {
      return `${pipeParts[0]} | ${pipeParts[1]} | ${pipeParts[2]}`;
    }
    return `${pipeParts[1]} | ${pipeParts[0]} | ${pipeParts[2]}`;
  }

  let weekday = 'Saturday';
  let day = '23';
  let month = 'Apr';
  let year = '2026';

  if (rawDate.toLowerCase() === 'tomorrow') {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    day = String(d.getDate());
    month = d.toLocaleDateString('en-US', { month: 'short' });
    year = String(d.getFullYear());
  } else if (rawDate.toLowerCase() === 'today') {
    const d = new Date();
    weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    day = String(d.getDate());
    month = d.toLocaleDateString('en-US', { month: 'short' });
    year = String(d.getFullYear());
  } else {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const matchedDay = weekdays.find((w) => w.toLowerCase() === rawDate.toLowerCase());
    if (matchedDay) {
      const now = new Date();
      const currentDayIdx = now.getDay();
      const targetDayIdx = weekdays.indexOf(matchedDay);
      let diff = targetDayIdx - currentDayIdx;
      if (diff <= 0) diff += 7;
      now.setDate(now.getDate() + diff);
      weekday = matchedDay;
      day = String(now.getDate());
      month = now.toLocaleDateString('en-US', { month: 'short' });
      year = String(now.getFullYear());
    } else {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        weekday = parsed.toLocaleDateString('en-US', { weekday: 'long' });
        day = String(parsed.getDate());
        month = parsed.toLocaleDateString('en-US', { month: 'short' });
        year = String(parsed.getFullYear());
      } else {
        return `${time} | ${rawDate}`;
      }
    }
  }

  return `${time} | ${weekday} | ${day} ${month}, ${year}`;
}

export const RequestSentCard: React.FC<RequestSentCardProps> = ({
  request,
  onCancelRequest,
  onMessage,
  onSelectBook,
  onSelectParticipant,
}) => {
  const [imageError, setImageError] = useState(false);

  const isClaim = request.exchangeType === 'gift' || request.status === 'pending_claim';
  const requestAge = request.requestDate || '2 days ago';
  const requestAgeText = requestAge.toLowerCase().includes('ago') || requestAge.toLowerCase().includes('today')
    ? `(${requestAge})`
    : `(${requestAge} ago)`;

  const formattedDateTime = formatRequestedMeetupDateTime(request.meetupTime, request.meetupDate);
  const locationSpot = request.meetupSpot || 'Riverside Coffee, Rampura';

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-md transition-all duration-200">
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
        {/* Left: Book Thumbnail */}
        <div
          onClick={() => onSelectBook?.(request.bookTitle, request.catalogId || request.bookId)}
          className="cursor-pointer flex-shrink-0 transition-transform active:scale-95"
        >
          {!request.bookCover || imageError ? (
            <div
              className="w-14 h-20 sm:w-16 sm:h-22 rounded-xl bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center p-1.5 text-center select-none"
              title={request.bookTitle}
            >
              <HugeiconsIcon icon={BookOpen01Icon} size={20} className="text-brand/70 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-700 line-clamp-2 leading-tight px-0.5">
                {request.bookTitle ? request.bookTitle.slice(0, 16) : 'Book'}
              </span>
            </div>
          ) : (
            <img
              src={request.bookCover}
              alt={request.bookTitle}
              onError={() => setImageError(true)}
              className="w-14 h-20 sm:w-16 sm:h-22 object-cover rounded-xl shadow-xs border border-slate-200/80"
              loading="lazy"
            />
          )}
        </div>

        {/* Right: Content Column */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          {/* Top Row: Title & Status on left, Action buttons on right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="min-w-0">
              {/* Book Title in Serif */}
              <h4
                onClick={() => onSelectBook?.(request.bookTitle, request.catalogId || request.bookId)}
                className="font-serif text-base sm:text-lg font-semibold text-slate-900 truncate cursor-pointer hover:text-brand transition"
                title={request.bookTitle}
              >
                {request.bookTitle}
              </h4>

              {/* Status Pill & Owner Name */}
              <div className="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FFF4EC] text-[#C26118] whitespace-nowrap">
                  Awaiting owner response
                </span>

                <span className="text-xs sm:text-[13px] text-slate-500 font-normal truncate">
                  · With{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (request.ownerName) {
                        onSelectParticipant?.(request.ownerName, request.ownerId);
                      }
                    }}
                    className="font-semibold text-slate-700 hover:text-brand hover:underline cursor-pointer transition text-left inline"
                    title={`View ${request.ownerName}'s profile & shelf`}
                  >
                    {request.ownerName}
                  </button>
                </span>
              </div>
            </div>

            {/* Actions in Top Right */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => onCancelRequest(request)}
                className="h-10 px-4 sm:px-5 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand text-xs sm:text-sm font-semibold transition active:scale-95 flex items-center justify-center whitespace-nowrap text-center"
              >
                Cancel Request
              </button>

              <button
                type="button"
                onClick={() => onMessage?.(request.ownerName, request.bookTitle)}
                className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center justify-center relative flex-shrink-0 active:scale-95"
                title={`Message ${request.ownerName}`}
                aria-label={`Message ${request.ownerName}`}
              >
                <HugeiconsIcon icon={Comment01Icon} size={18} />
              </button>
            </div>
          </div>

          {/* Horizontal Divider Line */}
          <div className="w-full border-t border-slate-200/80 my-2.5 sm:my-3" />

          {/* Bottom Row: Metadata Row with Icons */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-[13px] text-slate-600 flex-wrap">
            {/* Item 1: Request Type & Age */}
            <div className={`flex items-center gap-1.5 font-medium whitespace-nowrap ${isClaim ? 'text-emerald-700' : 'text-slate-600'}`}>
              <HugeiconsIcon icon={isClaim ? GiftIcon : BookOpen01Icon} size={15} className="flex-shrink-0" />
              <span>
                {isClaim ? 'Free claim Request' : 'Borrow Request'} {requestAgeText}
              </span>
            </div>

            {/* Item 2: Meetup Time */}
            <div className="flex items-center gap-1.5 font-normal text-slate-500 whitespace-nowrap">
              <HugeiconsIcon icon={Calendar01Icon} size={15} className="flex-shrink-0 text-slate-400" />
              <span>{formattedDateTime}</span>
            </div>

            {/* Item 3: Meetup Spot */}
            <div className="flex items-center gap-1.5 font-normal text-slate-500 whitespace-nowrap">
              <HugeiconsIcon icon={Location01Icon} size={15} className="flex-shrink-0 text-slate-400" />
              <span className="truncate">{locationSpot}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
