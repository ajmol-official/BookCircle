import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Location01Icon,
  StarIcon,
  GiftIcon,
  SentIcon,
  SparklesIcon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';

export interface ClaimGiftDetails {
  book: Book;
  owner: {
    id: string;
    name: string;
    avatar: string;
    distance: string;
    trust: string;
  };
  date: string;
  time: string;
  spot: string;
  note: string;
}

interface ClaimGiftModalProps {
  isOpen: boolean;
  book: Book | null;
  initialOwnerName?: string;
  onClose: () => void;
  onClaimSubmitted?: (details: ClaimGiftDetails) => void;
}

export const ClaimGiftModal: React.FC<ClaimGiftModalProps> = ({
  isOpen,
  book,
  initialOwnerName,
  onClose,
  onClaimSubmitted,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const targetOwnerName = initialOwnerName || book?.ownerName || 'Rahim Chowdhury';

  // Step 1: Donating neighbor selection & Thank-you note
  const owners = React.useMemo(() => {
    const list = [
      {
        id: 'owner-target',
        name: targetOwnerName,
        avatar: book?.ownerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        distance: book?.distance || '0.4 km away',
        memberSince: '2024',
        lendsCount: 42,
        trust: book?.ownerTrust || 'Tier 5 · Verified Master Reader',
        note: 'Offering this copy as a free community gift to keep permanently on your shelf.',
      },
    ];
    return list;
  }, [targetOwnerName, book]);

  const [selectedOwner, setSelectedOwner] = useState(owners[0]);
  const [claimNote, setClaimNote] = useState(
    'Hi! I would love to give this book a wonderful new home on my shelf. Thank you so much for your generosity in passing it forward to our community!'
  );

  React.useEffect(() => {
    if (owners[0]) {
      setSelectedOwner(owners[0]);
    }
    setClaimNote(
      'Hi! I would love to give this book a wonderful new home on my shelf. Thank you so much for your generosity in passing it forward to our community!'
    );
    setStep(1);
    setIsSuccess(false);
  }, [book, targetOwnerName, owners]);

  // Step 2: Date, Time & Public Pickup Spot
  const dates = [
    { day: 'Thu', date: '24 Apr' },
    { day: 'Fri', date: '25 Apr' },
    { day: 'Sat', date: '26 Apr' },
    { day: 'Sun', date: '27 Apr' },
    { day: 'Mon', date: '28 Apr' },
    { day: 'Tue', date: '30 Apr' },
  ];
  const [selectedDate, setSelectedDate] = useState('Fri 25 Apr');

  const timeSlots = ['9:00 AM', '10:00 AM', '11:30 AM', '2:00 PM', '5:30 PM'];
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  const spots = [
    {
      id: 'spot-1',
      name: 'Riverside Coffee, Rampura',
      distanceText: '0.4 km from you · 0.3 km from giver',
      popular: true,
    },
    {
      id: 'spot-2',
      name: 'Elm Park Library entrance',
      distanceText: '0.8 km from you · 0.6 km from giver',
      popular: false,
    },
    {
      id: 'spot-3',
      name: 'Meadow Square public bench',
      distanceText: '1.1 km from you · 1.0 km from giver',
      popular: false,
    },
  ];
  const [selectedSpot, setSelectedSpot] = useState(spots[0].name);
  const [customSpot, setCustomSpot] = useState('');

  // Step 3 Confirmation state
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !book) return null;

  const handleFinalSubmit = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onClaimSubmitted?.({
        book,
        owner: selectedOwner,
        date: selectedDate,
        time: selectedTime,
        spot: customSpot || selectedSpot,
        note: claimNote,
      });
      setIsSuccess(false);
      setStep(1);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-100 my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Step Progress Tracker */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-6 px-2">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 1
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              1
            </div>
            <span
              className={`text-xs font-semibold ${
                step >= 1 ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Gift Details
            </span>
          </div>

          <div
            className={`flex-1 h-[2px] mx-3 transition-colors ${
              step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 2
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-semibold ${
                step >= 2 ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Pickup Spot
            </span>
          </div>

          <div
            className={`flex-1 h-[2px] mx-3 transition-colors ${
              step >= 3 ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 3
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </div>
            <span
              className={`text-xs font-semibold ${
                step === 3 ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Confirm Gift
            </span>
          </div>
        </div>

        {/* Free Gift Book Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-2xs">
                  <HugeiconsIcon icon={GiftIcon} size={11} />
                  <span>Free Community Gift</span>
                </span>
              </div>
              <h4 className="font-serif text-base font-semibold text-slate-900">
                {book.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium">by {book.author}</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-1">
                <HugeiconsIcon icon={StarIcon} size={13} className="fill-amber-400 text-amber-500" />
                <span className="font-bold text-slate-700">{book.rating}</span>
                <span className="text-slate-400">({book.reviewsCount} reviews)</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <HugeiconsIcon icon={SparklesIcon} size={12} className="text-emerald-700" />
              <span>Yours to keep forever</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-1">{book.distance} away</p>
          </div>
        </div>

        {/* STEP 1: GIFT DETAILS & GIVER */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h3 className="font-serif text-xl font-semibold text-slate-800">
                Claim Free Book from Neighbor
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                This copy is gifted by a fellow community member. There is no loan deadline or return required.
              </p>
            </div>

            {/* Donating Neighbor Card */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Donating Neighbor
              </label>
              <div className="space-y-3">
                {owners.map((owner) => {
                  const isSelected = selectedOwner.id === owner.id;
                  return (
                    <div
                      key={owner.id}
                      onClick={() => setSelectedOwner(owner)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={owner.avatar}
                          alt={owner.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base font-semibold text-slate-800">
                              {owner.name}
                            </h4>
                            <span className="text-xs text-slate-400">· {owner.distance}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {owner.lendsCount} Community contributions ·{' '}
                            <span className="font-semibold text-emerald-700">{owner.trust}</span>
                          </p>
                          <p className="text-[11px] text-emerald-800 font-medium mt-1">
                            🎁 {owner.note}
                          </p>
                        </div>
                      </div>

                      <div className="text-emerald-700">
                        {isSelected ? (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} className="text-emerald-700" />
                        ) : (
                          <HugeiconsIcon icon={CircleIcon} size={22} className="text-slate-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thank-You Note Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Send a Thank-You Message <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={claimNote}
                onChange={(e) => setClaimNote(e.target.value)}
                placeholder="Share your appreciation with your neighbor..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none"
              />
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
              >
                <span>Continue to pickup spot</span>
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SET PICKUP MEETUP */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h3 className="font-serif text-xl font-semibold text-slate-800">
                Set Gift Pickup & Handover
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Coordinate a safe, convenient public place to meet {selectedOwner.name} and collect your free book.
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
                      className={`p-2.5 rounded-xl border text-center transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <p className={`text-[11px] font-medium ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {d.day}
                      </p>
                      <p className="text-sm font-bold mt-0.5">{d.date}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time selection chips */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Pickup Time
              </label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((t) => {
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Predefined Public Meetup Spots */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Public Handover Spot
              </label>
              <div className="space-y-2">
                {spots.map((spot) => {
                  const isSelected = selectedSpot === spot.name && !customSpot;
                  return (
                    <div
                      key={spot.id}
                      onClick={() => {
                        setSelectedSpot(spot.name);
                        setCustomSpot('');
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                          <HugeiconsIcon icon={Location01Icon} size={16} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-800">{spot.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{spot.distanceText}</p>
                        </div>
                      </div>

                      <div className="text-emerald-700">
                        {isSelected ? (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="text-emerald-700" />
                        ) : (
                          <HugeiconsIcon icon={CircleIcon} size={20} className="text-slate-300" />
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
                  placeholder="Or propose a custom public handover spot..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                <span>Back to gift details</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
              >
                <span>Review Gift Claim</span>
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM CLAIM */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            {isSuccess ? (
              <div className="py-10 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4 ring-8 ring-emerald-50">
                  <HugeiconsIcon icon={GiftIcon} size={32} />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-slate-800">
                  Free Gift Claimed Successfully!
                </h3>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  {selectedOwner.name} has been notified of your claim for{' '}
                  <span className="font-semibold text-slate-800">“{book.title}”</span>.
                </p>
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 max-w-md mx-auto text-xs text-emerald-950 text-left">
                  <p className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-700" />
                    <span>Meetup Scheduled</span>
                  </p>
                  <p>
                    Meet at <strong>{customSpot || selectedSpot}</strong> on <strong>{selectedDate} at {selectedTime}</strong> to collect your book.
                  </p>
                  <p className="mt-2 text-emerald-800 text-[11px] font-medium border-t border-emerald-200/80 pt-1.5">
                    🎁 Permanent Community Gift — once collected, this book is yours to keep forever. No return needed!
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-slate-800">
                    Review & Confirm Gift Claim
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Review your handover details before sending your claim to {selectedOwner.name}.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 text-xs sm:text-sm">
                  {/* Donating Neighbor */}
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
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
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      Pickup Time
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedDate} @ {selectedTime}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      Handover Spot
                    </span>
                    <span className="font-semibold text-slate-800 text-right max-w-xs">
                      {customSpot || selectedSpot}
                    </span>
                  </div>

                  {/* Gift Terms */}
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      Gift Terms
                    </span>
                    <span className="font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                      🎁 Free to keep permanently · No return required
                    </span>
                  </div>

                  {/* Note */}
                  <div>
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      Your Thank-You Message
                    </span>
                    <p className="mt-1 text-slate-700 italic bg-white p-3 rounded-xl border border-emerald-200/60">
                      “{claimNote}”
                    </p>
                  </div>
                </div>

                {/* Courtesy Notice */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
                  <HugeiconsIcon icon={GiftIcon} size={16} className="text-amber-700 flex-shrink-0" />
                  <span>
                    Community gifts are given freely out of neighborly generosity. Please arrive promptly at the agreed public meetup spot.
                  </span>
                </div>

                {/* Footer Navigation */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                    <span>Back to edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={SentIcon} size={16} />
                    <span>Confirm & Claim Free Book</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

