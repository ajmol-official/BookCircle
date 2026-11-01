# 📚 BookCircle — Community Book Sharing Web App

**BookCircle** is a modern, hyperlocal peer-to-peer book sharing platform designed to connect book lovers within neighborhoods, university campuses, and local communities. It makes sharing, borrowing, and returning physical books structured, safe, and community-driven.

---

## 📖 Documentation & Feature Deep Dives

For exhaustive product specifications, UX architecture rationales, and technical diagrams, explore the dedicated documentation guides:

- **[Platform Features & Architecture Specification (`docs/FEATURES.md`)](docs/FEATURES.md)** — In-depth breakdown of title catalog clustering, author directory, floating chat animations, handover wizards, return reliability tiers, and database privacy.
- **[Comprehensive User Flow Map & Interaction Architecture (`docs/USER_FLOWS.md`)](docs/USER_FLOWS.md)** — Complete user journey flows, decision trees, Mermaid state/sequence diagrams, and safety guard mechanisms across all personas.
- **[Author Profiles & Future Capabilities Roadmap (`docs/author-profiles-future-architecture.md`)](docs/author-profiles-future-architecture.md)** — Architectural separation of authors vs. members, profile claiming, verification badge workflows, and following systems.

---

## 🚀 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **[React 19](https://react.dev/)** | Component-driven frontend user interface and state management |
| **[TypeScript](https://www.typescriptlang.org/)** | Strict type safety, clean data interfaces, and maintainable architecture |
| **[Tailwind CSS](https://tailwindcss.com/)** | Custom design system, responsive layouts, and modern aesthetics |
| **[Vite](https://vitejs.dev/)** | High-performance development server with instant HMR and optimized production bundling |
| **[Supabase](https://supabase.com/)** | Cloud PostgreSQL database, realtime synchronization, and database-level privacy enforcement |
| **[Hugeicons](https://hugeicons.com/)** (`@hugeicons/react`) | Crisp, modern vector iconography across all views and modals |
| **[Playwright](https://playwright.dev/)** | End-to-end automated verification suite covering desktop and mobile viewports |

---

## 🎨 Design System & Palette

Crafted with a warm, welcoming booklover palette based on the official Figma design system:

- **Background Canvas:** `#FDF8F2` (Warm parchment cream)
- **Primary Brand Purple:** `#3C3489` (Deep royal ink purple for headers, primary actions, and badges)
- **Accent Amber:** `#FDA412` / `#D97706` (Warm amber for ratings, status highlights, and buttons)
- **Neutral Stone:** `#F3EDE2` / `#EAE2D5` (Soft card borders, pills, and input backings)
- **Text:** `#1F194C` (High-contrast deep navy/black for clean readability)

---

## ✨ Key Features & User Flows

### 1. 🔍 Unified Title Catalog & Hyperlocal Discovery
- **Canonical Book Clustering (`catalogId`):** Titles share canonical identifiers (e.g. `the-god-of-small-things`), grouping multiple member copies under one unified book page with aggregated reviews and ratings.
- **Multi-Owner Support:** Multiple neighbors can list physical copies under the same title without fragmenting community discussions.
- **Dual Browsing Modes:** Switch seamlessly between a visual 4-column **Grid View** and a high-density horizontal **Compact List View**.
- **Distance Radius Filtering:** Filter books within 1 km, 2 km, 5 km, 10 km, or throughout the community.

### 2. ✍️ Dedicated Author Profiles & Directory (`/author/:authorId`)
- **Universal Author Name Interaction:** Author names are clickable across book cards, book details pages, browse lists, wishlist alerts, and shelves, navigating to `/author/:authorId`.
- **Author Information Header:** Creator photo, verified badge, nationality flag, profession, demographic facts, short biography, and curated literary achievements (e.g. *Man Booker Prize*, *Pulitzer Prize*, *Alex Award*).
- **Consolidated Catalogue Cards (`BookCatalogueCard`):** Decouples published literary works from member copies. Multiple community copies of the same title collapse into one unique catalogue card (e.g. 24 member copies of *The God of Small Things* = 1 card) displaying genre, rating, total reviews, circulating copies, and currently available copies.
- **Independent Known Bibliography:** An author's complete published works appear regardless of whether community copies currently exist in BookCircle.
- **Dedicated Zero-Copies Book Details State:** Navigating to a published work with 0 copies displays full book metadata, a welcoming invitation to list a copy, and pre-fills `AddBookModal`, while safely suppressing Borrow/Claim actions.
- **Graceful Fallbacks:** Monogram avatar badges for missing photos, tasteful biography curation notices, and empty states inviting neighbors to add copies.

### 3. 💬 Responsive Floating Chat Widget & Smart FAB Coordinator
- **Contextual In-Page Communication:** Chat with neighbors without navigating away from your active page.
- **3 Distinct Desktop States:**
  - **Expanded (360×460px):** Fixed header, scrollable message area, and fixed message input. The floating `+ Add Book` button smoothly relocates to the left of the chat window with dynamic coordinate spacing.
  - **Minimized (48×280px):** Compact horizontal bar displaying avatar, participant name, expand button, and unread badge. The FAB automatically rests directly above the bar.
  - **Closed:** Dismisses chat and restores the FAB to its standard bottom-right position while preserving message history and unsent drafts.
- **Mobile Bottom-Sheet (< 640px):** Seamless slide-up bottom sheet with top drag handle, hiding background floating buttons to maximize touch usability.

### 4. 📬 Safety-First Messaging & Full Messages Center (`/messages`)
- **Request-Gated Messaging:** Prevents unsolicited spam by unlocking communication only after an owner accepts a borrow request.
- **33.3% / 66.7% Grid Split:** Fixed-viewport layout preventing shifts between conversation list and active chat threads.
- **Modal-to-Full Transition:** 1-click expand button (`↗`) elevates floating conversations into the full `/messages` center.

### 5. 🤝 Structured Handover Protocols (Borrow & Return Wizards)
- **Borrow Handover Wizard:** 3-step structured workflow covering condition inspection, public meetup selection (*Camden Coffee Roasters*, *Primrose Hill Library*), and digital confirmation receipts.
- **Streamlined Return Wizard:** Rapid return scheduling with mutual receipts and automatic status updates.

### 6. 👤 Unified Member Header & 5-Tier Return Reliability System
- **Single Consolidated Header Card:** Merges reader photo, verification badge, location, bio, trust rating, and action buttons (*Message Neighbor*, *Share Profile*) into one balanced card.
- **5-Tier Punctuality Guide:** Replaces subjective reviews with mathematical return punctuality tracking (*Tier 5 Master Reader* to *Tier 1 Building Reputation*).

### 7. 🎁 Lending vs. Free Community Donations
- **Lending Copies (🤝 To Lend):** 14–30 day loans with owner tracking and scheduled return handovers.
- **Free Donations (🎁 Free Gift):** Permanent gifts that neighbors keep forever without return requirements. Claimed gifts immediately update the community ledger.

### 8. 💖 Wishlist & Real-Time Return Alerts
- **One-Click Wishlist:** Save books to personal reading lists.
- **Instant Availability Alerts:** Wishlisting a lent-out book automatically arms a return alert, notifying the reader the moment the copy is marked returned.

### 9. 🌟 First-Visit Onboarding & Guest Browsing
- **Hyperlocal Welcome Guide:** Dismissible 3-pillar card introducing neighborhood discovery and lending confidence.
- **Unrestricted Guest Browsing:** Visitors can search books, read reviews, and explore author profiles before registering.
- **Action Guarding:** Privileged actions prompt a sign-in modal and automatically resume after authentication.

### 10. 🔐 Unified Authentication & Supabase Cloud Sync
- **Google OAuth & WhatsApp Phone OTP:** Fast social login and international WhatsApp OTP verification.
- **Database-Level Privacy:** Personal collection books (`[PRIVATE_COLLECTION]`) are filtered out at the Supabase query level to ensure privacy.

---

## 📂 Project Architecture

```
BookCircle/
├── docs/                        # Dedicated technical specifications & architectural deep dives
│   ├── FEATURES.md              # Comprehensive feature matrix, UX flows & screenshots
│   └── author-profiles-future-architecture.md # Author entity models & Phase 2 roadmap
├── scripts/                     # Automated end-to-end verification test suites
│   ├── verify-author-profiles.mjs # Cross-platform author navigation & profile tests
│   └── verify-floating-chat.mjs # Floating chat widget & responsive FAB coordinator tests
├── src/
│   ├── assets/                  # Brand vectors & illustrations
│   ├── components/
│   │   ├── auth/                # AuthModal (Google & WhatsApp OTP) & ProfileSetupModal
│   │   ├── author/              # AuthorProfilePage (biography, awards & published books)
│   │   ├── bookdetails/         # BookDetailsPage & ReviewModal
│   │   ├── books/               # BooksBrowsePage (dual grid & compact list views)
│   │   ├── borrow/              # BorrowWizardModal & ReturnWizardModal
│   │   ├── chat/                # FloatingChatWidget (Expanded, Minimized, Mobile bottom-sheet)
│   │   ├── common/              # ScrollToTop and shared UI utilities
│   │   ├── inbox/               # Request-gated fixed-viewport Messages page
│   │   ├── mybooks/             # AddBookModal, EditBookModal, shelf management
│   │   ├── onboarding/          # WelcomeOnboardingModal (3-pillar intro)
│   │   ├── profile/             # ProfilePage, PublicProfilePage, ReturnReliabilityModal & WishlistModal
│   │   ├── readers/             # ReadersBrowsePage (community neighbor directory)
│   │   ├── BookCard.tsx         # Unified book card with clickable author & quick actions
│   │   ├── BooksSection.tsx     # Homepage community book grid
│   │   ├── CategoryPills.tsx    # Horizontal genre filter chips
│   │   ├── FloatingAddBookButton.tsx # Responsive FAB coordinated with floating chat
│   │   └── Navbar.tsx           # Sticky top navbar with profile popover & notifications
│   ├── context/
│   │   ├── AuthContext.tsx      # AuthProvider, session lifecycle & action guarding
│   │   ├── ExchangeContext.tsx  # Borrow & return exchange state management
│   │   └── MessagingContext.tsx # Floating chat coordination & thread messaging
│   ├── data/
│   │   ├── authors.ts           # Canonical author directory, slugs & dynamic author generator
│   │   └── mockData.ts          # Seed catalog books, community copies & reader profiles
│   ├── services/
│   │   ├── authService.ts       # Google OAuth & WhatsApp OTP services
│   │   ├── dbService.ts         # Supabase client integration with local fallback
│   │   └── storageService.ts    # Persistent localStorage engine
│   ├── types/
│   │   ├── author.ts            # Author data entity & future-ready claim fields
│   │   └── index.ts             # Book, CatalogBook, Reader & Exchange interfaces
│   ├── App.tsx                  # Root router coordinator & global layout
│   └── main.tsx                 # React 19 application entry point
├── supabase/
│   └── schema.sql               # PostgreSQL tables, RLS policies & indexes
├── tailwind.config.js           # Warm booklover design system tokens
└── package.json                 # Scripts & dependencies
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ajmol-official/BookCircle.git
   cd BookCircle
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Run Automated Verification Tests:**
   ```bash
   node scripts/verify-author-profiles.mjs
   node scripts/verify-floating-chat.mjs
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
   Validates TypeScript types (`tsc -b`) and generates production bundles in `dist/`.

---

## 🎯 Design Reference
- Designed and prototyped based on the **[BookCircle Figma Design System](https://www.figma.com/design/NJ2gxx7CEzkMX5RUUGQSgL/BookCircle-v2?node-id=0-1)**.
