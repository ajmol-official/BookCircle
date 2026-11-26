-- =====================================================================
-- BookCircle Migration: Persistent User Reading Status Table & Book Catalog ID
-- Date: 2026-11-26
-- Target: Live Supabase PostgreSQL (Run once in Supabase SQL Editor)
-- =====================================================================

-- 1. Ensure books.catalog_id exists for consistent canonical/reading-status linking
alter table if exists public.books
  add column if not exists catalog_id text;

-- 2. Create normalized user_reading_status table (internal & owner-scoped)
create table if not exists public.user_reading_status (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  catalog_id text not null,
  status text not null check (status in ('read', 'reading', 'want_to_read')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint user_reading_status_unique unique (user_id, catalog_id)
);

create index if not exists idx_user_reading_status_lookup
  on public.user_reading_status(user_id, catalog_id);

-- 3. Enable Row-Level Security and enforce strict per-user access
alter table public.user_reading_status enable row level security;

drop policy if exists "Users can view own reading status" on public.user_reading_status;
create policy "Users can view own reading status"
  on public.user_reading_status for select
  using (auth.uid() is not null and (auth.uid()::text = user_id or (select auth.jwt()->>'sub') = user_id));

drop policy if exists "Users can manage own reading status" on public.user_reading_status;
create policy "Users can manage own reading status"
  on public.user_reading_status for all
  using (auth.uid() is not null and (auth.uid()::text = user_id or (select auth.jwt()->>'sub') = user_id))
  with check (auth.uid() is not null and (auth.uid()::text = user_id or (select auth.jwt()->>'sub') = user_id));

-- 4. Refresh PostgREST schema cache immediately
notify pgrst, 'reload schema';
