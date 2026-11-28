import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import type { Review } from '../../types/review';
import { reviewService, normalizeCatalogKey } from '../../services/reviewService';
import { ReviewModal } from './ReviewModal';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { cleanAvatarUrl } from '../../utils/avatarUtils';
import { isPublicDiscoveryBook } from '../../utils/bookVisibility';
import { BookHeroCard } from './BookHeroCard';
import { NearbyReadersSection } from './NearbyReadersSection';
import { CommunityReviewsSection } from './CommunityReviewsSection';
import type { FormattedCopy } from './ReaderCopyCard';

interface BookDetailsPageProps {
  book: Book;
  communityCopies?: Book[];
  onBack?: () => void;
  onRequestBorrow: (book: Book, ownerName?: string) => void;
  onSelectOwner?: (ownerName: string) => void;
  onSelectAuthor?: (authorName: string, authorId?: string) => void;
  onSimulateReturn?: (book: Book) => void;
  onOpenAddBook?: (book?: Book) => void;
}

// Sample reader profiles matching Figma node 371:70 demonstration
const DEMO_OWNER_PROFILES: Array<{
  name: string;
  avatar: string;
  distance: string;
  condition: NonNullable<Book['condition']>;
  status: 'available' | 'donation' | 'lent_out' | 'claimed';
  mode: 'borrow' | 'donation';
}> = [
  { name: 'Kristin Watson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', distance: '2.1 km away', condition: 'Like New', status: 'available', mode: 'borrow' },
  { name: 'Cody Fisher', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', distance: '2.1 km away', condition: 'Like New', status: 'available', mode: 'borrow' },
  { name: 'Robert Fox', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', distance: '4.2 km away', condition: 'Like New', status: 'donation', mode: 'donation' },
  { name: 'Brooklyn Simmons', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', distance: '2.1 km away', condition: 'Like New', status: 'available', mode: 'borrow' },
  { name: 'Devon Lane', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200', distance: '4.2 km away', condition: 'Like New', status: 'donation', mode: 'donation' },
  { name: 'Marvin McKinney', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', distance: '3.5 km away', condition: 'Very Good', status: 'lent_out', mode: 'borrow' },
  { name: 'Bessie Cooper', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', distance: '4.8 km away', condition: 'Good', status: 'claimed', mode: 'borrow' },
];

export const BookDetailsPage: React.FC<BookDetailsPageProps> = ({
  book,
  communityCopies,
  onRequestBorrow,
  onSelectOwner,
  onSelectAuthor,
  onOpenAddBook
}) => {
  const navigate = useNavigate();
  const { currentUser, toggleWishlist, isWishlisted } = useAuth();
  const bookWishlisted = isWishlisted(book.id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Wishlist count
  const baseCount = book.wishlistCount || 8;
  const currentWishlistCount = bookWishlisted ? baseCount + 1 : baseCount;

  const handleToggleWishlist = () => {
    const added = toggleWishlist(book.id);
    setToastMessage(added ? '❤️ Saved to your Wishlist!' : 'Removed from your Wishlist.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Share book handler (native share + clipboard fallback)
  const handleShareBook = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${book.title} - BookCircle`,
      text: `Discover "${book.title}" by ${book.author} on BookCircle!`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setToastMessage('Book link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage('Link ready to share!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Reviews Loading
  const catalogKey = useMemo(() => {
    return normalizeCatalogKey(book.catalogId || book.title || book.id);
  }, [book]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number>(book.reviewsCount || 54);

  const loadReviews = useCallback(async () => {
    try {
      const [res, dist] = await Promise.all([
        reviewService.getReviews(catalogKey, { sortBy: 'helpful', limit: 3 }),
        reviewService.getRatingDistribution(catalogKey),
      ]);
      setReviews(res.reviews);
      setTotalReviewsCount(dist.total > 0 ? dist.total : (book.reviewsCount || 54));
    } catch (e) {
      console.warn('Failed to load reviews in details page:', e);
    }
  }, [catalogKey, book.reviewsCount]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleNewReview = async (newRev: { author: string; rating: number; text: string }) => {
    try {
      await reviewService.addReview({
        bookCatalogId: catalogKey,
        bookTitle: book.title,
        userId: currentUser?.id,
        author: newRev.author,
        avatar: currentUser?.avatar,
        rating: newRev.rating,
        text: newRev.text,
      });
      setToastMessage('Review published to the community shelf!');
      setTimeout(() => setToastMessage(null), 3500);
      await loadReviews();
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  // Map community physical copies matching Figma states (strictly excluding Personal Bookshelf items)
  const resolvedCopies: FormattedCopy[] = useMemo(() => {
    const publicCopies = (communityCopies || []).filter(isPublicDiscoveryBook);

    // If real community copies are available, map them with their authentic availability status
    if (publicCopies.length > 0) {
      return publicCopies.slice(0, 7).map((copy, idx) => {
        const isDonation = copy.status === 'donation' || copy.availabilityMode === 'donation';
        const isLentOut = copy.status === 'lent_out';
        const isClaimed = copy.status === 'claimed';

        const status = isClaimed
          ? 'claimed'
          : isLentOut
          ? 'lent_out'
          : isDonation
          ? 'donation'
          : 'available';

        return {
          id: copy.id || `copy-${idx}`,
          copyId: copy.id || `copy-${idx}`,
          name: copy.ownerName || 'Neighbor',
          avatar: cleanAvatarUrl(copy.ownerAvatar),
          distance: copy.distance || 'Nearby',
          memberSince: '2025',
          condition: (copy.condition || 'Like New') as NonNullable<Book['condition']>,
          status,
          availabilityMode: isDonation ? 'donation' : 'borrow',
          bookCopy: {
            ...copy,
            condition: (copy.condition || 'Like New') as NonNullable<Book['condition']>,
            status: isDonation ? 'donation' : copy.status
          }
        };
      });
    }

    // When backed by live Supabase or inspecting a Personal Bookshelf work with 0 borrowable copies,
    // show the honest empty state ("No community copies available yet.") instead of fake demo profiles.
    if (isSupabaseConfigured() || book.availabilityMode === 'personal') {
      return [];
    }

    // Default demonstration copies for offline/demo catalog previews
    return DEMO_OWNER_PROFILES.map((demo, idx) => ({
      id: `${book.id}-demo-${idx}`,
      copyId: `${book.id}-demo-${idx}`,
      name: demo.name,
      avatar: demo.avatar,
      distance: demo.distance,
      memberSince: '2025',
      condition: demo.condition,
      status: demo.status,
      availabilityMode: demo.mode,
      bookCopy: {
        ...book,
        id: `${book.id}-copy-${idx}`,
        ownerName: demo.name,
        ownerAvatar: demo.avatar,
        distance: demo.distance,
        condition: demo.condition,
        status: demo.status === 'donation' ? 'donation' : 'available'
      }
    }));
  }, [communityCopies, book]);

  const availableCopiesCount = resolvedCopies.filter(
    (c) => c.status === 'available' || c.status === 'donation'
  ).length;

  return (
    <div className="pt-3 sm:pt-6 pb-6 sm:pb-20 animate-in fade-in duration-200 max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      <div className="fixed top-20 sm:top-24 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-medium shadow-2xl border border-slate-700/80 flex items-center gap-2.5 max-w-md text-center"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 1. Main Book Hero Card (Canonical Work) */}
      <BookHeroCard
        book={book}
        copiesCount={availableCopiesCount}
        countryCopiesCount={1253}
        wishlistCount={currentWishlistCount}
        isWishlisted={bookWishlisted}
        onToggleWishlist={handleToggleWishlist}
        onSelectAuthor={onSelectAuthor}
        onShare={handleShareBook}
      />

      {/* 2. Available from nearby readers Section (Physical Copies Grid) */}
      <NearbyReadersSection
        copies={resolvedCopies}
        book={book}
        onRequestBorrow={onRequestBorrow}
        onSelectOwner={onSelectOwner}
        onOpenAddBook={onOpenAddBook}
      />

      {/* 3. Community reviews Section (Stacked Cards & Action in Header) */}
      <CommunityReviewsSection
        reviews={reviews}
        totalReviewsCount={totalReviewsCount}
        bookId={book.id}
        onOpenReviewModal={() => setIsReviewModalOpen(true)}
        onViewAllReviews={() => navigate(`/book/${book.id}/reviews`)}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        bookTitle={book.title}
        onReviewSubmitted={handleNewReview}
      />
    </div>
  );
};

export default BookDetailsPage;
