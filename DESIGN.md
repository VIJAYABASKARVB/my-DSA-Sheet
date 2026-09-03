---
name: "My DSA Sheet — Minimal Archive"
description: "Firestore-synced DSA tracker · Topic→Pattern→Problem · Warm paper/charcoal + flat editorial minimal"
colors:
  paper: "#F7F6F3"
  paper-soft: "#FBFBFA"
  charcoal: "#0F0F0F"
  charcoal-soft: "#141414"
  card-light: "#FFFFFF"
  card-dark: "#1A1A1A"
  muted-light: "#F7F6F3"
  muted-dark: "#1E1E1E"
  foreground-light: "#111111"
  foreground-dark: "#F5F5F3"
  muted-foreground-light: "#787774"
  muted-foreground-dark: "#B8B8B5"
  border-light: "#EAEAEA"
  border-dark: "rgba(255,255,255,0.10)"
  pale-red-bg: "#FDEBEC"
  pale-red-text: "#9F2F2D"
  pale-blue-bg: "#E1F3FE"
  pale-blue-text: "#1F6C9F"
  pale-green-bg: "#EDF3EC"
  pale-green-text: "#346538"
  pale-yellow-bg: "#FBF3DB"
  pale-yellow-text: "#956400"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(1.9rem, 4.5vw, 2.6rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, -apple-system, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Geist, -apple-system, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.foreground-light}"
    textColor: "{colors.card-light}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  badge-difficulty-easy:
    backgroundColor: "{colors.pale-green-bg}"
    textColor: "{colors.pale-green-text}"
    rounded: "9999px"
  input-search:
    backgroundColor: "{colors.muted-light}"
    textColor: "{colors.foreground-light}"
    rounded: "{rounded.md}"
  card-flat:
    backgroundColor: "{colors.card-light}"
    rounded: "{rounded.lg}"
    padding: "12px"
---

# Design System: My DSA Sheet — Minimal Archive

## 1. Overview

**Creative North Star: "The Calm Archive"**

A warm paper (light) / warm charcoal (dark) editorial sheet for obsessive repetition. Not a marketing site — an archive where progress is the product. The ground is `#F7F6F3` at `src/app/globals.css:54` (light) and `#0F0F0F` at `src/app/globals.css:111` (dark), with flat tonal stacking `background → card → muted` and hairline `#EAEAEA` / `rgba(255,255,255,0.10)` borders. Grain/ambient orb sit fixed behind content at 3–6% opacity (`globals.css:173-189`, `339-357`), pointer-events-none — never on scroll cards. One hero editorial beat (Newsreader `clamp(1.9rem,4.5vw,2.6rem)` at `src/app/page.tsx:136`, `src/app/sheet/page.tsx:299`) carries the brand; everything below stays restrained, dense, flat.

Density is a virtue. Topic → Pattern → Problem is always visible; Due-for-Review and progress are one glance away. The system is Restrained: monochrome carries 90% of surface; pale semantic tints (red/amber/green/blue at `globals.css:98-105`) appear only for meaning (difficulty, solved/review/due).

**Anti-reject:** Vanilla shadcn dashboard (identical card grids, border-left accent, gray tables), neon-on-black crypto terminal, glassmorphism on every card, gradient text. Vanguard OLED specs previously in this file were shipped and then intentionally replaced by warm minimal (`git eb0f1a8`).

**Key Characteristics:**
- Warm paper/charcoal + flat cards, hairline borders only
- Newsreader display once per route, Geist + Geist Mono elsewhere
- 600ms editorial ease `cubic-bezier(0.16,1,0.3,1)` at `globals.css:95` — reveals 600ms, task feedback 150-250ms
- Pale tints for difficulty/status, monochrome for progress (`bg-primary` is foreground)
- Fixed ambient depth (grain + blob) — no blur on scroll content; header uses `backdrop-blur-[8px]` only (`src/components/AppHeader.tsx:109`)

## 2. Colors

Restrained strategy: tinted neutrals carry 90% of surface; semantic pale tints are the only saturated accents and appear only where meaning requires them.

### Primary (monochrome)
- **Primary / Progress** — `--primary` is `#111111` light / `#F5F5F3` dark (`globals.css:63/120`). Used for circular progress stroke (`AppHeader.tsx:46`), topic/pattern bars (`TopicAccordion.tsx:80`, `PatternAccordion.tsx:62`, `sheet/page.tsx:490`), active filter pills (`FilterBar.tsx:15-23`), solved status (`ProblemRow.tsx:33-37`). Progress is monochrome, not emerald.
- **Foreground / Card / Muted** — Tonal stack light: `background #F7F6F3` → `card #FFFFFF` → `muted #F7F6F3`; dark: `background #0F0F0F` → `card #1A1A1A` → `muted #1E1E1E`. Always tinted warm, never pure `#000/#fff`.

