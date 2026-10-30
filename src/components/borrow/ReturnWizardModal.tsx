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
  SentIcon,
  Clock01Icon,
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
  onReturnScheduled,
}) => {
  // 2-step flow: 1 (Set Meetup), 2 (Review & Confirm)
  const [step, setStep] = useState<1 | 2>(1);

  // Date selection (dynamically generated, never backdated)
  const dates = useMemo(() => getUpcomingHandoverDates(), []);
  const [selectedDate, setSelectedDate] = useState(() => dates[1]?.val || dates[0]?.val || 'Tomorrow');

  // Time selection (predefined chips + custom time input)
  const timeSlots = ['9:00 AM', '10:00 AM', '11:30 AM', '2:00 PM', '5:30 PM'];
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeRaw, setCustomTimeRaw] = useState('16:00'); // default 4:00 PM for custom picker

  // Meetup locations (2 highly practical public spots)
  const spots = DEFAULT_PUBLIC_MEETUP_SPOTS;
  const [selectedSpot, setSelectedSpot] = useState(spots[0].name);
  const [customSpot, setCustomSpot] = useState('');

  // Note for return
  const [returnNote, setReturnNote] = useState(
    'Hi! Thanks so much for lending me this book. I really enjoyed reading it and kept it in great condition. Looking forward to meeting!'
  );

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingCode] = useState(() => `RET-${Math.floor(1000 + Math.random() * 9000)}-BC`);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSuccess(false);
      setIsCustomTime(false);
      setCustomTimeRaw('16:00');
    }
  }, [isOpen, book?.id]);

  if (!isOpen || !book) return null;

  // Compute effective meeting time with validation
  const customFormattedTime = customTimeRaw ? formatTime24To12(customTimeRaw) : '';
  const effectiveTime = isCustomTime ? customFormattedTime : selectedTime;
  const isTimeValid = Boolean(effectiveTime);
  const isLocationValid = Boolean(customSpot.trim() || selectedSpot);

  const handleFinalSubmit = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onReturnScheduled({
        bookId: book.id,
        trackingCode,
        date: selectedDate,
        time: effectiveTime,
        spot: customSpot.trim() || selectedSpot,
        note: returnNote,
      });
      setIsSuccess(false);
      setStep(1);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
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
          <div className="flex items-center justify-between max-w-xs mx-auto mb-3.5 px-2">
            {/* Step 1: Set Meetup */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
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
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
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

          {/* Book Mini-Card Summary Header */}
          <div className="p-3 rounded-2xl bg-cream border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={book.cover}
                alt={book.title}
                className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-serif text-sm sm:text-base font-semibold text-slate-800 truncate">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate">by {book.author}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 flex-wrap">
                  <span>
                    Returning to <strong className="text-slate-700 font-medium">{book.owner}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-amber-700 font-medium">{book.daysLeft} days left</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <img
                src={book.ownerAvatar}
                alt={book.owner}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5 overscroll-contain">
          {/* STEP 1: SET MEETUP */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800">
                  Set the return meetup
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
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

              {/* Time selection chips + Custom Time Input */}
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

                  {/* Custom Time Chip */}
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

                {/* Inline Custom Time Input control */}
                {isCustomTime && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 animate-in fade-in duration-150">
                    <div className="flex items-center gap-3">
                      <label htmlFor="return-custom-time" className="text-xs font-medium text-slate-600 flex-shrink-0 flex items-center gap-1.5">
                        <HugeiconsIcon icon={Clock01Icon} size={14} className="text-brand" />
                        <span>Enter meeting time:</span>
                      </label>
                      <div className="relative flex-1 max-w-[150px]">
                        <input
                          id="return-custom-time"
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

              {/* Predefined Public Meetup Spots (Reduced to 2 highly practical choices) */}
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
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none shadow-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW & CONFIRM */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              {isSuccess ? (
                <div className="py-10 text-center animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={30} />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                    Return Request Sent Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    {book.owner} has been notified for <span className="font-semibold text-slate-800">“{book.title}”</span> at{' '}
                    <span className="font-semibold text-slate-800">{customSpot.trim() || selectedSpot}</span> on{' '}
                    <span className="font-semibold text-slate-800">
                      {selectedDate} at {effectiveTime}
                    </span>.
                  </p>
                  <div className="mt-4 inline-block font-mono text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                    Traceable Code: #{trackingCode}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800">
                      Review & Confirm Return
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Double check your return meetup details before sending to {book.owner}.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
                    {/* Returning To Owner */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Returning To
                      </span>
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <img src={book.ownerAvatar} alt={book.owner} className="w-5 h-5 rounded-full object-cover" />
                        <span>{book.owner}</span>
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

                    {/* Traceability Terms */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                        Return Protocol
                      </span>
                      <span className="font-semibold text-emerald-700 text-xs">
                        Safe Handover · Code #{trackingCode}
                      </span>
                    </div>

                    {/* Note */}
                    {returnNote && (
                      <div>
                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
                          Your Note
                        </span>
                        <p className="mt-1 text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200/70 text-xs">
                          “{returnNote}”
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Fixed Sticky Footer Navigation */}
        {!isSuccess && (
          <div className="flex-shrink-0 px-5 sm:px-6 py-3.5 bg-slate-50/90 backdrop-blur border-t border-slate-100 flex items-center justify-between gap-3">
            {step === 1 ? (
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
                  disabled={!isTimeValid || !isLocationValid}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
                >
                  <span>Review Return Plan</span>
                  <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
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
                  <span>Confirm & Send Return Request</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
