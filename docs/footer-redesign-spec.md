# Footer Redesign Specification (Figma Frame `#139:3591`)

> **Status:** Saved for future discussion & implementation.  
> **Source Frame:** Figma `#139:3591` ("Footer") from Home Page frame `#139:2971`.

---

## 1. Visual & Container Specifications

| Attribute | Specification | Notes |
| :--- | :--- | :--- |
| **Background Fill** | `#F3F0FC` (`fill_7e9a3978`) | Soft lavender brand tint |
| **Max Width** | `1280px` (`max-w-[1248px]` in code) | Matches existing container grid |
| **Padding (Desktop)** | `56px 32px 32px` | `pt-14 px-8 pb-8` |
| **Padding (Mobile)** | `32px 20px 24px` | Stacks columns; `pb-24` if shown on mobile above bottom nav |
| **Divider Line** | `1px solid #E2E8F0` (`fill_c8fa25b1`) | Separates 4-column links from bottom copyright bar |

---

## 2. Top Section Structure

### Left Column: Brand & Mission (`width: 288px`, `gap: 8px`)
- **Logo:** BookCircle icon + wordmark (`172px × 48.53px`).
- **Tagline:** `"Read . Share . Grow"`
  - Font: `DM Sans`, Medium (500), `16px / 24px`, `#475569` (Slate-600).
- **Mission Statement:** `"Connecting readers, sharing stories, and building a sustainable future for books."`
  - Font: `DM Sans`, Regular (400), `14px / 24px`, `#64748B` (Slate-500).

---

### Right Section: 4 Navigation Columns (`gap: 32px`)
- **Column Header Style:** `DM Sans`, Medium (500), `18px / 26px`, `#475569` (`style_a3d804e9`).
- **Link Item Style:** `DM Sans`, Regular (400), `14px / 28px`, `#64748B` (`style_fbe69981`), hover: `#3C3489` (Primary Brand).

#### Column 1: Explore
- **Who We Are** → Route `/who-we-are`
- **Discover Writers** → Route `/authors`
- **Find Readers** → Route `/readers`
- **Browse Categories** → Route `/books`

#### Column 2: Community
- **How it Works** → Triggers `OnboardingModal` (how-it-works interactive guide)
- **Community Guideline** → Guidelines modal or route
- **Book Reviews** → Community reviews view

#### Column 3: Author
- **Author Registration** → Triggers `WriterOnboardingModal`
- **Promote your book** → Author promotion modal or info
- **Guideline** → Author guidelines

#### Column 4: Support
- **Contact Us** → Contact modal or `mailto:`
- **Buy us a Coffee** → Triggers `CoffeeModal` (Support Community)
- **Facebook Community** → External link to Facebook group
- **Report an Issue** → Report issue modal / feedback form

---

## 3. Bottom Sub-Footer Bar (`#139:3634`)

- **Divider:** Line `#139:3633`, height `1px`, stroke `#E2E8F0`.
- **Layout:** Flex row with space-between / centered alignment (`gap: 56px` on social cluster).
  - **Left:** Copyright text:
    `© 2026 BookCircle. All rights reserved.` (`DM Sans`, Regular 14px, `#64748B`).
  - **Center:** Social media icon links (`gap: 56px`):
    - Instagram (`lucide/instagram` or Hugeicons)
    - Facebook (`lucide/facebook` or Hugeicons)
    - YouTube (`lucide/youtube` or Hugeicons)
  - **Right:** Legal links:
    `Privacy Policy` · `Terms & Conditions` (`DM Sans`, Regular 14px, `#64748B`).

---

## 4. Implementation Plan (When Ready)

1. Create `src/components/footer/FooterSection.tsx`.
2. Connect existing action callbacks:
   - `onOpenCoffeeModal: () => void`
   - `onOpenWriterOnboarding: () => void`
   - `onOpenHowItWorks: () => void`
3. Replace the minimal 1-line footer in `src/App.tsx:1351-1379`.
4. Mobile responsiveness: 2x2 grid for the 4 link columns on tablet/mobile screens.
