# Two Pointers — Middle Insertion (After Arrays) — Design Spec

**Date:** 2026-08-22
**Status:** Approved — Flat Firestore, source→tags, keep duplicates separate, middle order
**Stack:** Next.js src/ + Firestore problems/progress/problemOverrides + useProblems fallback

---

## 1. Overview
User provided Two Pointers JSON (topicId: two-pointers, 7 stages, 16 problems) to be added as a separate section. Current sheet has 3 topics (arrays-hashing 32, prefix-sum 9, trees-dfs-bfs 34 =75). Insert new topic after Arrays in middle order (arrays → two-pointers → prefix-sum → trees) to reach 91, keep near-duplicates (rotate-array vs rotate-array-by-k-places, best-time-to-buy-and-sell-stock-two-pointers vs stock-buy-and-sell) as separate problemIds, convert source → tags for editable tags feature.

## 2. Decisions Locked
- **Placement B) Insert after Arrays:** Order `[arrays-hashing, two-pointers, prefix-sum, trees-dfs-bfs]` — update `src/lib/firestore.ts:147` order array and `src/data/problems.json:1` regenerated in that order
- **Tags conversion A):** Convert `source: "Striver"/"Neetcode"` → `tags: ["Striver"]` in new JSON, consistent with recent `source→tags` migration (`src/lib/types.ts:4`, `src/data/*.json:1` already use tags)
- **Keep both as separate (A):** `rotate-array` (new) and `rotate-array-by-k-places` (existing) remain distinct docs, same for `best-time-...-two-pointers` vs `stock-buy-and-sell` — no dedup, total 91

## 3. Files Changed
- `src/data/two-pointers-topic.json:1` — create verbatim 16 problems but with `tags` (converted from source)
- `src/data/problems.json:1` — regenerate `{ topics: [arrays, two-pointers, prefix-sum, trees] }` (91)
- `src/lib/firestore.ts:147` — update `order` to include `two-pointers`
- `src/data/arrays-topic.json:1`, `prefix-sum-topic.json:1`, `trees-topic.json:1` — no change (keep duplicates as separate)
- `scripts/seed-problems.mjs:1` — already handles `p.tags ?? [p.source]` and N topics, no code change beyond handling 4 topics
- `src/hooks/useProblems.ts:7` — already handles tags fallback, no change

## 4. Firestore Schema (flat)

```
/problems/{problemId}
  tags: string[] // ["Neetcode"] or ["Striver"]
```

91 docs after seed.

## 5. Verification
- `node -e` count `problems.json` → 4 topics, 91 problems
- `npx tsc --noEmit` → PASS
- `npx next build --webpack` → PASS (`○ /sheet`)
- `npm run dev` → 4 accordions in middle order, Two Pointers 7 stages, tags badges editable
- `npm run seed` → 91 docs

## 6. References
- Original sheet spec: `docs/superpowers/specs/2026-08-22-dsa-sheet-design.md`
- Previous: prefix-sum middle, editable tags, firestore primary
