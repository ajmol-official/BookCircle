import type { Book, Reader, CatalogBook } from '../types';

export const mockCatalogBooks: CatalogBook[] = [
  {
    id: 'the-god-of-small-things',
    title: 'The God of Small Things',
    author: 'Arundhati Roy',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 312,
    category: 'Fiction',
    synopsis: 'A story about the childhood experiences of fraternal twins whose lives are destroyed by the "Love Laws" that lay down who should be loved, and how, and how much.',
    existingOwners: [
      {
        name: 'Arif Ahmed',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
        condition: 'Like New',
        distance: '1.2 km away'
      }
    ]
  },
  {
    id: 'the-night-circus',
    title: 'The Night Circus',
    author: 'Erin Morgenstern',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 231,
    category: 'Fiction',
    synopsis: 'The circus arrives without warning. No announcements precede it. It is simply there, when yesterday it was not.',
    existingOwners: [
      {
        name: 'Priya Shah',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        condition: 'Very Good',
        distance: '0.8 km away'
      }
    ]
  },
  {
    id: 'the-overstory',
    title: 'The Overstory',
    author: 'Richard Powers',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviewsCount: 184,
    category: 'Fiction',
    synopsis: 'An impassioned work of natural activism and resistance that tells the story of nine Americans whose unique experiences with trees bring them together.',
    existingOwners: [
      {
        name: 'Jonas Meier',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        condition: 'Good',
        distance: '1.4 km away'
      }
    ]
  },
  {
    id: 'pachinko',
    title: 'Pachinko',
    author: 'Min Jin Lee',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 340,
    category: 'History',
    synopsis: 'An epic historical novel following a Korean family who immigrates to Japan through generations of hardship, triumph, and identity.',
    existingOwners: [
      {
        name: 'Amira Khan',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        condition: 'Like New',
        distance: '2.1 km away'
      }
    ]
  },
  {
    id: 'stoner',
    title: 'Stoner',
    author: 'John Williams',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 120,
    category: 'Fiction',
    synopsis: 'William Stoner is born into a poor Missouri farm family at the end of the nineteenth century and discovers a passionate love for literature.',
    existingOwners: [
      {
        name: 'Diego Ramirez',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        condition: 'Fair',
        distance: '2.9 km away'
      }
    ]
  },
  {
    id: 'kim-jiyoung-born-1982',
    title: 'Kim Jiyoung, Born 1982',
    author: 'Cho Nam-Joo',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800',
    rating: 4.4,
    reviewsCount: 95,
    category: 'Non-fiction',
    synopsis: 'A groundbreaking novel that captures the everyday reality of being a woman in modern society.',
    existingOwners: [
      {
        name: 'Hana Yamada',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
        condition: 'Very Good',
        distance: '3.7 km away'
      }
    ]
  },
  {
    id: 'the-godfather',
    title: 'The Godfather',
    author: 'Mario Puzo',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 410,
    category: 'Fiction',
    synopsis: 'The monumental tale of the Corleone family, crime, power, and loyalty that defined a genre.',
    existingOwners: [
      {
        name: 'Kyla Taylor',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        condition: 'Good',
        distance: '4.1 km away'
      }
    ]
  },
  {
    id: 'sapiens',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 820,
    category: 'History',
    synopsis: 'From examining the role that evolving humans have played in the global ecosystem to charting the rise of empires.',
    existingOwners: [
      {
        name: 'Arif Ahmed',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
        condition: 'Like New',
        distance: '3.2 km away'
      }
    ]
  },
  {
    id: 'cosmos',
    title: 'Cosmos',
    author: 'Carl Sagan',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 615,
    category: 'Science',
    synopsis: 'The story of cosmic evolution, science, and civilization told by one of the greatest astronomers of all time.',
    existingOwners: [
      {
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        condition: 'Very Good',
        distance: '4.8 km away'
      }
    ]
  }
];

