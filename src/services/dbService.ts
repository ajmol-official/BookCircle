import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockBooks, mockReaders } from '../data/mockData';
import type { Book, Reader } from '../types';

export const dbService = {
  /**
   * Fetch all books (from Supabase if configured, otherwise fallback to local/mock)
   */
  async getBooks(): Promise<Book[]> {
    if (!isSupabaseConfigured()) {
      return mockBooks;
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, using fallback books:', error.message);
        return mockBooks;
      }

      if (!data || data.length === 0) {
        return mockBooks;
      }

      // Map Supabase snake_case fields to frontend camelCase Book type
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        author: item.author,
        coverImage: item.cover_image,
        rating: Number(item.rating) || 4.8,
        reviewsCount: item.reviews_count || 0,
        distance: item.distance || 'Nearby',
        ownersCount: item.owners_count || 1,
        category: item.category || 'Fiction',
        status: item.status || 'available',
        ownerName: item.owner_name || 'Neighbor',
        ownerAvatar: item.owner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        ownerTrust: 'Verified Neighbor',
        description: item.description,
        condition: item.condition || 'Like New',
        availabilityMode: (item.availability_mode || 'lending') as 'lending' | 'donation' | 'personal',
      }));
    } catch (err) {
      console.warn('Network error accessing Supabase, using mock fallback:', err);
      return mockBooks;
    }
  },

  /**
   * Fetch all readers / neighbor profiles
   */
  async getReaders(): Promise<Reader[]> {
    if (!isSupabaseConfigured()) {
      return mockReaders;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return mockReaders;
      }

      return data.map((item: any) => ({
        id: item.id,
        name: item.full_name,
        avatar: item.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
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
    } catch {
      return mockReaders;
    }
  },

  /**
   * Add a new book listing
   */
  async addBook(book: Omit<Book, 'id'>, userId?: string): Promise<Book> {
    if (!isSupabaseConfigured()) {
      const newBook: Book = {
        ...book,
        id: `book-${Date.now()}`
      };
      return newBook;
    }

    try {
      const { data, error } = await supabase
        .from('books')
        .insert({
          title: book.title,
          author: book.author,
          cover_image: book.coverImage,
          category: book.category,
          condition: book.condition,
          availability_mode: book.availabilityMode,
          status: book.status,
          description: book.description,
          owner_name: book.ownerName,
          owner_avatar: book.ownerAvatar,
          owner_id: userId || null,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Failed to insert book');
      }

      return {
        ...book,
        id: data.id,
      };
    } catch (err) {
      console.error('Error inserting book into Supabase:', err);
      return {
        ...book,
        id: `book-${Date.now()}`
      };
    }
  },

  /**
   * Update a book's availability status (For Lending, For Donation, Private Collection)
   */
  async updateBookStatus(
    bookId: string,
    newMode: 'lending' | 'donation' | 'personal'
  ): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const newStatus = newMode === 'donation' ? 'donation' : 'available';
      await supabase
        .from('books')
        .update({
          availability_mode: newMode,
          status: newStatus,
        })
        .eq('id', bookId);
    } catch (err) {
      console.warn('Could not update book status in Supabase:', err);
    }
  },

  /**
   * Permanently delete a book listing
   */
  async deleteBook(bookId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      await supabase
        .from('books')
        .delete()
        .eq('id', bookId);
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

