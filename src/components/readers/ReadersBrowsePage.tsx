import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FilterHorizontalIcon,
  CheckmarkBadge01Icon,
  ArrowDown01Icon,
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
  { value: '1km', label: '< 1 km away' },
  { value: '2km', label: '< 2 km away' },
  { value: '5km', label: '< 5 km away' },
  { value: '10km', label: '< 10 km away' },
];

const RATING_OPTIONS: { value: RatingOption; label: string }[] = [
  { value: 'all', label: 'Any Rating' },
  { value: '4.8', label: '4.8+ ⭐' },
  { value: '4.9', label: '4.9+ ⭐' },
];

const SORT_OPTIONS: { value: ReaderSort; label: string }[] = [
  { value: 'distance-asc', label: 'Nearest First' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'books-desc', label: 'Most Books Available' },
  { value: 'borrows-desc', label: 'Most Borrows Completed' },
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

  // Primary Search State (Outside Drawer)
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Distance Filter (Outside Drawer)
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>('all');

  // Filter Drawer State & Drawer Filters
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [sharingFilter, setSharingFilter] = useState<SharingFilter>('all');
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

  // Dynamic counts for sharing mode options
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

  // Count of active filters inside the drawer
  const drawerFiltersCount = useMemo(() => {
    let count = 0;
    if (sharingFilter !== 'all') count++;
    if (selectedLocation !== 'all') count++;
    if (selectedGenre !== 'All') count++;
    if (selectedRating !== 'all') count++;
    if (sortBy !== 'distance-asc') count++;
    return count;
  }, [sharingFilter, selectedLocation, selectedGenre, selectedRating, sortBy]);

  const handleResetDrawerFilters = () => {
    setSharingFilter('all');
    setSelectedLocation('all');
    setSelectedGenre('All');
    setSelectedRating('all');
    setSortBy('distance-asc');
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedDistance('all');
    handleResetDrawerFilters();
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

        // 2. Sharing Filter Pill / Status
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

        // 3. Distance Filter (from toolbar)
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
          SECTION 2: SINGLE HORIZONTAL TOOLBAR
          (Displays Reader Count, Distance Filter & More Filters Button in 1 line)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 mb-6 shadow-2xs flex flex-row items-center justify-between gap-2 sm:gap-3">
        {/* Left: Reader Count Context */}
        <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
          <span className="font-serif font-bold text-slate-900 text-sm sm:text-base flex-shrink-0">
            {filteredAndSortedReaders.length}
          </span>
          <span className="text-xs sm:text-sm text-slate-600 font-medium truncate">
            {filteredAndSortedReaders.length === 1 ? 'Reader Found' : 'Readers Found'}
          </span>
          {drawerFiltersCount > 0 && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[11px] font-semibold ml-1">
              {drawerFiltersCount} {drawerFiltersCount === 1 ? 'filter' : 'filters'} active
            </span>
          )}
        </div>

        {/* Right: Distance Dropdown & More Filters Control (Strict Single Line) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Distance Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedDistance}
              onChange={(e) => setSelectedDistance(e.target.value as DistanceOption)}
              className="appearance-none pl-7 pr-7 py-2 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs transition"
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

          {/* More Filters Control (Opens Drawer) */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition active:scale-95 flex-shrink-0 ${
              drawerFiltersCount > 0
                ? 'border-brand bg-brand/10 text-brand ring-1 ring-brand/30'
                : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <HugeiconsIcon icon={FilterHorizontalIcon} size={15} className="text-brand" />
            <span className="hidden xs:inline">More Filters</span>
            <span className="xs:hidden">Filters</span>
            {drawerFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                {drawerFiltersCount}
              </span>
            )}
          </button>
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
            onClick={handleResetAllFilters}
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

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: COMPREHENSIVE FILTER DRAWER (SLIDE-OVER PANEL)
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                      <HugeiconsIcon icon={FilterHorizontalIcon} size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-slate-900">
                        Filter & Refine Readers
                      </h3>
                      <p className="text-xs text-slate-500">
                        Refine by category, neighborhood, reading taste, rating & sort
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                    title="Close drawer"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </button>
                </div>

                {/* 1. READER CATEGORIES / SHARING STATUS */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="text-amber-500" />
                      <span>Reader Categories</span>
                    </label>
                    {sharingFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSharingFilter('all')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSharingFilter('all')}
                      className={`py-2 px-3 text-xs rounded-xl border text-left transition ${
                        sharingFilter === 'all'
                          ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="font-medium truncate">All Readers</div>
                      <div className={`text-[10px] ${sharingFilter === 'all' ? 'text-white/80' : 'text-slate-400'}`}>
                        {counts.all} available
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSharingFilter('verified')}
                      className={`py-2 px-3 text-xs rounded-xl border text-left transition ${
                        sharingFilter === 'verified'
                          ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-medium truncate">
                        <HugeiconsIcon
                          icon={ShieldCheckIcon}
                          size={12}
                          className={sharingFilter === 'verified' ? 'text-white' : 'text-emerald-600'}
                        />
                        <span>Verified</span>
                      </div>
                      <div className={`text-[10px] ${sharingFilter === 'verified' ? 'text-white/80' : 'text-slate-400'}`}>
                        {counts.verified} neighbors
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSharingFilter('lending')}
                      className={`py-2 px-3 text-xs rounded-xl border text-left transition ${
                        sharingFilter === 'lending'
                          ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-medium truncate">
                        <HugeiconsIcon
                          icon={BookOpen01Icon}
                          size={12}
                          className={sharingFilter === 'lending' ? 'text-white' : 'text-brand'}
                        />
                        <span>Books to Lend</span>
                      </div>
                      <div className={`text-[10px] ${sharingFilter === 'lending' ? 'text-white/80' : 'text-slate-400'}`}>
                        {counts.lending} lenders
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSharingFilter('donations')}
                      className={`py-2 px-3 text-xs rounded-xl border text-left transition ${
                        sharingFilter === 'donations'
                          ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-medium truncate">
                        <HugeiconsIcon
                          icon={GiftIcon}
                          size={12}
                          className={sharingFilter === 'donations' ? 'text-white' : 'text-emerald-600'}
                        />
                        <span>Has Free Gifts</span>
                      </div>
                      <div className={`text-[10px] ${sharingFilter === 'donations' ? 'text-white/80' : 'text-slate-400'}`}>
                        {counts.donations} donors
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. NEIGHBORHOOD / LOCATION */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={Globe02Icon} size={14} className="text-blue-500" />
                      <span>Neighborhood / Area</span>
                    </label>
                    {selectedLocation !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedLocation('all')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer shadow-2xs transition"
                    >
                      <option value="all">All Neighborhoods ({readers.length} readers)</option>
                      {neighborhoodOptions.map((area) => (
                        <option key={area} value={area}>
                          📍 {area}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                    </div>
                  </div>
                </div>

                {/* 3. READING TASTES & FAVORITE GENRES */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={BookOpen01Icon} size={14} className="text-brand" />
                      <span>Reading Tastes & Genres</span>
                    </label>
                    {selectedGenre !== 'All' && (
                      <button
                        type="button"
                        onClick={() => setSelectedGenre('All')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {genreOptions.map((g) => {
                      const isSelected = selectedGenre === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setSelectedGenre(g)}
                          className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition ${
                            isSelected
                              ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {g === 'All' ? 'All Genres' : g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. MINIMUM TRUST RATING */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500 fill-amber-500" />
                      <span>Minimum Community Rating</span>
                    </label>
                    {selectedRating !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedRating('all')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {RATING_OPTIONS.map((opt) => {
                      const isSelected = selectedRating === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelectedRating(opt.value)}
                          className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition ${
                            isSelected
                              ? 'bg-brand text-white border-brand shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. SORTING OPTIONS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={ArrowUpDownIcon} size={14} className="text-brand" />
                      <span>Sort Readers By</span>
                    </label>
                    {sortBy !== 'distance-asc' && (
                      <button
                        type="button"
                        onClick={() => setSortBy('distance-asc')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as ReaderSort)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer shadow-2xs transition"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleResetDrawerFilters}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition text-center"
                >
                  Reset Drawer
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition text-center shadow-sm active:scale-95"
                >
                  Show {filteredAndSortedReaders.length} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReadersBrowsePage;
