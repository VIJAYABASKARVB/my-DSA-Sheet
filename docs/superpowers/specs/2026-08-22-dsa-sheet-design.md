# DSA Sheet App — Design Spec

**Date:** 2026-08-22
**Status:** Approved (brainstorming complete, build mode)
**Stack:** Next.js 14+ (App Router) + Tailwind CSS + shadcn/ui + Firebase Firestore + TypeScript (strict) + Vercel
**Topic:** Personal DSA problem tracking sheet (Striver A2Z-style) with collapsible Topic/Pattern/Problem hierarchy, Firestore-backed progress + editable links, cross-device sync without auth for v1.

---

## 1. Overview & Goals

**User:** Final-year CS student preparing for SDE interviews. Needs a clean, personal Striver A2Z alternative with multi-source problems (Neetcode/Striver/Others), progress tracking that syncs across devices, and a collapsible 3-level hierarchy.

**v1 Goals:**
- Two topics fully seeded: `Arrays & Hashing` (7 stages, ~35 problems) and `Trees — DFS & BFS` (10 stages, ~33 problems) — total ~68 problems.
- Problem definitions are static in `src/data/problems.ts` (single source of truth for name/difficulty/source/topic/pattern). Progress and link overrides are dynamic in Firestore global collections.
- Cross-device sync without Google Auth (confirmed: no auth gate, single-user personal use).
- Editable platform links per problem via inline edit, persisted to Firestore and merged over static data.
- FilterBar with combinable AND filters + text search, progress bars per topic/pattern.
- Strict TypeScript (no `any`), optimistic UI, fire-and-forget Firestore writes.

**Non-goals (v1):**
- Google Sign-In / Firebase Auth / multi-user partitioning — deferred to v2 (`/users/{userId}/progress` migration path documented).
- Offline PWA queue / service worker — v1 relies on Firestore connectivity; optimistic local state suffices.
- Admin panel or Firestore-as-primary for problems — `problems.ts` stays authoritative for v1.

---

## 2. Decisions Locked During Brainstorming

| Question | Decision |
|---|---|
| Auth for v1 | **No auth.** Global Firestore collections, no `AuthContext`. |
| Cross-device identity | **Global store** at `/progress/{problemId}` and `/problemOverrides/{problemId}` — any device on same Vercel URL sees same data. Migration to `/users/{userId}/progress/{problemId}` noted for v2. |
| Seed data | **Option A (best-effort inference):** Infer `topicId`/`patternId` slugs from stage names, assign difficulties from LeetCode where possible, set `source` per stage origin, add `LeetCode` URL where it exists else `[]`. |
| Editable links | **Per-row edit popover → `/problemOverrides/{problemId}` merge.** No auth gate, permissive URL validation (`https://` preferred but not blocking). |
| Architecture | **Option A — Client-heavy, spec-faithful adapted.** Single Client Component sheet page with `onSnapshot` hooks; no SSR complexity. |

---

## 3. Architecture

### 3.1 Folder Structure (to generate)

```
src/
├── app/
│   ├── layout.tsx                # root layout, no auth provider, Toaster
│   ├── page.tsx                  # redirects to /sheet
│   └── sheet/
│       └── page.tsx              # main sheet page (Client Component)
├── components/
│   ├── sheet/
│   │   ├── TopicAccordion.tsx    # Topic level (Accordion)
│   │   ├── PatternAccordion.tsx  # Pattern level (AccordionItem)
│   │   └── ProblemRow.tsx        # Problem row + edit dialog
│   ├── ui/                       # shadcn: accordion badge button progress input select dialog
│   └── FilterBar.tsx             # search + filter controls (sticky top)
├── lib/
│   ├── firebase.ts               # Firebase init (Firestore only)
│   ├── firestore.ts              # Firestore helpers for progress + overrides
│   └── types.ts                  # All TypeScript types (strict)
├── data/
│   └── problems.ts               # Seed data — static Topic[] export
└── hooks/
    ├── useProgress.ts            # Real-time progress hook (onSnapshot)
    └── useProblemOverrides.ts    # Real-time overrides hook (onSnapshot)
```

