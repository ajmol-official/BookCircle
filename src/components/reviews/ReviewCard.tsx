import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  ThumbsUpIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import type { Review } from '../../types/review';

interface ReviewCardProps {
  review: Review;
  isUpvoted: boolean;
  isOwnReview: boolean;
  onToggleUpvote: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isUpvoted,
  isOwnReview,
  onToggleUpvote,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Review text length threshold for optional Read More
  const isLongReview = review.text.length > 320;
  const displayText =
    isLongReview && !isExpanded ? `${review.text.slice(0, 300)}...` : review.text;

  // Generate initials for avatar fallback
  const initials = review.author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      data-testid={`review-card-${review.id}`}
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header: Reviewer identity & Star rating */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            {review.avatar && !imageError ? (
              <img
                src={review.avatar}
                alt={review.author}
                onError={() => setImageError(true)}
                className="w-10 h-10 rounded-full object-cover border border-slate-100 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-serif font-semibold text-xs flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif text-sm font-semibold text-slate-800">
                  {review.author}
                </span>

                {review.verifiedReader && (
                  <span
                    title="Verified reader in BookCircle"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} className="text-emerald-600" />
                    <span>Verified Reader</span>
                  </span>
                )}
              </div>

              <time className="text-[11px] text-slate-500 block mt-0.5">
                {review.date}
              </time>
            </div>
          </div>

          {/* Star Rating */}
          <div
            className="flex items-center gap-0.5 text-amber-500 self-start sm:self-auto"
            aria-label={`${review.rating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <HugeiconsIcon
                key={star}
                icon={StarIcon}
                size={15}
                className={
                  star <= review.rating
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-200'
                }
              />
            ))}
          </div>
        </div>

        {/* Optional Review Title / Headline */}
        {review.title && (
          <h4 className="font-serif text-base font-semibold text-slate-900 mb-1.5 leading-snug">
            {review.title}
          </h4>
        )}

        {/* Review Body Text */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {displayText}
        </p>

        {isLongReview && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-xs font-semibold text-brand hover:underline"
          >
            {isExpanded ? 'Show less' : 'Read full review'}
          </button>
        )}
      </div>

      {/* Footer: Helpful Upvote Button */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
        {isOwnReview ? (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 text-xs font-medium cursor-not-allowed select-none"
            title="You cannot upvote your own review"
          >
            <HugeiconsIcon icon={ThumbsUpIcon} size={14} />
            <span>Helpful · {review.upvotesCount}</span>
            <span className="text-[10px] text-slate-400 font-normal">(Your review)</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onToggleUpvote(review.id)}
            data-testid={`upvote-btn-${review.id}`}
            aria-pressed={isUpvoted}
            title={isUpvoted ? 'Remove helpful vote' : 'Mark as helpful'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
              isUpvoted
                ? 'bg-brand/10 border border-brand/30 text-brand shadow-2xs hover:bg-brand/15'
                : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HugeiconsIcon
              icon={ThumbsUpIcon}
              size={14}
              className={isUpvoted ? 'text-brand fill-brand/20' : 'text-slate-500'}
            />
            <span>
              {isUpvoted ? 'Helpful' : 'Helpful'} · {review.upvotesCount}
            </span>
          </button>
        )}

        <span className="text-[11px] text-slate-400 font-medium">
          {review.upvotesCount > 0
            ? `${review.upvotesCount} neighbor${review.upvotesCount === 1 ? '' : 's'} found this helpful`
            : 'Be the first to find this helpful'}
        </span>
      </div>
    </article>
  );
};

