# Sliding Window — Middle Insertion (After Two Pointers) — Design Spec

**Date:** 2026-08-22
**Status:** Approved — Flat Firestore, source→tags, keep all separate, middle order A
**Stack:** Next.js src/ + Firestore problems/progress/problemOverrides + useProblems fallback (2s timeout, local JSON 91→110)

---

## 1. Overview
User provided Sliding Window JSON (topicId: sliding-window, 3 patterns: fixed-window 6 + dynamic-window 9 + dynamic-window-at-most-k-trick 4 =19, source single per problem) to be added as a separate section. Current sheet has 4 topics (arrays-hashing 32, two-pointers 16, prefix-sum 9, trees-dfs-bfs 34 =91) in order `arrays → two-pointers → prefix-sum → trees` (`src/lib/firestore.ts:147` + `src/data/problems.json:1`). Insert new topic as 3rd after Two Pointers and before Prefix Sum to reach 110, keep near-duplicates (longest-subarray-with-sum-k vs largest-subarray-with-sum-0/longest-subarray-with-zero-sum) as separate problemIds (0 collisions, flat `problems/{problemId}` doc ID), convert `source` → `tags: [source]` for editable-tags feature (`src/lib/types.ts:4` `Tag = string`).

## 2. Decisions Locked
- **Placement A) After Two Pointers and before Prefix Sum:** Order `arrays-hashing (32) → two-pointers (16) → sliding-window (19) → prefix-sum (9) → trees-dfs-bfs (34) =110` — update `src/lib/firestore.ts:147` `order = ["arrays-hashing","two-pointers","sliding-window","prefix-sum","trees-dfs-bfs"]` (was `arrays → two-pointers → prefix-sum → trees`), `src/data/problems.json:1` regenerated in that order
- **Tags conversion A):** Convert `source: "Striver"/"Neetcode"/"Others"` → `tags: ["Striver"]` in new JSON, consistent with recent `source→tags` migration (`src/lib/types.ts:4`, `src/data/*.json:1` already use `tags`, `src/lib/firestore.ts:14` `ProblemDoc.tags`, `src/hooks/useProblems.ts:7` handles `tags ?? [source]`)
- **Keep all as separate (A):** `longest-subarray-with-sum-k` (new, Sliding Window) vs `largest-subarray-with-sum-0`/`longest-subarray-with-zero-sum` (existing Prefix Sum) remain distinct docs, same for 16 others — 0 collisions verified via explore (91 existing IDs vs 19 new, no exact match)

## 3. Files Changed
- `src/data/sliding-window-topic.json:1` — create verbatim 19 problems but with `tags: [source]` (converted)
- `src/data/problems.json:1` — regenerate `{ topics: [arrays, two-pointers, sliding-window, prefix-sum, trees] }` (91→110)
- `src/lib/firestore.ts:147` — update `order` to include `sliding-window`
- `src/data/arrays-topic.json:1`, `prefix-sum-topic.json:1`, `trees-topic.json:1`, `two-pointers-topic.json:1` — no change (keep duplicates as separate)
- `scripts/seed-problems.mjs:1` — already handles `p.tags ?? [p.source]` and N topics, no code change beyond handling 5 topics
- `src/hooks/useProblems.ts:7` — already handles tags fallback, no change

## 4. Firestore Schema (flat, primary)

```
/problems/{problemId}
  tags: string[] // ["Neetcode"] or ["Striver"] or ["Others"]
  topicId, topicName, patternId, patternName
```

110 docs after seed.

## 5. Verification
- `node -e` count `problems.json` → 5 topics, 110 problems, 0 duplicate IDs
- `npx tsc --noEmit` → PASS
- `npx next build --webpack` → PASS (`○ /sheet`)
- `npm run dev` → 5 accordions in middle order, Sliding Window 3 patterns (6+9+4), tags badges editable
- `npm run seed` → 110 docs

## 6. References
- Original sheet spec: `docs/superpowers/specs/2026-08-22-dsa-sheet-design.md`
- Previous: two-pointers middle, editable tags, firestore primary
