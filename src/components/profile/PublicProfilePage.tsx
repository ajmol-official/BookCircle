import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  ShieldCheckIcon,
  BookOpen01Icon,
  StarIcon,
  Message01Icon,
  Share01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  GiftIcon,
  Bookmark02Icon,
  Search01Icon,
  LockIcon
} from '@hugeicons/core-free-icons';
import type { Book, Reader } from '../../types';
import { ReturnReliabilityModal } from './ReturnReliabilityModal';
import { useAuth } from '../../context/AuthContext';

interface PublicProfilePageProps {
  reader: Reader;
  allBooks: Book[];
  onBack?: () => void;
  onSelectBook: (book: Book) => void;
  onRequestBorrow: (book: Book, ownerName?: string) => void;
  onSendMessage?: (ownerName: string) => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  reader,
  allBooks,
  onSelectBook,
  onRequestBorrow,
  onSendMessage
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'shelf' | 'reviews' | 'about'>('shelf');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'lending' | 'donation' | 'personal' | 'lent_out'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReliabilityModalOpen, setIsReliabilityModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [notifiedBooks, setNotifiedBooks] = useState<Record<string, boolean>>({});

  const { currentUser } = useAuth();
  const isOwnProfile = Boolean(
    currentUser &&
      ((reader.id && currentUser.id === reader.id) ||
        (currentUser.displayName &&
          reader.name &&
          currentUser.displayName.toLowerCase().trim() === reader.name.toLowerCase().trim()))
  );

  // Filter books owned by this reader
  const readerBooks = useMemo(() => {
    const readerNameNormalized = reader.name.toLowerCase().trim();
    const books = allBooks.filter((book) => {
      const ownerNormalized = book.ownerName.toLowerCase().trim();
      const isOwner =
        ownerNormalized === readerNameNormalized ||
        ownerNormalized.includes(readerNameNormalized) ||
        readerNameNormalized.includes(ownerNormalized);
      if (!isOwner) return false;

      // Privacy Isolation: Non-owners NEVER see private collection books on another user's public profile
      if (!isOwnProfile) {
        if (
          book.availabilityMode === 'personal' ||
          book.status === 'claimed' ||
          (book.description && book.description.includes('[PRIVATE_COLLECTION]'))
        ) {
          return false;
        }
      }
      return true;
    });

    // If no direct matches in global catalog, provide default books for this reader
    if (books.length === 0) {
      return allBooks.slice(0, 4).map((b, idx) => ({
        ...b,
        id: `profile-${reader.id}-${idx}`,
        ownerName: reader.name,
        ownerAvatar: reader.avatar,
        distance: reader.distance,
        availabilityMode: (idx % 2 === 0 ? 'lending' : 'donation') as 'lending' | 'donation' | 'personal',
        status: (idx === 3 ? 'lent_out' : idx % 2 === 0 ? 'available' : 'donation') as 'available' | 'lent_out' | 'donation'
      }));
    }
    return books;
  }, [allBooks, reader, isOwnProfile]);

  // Derived counts
  const lendingCount = readerBooks.filter((b) => b.availabilityMode === 'lending' && b.status === 'available').length;
  const donationCount = readerBooks.filter((b) => b.availabilityMode === 'donation' || b.status === 'donation').length;
  const personalCount = readerBooks.filter((b) => b.availabilityMode === 'personal').length;
  const lentOutCount = readerBooks.filter((b) => b.status === 'lent_out').length;
  const totalBooksCount = readerBooks.length;

