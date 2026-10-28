import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import type { Book } from '../types';
import { BookCard } from './BookCard';

interface BooksSectionProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onQuickBorrow?: (book: Book) => void;
  onSelectOwner?: (ownerName: string) => void;
  onSeeAll?: () => void;
  selectedRadius: string;
}

export const BooksSection: React.FC<BooksSectionProps> = ({
  books,
  onSelectBook,
  onQuickBorrow,
  onSelectOwner,
  onSeeAll,
  selectedRadius
}) => {
  return (
    <section className="pt-10 pb-12">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-[26px] font-semibold text-slate-800 tracking-tight">
            Books Nearby You
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Books {selectedRadius.toLowerCase()}, updated just now.
          </p>
        </div>

        <button
          onClick={onSeeAll}
          className="group flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark px-3 py-1.5 rounded-lg hover:bg-brand/5 transition-all"
        >
          <span>See All</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={18}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>

      {/* Books Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelectBook={onSelectBook}
              onQuickBorrow={onQuickBorrow}
              onSelectOwner={onSelectOwner}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center">
            <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
          </div>
          <p className="text-slate-600 text-sm font-medium">
            No books found matching your search.
          </p>
          <p className="text-xs text-slate-400">
            Try a different category or search term to discover more books.
          </p>
        </div>
      )}
    </section>
  );
};
