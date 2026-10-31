import React from 'react';
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

interface BookCardProps {
  book: Book;
  onSelectBook: (book: Book) => void;
  onQuickBorrow?: (book: Book) => void;
  onSelectOwner?: (ownerName: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelectBook,
  onQuickBorrow,
  onSelectOwner
}) => {
  const { toggleWishlist, isWishlisted } = useAuth();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const isSaved = isWishlisted(book.id);
  const isClaimed = book.status === 'claimed';
  const isDonation = book.availabilityMode === 'donation' || book.status === 'donation';

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={() => onSelectBook(book)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectBook(book); } }}
      className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Book Cover Image & Badge with Shimmer Skeleton */}
        <div className="relative w-full h-56 sm:h-60 rounded-xl overflow-hidden bg-slate-100 mb-4 shadow-inner">
          {/* Skeleton Shimmer */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
          )}

          {imageError || !book.coverImage ? (
            <div className="w-full h-full bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 flex flex-col items-center justify-center p-4 text-center select-none">
              <HugeiconsIcon icon={BookOpen01Icon} size={36} className="text-brand/60 mb-2" />
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
          {/* Subtle gradient overlay on bottom of image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Distance Tag on Top Left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <div className="px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white flex items-center gap-1 shadow-sm">
              <HugeiconsIcon icon={Location01Icon} size={12} className="text-amber-badge" />
              <span className="text-[11px] font-medium tracking-wide">
                {book.distance}
              </span>
            </div>

            {isClaimed && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900/85 text-white text-[10px] font-bold tracking-wide uppercase shadow-sm flex items-center gap-1">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} className="text-emerald-400" />
                <span>Claimed</span>
              </span>
            )}
          </div>

          {/* Wishlist Heart Button on Top Right (36–40px accessible touch target) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(book.id);
            }}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 shadow-sm z-10 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none ${
              isSaved
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-slate-900/60 text-white hover:bg-slate-900/85 hover:text-rose-300'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            title={isSaved ? 'In your wishlist' : 'Save to wishlist'}
          >
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={15}
              className={isSaved ? 'fill-white text-white' : 'text-white'}
            />
          </button>

          {/* "X own this" badge */}
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-300/60 shadow-sm">
            <span className="text-[11px] font-medium text-slate-700">
              {book.ownersCount} own this
            </span>
          </div>
        </div>

        {/* Book Details */}
        <div className="flex flex-col gap-1">
          <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-brand transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {book.author}
          </p>

          {/* Owner info row (Secondary hierarchy) */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectOwner) onSelectOwner(book.ownerName);
              }}
              className="flex items-center gap-1.5 text-left group/owner hover:opacity-90 transition max-w-[70%] py-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/30"
              title={`View ${book.ownerName}'s shelf`}
            >
              <img
                src={book.ownerAvatar}
                alt={book.ownerName}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span className="text-[11px] text-slate-500 group-hover/owner:text-brand font-medium truncate">
                with {book.ownerName}
              </span>
            </button>

            {isClaimed ? (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                Claimed Gift
              </span>
            ) : isDonation ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                Free Gift
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-brand text-[10px] font-bold">
                To Lend
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ratings & Action Footer (Primary CTA aligned with rating) */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Rating stars */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-shrink"
          aria-label={`Rating: ${book.rating} out of 5 stars from ${book.reviewsCount} reviews`}
          title={`Rating: ${book.rating} (${book.reviewsCount} reviews)`}
        >
          <div className="flex items-center text-amber-500 flex-shrink-0">
            {[...Array(5)].map((_, i) => (
              <HugeiconsIcon
                key={i}
                icon={StarIcon}
                size={14}
                className={i < Math.floor(book.rating) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-700 flex-shrink-0">
            {book.rating}
          </span>
          <span className="text-[11px] text-slate-500 truncate hidden xs:inline">
            ({book.reviewsCount})
          </span>
        </div>

        {/* Primary Action Button (Height 40-44px: within 40-56px range) */}
        {isClaimed ? (
          <span className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-slate-100 text-slate-500 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border border-slate-200/80 shadow-2xs flex-shrink-0 select-none">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-600" />
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
            className="h-10 sm:h-11 px-4 sm:px-4.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md flex-shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={GiftIcon} size={15} />
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
            className="h-10 sm:h-11 px-4 sm:px-4.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md flex-shrink-0 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={15} />
            <span>Borrow</span>
          </button>
        )}
      </div>

    </div>
  );
};
