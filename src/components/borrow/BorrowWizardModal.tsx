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

export interface BorrowHandoverDetails {
  book: Book;
  owner: OwnerOption;
  date: string;
  time: string;
  spot: string;
  note: string;
}

export interface BorrowWizardModalProps {
  isOpen: boolean;
  book: Book | null;
  initialOwnerName?: string;
  targetOwnerName?: string;
  onClose: () => void;
  onRequestSubmitted?: (details: BorrowHandoverDetails) => void;
  onBorrowRequested?: (details: BorrowHandoverDetails) => void;
}

export const BorrowWizardModal: React.FC<BorrowWizardModalProps> = ({
  isOpen,
  book,
  initialOwnerName,
  targetOwnerName,
  onClose,
  onRequestSubmitted,
  onBorrowRequested,
}) => {
  const activeTargetName = initialOwnerName || targetOwnerName;
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Dynamic simulated owners for this book
  const owners: OwnerOption[] = useMemo(() => {
    const list: OwnerOption[] = [
      {
        id: 'owner-target',
        name: activeTargetName || book?.ownerName || 'Aisha Patel',
        avatar:
          book?.ownerAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        distance: book?.distance || '0.4 km away',
        memberSince: '2023',
        lendsCount: 42,
        trust: book?.ownerTrust || 'Tier 5 · Verified',
        note: 'Prefers meeting at local cafes',
      },
      {
        id: 'owner-amira',
        name: 'Amira Khan',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        distance: '1.8 km away',
        memberSince: '2023',
        lendsCount: 19,
        trust: '4.7 (Good)',
        note: 'Available on weekday evenings',
      },
      {
        id: 'owner-diego',
        name: 'Diego Ramirez',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        distance: '2.9 km away',
        memberSince: '2024',
        lendsCount: 31,
        trust: '4.9 (Top Lender)',
        note: 'Has clean hardcover edition',
      },
    ];

    const unique = list.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.name.toLowerCase() === item.name.toLowerCase())
    );
    return unique;
  }, [activeTargetName, book]);

  const [selectedOwner, setSelectedOwner] = useState(owners[0]);
  const [borrowNote, setBorrowNote] = useState(
    'Hi! I’ve been meaning to read this for ages - I’d take great care of it and return it on time.'
  );

  useEffect(() => {
    if (owners[0]) {
      setSelectedOwner(owners[0]);
    }
    setBorrowNote('Hi! I’ve been meaning to read this for ages - I’d take great care of it and return it on time.');
    setStep(1);
    setIsSuccess(false);
    setIsCustomTime(false);
    setCustomTimeRaw('16:00');
  }, [book, activeTargetName, owners, isOpen]);

  // Step 2: Date, Time & Meetup Spot
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
      const details: BorrowHandoverDetails = {
        book,
        owner: selectedOwner,
        date: selectedDate,
        time: effectiveTime,
        spot: customSpot.trim() || selectedSpot,
        note: borrowNote,
      };
      if (onRequestSubmitted) {
        onRequestSubmitted(details);
      } else if (onBorrowRequested) {
        onBorrowRequested(details);
      }
      setIsSuccess(false);
      setStep(1);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Request to Borrow Book"
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-5 sm:px-6 pt-5 pb-3.5 border-b border-slate-100 bg-white relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition z-10"
            aria-label="Close modal"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>

          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between max-w-sm mx-auto mb-3 px-2 pr-6 sm:pr-2">
            {/* Step 1 */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 1 ? 'bg-brand text-white ring-4 ring-brand/10' : 'bg-slate-100 text-slate-400'
                }`}
              >
                1
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                Owner
              </span>
            </div>

            <div className={`flex-1 h-[2px] mx-2 ${step >= 2 ? 'bg-brand' : 'bg-slate-200'}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 2 ? 'bg-brand text-white ring-4 ring-brand/10' : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                Meetup
              </span>
            </div>

            <div className={`flex-1 h-[2px] mx-2 ${step >= 3 ? 'bg-brand' : 'bg-slate-200'}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 3 ? 'bg-brand text-white ring-4 ring-brand/10' : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold ${step === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                Confirm
              </span>
            </div>
          </div>

          {/* Book Mini-Card Summary Header */}
          <div className="p-3 rounded-2xl bg-cream border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-serif text-sm sm:text-base font-semibold text-slate-800 truncate">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate">by {book.author}</p>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-0.5">
                  <HugeiconsIcon icon={StarIcon} size={13} className="fill-amber-400 text-amber-500" />
                  <span className="font-bold text-slate-700">{book.rating}</span>
                  <span className="text-slate-500 text-[11px]">({book.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right flex-shrink-0">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                30-day loan
              </span>
              <p className="text-[11px] text-slate-500 mt-1">{book.distance} away</p>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5 overscroll-contain">
          {/* STEP 1: CHOOSE OWNER */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800">
                  Select a neighbor to borrow from
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose a verified reader with this book available for loan in your area.
                </p>
              </div>

              <div className="space-y-2.5">
                {owners.map((owner) => {
                  const isSelected = selectedOwner.id === owner.id;
                  return (
                    <div
                      key={owner.id}
                      onClick={() => setSelectedOwner(owner)}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-brand bg-brand/5 ring-1 ring-brand'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={owner.avatar}
                          alt={owner.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-serif text-sm font-semibold text-slate-800 truncate">{owner.name}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                              {owner.trust}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {owner.distance} · {owner.lendsCount} completed lends
                          </p>
                          {owner.note && (
                            <p className="text-[11px] text-brand/80 italic mt-0.5 truncate">“{owner.note}”</p>
                          )}
                        </div>
                      </div>

                      <div className="text-brand flex-shrink-0">
                        {isSelected ? (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="text-brand" />
                        ) : (
                          <HugeiconsIcon icon={CircleIcon} size={20} className="text-slate-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SET MEETUP */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800">
                  Set the meetup
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Coordinate a safe, convenient public place with {selectedOwner.name}.
                </p>
              </div>

              {/* Date selection cards */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Select Date
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
                            ? 'border-brand bg-brand text-white shadow-sm'
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
                    Select Time
                  </label>
                  {isCustomTime && effectiveTime && (
                    <span className="text-[11px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-md">
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
                            ? 'bg-brand text-white shadow-sm'
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
                        ? 'bg-brand text-white shadow-sm ring-2 ring-brand/20'
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
                      <label htmlFor="borrow-custom-time" className="text-xs font-medium text-slate-600 flex-shrink-0 flex items-center gap-1.5">
                        <HugeiconsIcon icon={Clock01Icon} size={14} className="text-brand" />
                        <span>Enter meeting time:</span>
                      </label>
                      <div className="relative flex-1 max-w-[150px]">
                        <input
                          id="borrow-custom-time"
                          type="time"
                          value={customTimeRaw}
                          onChange={(e) => setCustomTimeRaw(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-sm"
                          required
                        />
                      </div>
                      {customFormattedTime && (
                        <span className="text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-lg">
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
                  Public Meetup Location
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
                            ? 'border-brand bg-brand/5 ring-1 ring-brand'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={Location01Icon} size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{spot.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{spot.distanceText}</p>
                          </div>
                        </div>

                        <div className="text-brand flex-shrink-0">
                          {isSelected ? (
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-brand" />
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
                    placeholder="Or type a custom meetup location..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              {isSuccess ? (
                <div className="py-10 text-center animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={30} />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                    Request Sent Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    {selectedOwner.name} has been notified for <span className="font-semibold text-slate-800">“{book.title}”</span> at{' '}
                    <span className="font-semibold text-slate-800">{customSpot.trim() || selectedSpot}</span> on{' '}
                    <span className="font-semibold text-slate-800">
                      {selectedDate} at {effectiveTime}
                    </span>.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800">
                      Review & Confirm Request
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Double check your meetup details before sending to {selectedOwner.name}.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
                    {/* Lender */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Lender
                      </span>
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <img src={selectedOwner.avatar} alt={selectedOwner.name} className="w-5 h-5 rounded-full object-cover" />
                        <span>{selectedOwner.name}</span>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Proposed Time
                      </span>
                      <span className="font-semibold text-slate-800">
                        {selectedDate} @ {effectiveTime}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Meetup Location
                      </span>
                      <span className="font-semibold text-slate-800 text-right max-w-xs truncate">
                        {customSpot.trim() || selectedSpot}
                      </span>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Borrow Terms
                      </span>
                      <span className="font-semibold text-emerald-700 text-xs">30-day loan period · Free exchange</span>
                    </div>

                    {/* Note */}
                    <div>
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Your Note
                      </span>
                      <p className="mt-1 text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200/70 text-xs">
                        “{borrowNote}”
                      </p>
                    </div>
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
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
                >
                  <span>Continue to meetup</span>
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
                  <span>Back to owner</span>
                </button>

                <button
                  type="button"
                  disabled={!isTimeValid || !isLocationValid}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
                >
                  <span>Review Request</span>
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
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
                >
                  <HugeiconsIcon icon={SentIcon} size={16} />
                  <span>Confirm & Send Request</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
