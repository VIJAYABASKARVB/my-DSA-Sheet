# Prefix Sum Middle Topic — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans

**Goal:** Add standalone Prefix Sum topic in middle order (arrays → prefix-sum → trees), deduplicate 2 moved problems, 75 docs, fresh progress

**Architecture:** JSON seeds (arrays-topic.json, prefix-sum-topic.json) + combined problems.json regenerated, flat Firestore `problems` primary, `buildTopicsFromDocs` order update, wipe script, fallback local JSON

**Tech Stack:** Next.js src/ + Firestore problems/progress/problemOverrides + useProblems fallback

---

## Tasks

### Task 1: Update arrays-topic.json (dedup)
**Files:** Modify `src/data/arrays-topic.json:1`
- Remove `range-sum-query-2d-immutable` and `subarray-sum-equals-k` from `stage-5-prefix-sum-pattern` (keep `product-of-array-except-self` → 1 problem)
- Verify count 34 → 32

### Task 2: Create prefix-sum-topic.json
**Files:** Create `src/data/prefix-sum-topic.json:1` verbatim (9 ordered problems as provided)

### Task 3: Regenerate problems.json
**Files:** Modify `src/data/problems.json:1` → `{ topics: [arrays, prefix-sum, trees] }` via node merge, verify 75

### Task 4: Update Firestore order
**Files:** Modify `src/lib/firestore.ts:1` — `order = ["arrays-hashing","prefix-sum","trees-dfs-bfs"]`

### Task 5: Add wipe script
**Files:** Create `scripts/wipe-progress.mjs:1` (delete progress/optionally overrides), Modify `package.json:6` add `wipe:progress`, `wipe:overrides`

### Task 6: Verify & Commit
**Files:** Modify `README.md` (add prefix-sum topic count), run `npx tsc --noEmit`, `npx next build --webpack`, `git commit`
