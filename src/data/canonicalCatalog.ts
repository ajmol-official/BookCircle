import type { CatalogBook, CatalogWork, Book } from '../types';
import { generateAuthorSlug } from './authors';

/**
 * Canonical Bibliography of Published Works.
 *
 * An author's published bibliography exists independently of BookCircle member listings.
 * Each entry represents a published literary work, not a physical community copy.
 */
export const canonicalCatalogBooks: CatalogBook[] = [
  // ─── Arundhati Roy ───
  {
    id: 'the-god-of-small-things',
    title: 'The God of Small Things',
    author: 'Arundhati Roy',
    authorId: 'arundhati-roy',
    authorCountry: 'India',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 312,
    category: 'Fiction',
    publishedYear: '1997',
    synopsis: 'A story about the childhood experiences of fraternal twins whose lives are destroyed by the "Love Laws" that lay down who should be loved, and how, and how much.',
    existingOwners: []
  },
  {
    id: 'the-ministry-of-utmost-happiness',
    title: 'The Ministry of Utmost Happiness',
    author: 'Arundhati Roy',
    authorId: 'arundhati-roy',
    authorCountry: 'India',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rating: 4.4,
    reviewsCount: 145,
    category: 'Fiction',
    publishedYear: '2017',
    synopsis: 'A sweeping narrative across the Indian subcontinent, following Anjum, who makes a home in a graveyard, and Tilo, an architect entangled in Kashmir’s struggle.',
    existingOwners: []
  },
  {
    id: 'azadi-freedom-fascism-fiction',
    title: 'Azadi: Freedom. Fascism. Fiction.',
    author: 'Arundhati Roy',
    authorId: 'arundhati-roy',
    authorCountry: 'India',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 88,
    category: 'Non-fiction',
    publishedYear: '2020',
    synopsis: 'An urgent collection of essays reflecting on the meaning of freedom in a world of growing authoritarianism, linguistic nationalism, and global crisis.',
    existingOwners: []
  },
  {
    id: 'the-algebra-of-infinite-justice',
    title: 'The Algebra of Infinite Justice',
    author: 'Arundhati Roy',
    authorId: 'arundhati-roy',
    authorCountry: 'India',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviewsCount: 62,
    category: 'Non-fiction',
    publishedYear: '2001',
    synopsis: 'A provocative collection of political essays challenging the consensus on globalization, nuclear testing, and corporate encroachment on human rights.',
    existingOwners: []
  },
  {
    id: 'my-seditious-heart',
    title: 'My Seditious Heart',
    author: 'Arundhati Roy',
    authorId: 'arundhati-roy',
    authorCountry: 'India',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 48,
    category: 'Non-fiction',
    publishedYear: '2019',
    synopsis: 'Two decades of fearless political essays brought together into a single indispensable volume on democracy, peace, and dissent.',
    existingOwners: []
  },

  // ─── Erin Morgenstern ───
  {
    id: 'the-night-circus',
    title: 'The Night Circus',
    author: 'Erin Morgenstern',
    authorId: 'erin-morgenstern',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 231,
    category: 'Fiction',
    publishedYear: '2011',
    synopsis: 'The circus arrives without warning. No announcements precede it. Behind the scenes, a fierce duel between two young illusionists unfolds.',
    existingOwners: []
  },
  {
    id: 'the-starless-sea',
    title: 'The Starless Sea',
    author: 'Erin Morgenstern',
    authorId: 'erin-morgenstern',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    rating: 4.3,
    reviewsCount: 190,
    category: 'Fiction',
    publishedYear: '2019',
    synopsis: 'A graduate student discovers a mysterious book in the university stacks that leads him into a labyrinthine subterranean sanctuary devoted to storytellers.',
    existingOwners: []
  },

  // ─── Richard Powers ───
  {
    id: 'the-overstory',
    title: 'The Overstory',
    author: 'Richard Powers',
    authorId: 'richard-powers',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviewsCount: 184,
    category: 'Fiction',
    publishedYear: '2018',
    synopsis: 'Pulitzer Prize-winning novel chronicling nine Americans whose unique relationships with trees summon them together to address natural destruction.',
    existingOwners: []
  },
  {
    id: 'bewilderment',
    title: 'Bewilderment',
    author: 'Richard Powers',
    authorId: 'richard-powers',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    rating: 4.2,
    reviewsCount: 95,
    category: 'Fiction',
    publishedYear: '2021',
    synopsis: 'An astrobiologist struggling to raise his neurodivergent son after his wife’s death turns to an experimental neurofeedback treatment trained on her brain patterns.',
    existingOwners: []
  },
  {
    id: 'the-echo-maker',
    title: 'The Echo Maker',
    author: 'Richard Powers',
    authorId: 'richard-powers',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800',
    rating: 4.1,
    reviewsCount: 72,
    category: 'Fiction',
    publishedYear: '2006',
    synopsis: 'National Book Award winner following a truck accident survivor in Nebraska who wakes up believing his devoted sister is an imposter.',
    existingOwners: []
  },

  // ─── Min Jin Lee ───
  {
    id: 'pachinko',
    title: 'Pachinko',
    author: 'Min Jin Lee',
    authorId: 'min-jin-lee',
    authorCountry: 'South Korea',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 340,
    category: 'History',
    publishedYear: '2017',
    synopsis: 'An epic historical novel following a Korean family who immigrates to Japan through generations of hardship, triumph, and identity.',
    existingOwners: []
  },
  {
    id: 'free-food-for-millionaires',
    title: 'Free Food for Millionaires',
    author: 'Min Jin Lee',
    authorId: 'min-jin-lee',
    authorCountry: 'South Korea',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    rating: 4.2,
    reviewsCount: 110,
    category: 'Fiction',
    publishedYear: '2007',
    synopsis: 'The ambitious daughter of Korean immigrants graduates from Columbia University and navigates high-finance Manhattan with taste, debt, and determination.',
    existingOwners: []
  },

  // ─── John Williams ───
  {
    id: 'stoner',
    title: 'Stoner',
    author: 'John Williams',
    authorId: 'john-williams',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 120,
    category: 'Fiction',
    publishedYear: '1965',
    synopsis: 'William Stoner is born into a poor Missouri farm family and discovers a quiet, passionate lifelong devotion to English literature.',
    existingOwners: []
  },
  {
    id: 'augustus',
    title: 'Augustus',
    author: 'John Williams',
    authorId: 'john-williams',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 85,
    category: 'Fiction',
    publishedYear: '1972',
    synopsis: 'National Book Award-winning epistolary novel portraying the metamorphosis of shy, sickly Octavius into the supreme ruler of Rome.',
    existingOwners: []
  },
  {
    id: 'butchers-crossing',
    title: "Butcher's Crossing",
    author: 'John Williams',
    authorId: 'john-williams',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    rating: 4.4,
    reviewsCount: 65,
    category: 'Fiction',
    publishedYear: '1960',
    synopsis: 'A Harvard student leaves Boston in the 1870s seeking wild American freedom on an arduous, brutal buffalo hunt in the Colorado Rockies.',
    existingOwners: []
  },

  // ─── Cho Nam-Joo ───
  {
    id: 'kim-jiyoung-born-1982',
    title: 'Kim Jiyoung, Born 1982',
    author: 'Cho Nam-Joo',
    authorId: 'cho-nam-joo',
    authorCountry: 'South Korea',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800',
    rating: 4.4,
    reviewsCount: 95,
    category: 'Non-fiction',
    publishedYear: '2016',
    synopsis: 'A groundbreaking novel capturing the everyday institutional sexism and psychological burdens endured by women in contemporary society.',
    existingOwners: []
  },
  {
    id: 'saha',
    title: 'Saha',
    author: 'Cho Nam-Joo',
    authorId: 'cho-nam-joo',
    authorCountry: 'South Korea',
    coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    rating: 4.1,
    reviewsCount: 42,
    category: 'Fiction',
    publishedYear: '2019',
    synopsis: 'In a privatized city-state owned by a conglomerate, the disenfranchised residents of a derelict housing estate investigate a mysterious murder.',
    existingOwners: []
  },

  // ─── Mario Puzo ───
  {
    id: 'the-godfather',
    title: 'The Godfather',
    author: 'Mario Puzo',
    authorId: 'mario-puzo',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 410,
    category: 'Fiction',
    publishedYear: '1969',
    synopsis: 'The monumental tale of the Corleone family, organized crime, power, loyalty, and corruption that defined a literary genre.',
    existingOwners: []
  },
  {
    id: 'the-sicilian',
    title: 'The Sicilian',
    author: 'Mario Puzo',
    authorId: 'mario-puzo',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    rating: 4.2,
    reviewsCount: 115,
    category: 'Fiction',
    publishedYear: '1984',
    synopsis: 'Michael Corleone’s exile in Sicily intersects with the legendary romantic outlaw Salvatore Guiliano in a story of betrayal and honor.',
    existingOwners: []
  },
  {
    id: 'the-last-don',
    title: 'The Last Don',
    author: 'Mario Puzo',
    authorId: 'mario-puzo',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    rating: 4.1,
    reviewsCount: 80,
    category: 'Fiction',
    publishedYear: '1996',
    synopsis: 'The aging head of the Clericuzio mafia dynasty attempts to guide his children into legitimate Hollywood film studios and Las Vegas casinos.',
    existingOwners: []
  },

  // ─── Yuval Noah Harari ───
  {
    id: 'sapiens',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    authorId: 'yuval-noah-harari',
    authorCountry: 'Israel',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 820,
    category: 'History',
    publishedYear: '2011',
    synopsis: 'How an insignificant ape became the ruler of planet Earth: from the Cognitive Revolution to the rise of agriculture, money, and empires.',
    existingOwners: []
  },
  {
    id: 'homo-deus',
    title: 'Homo Deus: A Brief History of Tomorrow',
    author: 'Yuval Noah Harari',
    authorId: 'yuval-noah-harari',
    authorCountry: 'Israel',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 430,
    category: 'History',
    publishedYear: '2015',
    synopsis: 'An exploration of humanity’s future projects: overcoming death, creating artificial life, and the potential displacement of humans by algorithms.',
    existingOwners: []
  },
  {
    id: '21-lessons-for-the-21st-century',
    title: '21 Lessons for the 21st Century',
    author: 'Yuval Noah Harari',
    authorId: 'yuval-noah-harari',
    authorCountry: 'Israel',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviewsCount: 290,
    category: 'Non-fiction',
    publishedYear: '2018',
    synopsis: 'Probing the urgent questions of our current moment: technological disruption, climate collapse, fake news, and post-truth politics.',
    existingOwners: []
  },
  {
    id: 'nexus-brief-history-information',
    title: 'Nexus: A Brief History of Information Networks',
    author: 'Yuval Noah Harari',
    authorId: 'yuval-noah-harari',
    authorCountry: 'Israel',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 140,
    category: 'History',
    publishedYear: '2024',
    synopsis: 'A look through the long lens of human history to understand how the flow of information has made, and unmade, our world.',
    existingOwners: []
  },

  // ─── Carl Sagan ───
  {
    id: 'cosmos',
    title: 'Cosmos',
    author: 'Carl Sagan',
    authorId: 'carl-sagan',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 615,
    category: 'Science',
    publishedYear: '1980',
    synopsis: 'The story of cosmic evolution, science, and civilization told by one of the greatest astronomers and humanists of all time.',
    existingOwners: []
  },
  {
    id: 'contact',
    title: 'Contact',
    author: 'Carl Sagan',
    authorId: 'carl-sagan',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 310,
    category: 'Science',
    publishedYear: '1985',
    synopsis: 'Radio astronomer Ellie Arroway discovers a repeating signal from Vega, containing schematics for an interstellar transport machine.',
    existingOwners: []
  },
  {
    id: 'pale-blue-dot',
    title: 'Pale Blue Dot: A Vision of the Human Future in Space',
    author: 'Carl Sagan',
    authorId: 'carl-sagan',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 420,
    category: 'Science',
    publishedYear: '1994',
    synopsis: 'Inspired by Voyager 1’s photograph of Earth from beyond Neptune, Sagan ruminates on human fragility and our cosmic destiny.',
    existingOwners: []
  },
  {
    id: 'the-demon-haunted-world',
    title: 'The Demon-Haunted World: Science as a Candle in the Dark',
    author: 'Carl Sagan',
    authorId: 'carl-sagan',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 380,
    category: 'Science',
    publishedYear: '1995',
    synopsis: 'A passionate defense of scientific skepticism, critical thinking, and the baloney detection kit against pseudoscience and superstition.',
    existingOwners: []
  },

  // ─── Jared Diamond ───
  {
    id: 'guns-germs-and-steel',
    title: 'Guns, Germs, and Steel',
    author: 'Jared Diamond',
    authorId: 'jared-diamond',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 430,
    category: 'History',
    publishedYear: '1997',
    synopsis: 'Pulitzer Prize winner examining how geography and environmental advantages shaped modern global inequality and technology.',
    existingOwners: []
  },
  {
    id: 'collapse',
    title: 'Collapse: How Societies Choose to Fail or Succeed',
    author: 'Jared Diamond',
    authorId: 'jared-diamond',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    rating: 4.4,
    reviewsCount: 210,
    category: 'History',
    publishedYear: '2005',
    synopsis: 'Why did past civilizations like Easter Island, the Maya, and Greenland Norse collapse, while others adapted and survived?',
    existingOwners: []
  },
  {
    id: 'upheaval',
    title: 'Upheaval: Turning Points for Nations in Crisis',
    author: 'Jared Diamond',
    authorId: 'jared-diamond',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    rating: 4.2,
    reviewsCount: 130,
    category: 'History',
    publishedYear: '2019',
    synopsis: 'How six nations responded to acute existential crises, and what lessons apply to contemporary global challenges.',
    existingOwners: []
  },

  // ─── Bill Bryson ───
  {
    id: 'a-short-history-of-nearly-everything',
    title: 'A Short History of Nearly Everything',
    author: 'Bill Bryson',
    authorId: 'bill-bryson',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 540,
    category: 'Science',
    publishedYear: '2003',
    synopsis: 'A witty, accessible quest to understand how we got from there being nothing at all to there being us.',
    existingOwners: []
  },
  {
    id: 'notes-from-a-small-island',
    title: 'Notes from a Small Island',
    author: 'Bill Bryson',
    authorId: 'bill-bryson',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviewsCount: 220,
    category: 'Non-fiction',
    publishedYear: '1995',
    synopsis: 'A hilarious, affectionate farewell tour across Great Britain by public transit, exploring local eccentricities and heritage.',
    existingOwners: []
  },
  {
    id: 'the-body-a-guide-for-occupants',
    title: 'The Body: A Guide for Occupants',
    author: 'Bill Bryson',
    authorId: 'bill-bryson',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 310,
    category: 'Science',
    publishedYear: '2019',
    synopsis: 'An extraordinary head-to-toe tour of the human physical form, its astonishing marvels, and its bizarre vulnerabilities.',
    existingOwners: []
  },

  // ─── Paulo Coelho ───
  {
    id: 'the-alchemist',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    authorId: 'paulo-coelho',
    authorCountry: 'Brazil',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 910,
    category: 'Fiction',
    publishedYear: '1988',
    synopsis: 'The mystical journey of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.',
    existingOwners: []
  },
  {
    id: 'brida',
    title: 'Brida',
    author: 'Paulo Coelho',
    authorId: 'paulo-coelho',
    authorCountry: 'Brazil',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rating: 4.1,
    reviewsCount: 160,
    category: 'Fiction',
    publishedYear: '1990',
    synopsis: 'A young Irish woman embarks on a spiritual search for knowledge, magic, and her true soulmate through ancient traditions.',
    existingOwners: []
  },
  {
    id: 'eleven-minutes',
    title: 'Eleven Minutes',
    author: 'Paulo Coelho',
    authorId: 'paulo-coelho',
    authorCountry: 'Brazil',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    rating: 4.3,
    reviewsCount: 240,
    category: 'Fiction',
    publishedYear: '2003',
    synopsis: 'A gripping exploration of love, sacred sexuality, and self-knowledge through the journey of Maria in Geneva.',
    existingOwners: []
  },

  // ─── Susan Cain ───
  {
    id: 'quiet-the-power-of-introverts',
    title: 'Quiet: The Power of Introverts in a World That Can\'t Stop Talking',
    author: 'Susan Cain',
    authorId: 'susan-cain',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 380,
    category: 'Non-fiction',
    publishedYear: '2012',
    synopsis: 'Demonstrating how Western culture undervaluates introverts and how quiet reflection fosters immense creativity and leadership.',
    existingOwners: []
  },
  {
    id: 'bittersweet',
    title: 'Bittersweet: How Sorrow and Longing Make Us Whole',
    author: 'Susan Cain',
    authorId: 'susan-cain',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviewsCount: 150,
    category: 'Non-fiction',
    publishedYear: '2022',
    synopsis: 'How embracing a bittersweet state of mind—a tendency to sorrow and longing—is the secret to human connection, art, and grace.',
    existingOwners: []
  },

  // ─── Viktor E. Frankl ───
  {
    id: 'mans-search-for-meaning',
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    authorId: 'viktor-e-frankl',
    authorCountry: 'Austria',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 780,
    category: 'Non-fiction',
    publishedYear: '1946',
    synopsis: 'A psychiatrist’s memoir of surviving Nazi death camps and a meditation on finding meaning in the darkest of human circumstances.',
    existingOwners: []
  },
  {
    id: 'the-will-to-meaning',
    title: 'The Will to Meaning: Foundations and Applications of Logotherapy',
    author: 'Viktor E. Frankl',
    authorId: 'viktor-e-frankl',
    authorCountry: 'Austria',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 110,
    category: 'Non-fiction',
    publishedYear: '1969',
    synopsis: 'The foundational principles of Frankl’s logotherapy system, focusing on freedom of will, will to meaning, and meaning of life.',
    existingOwners: []
  },

  // ─── Coleman Barks & Rumi ───
  {
    id: 'the-essential-rumi',
    title: 'The Essential Rumi',
    author: 'Coleman Barks & Rumi',
    authorId: 'coleman-barks-rumi',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 220,
    category: 'Poetry',
    publishedYear: '1995',
    synopsis: 'The landmark translations that brought 13th-century Sufi mystic Jalāl al-Dīn Rūmī’s poetry to millions of English readers.',
    existingOwners: []
  },
  {
    id: 'the-soul-of-rumi',
    title: 'The Soul of Rumi',
    author: 'Coleman Barks & Rumi',
    authorId: 'coleman-barks-rumi',
    authorCountry: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 85,
    category: 'Poetry',
    publishedYear: '2001',
    synopsis: 'A fresh collection of ecstatic poetry exploring divine love, spiritual friendship, and human transcendence.',
    existingOwners: []
  }
];

