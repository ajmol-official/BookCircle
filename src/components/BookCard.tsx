import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  Location01Icon,
  BookOpen01Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onSelectBook: (book: Book) => void;
  onQuickBorrow?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelectBook, onQuickBorrow }) => {
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

          {/* "X own this" badge */}
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-300/60 shadow-sm">
            <span className="text-[11px] font-medium text-slate-700">
              {book.ownersCount} own this
            </span>
          </div>

          {/* Distance Tag on Top Left */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white flex items-center gap-1 shadow-sm">
            <HugeiconsIcon icon={Location01Icon} size={12} className="text-amber-badge" />
            <span className="text-[11px] font-medium tracking-wide">
              {book.distance}
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
        </div>
      </div>

      {/* Ratings & Owner / Action Footer */}
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

        {/* Quick Borrow Button */}
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
      </div>

    </div>
  );
};