### 3.2 Tech Choices

- **Framework:** `create-next-app@latest` with `--typescript --tailwind --app --src-dir --import-alias "@/*"` — Next.js 14+ App Router.
- **Styling:** Tailwind CSS + `shadcn/ui` components: `accordion`, `badge`, `button`, `progress`, `input`, `select`, `dialog`.
- **Database:** Firebase Firestore (client SDK). No Realtime Database. No Auth SDK for v1.
- **Language:** TypeScript strict (`strict: true`, `noImplicitAny`). Never `any`.
- **Deployment:** Vercel. Env vars via `NEXT_PUBLIC_FIREBASE_*`.

### 3.3 Rendering Strategy

- `src/app/layout.tsx` — Server Component wrapper. Exports `metadata`, renders `html/body` + `{children}`.
- `src/app/page.tsx` — Server Component with `redirect('/sheet')`.
- `src/app/sheet/page.tsx` — `"use client"` — imports `topics` statically, subscribes via hooks, manages filter state and accordion open state with `useState`, renders `FilterBar` + `TopicAccordion` list.
- All interactivity (filters, accordion toggle, status cycle, edit dialog) is client-side. No API routes needed for v1.

---

## 4. Data Model

### 4.1 TypeScript Types (`src/lib/types.ts`)

```ts
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'unsolved' | 'solved' | 'review';
export type Source = 'Neetcode' | 'Striver' | 'Others';

export type PlatformLink = {
  platform: 'LeetCode' | 'TakeUForward' | 'Code360' | 'GeeksForGeeks' | 'InterviewBit';
  url: string;
};

export type Problem = {
  id: string;                  // slug e.g. "two-sum"
  name: string;
  difficulty: Difficulty;
  source: Source;
  links: PlatformLink[];       // static base links
  topicId: string;             // e.g. "arrays-hashing"
  patternId: string;           // e.g. "stage-5-prefix-sum"
};

export type Pattern = {
  id: string;                  // slug e.g. "stage-1-array-basics"
  name: string;                // e.g. "Stage 1 — Array Basics"
  topicId: string;
  problems: Problem[];
};

export type Topic = {
  id: string;                  // e.g. "arrays-hashing"
  name: string;                // e.g. "Arrays & Hashing"
  patterns: Pattern[];
};

// Firestore progress doc (global, no userId for v1)
export type ProgressDoc = {
  status: Exclude<Status, 'unsolved'>; // 'solved' | 'review' — unsolved = doc absent
  updatedAt: Date; // serverTimestamp on write, Date after read
};

// Firestore override doc
export type ProblemOverrideDoc = {
  links: PlatformLink[];
  updatedAt: Date;
};

// In-memory merged problem (overrides applied)
export type MergedProblem = Problem & {
  // links already merged; indicates if override exists
  hasOverride: boolean;
};
```

**Notes:**
- `unsolved` is represented by absence of a doc in `/progress` (lean collection). `Record<string, Status>` in hooks defaults missing keys to `'unsolved'`.
- `PlatformLink.platform` badge text: `LeetCode→LC`, `TakeUForward→TUF`, `Code360→C360`, `GeeksForGeeks→GFG`, `InterviewBit→IB`.

### 4.2 Seed Data (`src/data/problems.ts`)

- **Export:** `export const topics: Topic[] = [...]` and `export const allProblems: Problem[]` (flattened helper).
- **Slugs:** `topicId` from topic name lowercased + hyphenated; `patternId` from stage name lowercased, e.g. `"Stage 1 — Array Basics"` → `stage-1-array-basics`.
- **Problem `id`:** slug from name, e.g. `"Largest Element in an Array"` → `largest-element-in-array`, `"Two Sum"` → `two-sum`. Unique across all topics.
- **Difficulties (best-effort, inferred from LeetCode):**
  - *Arrays & Hashing samples:* Largest Element=Easy/Striver, Two Sum=Easy/Neetcode, Sort Colors=Medium, Subarray Sum Equals K=Medium, Product of Array Except Self=Medium, Top K Frequent=Medium, Valid Sudoku=Medium, Longest Consecutive=Medium, First Missing Positive=Hard.
  - *Trees samples:* Traversals=Easy, Maximum Depth=Easy, Balanced=Easy, Diameter=Easy, Maximum Path Sum=Hard, Same Tree=Easy, ZigZag=Medium, Vertical Order=Hard, LCA=Medium, Serialize/Deserialize=Hard, Flatten=Medium, Morris=Hard.
  - Full list follows spec order; ambiguous difficulties default to Medium and are documented as editable in `problems.ts` comments.
