# DESIGN.md — Swiss Grid / Modern Scoreboard

**Project:** Liga Adik Adik (eFootball Mobile Tournament)  
**Aesthetic:** Swiss International Typographic Style × High-Density Sports Scoreboard (FotMob / SofaScore, sharpened).  
**Core Principle:** Data is the UI. Zero decorative fluff, razor-sharp geometry, high information density, solid hairline grids, and clear scannability on desktop and mobile screens.

---

## 1. Hard Bans (Anti-Slop Rules)
- **NO drop shadows:** Never use `shadow-sm`, `shadow-md`, `shadow-lg`, or colored glows. Depth is communicated strictly through crisp borders and subtle background contrast.
- **NO gradients:** Solid flat colors only.
- **NO pill/bubble cards:** Never use `rounded-xl`, `rounded-2xl`, or `rounded-3xl` on containers or cards. Maximum border-radius is `rounded-sm` (`2px`) or `rounded-none` (`0px`).
- **NO excessive whitespace:** Avoid marketing-style padding (`py-16`, `p-8`). Keep vertical rhythm tight and utilitarian like a live match ticker.
- **NO emojis in UI:** Use crisp `14px–16px` stroke icons (`lucide-react`, `strokeWidth={1.75}`) or clean typographic labels.
- **NO decorative icons (Icon Bloat):** Never put icons next to every heading, tab label, stat box, or table column header (e.g., trophy icon next to "Standings", calendar icon next to "Schedule", fire icon next to "Live"). Let clean typography carry the hierarchy.
- **Icons ONLY for functional actions:** Icons are strictly limited to icon-only buttons (Close `X`, Back `←`, Search, Menu, External Link, Dropdown chevron) or minimal directional cues.

---

## 2. Color & Border Tokens (Strict Palette)

Use these semantic tokens. Never invent arbitrary Tailwind colors.

| Role | Token / Hex | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#F4F4F5` | `bg-zinc-100` | Main page background |
| **Surface** | `#FFFFFF` | `bg-white` | Match cards, tables, header, bracket nodes |
| **Surface Hover** | `#FAFAFA` | `hover:bg-zinc-50` | Interactive table rows, match rows |
| **Ink Primary** | `#09090B` | `text-zinc-950` | Team names, scores, primary headings |
| **Ink Secondary** | `#52525B` | `text-zinc-600` | Subheaders, group names, secondary stats |
| **Ink Muted** | `#A1A1AA` | `text-zinc-400` | Timestamps, table headers, dividers |
| **Border Internal** | `#D4D4D8` | `border-zinc-300` / `divide-zinc-300` | Internal table rows, match dividers |
| **Border Panel / Card** | `#A1A1AA` | `border-[1.5px] border-zinc-400` | Outer borders of cards, tables, panels |
| **Border Strong / Frame** | `#18181B` | `border-2 border-zinc-900` | Header bottom border, modals, active tabs |
| **Accent Primary** | `#0052FF` | `text-[#0052FF]` | Active links, primary CTA, selected filter |

### Semantic Match & Standings Colors
- **LIVE Indicator:** `#EF4444` (`bg-red-500` / `text-red-600`) — Solid dot + uppercase `LIVE`.
- **Win / Qualified Zone:** `#10B981` (`bg-emerald-500` / `text-emerald-700`) — Left edge bar (`3px` or `4px`) on standings row.
- **Draw:** `#A1A1AA` (`bg-zinc-400`) — Form badge `D`.
- **Loss / Eliminated Zone:** `#E11D48` (`bg-rose-600` / `text-rose-600`) — Left edge bar (`3px`) or form badge `L`.

---

## 3. Typography & Hierarchy

### Font Pairing
- **Display & UI (`font-sans`):** `Archivo` (tight, geometric, clean).
- **Numbers, Scores & Metadata (`font-mono`):** `IBM Plex Mono` (monospace).

### Strict Typographic Rules
- **Tabular Numbers (Mandatory):** Every score, standing position, goal difference (`GD`), point (`PTS`), and timestamp MUST use `tabular-nums` (`font-variant-numeric: tabular-nums`) so numbers align vertically.
- **Main League Title:** `text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight`.
- **Section Headers:** `text-xs sm:text-sm font-mono font-semibold uppercase tracking-widest text-zinc-500`.
- **Team Names:** `text-sm sm:text-base font-semibold text-zinc-950 tracking-tight truncate`.
- **Match Scores & Points:** `text-sm sm:text-base font-mono font-bold text-zinc-950 tabular-nums`.
- **Winner Emphasis:** Winning team name and score stay `text-zinc-950 font-bold`; losing team drops to `text-zinc-400 font-normal`.

