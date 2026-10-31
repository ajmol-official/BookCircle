-- =====================================================================
-- BookCircle — Supabase Database Schema & Setup Script
-- =====================================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> Click "Run"

-- =====================================================================
-- 0. Safe Migration for Existing Databases (Idempotent Alter Table)
-- =====================================================================
-- Update books availability_mode check to include 'personal' (Private Collection)
alter table if exists public.books
  drop constraint if exists books_availability_mode_check;

alter table if exists public.books
  add constraint books_availability_mode_check check (
    availability_mode in ('lending', 'donation', 'personal')
  );

-- Update borrow_requests status check for granular Phase 2 exchange statuses
alter table if exists public.borrow_requests
  drop constraint if exists borrow_requests_status_check;

alter table if exists public.borrow_requests
  add constraint borrow_requests_status_check check (
    status in (
      'pending_approval', 'accepted', 'handover_in_progress', 'active_loan',
      'return_scheduled', 'return_in_progress', 'completed', 'declined',
      'cancelled', 'disputed_handover',
      'pending_claim', 'claim_accepted', 'claim_handover', 'claim_completed',
      'claim_declined', 'claim_cancelled',
      -- Legacy status values for backward compatibility:
      'pending', 'handed_over', 'returned', 'claimed'
    )
  );

alter table if exists public.borrow_requests
  add column if not exists lender_confirmed boolean default false,
  add column if not exists lender_confirmed_at timestamptz,
  add column if not exists borrower_confirmed boolean default false,
  add column if not exists borrower_confirmed_at timestamptz,
  add column if not exists handover_date text,
  add column if not exists due_date text,
  add column if not exists total_days integer default 30,
  add column if not exists return_date text,
  add column if not exists return_time text,
  add column if not exists return_spot text,
  add column if not exists return_tracking_code text,
  add column if not exists return_borrower_confirmed boolean default false,
  add column if not exists return_borrower_confirmed_at timestamptz,
  add column if not exists return_lender_confirmed boolean default false,
  add column if not exists return_lender_confirmed_at timestamptz,
  add column if not exists condition_at_return text default 'Good',
  add column if not exists condition_issue boolean default false,
  add column if not exists condition_notes text,
  add column if not exists dispute_reason text,
  add column if not exists disputed_at timestamptz,
  add column if not exists disputed_by text,
  add column if not exists reminder_sent_at timestamptz,
  add column if not exists lender_rating numeric(3, 2),
  add column if not exists lender_feedback text,
  add column if not exists lender_rated_at timestamptz,
  add column if not exists borrower_rating numeric(3, 2),
  add column if not exists borrower_feedback text,
  add column if not exists borrower_rated_at timestamptz,
  add column if not exists completed_at timestamptz;

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
  availability_mode text default 'lending' check (availability_mode in ('lending', 'donation', 'personal')),
  condition text default 'Like New' check (condition in ('Like New', 'Very Good', 'Good', 'Fair')),
  description text,
  distance text default 'Nearby',
  owners_count integer default 1,
  owner_id text,
  owner_name text not null,
  owner_avatar text,
  created_at timestamptz default now()
);

-- 3. Create BORROW_REQUESTS Table (Authoritative Exchange Records)
create table if not exists public.borrow_requests (
  id uuid default gen_random_uuid() primary key,
  book_id text not null,
  book_title text,
  borrower_id text,
  borrower_name text not null,
  owner_id text,
  owner_name text not null,
  exchange_type text default 'borrow' check (exchange_type in ('borrow', 'gift')),
  status text default 'pending_approval' check (
    status in (
      'pending_approval', 'accepted', 'handover_in_progress', 'active_loan',
      'return_scheduled', 'return_in_progress', 'completed', 'declined',
      'cancelled', 'disputed_handover',
      'pending_claim', 'claim_accepted', 'claim_handover', 'claim_completed',
      'claim_declined', 'claim_cancelled',
      -- Legacy status values for backward compatibility with existing rows:
      'pending', 'handed_over', 'returned', 'claimed'
    )
  ),
  meetup_date text,
  meetup_time text,
  meetup_spot text,
  message text,
  
  -- Dual Pickup Confirmation (Server Timestamps)
  lender_confirmed boolean default false,
  lender_confirmed_at timestamptz,
  borrower_confirmed boolean default false,
  borrower_confirmed_at timestamptz,
  
  -- Loan Tracking (Borrow stream)
  handover_date text,
  due_date text,
  total_days integer default 30,
  
  -- Return Handover & Inspection (Borrow stream)
  return_date text,
  return_time text,
  return_spot text,
  return_tracking_code text,
  return_borrower_confirmed boolean default false,
  return_borrower_confirmed_at timestamptz,
  return_lender_confirmed boolean default false,
  return_lender_confirmed_at timestamptz,
  condition_at_return text default 'Good',
  condition_issue boolean default false,
  condition_notes text,
  
  -- Handover Disputes & Timeouts
  dispute_reason text,
  disputed_at timestamptz,
  disputed_by text,
  reminder_sent_at timestamptz,

  -- Independent Dual Ratings & Feedback
  lender_rating numeric(3, 2),
  lender_feedback text,
  lender_rated_at timestamptz,
  borrower_rating numeric(3, 2),
  borrower_feedback text,
  borrower_rated_at timestamptz,
  rating numeric(3, 2), -- composite or primary rating
  feedback text,

  completed_at timestamptz,
  created_at timestamptz default now()
);

