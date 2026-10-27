import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  BookOpen01Icon,
  BookOpen02Icon,
  GiftIcon,
  CheckmarkCircle02Icon,
  Search01Icon,
  ArrowDown01Icon,
  Tick01Icon,
  Image01Icon,
  SparklesIcon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons';
import { mockCatalogBooks } from '../../data/mockData';
import type { CatalogBook } from '../../types';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded?: (bookData: {
    title: string;
    author: string;
    catalogId: string;
    condition: string;
    availability: 'lending' | 'donation';
    coverImage: string;
    bookType: 'Original Copy' | 'Translated Copy';
  }) => void;
}

const CONDITION_OPTIONS = [
  { id: 'Like New', label: 'Like New', desc: 'Read once, clean' },
  { id: 'Very Good', label: 'Very Good', desc: 'Minor wear' },
  { id: 'Good', label: 'Good', desc: 'Loved & readable' },
  { id: 'Fair', label: 'Fair', desc: 'Older copy' }
] as const;

const AVAILABILITY_OPTIONS = [
  {
    id: 'lending' as const,
    label: 'For Lending',
    desc: 'Keep ownership, lend out',
    icon: BookOpen01Icon
  },
  {
    id: 'donation' as const,
    label: 'For Donation',
    desc: 'Free to loving readers',
    icon: GiftIcon
  }
] as const;

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onBookAdded }) => {
  // Mode: 'search' (catalog search & select) vs 'manual' (enter details from scratch)
  const [mode, setMode] = useState<'search' | 'manual'>('search');

  // Search & catalog state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCatalogBook, setSelectedCatalogBook] = useState<CatalogBook | null>(null);

  // Form fields
  const [manualTitle, setManualTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [bookType, setBookType] = useState<'Original Copy' | 'Translated Copy'>('Original Copy');
  const [coverUrl, setCoverUrl] = useState('');
  const [condition, setCondition] = useState<string>('Like New');
  const [availability, setAvailability] = useState<'lending' | 'donation'>('lending');

  // Dropdown menus open/close states
  const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);
  const [isAvailabilityDropdownOpen, setIsAvailabilityDropdownOpen] = useState(false);

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastAddedTitle, setLastAddedTitle] = useState('');

  // Refs for outside click handling
  const conditionDropdownRef = useRef<HTMLDivElement>(null);
  const availabilityDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (conditionDropdownRef.current && !conditionDropdownRef.current.contains(target)) {
        setIsConditionDropdownOpen(false);
      }
      if (availabilityDropdownRef.current && !availabilityDropdownRef.current.contains(target)) {
        setIsAvailabilityDropdownOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter catalog books based on search input
  const filteredCatalogBooks = searchQuery.trim()
    ? mockCatalogBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockCatalogBooks;

  const handleSelectCatalogBook = (book: CatalogBook) => {
    setSelectedCatalogBook(book);
    setSearchQuery(book.title);
    setAuthor(book.author);
    setCoverUrl(book.coverImage);
    setIsSearchFocused(false);
  };

  const handleClearSelectedBook = () => {
    setSelectedCatalogBook(null);
    setSearchQuery('');
    setAuthor('');
    setCoverUrl('');
  };

  const currentConditionObj = CONDITION_OPTIONS.find((c) => c.id === condition) || CONDITION_OPTIONS[0];
  const currentAvailabilityObj = AVAILABILITY_OPTIONS.find((a) => a.id === availability) || AVAILABILITY_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalTitle = mode === 'search' ? (selectedCatalogBook?.title || searchQuery) : manualTitle;
    const finalAuthor = mode === 'search' ? (selectedCatalogBook?.author || author) : author;
    
    if (!finalTitle.trim()) return;

    // Generate canonical Unique ID if manual, or use existing catalog book ID
    const generatedId = finalTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const finalCatalogId = selectedCatalogBook?.id || generatedId;
    const finalCover = coverUrl || selectedCatalogBook?.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800';

    setLastAddedTitle(finalTitle);
    setIsSuccess(true);

    setTimeout(() => {
      onBookAdded?.({
        title: finalTitle,
        author: finalAuthor,
        catalogId: finalCatalogId,
        condition,
        availability,
        coverImage: finalCover,
        bookType
      });
      setIsSuccess(false);
      // Reset
      handleClearSelectedBook();
      setManualTitle('');
      onClose();
    }, 2200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FDF8F2] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          aria-label="Close modal"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Modal Header */}
        <div>
          <h3 className="font-serif text-2xl font-semibold text-slate-800">
            {mode === 'search' ? 'Add a book to your library' : 'List book to your library'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Pick an existing title so ratings & reviews stay together — or add as new one.
          </p>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="py-10 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4 ring-8 ring-emerald-50">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
            </div>
            <h4 className="font-serif text-2xl font-semibold text-slate-800">
              Book Added to Shelf!
            </h4>
            <p className="text-sm font-medium text-brand mt-1">
              “{lastAddedTitle}”
            </p>
            <div className="mt-4 mx-auto max-w-sm p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-xs text-left">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-1">
                <HugeiconsIcon icon={SparklesIcon} size={14} />
                <span>Community Catalog Synced</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Your copy is linked to the community catalog. Reader reviews, ratings, and edition details are automatically aggregated in the background.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            {/* MODE: SEARCH EXISTING BOOK */}
            {mode === 'search' && (
              <>
                {/* Search input with autocomplete */}
                <div ref={searchDropdownRef} className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    What Book are you adding?
                  </label>

                  {selectedCatalogBook ? (
                    /* Selected Book Card */
                    <div className="p-3.5 bg-white rounded-2xl border border-brand/30 shadow-xs flex items-center gap-3">
                      <img
                        src={selectedCatalogBook.coverImage}
                        alt={selectedCatalogBook.title}
                        className="w-12 h-16 object-cover rounded-lg shadow-xs flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-sm font-semibold text-slate-900 truncate">
                            {selectedCatalogBook.title}
                          </h4>
                          <span className="text-[10px] bg-brand/10 text-brand font-mono font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                            #{selectedCatalogBook.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">by {selectedCatalogBook.author}</p>
                        
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-600">
                          <span className="text-amber-600 font-medium">★ {selectedCatalogBook.rating}</span>
                          <span className="text-slate-400">({selectedCatalogBook.reviewsCount} reviews)</span>
                          {selectedCatalogBook.existingOwners?.[0] && (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                              Copy owned by {selectedCatalogBook.existingOwners[0].name}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleClearSelectedBook}
                        className="text-xs text-brand hover:text-brand-dark hover:underline font-medium px-2 py-1 rounded"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    /* Search Input Field */
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <HugeiconsIcon icon={Search01Icon} size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearchFocused(true);
                        }}
                        onFocus={() => setIsSearchFocused(true)}
                        placeholder="Search title e.g. The God of Small Things, Pachinko..."
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                      />

                      {/* Autocomplete Dropdown List */}
                      {isSearchFocused && (
                        <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                          <div className="p-2.5 bg-slate-50 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                            <span>EXISTING BOOKS ON BOOKCIRCLE</span>
                            <span>{filteredCatalogBooks.length} available</span>
                          </div>

                          {filteredCatalogBooks.length > 0 ? (
                            filteredCatalogBooks.map((book) => (
                              <button
                                key={book.id}
                                type="button"
                                onClick={() => handleSelectCatalogBook(book)}
                                className="w-full p-3 text-left hover:bg-brand/5 flex items-center gap-3 transition"
                              >
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="w-9 h-12 object-cover rounded shadow-xs flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="font-serif text-sm font-semibold text-slate-800 truncate">
                                      {book.title}
                                    </p>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded">
                                      #{book.id}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">by {book.author}</p>
                                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                                    <span className="text-amber-600 font-medium">★ {book.rating}</span>
                                    <span className="text-slate-400">({book.reviewsCount} reviews)</span>
                                    {book.existingOwners?.[0] && (
                                      <span className="text-slate-500 text-[10px]">
                                        · Listed by {book.existingOwners[0].name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-xs text-slate-500">
                                No existing title matches “{searchQuery}”
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setMode('manual');
                                  setManualTitle(searchQuery);
                                  setIsSearchFocused(false);
                                }}
                                className="mt-2 text-xs text-brand font-semibold hover:underline inline-flex items-center gap-1"
                              >
                                <span>Add “{searchQuery}” manually</span>
                                <span>→</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Informational callout if linked to Arif or existing owner */}
                  {selectedCatalogBook && (
                    <div className="mt-2 p-2.5 bg-brand/5 rounded-xl border border-brand/20 flex items-start gap-2 text-xs text-brand-dark">
                      <HugeiconsIcon icon={InformationCircleIcon} size={16} className="mt-0.5 flex-shrink-0 text-brand" />
                      <p className="text-[11px] leading-relaxed">
                        <strong className="font-semibold">Shared Community Title</strong>. Reader reviews and ratings for this title are shared across all copies, including {selectedCatalogBook.existingOwners?.[0]?.name ? `${selectedCatalogBook.existingOwners[0].name}'s copy` : 'other community copies'}.
                      </p>
                    </div>
                  )}
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    readOnly={Boolean(selectedCatalogBook)}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Select Author name"
                    className={`w-full px-4 py-3 rounded-xl border text-sm shadow-xs transition ${
                      selectedCatalogBook
                        ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-800 border-slate-300 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand'
                    }`}
                  />
                  {selectedCatalogBook && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Locked to match verified catalog entry for {selectedCatalogBook.title}.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* MODE: MANUAL ENTRY */}
            {mode === 'manual' && (
              <>
                {/* Book Type Selection (Original Copy vs Translated Copy) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select your book type
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {(['Original Copy', 'Translated Copy'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBookType(type)}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left shadow-xs ${
                          bookType === type
                            ? 'border-brand bg-brand/5 text-brand ring-1 ring-brand'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            bookType === type
                              ? 'border-brand bg-brand text-white'
                              : 'border-slate-400 bg-white'
                          }`}
                        >
                          {bookType === type && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-medium">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Title Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    What Book are you adding?
                  </label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Book Title (e.g. The God of Small Things)"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                  />
                </div>

                {/* Manual Author Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Select Author name"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                  />
                </div>

                {/* Upload Cover Image */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Upload Cover Image
                  </label>
                  <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 hover:border-brand text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-brand/5 text-brand flex items-center justify-center">
                      <HugeiconsIcon icon={Image01Icon} size={20} />
                    </div>
                    <p className="text-xs font-medium text-slate-700">Upload an image of your book cover</p>
                    <p className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 5MB</p>
                  </div>
                </div>
              </>
            )}

            {/* DROPDOWN 1: BOOK CONDITION */}
            <div ref={conditionDropdownRef} className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Book Condition
              </label>

              {/* Dropdown Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setIsConditionDropdownOpen(!isConditionDropdownOpen);
                  setIsAvailabilityDropdownOpen(false);
                }}
                className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 text-sm text-slate-800 flex items-center justify-between hover:border-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs text-left transition"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{currentConditionObj.label}</span>
                  <span className="text-slate-400 text-xs">— {currentConditionObj.desc}</span>
                </div>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={18}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isConditionDropdownOpen ? 'rotate-180 text-brand' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Options */}
              {isConditionDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
                  {CONDITION_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCondition(c.id);
                        setIsConditionDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-brand/5 transition text-xs sm:text-sm ${
                        condition === c.id ? 'bg-brand/5 text-brand font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{c.label}</span>
                        <span className="text-slate-400 text-xs font-normal">— {c.desc}</span>
                      </div>
                      {condition === c.id && (
                        <HugeiconsIcon icon={Tick01Icon} size={16} className="text-brand flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DROPDOWN 2: AVAILABILITY */}
            <div ref={availabilityDropdownRef} className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Availability
              </label>

              {/* Dropdown Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setIsAvailabilityDropdownOpen(!isAvailabilityDropdownOpen);
                  setIsConditionDropdownOpen(false);
                }}
                className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 text-sm text-slate-800 flex items-center justify-between hover:border-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs text-left transition"
              >
                <div className="flex items-center gap-2.5">
                  <HugeiconsIcon icon={currentAvailabilityObj.icon} size={18} className="text-brand flex-shrink-0" />
                  <span className="font-medium text-slate-800">{currentAvailabilityObj.label}</span>
                  <span className="text-slate-400 text-xs">— {currentAvailabilityObj.desc}</span>
                </div>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={18}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isAvailabilityDropdownOpen ? 'rotate-180 text-brand' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Options */}
              {isAvailabilityDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
                  {AVAILABILITY_OPTIONS.map((a) => {
                    const IconComp = a.icon;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setAvailability(a.id);
                          setIsAvailabilityDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-brand/5 transition text-xs sm:text-sm ${
                          availability === a.id ? 'bg-brand/5 text-brand font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <HugeiconsIcon icon={IconComp} size={18} className={availability === a.id ? 'text-brand' : 'text-slate-400'} />
                          <div>
                            <p className="font-medium">{a.label}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{a.desc}</p>
                          </div>
                        </div>
                        {availability === a.id && (
                          <HugeiconsIcon icon={Tick01Icon} size={16} className="text-brand flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <HugeiconsIcon icon={BookOpen02Icon} size={18} />
                <span>List book</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-xl border border-brand text-brand hover:bg-brand/5 active:scale-[0.99] font-medium text-sm transition"
              >
                Save Privately
              </button>
            </div>

            {/* Toggle Mode Link */}
            <div className="pt-2 text-center">
              {mode === 'search' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('manual');
                    setManualTitle(searchQuery);
                    setSelectedCatalogBook(null);
                  }}
                  className="text-xs sm:text-sm text-brand font-medium hover:underline transition"
                >
                  Not found in list? Let’s add manually
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('search')}
                  className="text-xs sm:text-sm text-brand font-medium hover:underline transition"
                >
                  ← Already on BookCircle? Search existing titles
                </button>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
