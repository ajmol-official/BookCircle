# AI-Powered Book & Author Catalog System — Backend Architecture & Handoff Plan

> **Status:** Proposed Architecture / Pre-Implementation Note (Deferred)  
> **Audience:** Backend & Full-Stack Engineers  
> **Scope:** Planning specification only — **no backend endpoints or database migrations have been implemented yet.**

---

## 1. Purpose & Product Principles

BookCircle wants to introduce an AI-assisted book and author catalog management system to make adding books faster while building a clean, deduplicated, verifiable catalog.

Any backend implementation must preserve these core rules:
- **Never auto-overwrite user input** without confirmation.
- **Never block book listing** if external metadata APIs or AI providers are slow, rate-limited, or down.
- **Never fabricate author data** (bios, birth dates, photos, nationalities, ISBNs). Populate only from verified external metadata, user submissions, or admin entries.
- **Never mark AI-retrieved or external-API metadata as `admin_verified`.** Track provenance explicitly.
- **Zero API secrets in frontend code.** All AI keys, Google Books keys, and Supabase service role keys must stay server-side.

---

## 2. Current Codebase & Database Snapshot (What Exists Today)

Before writing migrations or endpoints, note these architectural realities in the current repo:

| Area | Current State | Key Files |
| :--- | :--- | :--- |
| **Frontend Stack** | React 19 + TypeScript + Vite SPA hosted on Vercel (`@supabase/supabase-js`). | `package.json`, `vercel.json` |
| **Vercel Routing** | `vercel.json` currently has a catch-all rewrite `/(.*) -> /index.html`. **Must exclude `/api/*`** (e.g. `"/((?!api/).*)"`) before adding Vercel Serverless Functions. | `vercel.json` |
| **Backend Layer** | **None.** No `api/` directory and no `supabase/functions/` directory exist yet. | Root directory |
| **User Physical Copies (`public.books`)** | Stored in Supabase (`id`, `title`, `author`, `cover_image`, `rating`, `reviews_count`, `category`, `status`, `availability_mode`, `condition`, `description`, `distance`, `owners_count`, `owner_id`, `owner_name`, `owner_avatar`, `created_at`, `catalog_id`). Linked to authors only by plain-text `author` string—no `author_id` FK, `isbn`, `publisher`, `published_date`, or contributor array. | `supabase/schema.sql`, `supabase/migrations/20261126_user_reading_status.sql` |
| **Canonical Books** | Hardcoded static TypeScript array `canonicalCatalogBooks`. | `src/data/canonicalCatalog.ts` |
| **Authors & Review Queue** | Hardcoded `initialAuthors` merged with **browser `localStorage`** (`bookcircle_custom_authors`, `bookcircle_writer_applications`, `bookcircle_writer_work_suggestions`). Missing authors fall back to an unsaved in-memory object via `getOrCreateAuthor`. | `src/data/authors.ts`, `src/context/WriterContext.tsx`, `src/App.tsx` |
| **Admin Gate (Insecure Today)** | `AdminWriterReviewModal` and `Navbar` gate access using `currentUser?.isAdmin`, `email?.includes('admin')`, or `localStorage.getItem('bookcircle_admin_override') === 'true'`. **Must be replaced with server + RLS `profiles.is_admin` checks.** | `src/components/writer/AdminWriterReviewModal.tsx`, `src/components/Navbar.tsx` |
| **Book Categories** | `AddBookModal` limits `category` to 6 values: `General`, `Fiction`, `Non-fiction`, `Science`, `History`, `Poetry` (plus academic classification). Finer genres like `Fantasy`, `Science Fiction`, `Romance`, `Mystery`, `Thriller`, `Philosophy`, `Biography` are not yet in `CATEGORY_OPTIONS`. | `src/components/mybooks/AddBookModal.tsx` |
| **Slug Generation Gap** | `generateAuthorSlug` strips `[^a-z0-9]+`, causing non-ASCII scripts (e.g., Bengali, Arabic) to collapse to empty strings and failing on initials/diacritics (`J.R.R.` vs `J. R. R.`). | `src/data/authors.ts` |

---

## 3. Recommended External APIs & Modular AI Layer

Prioritize structured metadata APIs first; invoke AI only when deterministic lookup needs help.

### A. External Metadata Sources

1. **Google Books API** *(Primary for Book Search & Modern Editions)*
   - **Provides:** Typo-tolerant book search, title, author strings, description, categories, publisher, `publishedDate`, ISBN-10/13, cover thumbnails.
   - **Limitation:** Does **not** return rich author biographies, birth dates, or author photos.
   - **Quota:** **1,000 requests/day free** with a server-side Google Cloud API key. Cache responses in Supabase so repeat queries never hit Google Books twice.

