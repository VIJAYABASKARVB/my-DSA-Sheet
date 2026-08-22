"use client";
import { useEffect, useState, useCallback } from "react";
import type { Status } from "@/lib/types";
import { subscribeToProgress, updateProblemStatus, getCurrentUserId } from "@/lib/firestore";

export function useProgress(userId?: string) {
  const [progress, setProgress] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);

  const effectiveUserId = userId ?? getCurrentUserId();

  useEffect(() => {
    let resolved = false;
    let unsub: (() => void) | null = null;
    try {
      unsub = subscribeToProgress((data) => {
        resolved = true;
        setProgress(data);
        setLoading(false);
      }, effectiveUserId);
    } catch (e) {
      console.warn("[useProgress] Firestore subscribe failed, using local (in-memory)", e);
      setLoading(false);
      resolved = true;
    }
    const timer = setTimeout(() => {
      if (!resolved) {
        console.info("[useProgress] Firestore timeout, using local (in-memory)");
        setLoading(false);
      }
    }, 2000);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [effectiveUserId]);

  const updateStatus = useCallback((problemId: string, status: Status) => {
    setProgress((prev) => {
      const next = { ...prev };
      if (status === "unsolved") delete next[problemId];
      else next[problemId] = status;
      return next;
    });
    void updateProblemStatus(problemId, status, effectiveUserId);
  }, [effectiveUserId]);

  return { progress, updateStatus, loading };
}
