# Sliding Window Middle Insertion — Implementation Plan

> For agentic workers: Use subagent-driven-development

**Goal:** Insert Sliding Window as 3rd topic (arrays → two-pointers → sliding-window → prefix-sum → trees), 19 problems, tags conversion, 110 total, keep duplicates separate

**Architecture:** JSON seeds (new sliding-window-topic.json) + combined problems.json regenerated + Firestore order update + seed

---

## Tasks

### Task 1: Create sliding-window-topic.json
Create `src/data/sliding-window-topic.json:1` — 3 patterns (fixed-window 6, dynamic-window 9, dynamic-window-at-most-k-trick 4 =19), convert `source` → `tags: [source]`

### Task 2: Regenerate problems.json
Modify `src/data/problems.json:1` → `{ topics: [arrays, two-pointers, sliding-window, prefix-sum, trees] }` via node merge, verify 110

### Task 3: Update Firestore order
Modify `src/lib/firestore.ts:147` — `order = ["arrays-hashing","two-pointers","sliding-window","prefix-sum","trees-dfs-bfs"]`

### Task 4: Verify & Commit
Run `npx tsc --noEmit`, `npx next build --webpack`, `git commit`
