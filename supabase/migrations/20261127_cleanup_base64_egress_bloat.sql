-- =====================================================================
-- BookCircle Cleanup: Strip Duplicated Base64 Blobs Causing High Egress
-- Date: 2026-11-27
-- Target: Live Supabase PostgreSQL (Run once in Supabase SQL Editor)
-- =====================================================================

-- 1. Remove oversized (>16KB) duplicated base64 avatars from books.owner_avatar
-- (BookCircle resolves owner avatars dynamically from public.profiles)
update public.books
set owner_avatar = ''
where owner_avatar like 'data:%'
  and length(owner_avatar) > 16000;

-- 2. Strip oversized (>16KB) base64 avatars embedded inside borrow_requests.message [BC_META] JSON
update public.borrow_requests
set message =
  split_part(message, '[BC_META]:', 1)
  || '[BC_META]:'
  || (
    (substring(message from '\[BC_META\]:(.*)$')::jsonb)
    || case
         when length(coalesce(substring(message from '\[BC_META\]:(.*)$')::jsonb->>'ownerAvatar', '')) > 16000
         then '{"ownerAvatar":""}'::jsonb
         else '{}'::jsonb
       end
    || case
         when length(coalesce(substring(message from '\[BC_META\]:(.*)$')::jsonb->>'borrowerAvatar', '')) > 16000
         then '{"borrowerAvatar":""}'::jsonb
         else '{}'::jsonb
       end
  )::text
where message like '%[BC_META]:%'
  and (
    length(coalesce(substring(message from '\[BC_META\]:(.*)$')::jsonb->>'ownerAvatar', '')) > 16000
    or length(coalesce(substring(message from '\[BC_META\]:(.*)$')::jsonb->>'borrowerAvatar', '')) > 16000
  );
