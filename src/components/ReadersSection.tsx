import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import type { Reader } from '../types';
import { ReaderCard } from './ReaderCard';

interface ReadersSectionProps {
  readers: Reader[];
  onBrowseShelf: (reader: Reader) => void;
  onSeeAll?: () => void;
}

export const ReadersSection: React.FC<ReadersSectionProps> = ({
  readers,
  onBrowseShelf,
  onSeeAll
}) => {
  return (
    <section className="pt-6 pb-16">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-[26px] font-semibold text-slate-800 tracking-tight">
            Readers near you
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Neighbors with open shelves this week.
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

      {/* Readers List */}
      <div className="flex flex-col gap-3.5 sm:gap-4">
        {readers.map((reader) => (
          <ReaderCard
            key={reader.id}
            reader={reader}
            onBrowseShelf={onBrowseShelf}
          />
        ))}
      </div>
    </section>
  );
};
