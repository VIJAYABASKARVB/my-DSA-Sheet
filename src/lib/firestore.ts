import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { Status, PlatformLink, Topic, Problem, Difficulty, Source } from "./types";

type ProblemDoc = {
  id: string;
  name: string;
  difficulty: Difficulty;
  source: Source;
  links: PlatformLink[];
  topicId: string;
  topicName: string;
  patternId: string;
  patternName: string;
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

export async function getProblemOverrides(): Promise<Record<string, PlatformLink[]>> {
  const snap = await getDocs(collection(db, "problemOverrides"));
  const out: Record<string, PlatformLink[]> = {};
  snap.forEach((d) => {
    const data = d.data() as { links: PlatformLink[] };
    if (Array.isArray(data.links)) out[d.id] = data.links;
  });
  return out;
}

export async function updateProblemLinks(problemId: string, links: PlatformLink[]): Promise<void> {
  try {
    if (links.length === 0) {
      await deleteDoc(doc(db, "problemOverrides", problemId));
    } else {
      await setDoc(doc(db, "problemOverrides", problemId), { links, updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (e) {
    console.error("[firestore] updateProblemLinks failed", problemId, e);
  }
}

export function subscribeToOverrides(callback: (overrides: Record<string, PlatformLink[]>) => void): () => void {
  return onSnapshot(
    collection(db, "problemOverrides"),
    (snap) => {
      const out: Record<string, PlatformLink[]> = {};
      snap.forEach((d) => {
        const data = d.data() as { links: PlatformLink[] };
        if (Array.isArray(data.links)) out[d.id] = data.links;
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
    group.problems.push({
      id: d.id,
      name: d.name,
      difficulty: d.difficulty,
      source: d.source,
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

  // Preserve known topic order: arrays → prefix-sum → trees
  const order = ["arrays-hashing", "prefix-sum", "trees-dfs-bfs"];
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
