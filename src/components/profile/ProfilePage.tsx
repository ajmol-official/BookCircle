import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  BookOpen01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import type { Book, HandoverLocation } from '../../types';
import { ProfileHeaderCard } from './ProfileHeaderCard';
import { ProfileBookCard } from './ProfileBookCard';
import { ProfileMeetupSpotsTab } from './ProfileMeetupSpotsTab';
import { EditProfileModal } from './EditProfileModal';
import { ReturnReliabilityModal } from './ReturnReliabilityModal';
import { useAuth } from '../../context/AuthContext';

interface ProfilePageProps {
  onSelectBook: (book: Book) => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  myBooks: Book[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onSelectBook,
  onSelectAuthor,
  myBooks,
}) => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();

  const [profile, setProfile] = useState({
    name: currentUser?.displayName || 'Reader',
    location: currentUser?.location || 'Local Community',
    bio: currentUser?.bio || 'Book enthusiast and community reader. Slow reader. Love novels that feel like long walks.',
    avatar: currentUser?.avatar || '',
    favoriteGenres: currentUser?.favoriteGenres || ['All', 'Fiction', 'Non-fiction', 'Science', 'History', 'Poetry'],
  });

  const [coverErrors, setCoverErrors] = useState<Record<string, boolean>>({});
  const [fbAvatarErrors, setFbAvatarErrors] = useState<Record<string, boolean>>({});
  const [activeSubTab, setActiveSubTab] = useState<'library' | 'reviews' | 'feedback' | 'meetup'>('library');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReliabilityModalOpen, setIsReliabilityModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync profile when currentUser updates
  React.useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.displayName || 'Reader',
        location: currentUser.location || 'Local Community',
        bio: currentUser.bio || 'Book enthusiast and community reader. Slow reader. Love novels that feel like long walks.',
        avatar: currentUser.avatar || '',
        favoriteGenres: currentUser.favoriteGenres || ['All', 'Fiction', 'Non-fiction', 'Science'],
      });
    }
  }, [currentUser]);

  // Derive initials for avatar fallback
  const initials = useMemo(() => {
    if (!profile.name) return 'R';
    const parts = profile.name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return profile.name.slice(0, 2).toUpperCase();
  }, [profile.name]);

  // Derived Book Counts for Hero Stats Strip
  const totalBooksCount = myBooks.length;
  const availableLendingCount = myBooks.filter(
    (b) => b.availabilityMode === 'lending' && b.status !== 'lent_out'
  ).length;
  const availableDonationCount = myBooks.filter(
    (b) => b.availabilityMode === 'donation' || b.status === 'donation'
  ).length;
  const lentOutCount = myBooks.filter((b) => b.status === 'lent_out').length;

  // Derive Preferred Handover Locations
  const handoverSpots = useMemo<HandoverLocation[]>(() => {
    if (currentUser?.preferredHandoverLocations && currentUser.preferredHandoverLocations.length > 0) {
      return currentUser.preferredHandoverLocations;
    }
    try {
      const stored = localStorage.getItem('bookcircle_user_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.preferredHandoverLocations) && parsed.preferredHandoverLocations.length > 0) {
          return parsed.preferredHandoverLocations;
        }
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'spot-1',
        name: 'Camden Coffee Roasters',
        instructions: 'Main entrance foyer by the community book nook · Weekdays 5pm – 7pm',
      },
      {
        id: 'spot-2',
        name: 'Primrose Hill Community Library',
        instructions: 'Front reception desk area · Saturdays 10am – 1pm',
      },
    ];
  }, [currentUser]);

  const handleShareProfile = () => {
    try {
      const readerSlug = encodeURIComponent(
        (currentUser?.displayName || profile.name || 'reader').toLowerCase().replace(/\s+/g, '-')
      );
      const shareUrl = `${window.location.origin}/reader/${readerSlug}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy reader profile link:', err);
    }
  };

  const reviewsWritten = [
    {
      id: 'my-rev-1',
      book: 'Pachinko',
      author: 'Min Jin Lee',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      date: 'March 14, 2026',
      text: 'One of the most extraordinary family sagas I have read in years. Every character carries their pain with grace.',
    },
    {
      id: 'my-rev-2',
      book: 'The Night Circus',
      author: 'Erin Morgenstern',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
      rating: 4.5,
      date: 'February 2, 2026',
      text: 'Rich atmospheric prose that feels like magic. Best read with warm tea by the window.',
    },
    {
      id: 'my-rev-3',
      book: 'Stoner',
      author: 'John Williams',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      date: 'January 18, 2026',
      text: 'Quiet, profound, and deeply human. An unforgettable meditation on ordinary devotion.',
    },
  ];

  const communityFeedback = [
    {
      id: 'fb-1',
      giver: 'Priya Shah',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      role: 'Borrower',
      book: 'The Overstory',
      date: '2 weeks ago',
      rating: 5,
      comment: 'So lovely to meet at Riverside Coffee! The book was pristine and she included a cute handmade bookmark.',
    },
    {
      id: 'fb-2',
      giver: 'Diego Ramirez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      role: 'Lender',
      book: 'Drive',
      date: '1 month ago',
      rating: 5,
      comment: 'Returned my book ahead of time and in perfect shape. Reliable and wonderful neighbor!',
    },
  ];

  const filteredShelf = myBooks.filter(
    (b) => selectedGenre === 'All' || b.category.toLowerCase() === selectedGenre.toLowerCase()
  );

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

      <div className="pt-8 pb-20 animate-in fade-in duration-200 space-y-8">
        {/* 1. Profile Hero Card matching Figma */}
        <ProfileHeaderCard
          name={profile.name}
          location={profile.location}
          memberSince={currentUser?.memberSince || 'February 2024'}
          bio={profile.bio}
          avatar={profile.avatar}
          initials={initials}
          stats={{
            totalBooks: totalBooksCount,
            availableLending: availableLendingCount,
            availableDonation: availableDonationCount,
            lentOut: lentOutCount,
          }}
          trustStats={{
            onTimeReturnsRatio:
              currentUser?.borrowsCount && currentUser.borrowsCount > 0
                ? `${currentUser.borrowsCount}/${currentUser.borrowsCount}`
                : '0/0',
            communityContributions: availableDonationCount,
            activeBorrows: currentUser?.borrowsCount || 0,
            generousListerBooks: totalBooksCount,
          }}
          isOwnProfile={true}
          onEditProfile={() => setIsEditModalOpen(true)}
          onShareProfile={handleShareProfile}
          onOpenReliabilityModal={() => setIsReliabilityModalOpen(true)}
          copiedLink={copiedLink}
        />

        {/* 2. Sub-Tabs Bar matching Figma */}
        <div className="flex items-center gap-8 sm:gap-12 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'library', label: 'My Library' },
            { id: 'reviews', label: `Reviews (${reviewsWritten.length})` },
            { id: 'feedback', label: `Feedback (${communityFeedback.length})` },
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

        {/* 3. Tab Content 1: My Library */}
        {activeSubTab === 'library' && (
          <div className="space-y-6">
            {/* Shelf Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                  On the shelf
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {filteredShelf.length} {filteredShelf.length === 1 ? 'book' : 'books'} listed
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/my-books')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand text-xs sm:text-sm font-semibold transition active:scale-95 self-start sm:self-auto cursor-pointer"
              >
                <span>Manage Books</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
              </button>
            </div>

            {/* Favorite Genres filter chips (if available) */}
            {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-500 mr-1">Filter genre:</span>
                {profile.favoriteGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedGenre === genre
                        ? 'bg-brand text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}

            {/* 4-Column Book Grid */}
            {filteredShelf.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
                {filteredShelf.map((book) => (
                  <ProfileBookCard
                    key={book.id}
                    book={book}
                    isPublic={false}
                    onSelectBook={onSelectBook}
                    onSelectAuthor={onSelectAuthor}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center">
                  <HugeiconsIcon icon={BookOpen01Icon} size={24} />
                </div>
                <h3 className="font-serif text-base font-semibold text-slate-800">No books found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {selectedGenre !== 'All'
                    ? `No books under "${selectedGenre}" category yet.`
                    : 'Your personal library is empty. Add copies to start lending and donating!'}
                </p>
                {selectedGenre !== 'All' ? (
                  <button
                    type="button"
                    onClick={() => setSelectedGenre('All')}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Show all books
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/my-books')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition shadow-xs"
                  >
                    <span>Go to My Books</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. Tab Content 2: Reviews */}
        {activeSubTab === 'reviews' && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
              Reviews by {profile.name} ({reviewsWritten.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviewsWritten.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-3">
                      {coverErrors[rev.id] || !rev.cover ? (
                        <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-brand/10 via-[#FDF8F2] to-amber-500/10 border border-slate-200 flex flex-col items-center justify-center p-1 text-center select-none flex-shrink-0">
                          <HugeiconsIcon icon={BookOpen01Icon} size={16} className="text-brand/60" />
                        </div>
                      ) : (
                        <img
                          src={rev.cover}
                          alt={rev.book}
                          onError={() => setCoverErrors((prev) => ({ ...prev, [rev.id]: true }))}
                          className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
                        />
                      )}
                      <div>
                        <h4 className="font-serif text-base font-semibold text-slate-800">{rev.book}</h4>
                        <p className="text-xs text-slate-500">{rev.author}</p>
                        <div className="flex items-center gap-1 text-amber-500 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <HugeiconsIcon
                              key={i}
                              icon={StarIcon}
                              size={12}
                              className={
                                i < Math.floor(rev.rating)
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-200'
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                      “{rev.text}”
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    Reviewed on {rev.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Tab Content 3: Community Feedback */}
        {activeSubTab === 'feedback' && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
              Community Endorsements ({communityFeedback.length})
            </h2>

            <div className="space-y-3">
              {communityFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {fbAvatarErrors[fb.id] || !fb.avatar ? (
                      <div className="w-12 h-12 rounded-full bg-brand/10 border-2 border-brand/20 text-brand font-bold text-xs flex items-center justify-center flex-shrink-0 select-none">
                        {fb.giver.slice(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <img
                        src={fb.avatar}
                        alt={fb.giver}
                        onError={() => setFbAvatarErrors((prev) => ({ ...prev, [fb.id]: true }))}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans font-semibold text-sm sm:text-base text-slate-900">
                          {fb.giver}
                        </h4>
                        <span className="text-xs text-slate-500">· {fb.role} for “{fb.book}”</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 italic">
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
          </div>
        )}

        {/* 6. Tab Content 4: Meetup Spots */}
        {activeSubTab === 'meetup' && (
          <ProfileMeetupSpotsTab
            handoverSpots={handoverSpots}
            isOwnProfile={true}
            readerName={profile.name}
          />
        )}

        {/* Modals */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userProfile={{
            name: profile.name,
            location: profile.location,
            bio: profile.bio,
            avatar: profile.avatar,
            favoriteGenres: profile.favoriteGenres,
          }}
          onSave={async (updated) => {
            await updateProfile({
              displayName: updated.name,
              avatar: updated.avatar,
              location: updated.location,
              bio: updated.bio,
              favoriteGenres: updated.favoriteGenres,
              isProfileComplete: true,
            });
            setProfile((prev) => ({ ...prev, ...updated }));
          }}
        />

        <ReturnReliabilityModal
          isOpen={isReliabilityModalOpen}
          onClose={() => setIsReliabilityModalOpen(false)}
          userName={profile.name}
          userTier={5}
          onTimeCount={32}
          totalReturns={32}
        />
      </div>
    </>
  );
};
