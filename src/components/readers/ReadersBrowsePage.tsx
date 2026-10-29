import React, { useState, useMemo, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  UserGroupIcon,
  ShieldCheckIcon,
  Cancel01Icon,
  ArrowUpDownIcon,
  GiftIcon
} from '@hugeicons/core-free-icons';
import type { Reader } from '../../types';
import { ReaderCard } from '../ReaderCard';

interface ReadersBrowsePageProps {
  readers: Reader[];
  onBrowseShelf: (reader: Reader) => void;
  onBack?: () => void;
}

type ReaderFilter = 'all' | 'verified' | 'nearby' | 'donations';
type ReaderSort = 'distance-asc' | 'rating-desc' | 'books-desc' | 'borrows-desc';

export const ReadersBrowsePage: React.FC<ReadersBrowsePageProps> = ({
  readers,
  onBrowseShelf,
}) => {
  // Always scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ReaderFilter>('all');
  const [sortBy, setSortBy] = useState<ReaderSort>('distance-asc');

  // Filter & sort readers
  const filteredAndSortedReaders = useMemo(() => {
    return readers
      .filter((reader) => {
        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = reader.name.toLowerCase().includes(q);
          const matchesLoc = (reader.location || '').toLowerCase().includes(q);
          const matchesBio = (reader.bio || '').toLowerCase().includes(q);
          const matchesGenres = (reader.favoriteGenres || []).some((g) =>
            g.toLowerCase().includes(q)
          );
          if (!matchesName && !matchesLoc && !matchesBio && !matchesGenres) return false;
        }

        // Selected filter pill
        if (selectedFilter === 'verified') {
          return (
            reader.verified ||
            (reader.trustTier && reader.trustTier.toLowerCase().includes('tier 5'))
          );
        }
        if (selectedFilter === 'nearby') {
          const distanceNum = parseFloat(reader.distance);
          return !isNaN(distanceNum) && distanceNum <= 1.0;
        }
        if (selectedFilter === 'donations') {
          return (reader.booksForDonation || 0) > 0;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance-asc') {
          return parseFloat(a.distance) - parseFloat(b.distance);
        }
        if (sortBy === 'rating-desc') {
          return b.rating - a.rating;
        }
        if (sortBy === 'books-desc') {
          return (b.booksAvailable || 0) - (a.booksAvailable || 0);
        }
        if (sortBy === 'borrows-desc') {
          return b.totalBorrows - a.totalBorrows;
        }
        return 0;
      });
  }, [readers, searchQuery, selectedFilter, sortBy]);

  // Counts for filter pills
  const counts = useMemo(() => {
    const verified = readers.filter(
      (r) => r.verified || r.trustTier?.toLowerCase().includes('tier 5')
    ).length;
    const nearby = readers.filter((r) => parseFloat(r.distance) <= 1.0).length;
    const donations = readers.filter((r) => (r.booksForDonation || 0) > 0).length;
    return { verified, nearby, donations };
  }, [readers]);

  return (
    <div className="pt-4 sm:pt-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Compact Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-tight">
              Readers Near You
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-bold">
              {filteredAndSortedReaders.length}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
            Connect with local neighbors sharing physical libraries within walking or biking distance.
          </p>
        </div>

        {/* Compact Search & Sort Toolbar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search readers or locations..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ReaderSort)}
              className="appearance-none pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
            >
              <option value="distance-asc">Nearest</option>
              <option value="rating-desc">Top Rated</option>
              <option value="books-desc">Most Books</option>
              <option value="borrows-desc">Most Borrows</option>
            </select>
            <HugeiconsIcon
              icon={ArrowUpDownIcon}
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Compact Filter Pills Bar */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4 py-1 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">
          Filter:
        </span>

        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            selectedFilter === 'all'
              ? 'bg-brand text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({readers.length})
        </button>

        <button
          onClick={() => setSelectedFilter('verified')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
            selectedFilter === 'verified'
              ? 'bg-brand text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HugeiconsIcon icon={ShieldCheckIcon} size={13} />
          <span>Verified ({counts.verified})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('nearby')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            selectedFilter === 'nearby'
              ? 'bg-brand text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Within 1 km ({counts.nearby})
        </button>

        <button
          onClick={() => setSelectedFilter('donations')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
            selectedFilter === 'donations'
              ? 'bg-brand text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HugeiconsIcon icon={GiftIcon} size={13} />
          <span>Has Gifts 🎁 ({counts.donations})</span>
        </button>

        {(selectedFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedFilter('all');
              setSearchQuery('');
            }}
            className="text-[11px] text-brand hover:underline font-semibold ml-auto"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 3. Readers Grid (Renders immediately below the compact toolbar) */}
      {filteredAndSortedReaders.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <HugeiconsIcon icon={UserGroupIcon} size={22} />
          </div>
          <h3 className="font-serif text-base font-semibold text-slate-800">No readers found</h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xs leading-relaxed">
            Try adjusting your search keywords or clearing your filter to see more neighbors.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
            className="mt-3 px-3.5 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition shadow-2xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 sm:gap-4">
          {filteredAndSortedReaders.map((reader) => (
            <ReaderCard
              key={reader.id}
              reader={reader}
              onBrowseShelf={onBrowseShelf}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadersBrowsePage;
