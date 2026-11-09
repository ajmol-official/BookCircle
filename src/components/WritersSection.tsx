import React from 'react';
import type { Author } from '../types/author';
import type { Book } from '../types';
import { initialAuthors } from '../data/authors';
import { WriterCard } from './WriterCard';

interface WritersSectionProps {
  authors?: Author[];
  books: Book[];
  onSelectAuthor: (authorName: string, authorId?: string) => void;
}

export const WritersSection: React.FC<WritersSectionProps> = ({
  authors = initialAuthors.slice(0, 4),
  books,
  onSelectAuthor
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

