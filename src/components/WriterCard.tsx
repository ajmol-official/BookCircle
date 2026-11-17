import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen02Icon,
  CheckmarkBadge01Icon,
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

  const professionText =
    author.profession ||
    (author.nationality ? `${author.nationality} Author` : 'Author & Writer');

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
      className="group bg-white rounded-xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none transition-all duration-300 flex flex-col justify-between cursor-pointer text-left h-full"
    >
      {/* Top Content: 180px Portrait + Identity + Community Copies */}
      <div>
        {/* 1. Clean Gallery-Style Writer Portrait (180px Height per Figma Node 364:1390) */}
        <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-slate-100 mb-3.5 shadow-inner">
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
        </div>

        {/* 2. Writer Identity with Inline Verified Scallop Badge */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-serif text-lg font-semibold text-slate-800 group-hover:text-brand transition-colors truncate">
              {author.name}
            </h3>
            {author.isVerified && (
              <span title="Verified Author" className="inline-flex items-center text-emerald-600 flex-shrink-0">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={18} />
              </span>
            )}
          </div>

          {/* Profession / Role */}
          <p className="text-sm font-medium text-slate-500 truncate">
            {professionText}
          </p>
        </div>

        {/* 3. Community Copies Status Row matching Figma */}
        <div className="mt-2.5 flex items-center gap-2">
          {communityCopiesCount > 0 ? (
            <>
              <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
              <span className="text-xs font-medium text-brand truncate">
                {communityCopiesCount} Available community {communityCopiesCount === 1 ? 'copy' : 'copies'}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-500 truncate">
              0 community copies
            </span>
          )}
        </div>
      </div>

      {/* Bottom Area: Subtle Divider + Catalog Stat + Primary CTA Button */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col gap-3">
        {/* Published Books in Catalog */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
          <HugeiconsIcon
            icon={BookOpen02Icon}
            size={18}
            className="text-slate-500 flex-shrink-0"
          />
          <span className="truncate">
            <strong className="text-slate-800 font-semibold">{publishedWorksCount}</strong>{' '}
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
          className="w-full py-2.5 px-4 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium transition active:scale-95 flex items-center justify-center gap-2 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          <span>View Profile</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};

export default WriterCard;
