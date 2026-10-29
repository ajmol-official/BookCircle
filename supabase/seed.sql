-- =====================================================================
-- BookCircle — Seed Initial Books (Run in Supabase SQL Editor if desired)
-- =====================================================================

insert into public.books (title, author, cover_image, rating, reviews_count, category, status, availability_mode, condition, description, distance, owner_name, owner_avatar)
values
  (
    'The God of Small Things',
    'Arundhati Roy',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    4.8,
    312,
    'Fiction',
    'available',
    'lending',
    'Like New',
    'A story about the childhood experiences of fraternal twins whose lives are destroyed by the Love Laws.',
    '1.2 km away',
    'Arif Ahmed',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200'
  ),
  (
    'The Night Circus',
    'Erin Morgenstern',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    4.6,
    231,
    'Fiction',
    'available',
    'lending',
    'Very Good',
    'The circus arrives without warning. It is simply there, when yesterday it was not.',
    '0.8 km away',
    'Priya Shah',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  ),
  (
    'A Short History of Nearly Everything',
    'Bill Bryson',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800',
    4.9,
    540,
    'Science',
    'donation',
    'donation',
    'Like New',
    'A delightful and witty guide to the universe, physics, chemistry, geology and biology.',
    '0.4 km away',
    'Rahim Chowdhury',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  ),
  (
    'Sapiens: A Brief History of Humankind',
    'Yuval Noah Harari',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800',
    4.9,
    820,
    'History',
    'available',
    'lending',
    'Like New',
    'From examining the role that evolving humans have played in the global ecosystem to charting the rise of empires.',
    '3.2 km away',
    'Diego Ramirez',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  )
on conflict do nothing;