- **Sources:** Stages 1-4,6-7 arrays basics/advanced → `Striver`; hashing/counting/prefix/Neetcode-labeled → `Neetcode`; theory-only (`Requirements to Construct Unique BT`) → `Others` with `links: []`.
- **Links:** `LeetCode` URL where LC problem exists (verified slug), otherwise `[]`. Example: `two-sum → https://leetcode.com/problems/two-sum/`, `contains-duplicate → https://leetcode.com/problems/contains-duplicate/`, `largest-element-in-array → []` (Striver/Code360 only, leave empty or add Code360/GFG if known). Override system allows user to add correct URL later via UI.
- **README documents** how to add a new problem: add object to correct `Pattern.problems[]` with `id`, `name`, `difficulty`, `source`, `links`, `topicId`, `patternId` — no Firestore seeding needed.

### 4.3 Firestore Schema (v1 Global)

```
/progress/{problemId}
  status: 'solved' | 'review'
  updatedAt: timestamp (serverTimestamp)

/problemOverrides/{problemId}
  links: PlatformLink[]  // [{platform, url}, ...]
  updatedAt: timestamp
```

- **Progress:** `unsolved` = no document. `solved`/`review` = document exists. Total docs ≈ solved+review count (lean).
- **Overrides:** Absent = use `problems.ts` links. Present = replace links entirely for that problem. `hasOverride` flag derived from existence.
- **Future migration (v2):** Move to `/users/{userId}/progress/{problemId}` and `/users/{userId}/overrides/{problemId}` or `/users/{userId}/problemOverrides/{problemId}` with Firebase Auth `userId`. Static `problems.ts` stays or moves to `/problems/{problemId}` admin collection.

---

## 5. Firestore Helpers (`src/lib/firestore.ts`)

```ts
// Progress — global collection
export async function getProgress(): Promise<Record<string, Status>>
export async function updateProblemStatus(problemId: string, status: Status): Promise<void>
export function subscribeToProgress(callback: (progress: Record<string, Status>) => void): () => void // onSnapshot

// Overrides — global collection
export async function getProblemOverrides(): Promise<Record<string, PlatformLink[]>>
export async function updateProblemLinks(problemId: string, links: PlatformLink[]): Promise<void>
export function subscribeToOverrides(callback: (overrides: Record<string, PlatformLink[]>) => void): () => void
```

- Implementation uses `collection(db, 'progress')`, `doc(db, 'progress', problemId)`, `onSnapshot`, `setDoc`/`deleteDoc` with `serverTimestamp()`. Reads convert `Timestamp` to `Date`.
- `updateProblemStatus`: if `status === 'unsolved'` → `deleteDoc`; else `setDoc({ status, updatedAt: serverTimestamp() }, { merge: true })`. Fire-and-forget with `.catch(e => console.error)`, never blocks UI.
- `updateProblemLinks`: if `links.length === 0` → `deleteDoc` (revert to static); else `setDoc({ links, updatedAt })`.
- No `userId` param for v1; v2 adds `userId` first arg.

---

## 6. Hooks

### 6.1 `src/hooks/useProgress.ts`

```ts
export function useProgress(): {
  progress: Record<string, Status>; // missing = 'unsolved'
  updateStatus: (problemId: string, status: Status) => void; // optimistic
  loading: boolean;
}
```

- Internally `useState<Record<string, Status>>` + `useEffect(() => subscribeToProgress(...))` with `onSnapshot` for real-time across tabs/devices. `updateStatus` optimistically sets state, then calls `updateProblemStatus` fire-and-forget.

