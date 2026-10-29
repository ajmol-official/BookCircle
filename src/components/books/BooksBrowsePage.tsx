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
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import { BookCard } from '../BookCard';
import { useAuth } from '../../context/AuthContext';

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

  // Secondary Granular Filter Drawer States
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [authorSearchText, setAuthorSearchText] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<RatingOption>('all');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Unique authors extraction for filter dropdown
  const uniqueAuthors = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.author) set.add(b.author.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [books]);

  // Dynamic counts for availability tabs
  const availabilityCounts = useMemo(() => {
    let lendingCount = 0;
    let donationCount = 0;
    let lentOutCount = 0;

    books.forEach((b) => {
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

  // Toggle multi-select conditions
  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((item) => item !== cond) : [...prev, cond]
    );
  };

  // Active filter count (excluding default 'All' values)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeAvailabilityTab !== 'all') count++;
    if (selectedCategory !== 'All') count++;
    if (selectedDistance !== 'all') count++;
    if (selectedAuthor !== 'all' || authorSearchText.trim() !== '') count++;
    if (selectedRating !== 'all') count++;
    if (selectedConditions.length > 0) count += selectedConditions.length;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [
    activeAvailabilityTab,
    selectedCategory,
    selectedDistance,
    selectedAuthor,
    authorSearchText,
    selectedRating,
    selectedConditions,
    searchQuery
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveAvailabilityTab('all');
    setSelectedCategory('All');
    setSelectedDistance('all');
    setSelectedAuthor('all');
    setAuthorSearchText('');
    setSelectedRating('all');
    setSelectedConditions([]);
    setSortBy('distance-asc');
  };

  // Core Filtering & Sorting Engine
  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter((book) => {
        // 1. Text Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = book.title.toLowerCase().includes(q);
          const matchAuthor = book.author.toLowerCase().includes(q);
          const matchOwner = book.ownerName.toLowerCase().includes(q);
          const matchCategory = book.category.toLowerCase().includes(q);
          const matchDesc = (book.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchOwner && !matchCategory && !matchDesc) {
            return false;
          }
        }

        // 2. Availability Tab Selection
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

        // 4. Distance Radius Filter
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

        // 5. Author Filter
        if (selectedAuthor !== 'all') {
          if (book.author.toLowerCase().trim() !== selectedAuthor.toLowerCase().trim()) {
            return false;
          }
        } else if (authorSearchText.trim()) {
          if (!book.author.toLowerCase().includes(authorSearchText.toLowerCase().trim())) {
            return false;
          }
        }

        // 6. Minimum Rating Filter
        if (selectedRating !== 'all') {
          const minRating = parseFloat(selectedRating);
          if (book.rating < minRating) return false;
        }

        // 7. Condition Filter
        if (selectedConditions.length > 0) {
          if (!book.condition || !selectedConditions.includes(book.condition)) {
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
    selectedDistance,
    selectedAuthor,
    authorSearchText,
    selectedRating,
    selectedConditions,
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
              placeholder="Search by book title, author, neighbor name, or synopsis..."
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
              { label: 'Like New Condition', action: () => setSelectedConditions(['Like New']) },
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
          SECTION 2: DUAL QUICK-BAR (AVAILABILITY TABS + GENRE PILLS)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3.5 mb-6">
        
        {/* A. Availability Segmented Intent Bar */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none border border-slate-200/60 shadow-2xs">
          {[
            {
              id: 'all' as AvailabilityTab,
              label: 'All Books',
              count: availabilityCounts.all
            },
            {
              id: 'lending' as AvailabilityTab,
              label: 'Available to Lend',
              icon: BookOpen01Icon,
              count: availabilityCounts.lending
            },
            {
              id: 'donation' as AvailabilityTab,
              label: 'Free Gifts to Keep',
              icon: GiftIcon,
              count: availabilityCounts.donation
            },
            {
              id: 'lent_out' as AvailabilityTab,
              label: 'Currently Lent Out',
              icon: CheckmarkBadge01Icon,
              count: availabilityCounts.lent_out
            }
          ].map((tab) => {
            const isSelected = activeAvailabilityTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveAvailabilityTab(tab.id)}
                className={`flex-1 min-w-[130px] sm:min-w-0 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                  isSelected
                    ? 'bg-white text-brand shadow-xs font-bold ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {IconComponent && (
                  <HugeiconsIcon
                    icon={IconComponent}
                    size={16}
                    className={isSelected ? 'text-brand' : 'text-slate-400'}
                  />
                )}
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-brand/10 text-brand' : 'bg-slate-200/70 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* B. Category & Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand text-white shadow-sm ring-1 ring-brand font-semibold'
                    : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-2xs'
                }`}
              >
                <span>{cat}</span>
                {isSelected && cat !== 'All' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: TOOLBAR (FEEDBACK, FILTERS DRAWER, SORT & VIEW)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 mb-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Results Contextual Feedback & Active Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span className="font-serif font-bold text-slate-900 text-sm">
              {filteredAndSortedBooks.length}
            </span>
            <span>books found</span>
            {selectedDistance !== 'all' && (
              <span className="text-slate-400">· within {selectedDistance}</span>
            )}
            {selectedCategory !== 'All' && (
              <span className="text-slate-400">· in {selectedCategory}</span>
            )}
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap ml-1">
              {selectedDistance !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand/10 text-brand text-[11px] font-semibold border border-brand/20">
                  <HugeiconsIcon icon={Location01Icon} size={11} />
                  Within {selectedDistance}
                  <button onClick={() => setSelectedDistance('all')}>
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}

              {selectedRating !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
                  <HugeiconsIcon icon={StarIcon} size={11} className="fill-amber-500 text-amber-500" />
                  {selectedRating}+ Stars
                  <button onClick={() => setSelectedRating('all')}>
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              )}

              {selectedConditions.map((cond) => (
                <span
                  key={cond}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                >
                  {cond}
                  <button onClick={() => toggleCondition(cond)}>
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </span>
              ))}

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

          {/* Deep Filters Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition active:scale-95 ${
              selectedConditions.length > 0 || selectedRating !== 'all' || selectedAuthor !== 'all'
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <HugeiconsIcon icon={FilterHorizontalIcon} size={14} className="text-brand" />
            <span>More Filters</span>
            {(selectedConditions.length > 0 || selectedRating !== 'all' || selectedAuthor !== 'all') && (
              <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                {(selectedConditions.length > 0 ? selectedConditions.length : 0) +
                  (selectedRating !== 'all' ? 1 : 0) +
                  (selectedAuthor !== 'all' ? 1 : 0)}
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
          SECTION 4: RESULTS DISPLAY (GRID OR COMPACT LIST VIEW)
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
                      <p className="text-xs text-slate-500 font-medium mt-0.5">by {book.author}</p>
                      
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
            SECTION 5: DELIGHTFUL ZERO-MATCH RECOVERY STATE
        ───────────────────────────────────────────────────────────── */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center mb-4">
            <HugeiconsIcon icon={BookOpen01Icon} size={30} />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900 mb-1.5">
            No matching books found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
            We couldn't find any books matching your specific filters. Try widening your search radius, selecting a different genre, or clearing your search term.
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
          SECTION 6: GRANULAR FILTER SLIDE-OVER DRAWER MODAL
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
                        Filter Books
                      </h3>
                      <p className="text-xs text-slate-500">Refine by rating, condition, or author</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </button>
                </div>

                {/* 1. Minimum Community Rating */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Minimum Rating
                  </label>
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

                {/* 2. Physical Book Condition */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Physical Condition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONDITIONS.map((cond) => {
                      const isChecked = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                            isChecked
                              ? 'border-brand bg-brand/5 text-brand ring-1 ring-brand font-semibold'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs">{cond}</span>
                          {isChecked && (
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-brand" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Filter by Author */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Filter by Author
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={authorSearchText}
                      onChange={(e) => {
                        setAuthorSearchText(e.target.value);
                        setSelectedAuthor('all');
                      }}
                      placeholder="Search author name..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                    />

                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-slate-100 p-2 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAuthor('all');
                          setAuthorSearchText('');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                          selectedAuthor === 'all' && !authorSearchText
                            ? 'bg-brand/10 text-brand font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        All Authors
                      </button>
                      {uniqueAuthors.map((author) => {
                        const isSelected = selectedAuthor.toLowerCase() === author.toLowerCase();
                        return (
                          <button
                            key={author}
                            type="button"
                            onClick={() => {
                              setSelectedAuthor(isSelected ? 'all' : author);
                              setAuthorSearchText('');
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition ${
                              isSelected
                                ? 'bg-brand/10 text-brand font-semibold'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {author}
                          </button>
                        );
                      })}
                    </div>
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
