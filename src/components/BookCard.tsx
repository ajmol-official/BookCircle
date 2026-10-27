import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  Location01Icon,
  BookOpen01Icon,
  GiftIcon,
  FavouriteIcon
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
  const isSaved = isWishlisted(book.id);
  const isDonation = book.availabilityMode === 'donation' || book.status === 'donation';

  return (
    <div 
      onClick={() => onSelectBook(book)}
      className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Book Cover Image & Badge */}
        <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-100 mb-4 shadow-inner">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Subtle gradient overlay on bottom of image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {/* Availability Mode Tag on Top Left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <div className="px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white flex items-center gap-1 shadow-sm">
              <HugeiconsIcon icon={Location01Icon} size={12} className="text-amber-badge" />
              <span className="text-[11px] font-medium tracking-wide">
                {book.distance}
              </span>
            </div>

            {isDonation && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wide uppercase shadow-sm flex items-center gap-1">
                <HugeiconsIcon icon={GiftIcon} size={11} />
                <span>Gift</span>
              </span>
            )}
          </div>

          {/* Wishlist Heart Button on Top Right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(book.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-sm z-10 ${
              isSaved
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-slate-900/60 text-white hover:bg-slate-900/85 hover:text-rose-300'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            title={isSaved ? 'In your wishlist' : 'Save to wishlist'}
          >
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={13}
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
          <h3 className="font-serif text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-brand transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {book.author}
          </p>

          {/* Owner info row */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectOwner) onSelectOwner(book.ownerName);
              }}
              className="flex items-center gap-1.5 text-left group/owner hover:opacity-90 transition max-w-[70%]"
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

            {isDonation ? (
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

      {/* Ratings & Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Rating stars */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <HugeiconsIcon
                key={i}
                icon={StarIcon}
                size={14}
                className={i < Math.floor(book.rating) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {book.rating}
          </span>
          <span className="text-[11px] text-slate-400">
            ({book.reviewsCount})
          </span>
        </div>

        {/* Quick Borrow or Claim Button */}
        {isDonation ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickBorrow) {
                onQuickBorrow(book);
              } else {
                onSelectBook(book);
              }
            }}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1 shadow-2xs"
          >
            <HugeiconsIcon icon={GiftIcon} size={13} />
            <span>Claim</span>
          </button>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickBorrow) {
                onQuickBorrow(book);
              } else {
                onSelectBook(book);
              }
            }}
            className="px-3 py-1 rounded-lg bg-brand/10 hover:bg-brand text-brand hover:text-white text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1"
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={13} />
            <span>Borrow</span>
          </button>
        )}
      </div>

    </div>
  );
};

