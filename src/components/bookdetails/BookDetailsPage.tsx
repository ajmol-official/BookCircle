import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  Location01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  BookOpen01Icon,
  FavouriteIcon,
  Notification01Icon,
  CheckmarkCircle02Icon,
  SparklesIcon,
  GiftIcon,
  Bookmark02Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import type { Review } from '../../types/review';
import { reviewService, normalizeCatalogKey } from '../../services/reviewService';
import { ReviewModal } from './ReviewModal';
import { useAuth } from '../../context/AuthContext';

interface BookDetailsPageProps {
  book: Book;
  communityCopies?: Book[];
  onBack?: () => void;
  onRequestBorrow: (book: Book, ownerName?: string) => void;
  onSelectOwner?: (ownerName: string) => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  onSimulateReturn?: (book: Book) => void;
  onOpenAddBook?: (book?: Book) => void;
}

export const BookDetailsPage: React.FC<BookDetailsPageProps> = ({
  book,
  communityCopies,
  onRequestBorrow,
  onSelectOwner,
  onSelectAuthor,
  onSimulateReturn,
  onOpenAddBook
}) => {
  const navigate = useNavigate();
  const { currentUser, toggleWishlist, isWishlisted } = useAuth();
  const bookWishlisted = isWishlisted(book.id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isDonation = book.availabilityMode === 'donation' || book.status === 'donation';
  const isPersonal = book.availabilityMode === 'personal';
  const isClaimed = book.status === 'claimed';

  const descriptionText =
    book.description ||
    'A sweeping saga of a Korean family across four generations, exploring identity, displacement, and resilience from colonial Busan to post-war Osaka. Rich in historical texture and emotional depth, it captures the everyday triumphs and burdens of exile and survival.';

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Reset expanded state when changing books
  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [book.id, book.description]);

  // Check if text exceeds clamped 2-3 lines to conditionally show Read More
  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current && !isDescriptionExpanded) {
        const isOverflowing =
          descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight + 1;
        setCanExpand(isOverflowing);
      }
    };

    const timer = setTimeout(checkOverflow, 40);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [descriptionText, isDescriptionExpanded]);

  const baseCount = book.wishlistCount || 6;
  const currentWishlistCount = bookWishlisted ? baseCount + 1 : baseCount;

  const handleToggleWishlist = () => {
    const added = toggleWishlist(book.id);
    if (added) {
      setToastMessage(
        book.status === 'lent_out'
          ? '🔔 Added to Wishlist! We will notify you the moment this book is returned.'
          : '❤️ Saved to your Wishlist!'
      );
    } else {
      setToastMessage('Removed from your Wishlist.');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const catalogKey = useMemo(() => {
    return normalizeCatalogKey(book.catalogId || book.title || book.id);
  }, [book]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number>(book.reviewsCount || 0);

  const loadReviews = useCallback(async () => {
    try {
      const [res, dist] = await Promise.all([
        reviewService.getReviews(catalogKey, { sortBy: 'helpful', limit: 3 }),
        reviewService.getRatingDistribution(catalogKey),
      ]);
      setReviews(res.reviews);
      setTotalReviewsCount(dist.total > 0 ? dist.total : (book.reviewsCount || 0));
    } catch (e) {
      console.warn('Failed to load reviews in details page:', e);
    }
  }, [catalogKey, book.reviewsCount]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Map live community copies. When communityCopies is provided (even if empty []), use it.
  const resolvedCopies = useMemo(() => {
    if (communityCopies !== undefined) {
      return communityCopies.map((copy) => ({
        id: copy.id,
        copyId: copy.id,
        name: copy.ownerName || copy.owner?.name || 'Local Neighbor',
        avatar: copy.ownerAvatar || copy.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        distance: copy.distance || copy.owner?.distance || '1.0 km',
        memberSince: '2024',
        statusText:
          copy.status === 'available'
            ? `Available now (${copy.condition || 'Very Good'})`
            : copy.status === 'donation' || copy.availabilityMode === 'donation'
            ? `Free to donate (${copy.condition || 'Good'})`
            : copy.status === 'lent_out'
            ? 'Currently lent out'
            : copy.status === 'claimed'
            ? 'Claimed by Neighbor'
            : 'Unavailable',
        isAvailable:
          (copy.status === 'available' || copy.status === 'donation' || copy.availabilityMode === 'donation') &&
          copy.status !== 'claimed' &&
          copy.availabilityMode !== 'personal',
        isDonation: copy.status === 'donation' || copy.availabilityMode === 'donation',
        isPersonal: copy.availabilityMode === 'personal',
        isClaimed: copy.status === 'claimed',
        bookCopy: copy
      }));
    }

    // Fallback if communityCopies prop not explicitly supplied:
    if (book.ownerName || (book.owner && book.owner.name)) {
      return [
        {
          id: book.id,
          copyId: book.id,
          name: book.ownerName || book.owner?.name || 'Local Neighbor',
          avatar: book.ownerAvatar || book.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          distance: book.distance || book.owner?.distance || '1.2 km',
          memberSince: '2024',
          statusText:
            book.status === 'available'
              ? `Available now (${book.condition || 'Very Good'})`
              : book.status === 'donation' || isDonation
              ? `Free to donate (${book.condition || 'Good'})`
              : book.status === 'lent_out'
              ? 'Currently lent out'
              : 'Unavailable',
          isAvailable: (book.status === 'available' || isDonation) && !isClaimed && !isPersonal,
          isDonation,
          isPersonal,
          isClaimed,
          bookCopy: book
        }
      ];
    }

    return [];
  }, [communityCopies, book, isDonation, isPersonal, isClaimed]);

  const handleNewReview = async (newRev: { author: string; rating: number; text: string }) => {
    try {
      await reviewService.addReview({
        bookCatalogId: catalogKey,
        bookTitle: book.title,
        userId: currentUser?.id,
        author: newRev.author,
        avatar: currentUser?.avatar,
        rating: newRev.rating,
        text: newRev.text,
      });
      setToastMessage('Review published to the community shelf!');
      setTimeout(() => setToastMessage(null), 3500);
      await loadReviews();
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  return (
    <div className="pt-6 pb-20 animate-in fade-in duration-200">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-medium shadow-2xl border border-slate-700/80 flex items-center gap-2.5 max-w-md"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Book Card Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card flex flex-col md:flex-row gap-8 items-start">
        {/* Book Cover */}
        <div className="relative w-full md:w-56 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-md">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
          />
          {(book.distance || (resolvedCopies.length > 0 && resolvedCopies[0].distance)) && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white flex items-center gap-1 shadow-sm">
              <HugeiconsIcon icon={Location01Icon} size={12} className="text-amber-badge" />
              <span className="text-[11px] font-medium">{book.distance || resolvedCopies[0].distance}</span>
            </div>
          )}
        </div>

        {/* Book Metadata */}
        <div className="flex-1 flex flex-col space-y-4 w-full">
          <div>
            <div className="flex items-center justify-between gap-x-3 gap-y-2.5 mb-2.5 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {resolvedCopies.length === 0 ? (
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    No community copies yet
                  </span>
                ) : isClaimed ? (
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Claimed by Neighbor
                  </span>
                ) : isDonation ? (
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1.5">
                    <HugeiconsIcon icon={GiftIcon} size={13} className="text-emerald-700" />
                    Free Community Gift · Keep Forever
                  </span>
                ) : book.status === 'lent_out' ? (
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Currently lent out
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Available now
                  </span>
                )}
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-brand/10 text-brand">
                  {book.category}
                </span>
              </div>

              {/* Wishlist Quick Toggle Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                  bookWishlisted
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                }`}
                title={bookWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <HugeiconsIcon
                  icon={FavouriteIcon}
                  size={15}
                  className={bookWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}
                />
                <span>{bookWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              {book.title}
            </h1>
            <p className="text-base text-slate-500 font-medium mt-1">
              by{' '}
              <button
                type="button"
                onClick={() => onSelectAuthor?.(book.author, book.authorId)}
                className="text-slate-800 font-semibold hover:text-brand hover:underline inline-flex items-center gap-1 transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40 cursor-pointer"
                title={`View ${book.author}'s author profile`}
              >
                <span>{book.author}</span>
              </button>
            </p>
          </div>

          {/* Ratings row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <HugeiconsIcon
                  key={i}
                  icon={StarIcon}
                  size={18}
                  className={i < Math.floor(book.rating) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
                />
              ))}
            </div>
            <span className="font-serif font-bold text-lg text-slate-800">
              {book.rating}
            </span>
            <button
              type="button"
              onClick={() => navigate(`/book/${book.id}/reviews`)}
              className="text-sm text-slate-500 hover:text-brand hover:underline cursor-pointer transition"
            >
              {totalReviewsCount || book.reviewsCount || 124} community reviews
            </button>
          </div>

          {/* Stats Bar row with Wishlist Counter */}
          <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <HugeiconsIcon icon={Location01Icon} size={16} className="text-brand" />
              <span>
                <strong>{resolvedCopies.length}</strong> {resolvedCopies.length === 1 ? 'copy' : 'copies'} in your area
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <strong className="text-slate-800">{resolvedCopies.length > 0 ? '1,254' : '0'}</strong> in country
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-rose-600 font-medium">
              <HugeiconsIcon
                icon={FavouriteIcon}
                size={15}
                className={bookWishlisted ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}
              />
              <span>
                <strong className="text-rose-700 font-bold">{currentWishlistCount}</strong> readers wishlisted
              </span>
            </div>
          </div>

          {/* Integrated Book Description */}
          {descriptionText && (
            <div className="pt-1">
              <p
                ref={descriptionRef}
                className={`text-sm text-slate-600 leading-relaxed font-sans ${
                  !isDescriptionExpanded ? 'line-clamp-2 sm:line-clamp-3' : ''
                }`}
              >
                {descriptionText}
              </p>
              {canExpand && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  className="mt-1.5 text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1 focus:outline-none"
                >
                  <span>{isDescriptionExpanded ? 'Show less' : 'Read more'}</span>
                  <HugeiconsIcon
                    icon={isDescriptionExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                    size={14}
                  />
                </button>
              )}
            </div>
          )}

          {/* Lent-out Alert & Notification CTA Banner */}
          {resolvedCopies.length > 0 && book.status === 'lent_out' && (
            <div className="mt-3 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Notification01Icon} size={17} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-950">
                    Currently lent out by owner
                  </p>
                  <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                    Wishlist this book to receive an immediate alert when it's back on the shelf.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm ${
                    bookWishlisted
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                      : 'bg-brand hover:bg-brand-dark text-white'
                  }`}
                >
                  <HugeiconsIcon icon={FavouriteIcon} size={14} className={bookWishlisted ? 'fill-rose-600' : ''} />
                  <span>{bookWishlisted ? 'Alert Active (Wishlisted)' : 'Notify When Available'}</span>
                </button>

                {/* Debug-only: Test Return Alert (hidden in production) */}
                {onSimulateReturn && import.meta.env.DEV && (
                  <button
                    type="button"
                    onClick={() => onSimulateReturn(book)}
                    title="[DEV] Simulate borrower returning this book"
                    className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold transition active:scale-95 flex items-center gap-1 opacity-70"
                  >
                    <HugeiconsIcon icon={SparklesIcon} size={13} className="text-emerald-700" />
                    <span>Test Return</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available from nearby readers section */}
      <div className="mt-10">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-semibold text-slate-800">
            Available from nearby readers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {resolvedCopies.length > 0
              ? `${resolvedCopies.length} ${resolvedCopies.length === 1 ? 'owner' : 'owners'} within 5 km ready for pickup or exchange.`
              : 'Community physical copies circulating in your neighborhood.'}
          </p>
        </div>

        {resolvedCopies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resolvedCopies.map((copy) => (
              <div
                key={copy.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col justify-between group hover:shadow-card-hover transition-all"
              >
                <div>
                  <div
                    onClick={() => onSelectOwner && onSelectOwner(copy.name)}
                    className="flex items-center gap-3.5 mb-3 cursor-pointer group/owner"
                    title={`View ${copy.name}'s profile & shelf`}
                  >
                    <img
                      src={copy.avatar}
                      alt={copy.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 group-hover/owner:ring-brand/40 group-hover/owner:scale-105 transition-all"
                    />
                    <div>
                      <h4 className="font-serif text-base font-semibold text-slate-800 group-hover/owner:text-brand transition-colors flex items-center gap-1">
                        <span>{copy.name}</span>
                        <span className="text-[10px] text-brand font-sans font-medium">→</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        {copy.distance} · Member {copy.memberSince}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    {copy.isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{copy.statusText}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500">
                        <span>{copy.statusText}</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  disabled={!copy.isAvailable || copy.isClaimed || copy.isPersonal}
                  onClick={() => onRequestBorrow(copy.bookCopy, copy.name)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 ${
                    copy.isClaimed || copy.isPersonal
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed shadow-none border border-slate-200'
                      : copy.isDonation
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : copy.isAvailable
                      ? 'bg-brand hover:bg-brand-dark text-white'
                      : 'bg-slate-100 text-slate-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {copy.isClaimed ? (
                    <span>Claimed</span>
                  ) : copy.isPersonal ? (
                    <>
                      <HugeiconsIcon icon={Bookmark02Icon} size={15} />
                      <span>In Reader's Private Collection</span>
                    </>
                  ) : copy.isDonation ? (
                    <>
                      <HugeiconsIcon icon={GiftIcon} size={15} />
                      <span>Claim Free Gift</span>
                    </>
                  ) : copy.isAvailable ? (
                    <span>Request to Borrow</span>
                  ) : (
                    <span>Unavailable</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Dedicated Zero Community Copies Empty State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/90 shadow-card">
            <div className="w-16 h-16 bg-purple-50 text-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon icon={BookOpen01Icon} size={32} />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              No community copies available yet.
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Be the first to share this book with your neighbors! You can list your copy for lending or community donation.
            </p>
            {onOpenAddBook && (
              <button
                type="button"
                onClick={() => onOpenAddBook(book)}
                className="px-6 py-2.5 rounded-full bg-brand hover:bg-brand-dark text-white font-semibold transition active:scale-95 shadow-sm text-sm inline-flex items-center gap-2"
              >
                <HugeiconsIcon icon={BookOpen01Icon} size={16} />
                <span>+ Share a Copy of this Book</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Community Reviews section */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-slate-800">
              Community reviews
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {totalReviewsCount > 0
                ? `${totalReviewsCount} reader${totalReviewsCount === 1 ? '' : 's'} have shared their thoughts`
                : 'No reviews yet for this title'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {totalReviewsCount > 0 && (
              <button
                type="button"
                onClick={() => navigate(`/book/${book.id}/reviews`)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark px-3 py-1.5 rounded-lg hover:bg-brand/5 transition"
              >
                <span>View all {totalReviewsCount} reviews</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </button>
            )}

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition"
            >
              <span>Write a review</span>
            </button>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card text-center">
            <p className="text-sm text-slate-600">No community reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-slate-800">{rev.author}</h4>
                        <p className="text-[11px] text-slate-500">{rev.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <HugeiconsIcon
                          key={i}
                          icon={StarIcon}
                          size={14}
                          className="fill-amber-400 text-amber-500"
                        />
                      ))}
                    </div>
                  </div>

                  {rev.title && (
                    <h5 className="font-serif text-xs font-semibold text-slate-900 mb-1 line-clamp-1">
                      {rev.title}
                    </h5>
                  )}

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic line-clamp-4">
                    “{rev.text}”
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="text-slate-500 font-bold">↑</span>
                    <span>{rev.upvotesCount} upvotes</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/book/${book.id}/reviews`)}
                    className="text-brand font-semibold hover:underline text-[11px] cursor-pointer"
                  >
                    Read full review →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Reviews Prompt Card */}
        {totalReviewsCount > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
            <div>
              <h4 className="font-serif text-base font-semibold text-slate-900">
                Looking for more opinions on “{book.title}”?
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Sort by upvotes, filter by star ratings, and read all {totalReviewsCount} community reviews.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/book/${book.id}/reviews`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 flex-shrink-0"
            >
              <span>View All {totalReviewsCount} Reviews</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Share your experience Dotted Card matching Figma */}
      <div 
        onClick={() => setIsReviewModalOpen(true)}
        className="mt-8 p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand bg-white/70 hover:bg-white text-center cursor-pointer transition-all duration-200 group"
      >
        <div className="w-12 h-12 rounded-full bg-brand/10 text-brand mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <HugeiconsIcon icon={BookOpen01Icon} size={22} />
        </div>
        <h3 className="font-serif text-lg font-semibold text-brand">
          Share your experience
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Anyone can review — you don’t need to have borrowed this copy.
        </p>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        bookTitle={book.title}
        onReviewSubmitted={handleNewReview}
      />

    </div>
  );
};
