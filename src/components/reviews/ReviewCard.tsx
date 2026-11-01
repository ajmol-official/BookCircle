import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  ArrowUp02Icon,
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

  // Review text length threshold for optional Read More (comfortable paragraph length)
  const isLongReview = review.text.length > 400;
  const displayText =
    isLongReview && !isExpanded ? `${review.text.slice(0, 360).trim()}...` : review.text;

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
      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
    >
      <div>
        {/* 1. Reviewer Header: Avatar, Name, Verified Badge, Date */}
        <div className="flex items-center gap-3.5">
          {review.avatar && !imageError ? (
            <img
              src={review.avatar}
              alt={review.author}
              onError={() => setImageError(true)}
              className="w-10 h-10 rounded-full object-cover border border-slate-100 flex-shrink-0 ring-1 ring-slate-100"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-serif font-semibold text-xs flex items-center justify-center flex-shrink-0 ring-1 ring-brand/20">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif text-sm sm:text-base font-semibold text-slate-900 truncate">
                {review.author}
              </span>

              {review.verifiedReader && (
                <span
                  title="Verified reader in BookCircle"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex-shrink-0"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} className="text-emerald-600" />
                  <span>Verified Reader</span>
                </span>
              )}
            </div>

            <time className="text-[11px] sm:text-xs text-slate-500 block mt-0.5 font-normal">
              {review.date}
            </time>
          </div>
        </div>

        {/* 2. Rating: Star rating displayed clearly below reviewer information */}
        <div
          className="flex items-center gap-1 text-amber-500 mt-3"
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
          <span className="text-xs font-semibold text-slate-600 ml-1.5">
            {review.rating}.0
          </span>
        </div>

        {/* 3. Review Title (if supported) */}
        {review.title && (
          <h4 className="font-serif text-base sm:text-lg font-bold text-slate-900 mt-3 mb-1.5 leading-snug tracking-tight">
            {review.title}
          </h4>
        )}

        {/* 4. Review Content: Readable typography with comfortable line spacing */}
        <div className="mt-2 text-slate-700 text-sm sm:text-[15px] leading-relaxed font-normal">
          <p className="whitespace-pre-line">{displayText}</p>
          {isLongReview && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs sm:text-sm font-semibold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {isExpanded ? 'Show less' : 'Read full review'}
            </button>
          )}
        </div>
      </div>

      {/* 5. Interaction Area: Upvote button with count at bottom */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        {isOwnReview ? (
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-400 text-xs font-medium cursor-not-allowed select-none"
            title="You cannot upvote your own review"
          >
            <HugeiconsIcon icon={ArrowUp02Icon} size={15} className="text-slate-400" />
            <span>Upvote {review.upvotesCount}</span>
            <span className="text-[10px] text-slate-400 font-normal">(Your review)</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onToggleUpvote(review.id)}
            data-testid={`upvote-btn-${review.id}`}
            aria-pressed={isUpvoted}
            title={isUpvoted ? 'Remove upvote' : 'Upvote this review'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer ${
              isUpvoted
                ? 'bg-brand/10 hover:bg-brand/15 border border-brand/40 text-brand shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <HugeiconsIcon
              icon={ArrowUp02Icon}
              size={15}
              className={isUpvoted ? 'text-brand stroke-[2.2]' : 'text-slate-500'}
            />
            <span>{isUpvoted ? 'Upvoted' : 'Upvote'}</span>
            <span className={isUpvoted ? 'font-bold text-brand' : 'font-bold text-slate-800'}>
              {review.upvotesCount}
            </span>
          </button>
        )}
      </div>
    </article>
  );
};
