# Project Instructions for AI Models

This document serves as the operational guide for any AI model working on the `dashboard-hackathon` project. **Before making any changes to the codebase, you MUST read and adhere to these instructions.**

## 1. Caution Points

*   **Framework Version:** This project uses **Next.js 16** (App Router) and **React 19**. It is NOT the Next.js version from your training data. **Read `node_modules/next/dist/docs/` for the latest API conventions and deprecation notices.**
*   **No Legacy Patterns:** Do not use `pages/` directory, `getStaticProps`, `getServerSideProps`, or other Pages Router patterns.
*   **Data Handling:** All data is currently handled via:
    *   `src/app/api/dummy/` routes serving JSON files from `src/data/dummy/`.
    *   `src/lib/cache.ts` using IndexedDB (via `idb` library) for client-side caching.
    *   `src/app/api/process/` route for processing user-uploaded data.
*   **No External State Management Yet:** While Redux is in `package.json`, the current implementation uses React `useState` and `localStorage`. **Do not introduce Redux until explicitly requested.**
*   **Styling:** All styling is done via **Tailwind CSS v4** and custom CSS in `src/app/globals.css`. Do not use `className` strings that conflict with existing custom classes (e.g., `glass`, `stat-card`, `dropzone`).
*   **Icons:** Use `lucide-react` for all icons. Import them individually (e.g., `import { Search } from 'lucide-react';`).

## 2. Design Principles (Standard: Home Page)

The design standard is the `HomeDashboard` component (`src/components/HomeDashboard.tsx`) and the root layout.

*   **Color Palette (from `globals.css`):**
    *   Background: `var(--bg-primary)` (#0a0e1a), `var(--bg-secondary)` (#0f1629), `var(--bg-card)` (#141b2d)
    *   Text: `var(--text-primary)` (#e2e8f0), `var(--text-secondary)` (#94a3b8), `var(--text-muted)` (#475569)
    *   Accent: `var(--accent)` (#6366f1), `var(--accent-glow)` (rgba(99,102,241,0.3))
    *   Success/Danger/Warning: `var(--success)` (#10b981), `var(--danger)` (#ef4444), `var(--warning)` (#f59e0b)
*   **Typography:** Font family is `'Inter', 'Pretendard', sans-serif`. Use Tailwind classes for sizing (e.g., `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`).
*   **Card Design:**
    *   Use `glass` class for glassmorphism effect.
    *   Use `stat-card` class for metric cards (has hover effects).
    *   Border radius is generally `16px` to `20px`.
*   **Shadows & Glows:**
    *   Accent glow: `glow-accent`
    *   Success glow: `glow-success`
    *   Danger glow: `glow-danger`
*   **Animations:**
    *   Fade in up: `animate-fade-up`
    *   Pulse glow: `animate-pulse-glow`
    *   Skeleton shimmer: `skeleton` class
*   **Layout:**
    *   Dark mode only (`className="dark"` in `layout.tsx`).
    *   Grid background: Use `bg-grid` class for background patterns.
    *   Sidebar + Header + Main content area layout.

## 3. Unified Look, Feel, and Code Style

*   **Component Naming:**
    *   Use PascalCase for component names (e.g., `HomeDashboard.tsx`).
    *   Use kebab-case for CSS classes (e.g., `stat-card`, `glass-hover`).
*   **File Structure:**
    *   Components: `src/components/` (grouped by feature, e.g., `charts/`).
    *   Lib: `src/lib/` (types, utilities, cache).
    *   API Routes: `src/app/api/`.
    *   Data: `src/data/dummy/`.
*   **TypeScript:**
    *   Strict mode enabled (`tsconfig.json`).
    *   Use types from `src/lib/types.ts` for all data structures (e.g., `ProcessedData`, `CategoryKey`).
    *   Avoid `any`. Use `unknown` if type is uncertain, then narrow.
*   **Code Style:**
    *   Indent: 2 spaces.
    *   Semicolons: Yes.
    *   Quotes: Single quotes for strings, double quotes for JSON keys.
    *   Imports: Grouped (React, then libraries, then local).
    *   Comments: Use JSDoc for complex functions.
*   **Responsiveness:** Ensure all new components are responsive. Use Tailwind's responsive prefixes (e.g., `md:`, `lg:`).

## 4. Preserve Existing Functionalities

*   **Data Caching:** Do not break the `idb` caching mechanism in `src/lib/cache.ts`. All data fetching should integrate with this cache.
*   **API Routes:** Do not break the dummy data API routes (`/api/dummy/all`, `/api/dummy/category/[cat]`) or the process route (`/api/process`).
*   **User State:** User data (name, favorites, recent views, alerts) is stored in `localStorage`. Do not break these interactions.
*   **Charting:** Use `recharts` for all charts. Ensure new charts respect the existing data structures.
*   **Sidebar & Header:** The navigation structure in `Sidebar` and `Header` must remain consistent. New tabs/pages should follow this pattern.

## 5. Instructions for AI Models

**BEFORE making any changes:**

1.  **Read `skills.md`:** Understand the data categories and JSON schemas.
2.  **Read `globals.css`:** Understand the design system and custom classes.
3.  **Read `instruction.md`:** This file.
4.  **Analyze the Current Component/Page:** Understand how the existing code works.
5.  **Plan Your Changes:** Outline the steps you will take.
6.  **Make Changes Incrementally:** Change one component or feature at a time.
7.  **Test:** If possible, run the development server (`npm run dev`) to verify changes.
8.  **Update This File:** If you add new rules or observations, update this file.

**When creating new components:**

*   Follow the existing component structure (e.g., `src/components/...`).
*   Use Tailwind CSS for styling.
*   Use `lucide-react` for icons.
*   Use TypeScript interfaces from `src/lib/types.ts` or create new ones if needed (and add them to the file).
*   Ensure accessibility (ARIA labels, etc.).

**When modifying existing components:**

*   Be careful not to break existing props or state.
*   Maintain the existing code style.
*   Update tests if they exist.

**When adding new features:**

*   Ensure they align with the design principles.
*   Integrate with the existing data caching and API structures.
*   Update this file with any new rules or observations.

---

*This file was created to provide clear instructions for AI models working on the `dashboard-hackathon` project.*