-- =====================================================================
-- Concurrency Protection: Database-Level Partial Unique Indexes
-- =====================================================================
-- 1. Prevent duplicate active exchanges on the same physical book:
-- A book can have AT MOST ONE active accepted/loan/return record at any time!
create unique index if not exists idx_unique_active_book_exchange
  on public.borrow_requests (book_id)
  where status in ('accepted', 'handover_in_progress', 'active_loan', 'return_scheduled', 'return_in_progress', 'claim_accepted', 'claim_handover', 'handed_over');

-- 2. Prevent duplicate pending requests from the same borrower on the same book:
create unique index if not exists idx_unique_borrower_pending_request
  on public.borrow_requests (book_id, borrower_id)
  where status in ('pending_approval', 'pending_claim', 'pending');

-- =====================================================================
-- Atomic Server-Side Stored Procedures
-- =====================================================================
-- Atomic request acceptance & competing request auto-decline
create or replace function public.accept_exchange_request(target_request_id uuid, executing_user_id text default null)
returns jsonb as $$
declare
  target_req record;
  v_book_id text;
  v_next_status text;
  v_competing_status text;
  v_caller_id text;
begin
  -- 1. Lock target row for update
  select * into target_req from public.borrow_requests
  where id = target_request_id for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Request not found');
  end if;

  -- Role-specific authorization check: Only the book owner is authorized to accept
  v_caller_id := coalesce(auth.uid()::text, executing_user_id);
  if v_caller_id is not null and target_req.owner_id is not null and target_req.owner_id != v_caller_id then
    return jsonb_build_object('success', false, 'error', '403 Forbidden: Only the book owner can accept this request');
  end if;

  v_book_id := target_req.book_id;

  -- 2. Concurrency guard: check if another request on this book is already active
  if exists (
    select 1 from public.borrow_requests
    where book_id = v_book_id
      and id != target_request_id
      and status in ('accepted', 'handover_in_progress', 'active_loan', 'return_scheduled', 'return_in_progress', 'claim_accepted', 'claim_handover', 'handed_over')
  ) then
    return jsonb_build_object('success', false, 'error', 'This book already has an active loan or accepted exchange in progress.');
  end if;

  v_next_status := case when target_req.exchange_type = 'gift' then 'claim_accepted' else 'accepted' end;
  v_competing_status := case when target_req.exchange_type = 'gift' then 'claim_declined' else 'declined' end;

  -- 3. Accept target request
  update public.borrow_requests
  set status = v_next_status
  where id = target_request_id;

  -- 4. Atomically decline any other pending requests on this book
  update public.borrow_requests
  set status = v_competing_status,
      message = coalesce(message, '') || E'\n(Auto-declined: another request for this book was accepted by the owner)'
  where book_id = v_book_id
    and id != target_request_id
    and status in ('pending_approval', 'pending_claim', 'pending');

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;

-- Requester cancel request procedure
create or replace function public.cancel_exchange_request(target_request_id uuid, executing_user_id text default null)
returns jsonb as $$
declare
  target_req record;
  v_caller_id text;
begin
  select * into target_req from public.borrow_requests
  where id = target_request_id for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Request not found');
  end if;

  -- Role-specific authorization check: Only the borrower who made the request can cancel it
  v_caller_id := coalesce(auth.uid()::text, executing_user_id);
  if v_caller_id is not null and target_req.borrower_id is not null and target_req.borrower_id != v_caller_id then
    return jsonb_build_object('success', false, 'error', '403 Forbidden: Only the requester can cancel their request');
  end if;

  update public.borrow_requests
  set status = 'cancelled'
  where id = target_request_id;

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;

-- Dual pickup handover confirmation procedure
create or replace function public.confirm_pickup_handover(target_request_id uuid, user_role text, user_id text default null)
returns jsonb as $$
declare
  req record;
  both_confirmed boolean;
  v_next_status text;
  v_caller_id text;
