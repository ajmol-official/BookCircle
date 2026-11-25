import type { Book } from '../types';

/**
 * Returns true if a book should appear in public community discovery surfaces
 * (Home Nearby, Search, Browse Books, Writers/Authors directories, and borrowable copy lists).
 *
 * Books in a user's Personal Bookshelf ('personal' / [PERSONAL_COLLECTION]) remain excluded
 * from discovery and are shown solely on the owner's shelf and direct profile visits.
 */
export function isPublicDiscoveryBook(book: Book): boolean {
  if (book.availabilityMode === 'personal') return false;
  if (book.status === 'claimed') return false;

  if (
    book.description &&
    (book.description.includes('[PERSONAL_COLLECTION]') ||
      book.description.includes('[PRIVATE_COLLECTION]') ||
      book.description.includes('[STRICTLY_PRIVATE]'))
  ) {
    return false;
  }

  return true;
}
