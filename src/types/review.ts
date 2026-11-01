export interface Review {
  id: string;
  bookCatalogId: string; // Canonical title ID or book ID
  bookTitle?: string;
  userId?: string; // ID of the reviewer (if registered)
  author: string; // Reviewer display name
  avatar: string; // Reviewer avatar image
  rating: number; // 1 to 5 stars
  title?: string; // Optional review headline/title
  text: string; // Full review content
  date: string; // Human relative date (e.g., "2 weeks ago")
  createdAt: string; // ISO 8601 timestamp for strict sorting
  upvotesCount: number; // Total helpful upvotes
  upvotedBy: string[]; // List of user IDs who upvoted this review
  verifiedReader?: boolean; // Has borrowed or shared books in BookCircle
}

export type ReviewSortOption =
  | 'helpful'
  | 'newest'
  | 'oldest'
  | 'highest_rated'
  | 'lowest_rated';

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  total: number;
  average: number;
}

export interface ReviewFilterOptions {
  rating?: number | null; // 1 to 5, or null for all
  searchQuery?: string;
  sortBy?: ReviewSortOption;
  limit?: number;
  offset?: number;
}

