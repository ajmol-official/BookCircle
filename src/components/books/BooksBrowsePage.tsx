import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  Search01Icon,
  FilterHorizontalIcon,
  StarIcon,
  Cancel01Icon,
  BookOpen01Icon,
  Location01Icon,
  ArrowUpDownIcon,
  CheckmarkBadge01Icon,
  GiftIcon,
  Grid02Icon,
  Menu01Icon,
  FavouriteIcon,
  CheckmarkCircle02Icon,
  ArrowDown01Icon,
  Globe02Icon,
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import { BookCard } from '../BookCard';
import { useAuth } from '../../context/AuthContext';
import { getAuthorCountry, getCountryFlag } from '../../utils/countryData';

interface BooksBrowsePageProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onQuickBorrow?: (book: Book) => void;
  onSelectOwner?: (ownerName: string) => void;
  onBack: () => void;
}

type DistanceOption = 'all' | '1km' | '2km' | '5km' | '10km';
type RatingOption = 'all' | '4.8' | '4.5' | '4.0';
type SortOption = 'distance-asc' | 'rating-desc' | 'reviews-desc' | 'title-asc';
type AvailabilityTab = 'all' | 'lending' | 'donation' | 'lent_out';

const CATEGORIES = ['All', 'Fiction', 'Non-fiction', 'Science', 'History', 'Poetry'] as const;
const CONDITIONS = ['Like New', 'Very Good', 'Good', 'Fair'] as const;

