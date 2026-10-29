import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  Search01Icon,
  FilterIcon,
  StarIcon,
  Cancel01Icon,
  BookOpen01Icon,
  Location01Icon,
  ArrowUpDownIcon,
  CheckmarkBadge01Icon,
  ArrowDown01Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import { BookCard } from '../BookCard';

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

export const BooksBrowsePage: React.FC<BooksBrowsePageProps> = ({
  books,
  onSelectBook,
  onQuickBorrow,
  onSelectOwner,
  onBack
}) => {
  // Always scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [authorSearchText, setAuthorSearchText] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<RatingOption>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('distance-asc');

  // Collapsible section state for compact sidebar
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    author: true,
    condition: true,
    rating: false,
    category: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract unique authors
  const uniqueAuthors = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.author) set.add(b.author.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [books]);

  const categories = ['Fiction', 'Non-fiction', 'Science', 'History', 'Poetry'];
  const conditions = ['Like New', 'Very Good', 'Good', 'Fair'];

  // Toggle multi-select availability checkboxes
  const toggleAvailability = (id: string) => {
    setSelectedAvailabilities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle multi-select condition checkboxes
  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((item) => item !== cond) : [...prev, cond]
    );
  };

  // Check if any filter is active
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedAvailabilities.length > 0) count += selectedAvailabilities.length;
    if (selectedDistance !== 'all') count++;
    if (selectedAuthor !== 'all' || authorSearchText.trim() !== '') count++;
    if (selectedRating !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedConditions.length > 0) count += selectedConditions.length;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [
    selectedAvailabilities,
    selectedDistance,
    selectedAuthor,
    authorSearchText,
    selectedRating,
    selectedCategory,
    selectedConditions,
    searchQuery
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAvailabilities([]);
    setSelectedDistance('all');
    setSelectedAuthor('all');
    setAuthorSearchText('');
    setSelectedRating('all');
    setSelectedCategory('all');
    setSelectedConditions([]);
    setSortBy('distance-asc');
  };

  // Filter & Sort Logic
  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter((book) => {
        // 1. Text Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = book.title.toLowerCase().includes(q);
          const matchAuthor = book.author.toLowerCase().includes(q);
          const matchOwner = book.ownerName.toLowerCase().includes(q);
          const matchDesc = (book.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchOwner && !matchDesc) return false;
        }

        // 2. Multi-select Availability Checkboxes
        if (selectedAvailabilities.length > 0) {
          const isLending = book.status === 'available' && book.availabilityMode !== 'donation';
          const isDonation = (book.availabilityMode === 'donation' || book.status === 'donation') && book.status !== 'claimed';
          const isLentOut = book.status === 'lent_out';

          const matchesAnySelected =
            (selectedAvailabilities.includes('available') && isLending) ||
            (selectedAvailabilities.includes('donation') && isDonation) ||
            (selectedAvailabilities.includes('lent_out') && isLentOut);

          if (!matchesAnySelected) return false;
        }

        // 3. Distance Filter
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

        // 4. Author Filter
        if (selectedAuthor !== 'all') {
          if (book.author.toLowerCase().trim() !== selectedAuthor.toLowerCase().trim()) {
            return false;
          }
        } else if (authorSearchText.trim()) {
          if (!book.author.toLowerCase().includes(authorSearchText.toLowerCase().trim())) {
            return false;
          }
        }

        // 5. Rating Filter
        if (selectedRating !== 'all') {
          const minRating = parseFloat(selectedRating);
          if (book.rating < minRating) return false;
        }

        // 6. Category Filter
        if (selectedCategory !== 'all') {
          if (book.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // 7. Multi-select Condition Filter
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
    selectedAvailabilities,
    selectedDistance,
    selectedAuthor,
    authorSearchText,
    selectedRating,
    selectedCategory,
    selectedConditions,
    sortBy
  ]);

  // Counts for availability checkboxes
  const availabilityCounts = useMemo(() => {
    let availableCount = 0;
    let donationCount = 0;
    let lentOutCount = 0;

    books.forEach((b) => {
      if (b.status === 'claimed') {
        // Already claimed community gift
      } else if (b.availabilityMode === 'donation' || b.status === 'donation') {
        donationCount++;
      } else if (b.status === 'available') {
        availableCount++;
      } else if (b.status === 'lent_out') {
        lentOutCount++;
      }
    });

    return { availableCount, donationCount, lentOutCount };
  }, [books]);

  // Sidebar Filter Form Render Helper
  const renderFilterControls = (isMobile = false) => (
    <div className="space-y-4 text-xs">
      {/* 1. Availability Status — Multi-Select Checkboxes */}
      <div className="border-b border-slate-100 pb-3.5">
        <div className="flex items-center justify-between mb-2">
          <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={13} className="text-amber-500" />
            <span>Availability</span>
          </label>
          {selectedAvailabilities.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedAvailabilities([])}
              className="text-[10px] text-brand hover:underline font-medium"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {[
            {
              id: 'available',
              label: 'Available to Lend 🤝',
              count: availabilityCounts.availableCount
            },
            {
              id: 'donation',
              label: 'Free Gift / Donation 🎁',
              count: availabilityCounts.donationCount
            },
            {
              id: 'lent_out',
              label: 'Currently Lent Out ⏳',
              count: availabilityCounts.lentOutCount
            }
          ].map((item) => {
            const isChecked = selectedAvailabilities.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer select-none transition ${
                  isChecked
                    ? 'bg-brand/5 text-brand font-semibold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAvailability(item.id)}
                    className="w-3.5 h-3.5 rounded text-brand focus:ring-brand/30 accent-brand border-slate-300"
                  />
                  <span className="text-xs">{item.label}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">({item.count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Distance / Range — Compact Pills */}
      <div className="border-b border-slate-100 pb-3.5">
        <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-2">
          <HugeiconsIcon icon={Location01Icon} size={13} className="text-brand" />
          <span>Distance Radius</span>
        </label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'all', label: 'Any' },
            { id: '1km', label: '< 1km' },
            { id: '2km', label: '< 2km' },
            { id: '5km', label: '< 5km' },
            { id: '10km', label: '< 10km' }
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedDistance(opt.id as DistanceOption)}
              className={`py-1 px-2 text-[11px] font-semibold rounded-lg border text-center transition ${
                selectedDistance === opt.id
                  ? 'bg-brand text-white border-brand shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Genre / Category — Collapsible */}
      <div className="border-b border-slate-100 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-left font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2"
        >
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={BookOpen01Icon} size={13} className="text-brand" />
            <span>Genre</span>
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${
              collapsedSections.category ? '-rotate-90' : 'rotate-0'
            }`}
          />
        </button>
        {!collapsedSections.category && (
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-1 text-[11px] rounded-lg border transition ${
                selectedCategory === 'all'
                  ? 'bg-brand text-white border-brand font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                className={`px-2 py-1 text-[11px] rounded-lg border transition ${
                  selectedCategory === cat
                    ? 'bg-brand text-white border-brand font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Author Filter — Collapsible */}
      <div className="border-b border-slate-100 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection('author')}
          className="w-full flex items-center justify-between text-left font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2"
        >
          <span>Author ({uniqueAuthors.length})</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${
              collapsedSections.author ? '-rotate-90' : 'rotate-0'
            }`}
          />
        </button>
        {!collapsedSections.author && (
          <div className="space-y-2">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={authorSearchText}
                onChange={(e) => {
                  setAuthorSearchText(e.target.value);
                  setSelectedAuthor('all');
                }}
                placeholder="Search author..."
                className="w-full pl-7 pr-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => {
                  setSelectedAuthor('all');
                  setAuthorSearchText('');
                }}
                className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                  selectedAuthor === 'all' && !authorSearchText
                    ? 'bg-brand/10 text-brand font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Authors
              </button>
              {uniqueAuthors.slice(0, 8).map((author) => {
                const isSelected = selectedAuthor.toLowerCase() === author.toLowerCase();
                return (
                  <button
                    key={author}
                    type="button"
                    onClick={() => {
                      setSelectedAuthor(isSelected ? 'all' : author);
                      setAuthorSearchText('');
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] truncate transition ${
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
        )}
      </div>

      {/* 5. Rating — Collapsible */}
      <div className="border-b border-slate-100 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between text-left font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2"
        >
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={StarIcon} size={13} className="text-amber-500 fill-amber-500" />
            <span>Rating</span>
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${
              collapsedSections.rating ? '-rotate-90' : 'rotate-0'
            }`}
          />
        </button>
        {!collapsedSections.rating && (
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: 'all', label: 'Any Rating' },
              { id: '4.8', label: '4.8+ ⭐' },
              { id: '4.5', label: '4.5+ ⭐' },
              { id: '4.0', label: '4.0+ ⭐' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedRating(opt.id as RatingOption)}
                className={`py-1 px-1.5 text-[11px] font-semibold rounded-lg border text-center transition ${
                  selectedRating === opt.id
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 6. Condition — Collapsible Multi-Select Checkboxes */}
      <div className="pb-1">
        <button
          type="button"
          onClick={() => toggleSection('condition')}
          className="w-full flex items-center justify-between text-left font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2"
        >
          <span>Condition</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${
              collapsedSections.condition ? '-rotate-90' : 'rotate-0'
            }`}
          />
        </button>
        {!collapsedSections.condition && (
          <div className="space-y-1">
            {conditions.map((cond) => {
              const isChecked = selectedConditions.includes(cond);
              return (
                <label
                  key={cond}
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer select-none transition ${
                    isChecked
                      ? 'bg-brand/5 text-brand font-semibold'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCondition(cond)}
                    className="w-3.5 h-3.5 rounded text-brand focus:ring-brand/30 accent-brand border-slate-300"
                  />
                  <span className="text-[11px]">{cond}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset Action */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={handleResetFilters}
          className="w-full py-2 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={13} />
          <span>Reset All Filters ({activeFiltersCount})</span>
        </button>
      )}

      {isMobile && (
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(false)}
          className="w-full py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs transition shadow-sm mt-2"
        >
          Show {filteredAndSortedBooks.length} Results
        </button>
      )}
    </div>
  );

  return (
    <div className="pt-4 sm:pt-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Compact Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* Title & Back Navigation */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-brand border border-slate-200/90 text-xs font-semibold shadow-xs transition"
            title="Back to home"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span className="hidden xs:inline">Back</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-tight">
                All Available Books
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-bold">
                {filteredAndSortedBooks.length}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
              Physical books listed by neighborhood readers within your circle.
            </p>
          </div>
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
              placeholder="Search books or authors..."
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

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs"
          >
            <HugeiconsIcon icon={FilterIcon} size={14} className="text-brand" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs"
            >
              <option value="distance-asc">Nearest</option>
              <option value="rating-desc">Top Rated</option>
              <option value="reviews-desc">Most Reviews</option>
              <option value="title-asc">A to Z</option>
            </select>
            <HugeiconsIcon
              icon={ArrowUpDownIcon}
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Active Filter Chips (Only rendered when filters are active) */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3 py-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active:
          </span>

          {selectedAvailabilities.map((av) => (
            <span
              key={av}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-medium"
            >
              {av === 'available'
                ? 'To Lend 🤝'
                : av === 'donation'
                ? 'Free Gift 🎁'
                : 'Lent Out ⏳'}
              <button onClick={() => toggleAvailability(av)}>
                <HugeiconsIcon icon={Cancel01Icon} size={10} />
              </button>
            </span>
          ))}

          {selectedDistance !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[11px] font-medium">
              Within {selectedDistance}
              <button onClick={() => setSelectedDistance('all')}>
                <HugeiconsIcon icon={Cancel01Icon} size={10} />
              </button>
            </span>
          )}

          {(selectedAuthor !== 'all' || authorSearchText) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
              Author: {selectedAuthor !== 'all' ? selectedAuthor : authorSearchText}
              <button
                onClick={() => {
                  setSelectedAuthor('all');
                  setAuthorSearchText('');
                }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={10} />
              </button>
            </span>
          )}

          {selectedRating !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-medium">
              {selectedRating}+ ⭐
              <button onClick={() => setSelectedRating('all')}>
                <HugeiconsIcon icon={Cancel01Icon} size={10} />
              </button>
            </span>
          )}

          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('all')}>
                <HugeiconsIcon icon={Cancel01Icon} size={10} />
              </button>
            </span>
          )}

          {selectedConditions.map((cond) => (
            <span
              key={cond}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium"
            >
              {cond}
              <button onClick={() => toggleCondition(cond)}>
                <HugeiconsIcon icon={Cancel01Icon} size={10} />
              </button>
            </span>
          ))}

          <button
            onClick={handleResetFilters}
            className="text-[11px] text-brand hover:underline font-semibold ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 3. Main Content: Compact Sticky Sidebar + Book Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Desktop Compact Sticky Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs sticky top-24 max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={FilterIcon} size={15} className="text-brand" />
              <h3 className="font-serif text-sm font-semibold text-slate-800">Filter Books</h3>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-slate-400 hover:text-brand transition"
              >
                Reset
              </button>
            )}
          </div>
          {renderFilterControls()}
        </aside>

        {/* Books Results Grid */}
        <section className="lg:col-span-3">
          {filteredAndSortedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center gap-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                <HugeiconsIcon icon={BookOpen01Icon} size={22} />
              </div>
              <div className="max-w-xs">
                <h3 className="font-serif text-base font-semibold text-slate-800 mb-0.5">
                  No matching books found
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Try adjusting your distance radius, unchecking some availability options, or clearing the author search.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-1.5 rounded-full bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Slide-Out Filter Drawer Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={FilterIcon} size={16} className="text-brand" />
                    <h3 className="font-serif text-base font-semibold text-slate-800">
                      Filter Books
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  </button>
                </div>

                {renderFilterControls(true)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BooksBrowsePage;
