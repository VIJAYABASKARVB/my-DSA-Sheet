"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeToActivity } from "@/lib/firestore";
import {
  buildCalendarMatrix,
  getStreakStats,
  monthLabelsForMatrix,
  toDayKey,
  type ActivityMap,
} from "@/lib/streak";
import type { RevisionSchedule } from "@/lib/types";

type ProgressDocData = {
  status?: string;
  updatedAt?: Timestamp | Date;
  revisionSchedule?: RevisionSchedule | null;
};

function timestampToDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  try {
    const d = new Date(v as string | number);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function useStreak(userId?: string | null, weeks = 20) {
  const [activityLog, setActivityLog] = useState<ActivityMap>({});
  const [backfill, setBackfill] = useState<ActivityMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !db) {
      setActivityLog({});
      setBackfill({});
      setLoading(false);
      return;
    }
    setLoading(true);
    let activityDone = false;
    let backfillDone = false;
    const maybeDone = () => {
      if (activityDone && backfillDone) setLoading(false);
    };

    const unsubActivity = subscribeToActivity(
      (data) => {
        setActivityLog(data);
        activityDone = true;
        maybeDone();
      },
      userId,
      () => {
        activityDone = true;
        maybeDone();
      }
    );

    let unsubBackfill: (() => void) | null = null;
    try {
      unsubBackfill = onSnapshot(
        collection(db, "users", userId, "progress"),
        (snap) => {
          const map: ActivityMap = {};
          snap.forEach((d) => {
            const data = d.data() as ProgressDocData;
            if (data.status !== "solved") return;
            // Solved-only: prefer learnedAt (first solve date), fallback updatedAt
            const learned = data.revisionSchedule?.learnedAt
              ? timestampToDate(data.revisionSchedule.learnedAt)
              : null;
            const updated = timestampToDate(data.updatedAt);
            const solvedAt = learned ?? updated;
            if (!solvedAt) return;
            const key = toDayKey(solvedAt);
            map[key] = (map[key] ?? 0) + 1;
          });
          setBackfill(map);
          backfillDone = true;
          maybeDone();
        },
        () => {
          backfillDone = true;
          maybeDone();
        }
      );
    } catch {
      backfillDone = true;
      maybeDone();
    }

    const timer = setTimeout(() => setLoading(false), 4000);
    return () => {
      clearTimeout(timer);
      if (unsubActivity) unsubActivity();
      if (unsubBackfill) unsubBackfill();
    };
  }, [userId]);

  const { activity, stats, matrix, monthLabels } = useMemo(() => {
    // Activity log wins per-day (avoids double-counting backfill for same solves)
    const merged: ActivityMap = { ...backfill };
    for (const [k, v] of Object.entries(activityLog)) {
      merged[k] = Math.max(v, merged[k] ?? 0);
      // If both sources have counts for the same day (legacy + new solves),
      // activity log already includes new solves; backfill includes old solves.
      // They may overlap for the same problem solved before log existed then
      // re-solved today — max is the safer, non-inflating choice.
    }
    const s = getStreakStats(merged);
    const m = buildCalendarMatrix(merged, weeks);
    const labels = monthLabelsForMatrix(m);
    return { activity: merged, stats: s, matrix: m, monthLabels: labels };
  }, [activityLog, backfill, weeks]);

  return { activity, stats, matrix, monthLabels, loading };
}
