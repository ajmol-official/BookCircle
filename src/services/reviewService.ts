import type { Review, ReviewFilterOptions, RatingDistribution, ReviewSortOption } from '../types/review';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY_REVIEWS = 'bookcircle_reviews_v1';
const STORAGE_KEY_UPVOTES = 'bookcircle_review_upvotes_v1';

/**
 * Seed canonical reviews for top community books so readers have rich, realistic
 * reviews to explore, sort, and upvote immediately.
 */
const INITIAL_SEEDED_REVIEWS: Review[] = [
  // ─── The God of Small Things (arundhati-roy) ───
  {
    id: 'rev-god-1',
    bookCatalogId: 'the-god-of-small-things',
    bookTitle: 'The God of Small Things',
    userId: 'user-hana',
    author: 'Hana Yamada',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    title: 'A lyrical masterpiece about the weight of social borders',
    text: 'Tender and sprawling. I underlined whole paragraphs and passed it to my mother the moment I finished. Roy captures the fragile geography of childhood in Kerala better than anyone I have ever read. The language itself is alive, musical, and devastating.',
    date: '2 weeks ago',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    upvotesCount: 38,
    upvotedBy: ['demo-neighbor-1', 'demo-neighbor-2', 'demo-neighbor-3'],
    verifiedReader: true,
  },
  {
    id: 'rev-god-2',
    bookCatalogId: 'the-god-of-small-things',
    bookTitle: 'The God of Small Things',
    userId: 'user-oliver',
    author: 'Oliver West',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    title: 'Demands patience, but the final hundred pages shatter you',
    text: 'A patient book that rewards patient reading. The middle section dragged slightly on my first read, but as the pieces converge, the ending hits with unbearable force. The "Love Laws" theme resonates long after the last page.',
    date: '1 month ago',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    upvotesCount: 24,
    upvotedBy: ['demo-neighbor-1'],
    verifiedReader: true,
  },
  {
    id: 'rev-god-3',
    bookCatalogId: 'the-god-of-small-things',
    bookTitle: 'The God of Small Things',
    userId: 'user-fatima',
    author: 'Fatima Noor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    title: 'Sensory and heartbreaking — read this slowly',
    text: 'History as tenderness. I read this on a quiet weekend in Primrose Hill. The humidity, the river, the pickle factory — you can practically smell Ayemenem on every page. One of the finest Booker winners ever written.',
    date: '2 months ago',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    upvotesCount: 19,
    upvotedBy: [],
    verifiedReader: false,
  },
  {
    id: 'rev-god-4',
    bookCatalogId: 'the-god-of-small-things',
    bookTitle: 'The God of Small Things',
    userId: 'user-marcus',
    author: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    title: 'Extraordinary prose, though non-linear structure takes effort',
    text: 'Roy weaves past, present, and tragic future freely. Once you surrender to the rhythm and realize that the tragedy is revealed at the beginning, you can focus on the tender human relationships.',
    date: '3 months ago',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    upvotesCount: 14,
    upvotedBy: [],
    verifiedReader: true,
  },
  {
    id: 'rev-god-5',
    bookCatalogId: 'the-god-of-small-things',
    bookTitle: 'The God of Small Things',
    userId: 'user-chloe',
    author: 'Chloe Dupont',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    title: 'Poetic and intensely atmospheric',
    text: 'A profound exploration of caste, colonialism, and familial guilt. Estha and Rahel will stay with me for decades. Borrowed from my neighbor Arif and returned in pristine condition.',
    date: '4 months ago',
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    upvotesCount: 9,
    upvotedBy: [],
    verifiedReader: true,
  },
  {
    id: 'rev-god-6',
    bookCatalogId: 'the-god-of-small-things',
    bookTitle: 'The God of Small Things',
    userId: 'user-samuel',
    author: 'Samuel Kalu',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    rating: 3,
    title: 'Beautiful language, but emotionally exhausting',
    text: 'The prose is undeniably poetic, but the relentless impending doom makes for a heavy emotional investment. Recommended when you are in the mood for serious, somber literary fiction.',
    date: '5 months ago',
    createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
    upvotesCount: 7,
    upvotedBy: [],
    verifiedReader: false,
  },

  // ─── The Night Circus (erin-morgenstern) ───
  {
    id: 'rev-circus-1',
    bookCatalogId: 'the-night-circus',
    bookTitle: 'The Night Circus',
    userId: 'user-maya',
    author: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    title: 'Pure enchantment from the opening sentence',
    text: 'The circus arrives without warning. It is simply there, when yesterday it was not. Morgenstern weaves an intoxicating world of monochrome tents, ice gardens, and clockwork magic. Reading it felt like falling into a warm dream.',
    date: '3 weeks ago',
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    upvotesCount: 42,
    upvotedBy: ['demo-neighbor-1', 'demo-neighbor-2'],
    verifiedReader: true,
  },
  {
    id: 'rev-circus-2',
    bookCatalogId: 'the-night-circus',
    bookTitle: 'The Night Circus',
    userId: 'user-tariq',
    author: 'Tariq Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    title: 'Atmosphere over plot, and I wouldn’t change a thing',
    text: 'If you want a fast-paced thriller, this is not it. If you want to savor cloud mazes, scent of caramel and bonfire, and subtle romantic tension stretching across decades, pick this up immediately.',
    date: '1 month ago',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    upvotesCount: 29,
    upvotedBy: [],
    verifiedReader: true,
  },
  {
    id: 'rev-circus-3',
    bookCatalogId: 'the-night-circus',
    bookTitle: 'The Night Circus',
    userId: 'user-elena',
    author: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    title: 'Gorgeous imagery and unforgettable setting',
    text: 'The Le Cirque des Rêves is the true main character here. Marco and Celia’s duel is more artistic collaboration than combat. Beautifully written and comforting.',
    date: '2 months ago',
    createdAt: new Date(Date.now() - 65 * 86400000).toISOString(),
    upvotesCount: 16,
    upvotedBy: [],
    verifiedReader: false,
  },

  // ─── Pachinko (min-jin-lee) ───
  {
    id: 'rev-pachinko-1',
    bookCatalogId: 'pachinko',
    bookTitle: 'Pachinko',
    userId: 'user-samira',
    author: 'Samira Khan',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    title: 'An epic that redefines the immigrant family saga',
    text: '“History has failed us, but no matter.” From the very first sentence, Min Jin Lee commands your attention across four generations of a Zainichi Korean family. Sunja is an unforgettable matriarch.',
    date: '1 week ago',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    upvotesCount: 51,
    upvotedBy: ['demo-neighbor-1'],
    verifiedReader: true,
  },
  {
    id: 'rev-pachinko-2',
    bookCatalogId: 'pachinko',
    bookTitle: 'Pachinko',
    userId: 'user-david',
    author: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    title: 'Sprawling, dignified, and emotionally honest',
    text: 'It manages to be sweeping in historical scope yet intensely intimate in emotional detail. The characters make difficult, compromises to survive in Osaka. Easily one of the top five novels of the 21st century.',
    date: '3 weeks ago',
    createdAt: new Date(Date.now() - 24 * 86400000).toISOString(),
    upvotesCount: 33,
    upvotedBy: [],
    verifiedReader: true,
  },
  {
    id: 'rev-pachinko-3',
    bookCatalogId: 'pachinko',
    bookTitle: 'Pachinko',
    userId: 'user-anna',
    author: 'Anna Bergström',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    title: 'Immersive and deeply educational',
    text: 'Taught me so much about a chapter of history I knew little about. The pacing in the final third moves quickly across decades, but Sunja’s strength anchors the entire narrative.',
    date: '2 months ago',
    createdAt: new Date(Date.now() - 55 * 86400000).toISOString(),
    upvotesCount: 18,
    upvotedBy: [],
    verifiedReader: false,
  },
];

