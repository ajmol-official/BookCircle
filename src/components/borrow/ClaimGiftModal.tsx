import React, { useState, useEffect, useMemo } from 'react';
import {
  getUpcomingHandoverDates,
  DEFAULT_PUBLIC_MEETUP_SPOTS,
  formatTime24To12,
} from '../../utils/dateUtils';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Location01Icon,
  StarIcon,
  SentIcon,
  GiftIcon,
  SparklesIcon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';

export interface OwnerOption {
  id: string;
  name: string;
  avatar: string;
  distance: string;
  memberSince: string;
  lendsCount: number;
  trust: string;
  note?: string;
}

export interface ClaimGiftDetails {
  book: Book;
  owner: OwnerOption;
  date: string;
  time: string;
  spot: string;
  note: string;
}

export interface ClaimGiftModalProps {
  isOpen: boolean;
  book: Book | null;
  initialOwnerName?: string;
  targetOwnerName?: string;
  onClose: () => void;
  onClaimSubmitted?: (details: ClaimGiftDetails) => void;
}

export const ClaimGiftModal: React.FC<ClaimGiftModalProps> = ({
  isOpen,
  book,
  initialOwnerName,
  targetOwnerName,
  onClose,
  onClaimSubmitted,
}) => {
  const activeTargetName = initialOwnerName || targetOwnerName;
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Dynamic simulated donor/giver for this book
  const owners: OwnerOption[] = useMemo(() => {
    const list: OwnerOption[] = [
      {
        id: 'owner-target',
        name: activeTargetName || book?.ownerName || 'Rahim Chowdhury',
        avatar:
          book?.ownerAvatar ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        distance: book?.distance || '0.6 km away',
        memberSince: '2024',
        lendsCount: 14,
        trust: 'Community Giver (Verified)',
        note: 'Gifting this copy to share joy of reading with neighbors!',
      },
    ];

    return list;
  }, [activeTargetName, book]);

  const [selectedOwner, setSelectedOwner] = useState(owners[0]);
  const [claimNote, setClaimNote] = useState(
    'Thank you so much for offering this book as a community gift! I will read and cherish it, and pass the kindness forward.'
  );

  useEffect(() => {
    if (owners[0]) {
      setSelectedOwner(owners[0]);
    }
    setClaimNote(
      'Thank you so much for offering this book as a community gift! I will read and cherish it, and pass the kindness forward.'
    );
    setStep(1);
    setIsSuccess(false);
    setIsCustomTime(false);
    setCustomTimeRaw('16:00');
  }, [book, activeTargetName, owners, isOpen]);

  // Step 2: Date, Time & Public Pickup Spot
  const dates = useMemo(() => getUpcomingHandoverDates(), []);
  const [selectedDate, setSelectedDate] = useState(() => dates[1]?.val || dates[0]?.val || 'Tomorrow');

  const timeSlots = ['9:00 AM', '10:00 AM', '11:30 AM', '2:00 PM', '5:30 PM'];
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeRaw, setCustomTimeRaw] = useState('16:00');

  const spots = DEFAULT_PUBLIC_MEETUP_SPOTS;
  const [selectedSpot, setSelectedSpot] = useState(spots[0].name);
  const [customSpot, setCustomSpot] = useState('');

  // Step 3 Confirmation state
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !book) return null;

  const customFormattedTime = customTimeRaw ? formatTime24To12(customTimeRaw) : '';
  const effectiveTime = isCustomTime ? customFormattedTime : selectedTime;
  const isTimeValid = Boolean(effectiveTime);
  const isLocationValid = Boolean(customSpot.trim() || selectedSpot);

  const handleFinalSubmit = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onClaimSubmitted?.({
        book,
        owner: selectedOwner,
        date: selectedDate,
        time: effectiveTime,
        spot: customSpot.trim() || selectedSpot,
        note: claimNote,
      });
      setIsSuccess(false);
      setStep(1);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-5 sm:px-6 pt-5 pb-3.5 border-b border-slate-100 bg-white relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition z-10"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>

          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between max-w-sm mx-auto mb-3 px-2 pr-6 sm:pr-2">
            {/* Step 1 */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 1
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                1
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                Gift Details
              </span>
            </div>

            <div
              className={`flex-1 h-[2px] mx-2 transition-colors ${
                step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            />

            {/* Step 2 */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 2
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                Pickup Spot
              </span>
            </div>

            <div
              className={`flex-1 h-[2px] mx-2 transition-colors ${
                step >= 3 ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            />

            {/* Step 3 */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 3
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold ${step === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                Confirm Gift
              </span>
            </div>
          </div>

          {/* Free Gift Book Summary Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-2xs">
                    <HugeiconsIcon icon={GiftIcon} size={11} />
                    <span>Free Community Gift</span>
                  </span>
                </div>
                <h4 className="font-serif text-sm sm:text-base font-semibold text-slate-900 truncate">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate">by {book.author}</p>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-0.5">
                  <HugeiconsIcon icon={StarIcon} size={13} className="fill-amber-400 text-amber-500" />
                  <span className="font-bold text-slate-700">{book.rating}</span>
                  <span className="text-slate-400 text-[11px]">({book.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <HugeiconsIcon icon={SparklesIcon} size={12} className="text-emerald-700" />
                <span>Keep forever</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">{book.distance} away</p>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5 overscroll-contain">
          {/* STEP 1: GIFT DETAILS */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800">
                  Claim this free community book
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Offered with generosity by your neighbor {selectedOwner.name}. Yours to keep permanently!
                </p>
              </div>

              {/* Generosity highlight banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HugeiconsIcon icon={GiftIcon} size={16} />
                </div>
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold text-emerald-950">100% Free · No Return Required</p>
                  <p className="text-emerald-800 text-xs mt-0.5">
                    This book was donated to the community shelf. Arrange a quick, friendly public meetup to collect your copy.
                  </p>
                </div>
              </div>

              {/* Giver info card */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Donating Neighbor
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Verified Giver
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedOwner.avatar}
                    alt={selectedOwner.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
                  />
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-slate-900">{selectedOwner.name}</h4>
                    <p className="text-xs text-slate-500">
                      Member since {selectedOwner.memberSince} · {selectedOwner.distance}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  “{selectedOwner.note}”
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: SET PICKUP MEETUP */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800">
                  Schedule pickup meetup
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose a convenient public spot and time to collect your free book from {selectedOwner.name}.
                </p>
              </div>

              {/* Date selection cards */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Pickup Date
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {dates.map((d) => {
                    const val = `${d.day} ${d.date}`;
                    const isSelected = selectedDate === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedDate(val)}
                        className={`p-2 rounded-xl border text-center transition ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <p className={`text-[10px] sm:text-[11px] font-medium ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                          {d.day}
                        </p>
                        <p className="text-xs sm:text-sm font-bold mt-0.5">{d.date}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time selection chips + Custom Time input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Pickup Time
                  </label>
                  {isCustomTime && effectiveTime && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Selected: {effectiveTime}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {timeSlots.map((t) => {
                    const isSelected = !isCustomTime && selectedTime === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setSelectedTime(t);
                          setIsCustomTime(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setIsCustomTime(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      isCustomTime
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <HugeiconsIcon icon={Clock01Icon} size={13} />
                    <span>Custom Time</span>
                  </button>
                </div>

                {isCustomTime && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 animate-in fade-in duration-150">
                    <div className="flex items-center gap-3">
                      <label htmlFor="claim-custom-time" className="text-xs font-medium text-slate-600 flex-shrink-0 flex items-center gap-1.5">
                        <HugeiconsIcon icon={Clock01Icon} size={14} className="text-emerald-700" />
                        <span>Enter meeting time:</span>
                      </label>
                      <div className="relative flex-1 max-w-[150px]">
                        <input
                          id="claim-custom-time"
                          type="time"
                          value={customTimeRaw}
                          onChange={(e) => setCustomTimeRaw(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm"
                          required
                        />
                      </div>
                      {customFormattedTime && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-lg">
                          {customFormattedTime}
                        </span>
                      )}
                    </div>
                    {!customTimeRaw && (
                      <p className="text-[11px] text-amber-600 mt-1.5 font-medium">
                        Please specify a valid meeting time.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Predefined Public Meetup Spots (2 practical spots) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Public Handover Spot
                </label>
                <div className="space-y-2">
                  {spots.map((spot) => {
                    const isSelected = selectedSpot === spot.name && !customSpot.trim();
                    return (
                      <div
                        key={spot.id}
                        onClick={() => {
                          setSelectedSpot(spot.name);
                          setCustomSpot('');
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={Location01Icon} size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{spot.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{spot.distanceText}</p>
                          </div>
                        </div>

                        <div className="text-emerald-700 flex-shrink-0">
                          {isSelected ? (
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-700" />
                          ) : (
                            <HugeiconsIcon icon={CircleIcon} size={18} className="text-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Location input */}
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={customSpot}
                    onChange={(e) => setCustomSpot(e.target.value)}
                    placeholder="Or type a custom handover location..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM CLAIM */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              {isSuccess ? (
                <div className="py-10 text-center animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3 ring-8 ring-emerald-50">
                    <HugeiconsIcon icon={GiftIcon} size={30} />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                    Free Gift Claimed Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
                    {selectedOwner.name} has been notified of your claim for{' '}
                    <span className="font-semibold text-slate-800">“{book.title}”</span>.
                  </p>
                  <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 max-w-md mx-auto text-xs text-emerald-950 text-left">
                    <p className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-700" />
                      <span>Meetup Scheduled</span>
                    </p>
                    <p>
                      Meet at <strong>{customSpot.trim() || selectedSpot}</strong> on <strong>{selectedDate} at {effectiveTime}</strong> to collect your book.
                    </p>
                    <p className="mt-2 text-emerald-800 text-[11px] font-medium border-t border-emerald-200/80 pt-1.5">
                      🎁 Permanent Community Gift — once collected, this book is yours to keep forever. No return needed!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800">
                      Review & Confirm Gift Claim
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review your handover details before sending your claim to {selectedOwner.name}.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3 text-xs sm:text-sm">
                    {/* Donating Neighbor */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-emerald-100">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Donating Neighbor
                      </span>
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <img
                          src={selectedOwner.avatar}
                          alt={selectedOwner.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{selectedOwner.name}</span>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-emerald-100">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Pickup Time
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedDate} @ {effectiveTime}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-emerald-100">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Handover Spot
                      </span>
                      <span className="font-semibold text-slate-800 text-right max-w-xs truncate">
                        {customSpot.trim() || selectedSpot}
                      </span>
                    </div>

                    {/* Gift Terms */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-emerald-100">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Gift Terms
                      </span>
                      <span className="font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-lg text-xs">
                        🎁 Free to keep permanently
                      </span>
                    </div>

                    {/* Note */}
                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Your Thank-You Message
                      </span>
                      <p className="mt-1 text-slate-700 italic bg-white p-2.5 rounded-xl border border-emerald-200/60 text-xs">
                        “{claimNote}”
                      </p>
                    </div>
                  </div>

                  {/* Courtesy Notice */}
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center gap-2 text-xs text-amber-900">
                    <HugeiconsIcon icon={GiftIcon} size={15} className="text-amber-700 flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs">
                      Community gifts are given freely. Please arrive promptly at the agreed public meetup spot.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Fixed Sticky Footer Navigation */}
        {!isSuccess && (
          <div className="flex-shrink-0 px-5 sm:px-6 py-3.5 bg-slate-50/90 backdrop-blur border-t border-slate-100 flex items-center justify-between gap-3">
            {step === 1 && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition px-2 py-1"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
                >
                  <span>Choose Pickup Time & Place</span>
                  <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition px-2 py-1"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!isTimeValid || !isLocationValid}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
                >
                  <span>Review Gift Claim</span>
                  <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition px-2 py-1"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                  <span>Back to edit</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
                >
                  <HugeiconsIcon icon={SentIcon} size={16} />
                  <span>Confirm & Claim Free Book</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
