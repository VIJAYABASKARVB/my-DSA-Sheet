"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import type { RecallStatus } from "@/lib/types";
import {
  subscribeToSpacedReviews,
  updateRecallStatus as firestoreUpdateRecall,
  getNextReviewDate,
} from "@/lib/spaced-repetition";
import type { SpacedReviewDoc } from "@/lib/spaced-repetition";
import { toast } from "sonner";

export type { SpacedReviewDoc };

export function useSpacedRepetition(userId?: string | null) {
  const [reviews, setReviews] = useState<Record<string, SpacedReviewDoc>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reviewsRef = useRef(reviews);
  reviewsRef.current = reviews;

  useEffect(() => {
    if (!userId) {
      setReviews({});
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
        toast.error("Firestore database not found — create it in Firebase Console (asia-southeast1)", {
          duration: 8000,
        });
      } else if (msg.includes("permission-denied") || msg.includes("Missing or insufficient permissions")) {
        toast.error("Firestore permission denied — check rules and sign-in");
      } else if (msg.includes("Not signed in")) {
        // not an error for anon browsing
      } else {
        toast.error("Failed to sync spaced reviews: " + msg);
      }
      setError(msg);
      setLoading(false);
    };

    try {
      unsub = subscribeToSpacedReviews(
        (data) => {
          resolved = true;
          setReviews(data);
          setLoading(false);
          setError(null);
        },
        userId,
        onError
      );
    } catch (e) {
      console.warn("[useSpacedRepetition] Firestore subscribe failed", e);
      onError(e as Error);
      resolved = true;
    }

    const timer = setTimeout(() => {
      if (!resolved) {
        console.info("[useSpacedRepetition] Firestore timeout — likely DB not found or blocked");
        setLoading(false);
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [userId]);

  const updateRecall = useCallback(
    async (problemId: string, recallStatus: RecallStatus) => {
      if (!userId) {
        toast.error("Please sign in with Google to save recall status");
        return;
      }
      const prev = { ...reviewsRef.current };

      // Optimistic update
      const nextDate = getNextReviewDate(recallStatus, new Date());
      const nowTs = Timestamp.now();
      const existing = reviewsRef.current[problemId];
      const optimisticCount = (existing?.reviewCount ?? 0) + 1;

      setReviews((prevState) => ({
        ...prevState,
        [problemId]: {
          recallStatus,
          lastReviewedAt: nowTs,
          nextReviewAt: Timestamp.fromDate(nextDate),
          reviewCount: optimisticCount,
        },
      }));

      try {
        await firestoreUpdateRecall(problemId, recallStatus, userId);
      } catch (e) {
        // Revert
        setReviews(prev);
        const msg = (e as Error).message ?? String(e);
        console.error("[useSpacedRepetition] updateRecall failed", problemId, e);
        if (msg.includes("permission-denied")) {
          toast.error("Save failed — permission denied. Check Firestore rules.");
        } else {
          toast.error("Failed to save recall status: " + msg);
        }
        // Single retry after 800ms for transient
        try {
          await new Promise((r) => setTimeout(r, 800));
          await firestoreUpdateRecall(problemId, recallStatus, userId);
          // re-apply optimistic on retry success
          setReviews((prevState) => ({
            ...prevState,
            [problemId]: {
              recallStatus,
              lastReviewedAt: Timestamp.now(),
              nextReviewAt: Timestamp.fromDate(getNextReviewDate(recallStatus, new Date())),
              reviewCount: optimisticCount,
            },
          }));
          toast.success("Saved after retry");
        } catch {
          // keep reverted
        }
      }
    },
    [userId]
  );

  // Derived: due reviews sorted by most overdue first
  const dueReviews = useMemo(() => {
    const now = new Date();
    const list = Object.entries(reviews)
      .filter(([, v]) => {
        if (!v.nextReviewAt) return false;
        const d = v.nextReviewAt instanceof Timestamp ? v.nextReviewAt.toDate() : (v.nextReviewAt as unknown as Date);
        return d.getTime() <= now.getTime();
      })
      .map(([problemId, doc]) => ({
        problemId,
        ...doc,
      }))
      .sort((a, b) => {
        const aTime = a.nextReviewAt instanceof Timestamp ? a.nextReviewAt.toDate().getTime() : (a.nextReviewAt as unknown as Date).getTime();
        const bTime = b.nextReviewAt instanceof Timestamp ? b.nextReviewAt.toDate().getTime() : (b.nextReviewAt as unknown as Date).getTime();
        return aTime - bTime; // most overdue first
      });
    return list;
  }, [reviews]);

  const dueCount = dueReviews.length;

  return { reviews, dueReviews, dueCount, updateRecall, loading, error };
}