/**
 * Normalizes a book reference to its canonical catalog key
 * (e.g., 'avail-1' -> 'the-god-of-small-things' if mapped, or title slug).
 */
export function normalizeCatalogKey(bookIdentifier: string): string {
  if (!bookIdentifier) return 'general';
  const clean = bookIdentifier.toLowerCase().trim();

  // Known copy mappings
  if (clean === 'avail-1' || clean === 'book-1' || clean.includes('god-of-small')) {
    return 'the-god-of-small-things';
  }
  if (clean === 'avail-2' || clean === 'book-2' || clean.includes('circus')) {
    return 'the-night-circus';
  }
  if (clean === 'avail-3' || clean === 'book-3' || clean.includes('sea-the-sea')) {
    return 'the-sea-the-sea';
  }
  if (clean.includes('pachinko')) {
    return 'pachinko';
  }

  // Slugify arbitrary title
  return clean.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * ReviewService manages reading, writing, filtering, sorting, and upvoting
 * reviews with full offline/session persistence and Supabase synchronization.
 */
class ReviewService {
  private memoryReviews: Review[] = [];
  private memoryUpvotes: Record<string, string[]> = {}; // reviewId -> userId[]
  private isLoaded = false;

  private loadFromStorage() {
    if (this.isLoaded) return;
    try {
      const storedReviews = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (storedReviews) {
        this.memoryReviews = JSON.parse(storedReviews);
      } else {
        this.memoryReviews = [...INITIAL_SEEDED_REVIEWS];
        localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(this.memoryReviews));
      }

      const storedUpvotes = localStorage.getItem(STORAGE_KEY_UPVOTES);
      if (storedUpvotes) {
        this.memoryUpvotes = JSON.parse(storedUpvotes);
      } else {
        // Initialize from initial reviews
        this.memoryUpvotes = {};
        for (const rev of this.memoryReviews) {
          this.memoryUpvotes[rev.id] = [...rev.upvotedBy];
        }
        localStorage.setItem(STORAGE_KEY_UPVOTES, JSON.stringify(this.memoryUpvotes));
      }
    } catch (e) {
      console.warn('Failed to load reviews from localStorage, falling back to memory seed:', e);
      this.memoryReviews = [...INITIAL_SEEDED_REVIEWS];
    }
    this.isLoaded = true;
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(this.memoryReviews));
      localStorage.setItem(STORAGE_KEY_UPVOTES, JSON.stringify(this.memoryUpvotes));
    } catch (e) {
      console.warn('Failed to save reviews to localStorage:', e);
    }
  }

  /**
   * Get reviews for a specific canonical book title with optional filtering and sorting
   */
  async getReviews(
    bookIdentifier: string,
    options: ReviewFilterOptions = {}
  ): Promise<{ reviews: Review[]; total: number; hasMore: boolean }> {
    this.loadFromStorage();
    const catalogKey = normalizeCatalogKey(bookIdentifier);

    // 1. Filter by book
    let list = this.memoryReviews.filter(
      (r) =>
        r.bookCatalogId === catalogKey ||
        normalizeCatalogKey(r.bookCatalogId) === catalogKey
    );

    // If zero reviews for an unknown book, check if it matches by title slug
    if (list.length === 0) {
      list = this.memoryReviews.filter(
        (r) => r.bookTitle && normalizeCatalogKey(r.bookTitle) === catalogKey
      );
    }

    // 2. Filter by star rating
    if (options.rating !== undefined && options.rating !== null) {
      list = list.filter((r) => r.rating === options.rating);
    }

    // 3. Filter by search query
    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.text.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          r.author.toLowerCase().includes(q)
      );
    }

    // 4. Sort
    const sortBy: ReviewSortOption = options.sortBy || 'helpful';
    list = [...list].sort((a, b) => {
      if (sortBy === 'helpful') {
        // Most Helpful: upvotes DESC, then newest first
        if (b.upvotesCount !== a.upvotesCount) {
          return b.upvotesCount - a.upvotesCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'highest_rated') {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return b.upvotesCount - a.upvotesCount;
      }
      if (sortBy === 'lowest_rated') {
        if (a.rating !== b.rating) {
          return a.rating - b.rating;
        }
        return b.upvotesCount - a.upvotesCount;
      }
      return 0;
    });

    const total = list.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const paginated = list.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return { reviews: paginated, total, hasMore };
  }

  /**
   * Get overall rating breakdown & distribution for a book
   */
  async getRatingDistribution(bookIdentifier: string): Promise<RatingDistribution> {
    this.loadFromStorage();
    const catalogKey = normalizeCatalogKey(bookIdentifier);

    let list = this.memoryReviews.filter(
      (r) =>
        r.bookCatalogId === catalogKey ||
        normalizeCatalogKey(r.bookCatalogId) === catalogKey
    );

    if (list.length === 0) {
      list = this.memoryReviews.filter(
        (r) => r.bookTitle && normalizeCatalogKey(r.bookTitle) === catalogKey
      );
    }

    const dist: RatingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
      total: list.length,
      average: 5.0,
    };

    if (list.length === 0) {
      return dist;
    }

    let sum = 0;
    for (const r of list) {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      dist[rounded] = (dist[rounded] || 0) + 1;
      sum += r.rating;
    }

    dist.average = Number((sum / list.length).toFixed(1));
    return dist;
  }

  /**
   * Check if user has upvoted a specific review
   */
  hasUserUpvoted(reviewId: string, userId: string): boolean {
    this.loadFromStorage();
    const upvoters = this.memoryUpvotes[reviewId] || [];
    return upvoters.includes(userId);
  }

  /**
   * Toggle an upvote on a review.
   * Enforces:
   * 1. Cannot upvote own review.
   * 2. Cannot double-upvote (toggles between upvoted and not).
   * 3. Syncs across sessions.
   */
  async toggleUpvote(
    reviewId: string,
    userId: string
  ): Promise<{ review: Review; isUpvoted: boolean }> {
    this.loadFromStorage();

    const reviewIndex = this.memoryReviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) {
      throw new Error(`Review not found: ${reviewId}`);
    }

    const review = this.memoryReviews[reviewIndex];

    // Safeguard: Prevent upvoting own review
    if (review.userId && review.userId === userId) {
      throw new Error('You cannot upvote your own review.');
    }

    const currentUpvoters = this.memoryUpvotes[reviewId] || [];
    const alreadyUpvoted = currentUpvoters.includes(userId);

    let updatedUpvoters: string[];
    let newCount: number;

    if (alreadyUpvoted) {
      // Remove upvote
      updatedUpvoters = currentUpvoters.filter((id) => id !== userId);
      newCount = Math.max(0, review.upvotesCount - 1);
    } else {
      // Add upvote
      updatedUpvoters = [...currentUpvoters, userId];
      newCount = review.upvotesCount + 1;
    }

    this.memoryUpvotes[reviewId] = updatedUpvoters;
    const updatedReview: Review = {
      ...review,
      upvotesCount: newCount,
      upvotedBy: updatedUpvoters,
    };

    this.memoryReviews[reviewIndex] = updatedReview;
    this.saveToStorage();

    // Non-blocking background attempt Supabase synchronization if configured
    if (isSupabaseConfigured()) {
      const syncAction = alreadyUpvoted
        ? supabase.from('review_upvotes').delete().eq('review_id', reviewId).eq('user_id', userId)
        : supabase.from('review_upvotes').insert({ review_id: reviewId, user_id: userId });
      
      Promise.resolve(syncAction).catch((err) => {
        console.warn('Supabase upvote sync skipped or offline:', err);
      });
    }

    return { review: updatedReview, isUpvoted: !alreadyUpvoted };
  }

  /**
   * Submit a new review for a book
   */
  async addReview(params: {
    bookCatalogId: string;
    bookTitle?: string;
    userId?: string;
    author: string;
    avatar?: string;
    rating: number;
    title?: string;
    text: string;
  }): Promise<Review> {
    this.loadFromStorage();

    const catalogKey = normalizeCatalogKey(params.bookCatalogId);
    const newId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newReview: Review = {
      id: newId,
      bookCatalogId: catalogKey,
      bookTitle: params.bookTitle,
      userId: params.userId || 'guest-user',
      author: params.author || 'Community Reader',
      avatar:
        params.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      rating: Math.max(1, Math.min(5, params.rating)),
      title: params.title?.trim() || undefined,
      text: params.text.trim(),
      date: 'Just now',
      createdAt: new Date().toISOString(),
      upvotesCount: 0,
      upvotedBy: [],
      verifiedReader: true,
    };

    this.memoryReviews.unshift(newReview);
    this.memoryUpvotes[newId] = [];
    this.saveToStorage();

    // Async sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('reviews').insert({
          id: newId,
          book_catalog_id: catalogKey,
          user_id: params.userId || null,
          author_name: newReview.author,
          author_avatar: newReview.avatar,
          rating: newReview.rating,
          title: newReview.title || null,
          text: newReview.text,
          upvotes_count: 0,
        });
      } catch (err) {
        console.warn('Supabase review insert skipped or offline:', err);
      }
    }

    return newReview;
  }
}

export const reviewService = new ReviewService();