### 6.2 `src/hooks/useProblemOverrides.ts`

```ts
export function useProblemOverrides(): {
  overrides: Record<string, PlatformLink[]>;
  updateLinks: (problemId: string, links: PlatformLink[]) => void; // optimistic
  loading: boolean;
}
```

- Same pattern as `useProgress`. Merging happens in `sheet/page.tsx` or a `useMergedProblems()` helper: `allProblems.map(p => ({ ...p, links: overrides[p.id] ?? p.links, hasOverride: p.id in overrides }))`.

---

## 7. Components

### 7.1 `src/lib/firebase.ts`

- `initializeApp(firebaseConfig)` using `NEXT_PUBLIC_FIREBASE_*` env vars. Exports `db = getFirestore(app)`. No `getAuth`. Handles missing env gracefully (logs warning, `db` still initialized but operations will fail visibly).

### 7.2 `src/components/sheet/ProblemRow.tsx`

- **Props:** `{ problem: MergedProblem; status: Status; onStatusChange: (id: string, next: Status) => void; onEditLinks: (id: string) => void; }`
- **Layout:** `flex items-center gap-2 py-2 px-3` — status icon button (left) + `span` name (flex-1, truncate) + `Badge` difficulty + `Badge` source + platform link badges + edit `✎` button.
- **Status cycle:** Click icon → `unsolved→solved→review→unsolved`. Icon: ☐ / ✓ / ⟳ with color (`solved=green`, `review=amber`).
- **Badges:** `Badge` difficulty colors: `Easy=bg-green-100 text-green-800`, `Medium=bg-amber-100 text-amber-800`, `Hard=bg-red-100 text-red-800` (or shadcn variant + className). Source badge neutral outline.
- **Links:** `links.map(l => <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs border rounded px-1.5 py-0.5">{badgeText(l.platform)}</a>)`. If `links.length===0`, show muted "No links — click ✎ to add".
- **Edit:** `✎` opens `Dialog` (shadcn `Dialog`): header `Edit links — {problem.name}`, dynamic rows per `platform` select + `url` input + remove button + "Add link" button. Save → `updateLinks(problem.id, links)` optimistic + `Dialog` close. Validation: `URL.canParse(url)` or warn, but allow save (permissive).
- **Mobile:** `overflow-x-auto` for link badges row, `min-w-0` on name, whole row remains usable on 320px.

### 7.3 `src/components/sheet/PatternAccordion.tsx`

- **Props:** `{ pattern: Pattern; problems: MergedProblem[]; progress: Record<string, Status>; onStatusChange; onEditLinks; defaultOpen?: boolean }`
- **Implementation:** `Accordion type="single" collapsible` or `type="multiple"` — spec says shadcn `Accordion` at pattern level. Header shows `pattern.name` + `solved/total` (e.g., `3/7 solved`) + chevron. Indented `pl-4`. Content renders `ProblemRow` list. `PatternAccordion` manages its own open state via `Accordion` value.
- **Counts:** `solved = problems.filter(p => progress[p.id]==='solved').length` (+ optionally count `review` separately for display).

### 7.4 `src/components/sheet/TopicAccordion.tsx`

- **Props:** `{ topic: Topic; patterns: {pattern: Pattern, problems: MergedProblem[]}[]; progress: Record<string, Status>; overrides; onStatusChange; onEditLinks; }`
- **Implementation:** Top-level `Accordion` item per topic. Header: `topic.name` (bold) + `[solved/total solved]` + `Progress` bar (`<Progress value={solved/total*100} className="w-24 h-2" />`) + chevron. Content renders `PatternAccordion` list.
- **State:** `useState<string[]>` for open topics (controlled `Accordion` value). Not URL params per spec. Persisting open state across refresh is not required for v1 (could add `localStorage` later).

### 7.5 `src/components/FilterBar.tsx`

