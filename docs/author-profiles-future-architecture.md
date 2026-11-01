# BookCircle — Author Profiles & Future Architecture

## Overview
This document records the design philosophy, data relationships, and future capabilities for **Author Profiles** in BookCircle.

---

## 1. Architectural Philosophy: Separation of Authors and Members
- **Authors** and **BookCircle Members (Readers)** are distinct entities.
- An Author represents a literary creator and their canonical bibliography in the catalogue.
- An Author profile exists independently of whether the real-world author has created a user account on BookCircle.
- Physical book copies, member ownership, lending statuses, meetup spots, and community exchanges remain tied to BookCircle member records (`Reader` / `Book.ownerName`).

---

## 2. Current Read-Only Implementation (Phase 1)
- **Author Identity:**
  - Unique ID (`id`), URL-safe slug (`slug`), full name (`name`).
  - High-resolution portrait or monogram avatar fallback.
  - Nationality, country flag emoji, profession/designation.
  - Short biographical narrative, birth year and place.
  - Curated literary achievements & awards pills.
  - Canonical bibliography of published titles registered in BookCircle.
- **Cross-Platform Clickability:**
  - Author names are clickable across `BookCard`, `BookDetailsPage`, `BooksBrowsePage`, `ProfilePage`, `PublicProfilePage`, and modal dialogs.
  - Clicking smoothly navigates to `/author/:authorId`.
- **Resilience & Missing States:**
  - Authors with missing portraits display a monogram badge with their initials.
  - Authors without filled biographies show an elegant curation placeholder.
  - Authors with 0 current community copies display an empty state inviting neighbors to contribute their copies.
  - Unknown or invalid author routes render a friendly Author 404 with back navigation.

---

## 3. Future-Ready Architecture & Roadmap (Phase 2+)

The `Author` type (`src/types/author.ts`) and database schema are structured to support future expansion without breaking changes:

### A. Author Profile Claiming (`isClaimed`, `claimedUserId`)
- Authors can claim their existing catalogue profile using a verified identity proof flow (e.g. publisher email domain verification, official social auth, or literary agency confirmation).
- Once claimed, `isClaimed = true` and `claimedUserId` links to the author's BookCircle user account.

### B. Verified Author Badges (`isVerified`)
- A distinctive "Verified Author" badge appears next to the author's name on their profile, book cards, and search listings, establishing authenticity and trust.

### C. Author Self-Management & Profile Editing
- Claimed authors gain access to an Author Dashboard to:
  - Edit their biography, profile photo, and banner.
  - Add official website and social media handles (`websiteUrl`, `socialLinks.twitter`, `socialLinks.instagram`, `socialLinks.goodreads`).
  - Correct bibliography details and highlight signature works.

### D. Upcoming Releases & New Book Announcements
- Authors can showcase upcoming book releases before physical copies reach the community.
- Readers can register interest or pre-order/wishlist upcoming releases.

### E. Community Following & Literary Updates (`followersCount`)
- BookCircle readers can click "+ Follow Author" to receive notifications when:
  - A neighbor in their community adds a copy of the author's books to their shelf.
  - The author posts an announcement, Q&A, or reading list recommendation.
  - An author hosts a local book club meetup or virtual discussion.

### F. Author-Curated Shelves & Reading Recommendations
- Authors can recommend books by other writers in BookCircle, creating a rich literary web of recommendations from peer creators.

---

## 4. Planned Database Schema Extension (Supabase / PostgreSQL)

```sql
-- Authors Table
CREATE TABLE author_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  nationality TEXT,
  country_flag TEXT,
  profession TEXT,
  bio TEXT,
  born TEXT,
  birth_place TEXT,
  literary_achievements TEXT[],
  notable_works TEXT[],
  website_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  is_claimed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  claimed_user_id UUID REFERENCES auth.users(id),
  followers_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Author Followers Table
CREATE TABLE author_followers (
  author_id UUID REFERENCES author_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (author_id, user_id)
);

-- Catalog Books Author Foreign Key
ALTER TABLE catalog_books
  ADD COLUMN author_id UUID REFERENCES author_profiles(id);
```
