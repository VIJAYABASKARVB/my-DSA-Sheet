---
name: "My DSA Sheet — Vanguard Edition"
description: "Firestore-synced DSA tracker · Topic→Pattern→Problem · Vanguard OLED + Ethereal Glass"
colors:
  vantablack: "#0A0A0A"
  vantablack-soft: "#141414"
  surface: "#1A1A1A"
  card: "#242424"
  muted: "#2E2E2E"
  foreground: "#F5F5F3"
  muted-foreground: "#8A8A8A"
  emerald: "#10B981"
  emerald-soft: "#10B9811A"
  border-subtle: "#262626"
  amber: "#F59E0B"
  red: "#EF4444"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2.2rem, 6vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.16em"
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  bezel-outer: "32px"
  bezel-inner: "26px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.emerald}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 12px 4px 4px"
  button-primary-hover:
    backgroundColor: "{colors.emerald}"
  badge-difficulty-easy:
    backgroundColor: "{colors.emerald-soft}"
    textColor: "{colors.emerald}"
    rounded: "{rounded.lg}"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
  card-bezel:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.bezel-inner}"
    padding: "6px"
---

# Design System: My DSA Sheet — Vanguard Edition

## 1. Overview

**Creative North Star: "The Obsessive Archive"**

A vantablack lab notebook etched with glass. The system is not a marketing site that happens to have a list — it is an archive for obsessive repetition. Vantablack OLED (oklch(0.08 0 0) at `src/app/globals.css:54`) is the ground; ethereal glass mesh orbs (fixed, pointer-events-none at `globals.css:137-149`) breathe behind it but never compete with the data. Double-bezel islands (`bezel-outer` 2rem / `bezel-inner` calc(2rem−0.375rem) at `globals.css:105-106`) are the only surfaces that earn blur (`glass-island` blur 24px + saturate 1.2 at `globals.css:186-195`). Everything that scrolls stays flat, tonal, and performant.

Density is a virtue. Topic → Pattern → Problem is always visible; progress is never more than one glance away. The hero is the single committed brand beat — Instrument Serif display at `clamp(2.2rem,6vw,3.75rem)` (`src/app/sheet/page.tsx:169`) plus mono metrics — everything below is restrained, tight, task-focused.

**Anti-reject:** Generic shadcn dashboard (identical card grids, border-left accent stripes, hero-metric big-number template), SaaS-cream editorial-typographic, neon-on-black crypto terminal. Those lanes are saturated; this archive is darker, more precise, more personal.

**Key Characteristics:**
- Vantablack OLED + emerald commit (≤10% except hero + progress)
- Double-bezel as signature container (outer hairline, inner glass)
- Instrument Serif display once, Geist + Geist Mono everywhere else
- 700ms Vanguard ease (`cubic-bezier(0.32,0.72,0,1)` at `globals.css:100`) — slow elegance, short task feedback at 150-250ms where possible
- Grain 3% + mesh blur 0.5px for depth without cost

## 2. Colors

Restrained strategy: tinted neutrals carry 90% of the surface; emerald is the only saturated accent and appears on progress, selection, and due states — its rarity is the point.

