import type { Author } from '../types/author';
import type { Book } from '../types';

/**
 * Pre-populated Directory of Canonical Authors in BookCircle.
 *
 * Authors are distinct from BookCircle members (Readers).
 * An Author represents a literary creator and their bibliography in the catalogue,
 * regardless of whether they have registered on BookCircle.
 */
export const initialAuthors: Author[] = [
  {
    id: 'author-arundhati-roy',
    slug: 'arundhati-roy',
    name: 'Arundhati Roy',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    nationality: 'Indian',
    countryFlag: '🇮🇳',
    profession: 'Novelist, Essayist & Human Rights Activist',
    bio: 'Suzanna Arundhati Roy is an Indian author best known for her debut novel "The God of Small Things", which won the Man Booker Prize for Fiction in 1997 and became the biggest-selling book by a non-expatriate Indian author. She is also a widely respected political essayist and campaigner for environmental protection and social justice.',
    born: '1961',
    birthPlace: 'Shillong, Meghalaya, India',
    literaryAchievements: [
      'Man Booker Prize for Fiction (1997)',
      'Sydney Peace Prize (2004)',
      'Norman Mailer Prize for Lifetime Achievement (2011)',
      'European Essay Prize (2023)'
    ],
    notableWorks: [
      'The God of Small Things',
      'The Ministry of Utmost Happiness',
      'Azadi: Freedom. Fascism. Fiction.'
    ],
    websiteUrl: 'https://www.penguinrandomhouse.com/authors/26252/arundhati-roy',
    isClaimed: false,
    isVerified: true,
    followersCount: 1420
  },
  {
    id: 'author-erin-morgenstern',
    slug: 'erin-morgenstern',
    name: 'Erin Morgenstern',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    nationality: 'American',
    countryFlag: '🇺🇸',
    profession: 'Novelist & Multimedia Artist',
    bio: 'Erin Morgenstern is an American author and multimedia artist. She is best known for "The Night Circus", her mesmerizing debut novel published in 2011 that spent weeks on the New York Times bestseller list and won the American Library Association Alex Award. Her lush, atmospheric prose has captivated readers across the world.',
    born: '1978',
    birthPlace: 'Marshfield, Massachusetts, USA',
    literaryAchievements: [
      'Alex Award (American Library Association, 2012)',
      'Locus Award for Best First Novel Nominee',
      'Mythopoeic Fantasy Award Finalist'
    ],
    notableWorks: ['The Night Circus', 'The Starless Sea'],
    websiteUrl: 'https://erinmorgenstern.com',
    isClaimed: false,
    isVerified: true,
    followersCount: 890
  },
  {
    id: 'author-richard-powers',
    slug: 'richard-powers',
    name: 'Richard Powers',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    nationality: 'American',
    countryFlag: '🇺🇸',
    profession: 'Novelist & MacArthur Fellow',
    bio: 'Richard Powers is an American novelist whose twelve novels explore the effects of modern science and technology on human consciousness and the natural world. His 2018 novel "The Overstory" won the Pulitzer Prize for Fiction and was shortlisted for the Man Booker Prize.',
    born: '1957',
    birthPlace: 'Evanston, Illinois, USA',
    literaryAchievements: [
      'Pulitzer Prize for Fiction (2019)',
      'National Book Award for Fiction (2006)',
      'MacArthur Fellowship ("Genius Grant", 1989)'
    ],
    notableWorks: ['The Overstory', 'The Echo Maker', 'Bewilderment'],
    isClaimed: false,
    isVerified: true,
    followersCount: 650
  },
  {
    id: 'author-min-jin-lee',
    slug: 'min-jin-lee',
    name: 'Min Jin Lee',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    nationality: 'Korean-American',
    countryFlag: '🇰🇷',
    profession: 'Novelist, Essayist & Journalist',
    bio: 'Min Jin Lee is a Korean-American author and journalist based in New York. Her epic historical saga "Pachinko" was a finalist for the National Book Award for Fiction, a New York Times Top 10 Book of the Year, and the basis for an acclaimed television series.',
    born: '1968',
    birthPlace: 'Seoul, South Korea',
    literaryAchievements: [
      'National Book Award Finalist (2017)',
      'Medici Book Club Prize',
      'Guggenheim Fellowship (2022)'
    ],
    notableWorks: ['Pachinko', 'Free Food for Millionaires'],
    websiteUrl: 'https://www.minjinlee.com',
    isClaimed: false,
    isVerified: true,
    followersCount: 1120
  },
  {
    id: 'author-john-williams',
    slug: 'john-williams',
    name: 'John Williams',
    nationality: 'American',
    countryFlag: '🇺🇸',
    profession: 'Novelist, Poet & Academic',
    bio: 'John Edward Williams was an American author, editor, and professor of English. He is celebrated for his novel "Stoner" (1965), which achieved massive international rediscovery decades after publication as a quietly devastating masterpiece, and "Augustus" (1972), which won the U.S. National Book Award.',
    born: '1922',
    birthPlace: 'Clarksville, Texas, USA',
    literaryAchievements: [
      'U.S. National Book Award for Fiction (1973)',
      'Rockefeller Foundation Fellowship'
    ],
    notableWorks: ['Stoner', 'Augustus', "Butcher's Crossing"],
    isClaimed: false,
    isVerified: false,
    followersCount: 430
  },
  {
    id: 'author-cho-nam-joo',
    slug: 'cho-nam-joo',
    name: 'Cho Nam-Joo',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    nationality: 'South Korean',
    countryFlag: '🇰🇷',
    profession: 'Novelist & Scriptwriter',
    bio: 'Cho Nam-Joo is a South Korean novelist and former television scriptwriter. Her groundbreaking novel "Kim Jiyoung, Born 1982" sold over two million copies globally and sparked widespread conversation about gender equality across East Asia and internationally.',
    born: '1978',
    birthPlace: 'Seoul, South Korea',
    literaryAchievements: [
      "Today's Writer Award (2017)",
      'International Booker Prize Longlist (2020)'
    ],
    notableWorks: ['Kim Jiyoung, Born 1982', 'Saha'],
    isClaimed: false,
    isVerified: true,
    followersCount: 760
  },
  {
    id: 'author-mario-puzo',
    slug: 'mario-puzo',
    name: 'Mario Puzo',
    nationality: 'American',
    countryFlag: '🇺🇸',
    profession: 'Novelist, Screenwriter & Journalist',
    bio: 'Mario Gianluigi Puzo was an American author, screenwriter, and journalist. He is best known for his crime novels about the Italian-American Mafia, particularly "The Godfather" (1969), which he co-adapted into Francis Ford Coppola\'s Academy Award-winning film trilogy.',
    born: '1920',
    birthPlace: 'Hell\'s Kitchen, New York City, USA',
    literaryAchievements: [
      'Academy Award for Best Adapted Screenplay (1972, 1974)',
      'Golden Globe Award for Best Screenplay (1972)'
    ],
    notableWorks: ['The Godfather', 'The Sicilian', 'The Last Don'],
    isClaimed: false,
    isVerified: false,
    followersCount: 580
  },
  {
    id: 'author-yuval-noah-harari',
    slug: 'yuval-noah-harari',
    name: 'Yuval Noah Harari',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    nationality: 'Israeli',
    countryFlag: '🇮🇱',
    profession: 'Historian, Philosopher & Public Intellectual',
    bio: 'Yuval Noah Harari is an Israeli historian and professor in the Department of History at the Hebrew University of Jerusalem. He is the author of international bestsellers including "Sapiens: A Brief History of Humankind", "Homo Deus", and "Nexus", with over 45 million books sold in 65 languages.',
    born: '1976',
    birthPlace: 'Kiryat Ata, Israel',
    literaryAchievements: [
      'Polonsky Prize for Creativity and Originality (2009, 2012)',
      'Foreign Policy Top 100 Global Thinkers'
    ],
    notableWorks: ['Sapiens: A Brief History of Humankind', 'Homo Deus', '21 Lessons for the 21st Century'],
    websiteUrl: 'https://www.ynharari.com',
    isClaimed: false,
    isVerified: true,
    followersCount: 2850
  },
  {
    id: 'author-carl-sagan',
    slug: 'carl-sagan',
    name: 'Carl Sagan',
    nationality: 'American',
    countryFlag: '🇺🇸',
    profession: 'Astronomer, Astrophysicist & Science Communicator',
    bio: 'Carl Edward Sagan was an American astronomer, planetary scientist, and science communicator. He is famous for his television series and companion book "Cosmos: A Personal Voyage", and for championing the search for extraterrestrial intelligence and scientific wonder.',
    born: '1934',
    birthPlace: 'Brooklyn, New York, USA',
    literaryAchievements: [
      'Pulitzer Prize for General Non-Fiction (1978)',
      'NASA Distinguished Public Service Medal',
      'Public Welfare Medal (National Academy of Sciences)'
    ],
    notableWorks: ['Cosmos', 'Contact', 'Pale Blue Dot', 'The Demon-Haunted World'],
    isClaimed: false,
    isVerified: false,
    followersCount: 1980
  },
  {
    id: 'author-jared-diamond',
    slug: 'jared-diamond',
    name: 'Jared Diamond',
    nationality: 'American',
    countryFlag: '🇺🇸',
    profession: 'Geographer, Historian & Anthropologist',
    bio: 'Jared Mason Diamond is an American geographer, historian, anthropologist, and professor at UCLA. He is celebrated for his influential study "Guns, Germs, and Steel" (1997), which examined how geographic and environmental factors shaped global history.',
    born: '1937',
    birthPlace: 'Boston, Massachusetts, USA',
    literaryAchievements: [
      'Pulitzer Prize for General Non-Fiction (1998)',
      'U.S. National Medal of Science (1999)',
      'Tyler Prize for Environmental Achievement'
    ],
    notableWorks: ['Guns, Germs, and Steel', 'Collapse: How Societies Choose to Fail or Succeed', 'Upheaval'],
    isClaimed: false,
    isVerified: true,
    followersCount: 520
  },
  {
    id: 'author-bill-bryson',
    slug: 'bill-bryson',
    name: 'Bill Bryson',
    nationality: 'American-British',
    countryFlag: '🇺🇸',
    profession: 'Author, Travel Writer & Science Communicator',
    bio: 'William McGuire Bryson is an American-British author of celebrated books on travel, the English language, and science. His bestselling work "A Short History of Nearly Everything" (2003) brought the history of modern science and discovery alive for millions of readers.',
    born: '1951',
    birthPlace: 'Des Moines, Iowa, USA',
    literaryAchievements: [
      'Aventis Prize for Science Books (2004)',
      'Descartes Prize for Science Communication (2005)',
      'Honorary Officer of the Order of the British Empire (OBE)'
    ],
    notableWorks: ['A Short History of Nearly Everything', 'Notes from a Small Island', 'The Body: A Guide for Occupants'],
    isClaimed: false,
    isVerified: true,
    followersCount: 680
  },
  {
    id: 'author-paulo-coelho',
    slug: 'paulo-coelho',
    name: 'Paulo Coelho',
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
    nationality: 'Brazilian',
    countryFlag: '🇧🇷',
    profession: 'Lyricist & Novelist',
    bio: 'Paulo Coelho de Souza is an internationally renowned Brazilian novelist and lyricist. His fable "The Alchemist" has sold hundreds of millions of copies worldwide and holds the Guinness World Record for the most translated book by a living author.',
    born: '1947',
    birthPlace: 'Rio de Janeiro, Brazil',
    literaryAchievements: [
      'Crystal Award (World Economic Forum)',
      'Chevalier de la Légion d\'Honneur (France)',
      'Guinness World Record for Most Translated Book by a Living Author'
    ],
    notableWorks: ['The Alchemist', 'Brida', 'Veronika Decides to Die'],
    websiteUrl: 'https://paulocoelhoblog.com',
    isClaimed: false,
    isVerified: true,
    followersCount: 3100
  },
  {
    id: 'author-susan-cain',
    slug: 'susan-cain',
    name: 'Susan Cain',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    nationality: 'American',
    countryFlag: '🇺🇸',
    profession: 'Author, Lecturer & Advocate',
    bio: 'Susan Cain is an American author and former corporate attorney. Her groundbreaking book "Quiet: The Power of Introverts in a World That Can\'t Stop Talking" spent over seven years on the New York Times bestseller list, fundamentally transforming workplace culture and schools.',
    born: '1968',
    birthPlace: 'New York City, New York, USA',
    literaryAchievements: [
      'New York Times Bestseller for over 7 consecutive years',
      'Goodreads Choice Award for Best Nonfiction',
      'Inc. Magazine Top Thought Leader'
    ],
    notableWorks: [
      'Quiet: The Power of Introverts in a World That Can\'t Stop Talking',
      'Bittersweet: How Sorrow and Longing Make Us Whole'
    ],
    websiteUrl: 'https://susancain.net',
    isClaimed: false,
    isVerified: true,
    followersCount: 840
  },
  {
    id: 'author-coleman-barks-rumi',
    slug: 'coleman-barks-rumi',
    name: 'Coleman Barks & Rumi',
    nationality: 'American / Persian',
    countryFlag: '🇺🇸',
    profession: 'Translators & Mystical Poets',
    bio: 'Jalāl al-Dīn Muḥammad Rūmī was a 13th-century Persian poet, Islamic jurist, and Sufi mystic whose verses have transcended national and cultural boundaries. Coleman Barks is an American poet and emeritus professor whose modern English renderings of Rumi have made him one of the most widely read poets in the world today.',
    born: '1207 / 1937',
    birthPlace: 'Balkh, Khorasan / Chattanooga, Tennessee',
    literaryAchievements: [
      'Pushcart Prize Winner (Coleman Barks)',
      'UNESCO Rumi Medal (2006)'
    ],
    notableWorks: ['The Essential Rumi', 'The Soul of Rumi', 'The Book of Love'],
    isClaimed: false,
    isVerified: false,
    followersCount: 920
  },
  {
    id: 'author-viktor-e-frankl',
    slug: 'viktor-e-frankl',
    name: 'Viktor E. Frankl',
    nationality: 'Austrian',
    countryFlag: '🇦🇹',
    profession: 'Neurologist, Psychiatrist & Author',
    bio: 'Viktor Emil Frankl was an Austrian neurologist, psychiatrist, and Holocaust survivor. As founder of logotherapy, he argued that humanity’s primary motivation is the search for purpose and meaning. His memoir "Man\'s Search for Meaning" is recognized as one of the most influential books of the twentieth century.',
    born: '1905',
    birthPlace: 'Vienna, Austria-Hungary',
    literaryAchievements: [
      'Oskar Pfister Award (American Psychiatric Association)',
      'Grand Decoration of Honour in Gold (Republic of Austria)',
      'Over 16 million copies in print worldwide'
    ],
    notableWorks: ["Man's Search for Meaning", 'The Will to Meaning', 'The Doctor and the Soul'],
    isClaimed: false,
    isVerified: false,
    followersCount: 1650
  }
];