- **Props:** `{ search: string; setSearch; topicFilter: string | null; setTopicFilter; difficultyFilter: Difficulty | null; setDifficultyFilter; statusFilter: Status | null; setStatusFilter; sourceFilter: Source | null; setSourceFilter; topics: Topic[] }` or combined `filters` object.
- **UI:** Sticky top `bg-background border-b p-3 flex flex-wrap gap-2 items-center`.
  - `Input` placeholder "Search problems..." (debounced not required for ~70 items; direct `onChange`).
  - `Select` for Topic (All + each topic name).
  - Chip groups: Difficulty (`Easy`/`Medium`/`Hard`), Status (`solved`/`unsolved`/`review`), Source (`Neetcode`/`Striver`/`Others`) — `Badge`/`Button` with `variant={active?'default':'outline'}` toggle.
  - Clear filters button when any active.
- **Logic:** Held in `sheet/page.tsx` via `useMemo` filteredTopics: `problems.filter(p => name match && topic match && difficulty match && status match && source match)` with AND. Only matching problems and their parent patterns/topics rendered. When filtering, accordion auto-expands matching sections (compute `expandedTopics = filteredTopics.map(t=>t.id)`).

### 7.6 `src/app/sheet/page.tsx` — Wiring

- `"use client"`
- `const { progress, updateStatus, loading: progressLoading } = useProgress();`
- `const { overrides, updateLinks, loading: overridesLoading } = useProblemOverrides();`
- `const [search, setSearch] = useState('');` + filters state + `const [openTopics, setOpenTopics] = useState<string[]>([])`.
- `const mergedTopics = useMemo(() => topics.map(t => ({...t, patterns: t.patterns.map(p => ({...p, problems: p.problems.map(prob => ({...prob, links: overrides[prob.id] ?? prob.links, hasOverride: prob.id in overrides}))}))})), [overrides]);`
- `const filteredTopics = useMemo(() => applyFilters(mergedTopics, {search, topicFilter, difficultyFilter, statusFilter, sourceFilter, progress}), [mergedTopics, filters, progress]);`
- Render: `<FilterBar .../>` + `{filteredTopics.map(topic => <TopicAccordion key={topic.id} topic={topic} ... />)}` or empty state `"No problems match your filters."` + loading skeletons.
- `updateStatus` passed down to `ProblemRow` via `PatternAccordion` → `TopicAccordion`.

### 7.7 `src/app/layout.tsx` & `src/app/page.tsx`

- `layout.tsx`: `export default function RootLayout({children}) { return <html><body className={inter.className}><main>{children}</main><Toaster/></body></html> }` — no auth provider.
- `page.tsx`: `import { redirect } from 'next/navigation'; export default function Home() { redirect('/sheet'); }`

---

## 8. Data Flow & Error Handling

- **Load:** Static import `topics` → hooks subscribe `onSnapshot` → merge overrides → render. First paint shows static list with `loading` skeletons for progress.
- **Update status:** Click icon → `updateStatus(id, next)` optimistically mutates `progress` state → `updateProblemStatus(id, next)` fire-and-forget → Firestore `onSnapshot` confirms or reconciles on error. No `await` blocking UI.
- **Update links:** Save dialog → optimistic `overrides` local update → `updateProblemLinks(id, links)` fire-and-forget → `onSnapshot` confirms.
- **Errors:** All Firestore writes `.catch(e => console.error('[firestore]', e))` + optional `toast.error`. Reads handle `onSnapshot` error callback. Missing env vars log warning and UI shows "Firestore not configured — progress won't persist" banner.
- **Empty states:** No matching filters → "No problems match your filters. Clear filters." No topics → not applicable. Loading → skeleton rows.
- **Unsolved semantics:** Deleting doc keeps collection small; `progress[problemId] ?? 'unsolved'` handles missing.

---

## 9. Styling & Responsive

- Tailwind + shadcn. `Badge` variants + custom `className` for difficulty colors (green/amber/red). `Progress` from shadcn for topic bars.
- Topic/pattern rows `flex justify-between items-center py-3 px-4 border rounded` — stack cleanly on mobile via `flex-col sm:flex-row` if needed.
- `ProblemRow` `flex-wrap` + `overflow-x-auto` for link badges row on <400px. Touch targets ≥ 40px for status/edit buttons.
- Sticky `FilterBar` with `backdrop-blur` and `z-10`.
- No dark mode for v1 (can add via `next-themes` later).

