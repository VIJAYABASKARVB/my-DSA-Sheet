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
import type { Status, PlatformLink, Topic, Problem, Difficulty, Tag } from "./types";

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
  // Order: array & hashing → Two Pointers → Prefix Sum → matrix manipulation → algorithms → Strings → Recursion & Backtracking → LinkedList → Sliding Window → Binary search → trees
  const legacyOrder = ["arrays-hashing", "two-pointers", "prefix-sum", "matrix", "algorithms", "strings", "recursion-backtracking", "linked-list", "sliding-window", "binary-search", "trees-dfs-bfs"];
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
