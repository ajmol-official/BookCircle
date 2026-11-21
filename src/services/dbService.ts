import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockBooks, mockReaders } from '../data/mockData';
import type { Book, Reader, UserReadingStatusValue } from '../types';
import { cleanAvatarUrl } from '../utils/avatarUtils';

function cleanDescription(desc?: string): string {
  if (!desc) return '';
  return desc.replace(/\[PERSONAL_COLLECTION\]\s*/g, '').replace(/\[PRIVATE_COLLECTION\]\s*/g, '').trim();
}

function mapDbBookToBook(item: any): Book {
  const isPersonal =
    (item.description && (item.description.includes('[PRIVATE_COLLECTION]') || item.description.includes('[PERSONAL_COLLECTION]'))) ||
    item.availability_mode === 'personal';

  return {
    id: item.id,
    catalogId: item.catalog_id || undefined,
    title: item.title,
    author: item.author,
    coverImage: item.cover_image,
    rating: Number(item.rating) || 4.8,
    reviewsCount: item.reviews_count || 0,
    distance: item.distance || 'Nearby',
    ownersCount: item.owners_count || 1,
    category: item.category || 'Fiction',
    status: item.status || 'available',
    ownerId: item.owner_id || undefined,
    ownerName: item.owner_name || 'Neighbor',
    ownerAvatar: cleanAvatarUrl(item.owner_avatar),
    ownerTrust: 'Verified Neighbor',
    description: cleanDescription(item.description),
    condition: item.condition || 'Like New',
    availabilityMode: isPersonal ? 'personal' : ((item.availability_mode || 'lending') as 'lending' | 'donation' | 'personal'),
    bookClassification: item.book_classification || 'general',
    generalType: item.general_type || 'original',
    translator: item.translator || undefined,
    translationLanguage: item.translation_language || undefined,
    edition: item.edition || undefined,
    educationLevel: item.education_level || undefined,
    academicMetadata: item.academic_metadata || undefined,
  };
}