export const BooksBrowsePage: React.FC<BooksBrowsePageProps> = ({
  books,
  onSelectBook,
  onQuickBorrow,
  onSelectOwner,
  onBack
}) => {
  const { toggleWishlist, isWishlisted } = useAuth();

  // Always scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Primary Search & Discovery States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAvailabilityTab, setActiveAvailabilityTab] = useState<AvailabilityTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('distance-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Granular Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<RatingOption>('all');

  // Dynamic counts for availability modes
  const availabilityCounts = useMemo(() => {
    let lendingCount = 0;
    let donationCount = 0;
    let lentOutCount = 0;

    books.forEach((b) => {
      // Private Collection books never appear in community discovery or counts
      if (b.availabilityMode === 'personal') return;

      if (b.status === 'claimed') {
        // Claimed gifts are archived
      } else if (b.availabilityMode === 'donation' || b.status === 'donation') {
        donationCount++;
      } else if (b.status === 'available') {
        lendingCount++;
      } else if (b.status === 'lent_out') {
        lentOutCount++;
      }
    });

    return {
      all: lendingCount + donationCount + lentOutCount,
      lending: lendingCount,
      donation: donationCount,
      lent_out: lentOutCount
    };
  }, [books]);

  // Extract unique author countries from available books with real counts
  const countryOptions = useMemo(() => {
    const map = new Map<string, number>();
    books.forEach((b) => {
      if (b.availabilityMode === 'personal') return;
      const country = getAuthorCountry(b.author, b.authorCountry);
      map.set(country, (map.get(country) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([country, count]) => ({
        country,
        count,
        flag: getCountryFlag(country)
      }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [books]);

  // Active filter count (excluding default 'All' values)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeAvailabilityTab !== 'all') count++;
    if (selectedCategory !== 'All') count++;
    if (selectedCountry !== 'all') count++;
    if (selectedDistance !== 'all') count++;
    if (selectedRating !== 'all') count++;
    if (selectedCondition !== 'all') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [
    activeAvailabilityTab,
    selectedCategory,
    selectedCountry,
    selectedDistance,
    selectedRating,
    selectedCondition,
    searchQuery
  ]);

  // Filter drawer active badge count
  const drawerFiltersCount = useMemo(() => {
    let count = 0;
    if (activeAvailabilityTab !== 'all') count++;
    if (selectedCategory !== 'All') count++;
    if (selectedCountry !== 'all') count++;
    if (selectedDistance !== 'all') count++;
    if (selectedRating !== 'all') count++;
    if (selectedCondition !== 'all') count++;
    return count;
  }, [
    activeAvailabilityTab,
    selectedCategory,
    selectedCountry,
    selectedDistance,
    selectedRating,
    selectedCondition
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveAvailabilityTab('all');
    setSelectedCategory('All');
    setSelectedCountry('all');
    setSelectedDistance('all');
    setSelectedRating('all');
    setSelectedCondition('all');
    setSortBy('distance-asc');
  };

  // Core Filtering & Sorting Engine
  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter((book) => {
        // 0. Private Collection Isolation: Never show in global discovery or search
        if (book.availabilityMode === 'personal') {
          return false;
        }

        // 1. Text Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = book.title.toLowerCase().includes(q);
          const matchAuthor = book.author.toLowerCase().includes(q);
          const matchOwner = book.ownerName.toLowerCase().includes(q);
          const matchCategory = book.category.toLowerCase().includes(q);
          const matchCountry = getAuthorCountry(book.author, book.authorCountry).toLowerCase().includes(q);
          const matchDesc = (book.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchOwner && !matchCategory && !matchCountry && !matchDesc) {
            return false;
          }
        }

        // 2. Availability Mode / Tab Selection
        if (activeAvailabilityTab !== 'all') {
          const isLending = book.status === 'available' && book.availabilityMode !== 'donation';
          const isDonation =
            (book.availabilityMode === 'donation' || book.status === 'donation') &&
            book.status !== 'claimed';
          const isLentOut = book.status === 'lent_out';

          if (activeAvailabilityTab === 'lending' && !isLending) return false;
          if (activeAvailabilityTab === 'donation' && !isDonation) return false;
          if (activeAvailabilityTab === 'lent_out' && !isLentOut) return false;
        }

        // 3. Category / Genre Filter
        if (selectedCategory !== 'All') {
          if (book.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // 4. Author Country Filter
        if (selectedCountry !== 'all') {
          const bookCountry = getAuthorCountry(book.author, book.authorCountry);
          if (bookCountry.toLowerCase() !== selectedCountry.toLowerCase()) {
            return false;
          }
        }

        // 5. Distance Radius Filter
        if (selectedDistance !== 'all') {
          const distNum = parseFloat(book.distance);
          if (!isNaN(distNum)) {
            const maxDist =
              selectedDistance === '1km'
                ? 1.0
                : selectedDistance === '2km'
                ? 2.0
                : selectedDistance === '5km'
                ? 5.0
                : 10.0;
            if (distNum > maxDist) return false;
          }
        }

        // 6. Minimum Rating Filter
        if (selectedRating !== 'all') {
          const minRating = parseFloat(selectedRating);
          if (book.rating < minRating) return false;
        }

        // 7. Physical Condition Filter
        if (selectedCondition !== 'all') {
          if (!book.condition || book.condition.toLowerCase() !== selectedCondition.toLowerCase()) {
            return false;
          }
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
        if (sortBy === 'reviews-desc') {
          return b.reviewsCount - a.reviewsCount;
        }
        if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [
    books,
    searchQuery,
    activeAvailabilityTab,
    selectedCategory,
    selectedCountry,
    selectedDistance,
    selectedRating,
    selectedCondition,
    sortBy
  ]);

  return (
    <div className="pt-4 sm:pt-8 pb-20 animate-in fade-in duration-200 max-w-[1248px] mx-auto px-4 sm:px-6">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO HEADER & UNIFIED COMMAND SEARCH BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="mb-6 sm:mb-8">
        {/* Navigation & Page Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-brand border border-slate-200/90 text-xs font-semibold shadow-2xs transition active:scale-95"
              title="Return to home"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span>Home</span>
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight leading-tight">
                  Find & Explore Books
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-bold">
                  {filteredAndSortedBooks.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Physical paperbacks and hardcovers shared by neighbors in your circle.
              </p>
            </div>
          </div>
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
              placeholder="Search by book title, author, author country, neighbor, or description..."
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

        {/* Quick Search Suggestions */}
        {!searchQuery && (
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400 flex-wrap px-1">
            <span className="font-medium text-slate-500">Popular shortcuts:</span>
            {[
              { label: 'Sapiens', action: () => setSearchQuery('Sapiens') },
              { label: 'Free Gifts', action: () => setActiveAvailabilityTab('donation') },
              { label: 'Fiction', action: () => setSelectedCategory('Fiction') },
              { label: 'Within 1km', action: () => setSelectedDistance('1km') },
              { label: 'Like New', action: () => setSelectedCondition('Like New') },
              { label: 'USA Authors', action: () => setSelectedCountry('United States') },
            ].map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                onClick={shortcut.action}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-brand/10 hover:text-brand text-slate-600 transition"
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: TOOLBAR (FEEDBACK, ACTIVE CHIPS, SORT & VIEW)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 mb-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Results Contextual Feedback & Active Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="font-serif font-bold text-slate-900 text-sm">
              {filteredAndSortedBooks.length}
            </span>
            <span>books found</span>
            {activeAvailabilityTab !== 'all' && (
              <span className="text-slate-400">
                · {activeAvailabilityTab === 'lending' ? 'To Lend' : activeAvailabilityTab === 'donation' ? 'Free Gifts' : 'Lent Out'}
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="text-slate-400">· in {selectedCategory}</span>
            )}
            {selectedCountry !== 'all' && (
              <span className="text-slate-400">· from {selectedCountry}</span>
            )}
            {selectedDistance !== 'all' && (
              <span className="text-slate-400">· within {selectedDistance}</span>
            )}
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap ml-1">
              {activeAvailabilityTab !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  {activeAvailabilityTab === 'lending'
                    ? 'To Lend 🤝'
                    : activeAvailabilityTab === 'donation'
                    ? 'Free Gifts 🎁'
                    : 'Lent Out ⏳'}
                  <button onClick={() => setActiveAvailabilityTab('all')} title="Clear availability filter">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}

              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand/10 text-brand text-[11px] font-semibold border border-brand/20">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} title="Clear category filter">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}

              {selectedCountry !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                  <HugeiconsIcon icon={Globe02Icon} size={11} className="text-blue-600" />
                  <span>{getCountryFlag(selectedCountry)} {selectedCountry}</span>
                  <button onClick={() => setSelectedCountry('all')} title="Clear country filter">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}

              {selectedDistance !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand/10 text-brand text-[11px] font-semibold border border-brand/20">
                  <HugeiconsIcon icon={Location01Icon} size={11} />
                  Within {selectedDistance}
                  <button onClick={() => setSelectedDistance('all')} title="Clear distance filter">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}

              {selectedRating !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
                  <HugeiconsIcon icon={StarIcon} size={11} className="fill-amber-500 text-amber-500" />
                  {selectedRating}+ Stars
                  <button onClick={() => setSelectedRating('all')} title="Clear rating filter">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}

              {selectedCondition !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                  {selectedCondition}
                  <button onClick={() => setSelectedCondition('all')} title="Clear condition filter">
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-brand hover:underline font-bold ml-1"
              >
                Reset All ({activeFiltersCount})
              </button>
            </div>
          )}
        </div>

        {/* Right Action Controls: Distance, Sort, Drawer Trigger, View Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          
          {/* Distance Dropdown */}
          <div className="relative">
            <select
              value={selectedDistance}
              onChange={(e) => setSelectedDistance(e.target.value as DistanceOption)}
              className="appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
            >
              <option value="all">Any distance</option>
              <option value="1km">&lt; 1 km away</option>
              <option value="2km">&lt; 2 km away</option>
              <option value="5km">&lt; 5 km away</option>
              <option value="10km">&lt; 10 km away</option>
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

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
            >
              <option value="distance-asc">Nearest First</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="reviews-desc">Most Reviewed</option>
              <option value="title-asc">Title: A to Z</option>
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

          {/* More Filters Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition active:scale-95 ${
              drawerFiltersCount > 0
                ? 'border-brand bg-brand/10 text-brand ring-1 ring-brand/30'
                : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <HugeiconsIcon icon={FilterHorizontalIcon} size={14} className="text-brand" />
            <span>More Filters</span>
            {drawerFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                {drawerFiltersCount}
              </span>
            )}
          </button>

          {/* Grid / List Layout Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white text-brand shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <HugeiconsIcon icon={Grid02Icon} size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-white text-brand shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Compact List View"
            >
              <HugeiconsIcon icon={Menu01Icon} size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: RESULTS DISPLAY (GRID OR COMPACT LIST VIEW)
      ───────────────────────────────────────────────────────────── */}
      {filteredAndSortedBooks.length > 0 ? (
        viewMode === 'grid' ? (
          /* GRID VIEW: Responsive 4-Column on large screens */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedBooks.map((book) => (
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
          /* COMPACT LIST VIEW: Ideal for dense horizontal comparison */
          <div className="space-y-3.5">
            {filteredAndSortedBooks.map((book) => {
              const isClaimed = book.status === 'claimed';
              const isDonation = book.availabilityMode === 'donation' || book.status === 'donation';
              const isSaved = isWishlisted(book.id);
              const authorCountry = getAuthorCountry(book.author, book.authorCountry);

              return (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="group bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-card-hover hover:border-brand/40 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  {/* Left: Thumbnail & Main Book Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-16 h-22 object-cover rounded-xl shadow-xs border border-slate-200 flex-shrink-0 group-hover:scale-102 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-900 group-hover:text-brand transition-colors truncate">
                          {book.title}
                        </h3>
                        {isClaimed ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            Claimed
                          </span>
                        ) : isDonation ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                            Free Gift
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold">
                            To Lend
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        by {book.author} <span className="text-slate-400">({getCountryFlag(authorCountry)} {authorCountry})</span>
                      </p>
                      
                      {/* Secondary Metadata Row */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <HugeiconsIcon icon={StarIcon} size={13} className="fill-amber-400 text-amber-500" />
                          {book.rating}
                          <span className="font-normal text-slate-400">({book.reviewsCount})</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={Location01Icon} size={13} className="text-brand" />
                          {book.distance}
                        </span>
                        <span>·</span>
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {book.condition || 'Good'}
                        </span>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectOwner) onSelectOwner(book.ownerName);
                          }}
                          className="flex items-center gap-1 hover:text-brand transition text-slate-600"
                        >
                          <img
                            src={book.ownerAvatar}
                            alt={book.ownerName}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="underline decoration-slate-300">{book.ownerName}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(book.id);
                      }}
                      className={`p-2.5 rounded-xl border transition ${
                        isSaved
                          ? 'border-rose-200 bg-rose-50 text-rose-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-rose-500'
                      }`}
                      title={isSaved ? 'In your wishlist' : 'Save to wishlist'}
                    >
                      <HugeiconsIcon
                        icon={FavouriteIcon}
                        size={18}
                        className={isSaved ? 'fill-rose-500' : ''}
                      />
                    </button>

                    {isClaimed ? (
                      <span className="h-10 px-4 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-600" />
                        <span>Claimed</span>
                      </span>
                    ) : isDonation ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onQuickBorrow) onQuickBorrow(book);
                          else onSelectBook(book);
                        }}
                        className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 shadow-sm"
                      >
                        <HugeiconsIcon icon={GiftIcon} size={15} />
                        <span>Claim Gift</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onQuickBorrow) onQuickBorrow(book);
                          else onSelectBook(book);
                        }}
                        className="h-10 px-5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 shadow-sm"
                      >
                        <HugeiconsIcon icon={BookOpen01Icon} size={15} />
                        <span>Borrow</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ─────────────────────────────────────────────────────────────
            SECTION 4: DELIGHTFUL ZERO-MATCH RECOVERY STATE
        ───────────────────────────────────────────────────────────── */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center mb-4">
            <HugeiconsIcon icon={BookOpen01Icon} size={30} />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900 mb-1.5">
            No matching books found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
            We couldn't find any books matching your specific filters. Try opening More Filters to adjust your criteria, widening your search radius, or clearing your search query.
          </p>

          {/* Quick Actionable Recovery Buttons */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Clear Search Term
              </button>
            )}
            {selectedCountry !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCountry('all')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Reset Country Filter
              </button>
            )}
            {selectedDistance !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedDistance('all')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Expand Distance to Any
              </button>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: GRANULAR FILTER SLIDE-OVER DRAWER MODAL
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
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                      <HugeiconsIcon icon={FilterHorizontalIcon} size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-slate-900">
                        Filter & Refine Books
                      </h3>
                      <p className="text-xs text-slate-500">Refine by mode, country, condition, distance & rating</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </button>
                </div>

                {/* 1. AVAILABILITY MODE / BOOK (Dropdown) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="text-amber-500" />
                      <span>Available Mode / Book</span>
                    </label>
                    {activeAvailabilityTab !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setActiveAvailabilityTab('all')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={activeAvailabilityTab}
                      onChange={(e) => setActiveAvailabilityTab(e.target.value as AvailabilityTab)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer shadow-2xs transition"
                    >
                      <option value="all">All Books ({availabilityCounts.all})</option>
                      <option value="lending">Available to Lend ({availabilityCounts.lending})</option>
                      <option value="donation">Free Gifts to Keep ({availabilityCounts.donation})</option>
                      <option value="lent_out">Currently Lent Out ({availabilityCounts.lent_out})</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                    </div>
                  </div>
                </div>

                {/* 2. GENRE / CATEGORY PILLS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={BookOpen01Icon} size={14} className="text-brand" />
                      <span>Genre / Category</span>
                    </label>
                    {selectedCategory !== 'All' && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('All')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition ${
                            isSelected
                              ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. AUTHOR COUNTRY SECTION (Dropdown) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={Globe02Icon} size={14} className="text-blue-500" />
                      <span>Country (Author Origin)</span>
                    </label>
                    {selectedCountry !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedCountry('all')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer shadow-2xs transition"
                    >
                      <option value="all">All Countries ({books.length})</option>
                      {countryOptions.map(({ country, count, flag }) => (
                        <option key={country} value={country}>
                          {flag} {country} ({count})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                    </div>
                  </div>
                </div>

                {/* 4. PHYSICAL CONDITION (Dropdown) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Physical Condition
                    </label>
                    {selectedCondition !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedCondition('all')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer shadow-2xs transition"
                    >
                      <option value="all">All Conditions</option>
                      {CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                    </div>
                  </div>
                </div>

                {/* 5. DISTANCE RADIUS PILLS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={Location01Icon} size={14} className="text-brand" />
                      <span>Distance Radius</span>
                    </label>
                    {selectedDistance !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedDistance('all')}
                        className="text-[11px] text-brand hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: 'all' as DistanceOption, label: 'Any' },
                      { id: '1km' as DistanceOption, label: '< 1km' },
                      { id: '2km' as DistanceOption, label: '< 2km' },
                      { id: '5km' as DistanceOption, label: '< 5km' },
                      { id: '10km' as DistanceOption, label: '< 10km' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedDistance(opt.id)}
                        className={`py-2 text-[11px] font-semibold rounded-xl border text-center transition ${
                          selectedDistance === opt.id
                            ? 'bg-brand text-white border-brand shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. MINIMUM COMMUNITY RATING PILLS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500 fill-amber-500" />
                      <span>Minimum Rating</span>
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
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'all' as RatingOption, label: 'Any' },
                      { id: '4.8' as RatingOption, label: '4.8+ ⭐' },
                      { id: '4.5' as RatingOption, label: '4.5+ ⭐' },
                      { id: '4.0' as RatingOption, label: '4.0+ ⭐' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedRating(opt.id)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition ${
                          selectedRating === opt.id
                            ? 'bg-brand text-white border-brand shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition text-center"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition text-center shadow-sm"
                >
                  Show {filteredAndSortedBooks.length} Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BooksBrowsePage;
