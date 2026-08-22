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
import type { Status, PlatformLink } from "./types";

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