/**
 * Finds a catalog book by exact ID or slug.
 */
export function getCatalogBookById(idOrSlug: string): CatalogBook | undefined {
  if (!idOrSlug) return undefined;
  const target = idOrSlug.toLowerCase().trim();
  return canonicalCatalogBooks.find(
    (b) =>
      b.id === target ||
      b.id.toLowerCase() === target ||
      b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === target
  );
}

/**
 * Searches canonical published works by title or slug.
 */
export function findCatalogBook(query: string): CatalogBook | undefined {
  if (!query) return undefined;
  const target = query.toLowerCase().trim();
  const direct = getCatalogBookById(target);
  if (direct) return direct;

  return canonicalCatalogBooks.find(
    (b) =>
      b.title.toLowerCase().trim() === target ||
      b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === target.replace(/[^a-z0-9]+/g, '-')
  );
}

/**
 * Retrieves all canonical published works for a given author identifier.
 */
export function getCatalogBooksByAuthor(authorIdentifier: string): CatalogBook[] {
  if (!authorIdentifier) return [];
  const normalizedSlug = generateAuthorSlug(authorIdentifier);
  const targetName = authorIdentifier.toLowerCase().trim();

  return canonicalCatalogBooks.filter((book) => {
    if (book.authorId && (book.authorId === authorIdentifier || book.authorId === normalizedSlug)) {
      return true;
    }
    const bookAuthorSlug = generateAuthorSlug(book.author);
    if (bookAuthorSlug === normalizedSlug) return true;
    return book.author.toLowerCase().trim() === targetName;
  });
}

