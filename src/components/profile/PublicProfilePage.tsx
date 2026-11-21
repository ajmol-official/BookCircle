import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  BookOpen01Icon,
  GiftIcon,
  Clock01Icon,
  Search01Icon,
  CheckmarkCircle02Icon,
  Bookmark02Icon,
} from '@hugeicons/core-free-icons';
import type { Book, Reader, HandoverLocation } from '../../types';
import { ProfileHeaderCard } from './ProfileHeaderCard';
import { ProfileBookCard } from './ProfileBookCard';
import { ProfileMeetupSpotsTab } from './ProfileMeetupSpotsTab';
import { ReturnReliabilityModal } from './ReturnReliabilityModal';
import { EditProfileModal } from './EditProfileModal';
import { useAuth } from '../../context/AuthContext';
import { cleanAvatarUrl } from '../../utils/avatarUtils';

interface PublicProfilePageProps {
  reader: Reader;
  allBooks: Book[];
  onBack?: () => void;
  onSelectBook: (book: Book) => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  onRequestBorrow: (book: Book, ownerName?: string) => void;
  onSendMessage?: (ownerName: string) => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  reader,
  allBooks,
  onSelectBook,
  onSelectAuthor,
  onRequestBorrow,
  onSendMessage,
}) => {
  const { currentUser, updateProfile } = useAuth();
  const firstName = reader.name.split(' ')[0];

  const isOwnProfile = Boolean(
    currentUser &&
      ((reader.id && currentUser.id === reader.id) ||
        (currentUser.displayName &&
          reader.name &&
          currentUser.displayName.toLowerCase().trim() === reader.name.toLowerCase().trim()))
  );

  const isMockProfile = Boolean(
    reader.id &&
      (reader.id.startsWith('mock-') ||
        reader.id === 'demo-user' ||
        reader.name === 'Hana Yamada' ||
        reader.name === 'Diego Ramirez' ||
        reader.name === 'Priya Shah')
  );

  const [activeSubTab, setActiveSubTab] = useState<
    'shelf' | 'contributions' | 'reviews' | 'feedback' | 'meetup'
  >('shelf');
  const [availabilityFilter, setAvailabilityFilter] = useState<
    'all' | 'lending' | 'donation' | 'personal' | 'lent_out'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReliabilityModalOpen, setIsReliabilityModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Derive initials for avatar fallback
  const initials = useMemo(() => {
    if (!reader.name) return 'R';
    const parts = reader.name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return reader.name.slice(0, 2).toUpperCase();
  }, [reader.name]);

  // Resolve preferred handover locations
  const handoverSpots = useMemo<HandoverLocation[]>(() => {
    if (isOwnProfile) {
      if (currentUser?.preferredHandoverLocations && currentUser.preferredHandoverLocations.length > 0) {
        return currentUser.preferredHandoverLocations.slice(0, 2);
      }
      try {
        const stored = localStorage.getItem('bookcircle_user_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.preferredHandoverLocations) && parsed.preferredHandoverLocations.length > 0) {
            return parsed.preferredHandoverLocations.slice(0, 2);
          }
        }
      } catch {
        // ignore
      }
      return currentUser?.preferredHandoverLocations?.slice(0, 2) || [];
    }

    if (reader.preferredHandoverLocations && reader.preferredHandoverLocations.length > 0) {
      return reader.preferredHandoverLocations.slice(0, 2);
    }

    if (isMockProfile) {
      return [
        {
          id: `spot-${reader.id || '1'}-1`,
          name: 'Camden Coffee Roasters',
          instructions: 'Main entrance foyer · Usually weekdays 5pm – 7pm',
        },
        {
          id: `spot-${reader.id || '1'}-2`,
          name: 'Primrose Hill Community Library',
          instructions: 'Front reception desk · Saturdays 10am – 1pm',
        },
      ];
    }

    return [];
  }, [isOwnProfile, currentUser, reader, isMockProfile]);

  // Filter books owned by this reader
  const readerBooks = useMemo(() => {
    const readerNameNormalized = reader.name.toLowerCase().trim();
    const readerIdNormalized = (reader.id || '').toLowerCase().trim();

    return allBooks.filter((book) => {
      const ownerNormalized = book.ownerName.toLowerCase().trim();
      const ownerIdNormalized = (book.ownerId || '').toLowerCase().trim();

      const isOwner =
        (readerIdNormalized && ownerIdNormalized && ownerIdNormalized === readerIdNormalized) ||
        ownerNormalized === readerNameNormalized;

      if (!isOwner) return false;

      // Privacy Isolation: Non-owners NEVER see claimed donation books or books explicitly marked private
      if (!isOwnProfile) {
        if (
          book.status === 'claimed' ||
          (book.description && book.description.includes('[STRICTLY_PRIVATE]'))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allBooks, reader, isOwnProfile]);

  // Derived counts
  const lendingCount = readerBooks.filter(
    (b) => b.availabilityMode === 'lending' && b.status === 'available'
  ).length;
  const donationCount = readerBooks.filter(
    (b) => b.availabilityMode === 'donation' || b.status === 'donation'
  ).length;
  const personalCount = readerBooks.filter((b) => b.availabilityMode === 'personal').length;
  const lentOutCount = readerBooks.filter((b) => b.status === 'lent_out').length;
  const totalBooksCount = readerBooks.length;

  // Filtered books on shelf
  const filteredBooks = useMemo(() => {
    return readerBooks.filter((book) => {
      // 1. Availability Filter
      if (availabilityFilter === 'lending') {
        if (book.availabilityMode !== 'lending' || book.status === 'lent_out') return false;
      } else if (availabilityFilter === 'donation') {
        if (book.availabilityMode !== 'donation' && book.status !== 'donation') return false;
      } else if (availabilityFilter === 'personal') {
        if (book.availabilityMode !== 'personal') return false;
      } else if (availabilityFilter === 'lent_out') {
        if (book.status !== 'lent_out') return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesDesc = book.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesDesc) return false;
      }

      return true;
    });
  }, [readerBooks, availabilityFilter, searchQuery]);

  const handleShareProfile = () => {
    try {
      const url = `${window.location.origin}/reader/${encodeURIComponent(
        reader.name.toLowerCase().replace(/\s+/g, '-')
      )}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).catch(() => {});
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Community reviews: Real users have only real reviews (start at 0); mock demo accounts keep illustrative reviews
  const neighborReviews = useMemo(() => {
    if (!isMockProfile) {
      return [];
    }
    return [
      {
        id: 'rev-n1',
        neighborName: 'Maya Lin',
        neighborAvatar: '',
        bookTitle: 'Pachinko',
        date: '1 week ago',
        rating: 5,
        type: 'Borrower',
        comment: `${reader.name} is one of the most generous and reliable readers in our neighborhood! Met right on time. The book was in immaculate condition.`,
      },
      {
        id: 'rev-n2',
        neighborName: 'Diego Ramirez',
        neighborAvatar: '',
        bookTitle: 'The Godfather',
        date: '3 weeks ago',
        rating: 5,
        type: 'Borrower',
        comment: `Smooth and prompt handover. Highly recommend borrowing from or donating books to ${reader.name}. 10/10 community neighbor!`,
      },
      {
        id: 'rev-n3',
        neighborName: 'Priya Shah',
        neighborAvatar: '',
        bookTitle: 'The Alchemist',
        date: '1 month ago',
        rating: 5,
        type: 'Recipient (Donation)',
        comment: `Received a wonderful donation copy from ${reader.name}’s shelf to keep forever. What an amazing way to spread love for literature across our community.`,
      },
    ];
  }, [isMockProfile, reader.name]);

  return (
    <>
      {/* Floating Centered Toast Notification rendered via Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed top-20 sm:top-24 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            <AnimatePresence>
              {copiedLink && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-medium shadow-2xl border border-slate-700/80 flex items-center gap-2.5 max-w-md pointer-events-auto"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-400 flex-shrink-0" />
                  <span>Profile link copied to clipboard!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body
        )}

      <div className="pt-8 pb-24 animate-in fade-in duration-200 space-y-8">
        {/* 1. Profile Hero Card matching Figma */}
        <ProfileHeaderCard
          name={reader.name}
          location={reader.location || `${reader.distance} away`}
          memberSince={reader.memberSince || 'February 2024'}
          bio={reader.bio || undefined}
          avatar={cleanAvatarUrl(reader.avatar)}
          initials={initials}
          stats={{
            totalBooks: totalBooksCount,
            availableLending: lendingCount,
            availableDonation: donationCount,
            lentOut: lentOutCount,
            onShelf: personalCount,
          }}
          trustStats={{
            onTimeReturnsRatio:
              reader.totalBorrows && reader.totalBorrows > 0
                ? `${reader.totalBorrows}/${reader.totalBorrows}`
                : isMockProfile
                ? '32/32'
                : '0/0',
            communityContributions: donationCount,
            activeBorrows: reader.totalBorrows || 0,
            generousListerBooks: totalBooksCount,
          }}
          isOwnProfile={isOwnProfile}
          onEditProfile={isOwnProfile ? () => setIsEditModalOpen(true) : undefined}
          onShareProfile={handleShareProfile}
          onSendMessage={
            !isOwnProfile && onSendMessage ? () => onSendMessage(reader.name) : undefined
          }
          onOpenReliabilityModal={() => setIsReliabilityModalOpen(true)}
          copiedLink={copiedLink}
        />

        {/* 2. Sub-Tabs Bar matching Figma */}
        <div className="flex items-center gap-8 sm:gap-12 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'shelf', label: isOwnProfile ? 'My Library' : `${firstName}’s Shelf` },
            { id: 'contributions', label: 'Community Contribution' },
            { id: 'reviews', label: `Reviews (${neighborReviews.length})` },
            { id: 'feedback', label: 'Feedback' },
            { id: 'meetup', label: 'Meetup Spots' },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`relative pb-3 text-base sm:text-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full transition-all" />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. TAB CONTENT 1: SHELF */}
        {activeSubTab === 'shelf' && (
          <div className="space-y-6">
            {/* Shelf Header Row with Dynamic Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                  {isOwnProfile ? 'Your Library' : `${firstName}’s Library`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Books available to borrow, claim, or explore from {firstName}’s shelf ({filteredBooks.length} titles)
                </p>
              </div>

              {/* Dynamic In-shelf Search Bar */}
              <div className="relative w-full sm:w-80">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder={`Search ${firstName}’s shelf...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full bg-white border border-slate-300 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Availability Mode Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-semibold text-slate-500 mr-1">Show:</span>
              <button
                onClick={() => setAvailabilityFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  availabilityFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Books ({totalBooksCount})
              </button>

              <button
                onClick={() => setAvailabilityFilter('lending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  availabilityFilter === 'donation'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <HugeiconsIcon icon={GiftIcon} size={14} />
                <span>Free to Donate ({donationCount})</span>
              </button>

              {lentOutCount > 0 && (
                <button
                  onClick={() => setAvailabilityFilter('lent_out')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    availabilityFilter === 'lent_out'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <HugeiconsIcon icon={Clock01Icon} size={14} />
                  <span>Currently Lent Out ({lentOutCount})</span>
                </button>
              )}

              {personalCount > 0 && (
                <button
                  onClick={() => setAvailabilityFilter('personal')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    availabilityFilter === 'personal'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <HugeiconsIcon icon={Bookmark02Icon} size={14} />
                  <span>On Shelf ({personalCount})</span>
                </button>
              )}
            </div>

            {/* 4-Column Book Grid */}
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
                {filteredBooks.map((book) => (
                  <ProfileBookCard
                    key={book.id}
                    book={book}
                    isPublic={!isOwnProfile}
                    onSelectBook={onSelectBook}
                    onSelectAuthor={onSelectAuthor}
                    onRequestBorrow={onRequestBorrow}
                    ownerName={reader.name}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center">
                  <HugeiconsIcon icon={BookOpen01Icon} size={24} />
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-800">
                  {searchQuery
                    ? 'No matching books found'
                    : readerBooks.length === 0
                    ? `${firstName} hasn’t added any books yet`
                    : 'No books in this filter'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No books found matching "${searchQuery}" on ${firstName}’s shelf.`
                    : readerBooks.length === 0
                    ? `Check back soon when ${firstName} lists books for lending or community donation!`
                    : `No books available under the selected filter on ${firstName}’s shelf.`}
                </p>
                {(searchQuery || availabilityFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvailabilityFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-2 text-xs font-semibold text-brand hover:underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. TAB CONTENT 2: COMMUNITY CONTRIBUTION */}
        {activeSubTab === 'contributions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                  {firstName}’s Community Impact
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  How {firstName} actively strengthens our local reading community through lending and donations.
                </p>
              </div>

              {/* Contribution Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-5 rounded-2xl bg-[#F3F0FC] border border-brand/20">
                  <span className="font-serif text-3xl font-bold text-brand">
                    {reader.totalBorrows || 16}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">Successful Lends</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Completed handovers returned safely to the shelf.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="font-serif text-3xl font-bold text-emerald-700">
                    {donationCount || 3}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">Books Donated</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Given freely to neighbors to keep and cherish forever.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="font-serif text-3xl font-bold text-amber-700">100%</span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">Punctuality Score</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    32/32 books returned on or ahead of scheduled due dates.
                  </p>
                </div>
              </div>

              {/* Community Pledge */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FDF8F2] border border-brand/15 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HugeiconsIcon icon={GiftIcon} size={18} />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800 block mb-0.5">
                    Community Reader Pledge
                  </span>
                  {firstName} has pledged to keep neighborhood literature in circular motion, fostering sustainable reading and trust among local neighbors.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB CONTENT 3: REVIEWS */}
        {activeSubTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800 mb-1">
                Reviews by Neighbors ({neighborReviews.length})
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Reviews from local neighbors who have completed handovers, borrowed books, or received donations from {firstName}.
              </p>

              {neighborReviews.length > 0 ? (
                <div className="divide-y divide-slate-100 space-y-6">
                  {neighborReviews.map((rev) => (
                    <div key={rev.id} className="pt-6 first:pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {rev.neighborAvatar ? (
                            <img
                              src={rev.neighborAvatar}
                              alt={rev.neighborName}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm ring-2 ring-slate-100 flex-shrink-0">
                              {rev.neighborName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-sans font-semibold text-sm text-slate-900">
                              {rev.neighborName}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
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
                            <HugeiconsIcon
                              key={i}
                              icon={StarIcon}
                              size={15}
                              className="fill-amber-400 text-amber-500"
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans pl-14 italic">
                        “{rev.comment}”
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand mx-auto flex items-center justify-center">
                    <HugeiconsIcon icon={StarIcon} size={20} />
                  </div>
                  <h4 className="font-serif font-semibold text-sm text-slate-800">No community reviews yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Reviews from fellow readers will appear here after {firstName} completes book loans or handovers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. TAB CONTENT 4: FEEDBACK */}
        {activeSubTab === 'feedback' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-4">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                Neighbor Feedback & Trust Record
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Verified reviews from completed physical book handovers across local neighborhoods.
              </p>

              {neighborReviews.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {neighborReviews.map((fb) => (
                    <div
                      key={`fb-${fb.id}`}
                      className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        {fb.neighborAvatar ? (
                          <img
                            src={fb.neighborAvatar}
                            alt={fb.neighborName}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm ring-2 ring-slate-100 flex-shrink-0">
                            {fb.neighborName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-slate-800">{fb.neighborName}</h4>
                            <span className="text-xs text-slate-500">· {fb.type}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 italic leading-relaxed">
                            “{fb.comment}”
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 self-end sm:self-auto">
                        {[...Array(fb.rating)].map((_, i) => (
                          <HugeiconsIcon
                            key={i}
                            icon={StarIcon}
                            size={14}
                            className="fill-amber-400 text-amber-500"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand mx-auto flex items-center justify-center">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
                  </div>
                  <h4 className="font-serif font-semibold text-sm text-slate-800">No exchange feedback yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Feedback from neighbors who exchange books with {firstName} will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. TAB CONTENT 5: MEETUP SPOTS */}
        {activeSubTab === 'meetup' && (
          <ProfileMeetupSpotsTab
            handoverSpots={handoverSpots}
            isOwnProfile={isOwnProfile}
            readerName={reader.name}
          />
        )}

        {/* Modals */}
        <ReturnReliabilityModal
          isOpen={isReliabilityModalOpen}
          onClose={() => setIsReliabilityModalOpen(false)}
          userName={reader.name}
          userTier={5}
          onTimeCount={reader.totalBorrows || 42}
          totalReturns={reader.totalBorrows || 42}
        />

        {isOwnProfile && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            userProfile={{
              name: reader.name,
              location: reader.location || '',
              bio: reader.bio || '',
              avatar: reader.avatar,
              favoriteGenres: reader.favoriteGenres,
            }}
            onSave={async (updated) => {
              try {
                await updateProfile({
                  displayName: updated.name,
                  avatar: updated.avatar,
                  location: updated.location,
                  bio: updated.bio,
                  favoriteGenres: updated.favoriteGenres,
                  isProfileComplete: true,
                });
              } catch (e) {
                console.error('Failed to update persistent profile:', e);
              }
            }}
          />
        )}
      </div>
    </>
  );
};
