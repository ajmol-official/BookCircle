import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  ArrowRight01Icon,
  ArrowUp01Icon
} from '@hugeicons/core-free-icons';
import type { Review } from '../../types/review';
import { cleanAvatarUrl } from '../../utils/avatarUtils';

interface CommunityReviewsSectionProps {
  reviews: Review[];
  totalReviewsCount: number;
  bookId: string;
  onOpenReviewModal: () => void;
  onViewAllReviews: () => void;
}

export const CommunityReviewsSection: React.FC<CommunityReviewsSectionProps> = ({
  reviews,
  totalReviewsCount,
  onOpenReviewModal,
  onViewAllReviews
}) => {
  // Local upvoted state tracking for instant UI responsiveness
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});
  const [localUpvotes, setLocalUpvotes] = useState<Record<string, number>>({});

  const handleToggleUpvote = (revId: string, currentCount: number) => {
    const isCurrentlyUpvoted = !!upvotedIds[revId];
    setUpvotedIds(prev => ({ ...prev, [revId]: !isCurrentlyUpvoted }));
    setLocalUpvotes(prev => ({
      ...prev,
      [revId]: (prev[revId] ?? currentCount) + (isCurrentlyUpvoted ? -1 : 1)
    }));
  };

  return (
    <section className="mt-14">
      {/* Header matching Figma */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-slate-800 tracking-tight">
            Community reviews
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Top 3 community reviews by upvote
          </p>
        </div>

        <div className="flex items-center gap-4">
          {totalReviewsCount > 0 && (
            <button
              type="button"
              onClick={onViewAllReviews}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand transition cursor-pointer"
            >
              <span>View all {totalReviewsCount} reviews</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenReviewModal}
            className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span>Write a review</span>
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center">
          <p className="text-sm text-slate-600">
            No community reviews yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, 3).map((rev) => {
            const hasUpvoted = !!upvotedIds[rev.id];
            const upvoteCount = localUpvotes[rev.id] ?? (rev.upvotesCount || 24);

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs transition-all hover:shadow-card"
              >
                {/* 1. Reviewer Header: Avatar, Name, Relative Date */}
                <div className="flex items-center gap-3 mb-2.5">
                  {cleanAvatarUrl(rev.avatar) ? (
                    <img
                      src={cleanAvatarUrl(rev.avatar)}
                      alt={rev.author}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 text-brand font-serif font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {rev.author ? rev.author.charAt(0).toUpperCase() : 'BC'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 leading-snug">
                      {rev.author}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {rev.date || '3 weeks ago'}
                    </p>
                  </div>
                </div>

                {/* 2. Rating Row: Stars + Numeric Score */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <HugeiconsIcon
                        key={i}
                        icon={StarIcon}
                        size={14}
                        className="fill-amber-400 text-amber-500"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {rev.rating ? rev.rating.toFixed(1) : '4.6'}
                  </span>
                </div>

                {/* 3. Review Headline (if available) */}
                {rev.title && (
                  <h5 className="font-serif text-sm font-semibold text-slate-900 mb-1">
                    {rev.title}
                  </h5>
                )}

                {/* 4. Review Body */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  {rev.text}
                </p>

                {/* 5. Upvote Action Pill matching Figma */}
                <div className="mt-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleToggleUpvote(rev.id, rev.upvotesCount || 24)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition active:scale-95 cursor-pointer ${
                      hasUpvoted
                        ? 'bg-brand/10 border-brand text-brand font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <HugeiconsIcon
                      icon={ArrowUp01Icon}
                      size={14}
                      className={hasUpvoted ? 'text-brand stroke-[2.5]' : 'text-slate-500'}
                    />
                    <span>{upvoteCount} Upvote</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