2. **Open Library API** *(Primary for Author Metadata & Fallback Books)*
   - **Endpoints:** `/search/authors.json`, `/authors/{OLID}.json`, `/search.json`, `/works/{OLID}.json`.
   - **Provides:** Author name, `alternate_names`, `bio`, `birth_date`, `photos`, and `remote_ids` (Wikidata, Wikipedia, Goodreads, ISNI), plus works and subjects.
   - **Quota:** Free, no key required. Send a descriptive `User-Agent` header, avoid burst traffic, and persist results in Supabase.

3. **Wikidata / Wikipedia REST API** *(Optional Phase 3/4 Fallback)*
   - Useful for non-English/regional authors missing photos or nationality in Open Library.

### B. Modular AI Provider (`CatalogAIProvider`)

Keep AI behind a provider-agnostic TypeScript interface so models/vendors can be swapped via environment variables (e.g. `AI_PROVIDER=gemini`):

```ts
export interface CatalogAIProvider {
  suggestTitleCorrection(input: {
    rawTitle: string;
    authorHint?: string;
  }): Promise<{
    correctedTitle: string | null;
    inferredAuthor: string | null;
    confidence: number;
    reason?: string;
  }>;

  mapBookGenres(input: {
    title: string;
    description?: string;
    externalSubjects?: string[];
    allowedCategories: readonly string[];
  }): Promise<{
    primaryCategory: string;
    suggestedGenres: string[];
  }>;
}
```

- **Recommended Initial Model:** Gemini 2.5 Flash-Lite / Flash (fallback adapter: OpenAI `gpt-4o-mini`).
- **Call Trigger Rule:** **Never invoke AI on every keystroke.** Trigger sequence on book search:
  1. Debounced local Supabase lookup (`catalog_works` + `books`) — `$0` cost.
  2. External search (`Google Books` + `Open Library`) only on settled input (`>= 650ms`), Enter key, or explicit `"Identify Book"` click.
  3. AI typo correction **only** when deterministic local + external search returns weak/zero matches.

---

## 4. Proposed Supabase Schema Changes

Preserve `public.books` for user-owned physical copies (lending, donation, showcase) and introduce **3 normalized tables** plus `profiles.is_admin`.

### A. Updates to Existing Tables

1. **`public.profiles`**
   - Add `is_admin boolean not null default false`.
2. **`public.books`**
   - Ensure additive columns already drafted in `supabase/schema.sql` (`translator`, `translation_language`, `book_classification`, `general_type`, `edition`, `education_level`, `academic_metadata`) are properly migrated.
   - Add nullable catalog linkage & edition metadata:
     - `catalog_work_id uuid references public.catalog_works(id)`
     - `author_id uuid references public.authors(id)`
     - `contributors jsonb` (snapshot/override if different edition)
     - `isbn_10 text`, `isbn_13 text`, `publisher text`, `published_date text`
   - Tighten RLS insert policy from `with check (true)` to `with check (auth.uid()::text = owner_id)`.

### B. New Tables

#### 1. `public.authors`
Replaces hardcoded `initialAuthors` and `localStorage` `bookcircle_custom_authors`.

| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `uuid primary key default gen_random_uuid()` | Internal canonical ID |
| `slug` | `text unique not null` | Unicode-safe URL slug |
| `name` | `text not null` | Display name |
| `normalized_name` | `text not null` | NFKD/lowercase/alphanumeric deduplication key |
| `alternate_names` | `text[] default '{}'` | Pen names, transliterations, initials variants |
| `pen_name` | `text` | Preserves existing `Author.penName` |
| `bio` | `text` | Verified/source-backed biography (null if unavailable) |
| `photo_url` | `text` | Verified/source-backed portrait |
| `birth_date` | `text` | e.g., `"1947"` or `"1961-11-24"` |
| `nationality` | `text` | Verified nationality |
| `country_flag` | `text` | Display flag |
| `profession` | `text` | e.g., `"Novelist"`, `"Philosopher"` |
| `website_url` | `text` | Official author site |
| `social_links` | `jsonb default '{}'` | Preserves `Author.socialLinks` |
| `external_ids` | `jsonb default '{}'` | `{ open_library_id, wikidata_id, goodreads_id }` |
| `metadata_source` | `text not null` | `'admin' \| 'open_library' \| 'google_books' \| 'user_submitted'` |
| `field_sources` | `jsonb default '{}'` | Per-field provenance map (e.g., `{"bio": "open_library"}`) |
| `verification_status` | `text not null default 'unverified'` | `'unverified' \| 'source_backed' \| 'admin_verified'` |
| `unavailable_fields` | `text[] default '{}'` | Fields confirmed unavailable by admin (prevents re-flagging) |
| `is_claimed` / `claimed_user_id` | `boolean` / `uuid` | Preserves existing writer claiming workflow |
| `created_at` / `updated_at` | `timestamptz` | Audit timestamps |

