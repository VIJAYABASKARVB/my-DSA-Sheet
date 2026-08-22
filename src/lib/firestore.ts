import { db } from "./firebase";
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
  patternId: string;
  patternName: string;
};

type OverrideDoc = {
  links?: PlatformLink[];
  tags?: Tag[];
};

export async function getProgress(): Promise<Record<string, Status>> {
  const snap = await getDocs(collection(db, "progress"));
  const out: Record<string, Status> = {};
  snap.forEach((d) => {
    const data = d.data() as { status: Status; updatedAt?: Timestamp };
    if (data.status === "solved" || data.status === "review") out[d.id] = data.status;
  });
  return out;
}

export async function updateProblemStatus(problemId: string, status: Status): Promise<void> {
  try {
    if (status === "unsolved") {
      await deleteDoc(doc(db, "progress", problemId));
    } else {
      await setDoc(doc(db, "progress", problemId), { status, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (e) {
    console.error("[firestore] updateProblemStatus failed", problemId, e);
  }
}

export function subscribeToProgress(callback: (progress: Record<string, Status>) => void): () => void {
  return onSnapshot(
    collection(db, "progress"),
    (snap) => {
      const out: Record<string, Status> = {};
      snap.forEach((d) => {
        const data = d.data() as { status: Status };
        if (data.status === "solved" || data.status === "review") out[d.id] = data.status;
      });
      callback(out);
    },
    (err) => console.error("[firestore] subscribeToProgress error", err)
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
  try {
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
  } catch (e) {
    console.error("[firestore] updateProblemLinks failed", problemId, e);
  }
}

export async function updateProblemTags(problemId: string, tags: Tag[]): Promise<void> {
  try {
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
  } catch (e) {
    console.error("[firestore] updateProblemTags failed", problemId, e);
  }
}

export function subscribeToOverrides(callback: (overrides: Record<string, OverrideDoc>) => void): () => void {
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
    (err) => console.error("[firestore] subscribeToOverrides error", err)
  );
}

// ---- Problems (Firestore primary) ----

function buildTopicsFromDocs(docs: ProblemDoc[]): Topic[] {
  const topicMap = new Map<string, Topic>();
  const patternMap = new Map<string, Map<string, { patternName: string; problems: Problem[] }>>();

  for (const d of docs) {
    if (!topicMap.has(d.topicId)) {
      topicMap.set(d.topicId, { id: d.topicId, name: d.topicName, patterns: [] });
      patternMap.set(d.topicId, new Map());
    }
    const pMap = patternMap.get(d.topicId)!;
    if (!pMap.has(d.patternId)) {
      pMap.set(d.patternId, { patternName: d.patternName, problems: [] });
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
        problems: g.problems,
      }))
      .sort((a, b) => {
        const na = parseInt(a.id.match(/stage-(\d+)/)?.[1] ?? "0", 10);
        const nb = parseInt(b.id.match(/stage-(\d+)/)?.[1] ?? "0", 10);
        if (na !== nb) return na - nb;
        return a.id.localeCompare(b.id);
      });
    topics.push({ id: topic.id, name: topic.name, patterns });
  }

  // Preserve known topic order: arrays → two-pointers → prefix-sum → trees
  const order = ["arrays-hashing", "two-pointers", "prefix-sum", "trees-dfs-bfs"];
  topics.sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
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

export function subscribeToProblems(callback: (topics: Topic[]) => void): () => void {
  return onSnapshot(
    collection(db, "problems"),
    (snap) => {
      const docs: ProblemDoc[] = [];
      snap.forEach((d) => docs.push(d.data() as ProblemDoc));
      callback(buildTopicsFromDocs(docs));
    },
    (err) => console.error("[firestore] subscribeToProblems error", err)
  );
}