### Semantic Accents (small roles, not palette drivers)
- **Pale Green** `#EDF3EC / #346538` (`--pale-green-bg/text` at `globals.css:102-103`): Easy difficulty (`ProblemRow.tsx:12`), mastered badge (`ProblemRow.tsx:148`), upcoming header (`DueForReviewSection.tsx:181`).
- **Pale Yellow / Amber** `#FBF3DB / #956400` (`globals.css:104-105`): Medium difficulty (`ProblemRow.tsx:13`), review status (`ProblemRow.tsx:39-43`), due badge (`AppHeader.tsx:134`), due-today today accent (`DueForReviewSection.tsx:135`). Dark variants use `/16` opacity washes.
- **Pale Red** `#FDEBEC / #9F2F2D` (`globals.css:98-99`): Hard difficulty (`ProblemRow.tsx:14`), due-empty error states (`DueForReviewSection.tsx:70`).
- **Pale Blue** `#E1F3FE / #1F6C9F` (`globals.css:100-101`): Secondary informational accents (landing system grid at `src/app/page.tsx:289`).

### Named Rules
**The Monochrome Progress Rule.** Progress is always `bg-primary` (foreground). No emerald fill. If color appears on a progress bar, it is wrong — pale tints are reserved for difficulty/status only.
**The Warm Neutral Rule.** Background is never `#000` or `#fff`. Light foreground is `#111`, dark foreground is `#F5F5F3` (`oklch` tinted). High chroma at extremes is forbidden.

## 3. Typography

**Display Font:** Newsreader (variable `--font-newsreader` at `src/app/layout.tsx:19`, `display:swap`, normal+italic)
**Body Font:** Geist Sans (variable `--font-geist-sans` at `layout.tsx:7`)
**Label/Mono Font:** Geist Mono (variable `--font-geist-mono` at `layout.tsx:13`)

**Character:** Display once per page (hero only) — editorial, calm, archival. Body is system-native, tight tracking (-0.02em). Mono carries all metrics, counts, due dates, and status (10px mono badges feel like lab labels).

### Hierarchy
- **Display** (400, clamp(1.9rem,4.5vw,2.6rem), 1.05, -0.03em): Hero at `src/app/sheet/page.tsx:299` and landing at `src/app/page.tsx:136`. Used once per route. Italic `font-[300]` for the contrast word ("Sheet", "without").
- **Headline** (400, 17px, 1, -0.02em): Topic names at `TopicAccordion.tsx:66` (Newsreader). Truncate if longer.
- **Title** (500, 13px, 1.4): Pattern names at `PatternAccordion.tsx:52`, problem names at `ProblemRow.tsx:122` (truncated). Max 65–75ch for prose at `src/app/page.tsx:142`, but titles truncate, not wrap.
- **Body** (400, 13-15px, 1.6): Descriptions, empty-state copy, due metadata (11px at `DueForReviewSection.tsx:133-141`).
- **Label** (500, 10px, 0.08em, uppercase, Mono): Eyebrows (`eyebrow` at `globals.css:250-270`), stat rail labels (`sheet/page.tsx:36`), badge uppercase difficulty (`ProblemRow.tsx:155`).

### Named Rules
**The One Display Rule.** Newsreader appears only in hero + topic headlines. All labels, buttons, data, and body use Geist/Geist Mono. If a button contains serif, it is wrong.
**The Mono Metric Rule.** Any number that is a count or percent is Geist Mono, not Geist Sans. Solved/total, pct, overdue days, completedRevisions — all mono.

## 4. Elevation

Flat by default. Depth is conveyed by tonal layering (paper → card → muted → border) and hairline borders (1px at `globals.css:273`), not shadows. Shadows appear only as response to state or on fixed islands.

### Shadow Vocabulary
- **Flat Card** (`globals.css:273-299`): `bg-card border border-border rounded-[12px]`. Hover: `0 2px 8px rgba(0,0,0,0.04)` light / `0 2px 12px rgba(0,0,0,0.3)` dark + `border-border` boost. Always present; no blur.
- **Flat Bone** (`flat-card--bone` at `globals.css:291-299`): Muted variant `bg-[#FBFBFA]` light / `#141414` dark for secondary containers.
- **Header Island** (`AppHeader.tsx:109` + `sheet/page.tsx:349`): `bg-card/85 backdrop-blur-[8px] border-b border-border` + `shadow-[0_2px_8px_rgba(0,0,0,0.04)]` on scrolled state. Only sticky header/filter earn blur.
- **Reveal Motion** (`globals.css:229-247`): `translateY(12px)` → `0` over 600ms `var(--ease-editorial)`, disabled under `prefers-reduced-motion`.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only on hover/islands. Ambient blob (`ambient-blob` fixed 600px radial at `globals.css:339-357`) and body `::before` grain are behind content, pointer-events-none, never on scroll containers.

## 5. Components

