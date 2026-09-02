"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import type { RevisionSchedule } from "@/lib/types";
import {
  subscribeToRevisions,
  markRevisionDone as firestoreMarkDone,
  daysOverdue,
} from "@/lib/revision-schedule";
import { toast } from "sonner";

export type RevisionEntry = RevisionSchedule & { problemId: string };

export function useRevisionSchedule(userId?: string | null) {
  const [revisions, setRevisions] = useState<Record<string, RevisionSchedule>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const revisionsRef = useRef(revisions);
  revisionsRef.current = revisions;

  useEffect(() => {
    if (!userId) {
      setRevisions({});
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    let resolved = false;
    let unsub: (() => void) | null = null;

    const onError = (err: Error) => {
      const msg = err.message ?? String(err);
      if (msg.includes("Database") && msg.includes("not found")) {
        toast.error("Firestore database not found — create it in Firebase Console (asia-southeast1)", { duration: 8000 });
      } else if (msg.includes("permission-denied") || msg.includes("Missing or insufficient permissions")) {
        toast.error("Firestore permission denied — check rules and sign-in");
      } else if (msg.includes("Not signed in")) {
        // anon browsing
      } else {
        toast.error("Failed to sync revisions: " + msg);
      }
      setError(msg);
      setLoading(false);
    };

    try {
      unsub = subscribeToRevisions(
        (data) => {
          resolved = true;
          setRevisions(data);
          setLoading(false);
          setError(null);
        },
        userId,
        onError
      );
    } catch (e) {
      console.warn("[useRevisionSchedule] subscribe failed", e);
      onError(e as Error);
      resolved = true;
    }

    const timer = setTimeout(() => {
      if (!resolved) {
        console.info("[useRevisionSchedule] Firestore timeout");
        setLoading(false);
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [userId]);

  const removeRevision = useCallback((problemId: string) => {
    setRevisions((prev) => {
      if (!(problemId in prev)) return prev;
      const next = { ...prev };
      delete next[problemId];
      return next;
    });
  }, []);

  const restoreRevision = useCallback((problemId: string, schedule: RevisionSchedule) => {
    setRevisions((prev) => ({ ...prev, [problemId]: schedule }));
  }, []);

  const markRevisionDone = useCallback(
    async (problemId: string) => {
      if (!userId) {
        toast.error("Please sign in with Google to save revision progress");
        return;
      }
      const prev = { ...revisionsRef.current };
      const existing = revisionsRef.current[problemId];
      if (!existing) {
        toast.error("No revision schedule for this problem");
        return;
      }
      if (existing.isFullyMastered) {
        toast.error("Already mastered");
        return;
      }
      const nextIndex = existing.currentRevisionIndex + 1;
      const isFullyMastered = nextIndex >= 6;
      const optimistic: RevisionSchedule = {
        ...existing,
        currentRevisionIndex: nextIndex,
        completedRevisions: [...(existing.completedRevisions ?? []), Timestamp.now()],
        isFullyMastered,
      };

      setRevisions((prevState) => ({
        ...prevState,
        [problemId]: optimistic,
      }));

      try {
        await firestoreMarkDone(problemId, userId);
        toast.success(isFullyMastered ? "Mastered! All 6 revisions done" : `Revision ${nextIndex} of 6 logged`);
      } catch (e) {
        setRevisions(prev);
        const msg = (e as Error).message ?? String(e);
        console.error("[useRevisionSchedule] markRevisionDone failed", e);
        if (msg.includes("permission-denied")) {
          toast.error("Save failed — permission denied.");
        } else {
          toast.error("Failed to save revision: " + msg);
        }
        // single retry
        try {
          await new Promise((r) => setTimeout(r, 800));
          await firestoreMarkDone(problemId, userId);
          setRevisions((ps) => ({ ...ps, [problemId]: optimistic }));
          toast.success("Saved after retry");
        } catch {
          // keep reverted
        }
      }
    },
    [userId]
  );

  // Derived: dueToday sorted by most overdue first
  const { dueToday, upcoming } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const in7 = new Date(now);
    in7.setDate(in7.getDate() + 7);
    in7.setHours(23, 59, 59, 999);

    const due: RevisionEntry[] = [];
    const up: (RevisionEntry & { nextDate: Date; daysUntil: number })[] = [];

    for (const [problemId, sched] of Object.entries(revisions)) {
      if (sched.isFullyMastered) continue;
      const idx = sched.currentRevisionIndex ?? 0;
      if (idx >= 6) continue;
      const raw = sched.revisionDates?.[idx];
      if (!raw) continue;
      const target = raw instanceof Timestamp ? raw.toDate() : new Date(raw as unknown as Date);
      const tMidnight = new Date(target);
      tMidnight.setHours(0, 0, 0, 0);

      if (tMidnight.getTime() <= todayEnd.getTime()) {
        due.push({ problemId, ...sched });
      } else if (tMidnight.getTime() > todayEnd.getTime() && tMidnight.getTime() <= in7.getTime()) {
        const daysUntil = Math.ceil((tMidnight.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        up.push({ problemId, ...sched, nextDate: tMidnight, daysUntil });
      }
    }

    due.sort((a, b) => {
      const aRaw = a.revisionDates[a.currentRevisionIndex] as Timestamp;
      const bRaw = b.revisionDates[b.currentRevisionIndex] as Timestamp;
      const aTime = aRaw instanceof Timestamp ? aRaw.toDate().getTime() : new Date(aRaw as unknown as Date).getTime();
      const bTime = bRaw instanceof Timestamp ? bRaw.toDate().getTime() : new Date(bRaw as unknown as Date).getTime();
      return aTime - bTime;
    });
    up.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

    return { dueToday: due, upcoming: up };
  }, [revisions]);

  const dueCount = dueToday.length;

  return { revisions, dueToday, upcoming, dueCount, markRevisionDone, removeRevision, restoreRevision, loading, error };
}
