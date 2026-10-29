/**
 * Author to Country lookup map and helper utilities for BookCircle
 */

export const AUTHOR_COUNTRY_MAP: Record<string, string> = {
  'Arundhati Roy': 'India',
  'Erin Morgenstern': 'United States',
  'Richard Powers': 'United States',
  'Min Jin Lee': 'South Korea',
  'John Williams': 'United States',
  'Cho Nam-Joo': 'South Korea',
  'Mario Puzo': 'United States',
  'Yuval Noah Harari': 'Israel',
  'Carl Sagan': 'United States',
  'Jared Diamond': 'United States',
  'Bill Bryson': 'United States',
  'Paulo Coelho': 'Brazil',
  'Susan Cain': 'United States',
  'Coleman Barks & Rumi': 'Iran',
  'Rumi': 'Iran',
  'Viktor E. Frankl': 'Austria',
  'Humayun Ahmed': 'Bangladesh',
  'Kazi Nazrul Islam': 'Bangladesh',
  'Rabindranath Tagore': 'India',
  'Tahmima Anam': 'Bangladesh',
  'Muhammad Zafar Iqbal': 'Bangladesh',
  'Jahanara Imam': 'Bangladesh',
  'Haruki Murakami': 'Japan',
  'Kazuo Ishiguro': 'Japan',
  'George Orwell': 'United Kingdom',
  'Jane Austen': 'United Kingdom',
  'J.K. Rowling': 'United Kingdom',
  'Neil Gaiman': 'United Kingdom',
  'Arthur Conan Doyle': 'United Kingdom',
  'Agatha Christie': 'United Kingdom',
  'Gabriel García Márquez': 'Colombia',
  'Leo Tolstoy': 'Russia',
  'Fyodor Dostoevsky': 'Russia',
  'Albert Camus': 'France',
  'Franz Kafka': 'Czech Republic',
  'Chimamanda Ngozi Adichie': 'Nigeria',
  'Khaled Hosseini': 'Afghanistan',
  'Malcolm Gladwell': 'Canada',
  'Stephen King': 'United States',
  'Toni Morrison': 'United States',
  'Salman Rushdie': 'India',
  'Ernest Hemingway': 'United States',
  'F. Scott Fitzgerald': 'United States',
  'Harper Lee': 'United States',
  'Cormac McCarthy': 'United States',
};

export const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'India': '🇮🇳',
  'Bangladesh': '🇧🇩',
  'South Korea': '🇰🇷',
  'Japan': '🇯🇵',
  'Brazil': '🇧🇷',
  'Austria': '🇦🇹',
  'Israel': '🇮🇱',
  'Iran': '🇮🇷',
  'Canada': '🇨🇦',
  'Colombia': '🇨🇴',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Nigeria': '🇳🇬',
  'Russia': '🇷🇺',
  'Czech Republic': '🇨🇿',
  'Afghanistan': '🇦🇫',
  'Australia': '🇦🇺',
  'International': '🌐',
  'Other': '🌐',
};

/**
 * Resolves the author's country of origin.
 * Checks explicit book property first, then dictionary lookup, with fallback to 'International'.
 */
export function getAuthorCountry(authorName: string, explicitCountry?: string): string {
  if (explicitCountry && explicitCountry.trim()) {
    return explicitCountry.trim();
  }
  if (!authorName) return 'International';

  const trimmed = authorName.trim();
  if (AUTHOR_COUNTRY_MAP[trimmed]) {
    return AUTHOR_COUNTRY_MAP[trimmed];
  }

  // Case-insensitive match attempt
  const lower = trimmed.toLowerCase();
  for (const [author, country] of Object.entries(AUTHOR_COUNTRY_MAP)) {
    if (author.toLowerCase() === lower || lower.includes(author.toLowerCase())) {
      return country;
    }
  }

  return 'International';
}

export function getCountryFlag(countryName: string): string {
  return COUNTRY_FLAGS[countryName] || '🌐';
}

