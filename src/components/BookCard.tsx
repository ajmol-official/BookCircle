import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  Location01Icon,
  BookOpen01Icon,
  GiftIcon,
  FavouriteIcon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { cleanAvatarUrl, getUserInitials } from '../utils/avatarUtils';

interface BookCardProps {
  book: Book;
  onSelectBook: (book: Book) => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  onQuickBorrow?: (book: Book) => void;
  onSelectOwner?: (ownerName: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelectBook,
  onSelectAuthor,
  onQuickBorrow,
  onSelectOwner
}) => {
  const { toggleWishlist, isWishlisted } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [ownerAvatarError, setOwnerAvatarError] = useState(false);

  React.useEffect(() => {
    setOwnerAvatarError(false);
  }, [book.ownerAvatar]);

  const isSaved = isWishlisted(book.id);
  const isClaimed = book.status === 'claimed';
  const isDonation = book.availabilityMode === 'donation' || book.status === 'donation';
  const isLentOut = book.status === 'lent_out';

  // Compute available copies count
  const explicitAvailable = (book as unknown as { availableCopies?: number }).availableCopies;
  const availableCount =
    explicitAvailable !== undefined
      ? explicitAvailable
      : isClaimed || isLentOut
      ? 0
      : Math.max(1, book.ownersCount || 1);

  const rawDistance = book.distance || '1 km';
  const formattedDistance =
    rawDistance.toLowerCase().includes('away') || rawDistance.toLowerCase().includes('nearby')
      ? rawDistance
      : `${rawDistance} away`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectBook(book)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectBook(book);
        }
      }}
      className="group bg-white rounded-xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Book Cover Image Container (180px height per Figma Node 360:1216) */}
        <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-slate-100 mb-4 shadow-inner">
          {/* Skeleton Shimmer */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
          )}

          {imageError || !book.coverImage ? (
            <div className="w-full h-full bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 flex flex-col items-center justify-center p-4 text-center select-none">
              <HugeiconsIcon icon={BookOpen01Icon} size={32} className="text-brand/60 mb-2" />
              <span className="font-serif font-semibold text-slate-800 text-sm line-clamp-2 px-2">
                {book.title}
              </span>
              <span className="text-xs text-slate-500 mt-1 line-clamp-1">{book.author}</span>
            </div>
          ) : (
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title} by ${book.author}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}

          {/* Claimed badge indicator on image if claimed */}
          {isClaimed && (
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-slate-900/85 text-white text-[10px] font-bold tracking-wide uppercase shadow-sm flex items-center gap-1 z-10">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} className="text-emerald-400" />
              <span>Claimed</span>
            </div>
          )}

          {/* Floating Wishlist Heart Button (Top-Right, 32px circular glass container) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(book.id);
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 shadow-sm z-10 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none ${
              isSaved
                ? 'bg-black/60 text-[#FB1616]'
                : 'bg-black/60 text-white hover:text-rose-300'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            title={isSaved ? 'In your wishlist' : 'Save to wishlist'}
          >
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={16}
              className={isSaved ? 'fill-[#FB1616] text-[#FB1616]' : 'text-white'}
            />
          </button>

          {/* "X own this" Badge (Bottom-Right frosted translucent pill) */}
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-white/60 shadow-xs z-10">
            <span className="text-xs font-medium text-slate-700">
              {book.ownersCount} own this
            </span>
          </div>
        </div>

        {/* Content Section below cover */}
        <div className="space-y-3.5">
          {/* Row 1: Available Copies & Rating Row matching Figma */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Available Copies indicator */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isDonation
                    ? 'bg-[#059669]'
                    : availableCount > 0
                    ? 'bg-brand'
                    : 'bg-amber-500'
                }`}
              />
              <span
                className={`text-xs font-medium truncate ${
                  isDonation
                    ? 'text-[#059669]'
                    : availableCount > 0
                    ? 'text-brand'
                    : 'text-amber-700'
                }`}
              >
                {availableCount > 0
                  ? `${availableCount} available ${availableCount === 1 ? 'copy' : 'copies'}`
                  : '0 available copies'}
              </span>
            </div>

            {/* Right: Star Rating & Reviews Count */}
            <div
              className="flex items-center gap-1 flex-shrink-0"
              aria-label={`Rating: ${book.rating} out of 5 stars from ${book.reviewsCount} reviews`}
            >
              <HugeiconsIcon
                icon={StarIcon}
                size={14}
                className="fill-amber-400 text-amber-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                {book.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                ({book.reviewsCount})
              </span>
            </div>
          </div>

          {/* Row 2: Title & Author */}
          <div className="flex flex-col gap-0.5">
            <h3 className="font-serif text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-brand transition-colors">
              {book.title}
            </h3>
            <div className="flex items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAuthor?.(book.author, book.authorId);
                }}
                className="text-sm text-slate-500 hover:text-brand font-normal hover:underline text-left inline-flex items-center gap-1 transition-colors w-fit focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40 rounded py-0.5 -my-0.5 cursor-pointer"
                title={`View ${book.author}'s author profile`}
              >
                <span>{book.author}</span>
              </button>
            </div>
          </div>

          {/* Row 3: Owner Avatar & Name + Mode Pill */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectOwner?.(book.ownerName);
              }}
              className="flex items-center gap-2 text-left group/owner hover:opacity-90 transition max-w-[70%] py-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/30 cursor-pointer"
              title={`View ${book.ownerName}'s shelf`}
            >
              {cleanAvatarUrl(book.ownerAvatar) && !ownerAvatarError ? (
                <img
                  src={cleanAvatarUrl(book.ownerAvatar)}
                  alt={book.ownerName}
                  onError={() => setOwnerAvatarError(true)}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 text-brand font-serif font-bold text-[10px] flex items-center justify-center flex-shrink-0 select-none"
                  aria-label={book.ownerName}
                >
                  {getUserInitials(book.ownerName)}
                </div>
              )}
              <span className="text-sm text-slate-500 group-hover/owner:text-brand font-normal truncate">
                {book.ownerName}
              </span>
            </button>

            {/* Mode Badge Pill matching Figma */}
            {isClaimed ? (
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium flex-shrink-0">
                Claimed Gift
              </span>
            ) : isDonation ? (
              <span className="px-2.5 py-1 rounded bg-[#E5FFF7] text-[#059669] text-xs font-medium flex-shrink-0">
                Free Gift
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded bg-[#F3F0FC] text-brand text-xs font-medium flex-shrink-0">
                To Lend
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Subtle Divider & Footer (Distance paired with Primary CTA) */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
        {/* Distance on Left */}
        <div className="flex items-center gap-1 text-sm font-semibold text-brand min-w-0 truncate">
          <HugeiconsIcon icon={Location01Icon} size={18} className="text-brand flex-shrink-0" />
          <span className="truncate">{formattedDistance}</span>
        </div>

        {/* Primary Action Button on Right matching Figma */}
        {isClaimed ? (
          <span className="py-2.5 px-4 rounded-lg bg-slate-100 text-slate-500 text-sm font-medium flex items-center justify-center gap-1.5 border border-slate-200/80 shadow-2xs flex-shrink-0 select-none">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-600" />
            <span>Claimed</span>
          </span>
        ) : isDonation ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickBorrow) {
                onQuickBorrow(book);
              } else {
                onSelectBook(book);
              }
            }}
            className="py-2.5 px-4 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={GiftIcon} size={16} />
            <span>Claim</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickBorrow) {
                onQuickBorrow(book);
              } else {
                onSelectBook(book);
              }
            }}
            className="py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={16} />
            <span>Borrow</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;