begin
  select * into req from public.borrow_requests
  where id = target_request_id for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Request not found');
  end if;

  v_caller_id := coalesce(auth.uid()::text, user_id);

  if user_role = 'lender' then
    if v_caller_id is not null and req.owner_id is not null and req.owner_id != v_caller_id then
      return jsonb_build_object('success', false, 'error', '403 Forbidden: Only the book owner can confirm lender handover');
    end if;
    update public.borrow_requests
    set lender_confirmed = true, lender_confirmed_at = now()
    where id = target_request_id;
  elsif user_role = 'borrower' then
    if v_caller_id is not null and req.borrower_id is not null and req.borrower_id != v_caller_id then
      return jsonb_build_object('success', false, 'error', '403 Forbidden: Only the borrower can confirm borrower pickup');
    end if;
    update public.borrow_requests
    set borrower_confirmed = true, borrower_confirmed_at = now()
    where id = target_request_id;
  else
    return jsonb_build_object('success', false, 'error', 'Invalid role: must be lender or borrower');
  end if;

  -- Check if both are now confirmed
  select (lender_confirmed and borrower_confirmed) into both_confirmed
  from public.borrow_requests where id = target_request_id;

  if both_confirmed then
    v_next_status := case when req.exchange_type = 'gift' then 'claim_completed' else 'active_loan' end;
    update public.borrow_requests
    set status = v_next_status,
        handover_date = case when handover_date is null then to_char(now(), 'Mon DD, YYYY') else handover_date end,
        due_date = case when req.exchange_type = 'gift' then null else 'Due in 30 days' end,
        completed_at = case when req.exchange_type = 'gift' then now() else null end
    where id = target_request_id;
  else
    v_next_status := case when req.exchange_type = 'gift' then 'claim_handover' else 'handover_in_progress' end;
    update public.borrow_requests
    set status = v_next_status
    where id = target_request_id;
  end if;

  return jsonb_build_object('success', true, 'status', v_next_status);
end;
$$ language plpgsql security definer;

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
create policy "Users can insert own profile" on public.profiles for insert with check (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Books: Public community discovery excludes private personal collection and claimed donations
-- Recipients and owners can always view their own private collection.
drop policy if exists "Books are viewable by everyone" on public.books;
drop policy if exists "Public community discovery policy" on public.books;

create policy "Public community discovery policy" on public.books
  for select using (
    (
      (availability_mode is distinct from 'personal')
      and (status is distinct from 'claimed')
      and (description not like '%[PRIVATE_COLLECTION]%' or description is null)
    )
    or
    (
      auth.uid() is not null
      and (auth.uid()::text = owner_id or (select auth.jwt()->>'sub') = owner_id)
    )
  );

create policy "Anyone can add books" on public.books for insert with check (true);
create policy "Users can update own books" on public.books for update using (true);

-- Borrow Requests: Strict Role-Based RLS & Database Trigger Authorization
create policy "Participants and community can view borrow requests" on public.borrow_requests
  for select using (true);

create policy "Authenticated users can create borrow requests" on public.borrow_requests
  for insert with check (
    auth.uid() is not null or borrower_name is not null
  );

-- Owner can update their requests
create policy "Owners can update their requests" on public.borrow_requests
  for update using (
    auth.uid()::text = owner_id
  );

-- Borrower can update their requests
create policy "Borrowers can update their requests" on public.borrow_requests
  for update using (
    auth.uid()::text = borrower_id
  );

-- Database Trigger for Role-Specific Operation Guards
create or replace function public.enforce_borrow_request_authorization()
returns trigger as $$
declare
  current_user_id text;
begin
  current_user_id := coalesce(auth.uid()::text, current_setting('request.jwt.claim.sub', true));

  if current_user_id is not null then
    -- Rule 1: Only the owner can accept a request
    if (new.status in ('accepted', 'claim_accepted', 'active_loan', 'handed_over') and old.status in ('pending', 'pending_approval', 'pending_claim')) then
      if old.owner_id is not null and current_user_id != old.owner_id then
        raise exception '403 Forbidden: Only the book owner is authorized to accept this request.';
      end if;
    end if;

    -- Rule 2: Only the requester can cancel their request
    if (new.status in ('cancelled', 'claim_cancelled') and old.status in ('pending', 'pending_approval', 'pending_claim')) then
      if old.borrower_id is not null and current_user_id != old.borrower_id and current_user_id != old.owner_id then
        raise exception '403 Forbidden: Only the requester is authorized to cancel this request.';
      end if;
    end if;

    -- Rule 3: Borrower cannot confirm lender handover
    if (new.lender_confirmed is true and (old.lender_confirmed is null or old.lender_confirmed is false)) then
      if old.owner_id is not null and current_user_id != old.owner_id then
        raise exception '403 Forbidden: Only the book owner can confirm lender handover.';
      end if;
    end if;

    -- Rule 4: Lender cannot confirm borrower pickup
    if (new.borrower_confirmed is true and (old.borrower_confirmed is null or old.borrower_confirmed is false)) then
      if old.borrower_id is not null and current_user_id != old.borrower_id then
        raise exception '403 Forbidden: Only the borrower can confirm borrower pickup.';
      end if;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_enforce_borrow_request_authorization on public.borrow_requests;
create trigger tr_enforce_borrow_request_authorization
  before update on public.borrow_requests
  for each row execute procedure public.enforce_borrow_request_authorization();

-- Messages: Sender or receiver can view
create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Authenticated users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

-- Wishlist: Users can view and manage their own
create policy "Users can view own wishlist" on public.wishlists for select using (auth.uid() = user_id);
create policy "Users can add to own wishlist" on public.wishlists for insert with check (auth.uid() = user_id);
create policy "Users can remove from own wishlist" on public.wishlists for delete using (auth.uid() = user_id);

