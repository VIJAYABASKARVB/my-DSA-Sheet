import { Timestamp, doc, setDoc, serverTimestamp, increment, collection, onSnapshot, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";
import type { Status } from "./types";

export type RecallStatus = "easy" | "hint" | "blank";

export const REVIEW_INTERVALS: Record<RecallStatus, number> = {
  easy: 7,
  hint: 3,
  blank: 1,
};

/**
 * Returns the next review Date for a given recall status.
 * easy  → +7 days, hint → +3 days, blank → +1 day
 * `from` defaults to now; caller may pass a specific Date for testing.
 */
export function getNextReviewDate(recallStatus: RecallStatus, from: Date = new Date()): Date {
  const days = REVIEW_INTERVALS[recallStatus];
  if (days === undefined) {
    throw new Error(`Invalid recallStatus: ${String(recallStatus)}`);
  }
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Firestore helper: convert recallStatus to Timestamp.
 */
export function getNextReviewTimestamp(recallStatus: RecallStatus, from: Date = new Date()): Timestamp {
  return Timestamp.fromDate(getNextReviewDate(recallStatus, from));
}

/**
 * Days overdue: floor difference in days between now and nextReviewAt.
 * nextReviewAt may be a Date or Firestore Timestamp.
 */
export function daysOverdue(nextReviewAt: Date | Timestamp, now: Date = new Date()): number {
  const target = nextReviewAt instanceof Timestamp ? nextReviewAt.toDate() : nextReviewAt;
  const diffMs = now.getTime() - target.getTime();
  // floor: 0 if due today, 1 if due yesterday, etc. Negative means not yet due.
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a review is due (nextReviewAt <= now)
 */
export function isDue(nextReviewAt: Date | Timestamp | null | undefined, now: Date = new Date()): boolean {
  if (!nextReviewAt) return false;
  const target = nextReviewAt instanceof Timestamp ? nextReviewAt.toDate() : nextReviewAt;
  return target.getTime() <= now.getTime();
}

// ---- Firestore integration (dedicated writes per spec) ----

export type SpacedReviewDoc = {
  recallStatus: RecallStatus | null;
  lastReviewedAt?: Timestamp;
  nextReviewAt?: Timestamp;
  reviewCount?: number;
  status?: Status;
  updatedAt?: Timestamp;
};

function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid ?? null;
}

/**
 * Saves recall status to Firestore with optimistic fields:
 * recallStatus, lastReviewedAt, nextReviewAt (computed), reviewCount (increment)
 * Stored in users/{uid}/progress/{problemId} via merge to preserve status.
 */
export async function updateRecallStatus(
  problemId: string,
  recallStatus: RecallStatus,
  userId?: string
): Promise<void> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot save recall status");
  const nextDate = getNextReviewDate(recallStatus, new Date());
  await setDoc(
    doc(db, "users", uid, "progress", problemId),
    {
      recallStatus,
      lastReviewedAt: serverTimestamp(),
      nextReviewAt: Timestamp.fromDate(nextDate),
      reviewCount: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getSpacedReviews(userId?: string): Promise<Record<string, SpacedReviewDoc>> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot load reviews");
  const snap = await getDocs(collection(db, "users", uid, "progress"));
  const out: Record<string, SpacedReviewDoc> = {};
  snap.forEach((d) => {
    const data = d.data() as SpacedReviewDoc;
    if (data.recallStatus) out[d.id] = data;
  });
  return out;
}

export function subscribeToSpacedReviews(
  callback: (reviews: Record<string, SpacedReviewDoc>) => void,
  userId?: string,
  onError?: (err: Error) => void
): () => void {
  const uid = userId || getCurrentUserId();
  if (!uid) {
    if (onError) onError(new Error("Not signed in"));
    return () => {};
  }
  return onSnapshot(
    collection(db, "users", uid, "progress"),
    (snap) => {
      const out: Record<string, SpacedReviewDoc> = {};
      snap.forEach((d) => {
        const data = d.data() as SpacedReviewDoc;
        if (data.recallStatus) out[d.id] = data;
      });
      callback(out);
    },
    (err) => {
      console.error("[firestore] subscribeToSpacedReviews error", err);
      if (onError) onError(err as Error);
    }
  );
}