---

## 10. Environment & Setup

### 10.1 `.env.local` / `.env.example`

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
# Auth not used for v1, but keep vars for future
```

### 10.2 Setup Commands (in order)

```bash
npx create-next-app@latest dsa-sheet --typescript --tailwind --app --src-dir --import-alias "@/*"
cd dsa-sheet
npx shadcn@latest init
npx shadcn@latest add accordion badge button progress input select dialog
npm install firebase
```

### 10.3 Firestore Rules (document in README)

```
// v1 — global collections, single-user personal use
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
// v2 — tighten to auth: allow read, write: if request.auth != null && request.auth.uid == userId;
```

### 10.4 README.md Sections

- Features, demo screenshot placeholder, tech stack, setup instructions, Firebase project creation + rules + env vars, Vercel deploy, how to add new problems (`data/problems.ts`), how link editing works (overrides collection), Firestore schema, migration notes for auth.

---

## 11. Implementation Order (for the plan)

1. `src/lib/types.ts` — all types
2. `src/lib/firebase.ts` — Firebase init (Firestore only)
3. `src/data/problems.ts` — full seed data (2 topics, 17 patterns, ~68 problems with best-effort difficulties/links)
4. `src/lib/firestore.ts` — progress + overrides helpers (get/subscribe/update)
5. `src/hooks/useProgress.ts` — real-time progress hook
6. `src/hooks/useProblemOverrides.ts` — real-time overrides hook
7. `src/components/sheet/ProblemRow.tsx` — problem row + edit dialog + status cycle
8. `src/components/sheet/PatternAccordion.tsx` — pattern level
9. `src/components/sheet/TopicAccordion.tsx` — topic level + progress bar
10. `src/components/FilterBar.tsx` — search + filter controls
11. `src/app/sheet/page.tsx` — wire everything (merge, filters, empty states)
12. `src/app/layout.tsx` + `src/app/page.tsx` — layout + redirect + Toaster
13. `README.md` + `.env.example` + Firestore rules doc

---

## 12. Testing & Verification

- **Manual verification (primary for v1):** `npm run dev` → verify sheet renders all topics/patterns → toggle status → confirm Firestore console `/progress/{id}` appears → open second tab/device → confirm `onSnapshot` sync → edit links → confirm `/problemOverrides/{id}` → test FilterBar search + each chip + combined AND → verify progress bars update → test mobile viewport (Chrome devtools) → test `unsolved` deletion (cycle back deletes doc).
- **Type checks:** `npm run build` / `tsc --noEmit` passes with no `any`.
- **Future:** Add Vitest for `applyFilters` pure function and Firestore helper mocks (v2).

---

## 13. Risks & Mitigations

- **Global write rules (`if true`):** Acceptable for single-user personal sheet; mitigated by documenting v2 auth migration and not exposing URL publicly. User confirmed single-user.
- **Seed inference accuracy:** Difficulties/links best-effort; mitigated by editable overrides and README note that `problems.ts` is easily editable.
- **Firestore env missing:** Mitigated by warning banner + local optimistic state; app remains usable for viewing.

---

## 14. Out of Scope (Explicit)

- Google Sign-In, `onAuthStateChanged`, `AuthContext`, per-user subcollections — deferred.
- `/problems/{problemId}` admin mirror collection — deferred.
- `useProgress(userId)` signature — v1 is `useProgress()` no-arg; v2 adds param.
- URL param persistence for accordion/filter state — spec says `useState` only.
- Icon library — use text badges `LC`/`TUF`/`C360`/`GFG`/`IB` only.

---

## 15. Approval

Brainstorming approved by user 2026-08-22 with prompt "do it" after Section 1-6 review (plan→build transition). Next: `writing-plans` skill will convert this spec into an implementation plan (Phase 1: types/firebase/seed, Phase 2: hooks/components, Phase 3: page/layout/docs), then execution.

