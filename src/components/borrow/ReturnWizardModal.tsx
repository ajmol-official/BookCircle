import React, { useState } from 'react';
import { getUpcomingHandoverDates } from '../../utils/dateUtils';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Location01Icon,
  SentIcon
} from '@hugeicons/core-free-icons';

export interface BorrowedBookItem {
  id: string;
  catalogId?: string;
  title: string;
  author: string;
  cover: string;
  owner: string;
  ownerAvatar: string;
  collectedDate: string;
  dueDate: string;
  daysUsed: number;
  totalDays: number;
  daysLeft: number;
  status: 'active' | 'warning' | 'return_pending' | 'returned';
  returnSchedule?: {
    trackingCode: string;
    date: string;
    time: string;
    spot: string;
    status: 'pending_owner' | 'confirmed';
  };
}

export interface ReturnHandoverDetails {
  bookId: string;
  trackingCode: string;
  date: string;
  time: string;
  spot: string;
  note: string;
}

interface ReturnWizardModalProps {
  isOpen: boolean;
  book: BorrowedBookItem | null;
  onClose: () => void;
  onReturnScheduled: (details: ReturnHandoverDetails) => void;
}

export const ReturnWizardModal: React.FC<ReturnWizardModalProps> = ({
  isOpen,
  book,
  onClose,
  onReturnScheduled
}) => {
  // 2-step flow mirroring borrowing wizard: 1 (Set Meetup), 2 (Review & Confirm)
  const [step, setStep] = useState<1 | 2>(1);

  // Date selection (Dynamically generated, never backdated)
  const dates = React.useMemo(() => getUpcomingHandoverDates(), []);
  const [selectedDate, setSelectedDate] = useState(() => dates[1]?.val || dates[0]?.val || 'Tomorrow');

  // Time selection
  const timeSlots = ['9:00 AM', '10:00 AM', '11:30 AM', '2:00 PM', '5:30 PM'];
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  // Meetup locations
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

  // Note for return
  const [returnNote, setReturnNote] = useState(
    'Hi! Thanks so much for lending me this book. I really enjoyed reading it and kept it in great condition. Looking forward to meeting!'
  );

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingCode] = useState(() => `RET-${Math.floor(1000 + Math.random() * 9000)}-BC`);

  if (!isOpen || !book) return null;

  const handleFinalSubmit = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onReturnScheduled({
        bookId: book.id,
        trackingCode,
        date: selectedDate,
        time: selectedTime,
        spot: customSpot || selectedSpot,
        note: returnNote
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
          aria-label="Close modal"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Step Progress Tracker reusing same design */}
        <div className="flex items-center justify-between max-w-xs mx-auto mb-6 px-2">
          {/* Step 1: Set Meetup */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 1 ? 'bg-brand text-white ring-4 ring-brand/10' : 'bg-slate-100 text-slate-400'
              }`}
            >
              1
            </div>
            <span className={`text-xs font-semibold ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
              Set Meetup
            </span>
          </div>

          <div className={`flex-1 h-[2px] mx-3 ${step >= 2 ? 'bg-brand' : 'bg-slate-200'}`} />

          {/* Step 2: Confirm */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 2 ? 'bg-brand text-white ring-4 ring-brand/10' : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </div>
            <span className={`text-xs font-semibold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
              Confirm
            </span>
          </div>
        </div>

        {/* Book Mini-Card Summary Header reusing same design */}
        <div className="p-4 rounded-2xl bg-cream border border-slate-200/80 flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <img
              src={book.cover}
              alt={book.title}
              className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
            />
            <div>
              <h4 className="font-serif text-base font-semibold text-slate-800">
                {book.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium">by {book.author}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span>Returning to <strong className="text-slate-700 font-medium">{book.owner}</strong></span>
                <span>•</span>
                <span className="text-amber-700 font-medium">{book.daysLeft} days left</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 text-right">
            <img
              src={book.ownerAvatar}
              alt={book.owner}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
            />
          </div>
        </div>

        {/* STEP 1: SET MEETUP (Exact same design and interaction as Borrow flow) */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h3 className="font-serif text-xl font-semibold text-slate-800">
                Set the return meetup
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Coordinate a safe, convenient public place with {book.owner}.
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

            {/* Note to owner */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Note to {book.owner} (optional)
              </label>
              <textarea
                rows={2}
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder="Share a short note regarding the return..."
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
                <span>Review Return Plan</span>
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW & CONFIRM (Exact same design and layout as Borrow flow) */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            {isSuccess ? (
              <div className="py-12 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-slate-800">
                  Return Request Sent Successfully!
                </h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  {book.owner} has been notified for <span className="font-semibold text-slate-800">“{book.title}”</span> at <span className="font-semibold text-slate-800">{customSpot || selectedSpot}</span> on <span className="font-semibold text-slate-800">{selectedDate} at {selectedTime}</span>.
                </p>
                <div className="mt-4 inline-block font-mono text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                  Traceable Code: #{trackingCode}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-slate-800">
                    Review & Confirm Return
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Double check your return meetup details before sending to {book.owner}.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs sm:text-sm">
                  {/* Returning To Owner */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Returning To</span>
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <img src={book.ownerAvatar} alt={book.owner} className="w-5 h-5 rounded-full object-cover" />
                      <span>{book.owner}</span>
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

                  {/* Traceability Terms */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Return Protocol</span>
                    <span className="font-semibold text-emerald-700">Safe Handover · Traceable Code #{trackingCode}</span>
                  </div>

                  {/* Note */}
                  {returnNote && (
                    <div>
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Your Note</span>
                      <p className="mt-1 text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/70">
                        “{returnNote}”
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
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
                    <span>Confirm & Send Return Request</span>
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
