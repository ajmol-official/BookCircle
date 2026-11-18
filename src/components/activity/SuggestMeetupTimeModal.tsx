import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  Location01Icon,
  Clock01Icon,
  Cancel01Icon,
  SentIcon
} from '@hugeicons/core-free-icons';
import type { ExchangeTransaction } from '../../types';

export interface SuggestMeetupTimeModalProps {
  request: ExchangeTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    requestId: string,
    newDate: string,
    newTime: string,
    newSpot: string,
    note: string
  ) => Promise<void> | void;
}

export const SuggestMeetupTimeModal: React.FC<SuggestMeetupTimeModalProps> = ({
  request,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetupSpot, setMeetupSpot] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize defaults from the current request
  useEffect(() => {
    if (request && isOpen) {
      // Set default date to tomorrow or current date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isoDate = tomorrow.toISOString().split('T')[0];
      setSelectedDate(isoDate);

      setSelectedTime(request.meetupTime || '11:00 AM');
      setMeetupSpot(request.meetupSpot || 'Riverside Coffee, Rampura');
      setNote('');
      setError(null);
    }
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  const todayIso = new Date().toISOString().split('T')[0];

  // Helper for quick date chips
  const handleQuickDate = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    setSelectedDate(target.toISOString().split('T')[0]);
  };

  const handleQuickTime = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setError('Please select a proposed date.');
      return;
    }
    if (!selectedTime) {
      setError('Please select or specify a proposed time.');
      return;
    }
    if (!meetupSpot.trim()) {
      setError('Please provide a meetup location.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Format human-friendly date string for the transaction
      const parsedDate = new Date(selectedDate);
      const formattedDate = parsedDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      await onSubmit(request.id, formattedDate, selectedTime, meetupSpot.trim(), note.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to send proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="counter-proposal-modal-title"
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
            <HugeiconsIcon icon={Calendar01Icon} size={24} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        <h3
          id="counter-proposal-modal-title"
          className="font-serif text-xl sm:text-2xl font-semibold text-slate-900"
        >
          Suggest Different Time
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
          Propose an alternative schedule to <strong>{request.borrowerName}</strong> for{' '}
          <strong>“{request.bookTitle}”</strong>.
        </p>

        {/* Current Proposed Meetup Pill */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
            ORIG
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-semibold text-slate-700">Currently Requested Schedule:</p>
            <p className="text-slate-500 mt-0.5 truncate">
              {request.meetupTime} on {request.meetupDate} · {request.meetupSpot}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* 1. Proposed Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Meetup Date
            </label>
            <input
              type="date"
              min={todayIso}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
              required
            />
            {/* Quick date chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleQuickDate(1)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-brand/10 hover:text-brand text-slate-600 transition cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(2)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-brand/10 hover:text-brand text-slate-600 transition cursor-pointer"
              >
                In 2 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(7)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-brand/10 hover:text-brand text-slate-600 transition cursor-pointer"
              >
                Next Week
              </button>
            </div>
          </div>

          {/* 2. Proposed Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Meetup Time
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  placeholder="e.g. 11:00 AM or 3:30 PM"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                  required
                />
              </div>
            </div>
            {/* Quick time chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['10:00 AM', '1:00 PM', '3:30 PM', '6:00 PM'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleQuickTime(t)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition cursor-pointer ${
                    selectedTime === t
                      ? 'bg-brand text-white'
                      : 'bg-slate-100 hover:bg-brand/10 hover:text-brand text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Meetup Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Meetup Spot
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={Location01Icon}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={meetupSpot}
                onChange={(e) => setMeetupSpot(e.target.value)}
                placeholder="e.g. Riverside Coffee, Rampura"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                required
              />
            </div>
          </div>

          {/* 4. Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Optional Note to {request.borrowerName}
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Saturday afternoon works great for me! Looking forward to meeting you."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-slate-400 resize-none transition"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SentIcon} size={15} />
                  <span>Send Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
