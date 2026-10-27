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

---

## 📂 Project Architecture

```
BookCircle/
├── src/
│   ├── components/
│   │   ├── bookdetails/     # Book details page with multi-owner copies & reviews
│   │   ├── borrow/          # BorrowWizardModal & ReturnWizardModal
│   │   ├── inbox/           # Request-gated fixed layout Messages page
│   │   ├── mybooks/         # AddBookModal, ShelfView, BorrowingView, MyBooksPage
│   │   ├── profile/         # User Profile view with stats and activity
│   │   ├── requests/        # Incoming/Outgoing borrow requests coordinator
│   │   ├── BookCard.tsx     # Book card component with badges & action triggers
│   │   ├── Footer.tsx       # Global footer (conditionally omitted on Messages)
│   │   └── Navbar.tsx       # Navigation bar with interactive profile menu
│   ├── data/
│   │   └── mockData.ts      # Canonical catalog books, community listings, users, messages
│   ├── types/
│   │   └── index.ts         # TypeScript models (Book, CatalogBook, User, Request, Message)
│   ├── App.tsx              # Main routing & tab layout coordinator
│   ├── index.css            # Tailwind directives and custom scrollbar styling
│   └── main.tsx             # Application bootstrap
├── public/                  # Static assets & icons
├── tailwind.config.js       # Tailwind palette & theme configuration
├── tsconfig.json            # Strict TypeScript compiler options
└── package.json             # Scripts & dependencies
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
