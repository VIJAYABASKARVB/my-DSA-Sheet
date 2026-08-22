"use client";
import { useEffect, useState, useCallback } from "react";
import type { Status } from "@/lib/types";
import { subscribeToProgress, updateProblemStatus } from "@/lib/firestore";

export function useProgress() {
  const [progress, setProgress] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToProgress((data) => {
      setProgress(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = useCallback((problemId: string, status: Status) => {
    setProgress((prev) => {
      const next = { ...prev };
      if (status === "unsolved") delete next[problemId];
      else next[problemId] = status;
      return next;
    });
    void updateProblemStatus(problemId, status);
  }, []);

  return { progress, updateStatus, loading };
}
