import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Search01Icon,
  BookOpen01Icon,
  Book02Icon,
} from '@hugeicons/core-free-icons';
import type { Author } from '../../types/author';
import type { Book, CatalogWork } from '../../types';
import { AuthorHeaderCard } from './AuthorHeaderCard';
import { BookCatalogueCard } from './BookCatalogueCard';
import { getCatalogWorksForAuthor } from '../../data/canonicalCatalog';
import { useWriter } from '../../context/WriterContext';
import { useAuth } from '../../context/AuthContext';

interface AuthorProfilePageProps {
  author?: Author;
  works?: CatalogWork[];
  books?: Book[];
  onSelectWork?: (work: CatalogWork) => void;
  onSelectBook?: (book: Book) => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  onSelectOwner?: (ownerName: string) => void;
  onQuickBorrow?: (book: Book) => void;
  onOpenAddBook?: () => void;
  onBack?: () => void;
  isUserProfileView?: boolean;
}

export const AuthorProfilePage: React.FC<AuthorProfilePageProps> = ({
  author,
  works,
  books = [],
  onSelectWork,
  onSelectBook,
  onSelectAuthor: _onSelectAuthor,
  onSelectOwner: _onSelectOwner,
  onQuickBorrow: _onQuickBorrow,
  onOpenAddBook,
  onBack,
  isUserProfileView = false,
}) => {
  const { openWriterOnboarding, openWriterDashboard, activeWriterProfile } = useWriter();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Profile ownership detection
  const isOwner = Boolean(
    isUserProfileView ||
      (currentUser &&
        author &&
        (author.claimedUserId === currentUser.id ||
          (currentUser.writerStatus === 'approved' &&
            currentUser.writerProfileId &&
            (currentUser.writerProfileId === author.id ||
              currentUser.writerProfileId === author.slug)) ||
          (activeWriterProfile &&
            (activeWriterProfile.id === author.id ||
              activeWriterProfile.slug === author.slug ||
              activeWriterProfile.name.toLowerCase().trim() === author.name.toLowerCase().trim()))))
  );

  // If author is missing or invalid slug
  if (!author) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-card">
          <div className="w-16 h-16 bg-purple-50 text-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon icon={Book02Icon} size={32} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Author Profile Not Found
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
            We couldn't find an author profile matching this URL. The author may not have been catalogued yet.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full bg-brand text-white font-medium hover:bg-brand/90 transition shadow-sm text-sm cursor-pointer"
            >
              Back to Catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Canonical works list
  const catalogWorks = useMemo(() => {
    if (works && works.length > 0) return works;
    return getCatalogWorksForAuthor(author.name, books);
  }, [works, author.name, books]);

  // Total community copies circulating across all works
  const totalCommunityCopies = useMemo(() => {
    return catalogWorks.reduce((acc, w) => acc + w.totalCopies, 0);
  }, [catalogWorks]);

  // Extract unique categories available from this author's canonical works
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    catalogWorks.forEach((w) => {
      if (w.category) cats.add(w.category);
    });
    return ['All', ...Array.from(cats)];
  }, [catalogWorks]);

  // Filter canonical works by query and category
  const filteredWorks = useMemo(() => {
    return catalogWorks.filter((w) => {
      const matchCat =
        selectedCategory === 'All' ||
        w.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        w.title.toLowerCase().includes(q) ||
        (w.synopsis && w.synopsis.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [catalogWorks, selectedCategory, searchQuery]);

  // Primary action when clicking a catalogue card
  const handleSelectWork = (work: CatalogWork) => {
    if (onSelectWork) {
      onSelectWork(work);
      return;
    }
    const matchingCopy = books.find(
      (b) =>
        (b.catalogId && b.catalogId === work.id) ||
        b.title.toLowerCase().trim() === work.title.toLowerCase().trim()
    );
    if (matchingCopy) {
      onSelectBook?.(matchingCopy);
    } else {
      onSelectBook?.({
        id: work.id,
        catalogId: work.id,
        title: work.title,
        author: work.author,
        authorId: work.authorId,
        authorCountry: work.authorCountry,
        coverImage: work.coverImage,
        category: work.category,
        rating: work.rating,
        reviewsCount: work.reviewsCount,
        description: work.synopsis,
        publishedYear: work.publishedYear,
        status: 'available',
        distance: '',
        ownersCount: 0,
        ownerName: '',
        ownerAvatar: '',
        ownerTrust: '',
        owner: { name: '', avatar: '', distance: '' },
      });
    }
  };

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    } catch {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  return (
    <>
      {/* Floating Centered Toast Notification rendered via Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed top-20 sm:top-24 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
            <AnimatePresence>
              {shareToast && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-medium shadow-2xl border border-slate-700/80 flex items-center gap-2.5 max-w-md pointer-events-auto"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-400 flex-shrink-0" />
                  <span>Author profile link copied to clipboard!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body
        )}

      <div
        className={`${
          isUserProfileView ? 'pt-6 sm:pt-8' : 'pt-4 sm:pt-8'
        } pb-20 animate-in fade-in duration-200 space-y-8`}
      >
        {/* Contextual Breadcrumb & Back Navigation */}
        {!isUserProfileView && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 mb-2">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 min-w-0"
            >
              <button
                type="button"
                onClick={onBack}
                className="hover:text-brand font-medium transition-colors flex-shrink-0 cursor-pointer"
              >
                Catalogue
              </button>
              <span className="text-slate-300 flex-shrink-0">/</span>
              <span className="text-slate-400 font-medium flex-shrink-0">Authors</span>
              <span className="text-slate-300 flex-shrink-0">/</span>
              <span className="text-slate-800 font-semibold truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                {author.name}
              </span>
            </nav>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-brand transition-colors bg-white px-3 sm:px-4 py-1.5 rounded-full border border-slate-200/80 shadow-xs hover:border-brand/30 flex-shrink-0 cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              <span>Back to Books</span>
            </button>
          </div>
        )}

        {/* ─── SECTION A: Author Information Header Card matching Figma ─── */}
        <AuthorHeaderCard
          author={author}
          worksCount={catalogWorks.length}
          copiesCount={totalCommunityCopies}
          followersCount={(author.followersCount || 1543) + (isFollowing ? 1 : 0)}
          isFollowing={isFollowing}
          onToggleFollow={handleToggleFollow}
          onShare={handleShare}
          isOwner={isOwner}
          onEditProfile={openWriterDashboard}
          onClaimProfile={() => openWriterOnboarding(author)}
        />

        {/* ─── SECTION B: Published Books Catalogue ─── */}
        <div className="space-y-6">
          {/* Section Heading & Search Controls matching Figma */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-800">
                  Published Works by {author.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-bold font-mono">
                  {filteredWorks.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore published bibliography. Click “Explore Copies” to view community copies circulating nearby.
              </p>
            </div>

            {/* In-author search bar */}
            {catalogWorks.length > 0 && (
              <div className="relative w-full sm:w-80">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${author.name.split(' ')[0]}’s works...`}
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
            )}
          </div>

          {/* Category Filter Chips */}
          {availableCategories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex-shrink-0">
                Category:
              </span>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs rounded-xl font-semibold transition-all cursor-pointer flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* 4-Column Book Catalogue Cards Grid matching Figma */}
          {filteredWorks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
              {filteredWorks.map((work) => (
                <BookCatalogueCard
                  key={work.id}
                  work={work}
                  onSelectWork={handleSelectWork}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-200/90 shadow-card space-y-3">
              <div className="w-16 h-16 bg-purple-50 text-brand rounded-2xl flex items-center justify-center mx-auto mb-2">
                <HugeiconsIcon icon={BookOpen01Icon} size={32} />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-800">
                {catalogWorks.length === 0
                  ? `No published works by ${author.name} are currently in the catalogue`
                  : 'No published works match your search filter'}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                {catalogWorks.length === 0
                  ? `Be the first neighbor to list a book by ${author.name} on your shelf for lending or donation!`
                  : 'Try clearing your search query or choosing another category to see available works.'}
              </p>
              {catalogWorks.length === 0 ? (
                onOpenAddBook && (
                  <button
                    type="button"
                    onClick={onOpenAddBook}
                    className="mt-3 px-6 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark transition shadow-xs text-xs sm:text-sm cursor-pointer"
                  >
                    + Add a Book by {author.name}
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-3 px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition text-xs sm:text-sm cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
