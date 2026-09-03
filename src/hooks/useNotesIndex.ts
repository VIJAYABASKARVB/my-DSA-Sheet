"use client";
import { useEffect, useState } from "react";
import { subscribeToNotesIndex } from "@/lib/firestore";

export function useNotesIndex(userId: string | null | undefined) {
  const [notedProblemIds, setNotedProblemIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotedProblemIds(new Set());
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const unsub = subscribeToNotesIndex(
      userId,
      (ids) => {
        setNotedProblemIds(ids);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message ?? String(err));
        setLoading(false);
      }
    );
    return () => unsub();
  }, [userId]);

  return { notedProblemIds, loading, error };
}