/**
 * Normalizes author names into URL-safe slugs.
 * E.g. "Arundhati Roy" -> "arundhati-roy", "Viktor E. Frankl" -> "viktor-e-frankl"
 */
export function generateAuthorSlug(name: string): string {
  if (!name) return 'unknown-author';
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Retrieves all registered authors.
 */
export function getAllAuthors(): Author[] {
  return initialAuthors;
}

/**
 * Finds an author by their slug identifier.
 */
export function getAuthorBySlug(slug: string): Author | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  return initialAuthors.find(
    (a) => a.slug === normalized || a.id === normalized || generateAuthorSlug(a.name) === normalized
  );
}

/**
 * Finds an author by name (case-insensitive fuzzy or exact match).
 */
export function getAuthorByName(name: string): Author | undefined {
  if (!name) return undefined;
  const target = name.toLowerCase().trim();
  return initialAuthors.find(
    (a) => a.name.toLowerCase().trim() === target || generateAuthorSlug(a.name) === generateAuthorSlug(name)
  );
}

/**
 * Gets or dynamically creates an author profile for an author who may not be in the initial dataset.
 * This guarantees that ANY book in BookCircle with an author name will always have a valid Author Profile.
 */
export function getOrCreateAuthor(name: string, fallbackCountry?: string): Author {
  const existing = getAuthorByName(name) || getAuthorBySlug(generateAuthorSlug(name));
  if (existing) {
    if (fallbackCountry && !existing.nationality) {
      return { ...existing, nationality: fallbackCountry };
    }
    return existing;
  }

  const slug = generateAuthorSlug(name || 'Unknown Author');
  return {
    id: `author-${slug}`,
    slug,
    name: name || 'Unknown Author',
    nationality: fallbackCountry || undefined,
    profession: 'Author',
    bio: undefined, // Will render graceful placeholder
    isClaimed: false,
    isVerified: false,
    followersCount: 0
  };
}

