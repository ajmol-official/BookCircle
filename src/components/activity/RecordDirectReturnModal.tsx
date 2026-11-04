import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  AlertCircleIcon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons';
import type { ExchangeTransaction } from '../../types';

interface RecordDirectReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: ExchangeTransaction | null;
  onConfirm: (
    condition: 'Like New' | 'Good' | 'Minor Wear' | 'Damaged',
    notes?: string
  ) => Promise<void>;
}

export const RecordDirectReturnModal: React.FC<RecordDirectReturnModalProps> = ({
  isOpen,
  onClose,
  exchange,
  onConfirm,
}) => {
  const [hasPhysicallyReceived, setHasPhysicallyReceived] = useState(false);
  const [conditionSelected, setConditionSelected] = useState<'Like New' | 'Good' | 'Minor Wear' | 'Damaged'>('Good');
  const [conditionNotes, setConditionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHasPhysicallyReceived(false);
      setConditionSelected('Good');
      setConditionNotes('');
      setIsSubmitting(false);
      setErrorMsg(null);
    }
  }, [isOpen, exchange]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !exchange) return null;

  const handleConfirm = async () => {
    if (!hasPhysicallyReceived) {
      setErrorMsg('Please confirm you have physically received the book before closing the loan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm(conditionSelected, conditionNotes.trim() || undefined);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to record direct return.');
      setIsSubmitting(false);
    }
  };

  const originalCond = exchange.originalCondition || 'Good';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="direct-return-title"
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          aria-label="Close dialog"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mb-4 shadow-xs">
          <HugeiconsIcon icon={BookOpen01Icon} size={22} />
        </div>

        <h3 id="direct-return-title" className="font-serif text-xl sm:text-2xl font-semibold text-slate-900">
          Record Direct Return
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Record an in-person physical handover completed outside the scheduled return wizard.
        </p>

        {/* Informative Workflow Notice */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Direct Handover Notice:</strong> Use this option only if you already met with {exchange.borrowerName} and have the book back in your possession. This action will immediately complete the active loan and make the book available again in your library.
          </div>
        </div>

        {/* Loan Context & Baseline Condition */}
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
                Handed over: {exchange.handoverDate || 'Recently'} · Active Loan
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Original Condition when loaned:</span>
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
          {/* Condition of Returned Copy */}
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

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optional Notes / Feedback
            </label>
            <textarea
              rows={2}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="e.g. Handed back in person at the local cafe, pages crisp and clean."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Mandatory Confirmation Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition select-none">
              <input
                type="checkbox"
                checked={hasPhysicallyReceived}
                onChange={(e) => {
                  setHasPhysicallyReceived(e.target.checked);
                  if (e.target.checked) setErrorMsg(null);
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand accent-brand cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800 leading-snug">
                I confirm that I have physically received this book back from {exchange.borrowerName}.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
            disabled={isSubmitting || !hasPhysicallyReceived}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 ${
              hasPhysicallyReceived && !isSubmitting
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Recording...' : 'Confirm Direct Return & Close Loan'}
          </button>
        </div>
      </div>
    </div>
  );
};
