# Editable Tags — Implementation Plan

> For agentic workers: Use subagent-driven-development

**Goal:** Migrate source → tags: string[] editable via problemOverrides.tags, open vocabulary, multi-tag UI

**Architecture:** types + JSON seeds + Firestore ProblemDoc.tags + useProblemOverrides tags + Row/FilterBar

---

## Tasks

### Task 1: Types
Modify `src/lib/types.ts:1` — add `Tag = string`, `Problem.tags`, keep `source?` optional

### Task 2: JSON seeds
Modify `src/data/arrays-topic.json:1`, `prefix-sum-topic.json:1`, `trees-topic.json:1` via node conversion source→tags, regenerate `problems.json`

### Task 3: Firestore
Modify `src/lib/firestore.ts:1` — ProblemDoc.tags, buildTopicsFromDocs, updateProblemTags, extend subscribeToOverrides

### Task 4: Hooks
Modify `src/hooks/useProblemOverrides.ts:1` + `useProblems.ts:1` fallback builder for tags

### Task 5: UI Row
Modify `src/components/sheet/ProblemRow.tsx:1` — render tags badges, edit dialog tags section

### Task 6: FilterBar + Sheet Page
Modify `src/components/FilterBar.tsx:1` — tag chips, Modify `src/app/sheet/page.tsx:1` — merge/filter tags

### Task 7: Scripts & Verify
Create `scripts/migrate-tags.mjs:1`, add `migrate:tags` to `package.json:6`, run tsc/build, commit
