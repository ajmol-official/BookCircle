import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  StarIcon,
  CheckmarkCircle02Icon,
  UserCheck01Icon,
  Clock01Icon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons';
import type { ExchangeTransaction } from '../../types';

interface RateReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: ExchangeTransaction | null;
  onSubmit: (data: {
    punctuality: 'On Time' | 'Slight Delay' | 'Late';
    bookCare: 'Excellent Care' | 'Minor Wear' | 'Damaged';
    overallRating: number;
    comment: string;
  }) => Promise<void>;
}

export const RateReaderModal: React.FC<RateReaderModalProps> = ({
  isOpen,
  onClose,
  exchange,
  onSubmit,
}) => {
  const [punctuality, setPunctuality] = useState<'On Time' | 'Slight Delay' | 'Late'>('On Time');
  const [bookCare, setBookCare] = useState<'Excellent Care' | 'Minor Wear' | 'Damaged'>('Excellent Care');
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPunctuality('On Time');
      // If the return was verified with damage/wear, pre-select book care to match
      if (exchange?.conditionVerified === 'Damaged') {
        setBookCare('Damaged');
      } else if (exchange?.conditionVerified === 'Minor Wear') {
        setBookCare('Minor Wear');
      } else {
        setBookCare('Excellent Care');
      }
      setOverallRating(5);
      setHoverRating(0);
      setComment('');
      setIsSubmitting(false);
      setIsSuccess(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit({
        punctuality,
        bookCare,
        overallRating,
        comment: comment.trim(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit reader feedback.');
      setIsSubmitting(false);
    }
  };

  const getScoreDescription = (score: number) => {
    switch (score) {
      case 5:
        return '5.0 · Exceptional community reader';
      case 4:
        return '4.0 · Good, reliable borrower';
      case 3:
        return '3.0 · Average experience';
      case 2:
        return '2.0 · Room for improvement';
      case 1:
        return '1.0 · Unsatisfactory experience';
      default:
        return `${score}.0`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-reader-title"
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

        {isSuccess ? (
          <div className="py-12 text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} />
            </div>
            <h4 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
              Reader Feedback Recorded!
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
              Thank you for helping build trust and accountability in the BookCircle community.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
                <HugeiconsIcon icon={UserCheck01Icon} size={22} />
              </div>
              <div>
                <h3 id="rate-reader-title" className="font-serif text-xl sm:text-2xl font-semibold text-slate-900">
                  How was your experience with this reader?
                </h3>
                <p className="text-xs text-slate-500">
                  Share your experience to help build a trustworthy book-sharing community.
                </p>
              </div>
            </div>

            {/* Reader & Book Context Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={exchange.borrowerAvatar}
                  alt={exchange.borrowerName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {exchange.borrowerName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                    <span>Borrower</span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">“{exchange.bookTitle}”</span>
                  </div>
                </div>
              </div>
              {exchange.borrowerTrust && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 flex-shrink-0">
                  {exchange.borrowerTrust}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Criteria 1: Return Punctuality */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <HugeiconsIcon icon={Clock01Icon} size={14} className="text-slate-500" />
                  <span>1. Return Punctuality</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'On Time', label: 'On Time', hint: 'Met as scheduled' },
                      { id: 'Slight Delay', label: 'Slight Delay', hint: 'Communicated well' },
                      { id: 'Late', label: 'Late', hint: 'Noticeable delay' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPunctuality(option.id)}
                      className={`py-2 px-2.5 rounded-xl text-left border transition text-xs ${
                        punctuality === option.id
                          ? 'border-brand bg-brand/5 text-brand shadow-2xs font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-semibold text-xs leading-none">{option.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-tight">{option.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Criteria 2: Book Care */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <HugeiconsIcon icon={BookOpen01Icon} size={14} className="text-slate-500" />
                  <span>2. Book Care & Handling</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'Excellent Care', label: 'Excellent Care', hint: 'Clean & intact' },
                      { id: 'Minor Wear', label: 'Minor Wear', hint: 'Light reading marks' },
                      { id: 'Damaged', label: 'Damaged', hint: 'Noticeable damage' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setBookCare(option.id)}
                      className={`py-2 px-2.5 rounded-xl text-left border transition text-xs ${
                        bookCare === option.id
                          ? 'border-brand bg-brand/5 text-brand shadow-2xs font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-semibold text-xs leading-none">{option.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-tight">{option.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Criteria 3: Overall Experience (1-5 Star Rating) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500" />
                    <span>3. Overall Borrowing Experience</span>
                  </label>
                  <span className="text-[11px] font-medium text-slate-500">
                    {getScoreDescription(hoverRating || overallRating)}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || overallRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setOverallRating(star)}
                        className="p-1 hover:scale-115 transition"
                        aria-label={`${star} star`}
                      >
                        <HugeiconsIcon
                          icon={StarIcon}
                          size={26}
                          className={isFilled ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Written Comment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Comment <span className="text-slate-400 font-normal">(visible on reader's trust history)</span>
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Prompt, friendly, and returned the book in great condition!"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none placeholder-slate-400"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Reader Rating'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
