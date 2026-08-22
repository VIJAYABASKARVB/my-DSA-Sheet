# My DSA Sheet

Personal clean DSA problem tracking sheet — inspired by Striver's A2Z but with multi-source problems, Firestore-backed progress, and a collapsible Topic → Pattern → Problem hierarchy.

**Live topics:** `Arrays & Hashing` (7 stages, 32 problems), `Two Pointers` (7 stages, 16 problems), `Sliding Window` (3 patterns, 19 problems), `Prefix Sum` (9 problems) and `Trees — DFS & BFS` (10 stages, 34 problems) — **110 problems total**. Firestore is primary for **problems** (`problems/{problemId}`) + **topics** (`topics/{topicId}`) + **patterns** (`patterns/{patternId}`) + progress (`users/{userId}/progress/{problemId}`) + editable link overrides (`problemOverrides/{problemId}`), all synced via `onSnapshot`. JSON files in `src/data/` are **seed-only artifacts** (backup/export), not fetched at runtime. See [Problem Ordering Notes](#problem-ordering-notes).

## Tech Stack

- **Framework:** Next.js 14+ (App Router, `src/` dir, `@/*` alias)
- **Styling:** Tailwind CSS v4 + shadcn/ui (`accordion`, `badge`, `button`, `progress`, `input`, `select`, `dialog`, `sonner`) — forced dark (`class="dark"` on `<html>`)
- **Database:** Firebase Firestore (collections `problems`, `progress`, `problemOverrides`, `onSnapshot` realtime)
- **Language:** TypeScript strict (never `any`)
- **Deployment:** Vercel

## Setup

```bash
# 1. Install
npm install

# 2. Firebase — create project at https://console.firebase.google.com
#    → Create Firestore database (Test mode for v1)
#    → Project Settings → General → Your apps → Web app → copy config

# 3. Env
cp .env.example .env.local
# Fill NEXT_PUBLIC_FIREBASE_* in .env.local

# 4. Firestore Rules — Firestore → Rules → paste and Publish:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /problems/{problemId} {
      allow read, write: if true;
    }
    match /topics/{topicId} {
      allow read, write: if true;
    }
    match /patterns/{patternId} {
      allow read, write: if true;
    }
    match /users/{userId}/progress/{problemId} {
      allow read, write: if true;
    }
    match /progress/{problemId} {
      allow read, write: if true; // legacy fallback
    }
    match /problemOverrides/{problemId} {
      allow read, write: if true;
    }
  }
}

# 5. Seed problems (Firestore primary, JSON is seed-only)
npm run seed
# → reads src/data/arrays-hashing-topic.json + trees-topic.json + prefix-sum-topic.json + two-pointers-topic.json + sliding-window-topic.json and upserts 110 docs to problems/, topics/, patterns/

# 6. Run
npm run dev
# → http://localhost:3000 redirects to /sheet

# 7. Build
npm run build
# On Windows: npm run build already uses --webpack (Turbopack needs native bindings)
```

### Env vars (`.env.local` / Vercel)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## How to add new problems

**Firestore primary — JSON is seed/export, not fetched at runtime.**

1. Edit the relevant JSON seed file:
   - Arrays: `src/data/arrays-hashing-topic.json`
   - Trees: `src/data/trees-topic.json` (verbatim IDs from your provided JSON, e.g., `postorder-traversal-2-stacks`, `vertical-order-traversal`, `burn-binary-tree`)
   - Prefix Sum: `src/data/prefix-sum-topic.json`
   - Two Pointers: `src/data/two-pointers-topic.json`
   - Sliding Window: `src/data/sliding-window-topic.json`

Example entry (inside `patterns[].problems[]`):
```json
{
  "id": "two-sum-ii",
  "name": "Two Sum II",
  "difficulty": "Medium",
  "source": "Neetcode",
  "links": [{ "platform": "LeetCode", "url": "https://leetcode.com/problems/two-sum-ii/" }]
}
```

2. Re-seed Firestore:
```bash
npm run seed
# Or: node scripts/seed-problems.mjs
```

3. No redeploy needed for data — Firestore is live. The app’s `useProblems()` hook (`onSnapshot(collection(db,'problems'))`) picks up changes instantly across devices. Link overrides via UI still don’t require code changes.

**Direct Firestore alternative:** Add a doc to `problems/{newId}` with fields `{ id, name, difficulty, source, links, topicId, topicName, patternId, patternName }` via Firebase console — no JSON edit needed.

## Problem Ordering Notes

### Trees — Stage 10
Morris Inorder and Morris Preorder Traversal must be studied before
Flatten Binary Tree to Linked List. Flatten uses the same right-pointer
threading concept introduced by Morris Traversal. This order is intentional
and must not be changed when adding or reordering problems.

## How link editing works

Click `✎` on any `ProblemRow` → Dialog with per-platform `Select` + `url` `Input` → `Add link` / `Remove` → `Save` writes to Firestore `problemOverrides/{problemId}` (fire-and-forget, optimistic). `useProblemOverrides` merges overrides over Firestore `problems` links via `onSnapshot` — cross-device, realtime. Empty links delete the override doc (reverts to Firestore base).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # root layout + Toaster, forced dark
│   ├── page.tsx            # → redirect('/sheet')
│   └── sheet/page.tsx      # main sheet (useProblems + merge + filters)
├── components/
│   ├── sheet/              # TopicAccordion, PatternAccordion, ProblemRow
│   ├── ui/                 # shadcn components
│   └── FilterBar.tsx       # search + filter chips
├── lib/
│   ├── types.ts            # Difficulty, Status, Source, Problem, Topic...
│   ├── firebase.ts         # getFirestore only (no Auth for v1)
│   └── firestore.ts        # subscribeToProblems, getProgress, subscribeToProgress, etc.
├── data/
│   ├── arrays-hashing-topic.json  # Arrays & Hashing seed (7 stages, 32 problems)
│   ├── trees-topic.json           # Trees seed (verbatim, 10 stages, TakeUForward+LeetCode)
│   ├── prefix-sum-topic.json      # Prefix Sum seed (9 problems)
│   ├── two-pointers-topic.json    # Two Pointers seed (7 stages, 16 problems)
│   ├── sliding-window-topic.json  # Sliding Window seed (3 patterns, 19 problems)
│   └── problems.json              # (deprecated — individual topic JSONs are now source of truth)
├── hooks/                  # useProblems (Firestore fallback from 5 topic JSONs), useProgress (users/{userId}/progress), useProblemOverrides
└── scripts/seed-problems.mjs  # reads 5 topic JSONs → upserts topics/, patterns/, problems/ collections with order fields
```

## Filter behavior

- **Search** across `problem.name` (case-insensitive, substring)
- **Topic** dropdown, **Difficulty** / **Status** / **Source** chips — **AND** logic, combinable
- Clear button resets all. Filtered view auto-expands matching patterns/topics; empty state shows `No problems match...`

## Status cycle

Click status icon on `ProblemRow`: `unsolved (☐) → solved (✓) → review (⟳) → unsolved`. Optimistic UI, Firestore `setDoc`/`deleteDoc` with `serverTimestamp()` to `users/{userId}/progress/{problemId}` (falls back to `anon` when no auth). `unsolved` = no doc in `users/{userId}/progress`.

## Deployment to Vercel

```bash
vercel
# Set same NEXT_PUBLIC_FIREBASE_* env vars in Vercel dashboard → Redeploy
# After first deploy, run `npm run seed` locally (with prod env vars) to populate Firestore problems
```

## Migration to multi-user (v2)

Move global collections to `users/{userId}/progress/{problemId}` + `users/{userId}/problemOverrides/{problemId}` with Firebase Auth (`GoogleAuthProvider`, `onAuthStateChanged`, `AuthContext`). `problems` collection stays global or also per-user if needed.

## License

MIT — personal use.
