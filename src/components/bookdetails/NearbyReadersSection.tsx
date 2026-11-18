import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  BookOpen01Icon,
  Sorting05Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import { ReaderCopyCard, type FormattedCopy } from './ReaderCopyCard';

interface NearbyReadersSectionProps {
  copies: FormattedCopy[];
  book: Book;
  onRequestBorrow: (book: Book, ownerName?: string) => void;
  onSelectOwner?: (ownerName: string) => void;
  onOpenAddBook?: (book?: Book) => void;
}

type SortOption = 'nearest' | 'condition' | 'claim';

const SORT_LABELS: Record<SortOption, string> = {
  nearest: 'Most near by me',
  condition: 'Best condition',
  claim: 'Available to claim'
};

export const NearbyReadersSection: React.FC<NearbyReadersSectionProps> = ({
  copies,
  book,
  onRequestBorrow,
  onSelectOwner,
  onOpenAddBook
}) => {
  const [selectedSort, setSelectedSort] = useState<SortOption>('nearest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Parse distance to float km for sorting
  const parseDistanceKm = (distStr: string): number => {
    const match = distStr.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 999;
  };

  // Condition hierarchy weight
  const conditionRank = (cond?: string): number => {
    const c = (cond || '').toLowerCase();
    if (c.includes('new')) return 4;
    if (c.includes('very good')) return 3;
    if (c.includes('good')) return 2;
    if (c.includes('fair')) return 1;
    return 0;
  };

  // Re-sort copies reactively
  const sortedCopies = useMemo(() => {
    const list = [...copies];
    if (selectedSort === 'nearest') {
      return list.sort((a, b) => parseDistanceKm(a.distance) - parseDistanceKm(b.distance));
    }
    if (selectedSort === 'condition') {
      return list.sort((a, b) => conditionRank(b.condition) - conditionRank(a.condition));
    }
    if (selectedSort === 'claim') {
      return list.sort((a, b) => {
        const aClaim = a.status === 'donation' || a.availabilityMode === 'donation' ? 1 : 0;
        const bClaim = b.status === 'donation' || b.availabilityMode === 'donation' ? 1 : 0;
        return bClaim - aClaim;
      });
    }
    return list;
  }, [copies, selectedSort]);

  const availableCount = copies.filter(c => c.status === 'available' || c.status === 'donation').length;

  return (
    <section className="mt-12">
      {/* Section Header with Sort Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-slate-800 tracking-tight">
            Available from nearby readers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {copies.length > 0
              ? `${availableCount} owners within 4 km ready for pickup or exchange.`
              : 'Community physical copies circulating in your neighborhood.'}
          </p>
        </div>

        {/* Sort Dropdown */}
        {copies.length > 0 && (
          <div className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsSortOpen(prev => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs cursor-pointer"
            >
              <HugeiconsIcon icon={Sorting05Icon} size={15} className="text-slate-400" />
              <span>Sort: {SORT_LABELS[selectedSort]}</span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={14}
                className={`text-slate-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isSortOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsSortOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedSort(key);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                        selectedSort === key
                          ? 'bg-brand/10 text-brand font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{SORT_LABELS[key]}</span>
                      {selectedSort === key && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Copies Grid */}
      {sortedCopies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedCopies.map((copy) => (
            <ReaderCopyCard
              key={copy.id}
              copy={copy}
              onRequestBorrow={onRequestBorrow}
              onSelectOwner={onSelectOwner}
            />
          ))}
        </div>
      ) : (
        /* Zero Copies Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/90 shadow-card">
          <div className="w-16 h-16 bg-purple-50 text-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon icon={BookOpen01Icon} size={32} />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            No community copies available yet.
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Be the first to share this book with your neighbors! You can list your copy for lending or community donation.
          </p>
          {onOpenAddBook && (
            <button
              type="button"
              onClick={() => onOpenAddBook(book)}
              className="px-6 py-2.5 rounded-full bg-brand hover:bg-brand-dark text-white font-semibold transition active:scale-95 shadow-sm text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <HugeiconsIcon icon={BookOpen01Icon} size={16} />
              <span>+ Share a Copy of this Book</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
