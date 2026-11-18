import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  BookOpen01Icon,
  TimeQuarterPassIcon
} from '@hugeicons/core-free-icons';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import type { ExchangeTransaction } from '../../types';

export interface ExtendLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: ExchangeTransaction | null;
  onConfirmExtension: (loan: ExchangeTransaction, extraDays: number, note: string) => Promise<void> | void;
}

const EXTENSION_OPTIONS = [
  { label: '+7 Days', days: 7, description: '1 week extension' },
  { label: '+14 Days', days: 14, description: '2 weeks (Recommended)' },
  { label: '+30 Days', days: 30, description: '1 month extension' },
];

export const ExtendLoanModal: React.FC<ExtendLoanModalProps> = ({
  isOpen,
  onClose,
  loan,
  onConfirmExtension,
}) => {
  useBodyScrollLock(isOpen);

  const [selectedDays, setSelectedDays] = useState<number>(14);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Initialize or reset default polite note when loan changes
  useEffect(() => {
    if (loan) {
      const defaultNote = `Hi ${loan.ownerName}, I'm really enjoying reading "${loan.bookTitle}" and would love a bit more time to finish it. Could we please extend the loan by ${selectedDays} days? Thank you so much!`;
      setNote(defaultNote);
      setImageError(false);
    }
  }, [loan, selectedDays]);

  if (!isOpen || !loan) return null;

  // Calculate proposed new due date
  const calculateNewDueDate = (days: number): string => {
    const baseDate = new Date();
    // If loan has existing due date in future, add from that, else add from today
    baseDate.setDate(baseDate.getDate() + days);
    return baseDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const proposedDateStr = calculateNewDueDate(selectedDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirmExtension(loan, selectedDays, note);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col gap-5 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-brand flex items-center justify-center flex-shrink-0">
            <HugeiconsIcon icon={TimeQuarterPassIcon} size={22} />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Request Loan Extension
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Need more time? Propose an extension to {loan.ownerName}.
            </p>
          </div>
        </div>

        {/* Book Preview Card */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
          {!loan.bookCover || imageError ? (
            <div className="w-12 h-16 rounded-xl bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center p-1 text-center flex-shrink-0">
              <HugeiconsIcon icon={BookOpen01Icon} size={16} className="text-brand/70" />
            </div>
          ) : (
            <img
              src={loan.bookCover}
              alt={loan.bookTitle}
              onError={() => setImageError(true)}
              className="w-12 h-16 object-cover rounded-xl shadow-xs border border-slate-200/80 flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-sm sm:text-base font-bold text-slate-900 truncate">
              {loan.bookTitle}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Lender: <span className="font-semibold text-slate-700">{loan.ownerName}</span>
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Current Status: {loan.dueDate || 'Active loan'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Extension Duration Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Extension Duration
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {EXTENSION_OPTIONS.map((opt) => {
                const isSelected = selectedDays === opt.days;
                return (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setSelectedDays(opt.days)}
                    className={`py-2.5 px-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'border-brand bg-purple-50/60 text-brand shadow-xs font-semibold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold">{opt.label}</span>
                    <span className="text-[10px] opacity-75 truncate max-w-full">
                      {opt.days === 14 ? '2 Weeks' : opt.days === 7 ? '1 Week' : '1 Month'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Proposed Date Callout */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
            <HugeiconsIcon icon={Calendar01Icon} size={18} className="text-emerald-700 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold">New Proposed Return Date:</span>{' '}
              <span className="text-emerald-800 font-bold">{proposedDateStr}</span>
            </div>
          </div>

          {/* Note to Owner */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Friendly Note to {loan.ownerName}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a polite note to your neighbor..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              A clear, thoughtful reason helps neighbors coordinate community book sharing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Extension Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
