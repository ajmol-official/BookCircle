import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  ShieldCheckIcon,
  AlertCircleIcon,
  BubbleChatIcon,
} from '@hugeicons/core-free-icons';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import type { ExchangeTransaction } from '../../types';

interface InspectReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: ExchangeTransaction | null;
  onConfirm: (
    condition: 'Like New' | 'Good' | 'Minor Wear' | 'Damaged',
    notes?: string
  ) => Promise<void>;
  onNavigateToMessages?: (participantName: string, bookTitle: string) => void;
}

export const InspectReturnModal: React.FC<InspectReturnModalProps> = ({
  isOpen,
  onClose,
  exchange,
  onConfirm,
  onNavigateToMessages,
}) => {
  const [conditionSelected, setConditionSelected] = useState<'Like New' | 'Good' | 'Minor Wear' | 'Damaged'>('Good');
  const [conditionNotes, setConditionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConditionSelected(
        (exchange?.returnSchedule?.conditionVerified as 'Like New' | 'Good' | 'Minor Wear' | 'Damaged') || 'Good'
      );
      setConditionNotes(exchange?.returnSchedule?.conditionNotes || '');
      setIsSubmitting(false);
      setErrorMsg(null);
    }
  }, [isOpen, exchange]);

  // Lock body scroll safely
  useBodyScrollLock(isOpen);

  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !exchange) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm(conditionSelected, conditionNotes.trim() || undefined);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to confirm return receipt.');
      setIsSubmitting(false);
    }
  };

  const originalCond = exchange.originalCondition || 'Good';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspect-return-title"
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          aria-label="Close dialog"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
          <HugeiconsIcon icon={ShieldCheckIcon} size={24} />
        </div>

        <h3 id="inspect-return-title" className="font-serif text-xl sm:text-2xl font-semibold text-slate-900">
          Inspect & Confirm Receipt
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          You are confirming that <strong>“{exchange.bookTitle}”</strong> was received back from{' '}
          {exchange.borrowerName}.
        </p>

        {/* Transaction Summary & Baseline Condition */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={exchange.bookCover}
              alt={exchange.bookTitle}
              className="w-12 h-16 rounded-lg object-cover shadow-xs border border-slate-200 flex-shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-serif text-sm font-semibold text-slate-800 truncate">
                {exchange.bookTitle}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                Borrower: <strong className="text-slate-700">{exchange.borrowerName}</strong>
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Meetup: {exchange.returnSchedule?.spot || exchange.meetupSpot || 'Neighborhood meetup'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Original Condition when borrowed:</span>
            <span className="px-2.5 py-0.5 rounded-full font-semibold bg-white border border-slate-300/80 text-slate-800 shadow-2xs">
              {originalCond}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Condition of Returned Copy
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Like New', 'Good', 'Minor Wear', 'Damaged'] as const).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setConditionSelected(cond)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    conditionSelected === cond
                      ? 'border-brand bg-brand/5 text-brand shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {conditionSelected === 'Damaged' && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Condition Recorded:</strong>
                  Recording damage logs this in the permanent exchange audit history for transparency, while safely completing the return so your book is unlocked in your library.
                </div>
              </div>
              {onNavigateToMessages && (
                <button
                  type="button"
                  onClick={() => {
                    const borrower = exchange.borrowerName;
                    const title = exchange.bookTitle;
                    onNavigateToMessages(borrower, title);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-brand hover:text-brand-dark font-medium underline-offset-2 hover:underline pt-0.5"
                >
                  <HugeiconsIcon icon={BubbleChatIcon} size={14} />
                  <span>Optional: Message {exchange.borrowerName} about this issue</span>
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optional Notes / Feedback
            </label>
            <textarea
              rows={2}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="e.g. Returned cleanly with no bent pages, thanks!"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs mt-6 flex items-center justify-end gap-3 pt-3 pb-1 border-t border-slate-100 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Receipt & Close Loan'}
          </button>
        </div>
      </div>
    </div>
  );
};

