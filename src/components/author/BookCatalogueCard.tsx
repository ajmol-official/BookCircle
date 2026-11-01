import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  BookOpen01Icon,
  Book02Icon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import type { CatalogWork } from '../../types';

interface BookCatalogueCardProps {
  work: CatalogWork;
  onSelectWork: (work: CatalogWork) => void;
}

export const BookCatalogueCard: React.FC<BookCatalogueCardProps> = ({
  work,
  onSelectWork
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasCopies = work.totalCopies > 0;
  const isAvailable = work.availableCopies > 0;

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
      className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Book Cover Image Container */}
        <div className="relative w-full h-56 sm:h-60 rounded-xl overflow-hidden bg-slate-100 mb-4 shadow-inner">
          {/* Skeleton Pulse */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
          )}

          {imageError || !work.coverImage ? (
            <div className="w-full h-full bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 flex flex-col items-center justify-center p-4 text-center select-none">
              <HugeiconsIcon icon={BookOpen01Icon} size={36} className="text-brand/60 mb-2" />
              <span className="font-serif font-semibold text-slate-800 text-sm line-clamp-2 px-2">
                {work.title}
              </span>
              <span className="text-xs text-slate-500 mt-1 line-clamp-1">{work.author}</span>
            </div>
          ) : (
            <img
              src={work.coverImage}
              alt={`Cover of ${work.title}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}

          {/* Bottom gradient on cover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Top-Left: Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium tracking-wide shadow-sm">
              {work.category}
            </span>
          </div>

          {/* Top-Right: Community Availability Pill */}
          <div className="absolute top-3 right-3">
            {isAvailable ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/85 backdrop-blur-md text-emerald-300 border border-emerald-400/30 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{work.availableCopies} available</span>
              </span>
            ) : hasCopies ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-950/85 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[11px] font-bold flex items-center gap-1 shadow-sm">
                <span>All copies lent</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-300 text-[11px] font-medium shadow-sm">
                <span>No copies yet</span>
              </span>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="flex flex-col gap-1">
          <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-brand transition-colors">
            {work.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>{work.category}</span>
            {work.publishedYear && (
              <>
                <span className="text-slate-300">•</span>
                <span>Published {work.publishedYear}</span>
              </>
            )}
          </div>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <HugeiconsIcon icon={StarIcon} size={15} className="fill-amber-400 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {work.rating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">
              ({work.reviewsCount} {work.reviewsCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Community Footprint Metrics Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Book02Icon} size={14} className="text-brand/70" />
              <span className="font-medium text-slate-700">
                {hasCopies ? (
                  <>
                    <strong className="text-slate-900 font-semibold">{work.totalCopies}</strong> community {work.totalCopies === 1 ? 'copy' : 'copies'}
                  </>
                ) : (
                  <span className="text-slate-400">0 community copies</span>
                )}
              </span>
            </div>

            {hasCopies ? (
              <span className={`text-[11px] font-semibold ${isAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isAvailable ? `${work.availableCopies} available` : 'Lent out'}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                Be the first to share
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary CTA: Explore Copies */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectWork(work);
          }}
          className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 ${
            hasCopies
              ? 'bg-brand hover:bg-brand/90 text-white shadow-brand/20'
              : 'bg-purple-50 hover:bg-purple-100 text-brand border border-purple-200/80'
          }`}
        >
          <span>Explore Copies</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={15}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};