---

## 4. Layout & Grid System

- **Container:** `max-w-7xl mx-auto px-3 sm:px-6` (scaled up for balanced desktop density).
- **Hairline Grid Containers:** Group related items inside a single `bg-white border-[1.5px] border-zinc-400` container and separate internal items using `divide-y divide-zinc-300`.
- **Mobile-First (375px):** Zero horizontal scroll on the main page. Tables hide non-essential columns on mobile (`hidden sm:table-cell`) while preserving essential columns (Rank, Team, P, GD, PTS, Form).

---

## 5. Core Component Specs

### A. Header & View Switcher
- Height: `h-16` (`64px`), `bg-white border-b-2 border-zinc-900 sticky top-0 z-40`.
- Width: `max-w-7xl mx-auto px-3 sm:px-6`.
- Logo: Sharp square (`w-8 h-8 sm:w-9 sm:h-9 border border-zinc-900 overflow-hidden`).
- Brand Name: `text-sm sm:text-base font-bold tracking-tight text-zinc-950`.
- Navigation Tabs: Flat underline tabs (`border-b-2 border-zinc-950 text-zinc-950` for active; `text-zinc-500 hover:text-zinc-950` for inactive). No pill-shaped tab containers.

### B. Match Row (Scoreboard Item)
- Outer Box: `bg-white border-[1.5px] border-zinc-400 divide-y divide-zinc-300`.
- Row Layout: 3-column horizontal grid (`grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4`).
- Team Logo / Avatar: `w-8 h-8 object-cover border border-zinc-300 bg-white shrink-0`.
- Team Names: `text-sm sm:text-base truncate`.
- Left: Home Team (right-aligned: `text-right truncate flex items-center justify-end gap-2.5`).
- Center: Score box (`min-w-[76px] text-center font-mono font-bold text-sm sm:text-base bg-zinc-100 border border-zinc-300 py-1 px-2.5`). If `UPCOMING`, show kickoff time or `VS`.
- Right: Away Team (left-aligned: `text-left truncate flex items-center justify-start gap-2.5`).
- Status Tag: Small `10px` mono badge (`FT`, `LIVE`, `SIAP`, `JADWAL`).

### C. Standings Table (Klasemen)
- Outer Box: `bg-white border-[1.5px] border-zinc-400 overflow-hidden`.
- Header row: `bg-zinc-50 border-b border-zinc-300 text-xs font-mono uppercase text-zinc-500 font-semibold py-3 px-5`.
- Row Padding: `py-4 px-5` across columns.
- Team Avatar / Logo: `w-8 h-8 object-cover border border-zinc-300 bg-white shrink-0`.
- Team Name: `text-sm sm:text-base font-semibold text-zinc-950 truncate`.
- Points (PTS): `text-sm sm:text-base font-bold text-zinc-950 tabular-nums`.
- Columns on Mobile: `#`, `TEAM`, `P` (Played), `GD` (+/-), `PTS` (Bold).
- Columns on Desktop (`sm:`): Add `W`, `D`, `L`, `GF:GA`, and `FORM` (5 badges: `W` green, `D` gray, `L` red).
- Zone Indicator: `border-l-[3px] border-l-emerald-500` on qualifying rows (Top 4).

### D. League Detail & Hero Banner
- Hero Banner: `bg-white border-[1.5px] border-zinc-400 p-5 sm:p-6`.
- Main Title: `text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight`.
- Quick Metrics: `divide-x divide-zinc-300 border border-zinc-300 bg-zinc-50 font-mono text-xs`.
- Roster Cards: `bg-white border border-zinc-300 p-3.5` with `w-8 h-8` logo.

---

## 6. Motion & States
- **Transitions:** Fast and mechanical (`transition-colors duration-100`). No bounce, no scale-up on cards.
- **Loading State:** Flat `bg-zinc-200 animate-pulse` rectangular skeletons matching exact row heights.
- **Empty State:** Bordered box `border-[1.5px] border-zinc-400 p-10 font-mono text-xs uppercase text-zinc-500`.
