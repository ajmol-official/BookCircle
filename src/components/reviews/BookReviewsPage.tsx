import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  StarIcon,
  FilterIcon,
  Search01Icon,
  BookOpen01Icon,
  CheckmarkCircle02Icon,
  Edit01Icon,
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import type { Review, RatingDistribution, ReviewSortOption } from '../../types/review';
import { reviewService, normalizeCatalogKey } from '../../services/reviewService';
import { authService } from '../../services/authService';
import { ReviewCard } from './ReviewCard';
import { ReviewModal } from '../bookdetails/ReviewModal';
import { useAuth } from '../../context/AuthContext';

interface BookReviewsPageProps {
  book: Book;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
}

export const BookReviewsPage: React.FC<BookReviewsPageProps> = ({
  book,
  onSelectAuthor,
}) => {
  const navigate = useNavigate();
  const { currentUser, requireAuth } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [distribution, setDistribution] = useState<RatingDistribution>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
    total: 0,
    average: book.rating || 5.0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ReviewSortOption>('helpful');
  const [visibleCount, setVisibleCount] = useState(6);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const catalogKey = useMemo(() => {
    return normalizeCatalogKey(book.catalogId || book.title || book.id);
  }, [book]);

  // Load reviews and distribution
  const loadReviewsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reviewsResult, distResult] = await Promise.all([
        reviewService.getReviews(catalogKey, {
          sortBy,
          rating: selectedRating,
          searchQuery,
          limit: 100, // Load active pool for instant filtering
        }),
        reviewService.getRatingDistribution(catalogKey),
      ]);

      setReviews(reviewsResult.reviews);
      setDistribution(distResult);
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setIsLoading(false);
    }
  }, [catalogKey, sortBy, selectedRating, searchQuery]);

  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  // Toggle upvote with authentication guard & optimistic feedback
  const handleToggleUpvote = async (reviewId: string) => {
    const executeVote = async (userId: string) => {
      try {
        const { review: updatedReview, isUpvoted } = await reviewService.toggleUpvote(
          reviewId,
          userId
        );

        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? updatedReview : r))
        );

        showToast(
          isUpvoted
            ? 'Upvoted review. Thank you!'
            : 'Removed upvote.'
        );
      } catch (err: any) {
        showToast(err?.message || 'Could not update vote');
      }
    };

    if (!currentUser) {
      requireAuth({
        title: 'Sign in to Upvote',
        message: 'Join BookCircle to upvote reviews and guide your neighbors.',
        targetAction: 'general',
        bookTitle: book.title,
        onAuthorized: () => {
          const authorizedUser = authService.getCurrentUser();
          if (authorizedUser?.id) {
            executeVote(authorizedUser.id);
          }
        },
      });
      return;
    }

    await executeVote(currentUser.id);
  };

  // Handle new review submission
  const handleReviewSubmitted = async (newRev: {
    author: string;
    rating: number;
    text: string;
  }) => {
    try {
      const created = await reviewService.addReview({
        bookCatalogId: catalogKey,
        bookTitle: book.title,
        userId: currentUser?.id,
        author: newRev.author,
        avatar: currentUser?.avatar,
        rating: newRev.rating,
        text: newRev.text,
      });

      // Prepend optimistic review and refresh
      setReviews((prev) => [created, ...prev]);
      showToast('Your review was published to the community shelf!');
      await loadReviewsData();
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  };

  // Paginated reviews subset
  const visibleReviews = useMemo(() => {
    return reviews.slice(0, visibleCount);
  }, [reviews, visibleCount]);

  const hasMore = visibleCount < reviews.length;

  return (
    <>
      {/* Floating Centered Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-medium shadow-2xl border border-slate-700/80 flex items-center gap-2.5 max-w-md pointer-events-none"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={18}
              className="text-emerald-400 flex-shrink-0"
            />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-8 pb-20 animate-in fade-in duration-200 space-y-8">
        {/* 1. Contextual Return Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`/book/${book.id}`)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand transition group self-start cursor-pointer"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to “{book.title}”</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <HugeiconsIcon icon={Edit01Icon} size={16} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* 2. Book Context Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-between">
          <div className="flex items-start gap-5">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-2xl shadow-md flex-shrink-0 border border-slate-100"
            />
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-brand/10 text-brand">
                  {book.category || 'Fiction'}
                </span>
                {book.publishedYear && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    Published {book.publishedYear}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                Community Reviews for {book.title}
              </h1>

              <p className="mt-1 text-sm text-slate-600 font-medium">
                by{' '}
                <button
                  type="button"
                  onClick={() => onSelectAuthor?.(book.author, book.authorId)}
                  className="text-brand hover:underline font-semibold focus-visible:outline-none cursor-pointer"
                >
                  {book.author}
                </button>
              </p>

              <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                <div className="flex items-center gap-1 text-amber-500">
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={16}
                    className="fill-amber-400 text-amber-500"
                  />
                  <span className="font-serif font-bold text-slate-800 text-sm">
                    {distribution.total > 0 ? distribution.average : book.rating}
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  {distribution.total} verified community review{distribution.total === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Controls Toolbar: Star Filters, Search & Sorting */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Star Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1 flex-shrink-0">
              <HugeiconsIcon icon={FilterIcon} size={14} />
              <span>Filter:</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setSelectedRating(null);
                setVisibleCount(6);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex-shrink-0 cursor-pointer ${
                selectedRating === null
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Stars ({distribution.total})
            </button>

            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const isSelected = selectedRating === star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setSelectedRating(isSelected ? null : star);
                    setVisibleCount(6);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{star}</span>
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={11}
                    className={isSelected ? 'fill-white text-white' : 'text-amber-500 fill-amber-400'}
                  />
                  <span>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-64">
              <HugeiconsIcon
                icon={Search01Icon}
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(6);
                }}
                placeholder="Search reviews..."
                className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand shadow-2xs"
              />
            </div>

            {/* Sort Select */}
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as ReviewSortOption);
                  setVisibleCount(6);
                }}
                aria-label="Sort reviews"
                className="text-xs pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-brand shadow-2xs cursor-pointer"
              >
                <option value="helpful">Sort: Most Upvoted</option>
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="highest_rated">Sort: Highest Rated</option>
                <option value="lowest_rated">Sort: Lowest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Reviews Feed (Clean Vertical Stream) */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading community reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand mx-auto flex items-center justify-center mb-3">
              <HugeiconsIcon icon={BookOpen01Icon} size={22} />
            </div>
            <h3 className="font-serif text-lg font-semibold text-slate-800">
              {selectedRating !== null
                ? `No ${selectedRating}-star reviews found`
                : searchQuery
                ? `No reviews matching “${searchQuery}”`
                : 'No reviews yet for this title'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {selectedRating !== null || searchQuery
                ? 'Try clearing your filter or searching for different keywords.'
                : 'Be the first neighbor to share what moved, challenged, or delighted you.'}
            </p>

            {selectedRating !== null || searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedRating(null);
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Clear all filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Write the First Review
              </button>
            )}
          </div>
        ) : (
          /* Vertical Reviews Feed */
          <div className="space-y-6">
            <div className="space-y-6">
              {visibleReviews.map((rev) => {
                const isOwnReview = Boolean(
                  currentUser &&
                    (rev.userId === currentUser.id ||
                      rev.author.toLowerCase().trim() === currentUser.displayName.toLowerCase().trim())
                );
                const isUpvoted = currentUser
                  ? (rev.upvotedBy || []).includes(currentUser.id)
                  : false;

                return (
                  <ReviewCard
                    key={rev.id}
                    review={rev}
                    isUpvoted={isUpvoted}
                    isOwnReview={isOwnReview}
                    onToggleUpvote={handleToggleUpvote}
                  />
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  Load More Reviews ({reviews.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        bookTitle={book.title}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
};