### Buttons
- **Shape:** `rounded-[6px]` for primary/filter (small), `rounded-[8px]` for cards, `rounded-[12px]` for sections. No pill-full.
- **Primary:** `bg-primary text-primary-foreground` (`sheet/page.tsx:308`, `AppHeader.tsx:214`). Monochrome, hover `bg-primary/90`, `active:scale-[0.98]`. Transition `200ms var(--ease-editorial)`.
- **Secondary / Ghost:** `bg-card border border-border` → `hover:bg-muted` (`ProblemRow.tsx:226`, `FilterBar.tsx:121`). Subtle, not competing.
- **Icon:** `w-7 h-7 rounded-[6px] border border-border bg-card` → `hover:bg-muted` for status/notes/edit (`ProblemRow.tsx:114,195,220`).

### Chips / Pills
- **Difficulty group** (`FilterBar.tsx:114`): Segmented container `rounded-[8px] bg-muted border border-border p-1`. Active: `bg-primary text-primary-foreground border-primary`. Future: semantic pale variants per difficulty (see craft).
- **Status group** (`FilterBar.tsx:131`): Same container; active maps to `bg-primary`.
- **Tags** (`FilterBar.tsx:157`): `h-7 px-3 rounded-full border` — active `bg-primary`, inactive `bg-card border-border`.

### Cards / Containers
- **Corner Style:** `12px` default (`rounded-[12px]`), `8px` for pattern items (`PatternAccordion.tsx:48`).
- **Background:** Tonal stack: page `bg-background` → card `bg-card` → muted `bg-muted/30` inside accordions (`TopicAccordion.tsx:85`).
- **Border:** `1px solid var(--border)` — `#EAEAEA` light / `rgba(255,255,255,0.10)` dark — hairline only.
- **Internal Padding:** `p-3 md:p-4` FilterBar, `px-5 py-4` Topic trigger, `px-4 py-3` Pattern trigger, `py-2.5 px-3 md:px-4` rows.

### Inputs / Fields
- **Style:** `h-10 rounded-[8px] bg-muted border-border` (`FilterBar.tsx:70`), placeholder `text-muted-foreground`, focus `ring-1 ring-ring/20`. No fill change on focus; ring only.
- **Dialog Inputs:** `h-9 rounded-[8px] bg-muted border-border` (`ProblemRow.tsx:268`).
- **Error / Disabled:** Toasts via `sonner` (`layout.tsx:59`), not inline red text. Disabled `opacity-50`.

### Navigation
- Sticky header (`sticky top-0 z-30 bg-card/85 backdrop-blur-[8px] border-b border-border` at `AppHeader.tsx:109`) — inner `max-w-[1160px] mx-auto px-4 md:px-6 h-[56px] flex`. Left brand lockup (mono DSA badge + Sheet wordmark), center sheet stats (desktop), right circular progress (`CircularProgress` SVG at `AppHeader.tsx:7-56`) + ThemeToggle + auth. Mobile: hamburger morph (2 spans rotate 45deg at `AppHeader.tsx:229-231`) → drawer `max-h-[520px]` at `AppHeader.tsx:242`.
- Typography: nav text is 11-13px mono/label, not display.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page warm paper `#F7F6F3` / charcoal `#0F0F0F` and let `body::before` grain + `ambient-blob` do atmosphere — not per-card gradients.
- **Do** use monochrome `bg-primary` for all progress (circular + linear); reserve pale tints only for difficulty/status/due meaning.
- **Do** reserve Newsreader for hero + topic headlines only; use Geist Mono for every count/pct/badge.
- **Do** keep product inputs at 40px (`h-10`) with 42px touch-target audit on rail; row icons may compact to 28px but filter/sheet controls stay ≥40px.
- **Do** use flat cards for primary containers (TopicAccordion, FilterBar, DueForReview, notes) — `rounded-[12px] border border-border bg-card` with hairline, not bezels.
- **Do** animate only `transform`/`opacity`/`filter` with `--ease-editorial` 600ms for reveals, 150-250ms for state feedback; respect `prefers-reduced-motion`.
- **Do** keep dialogs `bg-card border border-border rounded-[12px]` with focus trap via @base-ui/react/dialog at `src/components/ui/dialog.tsx`.

### Don't:
- **Don't** look like a generic shadcn dashboard — no identical card grids, no repeated icon+heading+text cards, no hero-metric big-number template.
- **Don't** use border-left or border-right >1px as colored accent on cards/list items/callouts — use full border tint or leading icon instead.
- **Don't** use gradient text (background-clip:text) — use single solid foreground with weight/size contrast.
- **Don't** apply glassmorphism/blur as default on scroll cards — blur is permissioned only for sticky header/filter/dialog at 8px.
- **Don't** look like neon-on-black crypto — no high-chroma neons at 0.2+ on dark; pale tints at `/16` washes only.
- **Don't** animate CSS layout properties (height/width/top) — transition `transform`/`opacity`; accordion uses `h-(--accordion-panel-height)` with `data-open:animate-` at `src/components/ui/accordion.tsx:57`.
- **Don't** nest cards more than 2 deep — Topic (card) → Pattern (card) → Row (divider) is the hierarchy; avoid card inside card inside card.
- **Don't** wrap everything in a container — hero grid and ambient blob are full-bleed, not contained.
