import { db, auth } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import type { Status, PlatformLink, Topic, Problem, Difficulty, Tag, RevisionSchedule, Note } from "./types";

type ProblemDoc = {
  id: string;
  name: string;
  difficulty: Difficulty;
  tags: Tag[];
  source?: string;
  links: PlatformLink[];
  topicId: string;
  topicName: string;
  topicOrder?: number;
  patternId: string;
  patternName: string;
  patternOrder?: number;
  order?: number;
};

type OverrideDoc = {
  links?: PlatformLink[];
  tags?: Tag[];
};

export function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid ?? null;
}

export async function getProgress(userId?: string): Promise<Record<string, Status>> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot load progress");
  const snap = await getDocs(collection(db, "users", uid, "progress"));
  const out: Record<string, Status> = {};
  snap.forEach((d) => {
    const data = d.data() as { status: Status; updatedAt?: Timestamp };
    if (data.status === "solved" || data.status === "review") out[d.id] = data.status;
  });
  return out;
}

export async function updateProblemStatus(problemId: string, status: Status, userId?: string): Promise<void> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot save progress");
  if (status === "unsolved") {
    await deleteDoc(doc(db, "users", uid, "progress", problemId));
  } else {
    await setDoc(doc(db, "users", uid, "progress", problemId), { status, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export async function restoreProgressWithSchedule(
  problemId: string,
  status: Exclude<Status, "unsolved">,
  schedule: RevisionSchedule,
  userId?: string
): Promise<void> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot restore progress");
  await setDoc(
    doc(db, "users", uid, "progress", problemId),
    {
      status,
      revisionSchedule: schedule,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeToProgress(
  callback: (progress: Record<string, Status>) => void,
  userId?: string,
  onError?: (err: Error) => void
): () => void {
  const uid = userId || getCurrentUserId();
  if (!uid) {
    // No user yet — return noop; caller should re-subscribe when uid available
    if (onError) onError(new Error("Not signed in"));
    return () => {};
  }
  return onSnapshot(
    collection(db, "users", uid, "progress"),
    (snap) => {
      const out: Record<string, Status> = {};
      snap.forEach((d) => {
        const data = d.data() as { status: Status };
        if (data.status === "solved" || data.status === "review") out[d.id] = data.status;
      });
      callback(out);
    },
    (err) => {
      console.error("[firestore] subscribeToProgress error", err);
      if (onError) onError(err as Error);
    }
  );
}

export async function getProblemOverrides(): Promise<Record<string, OverrideDoc>> {
  const snap = await getDocs(collection(db, "problemOverrides"));
  const out: Record<string, OverrideDoc> = {};
  snap.forEach((d) => {
    const data = d.data() as OverrideDoc;
    const entry: OverrideDoc = {};
    if (Array.isArray(data.links)) entry.links = data.links;
    if (Array.isArray(data.tags)) entry.tags = data.tags;
    if (entry.links || entry.tags) out[d.id] = entry;
  });
  return out;
}

export async function updateProblemLinks(problemId: string, links: PlatformLink[]): Promise<void> {
  if (!auth?.currentUser) throw new Error("Not signed in — cannot save links");
  const ref = doc(db, "problemOverrides", problemId);
  if (links.length === 0) {
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data() as OverrideDoc) : undefined;
    if (!existing?.tags || existing.tags.length === 0) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { links: deleteField(), updatedAt: serverTimestamp() }, { merge: true });
    }
  } else {
    await setDoc(ref, { links, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export async function updateProblemTags(problemId: string, tags: Tag[]): Promise<void> {
  if (!auth?.currentUser) throw new Error("Not signed in — cannot save tags");
  const ref = doc(db, "problemOverrides", problemId);
  if (tags.length === 0) {
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data() as OverrideDoc) : undefined;
    if (!existing?.links || existing.links.length === 0) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { tags: deleteField(), updatedAt: serverTimestamp() }, { merge: true });
    }
  } else {
    await setDoc(ref, { tags, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export function subscribeToOverrides(
  callback: (overrides: Record<string, OverrideDoc>) => void,
  onError?: (err: Error) => void
): () => void {
  if (!auth?.currentUser) {
    // Gated by auth — caller should wait for sign-in; return noop to avoid permission-denied spam
    return () => {};
  }
  return onSnapshot(
    collection(db, "problemOverrides"),
    (snap) => {
      const out: Record<string, OverrideDoc> = {};
      snap.forEach((d) => {
        const data = d.data() as OverrideDoc;
        const entry: OverrideDoc = {};
        if (Array.isArray(data.links)) entry.links = data.links;
        if (Array.isArray(data.tags)) entry.tags = data.tags;
        if (entry.links || entry.tags) out[d.id] = entry;
      });
      callback(out);
    },
    (err) => {
      console.error("[firestore] subscribeToOverrides error", err);
      if (onError) onError(err as Error);
    }
  );
}

// ---- Problems (Firestore primary) ----

// TREES STAGE 10 — LEARNING ORDER DEPENDENCY:
// Morris Inorder → Morris Preorder → Flatten Binary Tree to Linked List
// Reason: Flatten uses the same right-pointer threading trick as Morris Traversal.
// Without understanding Morris first, Flatten appears to be magic.
// Do NOT reorder these three problems.

function buildTopicsFromDocs(docs: ProblemDoc[]): Topic[] {
  const topicMap = new Map<string, Topic & { order: number }>();
  const patternMap = new Map<
    string,
    Map<string, { patternName: string; patternOrder: number; problems: Problem[] }>
  >();
  const topicOrderMap = new Map<string, number>();

  for (const d of docs) {
    if (!topicMap.has(d.topicId)) {
      topicMap.set(d.topicId, {
        id: d.topicId,
        name: d.topicName,
        order: d.topicOrder ?? 999,
        patterns: [],
      });
      patternMap.set(d.topicId, new Map());
      topicOrderMap.set(d.topicId, d.topicOrder ?? 999);
    } else {
      // Keep smallest topicOrder if multiple docs have different values
      const cur = topicOrderMap.get(d.topicId)!;
      const incoming = d.topicOrder ?? 999;
      if (incoming < cur) {
        topicOrderMap.set(d.topicId, incoming);
        topicMap.get(d.topicId)!.order = incoming;
      }
    }
    const pMap = patternMap.get(d.topicId)!;
    if (!pMap.has(d.patternId)) {
      pMap.set(d.patternId, {
        patternName: d.patternName,
        patternOrder: d.patternOrder ?? 999,
        problems: [],
      });
    } else {
      const existing = pMap.get(d.patternId)!;
      const incoming = d.patternOrder ?? 999;
      if (incoming < existing.patternOrder) {
        existing.patternOrder = incoming;
      }
    }
    const group = pMap.get(d.patternId)!;
    const tags: Tag[] = Array.isArray(d.tags) ? d.tags : d.source ? [d.source] : [];
    group.problems.push({
      id: d.id,
      name: d.name,
      difficulty: d.difficulty,
      tags,
      source: d.source as unknown as Problem["source"],
      links: d.links ?? [],
      topicId: d.topicId,
      patternId: d.patternId,
      order: d.order ?? 999,
    });
  }

  const topics: Topic[] = [];
  for (const [topicId, topic] of topicMap) {
    const pMap = patternMap.get(topicId)!;
    const patterns = Array.from(pMap.entries())
      .map(([patternId, g]) => ({
        id: patternId,
        name: g.patternName,
        topicId,
        order: g.patternOrder,
        problems: g.problems.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
      }))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    topics.push({ id: topic.id, name: topic.name, order: topicOrderMap.get(topicId) ?? 999, patterns });
  }

  // Sort topics by explicit order field; fallback to known order for legacy docs
  // Order: array & hashing → Two Pointers → Prefix Sum → matrix manipulation → algorithms → Strings → Recursion & Backtracking → LinkedList → Sliding Window → Binary search → trees → binary-search-tree
  const legacyOrder = ["arrays-hashing", "two-pointers", "prefix-sum", "matrix", "algorithms", "strings", "recursion-backtracking", "linked-list", "sliding-window", "binary-search", "trees-dfs-bfs", "binary-search-tree"];
  topics.sort((a, b) => {
    const oa = (a as Topic & { order: number }).order;
    const ob = (b as Topic & { order: number }).order;
    if (oa !== 999 || ob !== 999) {
      if (oa !== ob) return oa - ob;
    }
    const ia = legacyOrder.indexOf(a.id);
    const ib = legacyOrder.indexOf(b.id);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.id.localeCompare(b.id);
  });

  return topics;
}

export async function getProblems(): Promise<Topic[]> {
  const snap = await getDocs(collection(db, "problems"));
  const docs: ProblemDoc[] = [];
  snap.forEach((d) => docs.push(d.data() as ProblemDoc));
  return buildTopicsFromDocs(docs);
}

export function subscribeToProblems(
  callback: (topics: Topic[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, "problems"),
    (snap) => {
      const docs: ProblemDoc[] = [];
      snap.forEach((d) => docs.push(d.data() as ProblemDoc));
      callback(buildTopicsFromDocs(docs));
    },
    (err) => {
      console.error("[firestore] subscribeToProblems error", err);
      if (onError) onError(err as Error);
    }
  );
}

// ---- Notes (per-user per-problem) ----

type NoteDoc = {
  content: string;
  problemName: string;
  updatedAt?: Timestamp;
};

function noteDocToNote(problemId: string, data: NoteDoc): Note {
  return {
    problemId,
    problemName: data.problemName ?? problemId,
    content: data.content ?? "",
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

export async function getNote(userId: string, problemId: string): Promise<Note | null> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot load note");
  const ref = doc(db, "users", uid, "notes", problemId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return noteDocToNote(problemId, snap.data() as NoteDoc);
}

export async function saveNote(userId: string, problemId: string, note: Partial<Note>): Promise<void> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot save note");
  const content = note.content ?? "";
  const hasContent = content.trim().length > 0;
  const noteRef = doc(db, "users", uid, "notes", problemId);

  if (!hasContent) {
    // Empty content counts as deletion
    await deleteDoc(noteRef);
  } else {
    const payload: Record<string, unknown> = {
      content,
      updatedAt: serverTimestamp(),
    };
    if (note.problemName) payload.problemName = note.problemName;
    await setDoc(noteRef, payload, { merge: true });
    // Ensure problemName backfilled if not supplied and doc existed without it
    if (!note.problemName) {
      try {
        const cur = await getDoc(noteRef);
        const curData = cur.data() as NoteDoc | undefined;
        if (curData && !curData.problemName) {
          // keep as problemId fallback will be used on read; no write needed
        }
      } catch {}
    }
  }

  // Update notesIndex presence tracking (drives the sheet's note icon).
  // Retried once; throws on persistent failure so the UI can surface it.
  await updateNotesIndex(uid, problemId, hasContent);
}

async function updateNotesIndex(uid: string, problemId: string, hasContent: boolean): Promise<void> {
  const indexRef = doc(db, "users", uid, "notesIndex", "index");
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const idxSnap = await getDoc(indexRef);
      let currentIds: string[] = [];
      if (idxSnap.exists()) {
        const d = idxSnap.data() as { problemIds?: string[] };
        if (Array.isArray(d.problemIds)) currentIds = d.problemIds;
      }
      const set = new Set(currentIds);
      if (hasContent) set.add(problemId);
      else set.delete(problemId);
      const next = Array.from(set).sort();
      // Only write if changed
      const changed = next.length !== currentIds.length || next.some((id, i) => id !== currentIds[i]);
      if (changed) {
        await setDoc(indexRef, { problemIds: next, updatedAt: serverTimestamp() }, { merge: true });
      }
      return;
    } catch (e) {
      lastErr = e;
      console.warn(`[firestore] updateNotesIndex attempt ${attempt + 1} failed`, e);
    }
  }
  throw new Error(
    `Note saved, but the note-icon index could not be updated (${(lastErr as Error)?.message ?? lastErr}). Reopen this note to retry.`
  );
}

// Self-heal: ensure a note that has content is present in the notes index.
// Repairs orphans from earlier failed index writes (icon stuck off).
export async function ensureNoteIndexed(userId: string, problemId: string): Promise<boolean> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot repair notes index");
  const noteSnap = await getDoc(doc(db, "users", uid, "notes", problemId));
  if (!noteSnap.exists()) return false;
  const data = noteSnap.data() as NoteDoc | undefined;
  if (!data || data.content.trim().length === 0) return false;
  await updateNotesIndex(uid, problemId, true);
  return true;
}

export function subscribeToNote(
  userId: string,
  problemId: string,
  cb: (note: Note | null) => void,
  onError?: (err: Error) => void
): () => void {
  const uid = userId || getCurrentUserId();
  if (!uid) {
    if (onError) onError(new Error("Not signed in"));
    return () => {};
  }
  const ref = doc(db, "users", uid, "notes", problemId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        cb(null);
        return;
      }
      cb(noteDocToNote(problemId, snap.data() as NoteDoc));
    },
    (err) => {
      console.error("[firestore] subscribeToNote error", err);
      if (onError) onError(err as Error);
    }
  );
}

export async function getNotesIndex(userId: string): Promise<Set<string>> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot load notes index");
  const idxSnap = await getDoc(doc(db, "users", uid, "notesIndex", "index"));
  if (!idxSnap.exists()) return new Set();
  const d = idxSnap.data() as { problemIds?: string[] };
  return new Set(Array.isArray(d.problemIds) ? d.problemIds : []);
}

export function subscribeToNotesIndex(
  userId: string,
  cb: (ids: Set<string>) => void,
  onError?: (err: Error) => void
): () => void {
  const uid = userId || getCurrentUserId();
  if (!uid) {
    if (onError) onError(new Error("Not signed in"));
    return () => {};
  }
  const ref = doc(db, "users", uid, "notesIndex", "index");
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        cb(new Set());
        return;
      }
      const d = snap.data() as { problemIds?: string[] };
      cb(new Set(Array.isArray(d.problemIds) ? d.problemIds : []));
    },
    (err) => {
      console.error("[firestore] subscribeToNotesIndex error", err);
      if (onError) onError(err as Error);
    }
  );
}
