import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  PencilEdit02Icon,
  StarIcon,
  BookOpen01Icon,
  ShieldCheckIcon,
  Camera01Icon,
  GiftIcon,
  Bookmark02Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import { EditProfileModal } from './EditProfileModal';
import { ReturnReliabilityModal } from './ReturnReliabilityModal';
import { useAuth } from '../../context/AuthContext';

interface ProfilePageProps {
  onSelectBook: (book: Book) => void;
  myBooks: Book[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onSelectBook, myBooks }) => {
  const { currentUser, updateProfile } = useAuth();

  const [profile, setProfile] = useState({
    name: currentUser?.displayName || 'Maya Lin',
    location: currentUser?.location || 'Elm Park, North London',
    bio: currentUser?.bio || 'Slow reader. Love novels that feel like long walks. Currently working through the Neapolitan quartet for a second time.',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    favoriteGenres: currentUser?.favoriteGenres || ['All', 'Fiction', 'Non-fiction', 'Science', 'History', 'Poetry']
  });

  // Sync profile when currentUser updates
  React.useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.displayName,
        location: currentUser.location || 'Elm Park, North London',
        bio: currentUser.bio || 'Book enthusiast and community reader.',
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        favoriteGenres: currentUser.favoriteGenres || ['All', 'Fiction', 'Non-fiction', 'Science']
      });
    }
  }, [currentUser]);

  const [activeSubTab, setActiveSubTab] = useState<'shelf' | 'reviews' | 'feedback'>('shelf');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReliabilityModalOpen, setIsReliabilityModalOpen] = useState(false);

  const reviewsWritten = [
    {
      id: 'my-rev-1',
      book: 'Pachinko',
      author: 'Min Jin Lee',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      date: 'March 14, 2026',
      text: 'One of the most extraordinary family sagas I have read in years. Every character carries their pain with grace.'
    },
    {
      id: 'my-rev-2',
      book: 'The Night Circus',
      author: 'Erin Morgenstern',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
      rating: 4.5,
      date: 'February 2, 2026',
      text: 'Rich atmospheric prose that feels like magic. Best read with warm tea by the window.'
    },
    {
      id: 'my-rev-3',
      book: 'Stoner',
      author: 'John Williams',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      date: 'January 18, 2026',
      text: 'Quiet, profound, and deeply human. An unforgettable meditation on ordinary devotion.'
    }
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
      comment: 'Maya was so lovely to meet at Riverside Coffee! The book was pristine and she included a cute handmade bookmark.'
    },
    {
      id: 'fb-2',
      giver: 'Diego Ramirez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      role: 'Lender',
      book: 'Drive',
      date: '1 month ago',
      rating: 5,
      comment: 'Maya returned my book ahead of time and in perfect shape. Reliable and wonderful neighbor!'
    }
  ];

  const filteredShelf = myBooks.filter((b) => 
    selectedGenre === 'All' || b.category.toLowerCase() === selectedGenre.toLowerCase()
  );

  return (
    <div className="pt-8 pb-20 animate-in fade-in duration-200 space-y-8">
      
      {/* 1. User Profile Header Card matching Figma #47:1711 */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group flex-shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-slate-100 shadow-md"
            />
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-1 right-1 p-2.5 rounded-full bg-brand text-white shadow-md hover:bg-brand-dark transition transform group-hover:scale-110 active:scale-95"
              title="Change profile picture"
            >
              <HugeiconsIcon icon={Camera01Icon} size={16} />
            </button>
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
              {profile.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
              <HugeiconsIcon icon={Location01Icon} size={16} className="text-brand flex-shrink-0" />
              <span>
                {profile.location} · Member since {currentUser?.memberSince || 'February 2024'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed pt-1 font-sans">
              {profile.bio}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:border-brand hover:bg-brand/5 text-slate-700 hover:text-brand text-xs sm:text-sm font-semibold transition-all self-end md:self-auto"
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={17} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* 2. Trust & Badges Banner matching Figma #48:1818 */}
      <div className="bg-cream-200 rounded-2xl p-6 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        {/* Trust Badge Column */}
        <div className="flex items-center gap-6 pr-6 md:border-r border-slate-300">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Trust Badge</p>
            <p className="font-serif text-2xl font-bold text-brand mt-0.5">Verified</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Tier 5 · Always on time</p>
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

        {/* Badges items */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Badge 1 */}
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex-shrink-0 shadow-xs" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">Always returned on time</p>
              <p className="text-xs text-slate-500">32/32 on schedule</p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 flex-shrink-0 shadow-xs" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">Active borrower</p>
              <p className="text-xs text-slate-500">16 Borrows completed</p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-brand flex-shrink-0 shadow-xs" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">Generous Lister</p>
              <p className="text-xs text-slate-500">14 Books shared</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Numerical Activity Metrics matching Figma #48:1840 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-slate-200/80">
        <div>
          <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-700">18</span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
            Books Listed
          </span>
        </div>

        <div>
          <span className="font-serif text-3xl sm:text-4xl font-bold text-brand">24</span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
            Lent Out
          </span>
        </div>

        <div>
          <span className="font-serif text-3xl sm:text-4xl font-bold text-emerald-700">14</span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
            Borrows
          </span>
        </div>

        <div>
          <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-600">31</span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
            Reviews Written
          </span>
        </div>
      </div>

      {/* 4. Sub-Tab Switcher matching Figma #48:1853 */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {[
          { id: 'shelf', label: 'Shelf' },
          { id: 'reviews', label: 'Reviews (31)' },
          { id: 'feedback', label: 'Feedback' },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`relative pb-3 text-base sm:text-lg font-serif transition-colors ${
                isActive ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full transition-all" />
              )}
            </button>
          );
        })}
      </div>

      {/* 5. Tab Content: Shelf */}
      {activeSubTab === 'shelf' && (
        <div className="space-y-6">
          {/* Favorite Genres filter chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-base font-semibold text-slate-700">
                Favorite Genres
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark hover:underline transition"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} size={13} />
                <span>Edit Preferences</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedGenre === genre
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Books grid */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                  On the shelf
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {filteredShelf.length} books available to neighborhood readers
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGenre('All')}
                className="text-xs font-semibold text-brand hover:text-brand-dark transition hover:underline"
              >
                View all {myBooks.length} books →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredShelf.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative w-full h-52 rounded-xl overflow-hidden bg-slate-100 mb-3 shadow-inner">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold text-slate-700 shadow-xs">
                        {book.ownersCount} own this
                      </div>
                    </div>

                    <h4 className="font-serif text-base font-semibold text-slate-800 line-clamp-1 group-hover:text-brand transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500">{book.author}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {book.availabilityMode === 'donation' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                        <HugeiconsIcon icon={GiftIcon} size={12} />
                        <span>For Donation</span>
                      </span>
                    ) : book.availabilityMode === 'personal' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <HugeiconsIcon icon={Bookmark02Icon} size={12} />
                        <span>Private Collection</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-brand/10 text-brand border border-brand/20">
                        <HugeiconsIcon icon={BookOpen01Icon} size={12} />
                        <span>For Lending</span>
                      </span>
                    )}

                    <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                      <HugeiconsIcon icon={StarIcon} size={13} className="fill-amber-400 text-amber-500" />
                      <span>{book.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab Content: Reviews Written */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
            Reviews by {profile.name} ({reviewsWritten.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewsWritten.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <img
                      src={rev.cover}
                      alt={rev.book}
                      className="w-12 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <div>
                      <h4 className="font-serif text-base font-semibold text-slate-800">{rev.book}</h4>
                      <p className="text-xs text-slate-500">{rev.author}</p>
                      <div className="flex items-center gap-1 text-amber-500 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <HugeiconsIcon
                            key={i}
                            icon={StarIcon}
                            size={12}
                            className={i < Math.floor(rev.rating) ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                    “{rev.text}”
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Reviewed on {rev.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Tab Content: Community Feedback */}
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
                  <img
                    src={fb.avatar}
                    alt={fb.giver}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-base font-semibold text-slate-800">{fb.giver}</h4>
                      <span className="text-xs text-slate-400">· {fb.role} for “{fb.book}”</span>
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

      {/* Edit Profile Modal */}
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
          setProfile((prev) => ({ ...prev, ...updated }));
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

      {/* 5-Level Return Reliability System Modal */}
      <ReturnReliabilityModal
        isOpen={isReliabilityModalOpen}
        onClose={() => setIsReliabilityModalOpen(false)}
        userName={profile.name}
        userTier={5}
        onTimeCount={32}
        totalReturns={32}
      />

    </div>
  );
};
