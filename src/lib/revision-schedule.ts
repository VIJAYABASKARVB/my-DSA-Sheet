import { Timestamp, doc, setDoc, getDoc, getDocs, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";
import type { RevisionSchedule } from "./types";

export const REVISION_GAPS = [1, 3, 5, 6, 10, 17] as const;

/**
 * Generate 6 revision dates from learnedAt using absolute gaps.
 * Gaps: Day 1, 3, 5, 6, 10, 17  (from spec 1-3-5-1-4-7)
 * All dates normalized to midnight to avoid time drift.
 */
export function generateRevisionSchedule(learnedAt: Date): Timestamp[] {
  const base = new Date(learnedAt);
  base.setHours(0, 0, 0, 0);
  return REVISION_GAPS.map((gap) => {
    const d = new Date(base);
    d.setDate(d.getDate() + gap);
    return Timestamp.fromDate(d);
  });
}

export function createInitialSchedule(learnedAt: Date = new Date()): RevisionSchedule {
  return {
    learnedAt: Timestamp.fromDate(learnedAt),
    revisionDates: generateRevisionSchedule(learnedAt),
    currentRevisionIndex: 0,
    completedRevisions: [],
    isFullyMastered: false,
  };
}

/**
 * Days overdue: floor difference in days between now and target date.
 * Positive = overdue, 0 = due today, negative = upcoming.
 */
export function daysOverdue(target: Date | Timestamp, now: Date = new Date()): number {
  const t = target instanceof Timestamp ? target.toDate() : target;
  const a = new Date(now);
  a.setHours(0, 0, 0, 0);
  const b = new Date(t);
  b.setHours(0, 0, 0, 0);
  const diffMs = a.getTime() - b.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isDue(target: Date | Timestamp | null | undefined, now: Date = new Date()): boolean {
  if (!target) return false;
  const t = target instanceof Timestamp ? target.toDate() : target;
  const a = new Date(now);
  a.setHours(0, 0, 0, 0);
  const b = new Date(t);
  b.setHours(0, 0, 0, 0);
  return b.getTime() <= a.getTime();
}

function getCurrentUserId(): string | null {
  return auth?.currentUser?.uid ?? null;
}

export function getNextRevisionDate(schedule: RevisionSchedule): Timestamp | null {
  if (schedule.isFullyMastered) return null;
  if (schedule.currentRevisionIndex >= schedule.revisionDates.length) return null;
  return schedule.revisionDates[schedule.currentRevisionIndex] ?? null;
}

// ---- Firestore helpers ----

export async function getTodaysRevisions(userId?: string): Promise<Record<string, RevisionSchedule>> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot load revisions");
  const snap = await getDocs(collection(db, "users", uid, "progress"));
  const out: Record<string, RevisionSchedule> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  snap.forEach((d) => {
    const data = d.data() as { revisionSchedule?: RevisionSchedule };
    const sched = data.revisionSchedule;
    if (!sched || sched.isFullyMastered) return;
    const idx = sched.currentRevisionIndex ?? 0;
    if (idx >= (sched.revisionDates?.length ?? 6)) return;
    const raw = sched.revisionDates?.[idx];
    if (!raw) return;
    const target = raw instanceof Timestamp ? raw.toDate() : new Date(raw as unknown as Date);
    // Due if target midnight <= today end
    const tMidnight = new Date(target);
    tMidnight.setHours(0, 0, 0, 0);
    if (tMidnight.getTime() <= todayEnd.getTime()) {
      out[d.id] = sched;
    }
  });
  return out;
}

export function subscribeToRevisions(
  callback: (revisions: Record<string, RevisionSchedule>) => void,
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
      const out: Record<string, RevisionSchedule> = {};
      snap.forEach((d) => {
        const data = d.data() as { revisionSchedule?: RevisionSchedule };
        if (data.revisionSchedule) out[d.id] = data.revisionSchedule;
      });
      callback(out);
    },
    (err) => {
      console.error("[firestore] subscribeToRevisions error", err);
      if (onError) onError(err as Error);
    }
  );
}

export async function markRevisionDone(problemId: string, userId?: string): Promise<void> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot mark revision done");
  const ref = doc(db, "users", uid, "progress", problemId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Progress doc not found for " + problemId);
  const data = snap.data() as { revisionSchedule?: RevisionSchedule; status?: string };
  const sched = data.revisionSchedule;
  if (!sched) throw new Error("No revision schedule for " + problemId);
  if (sched.isFullyMastered) return; // already done
  if (sched.currentRevisionIndex >= 6) return;
  const nextIndex = sched.currentRevisionIndex + 1;
  const completed = [...(sched.completedRevisions ?? []), Timestamp.now()];
  const isFullyMastered = nextIndex >= 6;
  const updated: RevisionSchedule = {
    ...sched,
    currentRevisionIndex: nextIndex,
    completedRevisions: completed,
    isFullyMastered,
  };
  await setDoc(
    ref,
    {
      revisionSchedule: updated,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function ensureRevisionSchedule(problemId: string, learnedAt: Date = new Date(), userId?: string): Promise<RevisionSchedule> {
  const uid = userId || getCurrentUserId();
  if (!uid) throw new Error("Not signed in — cannot ensure schedule");
  const ref = doc(db, "users", uid, "progress", problemId);
  const schedule = createInitialSchedule(learnedAt);
  await setDoc(
    ref,
    {
      revisionSchedule: schedule,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return schedule;
}
