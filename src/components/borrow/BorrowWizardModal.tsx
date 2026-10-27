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
  SentIcon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';

interface BorrowWizardModalProps {
  isOpen: boolean;
  book: Book | null;
  initialOwnerName?: string;
  onClose: () => void;
  onRequestSubmitted?: (details: any) => void;
}

export const BorrowWizardModal: React.FC<BorrowWizardModalProps> = ({
  isOpen,
  book,
  initialOwnerName,
  onClose,
  onRequestSubmitted
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Owner selection & Note
  const owners = [
    {
      id: 'owner-ethan',
      name: 'Ethan Vogel',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      distance: '0.4 km away',
      memberSince: '2024',
      lendsCount: 23,
      trust: '4.8 (Verified)',
      note: 'Prefers meeting at local cafes'
    },
    {
      id: 'owner-amira',
      name: 'Amira Khan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      distance: '1.8 km away',
      memberSince: '2023',
      lendsCount: 19,
      trust: '4.7 (Good)',
      note: 'Available on weekday evenings'
    },
    {
      id: 'owner-diego',
      name: 'Diego Ramirez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      distance: '2.9 km away',
      memberSince: '2024',
      lendsCount: 31,
      trust: '4.9 (Top Lender)',
      note: 'Has clean hardcover edition'
    }
  ];

  const [selectedOwner, setSelectedOwner] = useState(
    owners.find(o => o.name === initialOwnerName) || owners[0]
  );
  const [borrowNote, setBorrowNote] = useState(
    'Hi! I’ve been meaning to read this for ages - I’d take great care of it and return it on time.'
  );

  // Step 2: Date, Time & Meetup Spot
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
      distanceText: '0.4 km from you · 0.3 km from owner',
      popular: true
    },
    {
      id: 'spot-2',
      name: 'Elm Park Library entrance',
      distanceText: '0.8 km from you · 0.6 km from owner',
      popular: false
    },
    {
      id: 'spot-3',
      name: 'Meadow Square public bench',
      distanceText: '1.1 km from you · 1.0 km from owner',
      popular: false
    }
  ];
  const [selectedSpot, setSelectedSpot] = useState(spots[0].name);
  const [customSpot, setCustomSpot] = useState('');

  // Step 3 Confirmation state
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !book) return null;

  const handleFinalSubmit = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onRequestSubmitted?.({
        book,
        owner: selectedOwner,
        date: selectedDate,
        time: selectedTime,
        spot: customSpot || selectedSpot,
        note: borrowNote
      });
      setIsSuccess(false);
      setStep(1);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Step Progress Tracker matching Figma */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-6 px-2">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 ? 'bg-brand text-white ring-4 ring-brand/10' : 'bg-slate-100 text-slate-400'
            }`}>
              1
            </div>
            <span className={`text-xs font-semibold ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
              Choose Owner
            </span>
          </div>

          <div className={`flex-1 h-[2px] mx-3 ${step >= 2 ? 'bg-brand' : 'bg-slate-200'}`} />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2 ? 'bg-brand text-white ring-4 ring-brand/10' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
            <span className={`text-xs font-semibold ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
              Set Meetup
            </span>
          </div>

          <div className={`flex-1 h-[2px] mx-3 ${step >= 3 ? 'bg-brand' : 'bg-slate-200'}`} />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === 3 ? 'bg-brand text-white ring-4 ring-brand/10' : 'bg-slate-100 text-slate-400'
            }`}>
              3
            </div>
            <span className={`text-xs font-semibold ${step === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
              Confirm
            </span>
          </div>
        </div>

        {/* Book Mini-Card Summary Header */}
        <div className="p-4 rounded-2xl bg-cream border border-slate-200/80 flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
            />
            <div>
              <h4 className="font-serif text-base font-semibold text-slate-800">
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
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              30-day loan
            </span>
            <p className="text-[11px] text-slate-400 mt-1">{book.distance} away</p>
          </div>
        </div>

        {/* STEP 1: CHOOSE OWNER */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h3 className="font-serif text-xl font-semibold text-slate-800">
                Choose an owner
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Pick the copy you’d like to borrow. You can send a short note too.
              </p>
            </div>

            {/* Owner list */}
            <div className="space-y-3">
              {owners.map((owner) => {
                const isSelected = selectedOwner.id === owner.id;
                return (
                  <div
                    key={owner.id}
                    onClick={() => setSelectedOwner(owner)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-brand bg-brand/5 ring-2 ring-brand/20 shadow-xs'
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
                          {owner.lendsCount} Successful lends · <span className="font-semibold text-emerald-700">{owner.trust}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-brand">
                      {isSelected ? (
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} className="text-brand" />
                      ) : (
                        <HugeiconsIcon icon={CircleIcon} size={22} className="text-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Add a message <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={borrowNote}
                onChange={(e) => setBorrowNote(e.target.value)}
                placeholder="Hi! I’ve been meaning to read this for ages - I’d take great care of it."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
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
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
              >
                <span>Continue to meetup</span>
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SET MEETUP */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h3 className="font-serif text-xl font-semibold text-slate-800">
                Set the meetup
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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
                      className={`p-2.5 rounded-xl border text-center transition ${
                        isSelected
                          ? 'border-brand bg-brand text-white shadow-sm'
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
                Select Time
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
                          ? 'bg-brand text-white shadow-sm'
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
                Public Meetup Location
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
                          ? 'border-brand bg-brand/5 ring-1 ring-brand'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <HugeiconsIcon icon={Location01Icon} size={16} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-800">{spot.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{spot.distanceText}</p>
                        </div>
                      </div>

                      <div className="text-brand">
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

              {/* Custom Location input */}
              <div className="mt-2.5">
                <input
                  type="text"
                  value={customSpot}
                  onChange={(e) => setCustomSpot(e.target.value)}
                  placeholder="Or type a custom meetup location..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
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
                <span>Back to choose owner</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
              >
                <span>Review Request</span>
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            {isSuccess ? (
              <div className="py-12 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-slate-800">
                  Request Sent Successfully!
                </h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  {selectedOwner.name} has been notified for <span className="font-semibold text-slate-800">“{book.title}”</span> at <span className="font-semibold text-slate-800">{customSpot || selectedSpot}</span> on <span className="font-semibold text-slate-800">{selectedDate} at {selectedTime}</span>.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-slate-800">
                    Review & Confirm Request
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Double check your meetup details before sending to {selectedOwner.name}.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs sm:text-sm">
                  {/* Lender */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Lender</span>
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <img src={selectedOwner.avatar} alt={selectedOwner.name} className="w-5 h-5 rounded-full object-cover" />
                      <span>{selectedOwner.name}</span>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Proposed Time</span>
                    <span className="font-semibold text-slate-800">{selectedDate} @ {selectedTime}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Meetup Location</span>
                    <span className="font-semibold text-slate-800 text-right max-w-xs">{customSpot || selectedSpot}</span>
                  </div>

                  {/* Terms */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Borrow Terms</span>
                    <span className="font-semibold text-emerald-700">30-day loan period · Free exchange</span>
                  </div>

                  {/* Note */}
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Your Note</span>
                    <p className="mt-1 text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/70">
                      “{borrowNote}”
                    </p>
                  </div>
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
                    className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={SentIcon} size={16} />
                    <span>Confirm & Send Request</span>
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