/**
 * Filters a list of books by author name or slug.
 */
export function getBooksByAuthor(
  books: Book[],
  authorIdentifier: string
): Book[] {
  if (!books || !authorIdentifier) return [];
  const normalizedSlug = generateAuthorSlug(authorIdentifier);
  const targetAuthor = getAuthorBySlug(authorIdentifier) || getAuthorByName(authorIdentifier);
  const canonicalName = targetAuthor ? targetAuthor.name.toLowerCase().trim() : authorIdentifier.toLowerCase().trim();

  return books.filter((book) => {
    if (book.authorId && (book.authorId === authorIdentifier || book.authorId === normalizedSlug)) {
      return true;
    }
    const bookAuthorSlug = generateAuthorSlug(book.author);
    if (bookAuthorSlug === normalizedSlug) return true;
    return book.author.toLowerCase().trim() === canonicalName;
  });
}

/**
 * Returns unique books by an author, deduplicating physical copies by title or catalogId
 * so the Author's bibliography displays distinct published titles in BookCircle.
 */
export function getUniqueCatalogBooksByAuthor(
  books: Book[],
  authorIdentifier: string
): Book[] {
  const allAuthorBooks = getBooksByAuthor(books, authorIdentifier);
  const seenTitles = new Set<string>();
  const uniqueBooks: Book[] = [];

  for (const book of allAuthorBooks) {
    const key = (book.catalogId || book.title).toLowerCase().trim();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      uniqueBooks.push(book);
    }
  }

  return uniqueBooks;
}
