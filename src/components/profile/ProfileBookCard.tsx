import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  BookOpen01Icon,
  BookOpen02Icon,
  Bookmark02Icon,
  GiftIcon,
  ArrowRight01Icon,
  FavouriteIcon,
  TickDouble02Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import type { Book, UserReadingStatusValue } from '../../types';

export interface ProfileBookCardProps {
  book: Book;
  isPublic?: boolean;
  variant?: 'default' | 'own-profile';
  readingStatus?: UserReadingStatusValue;
  isLentOutOverride?: boolean;
  isDonatedOverride?: boolean;
  onSelectBook: (book: Book) => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  onRequestBorrow?: (book: Book, ownerName?: string) => void;
  ownerName?: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (book: Book) => void;
}

export const ProfileBookCard: React.FC<ProfileBookCardProps> = ({
  book,
  isPublic = false,
  variant = 'default',
  readingStatus,
  isLentOutOverride,
  isDonatedOverride,
  onSelectBook,
  onSelectAuthor,
  onRequestBorrow,
  ownerName,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [coverError, setCoverError] = useState(false);
  const [localWishlist, setLocalWishlist] = useState(isWishlisted);

  const isPersonal = book.availabilityMode === 'personal';
  const isDonation = !isPersonal && (book.availabilityMode === 'donation' || book.status === 'donation' || book.status === 'claimed');
  const isLentOut = Boolean(isLentOutOverride ?? (book.status === 'lent_out'));
  const isDonated = Boolean(isDonatedOverride ?? (book.status === 'claimed'));
  const isAvailable = !isPersonal && (book.status === 'available' || (!book.status && !isLentOut));
  const resolvedReadingStatus = readingStatus ?? book.readingStatus;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalWishlist(!localWishlist);
    if (onToggleWishlist) {
      onToggleWishlist(book);
    }
  };

  if (variant === 'own-profile') {
    const renderPurposeIndicator = () => {
      if (isPersonal) {
        return (
          <span className="text-xs font-semibold text-slate-600 truncate">
            Personal Bookshelf
          </span>
        );
      }

      if (isDonation) {
        if (isDonated) {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 truncate">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} className="text-emerald-700 flex-shrink-0" />
              <span className="truncate">Donated</span>
            </span>
          );
        }
        return (
          <span className="text-xs font-semibold text-emerald-600 truncate">
            For Donation
          </span>
        );
      }

      if (isLentOut) {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="truncate">Currently Lent Out</span>
          </span>
        );
      }

      return (
        <span className="text-xs font-semibold text-[#3C3489] truncate">
          For Lending
        </span>
      );
    };

    const renderReadingStatusIndicator = () => {
      if (resolvedReadingStatus === 'read') {
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 whitespace-nowrap flex-shrink-0">
            <HugeiconsIcon icon={TickDouble02Icon} size={14} className="text-slate-500 flex-shrink-0" />
            <span>Read</span>
          </span>
        );
      }

      if (resolvedReadingStatus === 'reading') {
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 whitespace-nowrap flex-shrink-0">
            <HugeiconsIcon icon={BookOpen02Icon} size={14} className="text-slate-500 flex-shrink-0" />
            <span>Reading</span>
          </span>
        );
      }

      if (resolvedReadingStatus === 'want_to_read') {
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 whitespace-nowrap flex-shrink-0">
            <HugeiconsIcon icon={Bookmark02Icon} size={13} className="text-slate-500 flex-shrink-0" />
            <span>Not Read</span>
          </span>
        );
      }

      return (
        <span
          className="text-xs font-normal text-slate-500 whitespace-nowrap flex-shrink-0"
          aria-label="Reading status not set"
        >
          Not Set
        </span>
      );
    };

    return (
      <div
        onClick={() => onSelectBook(book)}
        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
      >
        <div>
          {/* Soft Framed Image Container */}
          <div className="relative w-full h-44 sm:h-[180px] rounded-xl bg-[#F1F5F9] flex items-center justify-center p-3 mb-4 overflow-hidden shadow-2xs">
            {coverError || !book.coverImage ? (
              <div className="w-full h-full bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 flex flex-col items-center justify-center p-3 text-center select-none rounded-lg">
                <HugeiconsIcon icon={BookOpen01Icon} size={30} className="text-brand/60 mb-1" />
                <span className="font-serif font-semibold text-slate-800 text-xs line-clamp-2 px-1">
                  {book.title}
                </span>
              </div>
            ) : (
              <img
                src={book.coverImage}
                alt={book.title}
                onError={() => setCoverError(true)}
                className="max-h-full max-w-[116px] object-cover rounded shadow-md group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            )}

            {/* Social Proof Badge */}
            <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full bg-white/85 backdrop-blur-xs text-xs font-medium text-slate-600 shadow-2xs">
              {book.ownersCount || 1} own this
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-slate-700 line-clamp-1 group-hover:text-brand transition-colors">
            {book.title}
          </h3>

          {/* Author & Rating Row */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectAuthor) onSelectAuthor(book.author, book.authorId);
              }}
              className="text-sm text-slate-500 font-normal hover:text-brand hover:underline truncate min-w-0 text-left transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40 cursor-pointer"
              title={`View ${book.author}'s author profile`}
            >
              {book.author}
            </button>

            <div className="flex items-center gap-1 text-xs flex-shrink-0">
              <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500 fill-amber-400" />
              <span className="font-medium text-slate-700">{book.rating || 4.6}</span>
              <span className="text-slate-500 font-normal">
                ({book.reviewsCount || 231})
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Purpose & Reading Status Row */}
        <div className="mt-3 pt-3 border-t border-slate-200/90 flex items-center justify-between gap-2">
          {renderPurposeIndicator()}
          {renderReadingStatusIndicator()}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectBook(book)}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
    >
      <div>
        {/* Soft Framed Image Container */}
        <div className="relative w-full h-44 sm:h-48 rounded-xl bg-[#F1F5F9] flex items-center justify-center p-3 mb-3.5 overflow-hidden shadow-2xs">
          {coverError || !book.coverImage ? (
            <div className="w-full h-full bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 flex flex-col items-center justify-center p-3 text-center select-none rounded-lg">
              <HugeiconsIcon icon={BookOpen01Icon} size={30} className="text-brand/60 mb-1" />
              <span className="font-serif font-semibold text-slate-800 text-xs line-clamp-2 px-1">
                {book.title}
              </span>
            </div>
          ) : (
            <img
              src={book.coverImage}
              alt={book.title}
              onError={() => setCoverError(true)}
              className="max-h-full max-w-[124px] object-cover rounded shadow-md group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}

          {/* Social Proof Badge */}
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-medium text-slate-700 shadow-2xs">
            {book.ownersCount || 1} own this
          </div>

          {/* Wishlist Heart on Public View */}
          {isPublic && (
            <button
              type="button"
              onClick={handleWishlistClick}
              className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition active:scale-90 cursor-pointer ${
                localWishlist
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-black/35 hover:bg-black/55 text-white'
              }`}
              title={localWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label="Wishlist"
            >
              <HugeiconsIcon
                icon={FavouriteIcon}
                size={14}
                className={localWishlist ? 'fill-current' : ''}
              />
            </button>
          )}
        </div>

        {/* Availability Sub-Header */}
        <div className="flex items-center justify-between text-xs font-medium pb-1.5">
          <span className="text-slate-500">
            {isDonation
              ? 'Free to claim'
              : isLentOut
              ? 'Lent out'
              : book.availabilityMode === 'personal'
              ? 'On Shelf'
              : 'Available to borrow'}
          </span>

          <div className="flex items-center gap-1.5">
            {isAvailable ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-emerald-700">Available</span>
              </>
            ) : isLentOut ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-amber-700">Lent out</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                <span className="text-rose-600">Unavailable</span>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-brand transition-colors pt-0.5">
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectAuthor) onSelectAuthor(book.author, book.authorId);
            }}
            className="hover:text-brand hover:underline font-medium text-slate-500 inline-flex items-center gap-1 transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/40 cursor-pointer"
            title={`View ${book.author}'s author profile`}
          >
            {book.author}
          </button>
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-2">
          <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500 fill-amber-400" />
          <span>{book.rating || 4.6}</span>
          <span className="text-[11px] text-slate-500 font-normal">
            ({book.reviewsCount || 231})
          </span>
        </div>
      </div>

      {/* Action CTA on Public View */}
      {isPublic && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          {isAvailable && !isDonation && onRequestBorrow ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestBorrow(book, ownerName);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <HugeiconsIcon icon={BookOpen01Icon} size={15} />
              <span>Borrow Book</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          ) : isAvailable && isDonation && onRequestBorrow ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestBorrow(book, ownerName);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <HugeiconsIcon icon={GiftIcon} size={15} />
              <span>Claim Book</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectBook(book);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#F3F0FC] hover:bg-[#ebe6fa] text-brand border border-brand/20 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <span>Explore Copies</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
