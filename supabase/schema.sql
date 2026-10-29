-- =====================================================================
-- BookCircle — Supabase Database Schema & Setup Script
-- =====================================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> Click "Run"

-- 1. Create PROFILES Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  avatar_url text,
  location text,
  distance text default 'Nearby',
  member_since text default to_char(now(), 'Month YYYY'),
  bio text,
  trust_tier text default 'Tier 1 · Novice Reader',
  trust_score text default '100% on schedule',
  total_borrows integer default 0,
  books_available integer default 0,
  books_for_lending integer default 0,
  books_for_donation integer default 0,
  verified boolean default true,
  created_at timestamptz default now()
);

-- 2. Create BOOKS Table
create table if not exists public.books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  cover_image text not null,
  rating numeric(3, 2) default 4.8,
  reviews_count integer default 1,
  category text default 'Fiction',
  status text default 'available' check (status in ('available', 'lent_out', 'donation', 'claimed')),
  availability_mode text default 'lending' check (availability_mode in ('lending', 'donation')),
  condition text default 'Like New' check (condition in ('Like New', 'Very Good', 'Good', 'Fair')),
  description text,
  distance text default 'Nearby',
  owners_count integer default 1,
  owner_id text,
  owner_name text not null,
  owner_avatar text,
  created_at timestamptz default now()
);

-- 3. Create BORROW_REQUESTS Table
create table if not exists public.borrow_requests (
  id uuid default gen_random_uuid() primary key,
  book_id text,
  book_title text,
  borrower_id text,
  borrower_name text,
  owner_id text,
  owner_name text,
  exchange_type text default 'borrow' check (exchange_type in ('borrow', 'gift')),
  status text default 'pending' check (status in ('pending', 'accepted', 'handed_over', 'returned', 'cancelled', 'claimed')),
  meetup_date text,
  meetup_time text,
  meetup_spot text,
  message text,
  created_at timestamptz default now()
);

-- 4. Create MESSAGES Table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 5. Create WISHLIST Table
create table if not exists public.wishlists (
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id uuid references public.books(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, book_id)
);

-- =====================================================================
-- 6. Trigger: Auto-create Profile when a new user signs up via Auth
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    location,
    member_since
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'),
    'Nearby Neighborhood',
    to_char(now(), 'Month YYYY')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================================
-- 7. Enable Row Level Security (RLS)
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.borrow_requests enable row level security;
alter table public.messages enable row level security;
alter table public.wishlists enable row level security;

-- Profiles: Anyone can view; users can edit their own
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Books: Anyone can view and add books
create policy "Books are viewable by everyone" on public.books for select using (true);
create policy "Anyone can add books" on public.books for insert with check (true);
create policy "Users can update own books" on public.books for update using (true);

-- Borrow Requests: Anyone can view, create, and update
create policy "Anyone can view borrow requests" on public.borrow_requests for select using (true);
create policy "Anyone can create borrow requests" on public.borrow_requests for insert with check (true);
create policy "Anyone can update borrow requests" on public.borrow_requests for update using (true);

-- Messages: Sender or receiver can view
create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Authenticated users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

-- Wishlist: Users can view and manage their own
create policy "Users can view own wishlist" on public.wishlists for select using (auth.uid() = user_id);
create policy "Users can add to own wishlist" on public.wishlists for insert with check (auth.uid() = user_id);
create policy "Users can remove from own wishlist" on public.wishlists for delete using (auth.uid() = user_id);

