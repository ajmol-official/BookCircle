import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  BookOpen01Icon,
  BookOpen02Icon,
  GiftIcon,
  Bookmark02Icon,
  CheckmarkCircle02Icon,
  Search01Icon,
  ArrowDown01Icon,
  Tick01Icon,
  Image01Icon,
  SparklesIcon,
  Delete02Icon,
  Upload01Icon
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
    availability: 'lending' | 'donation' | 'personal';
    coverImage: string;
    bookType: 'Original Copy' | 'Translated Copy';
    category?: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
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
  },
  {
    id: 'personal' as const,
    label: 'Private Collection',
    desc: 'Personal library (hidden from search)',
    icon: Bookmark02Icon
  }
] as const;

const CATEGORY_OPTIONS: Array<'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry'> = [
  'Fiction',
  'Non-fiction',
  'Science',
  'History',
  'Poetry',
];

const PRESET_COVERS = [
  {
    id: 'preset-fiction',
    label: 'Fiction',
    url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'preset-science',
    label: 'Science',
    url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'preset-history',
    label: 'History',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'preset-memoir',
    label: 'Memoir',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
  }
];

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
  const [category, setCategory] = useState<'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry'>('Fiction');
  const [bookType, setBookType] = useState<'Original Copy' | 'Translated Copy'>('Original Copy');
  const [coverUrl, setCoverUrl] = useState('');
  const [isCustomUploaded, setIsCustomUploaded] = useState(false);
  const [condition, setCondition] = useState<string>('Like New');
  const [availability, setAvailability] = useState<'lending' | 'donation' | 'personal'>('lending');

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  // Dropdown menus open/close states
  const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);
  const [isAvailabilityDropdownOpen, setIsAvailabilityDropdownOpen] = useState(false);

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastAddedTitle, setLastAddedTitle] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);

  // Refs for outside click handling and file picker
  const conditionDropdownRef = useRef<HTMLDivElement>(null);
  const availabilityDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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
    setIsCustomUploaded(false);
    if (book.category && CATEGORY_OPTIONS.includes(book.category)) {
      setCategory(book.category);
    }
    setIsSearchFocused(false);
  };

  const handleClearSelectedBook = () => {
    setSelectedCatalogBook(null);
    setSearchQuery('');
    setAuthor('');
    setCoverUrl('');
    setIsCustomUploaded(false);
  };

  // Image Upload Handling (File Picker & Drag-and-Drop)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCoverUrl(result);
      setIsCustomUploaded(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const currentConditionObj = CONDITION_OPTIONS.find((c) => c.id === condition) || CONDITION_OPTIONS[0];
  const currentAvailabilityObj = AVAILABILITY_OPTIONS.find((a) => a.id === availability) || AVAILABILITY_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalTitle = mode === 'search' ? (selectedCatalogBook?.title || searchQuery) : manualTitle;
    const finalAuthor = mode === 'search' ? (selectedCatalogBook?.author || author) : author;
    
    if (!finalTitle.trim()) {
      setTitleError(
        mode === 'search'
          ? 'Please search and select an existing title or switch to manual entry.'
          : 'Please enter a book title to add it to your shelf.'
      );
      return;
    }
    setTitleError(null);

    // Generate canonical Unique ID if manual, or use existing catalog book ID
    const generatedId = finalTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const finalCatalogId = selectedCatalogBook?.id || generatedId;
    const finalCover = coverUrl || selectedCatalogBook?.coverImage || PRESET_COVERS[0].url;

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
        bookType,
        category,
      });
      setIsSuccess(false);
      // Reset
      handleClearSelectedBook();
      setManualTitle('');
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-book-title"
        className="relative w-full max-w-lg bg-cream rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleFileInputChange}
        />

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
          <h3 id="add-book-title" className="font-serif text-2xl font-semibold text-slate-800">
            {mode === 'search' ? 'Add a book to your library' : 'List book to your library'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 truncate">
            {mode === 'manual'
              ? 'Add your own copy with its details and cover photo.'
              : 'Pick an existing title or add your copy with photo.'}
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
                <span>Saved & Synced With Database</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Your book has been saved to your shelf and community catalog with live image cover and condition.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">

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
                        src={coverUrl || selectedCatalogBook.coverImage}
                        alt={selectedCatalogBook.title}
                        className="w-12 h-16 object-cover rounded-lg shadow-xs flex-shrink-0 border border-slate-200"
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
                          {isCustomUploaded && (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                              Custom cover photo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          onClick={handleClearSelectedBook}
                          className="text-xs text-brand hover:text-brand-dark hover:underline font-medium px-2 py-1 rounded"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] text-slate-500 hover:text-brand hover:underline px-2 py-0.5 rounded flex items-center gap-1"
                        >
                          <HugeiconsIcon icon={Upload01Icon} size={12} />
                          <span>Photo</span>
                        </button>
                      </div>
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
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
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
                                <span>Add “{searchQuery}” manually with photo</span>
                                <span>→</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
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
                    placeholder="Enter Author name"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm shadow-xs transition ${
                      selectedCatalogBook
                        ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-800 border-slate-300 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand'
                    }`}
                  />
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
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {(['Original Copy', 'Translated Copy'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBookType(type)}
                        className={`py-2 px-3 rounded-xl border flex items-center gap-2.5 transition text-left shadow-xs ${
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
                    onChange={(e) => {
                      setManualTitle(e.target.value);
                      if (titleError) setTitleError(null);
                    }}
                    placeholder="Book Title (e.g. The God of Small Things)"
                    className={`w-full px-4 py-2.5 bg-white rounded-xl border ${
                      titleError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                    } text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs`}
                  />
                  {titleError && (
                    <p className="text-xs text-red-600 mt-1.5 font-medium">{titleError}</p>
                  )}
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
                    placeholder="Enter Author name"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                  />
                </div>

                {/* REAL UPLOAD COVER IMAGE */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                    <span>Upload Cover Image</span>
                    {coverUrl && (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                        Cover photo ready
                      </span>
                    )}
                  </label>

                  {coverUrl ? (
                    /* Active Image Preview Card */
                    <div className="p-3 bg-white rounded-2xl border border-brand/40 shadow-xs flex items-center gap-3.5">
                      <img
                        src={coverUrl}
                        alt="Book cover preview"
                        className="w-12 h-16 object-cover rounded-xl shadow-sm border border-slate-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {isCustomUploaded ? 'Custom Photo Uploaded' : 'Sample Cover Selected'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isCustomUploaded ? 'From your device' : 'Ready to be saved with listing'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-medium text-brand hover:text-brand-dark bg-brand/10 hover:bg-brand/20 px-2 py-0.5 rounded-lg transition flex items-center gap-1"
                          >
                            <HugeiconsIcon icon={Upload01Icon} size={12} />
                            <span>Replace</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCoverUrl('');
                              setIsCustomUploaded(false);
                            }}
                            className="text-xs font-medium text-rose-500 hover:text-rose-700 px-2 py-0.5 flex items-center gap-1 transition"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Clean Compact Dropzone Button */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`p-3.5 bg-white rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3.5 ${
                        isDragging
                          ? 'border-brand bg-brand/5 scale-[1.01]'
                          : 'border-slate-300 hover:border-brand hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="w-12 h-16 rounded-xl bg-brand/5 border border-dashed border-brand/30 text-brand flex flex-col items-center justify-center flex-shrink-0">
                        <HugeiconsIcon icon={Image01Icon} size={20} />
                        <span className="text-[9px] font-semibold mt-0.5 text-brand uppercase tracking-wider">Cover</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">
                          Upload or choose a cover image
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                          Click to browse from your device or drag & drop photo (PNG, JPG, WEBP up to 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* GENRE / CATEGORY SELECTOR */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Genre / Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition font-medium ${
                      category === cat
                        ? 'border-brand bg-brand text-white shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

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
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 text-sm text-slate-800 flex items-center justify-between hover:border-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs text-left transition"
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
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 text-sm text-slate-800 flex items-center justify-between hover:border-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs text-left transition"
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

            {/* Error Message if Any */}
            {titleError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {titleError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <HugeiconsIcon icon={BookOpen02Icon} size={18} />
                <span>List book</span>
              </button>

              {/* Mode Toggle Link */}
              <div className="mt-3.5 text-center">
                {mode === 'search' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('manual');
                      setManualTitle(searchQuery);
                      setSelectedCatalogBook(null);
                    }}
                    className="text-xs text-brand font-medium hover:underline transition"
                  >
                    Not found in list? Add manually with cover photo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('search')}
                    className="text-xs text-brand font-medium hover:underline transition"
                  >
                    ← Already on BookCircle? Search existing titles
                  </button>
                )}
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
