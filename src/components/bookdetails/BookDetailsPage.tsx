import React, { useState, useRef, useEffect } from 'react';
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
import { ReviewModal } from './ReviewModal';
import { useAuth } from '../../context/AuthContext';

interface BookDetailsPageProps {
  book: Book;
  onBack?: () => void;
  onRequestBorrow: (book: Book, ownerName?: string) => void;
  onSelectOwner?: (ownerName: string) => void;
  onSimulateReturn?: (book: Book) => void;
}

export const BookDetailsPage: React.FC<BookDetailsPageProps> = ({
  book,
  onRequestBorrow,
  onSelectOwner,
  onSimulateReturn
}) => {
  const { toggleWishlist, isWishlisted } = useAuth();
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
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      author: 'Hana Yamada',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      rating: 5,
      date: '2 weeks ago',
      text: 'Tender and sprawling. I underlined whole paragraphs and passed it to my mother the moment I finished.'
    },
    {
      id: 'rev-2',
      author: 'Oliver West',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      rating: 5,
      date: '1 month ago',
      text: 'A patient book that rewards patient reading. The middle section dragged for me but the last hundred pages hit hard.'
    },
    {
      id: 'rev-3',
      author: 'Fatima Noor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      rating: 5,
      date: '2 months ago',
      text: 'History as tenderness. I don’t think I’ll forget Sunja for a long time.'
    }
  ]);

  const nearbyOwners = book.title.toLowerCase().includes('god of small things')
    ? [
        {
          id: 'owner-arif',
          name: 'Arif Ahmed',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
          distance: '1.2 km',
          memberSince: '2023',
          status: 'Available now (Like New)',
          isAvailable: true
        },
        {
          id: 'owner-rahim',
          name: 'Rahim Chowdhury',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
          distance: '0.6 km',
          memberSince: '2024',
          status: 'Available now (Very Good)',
          isAvailable: true
        }
      ]
    : [
        {
          id: 'owner-1',
          name: 'Aisha Patel',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          distance: '0.4 km',
          memberSince: '2023',
          status: 'Available now',
          isAvailable: true
        },
        {
          id: 'owner-2',
          name: 'Liam Becker',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
          distance: '1.2 km',
          memberSince: '2024',
          status: 'Borrowed out',
          isAvailable: false
        },
        {
          id: 'owner-3',
          name: 'Maya Fischer',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
          distance: '2.1 km',
          memberSince: '2022',
          status: 'Available now',
          isAvailable: true
        },
        {
          id: 'owner-4',
          name: 'Ethan Vogel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
          distance: '3.4 km',
          memberSince: '2024',
          status: 'Available now',
          isAvailable: true
        }
      ];

  const handleNewReview = (newRev: { author: string; rating: number; text: string }) => {
    setReviews(prev => [
      {
        id: `rev-${Date.now()}`,
        author: newRev.author,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        rating: newRev.rating,
        date: 'Just now',
        text: newRev.text
      },
      ...prev
    ]);
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
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white flex items-center gap-1 shadow-sm">
            <HugeiconsIcon icon={Location01Icon} size={12} className="text-amber-badge" />
            <span className="text-[11px] font-medium">{book.distance}</span>
          </div>
        </div>

        {/* Book Metadata */}
        <div className="flex-1 flex flex-col space-y-4 w-full">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                {isClaimed ? (
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
              by <span className="text-slate-700 font-semibold">{book.author}</span>
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
            <span className="text-sm text-slate-400">
              {book.reviewsCount || 124} community reviews
            </span>
          </div>

          {/* Stats Bar row with Wishlist Counter */}
          <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <HugeiconsIcon icon={Location01Icon} size={16} className="text-brand" />
              <span><strong>3</strong> in your area</span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <strong className="text-slate-800">1,254</strong> in country
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
          {book.status === 'lent_out' && (
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
            3 owners within 5 km ready for pickup or exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nearbyOwners.map((owner) => (
            <div
              key={owner.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col justify-between group hover:shadow-card-hover transition-all"
            >
              <div>
                <div
                  onClick={() => onSelectOwner && onSelectOwner(owner.name)}
                  className="flex items-center gap-3.5 mb-3 cursor-pointer group/owner"
                  title={`View ${owner.name}'s profile & shelf`}
                >
                  <img
                    src={owner.avatar}
                    alt={owner.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 group-hover/owner:ring-brand/40 group-hover/owner:scale-105 transition-all"
                  />
                  <div>
                    <h4 className="font-serif text-base font-semibold text-slate-800 group-hover/owner:text-brand transition-colors flex items-center gap-1">
                      <span>{owner.name}</span>
                      <span className="text-[10px] text-brand font-sans font-medium">→</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {owner.distance} · Member {owner.memberSince}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  {owner.isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{owner.status}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-400">
                      <span>{owner.status}</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                disabled={!owner.isAvailable || isClaimed || isPersonal}
                onClick={() => onRequestBorrow(book, owner.name)}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 ${
                  isClaimed || isPersonal
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed shadow-none border border-slate-200'
                    : isDonation
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : owner.isAvailable
                    ? 'bg-brand hover:bg-brand-dark text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isClaimed ? (
                  <span>Claimed</span>
                ) : isPersonal ? (
                  <>
                    <HugeiconsIcon icon={Bookmark02Icon} size={15} />
                    <span>In Reader's Private Collection</span>
                  </>
                ) : isDonation ? (
                  <>
                    <HugeiconsIcon icon={GiftIcon} size={15} />
                    <span>Claim Free Gift</span>
                  </>
                ) : owner.isAvailable ? (
                  <span>Request to Borrow</span>
                ) : (
                  <span>Unavailable</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Community Reviews section */}
      <div className="mt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-slate-800">
              Community reviews
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {reviews.length} readers have shared their thoughts
            </p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark px-3 py-1.5 rounded-lg hover:bg-brand/5 transition"
          >
            <span>Write a review</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
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
                      <p className="text-[11px] text-slate-400">{rev.date}</p>
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

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  “{rev.text}”
                </p>
              </div>
            </div>
          ))}
        </div>
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