  // Filtered books on shelf
  const filteredBooks = useMemo(() => {
    return readerBooks.filter((book) => {
      // 1. Availability Mode Filter
      if (availabilityFilter === 'lending') {
        if (book.availabilityMode !== 'lending' || book.status === 'lent_out') return false;
      } else if (availabilityFilter === 'donation') {
        if (book.availabilityMode !== 'donation' && book.status !== 'donation') return false;
      } else if (availabilityFilter === 'personal') {
        if (book.availabilityMode !== 'personal') return false;
      } else if (availabilityFilter === 'lent_out') {
        if (book.status !== 'lent_out') return false;
      }

      // 2. Genre Filter
      if (selectedGenre !== 'All' && book.category.toLowerCase() !== selectedGenre.toLowerCase()) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesDesc = book.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesDesc) return false;
      }

      return true;
    });
  }, [readerBooks, availabilityFilter, selectedGenre, searchQuery]);

  const handleShareProfile = () => {
    try {
      const url = `${window.location.origin}/reader/${encodeURIComponent(reader.name.toLowerCase().replace(/\s+/g, '-'))}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNotifyReturn = (bookId: string) => {
    setNotifiedBooks((prev) => ({ ...prev, [bookId]: true }));
  };

  // Mock community reviews given to this user by fellow neighbors
  const neighborReviews = [
    {
      id: 'rev-n1',
      neighborName: 'Maya Lin',
      neighborAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      bookTitle: 'Pachinko',
      date: '1 week ago',
      rating: 5,
      type: 'Borrower',
      comment:
        `${reader.name} is one of the most generous and reliable readers in our neighborhood! Met at Camden Coffee right on time. The book was in immaculate condition with a handwritten reading card.`
    },
    {
      id: 'rev-n2',
      neighborName: 'Diego Ramirez',
      neighborAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      bookTitle: 'The Godfather',
      date: '3 weeks ago',
      rating: 5,
      type: 'Borrower',
      comment:
        `Smooth and prompt handover. Highly recommend borrowing from or donating books to ${reader.name}. 10/10 community neighbor!`
    },
    {
      id: 'rev-n3',
      neighborName: 'Priya Shah',
      neighborAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      bookTitle: 'The Alchemist',
      date: '1 month ago',
      rating: 5,
      type: 'Recipient (Donation)',
      comment:
        `Received a wonderful donation copy from ${reader.name}’s shelf to keep forever. What an amazing way to spread love for literature across our community.`
    }
  ];

  return (
    <div className="pt-6 pb-24 animate-in fade-in duration-200 space-y-8">
      {/* 1. Top Action Navigation */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleShareProfile}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-brand hover:border-brand/40 text-xs font-semibold shadow-xs transition"
        >
          {copiedLink ? (
            <>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-600" />
              <span className="text-emerald-600">Profile Link Copied!</span>
            </>
          ) : (
            <>
              <HugeiconsIcon icon={Share01Icon} size={15} />
              <span>Share Profile</span>
            </>
          )}
        </button>

        {onSendMessage && (
          <button
            onClick={() => onSendMessage(reader.name)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <HugeiconsIcon icon={Message01Icon} size={15} />
            <span>Message {reader.name.split(' ')[0]}</span>
          </button>
        )}
      </div>

      {/* 2. Public User Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative flex-shrink-0">
            <img
              src={reader.avatar}
              alt={reader.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-slate-100 shadow-md"
            />
            {/* Active / Online Dot */}
            <span
              className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
              title="Active in neighborhood"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
                {reader.name}
              </h1>
              {reader.verified !== false && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                  <HugeiconsIcon icon={ShieldCheckIcon} size={13} />
                  <span>Verified Neighbor</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <HugeiconsIcon icon={Location01Icon} size={16} className="text-brand flex-shrink-0" />
                <span>{reader.location || `${reader.distance} away`}</span>
              </div>
              <span className="text-slate-300">·</span>
              <span>Member since {reader.memberSince}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed pt-1 font-sans">
              {reader.bio ||
                'Passionate book lover and community member. Happy to share my shelf with neighborhood readers and donate extra paperbacks to good homes.'}
            </p>
          </div>
        </div>

        {/* Quick action button for mobile / tablet */}
        <div className="w-full md:w-auto flex md:flex-col gap-2.5 justify-end">
          <div className="bg-cream-200 px-4 py-3 rounded-2xl border border-slate-200/80 text-center md:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Trust Rating</p>
            <div className="flex items-center justify-center md:justify-end gap-1.5 mt-0.5">
              <HugeiconsIcon icon={StarIcon} size={16} className="text-amber-500 fill-amber-400" />
              <span className="font-serif text-lg font-bold text-slate-800">{reader.rating || 4.9}</span>
              <span className="text-xs text-slate-500">/ 5.0</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">100% on-time returns</p>
          </div>
        </div>
      </div>

      {/* 3. Trust & Return Reliability Banner */}
      <div className="bg-cream-200 rounded-2xl p-6 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-6 pr-6 md:border-r border-slate-300">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Return Reliability</p>
            <p className="font-serif text-xl sm:text-2xl font-bold text-brand mt-0.5">
              {reader.trustTier || 'Tier 5 · Verified Master'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {reader.trustScore || `${reader.totalBorrows || 42}/${reader.totalBorrows || 42} returned on time`}
            </p>
            <button
              type="button"
              onClick={() => setIsReliabilityModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand hover:text-brand-dark bg-brand/10 hover:bg-brand/20 px-2.5 py-1 rounded-lg transition"
            >
              <HugeiconsIcon icon={ShieldCheckIcon} size={13} />
              <span>5-Tier Guide</span>
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex-shrink-0 shadow-xs" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">Always returned on time</p>
              <p className="text-xs text-slate-500">100% punctuality rate</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-brand flex-shrink-0 shadow-xs" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">Active Community Lender</p>
              <p className="text-xs text-slate-500">{reader.totalBorrows || 28}+ handovers completed</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 flex-shrink-0 shadow-xs" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">Free Book Donator</p>
              <p className="text-xs text-slate-500">{donationCount} books permanently gifted</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Numerical Activity Metrics: Specifically Highlights Lending vs Donation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-6 border-y border-slate-200/80">
        <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/60 shadow-xs">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-800">
            {totalBooksCount}
          </span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Total Shelf Books
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Physical collection</span>
        </div>

        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200/60 shadow-xs">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-brand">
            {lendingCount}
          </span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand mt-1">
            Available to Lend 🤝
          </span>
          <span className="text-[11px] text-purple-700/70 mt-0.5 block">Borrow for 14-28 days</span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 shadow-xs">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-emerald-700">
            {donationCount}
          </span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-emerald-800 mt-1">
            Free to Donate 🎁
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Free gifts to keep forever!</span>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 shadow-xs">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-700">
            {reader.totalBorrows || 42}
          </span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-amber-800 mt-1">
            Successful Lends
          </span>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Safe neighborhood handovers</span>
        </div>
      </div>

      {/* 5. Sub-Tab Switcher */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {[
          { id: 'shelf', label: `Books on Shelf (${totalBooksCount})` },
          { id: 'reviews', label: `Neighbor Reviews (${neighborReviews.length})` },
          { id: 'about', label: 'About & Meetup Spots' }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`relative pb-3 text-base sm:text-lg font-serif transition-colors ${
                isActive ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand rounded-full transition-all" />
              )}
            </button>
          );
        })}
      </div>

      {/* 6. TAB CONTENT 1: SHELF (WITH LENDING VS DONATION SPLIT) */}
      {activeSubTab === 'shelf' && (
        <div className="space-y-6">
          {/* Availability Mode Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 mr-1">Show:</span>
              <button
                onClick={() => setAvailabilityFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  availabilityFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Books ({totalBooksCount})
              </button>

              <button
                onClick={() => setAvailabilityFilter('lending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  availabilityFilter === 'lending'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-purple-50 border border-purple-200 text-brand hover:bg-purple-100'
                }`}
              >
                <HugeiconsIcon icon={BookOpen01Icon} size={14} />
                <span>Available to Lend ({lendingCount})</span>
              </button>

              <button
                onClick={() => setAvailabilityFilter('donation')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  availabilityFilter === 'donation'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <HugeiconsIcon icon={GiftIcon} size={14} />
                <span>Free to Donate ({donationCount})</span>
              </button>

              {personalCount > 0 && (
                <button
                  onClick={() => setAvailabilityFilter('personal')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    availabilityFilter === 'personal'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <HugeiconsIcon icon={Bookmark02Icon} size={14} />
                  <span>Private Collection ({personalCount})</span>
                </button>
              )}

              {lentOutCount > 0 && (
                <button
                  onClick={() => setAvailabilityFilter('lent_out')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    availabilityFilter === 'lent_out'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <HugeiconsIcon icon={Clock01Icon} size={14} />
                  <span>Currently Lent Out ({lentOutCount})</span>
                </button>
              )}
            </div>

            {/* In-shelf search bar */}
            <div className="relative w-full sm:w-64">
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder={`Search ${reader.name.split(' ')[0]}'s books...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Genre Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs font-medium text-slate-500 mr-1">Genre:</span>
            {['All', 'Fiction', 'Non-fiction', 'History', 'Science', 'Poetry'].map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedGenre === genre
                    ? 'bg-brand text-white font-semibold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Books Grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              {filteredBooks.map((book) => {
                const isDonation = book.availabilityMode === 'donation' || book.status === 'donation';
                const isLentOut = book.status === 'lent_out';
                const isNotified = notifiedBooks[book.id];

                return (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book)}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Book Cover Image & Condition Badge */}
                      <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-100 mb-3.5 shadow-inner">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

                        {/* Bottom Right: Condition Badge */}
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 text-[11px] font-medium text-slate-700 shadow-xs">
                          {book.condition || 'Very Good'}
                        </div>
                      </div>

                      {/* Title & Author */}
                      <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-brand transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {book.author}
                      </p>

                      {/* Brief description / owner note */}
                      {book.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {book.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Row: Ratings & Action Button */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500 fill-amber-400" />
                        <span>{book.rating}</span>
                        <span className="text-[11px] text-slate-500 font-normal">({book.reviewsCount})</span>
                      </div>

                      {/* Action Button depending on mode */}
                      {book.status === 'claimed' ? (
                        <span className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-slate-100 text-slate-500 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border border-slate-200/80 shadow-2xs flex-shrink-0 select-none">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-600" />
                          <span>Claimed</span>
                        </span>
                      ) : book.availabilityMode === 'personal' ? (
                        <span
                          className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-slate-100/90 text-slate-600 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 border border-slate-200/80 shadow-2xs flex-shrink-0 select-none"
                          title="This book is in the reader's private library"
                        >
                          <HugeiconsIcon icon={LockIcon} size={14} className="text-slate-500" />
                          <span>Private</span>
                        </span>
                      ) : isDonation ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestBorrow(book, reader.name);
                          }}
                          className="h-10 sm:h-11 px-4 sm:px-4.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:outline-none"
                        >
                          <HugeiconsIcon icon={GiftIcon} size={15} />
                          <span>Claim Gift</span>
                        </button>
                      ) : isLentOut ? (
                        <button
                          type="button"
                          disabled={isNotified}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotifyReturn(book.id);
                          }}
                          className={`h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 flex-shrink-0 shadow-2xs ${
                            isNotified
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 active:scale-95'
                          }`}
                        >
                          <HugeiconsIcon icon={Clock01Icon} size={14} className={isNotified ? 'text-slate-400' : 'text-amber-700'} />
                          <span>{isNotified ? 'Waitlist Set ✓' : 'Notify Return'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestBorrow(book, reader.name);
                          }}
                          className="h-10 sm:h-11 px-4 sm:px-4.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
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
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <p className="text-slate-500 text-sm">
                No books match the selected filters on {reader.name}’s shelf.
              </p>
              <button
                onClick={() => {
                  setAvailabilityFilter('all');
                  setSelectedGenre('All');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs font-semibold text-brand hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* 7. TAB CONTENT 2: NEIGHBOR REVIEWS */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
            <h3 className="font-serif text-2xl font-semibold text-slate-800 mb-1">
              Community Endorsements & Feedback
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Reviews from neighbors who have completed handovers, borrowed books, or received donations from {reader.name}.
            </p>

            <div className="divide-y divide-slate-100 space-y-6">
              {neighborReviews.map((rev) => (
                <div key={rev.id} className="pt-6 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.neighborAvatar}
                        alt={rev.neighborName}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <h4 className="font-sans font-semibold text-sm text-slate-900">
                          {rev.neighborName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-medium text-brand">{rev.type}</span>
                          <span>·</span>
                          <span>For “{rev.bookTitle}”</span>
                          <span>·</span>
                          <span>{rev.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <HugeiconsIcon key={i} icon={StarIcon} size={15} className="fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans pl-14">
                    “{rev.comment}”
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT 3: ABOUT & MEETUP SPOTS */}
      {activeSubTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-4">
            <h3 className="font-serif text-xl font-semibold text-slate-800">
              Reading Tastes & Philosophy
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {reader.bio ||
                'I believe every good book should be read multiple times by different people. Books that sit on shelves for years are wasted potential. I list both lending copies (which I cherish and ask back) and donation copies (which I want someone else to keep).'}
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Favorite Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {(reader.favoriteGenres || ['Fiction', 'History', 'Philosophy', 'Science']).map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg bg-cream-200 text-slate-700 text-xs font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-4">
            <h3 className="font-serif text-xl font-semibold text-slate-800">
              Preferred Handover Spots
            </h3>
            <p className="text-xs text-slate-500">
              Safe, public spots in our neighborhood where {reader.name.split(' ')[0]} prefers to meet for book handovers:
            </p>

            <div className="space-y-3 pt-1">
              {[
                { name: 'Camden Coffee Roasters', desc: 'Main entrance foyer · Usually weekdays 5pm - 7pm' },
                { name: 'Primrose Hill Community Library', desc: 'Front reception desk · Saturdays 10am - 1pm' }
              ].map((spot, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <HugeiconsIcon icon={Location01Icon} size={16} className="text-brand flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">{spot.name}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{spot.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. Return Reliability 5-Tier Guide Modal */}
      <ReturnReliabilityModal
        isOpen={isReliabilityModalOpen}
        onClose={() => setIsReliabilityModalOpen(false)}
        userName={reader.name}
        userTier={5}
        onTimeCount={reader.totalBorrows || 42}
        totalReturns={reader.totalBorrows || 42}
      />
    </div>
  );
};
