"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Status } from "@/lib/types";
import { subscribeToProgress, updateProblemStatus } from "@/lib/firestore";
import { toast } from "sonner";

export function useProgress(userId?: string | null) {
  const [progress, setProgress] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    // Gated by auth — no user means no subscription (avoid permission-denied / anon collision)
    if (!userId) {
      setProgress({});
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
      // Database not found is the primary cause for user's issue
      if (msg.includes("Database") && msg.includes("not found")) {
        toast.error("Firestore database not found — create it in Firebase Console (asia-southeast1)", {
          duration: 8000,
        });
      } else if (msg.includes("permission-denied") || msg.includes("Missing or insufficient permissions")) {
        toast.error("Firestore permission denied — check rules and sign-in");
      } else if (msg.includes("ERR_BLOCKED_BY_CLIENT") || msg.includes("blocked")) {
        toast.error("Firestore blocked by adblocker — disable for this site");
      } else {
        toast.error("Failed to sync progress: " + msg);
      }
      setError(msg);
      setLoading(false);
    };

    try {
      unsub = subscribeToProgress(
        (data) => {
          resolved = true;
          setProgress(data);
          setLoading(false);
          setError(null);
        },
        userId,
        onError
      );
    } catch (e) {
      console.warn("[useProgress] Firestore subscribe failed", e);
      onError(e as Error);
      resolved = true;
    }

    // Safety timeout: if Firestore never responds (e.g., DB not found / blocked), show actionable toast
    const timer = setTimeout(() => {
      if (!resolved) {
        console.info("[useProgress] Firestore timeout — likely DB not found or blocked");
        setLoading(false);
        // Don't toast again if error already shown; this timeout is fallback
        if (!error) toast.error("Firestore not responding — is the database created? Check console.");
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [userId]);

  const updateStatus = useCallback(
    async (problemId: string, status: Status) => {
      if (!userId) {
        toast.error("Please sign in with Google to save progress");
        return;
      }
      const prev = { ...progressRef.current };
      // Optimistic update
      setProgress((prevState) => {
        const next = { ...prevState };
        if (status === "unsolved") delete next[problemId];
        else next[problemId] = status;
        return next;
      });

      try {
        await updateProblemStatus(problemId, status, userId);
        // Silent on success to avoid spam; loud only on failure per requirement
      } catch (e) {
        // Revert optimistic change
        setProgress(prev);
        const msg = (e as Error).message ?? String(e);
        console.error("[useProgress] updateStatus failed", problemId, e);
        if (msg.includes("Database") && msg.includes("not found")) {
          toast.error("Save failed — Firestore database not found. Create it in Firebase Console.", {
            duration: 8000,
          });
        } else if (msg.includes("permission-denied") || msg.includes("Missing or insufficient permissions")) {
          toast.error("Save failed — permission denied. Check Firestore rules.");
        } else {
          toast.error("Failed to save progress: " + msg);
        }
        // Single retry after 800ms for transient network
        try {
          await new Promise((r) => setTimeout(r, 800));
          await updateProblemStatus(problemId, status, userId);
          // Retry succeeded — re-apply optimistic
          setProgress((prevState) => {
            const next = { ...prevState };
            if (status === "unsolved") delete next[problemId];
            else next[problemId] = status;
            return next;
          });
          toast.success("Saved after retry");
        } catch {
          // Keep reverted state, already toasted
        }
      }
    },
    [userId]
  );

  return { progress, updateStatus, loading, error };
}