/**
 * Generates the unified list of published works for an author,
 * enriched with live community copies and availability counts.
 *
 * Requirements:
 * 1. Each published literary work appears EXACTLY ONCE.
 * 2. Published works exist independently of community copies (appear even if 0 copies).
 * 3. Total community copies and available copies are computed accurately.
 * 4. Books listed by community members that are not in the initial catalog are seamlessly included.
 */
export function getCatalogWorksForAuthor(
  authorIdentifier: string,
  communityCopies: Book[] = []
): CatalogWork[] {
  const normalizedSlug = generateAuthorSlug(authorIdentifier);
  const targetName = authorIdentifier.toLowerCase().trim();

  // 1. Get pre-populated canonical works for this author
  const catalogList = getCatalogBooksByAuthor(authorIdentifier);
  const worksMap = new Map<string, CatalogWork>();

  for (const item of catalogList) {
    const key = item.title.toLowerCase().trim();
    worksMap.set(key, {
      id: item.id,
      title: item.title,
      author: item.author,
      authorId: item.authorId || normalizedSlug,
      authorCountry: item.authorCountry,
      coverImage: item.coverImage,
      category: item.category,
      rating: item.rating,
      reviewsCount: item.reviewsCount,
      synopsis: item.synopsis,
      publishedYear: item.publishedYear,
      totalCopies: 0,
      availableCopies: 0
    });
  }

  // 2. Scan community copies for any titles by this author
  const authorCopies = communityCopies.filter((copy) => {
    if (copy.authorId && (copy.authorId === authorIdentifier || copy.authorId === normalizedSlug)) {
      return true;
    }
    if (generateAuthorSlug(copy.author) === normalizedSlug) return true;
    return copy.author.toLowerCase().trim() === targetName;
  });

  // If a community copy's title isn't in worksMap, add it as a catalog work
  for (const copy of authorCopies) {
    const key = copy.title.toLowerCase().trim();
    if (!worksMap.has(key)) {
      worksMap.set(key, {
        id: copy.catalogId || copy.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: copy.title,
        author: copy.author,
        authorId: copy.authorId || normalizedSlug,
        authorCountry: copy.authorCountry,
        coverImage: copy.coverImage,
        category: copy.category,
        rating: copy.rating || 4.8,
        reviewsCount: copy.reviewsCount || 1,
        synopsis: copy.description,
        totalCopies: 0,
        availableCopies: 0
      });
    }
  }

  // 3. Calculate community copies counts for each work
  for (const [key, work] of worksMap.entries()) {
    const matchingCopies = authorCopies.filter(
      (c) =>
        (c.catalogId && c.catalogId === work.id) ||
        c.title.toLowerCase().trim() === key
    );

    work.totalCopies = matchingCopies.length;
    work.availableCopies = matchingCopies.filter((c) => c.status === 'available').length;
  }

  return Array.from(worksMap.values());
}
