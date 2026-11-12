# 📖 BookCircle — Comprehensive Features & Architecture Guide

Welcome to the definitive feature and architecture reference for **BookCircle**. This document details the user experience, interaction mechanics, data entities, and technical architecture across every major capability of the platform.

---

## 📑 Table of Contents
1. [Hyperlocal Discovery & Unified Title Catalog](#1-hyperlocal-discovery--unified-title-catalog)
2. [Dedicated Author Profiles & Directory](#2-dedicated-author-profiles--directory)
3. [Responsive Floating Chat Widget & Smart FAB Coordination](#3-responsive-floating-chat-widget--smart-fab-coordination)
4. [Safety-First Messaging & Full Messages Center](#4-safety-first-messaging--full-messages-center)
5. [Structured Handover Protocols (Borrow & Return Wizards)](#5-structured-handover-protocols-borrow--return-wizards)
6. [Member Reputation & 5-Tier Return Reliability System](#6-member-reputation--5-tier-return-reliability-system)
7. [Lending vs. Free Community Donations](#7-lending-vs-free-community-donations)
8. [Wishlist & Real-Time Return Alerts](#8-wishlist--real-time-return-alerts)
9. [Frictionless Guest Browsing & Unified Authentication](#9-frictionless-guest-browsing--unified-authentication)
10. [Book Catalogue Cards & Community Copies Decoupling](#10-book-catalogue-cards--community-copies-decoupling)
11. [Writer Ecosystem, Onboarding & Dual Experience Mode](#11-writer-ecosystem-onboarding--dual-experience-mode)
12. [Curated Neighborhood Sections & Streamlined Navigation](#12-curated-neighborhood-sections--streamlined-navigation)
13. [Database Architecture & Privacy Enforcement (Supabase)](#13-database-architecture--privacy-enforcement-supabase)
14. [Automated Testing & End-to-End Verification](#14-automated-testing--end-to-end-verification)

---

## 1. Hyperlocal Discovery & Unified Title Catalog

### Philosophy
In traditional book platforms, each copy added creates a separate duplicate title entry, fragmenting community discussions, ratings, and reviews. BookCircle solves this with a **Canonical Title Clustering Model**.

### Core Capabilities
- **Canonical Title IDs (`catalogId`):** Distinct titles share a canonical ID (e.g. `the-god-of-small-things`, `the-night-circus`, `pachinko`).
- **Co-Ownership Clustering:** Multiple community neighbors (e.g. Arif Ahmed and Rahim Chowdhury) can list physical copies under the same canonical title.
- **Aggregated Community Reviews:** Ratings and reader discussions remain consolidated under the book title rather than isolated per copy.
- **Hyperlocal Radius Filtering:** Search and discover books within customizable distance radii (Within 1 km, 2 km, 5 km, 10 km, or Entire Community).
- **Dual Presentation Modes:**
  - **Grid View:** Visual showcase featuring high-res covers, distance badges, status indicators, and owner avatar chips.
  - **Compact List View:** High-density horizontal comparison ideal for browsing large community catalogs on desktop and tablet.

```
Canonical Catalog Title: "The God of Small Things" (#BC-the-god-of-small-things)
├── Copy #1: Owned by Arif Ahmed (1.2 km away) · Like New · For Lending
├── Copy #2: Owned by Rahim Chowdhury (0.4 km away) · Like New · For Lending
└── Aggregated Ratings: 4.8 / 5.0 (312 community reviews)
```

---

## 2. Dedicated Author Profiles & Directory

### Route: `/author/:authorId`
Every book has an author, and readers can explore an author's profile by clicking their name anywhere it appears across BookCircle.

### Entity Separation
- **Author Entity (`Author`):** Represents the literary creator and their canonical bibliography. An author does not need an account on BookCircle.
- **Member Entity (`Reader`):** Represents community neighbors who own physical copies, lend books, and complete handovers.
- **Catalogue Availability:** Physical book lending, availability, and handovers remain managed through member records.

### Visual & Interactive Features
- **Contextual Breadcrumbs:** `Catalogue / Authors / [Author Name]` with quick `← Back to Books` button.
- **Creator Header Card:**
  - High-res portrait with verified author badge (`SparklesIcon` + checkmark).
  - Nationality and country flag (e.g. `🇮🇳 Indian`, `🇺🇸 American`, `🇰🇷 South Korean`).
  - Author profession / designation (e.g. *Novelist, Essayist & Human Rights Activist*).
  - Demographic facts: Year of birth and birthplace.
  - Curated literary achievements & awards (e.g. *Man Booker Prize*, *Pulitzer Prize*, *Alex Award*).
  - Short biography with readable typography.
  - Official author website external link (`↗`).
- **Creator Engagement Controls:**
  - `+ Follow Author` button with optimistic follow state.
  - `Share Author Profile` button with clipboard copy and toast feedback.
- **In-Author Book Search & Filter:**
  - Real-time text search filtering the author's published works in the community.
  - Category chips (Fiction, Non-fiction, Science, History, Poetry).
- **Resilient Fallback States:**
  - **Missing Photo:** Displays an elegant monogram avatar badge with creator initials.
  - **Missing Biography:** Shows an italicized curation notice.
  - **Empty Catalogue (0 copies):** Welcoming empty state inviting neighbors to add a copy by the author.
  - **Dynamic Author Generator:** Any novel author name added by a member automatically receives an author profile via `getOrCreateAuthor()`.

---

## 3. Responsive Floating Chat Widget & Smart FAB Coordination

### Objective
Enables users to communicate with neighbors about handovers, questions, and book pickups without leaving their current page or losing their browsing context.

### The Three Desktop States (≥ 640px)

```
┌────────────────────────────────────────────────────────┐
│ Desktop Viewport                                       │
│                                                        │
│                           ┌───────────┐ ┌────────────┐ │
│                           │  + Add    │ │  Expanded  │ │
│                           │  Book FAB │ │  Chat      │ │
│                           │  (Moved L)│ │  (360x460) │ │
│                           └───────────┘ └────────────┘ │
└────────────────────────────────────────────────────────┘
```

1. **Expanded State:**
   - Position: Fixed at bottom-right corner (24px bottom, 24px right).
   - Dimensions: 360px width × 460px height.
   - Layout: Fixed header (participant avatar, name, minimize, expand to full page, and close controls), scrollable message area with automatic bottom scrolling, and fixed message input.
   - **Smart FAB Relocation:** Floating `+ Add Book` button smoothly slides horizontally to the left of the chat window (maintaining 16–20px spacing). Both elements remain fully visible, elevated, and clickable without overlap.
2. **Minimized State:**
   - Position: Compact horizontal pill bar at bottom-right (48px height, 280px width).
   - Content: Participant avatar, name, expand control, close button, and unread count badge.
   - **Smart FAB Relocation:** FAB sits directly above the minimized pill bar (maintaining 12–16px vertical clearance).
3. **Closed State:**
   - Widget dismissed from screen.
   - FAB returns to its default bottom-right position (`bottom-6 right-6`).
   - Draft preservation: Any unsent message draft is preserved in state so reopening the chat restores the user's uncommitted text.

### Mobile Experience (< 640px)
- **Modal Bottom-Sheet:** Slides up from bottom of the screen covering 82–88% viewport height.
- **Top Grab Handle:** Tactile rounded drag bar for closing.
- **Full Viewport Optimization:** Floating Add Book button is cleanly hidden while the mobile sheet is open, eliminating touch target conflicts.

---

## 4. Safety-First Messaging & Full Messages Center

### Route: `/messages`
Designed specifically for hyperlocal neighborhood interactions with built-in safety controls.

- **Request-Gated Messaging:** Unsolicited spam is prevented because communication is only unlocked once a book owner accepts a borrow request.
- **33.3% / 66.7% Fixed-Viewport Split Layout:** Left panel provides the conversations list with tab filters (*All*, *Active*, *Completed*); right panel hosts the active chat thread with message history and meetup recap cards.
- **Seamless Modal-to-Full View Transition:** Clicking the expand button (`↗`) on the floating chat widget opens the conversation directly in the dedicated `/messages` center without reload.

---

## 5. Structured Handover Protocols (Borrow & Return Wizards)

Physical book exchanges in BookCircle follow structured workflows to ensure accountability, safety, and mutual respect among neighbors.

### A. Multi-Step Borrow Handover Wizard
1. **Condition Inspection:** Review owner photos, condition grade (*Like New*, *Very Good*, *Good*, *Fair*), translation status, and private notes.
2. **Public Meetup Location & Time Selection:**
   - Pick from owner-endorsed safe public meetup spots (e.g. *Camden Coffee Roasters*, *Primrose Hill Library Foyer*).
   - Interactive calendar date cards and time interval chips (Morning, Afternoon, Evening).
3. **Handover Confirmation Receipt:** Summary card detailing loan duration (standard 30-day loan), pickup spot, and community guidelines.

### B. Streamlined Return Handover Wizard
- Mirrors the safety of the borrow wizard while omitting condition inspection for faster scheduling.
- Provides interactive scheduling for the return exchange at a mutually agreed meetup location.
- Automatically generates a return receipt and updates the book's status upon return confirmation.

---

## 6. Member Reputation & 5-Tier Return Reliability System

### Route: `/reader/:readerId` and `/profile`
Trust is the core currency of peer-to-peer sharing. BookCircle calculates punctuality and reliability rather than subjective or easily gamed review averages.

### The 5 Reliability Tiers
| Tier | Title | Punctuality Requirement | Badge Indicator |
| :--- | :--- | :--- | :--- |
| **Tier 5** | Master Reader | 100% on schedule (30+ completed returns) | Verified Master Reader |
| **Tier 4** | Highly Reliable | 95–99% on schedule (15+ completed returns) | Highly Reliable Neighbor |
| **Tier 3** | Punctual Neighbor | 90–94% on schedule (5+ completed returns) | Punctual Neighbor |
| **Tier 2** | Casual Borrower | 80–89% on schedule | Casual Member |
| **Tier 1** | Needs Improvement | < 80% on schedule | Building Reputation |

### Unified Single-Card Profile Header
- **Consolidated Layout:** Eliminates fragmented side panels by integrating trust rating, punctuality score (e.g. *Tier 4 · Highly Reliable · 100% on-time returns*), member since date, location radius, and action buttons (*Message Neighbor*, *Share Profile*) into one cohesive header card.
- **5-Tier Modal Guide:** Accessible popover explaining the tier criteria, calculation rules, and punctuality thresholds.

---

## 7. Lending vs. Free Community Donations

BookCircle clearly distinguishes between temporary loans and permanent gifts:

### 1. Lending Copies (🤝 For Lending)
- Borrowed for 14 to 30 days.
- Retains owner tracking and requires return scheduling.
- Marked with purple badges: `To Lend`.

### 2. Community Donations (🎁 Free Community Gift)
- **Free to keep forever:** The neighbor receives full ownership of the copy.
- No return required or expected.
- Distinct green badges: `Free Gift` and `Claim Free Gift` button.
- Once claimed, permanently updates the community ledger and displays a `Claimed` badge.

---

## 8. Wishlist & Real-Time Return Alerts

### Modal: `WishlistModal`
- **One-Click Wishlisting:** Accessible heart icon on all book cards and details pages.
- **Return Alerts:** When a reader wishlists a book that is currently lent out (`status === 'lent_out'`), BookCircle activates an automated return alert.
- **Instant Availability Notification:** As soon as the borrower marks the copy returned, the wishlisting reader receives an alert badge and notification.
- **Interactive Shelf:** Wishlisted books can be filtered, reviewed, and directly borrowed from the wishlist dialog.

---

## 9. Frictionless Guest Browsing & Unified Authentication

### Philosophy
Visitors should never be forced to sign up before experiencing the value of BookCircle.

- **Unrestricted Guest Browsing:** Visitors can browse books, filter genres, read author bios, and inspect reviews without an account.
- **Action Guarding:** Triggering a privileged action (borrowing, donating, listing a book, messaging) triggers a friendly auth dialog and **automatically resumes** the user's action upon successful sign-in.
- **Dual Authentication Modes:**
  1. **Google OAuth:** Instant 1-click social authentication.
  2. **WhatsApp Cloud API OTP:** 6-digit phone verification with international country codes.
- **First-Time Profile Setup:** Prompt for display name and neighborhood radius without exposing private contact info.

---

## 10. Book Catalogue Cards & Community Copies Decoupling

BookCircle maintains a strict architectural separation between **Published Literary Works** (canonical catalog entries) and **Community Copies** (physical copies listed by neighbors):

### Architectural Principles
1. **One Published Work, One Catalogue Card:** Multiple members listing copies of the same title (e.g. 24 neighbors sharing *The God of Small Things*) produce a single consolidated card on the Author Profile rather than 24 repetitive cards.
2. **Independent Bibliography:** An author's published works exist independently of community copies circulating in the neighborhood. If an author has 10 published books and only 3 have active member listings, all 10 appear in their bibliography. Books with 0 copies show "No copies yet" and are not filtered out.
3. **Dedicated Reusable `BookCatalogueCard`:**
   - Displays cover, primary title, genre badge, average rating, review count, total community copies, and currently available copies.
   - Primary CTA: **"Explore Copies"** (`/book/:bookId`).
4. **Book Details Zero-Copies State:**
   - When a user navigates to a published book with zero physical copies, the page loads the complete canonical metadata (cover, title, author, description, rating, and reviews).
   - In place of owner listings, a welcoming empty state is presented:
     - Heading: `No community copies available yet.`
     - Subtitle: `Be the first to share this book with your neighbors! You can list your copy for lending or community donation.`
     - Primary Action: `+ Share a Copy of this Book` (pre-filling title, author, cover, and category in `AddBookModal`).
   - Borrow and Claim buttons are hidden when no copies exist.
   - Wishlist toggle remains active so neighbors can save the book and be notified when someone lists a copy.

---

## 11. Writer Ecosystem, Onboarding & Dual Experience Mode

BookCircle empowers literary creators to establish verified presence, claim catalogue profiles, and connect directly with their local reading community.

### A. Writer Onboarding & Claiming Wizard (`WriterOnboardingModal`)
- Multi-step structured application workflow allowing members to:
  1. Claim an existing catalogue author entity (e.g. Arundhati Roy, Neil Gaiman) or create a new author identity.
  2. Provide verification credentials (publisher email, official author website, Goodreads profile, or agent representation).
  3. Set biographical details, literary achievements, awards, and country designation.
- Real-time status states: `none` $\rightarrow$ `pending` (Under Review) $\rightarrow$ `approved` (Official Writer) or `changes_requested`.

### B. Editorial Review Portal (`AdminWriterReviewModal`)
- Secure, authorized editorial review queue for BookCircle community managers.
- Review pending claims with complete evidence dossiers, one-click claim approvals, or change requests with contextual feedback.

### C. Seamless Dual Experience Mode (`Reader` vs `Writer`)
- Approved writers can toggle between **Reader Mode** and **Writer Mode** directly from the profile dropdown.
- **Dynamic Profile Route (`/profile`):**
  - In **Reader Mode**, `/profile` displays the member's reading stats, trust tier, active shelf, and lending activity.
  - In **Writer Mode**, `/profile` automatically transforms into the user's official **Writer Profile**, presenting their verified badge, biography, awards, and canonical bibliography.
- **Clean Owner Experience:**
  - Redundant breadcrumbs and external visitor badges (`✨ Official Writer Profile`) are cleanly suppressed when an author views their own profile (`isUserProfileView = true`), presenting a focused, uncluttered creator view.
  - Profile switcher actions are centralized in the top navbar profile menu, keeping the profile header cards focused on essential actions (`Edit Writer Profile` + `Share Profile`).
  - Zero-layout-shift toast notification portal ensures clipboard feedback renders seamlessly without displacing UI elements.

---

## 12. Curated Neighborhood Sections & Streamlined Navigation

### A. Curated Homepage "Readers near you" Section
- To prevent cognitive overload and maintain high visual quality, the homepage "Readers near you" section displays a curated showcase of **5 active neighbors** (`maxDisplay={5}`).
- A prominent "See All" action links to the comprehensive `/readers` directory where members can explore the full community and filter by distance.

### B. Focused Profile Dropdown Navigation
- The profile dropdown menu is intentionally streamlined to prioritize essential daily utilities:
  1. **Profile** (Dynamically labeled `Reader Profile` or `Writer Profile` based on active mode).
  2. **Wishlist & Alerts** (Saved books and real-time return alerts counter).
  3. **Mode Switcher / Become a Writer** (`Switch to Writer Profile` / `Switch to Reader Profile` or writer onboarding entry).
  4. **Editorial Review** (Privileged admin review queue for authorized staff).
  5. **How BookCircle Works** (Educational guide for lending and borrowing).
  6. **Settings** (Account preferences and preferred handover spots).
  7. **Sign Out** (Secure session teardown).
- Primary communication and library tabs remain prominently anchored in the top navigation bar and mobile bottom bar (`/messages`, `/activity`, `/my-books`).

---

## 13. Database Architecture & Privacy Enforcement (Supabase)

BookCircle integrates seamlessly with Supabase PostgreSQL with automated fallback to local state.

### Key Data Tables
- `books`: Title, author, catalog_id, cover_image, status, condition, availability_mode, owner_id.
- `readers`: Profile data, trust tier, punctuality rate, completed borrows.
- `author_profiles`: Author bibliography, biography, verified badges, nationality, literary achievements.
- `exchanges`: Active handover requests, scheduled meetup dates, locations, status lifecycle.
- `messages`: Threaded messages between authorized borrower and lender.

### Database-Level Privacy Guards
- Books designated as `availability_mode = 'personal'` (Private Collection) are strictly filtered out at the Supabase query level, ensuring private personal collections are never leaked into community discovery feeds.
- Unsolicited direct messages are blocked unless an exchange relation exists between users.

---

## 14. Automated Testing & End-to-End Verification

BookCircle features automated verification scripts powered by Playwright to ensure zero regressions across releases:

| Script | Coverage | Viewports Tested |
| :--- | :--- | :--- |
| `scripts/verify-floating-chat.mjs` | Expanded, Minimized, Closed chat states, FAB coordinate shifting, message delivery, and mobile bottom-sheet | Desktop (1440px), Mobile (390px) |
| `scripts/verify-author-profiles.mjs` | Cross-platform author clicks, `/author/:authorId` catalogue card deduplication, zero-copies state, prefilled add book modal | Desktop (1440px), Mobile (390px) |

Run automated test suites via:
```bash
node scripts/verify-floating-chat.mjs
node scripts/verify-author-profiles.mjs
```

