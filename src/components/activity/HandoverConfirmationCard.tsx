import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Comment01Icon,
  MoreVerticalIcon,
  Notification01Icon,
  AlertCircleIcon,
  Location01Icon,
  CheckmarkCircle02Icon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons';
import type { ExchangeTransaction } from '../../types';

export interface HandoverConfirmationCardProps {
  exchange: ExchangeTransaction;
  perspective: 'lender' | 'borrower';
  onConfirmHandover: (exchange: ExchangeTransaction) => void;
  onSendReminder: (exchangeId: string, perspective: 'lender' | 'borrower') => Promise<void> | void;
  onReportIssue: (exchange: ExchangeTransaction) => void;
  onMessage?: (participantName: string, bookTitle: string) => void;
  onSelectBook?: (bookTitle: string, bookId?: string) => void;
  onSelectParticipant?: (name: string, id?: string) => void;
  onViewSpot?: (spot: string) => void;
}

/**
 * Format schedule & spot to match Figma node 124-1488:
 * "Saturday, 11:30 PM, 23 Aug, 26 | Central Library"
 */
export function formatHandoverSchedule(
  dateStr?: string,
  timeStr?: string,
  spotStr?: string
): string {
  const time = (timeStr || '11:30 AM').trim();
  const rawDate = (dateStr || 'Upcoming').trim();
  const spot = (spotStr || '').trim();

  let formattedDatePart = '';

  // Check if dateStr was previously formatted with pipe segments: "Saturday | 11:00 AM | 23 Apr 2026"
  const pipeParts = rawDate.split('|').map((s) => s.trim());
  if (pipeParts.length === 3) {
    const weekday = pipeParts[0];
    const t = pipeParts[1] || time;
    const d = pipeParts[2];
    // Shorten year "2026" to "26" if 4 digits
    const shortDate = d.replace(/\b20(\d{2})\b/, '$1');
    formattedDatePart = `${weekday}, ${t}, ${shortDate}`;
  } else if (rawDate.toLowerCase() === 'tomorrow') {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    formattedDatePart = `${weekday}, ${time}, ${day} ${month}, ${year}`;
  } else if (rawDate.toLowerCase() === 'today') {
    const d = new Date();
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    formattedDatePart = `${weekday}, ${time}, ${day} ${month}, ${year}`;
  } else {
    // If it's a weekday name alone (e.g. "Saturday", "Sunday")
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const matchedDay = weekdays.find((w) => w.toLowerCase() === rawDate.toLowerCase());
    if (matchedDay) {
      const now = new Date();
      const currentDayIdx = now.getDay();
      const targetDayIdx = weekdays.indexOf(matchedDay);
      let diff = targetDayIdx - currentDayIdx;
      if (diff <= 0) diff += 7;
      now.setDate(now.getDate() + diff);
      const day = now.getDate();
      const month = now.toLocaleDateString('en-US', { month: 'short' });
      const year = String(now.getFullYear()).slice(-2);
      formattedDatePart = `${matchedDay}, ${time}, ${day} ${month}, ${year}`;
    } else {
      // Attempt standard Date parsing
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        const weekday = parsed.toLocaleDateString('en-US', { weekday: 'long' });
        const day = parsed.getDate();
        const month = parsed.toLocaleDateString('en-US', { month: 'short' });
        const year = String(parsed.getFullYear()).slice(-2);
        formattedDatePart = `${weekday}, ${time}, ${day} ${month}, ${year}`;
      } else {
        formattedDatePart = `${rawDate}, ${time}`;
      }
    }
  }

  if (spot) {
    return `${formattedDatePart} | ${spot}`;
  }
  return formattedDatePart;
}

