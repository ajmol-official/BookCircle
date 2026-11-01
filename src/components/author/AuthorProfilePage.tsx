import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Award01Icon,
  Globe02Icon,
  Share01Icon,
  Search01Icon,
  BookOpen01Icon,
  Book02Icon,
  SparklesIcon,
  FavouriteIcon
} from '@hugeicons/core-free-icons';
import type { Author } from '../../types/author';
import type { Book, CatalogWork } from '../../types';
import { BookCatalogueCard } from './BookCatalogueCard';
import { getCatalogWorksForAuthor } from '../../data/canonicalCatalog';

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
  onBack
}) => {
  const [photoError, setPhotoError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareToast, setShareToast] = useState(false);

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
              className="px-5 py-2.5 rounded-full bg-brand text-white font-medium hover:bg-brand/90 transition shadow-sm text-sm"
            >
              Back to Catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate initials for photo fallback
  const getInitials = (name: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Canonical works list: an author's published bibliography exists independently of community copies
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
      const matchCat = selectedCategory === 'All' || w.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        w.title.toLowerCase().includes(q) ||
        (w.synopsis && w.synopsis.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [catalogWorks, selectedCategory, searchQuery]);

  // Primary action when clicking a catalogue card: navigate to the work's book details page
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
        owner: { name: '', avatar: '', distance: '' }
      });
    }
  };

  // Handle Share author link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] pb-24">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-400" />
          <span>Author profile link copied to clipboard!</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Contextual Breadcrumb & Back Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-brand font-medium transition-colors"
            >
              Catalogue
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 font-medium">Authors</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-none">
              {author.name}
            </span>
          </nav>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-brand transition-colors bg-white px-3 sm:px-4 py-1.5 rounded-full border border-slate-200/80 shadow-xs hover:border-brand/30"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            <span>Back to Books</span>
          </button>
        </div>

        {/* ─── SECTION A: Author Information Header Card ─── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-card mb-10 transition-all">
          <div className="flex flex-col md:flex-row items-start gap-6 sm:gap-8">
            {/* Author Avatar / Monogram */}
            <div className="relative flex-shrink-0 self-center md:self-start">
              {author.photo && !photoError ? (
                <img
                  src={author.photo}
                  alt={author.name}
                  onError={() => setPhotoError(true)}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl object-cover ring-4 ring-purple-50 shadow-md"
                />
              ) : (
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#3C3489] via-[#4F46E5] to-[#7C3AED] text-white flex flex-col items-center justify-center ring-4 ring-purple-50 shadow-md select-none"
                  aria-label={author.name}
                >
                  <span className="font-serif font-bold text-3xl sm:text-4xl tracking-wider">
                    {getInitials(author.name)}
                  </span>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-purple-200 mt-1">
                    Author
                  </span>
                </div>
              )}

              {/* Verified Badge Icon on Avatar */}
              {author.isVerified && (
                <div
                  className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-purple-100"
                  title="Verified Author Profile"
                >
                  <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="fill-white" />
                  </span>
                </div>
              )}
            </div>

            {/* Author Bio & Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                    {author.name}
                  </h1>

                  {author.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-brand text-xs font-semibold border border-purple-200/80">
                      <HugeiconsIcon icon={SparklesIcon} size={12} className="text-brand" />
                      <span>Verified Author</span>
                    </span>
                  )}

                  {author.nationality && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      {author.countryFlag && <span>{author.countryFlag}</span>}
                      <span>{author.nationality}</span>
                    </span>
                  )}
                </div>

                {/* Follow & Share Actions */}
                <div className="flex items-center gap-2 self-start">
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-xs ${
                      isFollowing
                        ? 'bg-purple-100 text-brand border border-purple-300'
                        : 'bg-brand text-white hover:bg-brand/90 hover:shadow-sm'
                    }`}
                  >
                    <HugeiconsIcon
                      icon={FavouriteIcon}
                      size={14}
                      className={isFollowing ? 'fill-brand text-brand' : 'text-white'}
                    />
                    <span>{isFollowing ? 'Following' : '+ Follow Author'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-full border border-slate-200 text-slate-600 hover:text-brand hover:border-brand/40 bg-white transition shadow-xs"
                    title="Share Author Profile"
                    aria-label="Share author profile"
                  >
                    <HugeiconsIcon icon={Share01Icon} size={16} />
                  </button>
                </div>
              </div>

              {/* Profession / Designation */}
              {author.profession && (
                <p className="text-sm font-medium text-slate-600 mt-1.5">
                  {author.profession}
                </p>
              )}

              {/* Metadata tags (Born, Location, Followers) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2.5">
                {author.born && (
                  <span>
                    Born <strong className="text-slate-700 font-semibold">{author.born}</strong>
                  </span>
                )}
                {author.born && author.birthPlace && <span className="text-slate-300">•</span>}
                {author.birthPlace && (
                  <span className="text-slate-600">
                    {author.birthPlace}
                  </span>
                )}
                <span className="text-slate-300">•</span>
                <span>
                  <strong className="text-slate-700 font-semibold">{catalogWorks.length}</strong> {catalogWorks.length === 1 ? 'work' : 'works'} in catalogue
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  <strong className="text-slate-700 font-semibold">{totalCommunityCopies}</strong> community {totalCommunityCopies === 1 ? 'copy' : 'copies'} circulating
                </span>
                {author.followersCount !== undefined && author.followersCount > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>
                      <strong className="text-slate-700 font-semibold">
                        {author.followersCount + (isFollowing ? 1 : 0)}
                      </strong> readers following
                    </span>
                  </>
                )}
              </div>

              {/* Biography Section */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                {author.bio ? (
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
                    {author.bio}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Biographical details for this author are currently being curated by the BookCircle community.
                  </p>
                )}
              </div>

              {/* Literary Achievements / Awards */}
              {author.literaryAchievements && author.literaryAchievements.length > 0 && (
                <div className="mt-4 pt-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <HugeiconsIcon icon={Award01Icon} size={14} className="text-amber-500" />
                    <span>Literary Achievements & Recognition</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {author.literaryAchievements.map((achievement, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{achievement}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Links Footer */}
              {author.websiteUrl && (
                <div className="mt-4 pt-3 flex items-center gap-3">
                  <a
                    href={author.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80 hover:underline transition-colors"
                  >
                    <HugeiconsIcon icon={Globe02Icon} size={14} />
                    <span>Official Author Website ↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── SECTION B: Published Books Catalogue ─── */}
        <div>
          {/* Section Heading & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Published Works by {author.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-bold font-mono">
                  {filteredWorks.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore published bibliography. Click 'Explore Copies' to view community copies circulating nearby.
              </p>
            </div>

            {/* Filter toolbar if works exist */}
            {catalogWorks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search in Author's works */}
                <div className="relative min-w-[200px] sm:w-60">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${author.name.split(' ')[0]}'s works...`}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-slate-200/90 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Categories */}
                {availableCategories.length > 2 && (
                  <div className="flex items-center gap-1 overflow-x-auto py-1">
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Book Catalogue Cards Grid */}
          {filteredWorks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredWorks.map((work) => (
                <BookCatalogueCard
                  key={work.id}
                  work={work}
                  onSelectWork={handleSelectWork}
                />
              ))}
            </div>
          ) : (
            /* ─── SECTION C: Empty State ─── */
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/90 shadow-card">
              <div className="w-16 h-16 bg-purple-50 text-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon icon={BookOpen01Icon} size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-800 mb-2">
                {catalogWorks.length === 0
                  ? `No published works by ${author.name} are currently in the catalogue`
                  : 'No published works match your search filter'}
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                {catalogWorks.length === 0
                  ? `Be the first neighbor to list a book by ${author.name} on your shelf for lending or donation!`
                  : 'Try clearing your search query or choosing another category to see available works.'}
              </p>
              {catalogWorks.length === 0 ? (
                onOpenAddBook && (
                  <button
                    type="button"
                    onClick={onOpenAddBook}
                    className="px-6 py-2.5 rounded-full bg-brand text-white font-medium hover:bg-brand/90 transition shadow-sm text-sm"
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
                  className="px-5 py-2 rounded-full border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

