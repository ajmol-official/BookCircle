import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import type { Author } from '../types/author';
import type { Book } from '../types';
import { initialAuthors } from '../data/authors';
import { WriterCard } from './WriterCard';

interface WritersSectionProps {
  authors?: Author[];
  books: Book[];
  onSelectAuthor: (authorName: string, authorId?: string) => void;
  onSeeAll?: () => void;
}

export const WritersSection: React.FC<WritersSectionProps> = ({
  authors = initialAuthors.slice(0, 4),
  books,
  onSelectAuthor,
  onSeeAll
}) => {
  if (!authors || authors.length === 0) return null;

  return (
    <section className="pt-4 pb-12">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-[26px] font-semibold text-slate-800 tracking-tight">
            Writers You May Love
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Explore your favourite writers and discover their published works.
          </p>
        </div>

        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="group flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark px-3 py-1.5 rounded-lg hover:bg-brand/5 transition-all cursor-pointer"
          >
            <span>View all Writers</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        )}
      </div>

      {/* Writers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {authors.map((author) => (
          <WriterCard
            key={author.id}
            author={author}
            books={books}
            onSelectAuthor={onSelectAuthor}
          />
        ))}
      </div>
    </section>
  );
};