export const dbService = {
  /**
   * Fetch community discovery books.
   * Database-level privacy guard: strictly excludes personal collection and claimed donations directly via Supabase query.
   */
  async getBooks(isDemoMode: boolean = false): Promise<Book[]> {
    if (!isSupabaseConfigured()) {
      return mockBooks.filter((b) => b.status !== 'claimed');
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .neq('status', 'claimed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error loading books:', error.message);
        if (isDemoMode) {
          return mockBooks.filter((b) => b.status !== 'claimed');
        }
        throw new Error(`Database error loading books: ${error.message}`);
      }

      if (!data || data.length === 0) {
        // Authentic empty state for real database; seed mockBooks for guest demo previews
        return isDemoMode
          ? mockBooks.filter((b) => b.status !== 'claimed')
          : [];
      }

      return data.map(mapDbBookToBook);
    } catch (err: any) {
      if (isDemoMode) {
        console.warn('Network error accessing Supabase in demo mode, using mock fallback:', err);
        return mockBooks.filter((b) => b.status !== 'claimed');
      }
      throw err;
    }
  },

  /**
   * Fetch all books owned by a specific user (including their personal collection)
   */
  async getUserBooks(userId: string): Promise<Book[]> {
    if (!isSupabaseConfigured()) {
      return mockBooks.filter((b) => b.ownerName === 'You');
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map(mapDbBookToBook);
    } catch (err) {
      console.warn('Error fetching user books from Supabase:', err);
      return [];
    }
  },

  /**
   * Fetch public books for another user's profile, strictly excluding private collection at DB query level
   */
  async getPublicUserBooks(userId: string): Promise<Book[]> {
    if (!isSupabaseConfigured()) {
      return mockBooks.filter((b) => b.ownerName !== 'You' && b.availabilityMode !== 'personal' && b.status !== 'claimed');
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('owner_id', userId)
        .neq('status', 'claimed')
        .neq('availability_mode', 'personal')
        .not('description', 'like', '%[PRIVATE_COLLECTION]%')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map(mapDbBookToBook);
    } catch (err) {
      console.warn('Error fetching public user books from Supabase:', err);
      return [];
    }
  },

  /**
   * Fetch all readers / neighbor profiles
   */
  async getReaders(isDemoMode: boolean = false): Promise<Reader[]> {
    if (!isSupabaseConfigured()) {
      return mockReaders;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load reader profiles:', error.message);
        if (isDemoMode) return mockReaders;
        throw new Error(`Database error loading readers: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return isDemoMode ? mockReaders : [];
      }

      return data.map((item: any) => ({
        id: item.id,
        name: item.full_name,
        avatar: cleanAvatarUrl(item.avatar_url),
        distance: item.distance || 'Nearby',
        location: item.location,
        memberSince: item.member_since || '2024',
        booksAvailable: item.books_available || 0,
        booksForLending: item.books_for_lending || 0,
        booksForDonation: item.books_for_donation || 0,
        rating: 4.9,
        totalBorrows: item.total_borrows || 0,
        trustTier: item.trust_tier || 'Tier 1 · Novice Reader',
        trustScore: item.trust_score || '100% on schedule',
        bio: item.bio,
        verified: item.verified ?? true,
      }));
    } catch (err: any) {
      if (isDemoMode) return mockReaders;
      throw err;
    }
  },

  /**
   * In-memory reading status store for demo/offline fallback (keyed by `${userId}:${catalogId}`)
   */
  readingStatusMemory: new Map<string, UserReadingStatusValue>(),

  /**
   * Add a new book listing
   */
  async addBook(book: Omit<Book, 'id'>, userId?: string): Promise<Book> {
    const isAcademic = book.bookClassification === 'academic' || Boolean(book.educationLevel);
    const effectiveAvailability = isAcademic ? 'donation' : (book.availabilityMode || 'lending');
    const effectiveStatus = effectiveAvailability === 'donation' ? 'donation' : 'available';

    const safeBook: Omit<Book, 'id'> = {
      ...book,
      availabilityMode: effectiveAvailability,
      status: effectiveStatus,
      bookClassification: isAcademic ? 'academic' : 'general',
    };

    if (!isSupabaseConfigured()) {
      const newBook: Book = {
        ...safeBook,
        id: `book-${Date.now()}`
      };
      return newBook;
    }

    try {
      const isPersonal = safeBook.availabilityMode === 'personal';
      const fullPayload: any = {
        title: safeBook.title,
        author: safeBook.author,
        cover_image: safeBook.coverImage,
        category: safeBook.category,
        condition: safeBook.condition,
        availability_mode: safeBook.availabilityMode,
        status: safeBook.status,
        description: isPersonal && !safeBook.description?.includes('[PERSONAL_COLLECTION]')
          ? `[PERSONAL_COLLECTION] ${safeBook.description || ''}`.trim()
          : safeBook.description,
        owner_name: safeBook.ownerName,
        owner_avatar: safeBook.ownerAvatar,
        owner_id: userId || null,
        catalog_id: safeBook.catalogId || null,
        book_classification: safeBook.bookClassification,
        general_type: safeBook.generalType || 'original',
        translator: safeBook.translator || null,
        translation_language: safeBook.translationLanguage || null,
        edition: safeBook.edition || null,
        education_level: safeBook.educationLevel || null,
        academic_metadata: safeBook.academicMetadata || {},
      };

      let result = await supabase.from('books').insert(fullPayload).select().single();

      // Graceful fallback for unmigrated Supabase database schema cache or check constraints
      if (
        result.error &&
        (result.error.message.includes('schema cache') ||
          result.error.message.includes('column') ||
          result.error.message.includes('books_availability_mode_check') ||
          result.error.code === '23514')
      ) {
        // If the database check constraint does not permit 'personal' yet, fall back to 'lending' with [PERSONAL_COLLECTION] tag
        const fallbackMode =
          result.error.message.includes('books_availability_mode_check') || result.error.code === '23514'
            ? 'lending'
            : safeBook.availabilityMode;

        const basePayload = {
          title: safeBook.title,
          author: safeBook.author,
          cover_image: safeBook.coverImage,
          category: safeBook.category,
          condition: safeBook.condition,
          availability_mode: fallbackMode,
          status: safeBook.status,
          description: isPersonal && !safeBook.description?.includes('[PERSONAL_COLLECTION]')
            ? `[PERSONAL_COLLECTION] ${safeBook.description || ''}`.trim()
            : safeBook.description,
          owner_name: safeBook.ownerName,
          owner_avatar: safeBook.ownerAvatar,
          owner_id: userId || null,
        };
        result = await supabase.from('books').insert(basePayload).select().single();
      }

      if (result.error || !result.data) {
        throw new Error(result.error?.message || 'Failed to insert book');
      }

      return {
        ...safeBook,
        id: result.data.id,
      };
    } catch (err) {
      console.error('Error inserting book into Supabase:', err);
      return {
        ...safeBook,
        id: `book-${Date.now()}`
      };
    }
  },

  /**
   * Record or update user reading status for a canonical book (Non-public backend record)
   */
  async upsertReadingStatus(
    userId: string,
    catalogId: string,
    status: UserReadingStatusValue
  ): Promise<void> {
    if (!userId || !catalogId || !status) return;

    if (!isSupabaseConfigured()) {
      this.readingStatusMemory.set(`${userId}:${catalogId}`, status);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_reading_status')
        .upsert(
          {
            user_id: userId,
            catalog_id: catalogId,
            status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,catalog_id' }
        );

      if (error) {
        // Fallback to memory store if table is not yet migrated in remote Supabase
        console.warn('Could not upsert to user_reading_status table, using fallback store:', error.message);
        this.readingStatusMemory.set(`${userId}:${catalogId}`, status);
      }
    } catch (err) {
      console.warn('Network error updating reading status:', err);
      this.readingStatusMemory.set(`${userId}:${catalogId}`, status);
    }
  },

  /**
   * Search community books for catalog autocomplete
   */
  async searchCommunityBooks(query: string): Promise<Book[]> {
    if (!query || query.trim().length < 2) return [];
    const clean = query.trim().toLowerCase();

    if (!isSupabaseConfigured()) {
      return mockBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(clean) ||
          b.author.toLowerCase().includes(clean)
      );
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${clean}%,author.ilike.%${clean}%`)
        .limit(10);

      if (error || !data) return [];
      return data.map(mapDbBookToBook);
    } catch (err) {
      console.warn('Error querying community books:', err);
      return [];
    }
  },

  /**
   * Update a book's availability status (For Lending, For Donation, Private Collection)
   */
  async updateBookStatus(
    bookId: string,
    newMode: 'lending' | 'donation' | 'personal',
    userId?: string
  ): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    // Only query database if bookId is a valid UUID primary key
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId?.trim() || '')) {
      return;
    }

    try {
      const authUser = (await supabase.auth.getUser()).data.user;
      const effectiveOwnerId = userId || authUser?.id;
      const newStatus = newMode === 'donation' ? 'donation' : 'available';

      let query = supabase
        .from('books')
        .update({
          availability_mode: newMode,
          status: newStatus,
        })
        .eq('id', bookId);

      if (effectiveOwnerId) {
        query = query.eq('owner_id', effectiveOwnerId);
      }

      const { error } = await query;
      if (error) {
        console.warn('Could not update book status in Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Could not update book status in Supabase:', err);
    }
  },

  /**
   * Permanently delete a book listing
   */
  async deleteBook(bookId: string, userId?: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    // Only query database if bookId is a valid UUID primary key
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId?.trim() || '')) {
      return;
    }

    try {
      const authUser = (await supabase.auth.getUser()).data.user;
      const effectiveOwnerId = userId || authUser?.id;

      let query = supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (effectiveOwnerId) {
        query = query.eq('owner_id', effectiveOwnerId);
      }

      const { error } = await query;
      if (error) {
        console.warn('Could not delete book from Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Could not delete book from Supabase:', err);
    }
  },

  /**
   * Submit a borrow or gift claim request
   */
  async createBorrowRequest(params: {
    bookId: string;
    bookTitle?: string;
    borrowerId?: string;
    borrowerName?: string;
    ownerId?: string;
    ownerName?: string;
    exchangeType: 'borrow' | 'gift';
    meetupDate: string;
    meetupTime: string;
    meetupSpot: string;
    message?: string;
  }) {
    if (!isSupabaseConfigured()) {
      return { id: `req-${Date.now()}`, status: 'pending' };
    }

    const { data, error } = await supabase
      .from('borrow_requests')
      .insert({
        book_id: params.bookId,
        book_title: params.bookTitle,
        borrower_id: params.borrowerId || null,
        borrower_name: params.borrowerName || 'Community Reader',
        owner_id: params.ownerId || null,
        owner_name: params.ownerName || 'Book Owner',
        exchange_type: params.exchangeType,
        meetup_date: params.meetupDate,
        meetup_time: params.meetupTime,
        meetup_spot: params.meetupSpot,
        message: params.message || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating borrow request:', error);
      throw error;
    }
    return data;
  }
};

