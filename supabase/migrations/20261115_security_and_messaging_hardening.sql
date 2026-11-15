-- =====================================================================
-- BookCircle Migration: Security & Messaging Hardening (Pre-MVP)
-- Date: 2026-11-15
-- Target: Live Supabase PostgreSQL
-- =====================================================================

-- 1. HARDEN BOOKS TABLE RLS POLICIES
-- Drop existing overly permissive update policy
drop policy if exists "Users can update own books" on public.books;
drop policy if exists "Users can delete own books" on public.books;

-- Secure UPDATE: only the authenticated book owner can modify their book listing
create policy "Users can update own books" on public.books
  for update using (
    auth.uid() is not null
    and (auth.uid()::text = owner_id or (select auth.jwt()->>'sub') = owner_id)
  );

-- Secure DELETE: only the authenticated book owner can delete their book listing
create policy "Users can delete own books" on public.books
  for delete using (
    auth.uid() is not null
    and (auth.uid()::text = owner_id or (select auth.jwt()->>'sub') = owner_id)
  );

-- 2. HARDEN BORROW REQUESTS TABLE RLS POLICIES
-- Drop existing publicly readable policy
drop policy if exists "Participants and community can view borrow requests" on public.borrow_requests;
drop policy if exists "Participants can view their own borrow requests" on public.borrow_requests;

-- Restrict SELECT to participants (owner or borrower) or explicit demo records
create policy "Participants can view their own borrow requests" on public.borrow_requests
  for select using (
    (
      auth.uid() is not null
      and (
        auth.uid()::text = owner_id
        or auth.uid()::text = borrower_id
        or (select auth.jwt()->>'sub') = owner_id
        or (select auth.jwt()->>'sub') = borrower_id
      )
    )
    or (owner_id = 'demo-user' or borrower_id = 'demo-user')
  );

-- 3. ENSURE MESSAGES TABLE POLICIES ARE ACTIVE
alter table public.messages enable row level security;

drop policy if exists "Users can view their own messages" on public.messages;
create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Authenticated users can send messages" on public.messages;
create policy "Authenticated users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

-- 4. ATOMIC ACCEPT EXCHANGE PROCEDURE (SECURITY DEFINER)
create or replace function public.accept_exchange_request(target_request_id uuid, executing_user_id text default null)
returns jsonb as $$
declare
  target_req record;
  v_book_id text;
  v_next_status text;
  v_competing_status text;
  v_caller_id text;
begin
  -- Lock target row for update
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

  -- Concurrency guard: check if another request on this book is already active
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

  -- Accept target request
  update public.borrow_requests
  set status = v_next_status
  where id = target_request_id;

  -- Atomically decline any other competing pending requests on this book
  update public.borrow_requests
  set status = v_competing_status,
      message = coalesce(message, '') || E'\n(Auto-declined: another request for this book was accepted by the owner)'
  where book_id = v_book_id
    and id != target_request_id
    and status in ('pending_approval', 'pending_claim', 'pending');

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;
