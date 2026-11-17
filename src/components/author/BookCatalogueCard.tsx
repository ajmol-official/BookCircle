import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  BookOpen01Icon,
  ArrowRight01Icon,
  FavouriteIcon,
} from '@hugeicons/core-free-icons';
import type { CatalogWork } from '../../types';

interface BookCatalogueCardProps {
  work: CatalogWork;
  onSelectWork: (work: CatalogWork) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (work: CatalogWork) => void;
}

export const BookCatalogueCard: React.FC<BookCatalogueCardProps> = ({
  work,
  onSelectWork,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [imageError, setImageError] = useState(false);
  const [localWishlist, setLocalWishlist] = useState(isWishlisted);

  const hasCopies = work.totalCopies > 0;
  const isAvailable = work.availableCopies > 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalWishlist(!localWishlist);
    if (onToggleWishlist) {
      onToggleWishlist(work);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectWork(work)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectWork(work);
        }
      }}
      className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/30 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
    >
      <div>
        {/* Soft Framed Image Container */}
        <div className="relative w-full h-44 sm:h-48 rounded-xl bg-[#F1F5F9] flex items-center justify-center p-3 mb-3.5 overflow-hidden shadow-2xs">
          {imageError || !work.coverImage ? (
            <div className="w-full h-full bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 flex flex-col items-center justify-center p-3 text-center select-none rounded-lg">
              <HugeiconsIcon icon={BookOpen01Icon} size={30} className="text-brand/60 mb-1" />
              <span className="font-serif font-semibold text-slate-800 text-xs line-clamp-2 px-1">
                {work.title}
              </span>
            </div>
          ) : (
            <img
              src={work.coverImage}
              alt={work.title}
              onError={() => setImageError(true)}
              className="max-h-full max-w-[124px] object-cover rounded shadow-md group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}

          {/* Social Proof Badge */}
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-medium text-slate-700 shadow-2xs">
            {hasCopies ? `${work.totalCopies} in community` : 'Catalogue Title'}
          </div>

          {/* Floating Wishlist Heart */}
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
        </div>

        {/* Title */}
        <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-brand transition-colors pt-0.5">
          {work.title}
        </h3>

        {/* Metadata Subtitle: Genre . Published Year */}
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          <span>{work.category}</span>
          {work.publishedYear && (
            <>
              <span className="mx-1 text-slate-300">·</span>
              <span>Published {work.publishedYear}</span>
            </>
          )}
        </p>

        {/* Star Rating Row */}
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mt-2">
          <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500 fill-amber-400" />
          <span>{work.rating.toFixed(1)}</span>
          <span className="text-[11px] text-slate-400 font-normal">
            ({work.reviewsCount} {work.reviewsCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Community Circulation Row matching Figma */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {hasCopies ? (
            <>
              <span className="text-slate-600 font-medium">
                {work.totalCopies} {work.totalCopies === 1 ? 'community copy' : 'community copies'}
              </span>
              <div className="flex items-center gap-1.5 font-medium text-brand">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isAvailable ? 'bg-brand' : 'bg-amber-500'}`} />
                <span>{isAvailable ? `${work.availableCopies} Available` : 'All copies lent'}</span>
              </div>
            </>
          ) : (
            <span className="text-slate-400 font-medium">
              0 community copies
            </span>
          )}
        </div>
      </div>

      {/* Primary CTA: Explore Copies Directly Below matching Figma */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectWork(work);
          }}
          className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs ${
            hasCopies
              ? 'bg-brand hover:bg-brand-dark text-white'
              : 'bg-[#F3F0FC] hover:bg-[#ebe6fa] text-brand border border-brand/20'
          }`}
        >
          <span>Explore Copies</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </button>
      </div>
    </div>
  );
};
