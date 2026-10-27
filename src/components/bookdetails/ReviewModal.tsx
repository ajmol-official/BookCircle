import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  StarIcon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  onReviewSubmitted: (review: { author: string; rating: number; text: string }) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  bookTitle,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      onReviewSubmitted({
        author: 'Maya Rahman',
        rating,
        text: reviewText
      });
      setSubmitted(false);
      setReviewText('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        <div>
          <h3 className="font-serif text-2xl font-semibold text-slate-800">
            Review “{bookTitle}”
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Share what moved, challenged, or delighted you. Your review helps neighbors find their next read.
          </p>
        </div>

        {submitted ? (
          <div className="py-12 text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} />
            </div>
            <h4 className="font-serif text-xl font-semibold text-slate-800">
              Review Published!
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Thank you for contributing to the community shelf.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Star rating selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <HugeiconsIcon
                        icon={StarIcon}
                        size={28}
                        className={isFilled ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}
                      />
                    </button>
                  );
                })}
                <span className="text-sm font-semibold text-slate-700 ml-2">
                  {rating}.0 out of 5
                </span>
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Your Thoughts
              </label>
              <textarea
                required
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you love? Which passages stayed with you?"
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md transition"
              >
                Post Review
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