### Primary
- **Vanguard Emerald** (#10B981 / oklch(0.72 0.17 162.48) at `globals.css:81`): Primary actions, solved state, progress fill (`src/app/sheet/page.tsx:185`, `TopicAccordion.tsx:57`, `PatternAccordion.tsx:46`), circular progress stroke (`AppHeader.tsx:38`), due-today today accent. Never used as large background; always as pill/badge/fill/stroke.
- **Emerald Soft** (#10B98114 / oklch(0.72 0.17 162.48 / 0.08) at `globals.css:82` / `--emerald-muted`): Hover washes, easy-recall inactive (`RecallButtons.tsx:22`), selection rings (`DueForReviewSection.tsx:52`).

### Neutral
- **Vantablack** (#0A0A0A / oklch(0.08 0 0) at `globals.css:54`): Page background (`bg-background`). Grain overlay at 3% sits on top.
- **Vantablack Soft** (#141414 / oklch(0.12 0 0 / 0.62) `glass-island`): Fixed header island, dialog chrome (`ProblemRow.tsx:193`).
- **Surface** (#1A1A1A / oklch(0.14 0 0) `--card`/`--sidebar`): Cards, bezel-inner (`bezel-inner` bg at `globals.css:207`).
- **Muted** (#2E2E2E / oklch(0.18 0 0) `--muted`/`--secondary`): Inactive pills (`FilterBar.tsx:121`), secondary badge bg.
- **Foreground** (#F5F5F3 / oklch(0.96 0 0) at `globals.css:55`): Primary text, always tinted warm (chroma 0.005) never pure white.
- **Muted Foreground** (#8A8A8A / oklch(0.56 0 0) `--muted-foreground`): Labels, counts, eyebrows (10px tracking 0.16em).
- **Border Subtle** (#262626 / oklch(1 0 0 / 0.07) `--border`): Hairline borders, dividers (`border-white/[0.06]` maps here at 6% opacity).

### Semantic Accents (small roles, not palette drivers)
- **Amber** (#F59E0B): Review / hint / due states (`statusConfig review` at `ProblemRow.tsx:40-45`, `RecallButtons hint` at `:24-28`, `DueForReviewSection amber-500/10`). Used only for "attention, not success."
- **Red** (#EF4444): Hard difficulty (`ProblemRow.tsx:15`), blank recall (`RecallButtons.tsx:31-35`).

### Named Rules
**The Emerald Rarity Rule.** Emerald occupies ≤10% of any scrolled viewport. Hero pct pill and progress bars are exempt; no other surface may drench emerald. If emerald covers >10%, demote to emerald-soft wash or zinc.
**The Vantablack Rule.** Background is never #000 or #fff. Even "white" text is oklch(0.96 0 0) with 0.005 chroma tint; even "black" is oklch(0.08 0 0). High chroma at extremes is forbidden.

## 3. Typography

**Display Font:** Instrument Serif (variable `--font-instrument-serif` at `src/app/layout.tsx:18-23`, loaded `display:swap`, weight 400)
**Body Font:** Geist Sans (variable `--font-geist-sans` at `layout.tsx:6-10`)
**Label/Mono Font:** Geist Mono (variable `--font-geist-mono` at `layout.tsx:12-16`)

**Character:** Display once per page (hero only) — elegant, editorial, vanguard. Body is system-native, tight tracking (-0.02em), no fluid scale — fixed rem so sidebar and sheet agree. Mono carries all metrics, counts, due dates, and status (10px mono badges feel like lab labels).

### Hierarchy
- **Display** (400, clamp(2.2rem,6vw,3.75rem), 0.9, -0.04em): Hero "Your DSA Sheet, perfected." at `page.tsx:169`. Used once per route. Light on dark → line-height +0.05 (0.9 vs 1.0 spec) for breathing.
- **Headline** (400, 20px, 1, -0.02em): Topic names at `TopicAccordion.tsx:42` (Instrument Serif). Three words max; truncate if longer.
- **Title** (500, 13px, 1.4): Pattern names at `PatternAccordion.tsx:35`, Problem names at `ProblemRow.tsx:135` (truncated). Max 65-75ch for prose at `page.tsx:176` (description), but titles truncate, not wrap.
- **Body** (400, 13-15px, 1.6): Descriptions, empty-state copy, due metadata (11px at `DueForReviewSection.tsx:126-134`).
- **Label** (500, 10px, 0.16em, uppercase): Eyebrows (`eyebrow` at `globals.css:292-306`), stat rail labels (`StatRailCard` at `page.tsx:35-43`), badge uppercase difficulty (`ProblemRow.tsx:142`).

### Named Rules
**The One Display Rule.** Instrument Serif appears only in hero + topic headlines. All labels, buttons, data, and body use Geist/Geist Mono. If a button contains serif, it is wrong.
**The Mono Metric Rule.** Any number that is a count or percent is Geist Mono, not Geist Sans. Solved/total, pct, overdue days, reviewCount — all mono.

## 4. Elevation

Flat by default. Depth is conveyed by tonal layering (vantablack → surface → card → muted) and hairline borders (1px at 6-8% white), not shadows. Shadows appear only as response to state or on fixed islands.

### Shadow Vocabulary
- **Bezel Inner** (`inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.25)` at `globals.css:209-211`): Default card depth. Always present inside `bezel-outer` → `bezel-inner`.
- **Glass Island** (`inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.35) + blur(24px) saturate(1.2)` at `globals.css:189-194`): AppHeader (`AppHeader.tsx:93`) and expanded mobile overlay. Only fixed/sticky surfaces.
- **Glass Surface** (`inset 0 1px 0 rgba(255,255,255,0.04) + blur(12px)` at `globals.css:178-183`): Secondary sticky panels (DueForReview header at `globals.css:168-176` pattern).
- **Reveal Motion** (not shadow but elevation cue): `translateY(24px) scale(0.98) blur(8px)` → `translateY(0) scale(1) blur(0)` over 800ms Vanguard ease (`globals.css:265-280`), disabled under `prefers-reduced-motion` (`globals.css:282-289`).

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows/borw appear only on islands or hover. Grain (`grain::before` fixed 3% at `globals.css:125-135`) and mesh (`mesh::before` fixed radial gradients at `137-149`) are behind content, pointer-events-none, never on scroll containers.

## 5. Components

### Buttons
- **Shape:** Pill-full (`rounded-full`) for primary/filter actions; `rounded-lg` for shadcn default at `button.tsx:7`. Island buttons have inner white dot arrow (Group hover translate 1-2px).
- **Primary:** Emerald bg, white text, 7px inner white circle with arrow (`page.tsx:217-227`, `ProblemRow.tsx:316-321`). Padding: pl-5 pr-1 py-1 text-xs/s. Transition: `700ms ease-vanguard`.
- **Hover / Focus:** `hover:bg-emerald/90`, `focus-visible:ring-ring/50` (`button.tsx:7`), `active:scale-[0.98]` or `active:scale-[0.92]` for icon buttons. Never bounce/elastic.
- **Secondary / Ghost:** `bg-white/[0.04] border-white/5` → `hover:bg-white/[0.08]` (`ProblemRow.tsx:186`, `FilterBar.tsx:118-121`). Secondary subtle, not competing with emerald.

### Chips
- **Style:** Filter pills in segmented container (`rounded-full bg-white/[0.03] border-white/5 p-1` at `FilterBar.tsx:113`). Active: emerald bg + white text + shadow `0 2px 10px rgba(16,185,129,0.3)` (`FilterBar.tsx:16`, `RecallButtons.tsx:20`).
- **State:** Easy/Medium/Hard pills map to emerald/amber/red active (`FilterBar.tsx:15-18`); Solved/Review map to emerald/amber (`FilterBar.tsx:21-24`); Tags map to emerald when selected else `bg-white/[0.04]` (`FilterBar.tsx:158-162`).

### Cards / Containers
- **Corner Style:** Bezel outer 2rem, inner calc(2rem−0.375rem) (`globals.css:105-106`); Pattern accordion 1.25rem (`PatternAccordion.tsx:32`).
- **Background:** Tonal stack: page vantablack → bezel-outer white/[0.035] → bezel-inner oklch(0.145) (`globals.css:198-213`). Pattern items: `bg-white/[0.015]` closed → `bg-white/[0.03]` open.
- **Shadow Strategy:** Bezel inner shadow by default; island shadow only on AppHeader overlay (see Elevation).
- **Border:** `1px solid oklch(1 0 0 / 0.06)` outer, `0.04` inner — hairline only (`globals.css:199-208`).
- **Internal Padding:** Outer `p-6` → inner `p-5` for bezel; `p-1.5` for compact TopicAccordion (`TopicAccordion.tsx:36`), `px-4 py-3` for Pattern trigger (`PatternAccordion.tsx:34`).

### Inputs / Fields
- **Style:** `h-[42px] rounded-full bg-white/[0.04] border-white/10` (`FilterBar.tsx:65`), placeholder zinc-500, focus `border-emerald/30`. No fill change on focus; border shift only.
- **Focus:** `focus-visible:border-emerald/30 focus-visible:ring-0` — subtle, not glow. Text inputs in dialog `h-9 rounded-full` (`ProblemRow.tsx:232`).
- **Error / Disabled:** Toasts via `sonner` (`layout.tsx:47`), not inline red text. Disabled `opacity-50 pointer-events-none`.

### Navigation
- Fixed glass island (`fixed top-4 inset-x-0 flex justify-center` at `AppHeader.tsx:91`) — `glass-island rounded-full px-2 py-1.5 max-w-[1160px]` (`AppHeader.tsx:93`). Left brand lockup (emerald dot Code2 + mono DSA + vanguard pulse), center topic counts (desktop only), right circular progress (`CircularProgress` SVG at `AppHeader.tsx:8-47`) + auth. Mobile: hamburger morph (2 spans rotate 45deg at `AppHeader.tsx:218-222`) → overlay `bg-black/75 backdrop-blur-3xl` at `AppHeader.tsx:241` with staggered reveals.
- Typography: nav text is 11-13px mono/label, not display.

### Signature: Double-Bezel Section
- Outer `bezel-outer` wraps inner `bezel-inner`; reveals use `IntersectionObserver` threshold 0.12 at `page.tsx:303-317`, staggered 80ms per topic. Grain/mesh are fixed layers behind; never blur the bezel itself.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page vantablack OLED (oklch(0.08 0 0)) and let grain 3% + mesh radials do the atmosphere — not per-card gradients.
- **Do** use emerald only for progress, solved, active filter, due accent — ≤10% except hero pct pill (`page.tsx:184`) and topic bars (`TopicAccordion.tsx:57`).
- **Do** reserve Instrument Serif for hero + topic headlines only; use Geist Mono for every count/pct/badge.
- **Do** keep product inputs at 42px pill height (FilterBar) with 44px touch target audit; row icons may compact to 28-32px but rail/sheet controls stay ≥42px.
- **Do** use double-bezel for primary containers (TopicAccordion, FilterBar, stat rail, DueForReview) — outer 2rem, inner calc(2rem−0.375rem), hairline borders.
- **Do** animate only `transform`/`opacity`/`filter` with Vanguard ease 700ms for entrances, 150-250ms for state feedback; respect `prefers-reduced-motion`.
- **Do** keep dialogs glass-dark (`bg-[#0A0A0A]/90 backdrop-blur-3xl` at `ProblemRow.tsx:193`) with focus trap via @base-ui/react/dialog.

### Don't:
- **Don't** look like a generic shadcn dashboard — no identical card grids, no repeated icon+heading+text cards, no hero-metric big-number template.
- **Don't** use border-left or border-right >1px as colored accent on cards/list items/callouts — use full border tint or leading icon instead.
- **Don't** use gradient text (background-clip:text) — use single solid emerald or foreground with weight/size contrast.
- **Don't** apply glassmorphism/blur as default on scroll cards — blur is permissioned only for fixed islands (AppHeader, dialog) per globals.css:167 comment.
- **Don't** look like SaaS-cream editorial — no editorial-typographic lane (display serif italic + mono labels + ruled separators + monochromatic restraint) except the single hero beat.
- **Don't** look like neon-on-black crypto — no high-chroma neons at 0.2+ on dark; reduce chroma as lightness approaches 0 (emerald chroma 0.17 at L 0.72 is allowed; neon at L 0.08 is forbidden).
- **Don't** animate CSS layout properties (height/width/top) — transition `grid-template-rows` or `transform` instead; accordion uses `h-(--accordion-panel-height)` with `data-open:animate-` at `accordion.tsx:57`.
- **Don't** nest cards — a card inside a card inside a card is always wrong; use bezel → flat pattern → row divider instead.
- **Don't** wrap everything in a container — hero mesh and grain are fixed full-bleed, not contained.

