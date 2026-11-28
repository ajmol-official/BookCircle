import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  Location01Icon,
  FavouriteIcon,
  Share01Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';

interface BookHeroCardProps {
  book: Book;
  copiesCount: number;
  countryCopiesCount?: number;
  wishlistCount: number;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  onShare: () => void;
}

export const BookHeroCard: React.FC<BookHeroCardProps> = ({
  book,
  copiesCount,
  countryCopiesCount = 1253,
  wishlistCount,
  isWishlisted,
  onToggleWishlist,
  onSelectAuthor,
  onShare
}) => {
  const descriptionText =
    book.description ||
    'A sweeping saga of a Korean family across four generations, exploring identity, displacement, and resilience from colonial Busan to post-war Osaka. Rich in historical texture and emotional depth, it captures the everyday triumphs and burdens of exile and survival.';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-card flex flex-col md:flex-row gap-5 md:gap-8 items-start">
      {/* 1. Unobstructed Book Cover matching Figma (no pill overlays) */}
      <div className="w-full max-w-[180px] sm:max-w-[200px] mx-auto md:max-w-none md:w-56 md:mx-0 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-md border border-slate-100">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 2. Book Metadata & Primary Actions */}
      <div className="flex-1 flex flex-col space-y-3.5 w-full">
        {/* Header Row: Title & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 w-full">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-semibold text-slate-900 tracking-tight">
              {book.title}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              by{' '}
              <button
                type="button"
                onClick={() => onSelectAuthor?.(book.author, book.authorId)}
                className="text-slate-800 font-semibold hover:text-brand hover:underline transition-colors cursor-pointer"
                title={`View ${book.author}'s profile`}
              >
                {book.author}
              </button>
            </p>
          </div>

          {/* Action Buttons: Add to Wishlist + Share */}
          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={onToggleWishlist}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 cursor-pointer shadow-2xs ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <HugeiconsIcon
                icon={FavouriteIcon}
                size={15}
                className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}
              />
              <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>

            <button
              type="button"
              onClick={onShare}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition active:scale-95 cursor-pointer shadow-2xs"
              title="Share book link"
              aria-label="Share book"
            >
              <HugeiconsIcon icon={Share01Icon} size={16} />
            </button>
          </div>
        </div>

        {/* Star Ratings Row */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <HugeiconsIcon
                key={i}
                icon={StarIcon}
                size={15}
                className="fill-amber-400 text-amber-500"
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {book.rating || 4.6}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            ({book.reviewsCount || 231} community reviews)
          </span>
        </div>

        {/* 3-Point Community Circulation Stats Row */}
        <div className="pt-2.5 sm:pt-2 border-t border-slate-100 flex items-center gap-x-4 gap-y-2 sm:gap-6 text-xs text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Location01Icon} size={15} className="text-slate-400" />
            <span>
              <strong className="text-slate-800 font-semibold">{copiesCount}</strong>{' '}
              {copiesCount === 1 ? 'copy' : 'copies'} in your area
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">·</span>

          <div className="flex items-center gap-1.5">
            <span>
              <strong className="text-slate-800 font-semibold">{countryCopiesCount}</strong> in country
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">·</span>

          <div className="flex items-center gap-1.5 text-rose-600 font-medium">
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={14}
              className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}
            />
            <span>
              <strong className="text-rose-700 font-bold">{wishlistCount}</strong> Readers wishlisted
            </span>
          </div>
        </div>

        {/* Narrative Book Description */}
        <div className="pt-1">
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            {descriptionText}
          </p>
        </div>
      </div>
    </div>
  );
};
