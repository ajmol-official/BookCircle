import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import type { Author } from '../types/author';
import type { Book } from '../types';
import { getCatalogWorksForAuthor } from '../data/canonicalCatalog';

interface WriterCardProps {
  author: Author;
  books: Book[];
  onSelectAuthor: (authorName: string, authorId?: string) => void;
}

export const WriterCard: React.FC<WriterCardProps> = ({
  author,
  books,
  onSelectAuthor
}) => {
  const [photoError, setPhotoError] = useState(false);

  // Compute canonical works and community copy count
  const catalogWorks = useMemo(() => {
    return getCatalogWorksForAuthor(author.name, books);
  }, [author.name, books]);

  const publishedWorksCount = useMemo(() => {
    return catalogWorks.length > 0 ? catalogWorks.length : (author.notableWorks?.length || 1);
  }, [catalogWorks, author.notableWorks]);

  const communityCopiesCount = useMemo(() => {
    return catalogWorks.reduce((acc, w) => acc + w.totalCopies, 0);
  }, [catalogWorks]);

  // Initials fallback
  const initials = useMemo(() => {
    if (!author.name) return 'W';
    const parts = author.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [author.name]);

  const handleClick = () => {
    onSelectAuthor(author.slug || author.name, author.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none transition-all duration-300 flex flex-col justify-between cursor-pointer text-left h-full"
    >
      {/* Top Content: Large Portrait + Identity + Bio */}
      <div>
        {/* 1. Large Prominent Writer Portrait */}
        <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden bg-slate-100 mb-4 shadow-inner">
          {photoError || !author.photo ? (
            <div className="w-full h-full bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 flex items-center justify-center text-brand font-serif font-bold text-3xl select-none">
              {initials}
            </div>
          ) : (
            <img
              src={author.photo}
              alt={author.name}
              onError={() => setPhotoError(true)}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
              loading="lazy"
            />
          )}

          {/* Subtle bottom gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Top-Left: Nationality & Flag Tag */}
          {(author.nationality || author.countryFlag) && (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white flex items-center gap-1.5 shadow-sm text-[11px] font-medium tracking-wide">
              {author.countryFlag && <span>{author.countryFlag}</span>}
              <span>{author.nationality || 'International'}</span>
            </div>
          )}

          {/* Top-Right: Verified Author Badge */}
          {author.isVerified && (
            <div
              className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-emerald-400 flex items-center gap-1 shadow-sm border border-white/10"
              title="Verified Author"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
              <span className="text-[10px] font-semibold text-white tracking-wide">Verified</span>
            </div>
          )}

          {/* Bottom-Left: Community Copies Badge Overlay */}
          <div className="absolute bottom-2.5 left-2.5">
            {communityCopiesCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-sm border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{communityCopiesCount} in community</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-md text-slate-300 text-[11px] font-medium shadow-sm border border-white/10">
                Catalog only
              </span>
            )}
          </div>
        </div>

        {/* 2. Writer Identity */}
        <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-800 group-hover:text-brand transition-colors line-clamp-1">
          {author.name}
        </h3>

        {/* Profession / Role */}
        {author.profession && (
          <p className="text-xs font-medium text-brand/90 line-clamp-1 mt-1">
            {author.profession}
          </p>
        )}

        {/* 3. Short Biography Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mt-2.5 leading-relaxed font-normal min-h-[2.5rem]">
          {author.bio || `Explore published titles and community loans by ${author.name}.`}
        </p>
      </div>

      {/* Bottom Area: Single-Line Published Books + Full-Width Primary CTA */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-3">
        {/* Published Books Count - Guaranteed Single Line, Never Wraps */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium whitespace-nowrap overflow-hidden">
          <HugeiconsIcon
            icon={BookOpen01Icon}
            size={15}
            className="text-brand flex-shrink-0"
          />
          <span className="whitespace-nowrap truncate">
            <strong className="text-slate-900 font-semibold">{publishedWorksCount}</strong>{' '}
            {publishedWorksCount === 1 ? 'published book in catalog' : 'published books in catalog'}
          </span>
        </div>

        {/* Full-Width Primary CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="w-full h-10 sm:h-11 rounded-xl bg-brand hover:bg-brand-600 active:bg-brand-700 text-white text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          <span>View Profile</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={15}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};