export const HandoverConfirmationCard: React.FC<HandoverConfirmationCardProps> = ({
  exchange,
  perspective,
  onConfirmHandover,
  onSendReminder,
  onReportIssue,
  onMessage,
  onSelectBook,
  onSelectParticipant,
  onViewSpot,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLender = perspective === 'lender';
  const partnerName = isLender ? exchange.borrowerName : exchange.ownerName;
  const partnerId = isLender ? exchange.borrowerId : exchange.ownerId;

  // Confirmation flags
  const isCurrentConfirmed = isLender
    ? Boolean(exchange.pickupConfirmation?.lenderConfirmed)
    : Boolean(exchange.pickupConfirmation?.borrowerConfirmed);

  const isOtherConfirmed = isLender
    ? Boolean(exchange.pickupConfirmation?.borrowerConfirmed)
    : Boolean(exchange.pickupConfirmation?.lenderConfirmed);

  const isDisputed = exchange.status === 'disputed_handover';
  const hasReminderBeenSent = Boolean(exchange.reminderSentAt);

  // Close overflow menu on outside click or escape key
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

  // Meetup schedule and spot string
  const scheduleFormatted = formatHandoverSchedule(
    exchange.meetupDate,
    exchange.meetupTime,
    exchange.meetupSpot
  );

  const handleReminderClick = async () => {
    setIsMenuOpen(false);
    if (hasReminderBeenSent || isSendingReminder) return;
    setIsSendingReminder(true);
    try {
      await onSendReminder(exchange.id, perspective);
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleSpotClick = () => {
    setIsMenuOpen(false);
    if (onViewSpot && exchange.meetupSpot) {
      onViewSpot(exchange.meetupSpot);
    } else if (exchange.meetupSpot) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        exchange.meetupSpot
      )}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleReportIssueClick = () => {
    setIsMenuOpen(false);
    onReportIssue(exchange);
  };

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-200 ${
        isDisputed
          ? 'border-amber-300 bg-amber-50/20 shadow-xs'
          : 'border-slate-200/90 shadow-card hover:shadow-md'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Thumbnail & Details */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {/* Book Thumbnail */}
          <div
            onClick={() => onSelectBook?.(exchange.bookTitle, exchange.bookId)}
            className={`cursor-pointer flex-shrink-0 transition-transform active:scale-95`}
          >
            {!exchange.bookCover || imageError ? (
              <div
                className="w-14 h-20 sm:w-16 sm:h-22 rounded-xl bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center p-1.5 text-center select-none"
                title={exchange.bookTitle}
              >
                <HugeiconsIcon icon={BookOpen01Icon} size={20} className="text-brand/70 mb-0.5" />
                <span className="text-[10px] font-bold text-slate-700 line-clamp-2 leading-tight px-0.5">
                  {exchange.bookTitle ? exchange.bookTitle.slice(0, 16) : 'Book'}
                </span>
              </div>
            ) : (
              <img
                src={exchange.bookCover}
                alt={exchange.bookTitle}
                onError={() => setImageError(true)}
                className="w-14 h-20 sm:w-16 sm:h-22 object-cover rounded-xl shadow-xs border border-slate-200/80"
                loading="lazy"
              />
            )}
          </div>

          {/* Details Column */}
          <div className="min-w-0 flex-1">
            {/* Row 1: Schedule & Spot in Figma Pipe Format */}
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-normal truncate">
              {scheduleFormatted}
            </p>

            {/* Row 2: Book Title in Serif */}
            <h4
              onClick={() => onSelectBook?.(exchange.bookTitle, exchange.catalogId || exchange.bookId)}
              className="font-serif text-base sm:text-lg font-bold text-slate-900 mt-0.5 sm:mt-1 truncate cursor-pointer hover:text-brand transition"
              title={exchange.bookTitle}
            >
              {exchange.bookTitle}
            </h4>

            {/* Row 3: Status Pill & Partner Name */}
            <div className="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EEF0FD] text-brand whitespace-nowrap">
                Handover Scheduled
              </span>

              <span className="text-xs sm:text-[13px] text-slate-500 font-normal truncate">
                · With{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (partnerName) {
                      onSelectParticipant?.(partnerName, partnerId);
                    }
                  }}
                  className="font-semibold text-slate-700 hover:text-brand hover:underline cursor-pointer transition text-left inline"
                  title={`View ${partnerName}'s profile & shelf`}
                >
                  {partnerName}
                </button>
              </span>

              {/* If other party already confirmed first */}
              {isOtherConfirmed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {partnerName} confirmed {isLender ? 'pickup' : 'handover'}
                </span>
              )}

              {/* If disputed */}
              {isDisputed && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 whitespace-nowrap">
                  Issue Flagged
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {!isCurrentConfirmed ? (
            /* State 1: Unconfirmed CTA */
            <button
              type="button"
              onClick={() => onConfirmHandover(exchange)}
              className="flex-1 sm:flex-initial h-10 px-5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 flex items-center justify-center whitespace-nowrap text-center"
            >
              {isLender ? 'I Handed Over Book' : 'I Received the Book'}
            </button>
          ) : (
            /* State 2: Confirmed Pill */
            <div className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-[#E1F3EA] text-[#22724D] border border-emerald-200/60 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap select-none">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={17} className="text-[#22724D] flex-shrink-0" />
              <span>{isLender ? 'You confirmed handover' : 'You confirmed receive'}</span>
            </div>
          )}

          {/* Chat with Partner Button */}
          <button
            type="button"
            onClick={() => onMessage?.(partnerName, exchange.bookTitle)}
            className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center justify-center flex-shrink-0 active:scale-95"
            title={`Message ${partnerName}`}
            aria-label={`Message ${partnerName}`}
          >
            <HugeiconsIcon icon={Comment01Icon} size={18} />
          </button>

          {/* State 2 Overflow Menu Button (Visible when Confirmed) */}
          {isCurrentConfirmed && (
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

              {/* Popover Dropdown */}
              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 px-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* Option 1: Remind */}
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
                      <div>Remind {partnerName}</div>
                      {hasReminderBeenSent && (
                        <div className="text-[11px] text-slate-400 font-normal">Reminder sent</div>
                      )}
                    </div>
                  </button>

                  {/* Option 2: View Spot on Map */}
                  {exchange.meetupSpot && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSpotClick}
                      className="w-full px-3 py-2 text-left rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                    >
                      <HugeiconsIcon icon={Location01Icon} size={16} className="text-slate-500" />
                      <div className="flex-1 min-w-0 truncate">
                        <div>View Meetup Spot</div>
                        <div className="text-[11px] text-slate-400 font-normal truncate">
                          {exchange.meetupSpot}
                        </div>
                      </div>
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100" />

                  {/* Option 3: Report Issue */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleReportIssueClick}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs sm:text-sm font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition"
                  >
                    <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-600" />
                    <span>Report an Issue</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Disputed Status Notice Banner */}
      {isDisputed && (
        <div className="pt-3 mt-3 border-t border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
          <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Handover Issue Reported:</strong> {exchange.disputeReason || 'Issue flagged during meetup.'} — Community support has been notified.
          </span>
        </div>
      )}
    </div>
  );
};
