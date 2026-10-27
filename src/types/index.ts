export interface Book {
  id: string;
  catalogId?: string; // Canonical Unique Book Title ID for shared reviews and ratings
  title: string;
  author: string;
  coverImage: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  ownersCount: number;
  category: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
  status: 'available' | 'lent_out' | 'donation';
  ownerName: string;
  ownerAvatar: string;
  ownerTrust: string;
  description?: string;
  condition?: 'Like New' | 'Very Good' | 'Good' | 'Fair';
  availabilityMode?: 'lending' | 'donation';
  bookType?: 'Original Copy' | 'Translated Copy';
}

export interface CatalogBook {
  id: string; // Unique Book ID (e.g. 'the-god-of-small-things')
  title: string;
  author: string;
  coverImage: string;
  rating: number;
  reviewsCount: number;
  category: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
  synopsis: string;
  existingOwners: {
    name: string;
    avatar: string;
    condition: string;
    distance?: string;
  }[];
}

export interface Reader {
  id: string;
  name: string;
  avatar: string;
  distance: string;
  location?: string;
  memberSince: string;
  booksAvailable: number;
  booksForLending?: number;
  booksForDonation?: number;
  lentOutCount?: number;
  dueSoon?: number;
  rating: number;
  totalBorrows: number;
  trustTier?: string;
  trustScore?: string;
  bio?: string;
  favoriteGenres?: string[];
  verified?: boolean;
}

