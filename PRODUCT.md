# Product

## Register

product

## Users

Solo DSA learners and interview-prepping engineers (high-frequency returners, not first-time visitors). Context: late-night laptop or dim room, obsessive progress tracking across 5–12 topics, 109+ problems (Arrays & Hashing, Two Pointers, Sliding Window, Prefix Sum, Trees DFS/BFS plus Strings, Matrix, Recursion/Backtracking, Linked List, Binary Search in Firestore). Job: find the next problem to solve, mark status `unsolved → solved → review` (src/components/sheet/ProblemRow.tsx:24), follow spaced-repetition 1-3-5-6-10-17 revision schedule (src/lib/revision-schedule.ts:5, src/hooks/useRevisionSchedule.ts:148), and track Firestore-synced progress across devices (onSnapshot at src/lib/firestore.ts + src/lib/revision-schedule.ts:98). Filter bar is sticky, AND-logic, always present (src/components/FilterBar.tsx:54). Notes are per-problem markdown at src/app/notes/[problemId]/page.tsx:21 with 800ms autosave (src/hooks/useNote.ts).

## Product Purpose

Personal clean sheet inspired by Striver A2Z but multi-source (NeetCode/Striver/Others via src/lib/types.ts:3), Topic → Pattern → Problem hierarchy (TopicAccordion → PatternAccordion → ProblemRow), Firestore-primary for problems/topics/patterns + per-user progress + revisionSchedule + editable link/tag overrides (problemOverrides/{problemId}) + per-problem notes (users/{uid}/notes/{problemId}). Success: learner sees solved/remaining at a glance (pct at src/app/sheet/page.tsx:147, topic breakdown at :471-497), jumps to due-for-review items (DueForReviewSection at src/app/sheet/page.tsx:359-370) with navigate-to-row + highlight (src/app/sheet/page.tsx:164-203), and never loses state on refresh when signed in (users/{uid}/progress via src/hooks/useProgress.ts + src/hooks/useRevisionSchedule.ts). JSON in src/data/* is seed-only.

## Brand Personality

Calm, editorial, precise. Not warm-casual playful, not neon terminal. Voice: minimal archive — warm paper `#F7F6F3` (light) / warm charcoal `#0F0F0F` (dark) at src/app/globals.css:54/111, flat cards with hairline borders (src/app/globals.css:273-299), pale semantic pills (src/app/globals.css:98-105). Typography: Newsreader display (src/app/layout.tsx:19) plus Geist Mono for metrics (src/app/layout.tsx:13), precise micro-typography (10px eyebrows, mono counts). Motion: 600ms editorial ease cubic-bezier(0.16,1,0.3,1) (src/app/globals.css:95) — slow reveals, short task feedback at 150-250ms where possible.

## Anti-references

What this must NOT look like: generic shadcn dashboard (identical card grids, border-left accent stripes, default gray-on-white tables, hero-metric big-number template); SaaS-cream editorial-typographic landing saturated lane except the single hero beat; neon-on-black crypto terminal (high-chroma neons at 0.2+ on dark); glassmorphism as default on every card (only header/dialog earn blur at 8px — src/app/globals.css:183); gradient text (background-clip:text).

## Design Principles

1. **Depth over sprawl.** Curated 109 problems staged by learning dependency (e.g., Morris before Flatten at src/lib/firestore.ts). The sheet teaches order, not just lists.
2. **Progress is the product.** Every surface answers "how much is done?" — hero pct, topic bars (src/app/sheet/page.tsx:489-494), pattern counters (src/components/sheet/PatternAccordion.tsx:31-32), due badge (src/components/AppHeader.tsx:131-138). No vanity metrics.
3. **Flat is the signal.** Warm paper/charcoal ground with tonal stacking (background → card → muted) and hairline borders; shadows only on hover/islands (src/app/globals.css:273-299). Fixed grain/ambient blob are pointer-events-none behind content (src/app/globals.css:173-189, :339-357).
4. **Edit without leaving flow.** Link/tag edits via Dialog that preserves pattern context (src/components/sheet/ProblemRow.tsx:229-357), optimistic Firestore merge with revert (src/hooks/useProgress.ts, src/hooks/useRevisionSchedule.ts:92-145). Notes via src/app/notes/[problemId]/page.tsx with autosave. Sync is silent on success, loud on failure via sonner.
5. **One calm hero moment.** Landing + Sheet hero (Newsreader plus mono metrics) is the single editorial beat; everything below stays restrained, dense, task-focused. Do not repeat hero drama per topic.

## Accessibility & Inclusion

WCAG AA target. Dual theme must keep 4.5:1 on foreground vs background in both light (`#111` on `#F7F6F3`) and dark (`#F5F5F3` on `#0F0F0F`). Motion respects prefers-reduced-motion (reveal disabled at src/app/globals.css:241-247). Interactive targets: status 28px + notes 28px row controls are compact for density — rail/sheet filter controls keep 40px (FilterBar Input at src/components/FilterBar.tsx:63, Select trigger at :89). Dialogs are accessible via @base-ui/react/dialog (focus trap, backdrop at src/components/ui/dialog.tsx). No keyboard traps; tab order follows topic → pattern → problem DOM. Text never gradient-clipped; color never sole status cue (icons plus labels at src/components/sheet/ProblemRow.tsx:26-45).