#### 2. `public.catalog_works`
Caches canonical books retrieved locally or from external APIs.

| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `uuid primary key default gen_random_uuid()` | Canonical work ID |
| `slug` | `text unique not null` | Matches `books.catalog_id` style slug |
| `title` | `text not null` | Canonical title |
| `normalized_title` | `text not null` | Search/deduplication key |
| `primary_author_id` | `uuid references public.authors(id)` | Main author link |
| `contributors` | `jsonb default '[]'` | Multi-author / translator / editor array: `[{ author_id, name, role }]` |
| `description` | `text` | Book synopsis from reliable metadata |
| `primary_category` | `text not null` | Mapped BookCircle category |
| `genres` | `text[] default '{}'` | Controlled genre tags |
| `external_subjects` | `text[] default '{}'` | Raw API subjects preserved for auditing |
| `publisher` | `text` | Publisher name |
| `published_date` | `text` | Publication year/date |
| `isbn_10` / `isbn_13` | `text` | Unique/indexed ISBN lookup keys |
| `cover_url` | `text` | Cover URL |
| `external_ids` | `jsonb default '{}'` | `{ google_books_id, open_library_work_id }` |
| `metadata_source` | `text not null` | `'seed' \| 'google_books' \| 'open_library' \| 'user_submitted' \| 'admin'` |
| `verification_status` | `text not null default 'unverified'` | `'unverified' \| 'source_backed' \| 'admin_verified'` |
| `created_at` / `updated_at` | `timestamptz` | Audit timestamps |

#### 3. `public.author_review_requests`
Deduplicated queue for missing, unknown, or partially enriched authors.

| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | `uuid primary key default gen_random_uuid()` | Review ticket ID |
| `author_id` | `uuid references public.authors(id)` | Created/linked author record |
| `author_name` | `text not null` | Display author name |
| `normalized_author_name` | `text not null` | Used for deduplication |
| `associated_book_ids` | `text[] default '{}'` | Books referencing this author |
| `associated_book_titles` | `text[] default '{}'` | Human-readable titles for admin review |
| `available_data` | `jsonb default '{}'` | Snapshot of found fields + sources |
| `missing_fields` | `text[] default '{}'` | e.g., `['bio', 'photo_url', 'birth_date']` |
| `sources_checked` | `text[] default '{}'` | e.g., `['open_library', 'google_books']` |
| `ai_suggestions` | `jsonb` | Unverified AI hints only (clearly flagged) |
| `reason` | `text not null` | `'not_found' \| 'partial_metadata' \| 'ambiguous_match' \| 'user_submitted'` |
| `status` | `text not null default 'pending_review'` | `'pending_review' \| 'approved' \| 'dismissed' \| 'needs_info'` |
| `admin_notes` | `text` | Reviewer notes |
| `reviewed_by` | `uuid references public.profiles(id)` | Admin user ID |
| `reviewed_at` | `timestamptz` | Review timestamp |
| `created_at` / `updated_at` | `timestamptz` | Audit timestamps |

**Critical Deduplication Constraint:**
```sql
create unique index idx_open_author_review_unique
on public.author_review_requests (normalized_author_name)
where status in ('pending_review', 'needs_info');
```
When multiple users add books for the same unresolved author, upsert onto this index to append to `associated_book_ids` / `associated_book_titles` instead of opening duplicate review items.

---

## 5. Proposed Backend API Endpoints (Vercel Serverless Functions `/api/*`)

All endpoints require `Authorization: Bearer <supabase_access_token>` verified via Supabase Auth.

