import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  FilterHorizontalIcon,
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowUpDownIcon,
  CheckmarkBadge01Icon,
  BookOpen01Icon,
  UserGroupIcon
} from '@hugeicons/core-free-icons';
import type { Author } from '../../types/author';
import type { Book } from '../../types';
import { WriterCard } from '../WriterCard';
import { getCatalogWorksForAuthor } from '../../data/canonicalCatalog';

interface WritersBrowsePageProps {
  authors: Author[];
  books: Book[];
  onSelectAuthor: (authorName: string, authorId?: string) => void;
  onBack?: () => void;
}

type QuickFilter = 'all' | 'copies' | 'verified';
type SortOption = 'copies-desc' | 'works-desc' | 'followers-desc' | 'name-asc';

const GENRE_OPTIONS = [
  'All',
  'Fiction',
  'Non-fiction',
  'Poetry',
  'Science',
  'History',
  'Essays'
] as const;

export const WritersBrowsePage: React.FC<WritersBrowsePageProps> = ({
  authors,
  books,
  onSelectAuthor,
  onBack
}) => {
  // Always scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('copies-desc');

  // Filter Drawer State & Drawer Filters
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [onlyVerifiedDrawer, setOnlyVerifiedDrawer] = useState(false);
  const [onlyWithCopiesDrawer, setOnlyWithCopiesDrawer] = useState(false);

  // Compute stats per author (canonical works and circulating copies)
  const authorStats = useMemo(() => {
    const statsMap = new Map<
      string,
      { publishedWorksCount: number; communityCopiesCount: number }
    >();

    authors.forEach((author) => {
      const works = getCatalogWorksForAuthor(author.name, books);
      const publishedCount =
        works.length > 0 ? works.length : author.notableWorks?.length || 1;
      const copiesCount = works.reduce((acc, w) => acc + w.totalCopies, 0);

      statsMap.set(author.id || author.name, {
        publishedWorksCount: publishedCount,
        communityCopiesCount: copiesCount
      });
    });

    return statsMap;
  }, [authors, books]);

  // Overall Directory Counts
  const overallMetrics = useMemo(() => {
    let totalCopies = 0;
    let authorsWithCopies = 0;
    let verifiedCount = 0;

    authors.forEach((a) => {
      if (a.isVerified) verifiedCount++;
      const stats = authorStats.get(a.id || a.name);
      if (stats && stats.communityCopiesCount > 0) {
        authorsWithCopies++;
        totalCopies += stats.communityCopiesCount;
      }
    });

    return {
      totalAuthors: authors.length,
      authorsWithCopies,
      totalCopies,
      verifiedCount
    };
  }, [authors, authorStats]);

  // Extract unique nationalities with counts
  const nationalityOptions = useMemo(() => {
    const map = new Map<string, { count: number; flag?: string }>();
    authors.forEach((a) => {
      const nat = a.nationality?.trim();
      if (!nat) return;
      const existing = map.get(nat) || { count: 0, flag: a.countryFlag };
      map.set(nat, { count: existing.count + 1, flag: a.countryFlag || existing.flag });
    });

    return Array.from(map.entries())
      .map(([nationality, data]) => ({
        nationality,
        count: data.count,
        flag: data.flag
      }))
      .sort((a, b) => a.nationality.localeCompare(b.nationality));
  }, [authors]);

  // Compute active drawer filter count
  const drawerFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedNationality !== 'all') count++;
    if (selectedGenre !== 'All') count++;
    if (onlyVerifiedDrawer) count++;
    if (onlyWithCopiesDrawer) count++;
    return count;
  }, [selectedNationality, selectedGenre, onlyVerifiedDrawer, onlyWithCopiesDrawer]);

  // Reset all filters
  const handleResetAllFilters = () => {
    setSearchQuery('');
    setQuickFilter('all');
    setSelectedNationality('all');
    setSelectedGenre('All');
    setOnlyVerifiedDrawer(false);
    setOnlyWithCopiesDrawer(false);
    setSortBy('copies-desc');
  };

  // Filter & Sort Logic
  const filteredAndSortedAuthors = useMemo(() => {
    return authors
      .filter((author) => {
        const stats = authorStats.get(author.id || author.name) || {
          publishedWorksCount: 0,
          communityCopiesCount: 0
        };

        // 1. Text Search matching name, profession, nationality, or notable works
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = author.name.toLowerCase().includes(q);
          const matchProfession = (author.profession || '').toLowerCase().includes(q);
          const matchNat = (author.nationality || '').toLowerCase().includes(q);
          const matchWorks = (author.notableWorks || []).some((w) =>
            w.toLowerCase().includes(q)
          );
          if (!matchName && !matchProfession && !matchNat && !matchWorks) {
            return false;
          }
        }

        // 2. Quick Filter Tabs
        if (quickFilter === 'copies' && stats.communityCopiesCount === 0) {
          return false;
        }
        if (quickFilter === 'verified' && !author.isVerified) {
          return false;
        }

        // 3. Drawer Filters
        if (onlyVerifiedDrawer && !author.isVerified) {
          return false;
        }
        if (onlyWithCopiesDrawer && stats.communityCopiesCount === 0) {
          return false;
        }
        if (
          selectedNationality !== 'all' &&
          author.nationality?.toLowerCase() !== selectedNationality.toLowerCase()
        ) {
          return false;
        }
        if (selectedGenre !== 'All') {
          const works = getCatalogWorksForAuthor(author.name, books);
          const matchesGenre = works.some(
            (w) => w.category.toLowerCase() === selectedGenre.toLowerCase()
          );
          if (!matchesGenre) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const statsA = authorStats.get(a.id || a.name) || {
          publishedWorksCount: 0,
          communityCopiesCount: 0
        };
        const statsB = authorStats.get(b.id || b.name) || {
          publishedWorksCount: 0,
          communityCopiesCount: 0
        };

        if (sortBy === 'copies-desc') {
          if (statsB.communityCopiesCount !== statsA.communityCopiesCount) {
            return statsB.communityCopiesCount - statsA.communityCopiesCount;
          }
          return statsB.publishedWorksCount - statsA.publishedWorksCount;
        }
        if (sortBy === 'works-desc') {
          return statsB.publishedWorksCount - statsA.publishedWorksCount;
        }
        if (sortBy === 'followers-desc') {
          return (b.followersCount || 0) - (a.followersCount || 0);
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [
    authors,
    books,
    authorStats,
    searchQuery,
    quickFilter,
    selectedNationality,
    selectedGenre,
    onlyVerifiedDrawer,
    onlyWithCopiesDrawer,
    sortBy
  ]);

  return (
    <div className="pt-6 pb-20 animate-in fade-in duration-200">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: BREADCRUMBS & PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-brand transition-colors cursor-pointer flex items-center gap-1"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
            <span>Home</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Authors</span>
        </div>

        {/* Title & Community Summary */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Discover Authors
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Explore celebrated literary creators, discover their published works, and find physical community copies circulating in your neighborhood.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold flex items-center gap-1.5">
              <HugeiconsIcon icon={UserGroupIcon} size={14} />
              <span>{overallMetrics.totalAuthors} Authors in Directory</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{overallMetrics.totalCopies} Community Copies Circulating</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: SEARCH & DISCOVERY TOOLBAR
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card mb-8 space-y-4">
        {/* Row 1: Full-width live search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <HugeiconsIcon icon={Search01Icon} size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by author name, profession, nationality, or notable book..."
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
              title="Clear search"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          )}
        </div>

        {/* Row 2: Quick filter pills + Sort dropdown + More Filters button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setQuickFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                quickFilter === 'all'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              All Authors ({overallMetrics.totalAuthors})
            </button>

            <button
              type="button"
              onClick={() => setQuickFilter('copies')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                quickFilter === 'copies'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${quickFilter === 'copies' ? 'bg-white' : 'bg-brand'}`} />
              <span>With Available Copies ({overallMetrics.authorsWithCopies})</span>
            </button>

            <button
              type="button"
              onClick={() => setQuickFilter('verified')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                quickFilter === 'verified'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <HugeiconsIcon
                icon={CheckmarkBadge01Icon}
                size={14}
                className={quickFilter === 'verified' ? 'text-white' : 'text-emerald-600'}
              />
              <span>Verified ({overallMetrics.verifiedCount})</span>
            </button>
          </div>

          {/* Right Controls: Sort Dropdown & More Filters Button */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-medium rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-brand cursor-pointer transition shadow-2xs"
              >
                <option value="copies-desc">Most Copies Available</option>
                <option value="works-desc">Most Works in Catalog</option>
                <option value="followers-desc">Most Followers</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
              <HugeiconsIcon
                icon={ArrowUpDownIcon}
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* More Filters Button (Opens Slide-over Drawer) */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition active:scale-95 flex-shrink-0 cursor-pointer ${
                drawerFiltersCount > 0
                  ? 'border-brand bg-brand/10 text-brand ring-1 ring-brand/30'
                  : 'border-slate-200/90 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} size={15} className="text-brand" />
              <span>More Filters</span>
              {drawerFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                  {drawerFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: 4-COLUMN RESPONSIVE WRITER CARDS GRID
      ───────────────────────────────────────────────────────────── */}
      {filteredAndSortedAuthors.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-3">
            <HugeiconsIcon icon={BookOpen01Icon} size={26} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-800">No authors found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
            We couldn't find any authors matching your current search or filter criteria. Try clearing your search query or resetting filters.
          </p>
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition shadow-2xs active:scale-95 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAndSortedAuthors.map((author) => (
            <WriterCard
              key={author.id || author.name}
              author={author}
              books={books}
              onSelectAuthor={onSelectAuthor}
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10"
            >
              {/* Drawer Top / Content */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={FilterHorizontalIcon} size={18} className="text-brand" />
                    <h3 className="font-serif text-lg font-bold text-slate-900">
                      Filter Authors
                    </h3>
                    {drawerFiltersCount > 0 && (
                      <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                        {drawerFiltersCount} active
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                    title="Close drawer"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </button>
                </div>

                {/* 1. STATUS & VERIFICATION */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Author Status
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={onlyVerifiedDrawer}
                        onChange={(e) => setOnlyVerifiedDrawer(e.target.checked)}
                        className="rounded border-slate-300 text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                      />
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} size={15} className="text-emerald-600" />
                      <span>Verified Authors Only ({overallMetrics.verifiedCount})</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={onlyWithCopiesDrawer}
                        onChange={(e) => setOnlyWithCopiesDrawer(e.target.checked)}
                        className="rounded border-slate-300 text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                      />
                      <span className="w-2 h-2 rounded-full bg-brand" />
                      <span>Has Available Community Copies ({overallMetrics.authorsWithCopies})</span>
                    </label>
                  </div>
                </div>

                {/* 2. NATIONALITY / ORIGIN */}
                {nationalityOptions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                      <span>Nationality & Origin</span>
                      {selectedNationality !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setSelectedNationality('all')}
                          className="text-[11px] text-brand hover:underline font-normal cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => setSelectedNationality('all')}
                        className={`p-2 rounded-xl text-xs text-left transition cursor-pointer border ${
                          selectedNationality === 'all'
                            ? 'bg-brand text-white border-brand font-semibold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        All Origins
                      </button>
                      {nationalityOptions.map((opt) => (
                        <button
                          key={opt.nationality}
                          type="button"
                          onClick={() => setSelectedNationality(opt.nationality)}
                          className={`p-2 rounded-xl text-xs text-left transition cursor-pointer border flex items-center justify-between ${
                            selectedNationality.toLowerCase() === opt.nationality.toLowerCase()
                              ? 'bg-brand text-white border-brand font-semibold shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="truncate">
                            {opt.flag ? `${opt.flag} ` : ''}
                            {opt.nationality}
                          </span>
                          <span className={`text-[10px] ml-1 ${
                            selectedNationality.toLowerCase() === opt.nationality.toLowerCase()
                              ? 'text-white/80'
                              : 'text-slate-400'
                          }`}>
                            {opt.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. PRIMARY GENRE */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                    <span>Genre & Form</span>
                    {selectedGenre !== 'All' && (
                      <button
                        type="button"
                        onClick={() => setSelectedGenre('All')}
                        className="text-[11px] text-brand hover:underline font-normal cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRE_OPTIONS.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                          selectedGenre === genre
                            ? 'bg-brand text-white border-brand shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. SORT ORDER */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Sort Directory By
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      { id: 'copies-desc', label: 'Most Copies Available' },
                      { id: 'works-desc', label: 'Most Published Works' },
                      { id: 'followers-desc', label: 'Most Followers' },
                      { id: 'name-asc', label: 'Alphabetical: A to Z' }
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs text-slate-700 font-medium select-none"
                      >
                        <input
                          type="radio"
                          name="drawerSort"
                          checked={sortBy === item.id}
                          onChange={() => setSortBy(item.id as SortOption)}
                          className="text-brand focus:ring-brand cursor-pointer"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition text-center shadow-sm active:scale-95 cursor-pointer"
                >
                  Show {filteredAndSortedAuthors.length} Authors
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WritersBrowsePage;
