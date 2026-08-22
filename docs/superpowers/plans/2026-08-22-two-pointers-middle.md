# Two Pointers Middle Insertion — Implementation Plan

> For agentic workers: Use subagent-driven-development

**Goal:** Insert Two Pointers as 2nd topic (arrays → two-pointers → prefix-sum → trees), 16 problems, tags conversion, keep duplicates separate, 91 total

**Architecture:** JSON seeds (new two-pointers-topic.json) + combined problems.json regenerated + Firestore order update + seed

---

## Tasks

### Task 1: Create two-pointers-topic.json
Create `src/data/two-pointers-topic.json:1` — 7 stages, 16 problems, convert `source` → `tags: [source]`

### Task 2: Regenerate problems.json
Modify `src/data/problems.json:1` → `{ topics: [arrays, two-pointers, prefix-sum, trees] }` via node merge, verify 91

### Task 3: Update Firestore order
Modify `src/lib/firestore.ts:147` — `order = ["arrays-hashing","two-pointers","prefix-sum","trees-dfs-bfs"]`

### Task 4: Verify & Commit
Run `npx tsc --noEmit`, `npx next build --webpack`, `git commit`
