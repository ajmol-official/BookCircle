export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  displayName: string;
  avatar: string;
  location: string;
  bio?: string;
  memberSince: string;
  trustScore: number;
  lendsCount: number;
  borrowsCount: number;
  authProvider: 'google' | 'phone' | 'demo' | 'email';
  favoriteGenres: string[];
  isProfileComplete: boolean;
  wishlist?: string[];
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    whatsapp: boolean;
  };
}

export interface AuthSession {
  user: User;
  token: string;
  createdAt: number;
  expiresAt: number;
}

export interface PhoneOtpVerification {
  verificationId: string;
  phoneNumber: string;
  countryCode: string;
  formattedNumber: string;
  expiresAt: number;
  testCode?: string; // Included when running without live WhatsApp provider credentials
}

export interface AuthPromptContext {
  title?: string;
  message: string;
  targetAction?: 'borrow' | 'claim' | 'add-book' | 'messages' | 'requests' | 'my-books' | 'profile' | 'general';
  bookTitle?: string;
  ownerName?: string;
  onAuthorized?: () => void;
}
