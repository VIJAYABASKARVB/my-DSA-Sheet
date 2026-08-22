# My DSA Sheet

Personal clean DSA problem tracking sheet — inspired by Striver's A2Z but with multi-source problems, Firestore-backed progress, and a collapsible Topic → Pattern → Problem hierarchy.

**Live topics:** `Arrays & Hashing` (7 stages, 34 problems) and `Trees — DFS & BFS` (10 stages, 34 problems) — **68 problems total**. Firestore syncs progress + editable links across devices (global store, no auth for v1).

## Tech Stack

- **Framework:** Next.js 14+ (App Router, `src/` dir, `@/*` alias)
- **Styling:** Tailwind CSS v4 + shadcn/ui (`accordion`, `badge`, `button`, `progress`, `input`, `select`, `dialog`, `sonner`)
- **Database:** Firebase Firestore (global collections `/progress` + `/problemOverrides`, `onSnapshot` realtime)
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
    match /progress/{problemId} {
      allow read, write: if true;
    }
    match /problemOverrides/{problemId} {
      allow read, write: if true;
    }
  }
}

# 5. Run
npm run dev
# → http://localhost:3000 redirects to /sheet

# 6. Build
npm run build
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

Edit `src/data/problems.ts` — add to the correct `Pattern.problems[]`:

```ts
{
  id: "two-sum-ii",                          // unique slug
  name: "Two Sum II",
  difficulty: "Medium",                      // Easy | Medium | Hard
  source: "Neetcode",                        // Neetcode | Striver | Others
  links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/two-sum-ii/" }],
  topicId: "arrays-hashing",
  patternId: "stage-2-basic-hashing-counting",
}
```

No Firestore seeding needed — static data is the source of truth. Redeploy after edits. Link overrides via the UI don't require code changes.

## How link editing works

Click `✎` on any `ProblemRow` → Dialog with per-platform `Select` + `url` `Input` → `Add link` / `Remove` → `Save` writes to Firestore `problemOverrides/{problemId}` (fire-and-forget, optimistic). `useProblemOverrides` merges overrides over static `problems.ts` links via `onSnapshot` — cross-device, realtime. Empty links delete the override doc (reverts to static).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # root layout + Toaster
│   ├── page.tsx            # → redirect('/sheet')
│   └── sheet/page.tsx      # main sheet (merge + filters)
├── components/
│   ├── sheet/              # TopicAccordion, PatternAccordion, ProblemRow
│   ├── ui/                 # shadcn components
│   └── FilterBar.tsx       # search + filter chips
├── lib/
│   ├── types.ts            # Difficulty, Status, Source, Problem, Topic...
│   ├── firebase.ts         # getFirestore only (no Auth for v1)
│   └── firestore.ts        # getProgress, subscribeToProgress, updateProblemStatus, etc.
├── data/problems.ts        # 68 problems, single source of truth
└── hooks/                  # useProgress, useProblemOverrides (onSnapshot + optimistic)
```

## Filter behavior

- **Search** across `problem.name` (case-insensitive, substring)
- **Topic** dropdown, **Difficulty** / **Status** / **Source** chips — **AND** logic, combinable
- Clear button resets all. Filtered view auto-expands matching patterns/topics; empty state shows `No problems match...`

## Status cycle

Click status icon on `ProblemRow`: `unsolved (☐) → solved (✓) → review (⟳) → unsolved`. Optimistic UI, Firestore `setDoc`/`deleteDoc` with `serverTimestamp()`. `unsolved` = no doc in `/progress`.

## Deployment to Vercel

```bash
vercel
# Set same NEXT_PUBLIC_FIREBASE_* env vars in Vercel dashboard → Redeploy
```

## Migration to multi-user (v2)

Move global collections to `users/{userId}/progress/{problemId}` + `users/{userId}/problemOverrides/{problemId}` with Firebase Auth (`GoogleAuthProvider`, `onAuthStateChanged`, `AuthContext`). Keep `problems.ts` static or mirror to `problems/{problemId}` for admin.

## License

MIT — personal use.
