# Prefix Sum — Separate Topic (Middle Ordering) — Design Spec

**Date:** 2026-08-22
**Status:** Approved — Firestore primary, JSON seed-only, verbatim IDs, middle ordering, fresh progress
**Stack:** Next.js App Router (src/ dir) + Tailwind v4 + shadcn base-nova + Firebase Firestore (problems/progress/problemOverrides) + useProblems fallback to local JSON

---

## 1. Overview
User requested a separate section for Prefix Sum as its own topic (ordered 9-problem list). Current `arrays-hashing` topic contains Stage 5 — Prefix Sum Pattern with 3 problems (`range-sum-query-2d-immutable`, `subarray-sum-equals-k`, `product-of-array-except-self`) that overlap with the new topic (2 of the 9). To avoid `problems/{problemId}` doc ID collision (flat collection), we deduplicate by moving the 2 overlapping problems to the new topic and keep the new topic standalone.

## 2. Decisions Locked
- **Dedup by moving (B):** New `prefix-sum` topic with 9 ordered problems verbatim from user JSON (`topicId: "prefix-sum"`, `patternId: "prefix-sum-problems"`), remove `range-sum-query-2d-immutable` + `subarray-sum-equals-k` from `arrays-hashing` Stage 5 (Stage 5 keeps 1 problem `product-of-array-except-self` for now; optionally remove stage if desired)
- **Ordering (A — middle):** Final order `1. arrays-hashing → 2. prefix-sum → 3. trees-dfs-bfs` — update `src/lib/firestore.ts:1` `order = ["arrays-hashing","prefix-sum","trees-dfs-bfs"]`; `src/data/problems.json:1` regenerated in same order
- **Progress:** Fresh start — wipe all `progress` (and optionally `problemOverrides`) via `scripts/wipe-progress.mjs` before re-seed; moved IDs keep same `problemId` so wipe is cleanest per user request "revome all the progess freshe start"
- **IDs verbatim:** Use provided Prefix Sum JSON IDs verbatim (`range-sum-query-immutable`, `largest-subarray-with-sum-0`, `longest-subarray-with-zero-sum`, `contiguous-array`, `count-subarrays-with-given-sum`, `subarray-sum-equals-k`, `subarray-sums-divisible-by-k`, `continuous-subarray-sum`, `range-sum-query-2d-immutable`) — no renaming

## 3. Files Changed
- `src/data/arrays-topic.json:1` — edit Stage 5 from 3 → 1 problem (remove 2 moved)
- `src/data/prefix-sum-topic.json:1` — create verbatim (your JSON, 9 problems)
- `src/data/problems.json:1` — regenerate `{ topics: [arrays, prefix-sum, trees] }` (≈75 docs: 32 arrays + 9 prefix-sum + 34 trees)
- `src/lib/firestore.ts:1` — update `buildTopicsFromDocs` order array, pattern sort fallback for `prefix-sum-problems`
- `src/hooks/useProblems.ts:1` — already has Firestore primary + 2s local fallback to `problems.json` — no change, but will now fallback to 75-problem local JSON when Firestore empty
- `scripts/seed-problems.mjs:1` — already handles N topics, no code change beyond handling 3 topics
- `scripts/wipe-progress.mjs:1` — new, deletes `progress` (and optionally `problemOverrides`) for fresh start
- `package.json:6` — add `"wipe:progress": "node scripts/wipe-progress.mjs"`, `"wipe:overrides"`
- `src/data/problems.ts:1` — already deleted (Firestore primary)

## 4. Firestore Schema (flat, primary)

```
/problems/{problemId}
  id, name, difficulty, source, links[], topicId, topicName, patternId, patternName, updatedAt

/progress/{problemId}  — wiped for fresh start
/problemOverrides/{problemId} — retained unless wipe:overrides run
```

`problems` now 75 docs; `progress` 0 after wipe; `problemOverrides` retained unless user runs wipe:overrides.

## 5. Implementation Detail
- **Arrays Stage 5 after move:** Keep as single-problem pattern for history (1 problem `product-of-array-except-self`), or remove pattern entirely if desired — current spec keeps 1 for minimal diff; pattern still excluded from prefix-sum dedup logic
- **Order handling:** `buildTopicsFromDocs` sorts topics by `order` array index, patterns by `stage-N` numeric parse then `localeCompare` (new `prefix-sum-problems` has no stage number → falls to `localeCompare`, single pattern so order irrelevant)
- **Seed:** `npm run wipe:progress && npm run seed` → Firestore `problems` 75 docs, `progress` fresh
- **Local fallback:** `useProblems` fallback to `problems.json` 75 when Firestore empty/unconfigured → `npm run dev` works locally without seed

## 6. Verification
- `node -e` count `problems.json` → 3 topics, 75 problems
- `npx tsc --noEmit` → PASS
- `npx next build --webpack` → PASS (`○ /sheet`)
- Local `npm run dev` → 3 accordions in middle order, Prefix Sum with 9 ordered, Arrays Stage 5 with 1
- Prod `npm run wipe:progress && npm run seed` → Firestore 75, fresh progress

## 7. References
- Original sheet spec: `docs/superpowers/specs/2026-08-22-dsa-sheet-design.md`
- Firestore primary spec: previous plan `docs/superpowers/specs/2026-08-22-dark-theme-design.md` and `docs/superpowers/plans/2026-08-22-dsa-sheet.md`
- Provided Prefix Sum JSON (9 ordered problems) verbatim
