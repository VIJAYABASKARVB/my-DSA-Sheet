# Product

## Register

product

## Users

Solo DSA learners and interview-prepping engineers (high-frequency returners, not first-time visitors). Context: dim room or late-night laptop, obsessive progress tracking across 5–9 topics, 110+ problems (Arrays & Hashing, Two Pointers, Sliding Window, Prefix Sum, Trees DFS/BFS plus Matrix, Algorithms, Linked List, Binary Search in fallback JSON). Job: find the next problem to solve, mark status `unsolved → solved → review` (src/components/sheet/ProblemRow.tsx:25), triage spaced-repetition recall (easy/hint/blank at src/components/sheet/RecallButtons.tsx:14-38), and follow Firestore-synced progress across devices (onSnapshot at src/lib/firestore.ts:76-102). Filter bar is sticky, AND-logic, always present (src/components/FilterBar.tsx:54-179).

## Product Purpose

Personal clean sheet inspired by Striver A2Z but multi-source (NeetCode/Striver/Others via src/lib/types.ts:3), Topic → Pattern → Problem hierarchy (TopicAccordion → PatternAccordion → ProblemRow), Firestore-primary for problems/topics/patterns + per-user progress + editable link/tag overrides (problemOverrides/{problemId}). Success: learner sees solved/remaining at a glance (pct at src/app/sheet/page.tsx:126, topic breakdown at :362-387), jumps to due-for-review items (DueForReviewSection at :337-344), and never loses state on refresh when signed in (users/{uid}/progress via useProgress.ts:46-77). JSON in src/data/* is seed-only.

## Brand Personality

Obsessive, ethereal, precise. Not warm-casual, not playful. Voice: vanguard-edition — vantablack OLED (oklch(0.08 0 0) at src/app/globals.css:54), ethereal glass mesh orbs (src/app/globals.css:137-149), double-bezel islands (bezel-outer/inner at :198-213), emerald commit (oklch(0.72 0.17 162.48) at :63). Typography: Instrument Serif display (src/app/layout.tsx:18-23) plus Geist Mono for metrics (src/app/layout.tsx:12-16), obsessive micro-typography (10px eyebrows, mono counts). Motion: 700ms vanguard ease cubic-bezier(0.32,0.72,0,1) (src/app/globals.css:100).

## Anti-references

What this must NOT look like: generic shadcn dashboard (identical card grids, border-left accent stripes, default gray-on-white tables, hero-metric big-number template); SaaS-cream editorial-typographic landing (Fraunces/Newsreader plus italic display plus ruled columns — the saturated brand lane); neon-on-black crypto terminal; light-mode marketing site; glassmorphism as default on every card (only island/header/dialog earn blur at src/app/globals.css:168-195); gradient text (background-clip:text).

## Design Principles

1. **Depth over sprawl.** Curated 110 problems staged by learning dependency (e.g., Morris before Flatten at src/lib/firestore.ts:262-266). The sheet teaches order, not just lists.
2. **Progress is the product.** Every surface answers "how much is done?" — hero pct, topic bars (src/app/sheet/page.tsx:377-381), pattern counters (src/components/sheet/PatternAccordion.tsx:25-49), due badge (src/components/AppHeader.tsx:121-129). No vanity metrics.
3. **Glass is a signal, not a skin.** Blur only on fixed islands (AppHeader glass-island at src/components/AppHeader.tsx:93, FilterBar bezel) — scroll content stays flat and performant (grain/mesh are fixed pointer-events-none at src/app/globals.css:125-149).
4. **Edit without leaving flow.** Link/tag edits via inline Dialog that preserves pattern context (ProblemRow.tsx:192-324), optimistic Firestore merge with revert (useProgress.ts:84-126, useSpacedRepetition.ts:82-139). Sync is silent on success, loud on failure.
5. **Product earns one hero moment.** The Sheet hero (Instrument Serif plus emerald) is the single committed brand beat; everything below stays restrained, dense, task-focused. Do not repeat hero drama per topic.

## Accessibility & Inclusion

WCAG AA target. Forced dark must keep 4.5:1 on zinc-100 on oklch(0.08) and emerald labels on glass. Motion respects prefers-reduced-motion (reveal disabled at src/app/globals.css:282-289). Interactive targets: status 32px plus recall 28px row controls are compact for density — rail/sidebar chips keep 42px (FilterBar Input at src/components/FilterBar.tsx:65, Select at :83). Dialogs are accessible via @base-ui/react/dialog (focus trap, backdrop at src/components/ui/dialog.tsx:26-40). No keyboard traps; tab order follows topic → pattern → problem DOM. Text never gradient-clipped; color never sole status cue (icons plus labels at ProblemRow.tsx:27-46).
