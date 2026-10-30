import React, { useState, useMemo, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  UserGroupIcon,
  ShieldCheckIcon,
  Cancel01Icon,
  ArrowUpDownIcon,
  GiftIcon,
  Location01Icon,
  BookOpen01Icon,
  Globe02Icon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import type { Reader } from '../../types';
import { ReaderCard } from '../ReaderCard';

interface ReadersBrowsePageProps {
  readers: Reader[];
  onBrowseShelf: (reader: Reader) => void;
  onBack?: () => void;
}

type DistanceOption = 'all' | '1km' | '2km' | '5km' | '10km';
type RatingOption = 'all' | '4.8' | '4.9';
type SharingFilter = 'all' | 'verified' | 'lending' | 'donations';
type ReaderSort = 'distance-asc' | 'rating-desc' | 'books-desc' | 'borrows-desc' | 'name-asc';

const DISTANCE_OPTIONS: { value: DistanceOption; label: string }[] = [
  { value: 'all', label: 'Any distance' },
  { value: '1km', label: 'Within 1 km' },
  { value: '2km', label: 'Within 2 km' },
  { value: '5km', label: 'Within 5 km' },
  { value: '10km', label: 'Within 10 km' },
];

const RATING_OPTIONS: { value: RatingOption; label: string }[] = [
  { value: 'all', label: 'Any rating' },
  { value: '4.8', label: '⭐ 4.8+ Top Rated' },
  { value: '4.9', label: '⭐ 4.9+ Master Readers' },
];

const SORT_OPTIONS: { value: ReaderSort; label: string }[] = [
  { value: 'distance-asc', label: 'Nearest First' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'books-desc', label: 'Most Books' },
  { value: 'borrows-desc', label: 'Most Borrows' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

export const ReadersBrowsePage: React.FC<ReadersBrowsePageProps> = ({
  readers,
  onBrowseShelf,
}) => {
  // Always scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingFilter, setSharingFilter] = useState<SharingFilter>('all');
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<RatingOption>('all');
  const [sortBy, setSortBy] = useState<ReaderSort>('distance-asc');

  // Extract unique neighborhoods from available readers
  const neighborhoodOptions = useMemo(() => {
    const set = new Set<string>();
    readers.forEach((r) => {
      if (!r.location) return;
      const area = r.location.split('·')[0].trim();
      if (area) set.add(area);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [readers]);

  // Extract unique reading genres from available readers
  const genreOptions = useMemo(() => {
    const set = new Set<string>();
    readers.forEach((r) => {
      (r.favoriteGenres || []).forEach((g) => {
        if (g && g.toLowerCase() !== 'all') {
          set.add(g);
        }
      });
    });
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [readers]);

  // Dynamic counts for sharing mode pills
  const counts = useMemo(() => {
    let verified = 0;
    let lending = 0;
    let donations = 0;

    readers.forEach((r) => {
      const isVerified =
        r.verified ||
        (r.trustTier &&
          (r.trustTier.toLowerCase().includes('tier 4') ||
            r.trustTier.toLowerCase().includes('tier 5')));
      if (isVerified) verified++;

      const lendingCount = r.booksForLending ?? (r.booksAvailable || 0);
      if (lendingCount > 0) lending++;

      if ((r.booksForDonation || 0) > 0) donations++;
    });

    return {
      all: readers.length,
      verified,
      lending,
      donations,
    };
  }, [readers]);

  // Active filters count (excluding defaults)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (sharingFilter !== 'all') count++;
    if (selectedDistance !== 'all') count++;
    if (selectedLocation !== 'all') count++;
    if (selectedGenre !== 'All') count++;
    if (selectedRating !== 'all') count++;
    return count;
  }, [
    searchQuery,
    sharingFilter,
    selectedDistance,
    selectedLocation,
    selectedGenre,
    selectedRating,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSharingFilter('all');
    setSelectedDistance('all');
    setSelectedLocation('all');
    setSelectedGenre('All');
    setSelectedRating('all');
    setSortBy('distance-asc');
  };

  // Filter & sort readers
  const filteredAndSortedReaders = useMemo(() => {
    return readers
      .filter((reader) => {
        // 1. Text Search across Name, Location, Reading Interests, Bio
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = reader.name.toLowerCase().includes(q);
          const matchesLoc = (reader.location || '').toLowerCase().includes(q);
          const matchesBio = (reader.bio || '').toLowerCase().includes(q);
          const matchesGenres = (reader.favoriteGenres || []).some((g) =>
            g.toLowerCase().includes(q)
          );
          if (!matchesName && !matchesLoc && !matchesBio && !matchesGenres) {
            return false;
          }
        }

        // 2. Sharing Filter Pill
        if (sharingFilter === 'verified') {
          const isVerified =
            reader.verified ||
            (reader.trustTier &&
              (reader.trustTier.toLowerCase().includes('tier 4') ||
                reader.trustTier.toLowerCase().includes('tier 5')));
          if (!isVerified) return false;
        } else if (sharingFilter === 'lending') {
          const lendingCount = reader.booksForLending ?? (reader.booksAvailable || 0);
          if (lendingCount <= 0) return false;
        } else if (sharingFilter === 'donations') {
          if ((reader.booksForDonation || 0) <= 0) return false;
        }

        // 3. Distance Filter
        if (selectedDistance !== 'all') {
          const maxDist = parseFloat(selectedDistance.replace('km', ''));
          const readerDist = parseFloat(reader.distance);
          if (isNaN(readerDist) || readerDist > maxDist) return false;
        }

        // 4. Neighborhood / Location Filter
        if (selectedLocation !== 'all') {
          const readerLoc = (reader.location || '').toLowerCase();
          if (!readerLoc.includes(selectedLocation.toLowerCase())) return false;
        }

        // 5. Reading Taste / Genre Filter
        if (selectedGenre !== 'All') {
          const genres = reader.favoriteGenres || [];
          const hasGenre = genres.some(
            (g) => g.toLowerCase() === selectedGenre.toLowerCase()
          );
          if (!hasGenre) return false;
        }

        // 6. Minimum Rating Filter
        if (selectedRating !== 'all') {
          const minRating = parseFloat(selectedRating);
          if (reader.rating < minRating) return false;
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
          const aCount =
            a.booksAvailable ??
            (a.booksForLending || 0) + (a.booksForDonation || 0);
          const bCount =
            b.booksAvailable ??
            (b.booksForLending || 0) + (b.booksForDonation || 0);
          return bCount - aCount;
        }
        if (sortBy === 'borrows-desc') {
          return b.totalBorrows - a.totalBorrows;
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [
    readers,
    searchQuery,
    sharingFilter,
    selectedDistance,
    selectedLocation,
    selectedGenre,
    selectedRating,
    sortBy,
  ]);

  return (
    <div className="pt-4 sm:pt-8 pb-20 animate-in fade-in duration-200 max-w-[1248px] mx-auto px-4 sm:px-6">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO HEADER & UNIFIED COMMAND SEARCH BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="mb-5 sm:mb-6">
        {/* Navigation & Page Title Row */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight leading-tight">
              Readers Near You
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-bold">
              {filteredAndSortedReaders.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Connect with local neighbors sharing physical libraries within walking or biking distance.
          </p>
        </div>

        {/* Unified Search Command Container */}
        <div className="relative bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-sm hover:border-slate-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-all duration-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search readers by name, neighborhood, reading interests, or bio..."
              className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition flex-shrink-0"
                title="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: PROPER IN-LINE FILTER SECTION (NO MODAL / NO DRAWER)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 mb-6 shadow-2xs space-y-4">
        {/* Layer 1: Sharing Type & Verification Pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Filter By:
            </span>

            <button
              type="button"
              onClick={() => setSharingFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 flex-shrink-0 ${
                sharingFilter === 'all'
                  ? 'bg-brand text-white shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              All Readers ({counts.all})
            </button>

            <button
              type="button"
              onClick={() => setSharingFilter('verified')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 flex-shrink-0 ${
                sharingFilter === 'verified'
                  ? 'bg-brand text-white shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              <HugeiconsIcon
                icon={ShieldCheckIcon}
                size={14}
                className={sharingFilter === 'verified' ? 'text-white' : 'text-emerald-600'}
              />
              <span>Verified ({counts.verified})</span>
            </button>

            <button
              type="button"
              onClick={() => setSharingFilter('lending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 flex-shrink-0 ${
                sharingFilter === 'lending'
                  ? 'bg-brand text-white shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              <HugeiconsIcon
                icon={BookOpen01Icon}
                size={14}
                className={sharingFilter === 'lending' ? 'text-white' : 'text-brand'}
              />
              <span>Books to Lend ({counts.lending})</span>
            </button>

            <button
              type="button"
              onClick={() => setSharingFilter('donations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 flex-shrink-0 ${
                sharingFilter === 'donations'
                  ? 'bg-brand text-white shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              <HugeiconsIcon
                icon={GiftIcon}
                size={14}
                className={sharingFilter === 'donations' ? 'text-white' : 'text-emerald-600'}
              />
              <span>Has Free Gifts 🎁 ({counts.donations})</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Layer 2: Refined Inline Dropdowns */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            {/* Distance Dropdown */}
            <div className="relative">
              <select
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(e.target.value as DistanceOption)}
                className="appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
                title="Filter by distance"
              >
                {DISTANCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <HugeiconsIcon
                icon={Location01Icon}
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <HugeiconsIcon
                icon={ArrowUpDownIcon}
                size={11}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Neighborhood / Location Dropdown */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
                title="Filter by neighborhood"
              >
                <option value="all">All Neighborhoods</option>
                {neighborhoodOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <HugeiconsIcon
                icon={Globe02Icon}
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <HugeiconsIcon
                icon={ArrowUpDownIcon}
                size={11}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Favorite Genre Dropdown */}
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
                title="Filter by reading taste"
              >
                {genreOptions.map((g) => (
                  <option key={g} value={g}>
                    {g === 'All' ? 'All Reading Tastes' : g}
                  </option>
                ))}
              </select>
              <HugeiconsIcon
                icon={BookOpen01Icon}
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <HugeiconsIcon
                icon={ArrowUpDownIcon}
                size={11}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Minimum Rating Dropdown */}
            <div className="relative">
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value as RatingOption)}
                className="appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
                title="Filter by rating"
              >
                {RATING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <HugeiconsIcon
                icon={StarIcon}
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <HugeiconsIcon
                icon={ArrowUpDownIcon}
                size={11}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Sort By Dropdown (Aligned to Right) */}
          <div className="relative self-end sm:self-auto flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ReaderSort)}
              className="appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
              title="Sort readers"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <HugeiconsIcon
              icon={ArrowUpDownIcon}
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <HugeiconsIcon
              icon={ArrowUpDownIcon}
              size={11}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Layer 3: Contextual Results Bar & Active Filter Chips */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="font-serif font-bold text-slate-900 text-sm">
                {filteredAndSortedReaders.length}
              </span>
              <span>
                {filteredAndSortedReaders.length === 1 ? 'reader found' : 'readers found'}
              </span>
              {sharingFilter !== 'all' && (
                <span className="text-slate-400">
                  ·{' '}
                  {sharingFilter === 'verified'
                    ? 'Verified'
                    : sharingFilter === 'lending'
                    ? 'With books to lend'
                    : 'With free gifts'}
                </span>
              )}
              {selectedDistance !== 'all' && (
                <span className="text-slate-400">· within {selectedDistance}</span>
              )}
              {selectedLocation !== 'all' && (
                <span className="text-slate-400">· in {selectedLocation}</span>
              )}
              {selectedGenre !== 'All' && (
                <span className="text-slate-400">· reads {selectedGenre}</span>
              )}
              {selectedRating !== 'all' && (
                <span className="text-slate-400">· {selectedRating}+ rated</span>
              )}
            </div>

            {/* Active Dismissible Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap ml-1">
                {sharingFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                    {sharingFilter === 'verified'
                      ? 'Verified 🛡️'
                      : sharingFilter === 'lending'
                      ? 'To Lend 🤝'
                      : 'Free Gifts 🎁'}
                    <button
                      onClick={() => setSharingFilter('all')}
                      title="Clear sharing filter"
                      className="hover:opacity-75"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={10} />
                    </button>
                  </span>
                )}

                {selectedDistance !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand/10 text-brand text-[11px] font-semibold border border-brand/20">
                    <HugeiconsIcon icon={Location01Icon} size={11} />
                    Within {selectedDistance}
                    <button
                      onClick={() => setSelectedDistance('all')}
                      title="Clear distance filter"
                      className="hover:opacity-75"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={10} />
                    </button>
                  </span>
                )}

                {selectedLocation !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                    <HugeiconsIcon icon={Globe02Icon} size={11} className="text-blue-600" />
                    {selectedLocation}
                    <button
                      onClick={() => setSelectedLocation('all')}
                      title="Clear neighborhood filter"
                      className="hover:opacity-75"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={10} />
                    </button>
                  </span>
                )}

                {selectedGenre !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand/10 text-brand text-[11px] font-semibold border border-brand/20">
                    <HugeiconsIcon icon={BookOpen01Icon} size={11} />
                    {selectedGenre}
                    <button
                      onClick={() => setSelectedGenre('All')}
                      title="Clear genre filter"
                      className="hover:opacity-75"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={10} />
                    </button>
                  </span>
                )}

                {selectedRating !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
                    <HugeiconsIcon icon={StarIcon} size={11} className="text-amber-500 fill-amber-400" />
                    {selectedRating}+ Rating
                    <button
                      onClick={() => setSelectedRating('all')}
                      title="Clear rating filter"
                      className="hover:opacity-75"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={10} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Reset All Action */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-brand hover:underline font-bold ml-auto"
            >
              Reset All ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: READERS LIST
      ───────────────────────────────────────────────────────────── */}
      {filteredAndSortedReaders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-3">
            <HugeiconsIcon icon={UserGroupIcon} size={26} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-800">No readers found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
            We couldn't find any neighbors matching your current filter criteria. Try adjusting your search query or resetting filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition shadow-2xs active:scale-95"
          >
            Reset All Filters
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