| Endpoint | Method | Auth | Responsibility |
| :--- | :--- | :--- | :--- |
| `/api/catalog/suggest` | `POST` | Authenticated User | Accepts `{ title, authorHint?, isbn? }`. Checks `catalog_works` -> `Google Books` + `Open Library`. Runs AI typo fix & genre mapping **only** when needed. Returns ranked suggestions with explicit `source` badges (`catalog`, `google_books`, `open_library`, `ai_suggestion`). |
| `/api/catalog/resolve-book` | `POST` | Authenticated User | Called when user confirms a book submission. Upserts `catalog_works` (if external/new), resolves or creates `authors` via Open Library lookup + alias matching, and automatically upserts `author_review_requests` if author is missing or incomplete. Returns `catalog_work_id` + `author_id` to attach to `public.books`. |
| `/api/admin/author-reviews` | `GET` | Admin (`profiles.is_admin = true`) | Lists review requests filtered by `status` (`pending_review`, `approved`, `dismissed`). |
| `/api/admin/author-reviews/[id]` | `PATCH` | Admin (`profiles.is_admin = true`) | Approves & updates author profile (`verification_status = 'admin_verified'`), marks fields unavailable (`unavailable_fields`), merges duplicate authors, or dismisses request. |

---

## 6. Security, Data Validation & Deduplication Rules

1. **Authentication & RBAC:**
   - Never trust client flags (`email.includes('admin')` or `localStorage`).
   - Verify Supabase JWT on every `/api/*` request and verify `profiles.is_admin === true` in both serverless handlers and Postgres RLS policies.
2. **Row Level Security (RLS):**
   - `authors` & `catalog_works`: Public `SELECT`; direct `INSERT`/`UPDATE` locked to service role / admins (plus safe profile updates by verified `claimed_user_id` excluding `verification_status`).
   - `author_review_requests`: `SELECT` and `UPDATE` restricted strictly to `profiles.is_admin = true`.
3. **Input & Output Validation:**
   - Validate all incoming payloads and AI JSON responses with `zod` before DB writes.
   - Strip/reject malformed URLs, HTML/script injections, or out-of-range fields from external APIs.
4. **Rate Limiting & Cost Guardrails:**
   - Enforce per-user sliding window limits (e.g., max `20` AI calls/user/hour, `60` external metadata lookups/user/hour) + global daily circuit breaker so Google Books stays under `1,000 req/day`.
5. **Duplicate Prevention Pipeline:**
   - Books: `isbn_13` -> `isbn_10` -> `external_ids->>'google_books_id'` -> `normalized(title + primary_author)`.
   - Authors: `external_ids->>'open_library_id'` -> `normalized_name` -> `alternate_names @> ARRAY[input_name]`.

---

## 7. Phased Implementation Roadmap

1. **Phase 1 — Foundation (DB + Auth + Server Proxy):**
   - Run Supabase migration (`profiles.is_admin`, `authors`, `catalog_works`, `author_review_requests`, additive `books` columns + RLS).
   - Seed `canonicalCatalogBooks` and `initialAuthors` into Supabase.
   - Configure `vercel.json` (`/((?!api/).*)`) + `/api/` auth middleware + rate limiter.
2. **Phase 2 — Core MVP (Smart Book Search + Typo Fix + Genre Mapping):**
   - Build `/api/catalog/suggest` integrating Supabase cache, Google Books, Open Library, and modular `CatalogAIProvider`.
   - Connect `AddBookModal` suggestion UI (explicit confirmation only, editable genre pills, silent fallback if AI/APIs fail).
3. **Phase 3 — Author Resolution & Admin Review Queue:**
   - Build `/api/catalog/resolve-book` with Open Library author lookup, alias matching, and deduplicated `author_review_requests` creation.
   - Replace `WriterContext` `localStorage` mocks with Supabase tables and upgrade `AdminWriterReviewModal` with Edit / Verify / Mark Unavailable / Merge / Dismiss controls.
4. **Phase 4 — Multi-Contributor & International Enrichment (Post-MVP):**
   - Full UI + DB support for co-authors, translators, and editors via `contributors jsonb`.
   - Wikidata/Wikipedia fallback enrichment for non-English authors.

---

## 8. Open Product Decisions (Confirm Before Building)

1. **Runtime:** Vercel Serverless Functions (`/api/*`) vs. Supabase Edge Functions (Deno). *(Recommended: Vercel Serverless Functions for unified TypeScript stack.)*
2. **Category Model:** Expand `CATEGORY_OPTIONS` in `AddBookModal.tsx` vs. keeping broad shelf tabs (`General`, `Fiction`, `Non-fiction`, etc.) plus granular `genres[]` sub-tags.
3. **Seed Data:** Whether to migrate `DEFAULT_SEED_APPLICATIONS` from `WriterContext.tsx` into Supabase or start the DB review queue clean.
4. **Primary AI Provider:** Confirm Gemini (`gemini-2.5-flash-lite` / `gemini-2.5-flash`) as the initial `CatalogAIProvider` adapter.
