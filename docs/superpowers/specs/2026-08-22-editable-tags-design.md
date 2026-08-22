# Editable Tags (Multi-Tag) — Design Spec

**Date:** 2026-08-22
**Status:** Approved — Multi-tag array, open vocabulary, Firestore primary
**Stack:** Next.js src/ + Firestore problems/problemOverrides + useProblems fallback

---

## 1. Overview
User wants tags like TUF/Neetcode editable so future sheets can be added per problem ("if the question was in some other sheet i can add its tag too"). Current `Problem.source: Source` is single enum, not multi. Migrate to `tags: string[]` (open vocabulary, suggestions: Striver/Neetcode/Others) editable via `problemOverrides.tags`.

## 2. Decisions
- **Migrate source → tags: string[] (Option 1):** `Problem.tags: string[]`, `source` deprecated optional one commit, Firestore `problems/{id}.tags`, `problemOverrides/{id}.tags` for edits, `FilterBar` multi-tag chips (has-tag), `ProblemRow` stacked badges + edit dialog multi-select + free-text.

## 3. Files Changed
- `src/lib/types.ts:1` — `Tag = string`, `Problem.tags`, `source?` optional
- `src/data/*-topic.json:1` + `src/data/problems.json:1` — `source` → `tags: [source]` conversion (75 problems)
- `src/lib/firestore.ts:1` — `ProblemDoc.tags`, `buildTopicsFromDocs` copies tags, `updateProblemTags`, extend `subscribeToOverrides` to include tags
- `src/hooks/useProblemOverrides.ts:1` — `overrides: Record<string, { links?, tags? }>` + `updateTags`
- `src/hooks/useProblems.ts:1` — fallback builder uses `tags` instead of `source`
- `src/components/sheet/ProblemRow.tsx:1` — render `tags` badges, edit dialog tags section
- `src/components/FilterBar.tsx:1` — tag filter chips dynamic
- `src/app/sheet/page.tsx:1` — merge tags overrides, filter by has-tag
- `scripts/migrate-tags.mjs:1` — one-time source→tags migration for Firestore

## 4. Firestore Schema

```
/problems/{problemId}
  tags: string[] // e.g., ["Striver"], later ["Striver","Love-Babbar"]

/problemOverrides/{problemId}
  links?: PlatformLink[]
  tags?: string[]
```

`buildTopicsFromDocs` reconstructs `Problem.tags` from `ProblemDoc.tags` or fallback `[source]` for legacy docs.

## 5. UI
- `ProblemRow` — stacked `Badge` per tag, edit dialog: removable Badge list + Input free-text + Add tag + suggestion chips (Striver/Neetcode/Others) toggle
- `FilterBar` — dynamic tag chips from allTags set, multi-select has-tag (AND: problem must contain all selected tags, or `some` — choose `every` for strict)

## 6. Verification
- `node -e` verify JSON tags arrays
- `npx tsc --noEmit` PASS
- `npx next build --webpack` PASS
- `npm run migrate:tags && npm run seed` → Firestore tags, local fallback shows tags
