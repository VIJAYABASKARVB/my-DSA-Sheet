# Dark Theme (Forced Dark) — Design Spec

**Date:** 2026-08-22
**Status:** Approved & Implemented
**Stack:** Next.js App Router + Tailwind v4 + shadcn base-nova (neutral)
**Decision:** Forced dark only via `class="dark"` on `<html>`, keep existing tokens.

---

## 1. Overview
User requested entirely dark theme. Current `globals.css` already defines charcoal dark palette (`--background: oklch(0.145 0 0)`, `--foreground: oklch(0.985 0 0)`, `--card: oklch(0.205 0 0)` etc.) plus `tw-animate-css`. Site was rendering light because `layout.tsx` had no `dark` class. Fix is minimal single-line change to force dark on first paint, no toggle, no provider.

## 2. Decision Locked
- **Approach A — Minimal `class="dark"` (Chosen)**: Add `dark` to `<html>` in `src/app/layout.tsx:23`. Keep `globals.css` unchanged. No `next-themes` provider. Rejected `forcedTheme` and purge-light variants for simplicity.

## 3. Files Changed
- `src/app/layout.tsx:23` — `<html class="... dark h-full antialiased">` (single line)
- `src/app/globals.css:1` — no change (retain `:root` light + `.dark` dark)

## 4. Implementation Detail
```tsx
// src/app/layout.tsx:23
<html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
```
Body `bg-background text-foreground` now resolves to dark tokens SSR, no flash.

## 5. Verification
- `npx tsc --noEmit` → PASS
- `npx next build --webpack` → PASS (static `○ /`, `○ /sheet`)
- Visual check via `npm run dev -- --webpack` → `<html class="dark">` renders charcoal background.

## 6. Follow-up (Deferred)
Dark-tuned badge colors (`dark:bg-green-900/40`) not needed for forced-dark simplicity; can add later if contrast audit desired.

## 7. References
- Original sheet spec: `docs/superpowers/specs/2026-08-22-dsa-sheet-design.md`
- Plan: `docs/superpowers/plans/2026-08-22-dsa-sheet.md`
