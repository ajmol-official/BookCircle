# 📚 BookCircle — Community Book Sharing Web App

**BookCircle** is a modern, hyperlocal peer-to-peer book sharing platform designed to connect book lovers within neighborhoods, university campuses, and local communities. It makes sharing, borrowing, and returning physical books structured, safe, and community-driven.

---

## 🚀 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **[React 19](https://react.dev/)** | Component-driven frontend user interface and state management |
| **[TypeScript](https://www.typescriptlang.org/)** | Strict type safety, clean data interfaces, and maintainable architecture |
| **[Tailwind CSS](https://tailwindcss.com/)** | Custom design system, responsive layouts, and modern aesthetics |
| **[Vite](https://vitejs.dev/)** | High-performance development server with instant HMR and optimized production bundling |
| **[Hugeicons](https://hugeicons.com/)** (`@hugeicons/react`) | Crisp, modern vector iconography across all views and modals |

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

### 1. 🔍 Unified Title Catalog & Multi-Owner System
- **Canonical Book IDs (`#BC-...`):** Every distinct title receives a unique platform catalog ID (e.g., `#BC-the-god-of-small-things`).
- **Co-Ownership:** Multiple community members (e.g., Arif and Rahim) can list their own physical copies under the same canonical title.
- **Aggregated Reviews:** Ratings and reader discussions stay unified under one book title regardless of how many members own a copy.
- **Add a Book Flow:** Smart autocomplete search allows owners to quickly pick an existing title or add a new custom/translated edition with dropdowns for *Book Condition* and *Availability*.

### 2. 🤝 Multi-Step Borrow Handover Wizard
Structured borrowing workflow ensuring safety and accountability:
1. **Condition Inspection:** Review physical copy quality, cover type, and existing notes.
2. **Meetup Details:** Select friendly, public community meetup spots (e.g., local cafes, library foyers) with interactive date cards and time interval chips.
3. **Handover Confirmation:** Digital confirmation receipt and safety guidelines before final request submission.

### 3. 🔄 Streamlined Return Handover Wizard
- Mirrors the safety and structure of the borrow flow.
- The condition verification step is removed for speed, while retaining the exact **Meetup Time & Location Picker** and **Confirmation Receipt**.
- Gives both lender and borrower structured handover receipts for peace of mind.

### 4. 💬 Safety-First Messaging & Inbox
- **Request-Gated Messaging:** Borrowers cannot message book owners until the owner accepts the borrow request, preventing spam and unsolicited messages.
- **Fixed-Viewport Layout:** Zero layout shifts when switching conversations or scrolling message threads.
- **33.3% / 66.7% Grid Ratio:** Responsive split with 4/12 left panel (conversation list with status filters) and 8/12 right panel (active conversation with meetup summary cards and quick replies).

### 5. 👤 Member Profile & Interactive Shelves
- **Currently Borrowing:** Reading progress bars, due date badges, and quick one-click return requests.
- **My Shelf & Lent Out:** Manage listed copies, toggle availability, and track who currently has each book.
- **Profile Popover Menu:** Fast navbar access to Profile, Messages, Pending Requests, Shelves, Settings, and Log Out.

### 6. 🌟 First-Visit Onboarding & Guest Browsing
- **Hyperlocal Welcome Card:** Compact, dismissible 3-pillar welcome guide introducing neighborhood discovery, borrow confidence, and shelf sharing.
- **Unrestricted Guest Discovery:** Visitors can search books, filter categories, adjust radius, and explore reviews before creating an account.
- **Action Guarding & Resumption:** Actions requiring an account (borrowing, listing a book, messaging) prompt a friendly sign-in modal and automatically resume the intended action after login.

### 7. 🔐 Unified Authentication & Session Persistence
- **Google OAuth:** Fast 1-click authentication detecting returning readers vs new sign-ups.
- **WhatsApp Phone Verification:** 6-digit OTP entry with international country selector (+44, +1, +880, +91, +49, etc.), resend countdown timer, and WhatsApp Cloud API integration.
- **Reader Profile Setup:** First-time profile completion for display name, avatar, and neighborhood radius without exposing private contact details.
- **Session Persistence:** Persistent session storage across page reloads with secure logout confirmation.

### 8. 👥 Public Member Profiles & Community Shelves (Lending vs. Donation)
- **Public Reader Profile Page:** Visitors and members can click on any neighbor (e.g. Rahim Chowdhury, Priya Shah, etc.) to view their basic information, online status, neighborhood radius, member tenure, and reader biography.
- **Trust Badges & 5-Tier Return Reliability:** Displays return punctuality (e.g., *Tier 5 Verified Master Reader · 100% on schedule*), community rating, and quick access to the 5-tier return reliability system guide.
- **Lending vs. Donation Inventory Breakdown:** Clear counters and category chips distinguishing books available to **lend** (14–28 day borrow cycle) from books available for **free community donation** (permanent gifts for neighbors to keep).
- **In-Shelf Search & Genre Filtering:** Real-time search across the reader's shelf, along with mode filters (*All Books*, *Available to Lend 🤝*, *Free to Donate 🎁*, *Currently Lent Out ⏳*) and genre tags.
- **One-Click Handovers:** Direct "Borrow" and "Claim Free Gift" buttons integrated with the structured meetup handover wizard and action-guarding.
- **Community Endorsements & Preferred Meetup Spots:** Authentic neighbor feedback and favorite public exchange locations (e.g., *Camden Coffee Roasters*, *Primrose Hill Library*).

---

## 📂 Project Architecture

```
BookCircle/
├── src/
│   ├── assets/                  # Brand vectors & illustrations
│   ├── components/
│   │   ├── auth/                # AuthModal (Google & WhatsApp OTP) & ProfileSetupModal
│   │   ├── bookdetails/         # BookDetailsPage & ReviewModal
│   │   ├── borrow/              # BorrowWizardModal & ReturnWizardModal
│   │   ├── inbox/               # Request-gated fixed-viewport Messages page
│   │   ├── mybooks/             # AddBookModal, ShelfView, BorrowingView, HistoryView, RequestsView
│   │   ├── onboarding/          # WelcomeOnboardingModal (3-pillar dismissible intro)
│   │   ├── profile/             # ProfilePage, PublicProfilePage, EditProfileModal & ReturnReliabilityModal
│   │   ├── BookCard.tsx         # Book card with cover, badges, distance & quick borrow/claim trigger
│   │   ├── BooksSection.tsx     # Filtered community book catalog grid
│   │   ├── CategoryPills.tsx    # Horizontal genre selector chips
│   │   ├── CoffeeModal.tsx      # Community support dialog
│   │   ├── FloatingAddBookButton.tsx # Responsive floating "+ Add Book" action button
│   │   ├── HeaderSection.tsx    # Dynamic greeting, book search & radius dropdown
│   │   ├── LogoutConfirmDialog.tsx  # Secure sign-out confirmation dialog
│   │   ├── MobileNavBar.tsx     # Responsive mobile bottom navigation bar
│   │   ├── Navbar.tsx           # Sticky top navbar with profile menu & notification dropdown
│   │   ├── NotificationDropdown.tsx # Dropdown notification popover panel
│   │   ├── ReaderCard.tsx       # Reader card with lending & donation badges, and view shelf CTA
│   │   └── ReadersSection.tsx   # Nearby community readers showcase
│   ├── context/
│   │   └── AuthContext.tsx      # AuthProvider, session lifecycle & action guarding
│   ├── data/
│   │   └── mockData.ts          # Canonical catalog books, community listings (Rahim, Priya, etc.)
│   ├── services/
│   │   ├── authService.ts       # Google OAuth & WhatsApp Cloud API OTP logic
│   │   └── storageService.ts    # Persistent localStorage & session engine
│   ├── types/
│   │   ├── auth.ts              # User, AuthSession, PhoneOtpVerification models
│   │   └── index.ts             # Book, CatalogBook, Reader TypeScript interfaces
│   ├── App.tsx                  # Root application coordinator with AuthProvider & routing
│   ├── index.css                # Tailwind directives & design system utilities
│   └── main.tsx                 # React application bootstrap
├── public/                      # Static assets & icons
├── tailwind.config.js           # Tailwind palette & theme configuration
├── tsconfig.json                # Strict TypeScript compiler options
└── package.json                 # Scripts & dependencies
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation

1. **Clone the repository or navigate into the folder:**
   ```bash
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
   Open your browser at `http://localhost:5173` to explore the app.

4. **Build for production:**
   ```bash
   npm run build
   ```
   Validates all TypeScript types (`tsc -b`) and generates the minified production bundle in `dist/`.

---

## 🎯 Design Reference
- Designed and prototyped based on the **[BookCircle Figma Design System](https://www.figma.com/design/NJ2gxx7CEzkMX5RUUGQSgL/BookCircle-v2?node-id=0-1)**.