export const mockBooks: Book[] = [
  {
    id: 'book-god-of-small-things',
    catalogId: 'the-god-of-small-things',
    title: 'The God of Small Things',
    author: 'Arundhati Roy',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 312,
    distance: '1.2 km',
    ownersCount: 2,
    category: 'Fiction',
    status: 'available',
    ownerName: 'Arif Ahmed',
    ownerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    ownerTrust: 'Verified (52 lends)',
    condition: 'Like New',
    availabilityMode: 'lending',
    bookType: 'Original Copy',
    description: 'A story about the childhood experiences of fraternal twins whose lives are destroyed by the Love Laws.'
  },
  {
    id: 'book-1',
    catalogId: 'the-night-circus',
    title: 'The Night Circus',
    author: 'Erin Morgenstern',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 231,
    distance: '0.8 km',
    ownersCount: 4,
    category: 'Fiction',
    status: 'available',
    ownerName: 'Priya Shah',
    ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    ownerTrust: 'High (28 lends)',
    condition: 'Very Good',
    availabilityMode: 'lending',
    bookType: 'Original Copy',
    description: 'The circus arrives without warning. No announcements precede it. It is simply there, when yesterday it was not.'
  },
  {
    id: 'book-2',
    catalogId: 'the-overstory',
    title: 'The Overstory',
    author: 'Richard Powers',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviewsCount: 184,
    distance: '1.4 km',
    ownersCount: 2,
    category: 'Fiction',
    status: 'available',
    ownerName: 'Jonas Meier',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    ownerTrust: 'High (19 lends)',
    condition: 'Good',
    availabilityMode: 'lending',
    bookType: 'Original Copy',
    description: 'An impassioned work of natural activism and resistance that tells the story of nine Americans whose unique experiences with trees bring them together.'
  },
  {
    id: 'book-3',
    catalogId: 'pachinko',
    title: 'Pachinko',
    author: 'Min Jin Lee',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 340,
    distance: '2.1 km',
    ownersCount: 5,
    category: 'History',
    status: 'available',
    ownerName: 'Amira Khan',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    ownerTrust: 'Fair (23 lends)',
    condition: 'Like New',
    availabilityMode: 'lending',
    bookType: 'Original Copy',
    description: 'An epic historical novel following a Korean family who immigrates to Japan through generations of hardship, triumph, and identity.'
  },
  {
    id: 'book-4',
    catalogId: 'stoner',
    title: 'Stoner',
    author: 'John Williams',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 120,
    distance: '2.9 km',
    ownersCount: 3,
    category: 'Fiction',
    status: 'available',
    ownerName: 'Diego Ramirez',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    ownerTrust: 'Verified (31 lends)',
    condition: 'Fair',
    availabilityMode: 'lending',
    bookType: 'Original Copy',
    description: 'William Stoner is born into a poor Missouri farm family at the end of the nineteenth century. Sent to the state university to study agriculture, he instead falls in love with English literature.'
  },
  {
    id: 'book-5',
    catalogId: 'kim-jiyoung-born-1982',
    title: 'Kim Jiyoung, Born 1982',
    author: 'Cho Nam-Joo',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800',
    rating: 4.4,
    reviewsCount: 95,
    distance: '3.7 km',
    ownersCount: 2,
    category: 'Non-fiction',
    status: 'available',
    ownerName: 'Hana Yamada',
    ownerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    ownerTrust: 'Fair (12 lends)',
    condition: 'Very Good',
    availabilityMode: 'lending',
    bookType: 'Original Copy',
    description: 'A groundbreaking feminist novel that captures the everyday reality of being a woman in modern society.'
  },
  {
    id: 'book-6',
    catalogId: 'the-godfather',
    title: 'The Godfather',
    author: 'Mario Puzo',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    reviewsCount: 410,
    distance: '4.1 km',
    ownersCount: 4,
    category: 'Fiction',
    status: 'available',
    ownerName: 'Kyla Taylor',
    ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    ownerTrust: 'Verified (45 lends)',
    condition: 'Good',
    availabilityMode: 'lending',
    bookType: 'Original Copy',
    description: 'The monumental tale of the Corleone family, crime, power, and loyalty that defined a genre.'
  },
  {
    id: 'book-7',
    catalogId: 'sapiens',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 820,
    distance: '3.2 km',
    ownersCount: 6,
    category: 'History',
    status: 'available',
    ownerName: 'Arif Ahmed',
    ownerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    ownerTrust: 'Verified (52 lends)',
    condition: 'Like New',
    availabilityMode: 'lending',
    bookType: 'Original Copy',
    description: 'From examining the role that evolving humans have played in the global ecosystem to charting the rise of empires.'
  },
  {
    id: 'book-8',
    catalogId: 'cosmos',
    title: 'Cosmos',
    author: 'Carl Sagan',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 615,
    distance: '4.8 km',
    ownersCount: 3,
    category: 'Science',
    status: 'available',
    ownerName: 'Elena Rostova',
    ownerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    ownerTrust: 'High (34 lends)',
    condition: 'Very Good',
    availabilityMode: 'lending',
    bookType: 'Original Copy',
    description: 'The story of cosmic evolution, science, and civilization told by one of the greatest astronomers of all time.'
  }
];

export const mockReaders: Reader[] = [
  {
    id: 'reader-1',
    name: 'Priya Shah',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    distance: '0.6 km',
    memberSince: '2024',
    booksAvailable: 14,
    dueSoon: 1,
    rating: 4.9,
    totalBorrows: 28
  },
  {
    id: 'reader-2',
    name: 'Jonas Meier',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    distance: '1.1 km',
    memberSince: '2022',
    booksAvailable: 6,
    rating: 4.8,
    totalBorrows: 19
  },
  {
    id: 'reader-3',
    name: 'Amira Khan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    distance: '1.8 km',
    memberSince: '2023',
    booksAvailable: 9,
    rating: 4.7,
    totalBorrows: 23
  },
  {
    id: 'reader-4',
    name: 'Diego Ramirez',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    distance: '2.4 km',
    memberSince: '2024',
    booksAvailable: 11,
    dueSoon: 2,
    rating: 4.9,
    totalBorrows: 31
  }
];
