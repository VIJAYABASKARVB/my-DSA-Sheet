# Vanguard Design System Init — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish `PRODUCT.md` + `DESIGN.md` (+ `.impeccable/design.json`) and redesign the Sheet to product-grade Vanguard.

**Architecture:** Teach (scan + confirm) → Document scan (token extraction from `globals.css` + `layout.tsx`) → AppHeader/FilterBar/Row/Accordion polish → Build verify. Two commits, idempotent.

**Tech Stack:** Next.js 16.3.2 App Router (`src/`), Tailwind v4 + tw-animate-css, @base-ui/react, OKLCH, Geist + Instrument Serif, Firestore.

**Spec:** This plan. Source of truth for tokens is `src/app/globals.css:49-107` and `src/app/layout.tsx:6-43`.

## Global Constraints

- Forced dark only: `<html class="dark">` at `src/app/layout.tsx:40`, `color-scheme:dark` at `globals.css:50`
- OKLCH canonical, hex in frontmatter for Stitch linter
- `strict:true`, never `any`
- Build: `next build --webpack` on win32
- No writes to `.next/`/`dist/`

---

## File Structure

```
My_DSA_Sheet/
├── PRODUCT.md
├── DESIGN.md
├── .impeccable/design.json
├── src/app/sheet/page.tsx (hero + grid polish)
├── src/components/AppHeader.tsx (a11y + 200ms taps)
├── src/components/FilterBar.tsx (44px search, 32px pills, aria-pressed, fade)
├── src/components/sheet/ProblemRow.tsx (200ms, focus rings)
├── src/components/sheet/RecallButtons.tsx (focus, sm 32px)
├── src/components/sheet/PatternAccordion.tsx (200ms, progress aria)
├── src/components/sheet/TopicAccordion.tsx (h2, 200ms)
└── src/components/sheet/DueForReviewSection.tsx (section landmark, focus)
```

---

### Task 1: PRODUCT.md

**Files:**
- Create: `PRODUCT.md`

- [x] Re-run loader `node C:/Users/ELCOT/.agents/skills/impeccable/scripts/load-context.mjs` → `hasProduct:false`
- [x] Write PRODUCT.md with register `product`, personality obsessive/ethereal/precise, anti-refs generic shadcn / SaaS cream / neon crypto, 5 principles, WCAG AA notes
- [x] Commit `docs: add PRODUCT.md`
- [x] Re-run loader → `hasProduct:true`

### Task 2: DESIGN.md + sidecar

**Files:**
- Create: `DESIGN.md`, `.impeccable/design.json`

- [x] Extract tokens: vantablack oklch(0.08 0 0), emerald oklch(0.72 0.17 162.48), bezel 2rem/26px, Geist stacks, Vanguard ease 700ms
- [x] Stage frontmatter hex (Stitch-valid) + 6 sections (Overview, Colors, Typography, Elevation, Components, Do's/Don'ts) — Restrained strategy
- [x] Write sidecar schemaVersion 2 with tonal ramps, shadows, motion, 6 components (ds- prefixed, Tailwind-expanded, :hover/:focus)
- [x] Commit `docs: add DESIGN.md + sidecar`
- [x] Loader → `hasDesign:true`

### Task 3: AppHeader + FilterBar + hero redesign

- [x] AppHeader: CircularProgress role=progressbar, skip link #sheet-content, nav aria-label, hamburger w-11 h-11 (44px), 200ms taps, focus rings, dialog aria-modal
- [x] FilterBar: search 44px, aria-label, tag fade, pill h-8 + aria-pressed, 200ms, live region
- [x] Hero: py-10/16, border-b, skip target #sheet-content, eyebrow tightened, metric cluster unified, amber gate compact

### Task 4: Row / Pattern / Topic / Due

- [x] ProblemRow: py-2.5, status 200ms + focus ring, mono aria, link pills 200ms, edit focus ring
- [x] RecallButtons: sm 32px, 200ms, focus offset
- [x] PatternAccordion: 200ms hover, progress role, emerald/70 fill
- [x] TopicAccordion: h2, mb-4, progress role, 200ms trigger
- [x] DueForReviewSection: section landmark, focus ring, jump aria-label

### Task 5: Verify

- [x] `npm run build` → Compiled successfully in 31.5s, TypeScript passed
- [x] `npx eslint src --ext .ts,.tsx` → only pre-existing warnings (unused Button vars, hooks lint pre-existing)
- [ ] Optional: `npm run dev` visual check at /sheet — verify mobile hamburger 44px, FilterBar 44px search, row 200ms feedback, reveal 700ms entrances respect prefers-reduced-motion

## Self-Review

- Spec coverage: Teach blocker cleared, tokens cited with line numbers, sidecar respects 8-prop limit vs extensions split per document.md:242-243
- Placeholder scan: no TBD/TODO, literal frontmatter/YAML/JSON shown
- Type consistency: Tag/Status/Difficulty/PlatformLink consistent across types.ts and component props
- Risks: Hex approximations vs OKLCH kept canonical in sidecar; Firestore index for nextReviewAt noted; 700ms kept for entrances but shortened to 200ms for product taps to fix audit P2

---
Executed 2026-08-30 via subagent-driven + inline. Next: `impeccable harden` for touch-target 44px enforcement if strict AAA required, then `impeccable audit` re-run to confirm 16→18+/20.
