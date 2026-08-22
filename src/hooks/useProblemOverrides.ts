"use client";
import { useEffect, useState, useCallback } from "react";
import type { PlatformLink } from "@/lib/types";
import { subscribeToOverrides, updateProblemLinks } from "@/lib/firestore";

export function useProblemOverrides() {
  const [overrides, setOverrides] = useState<Record<string, PlatformLink[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToOverrides((data) => {
      setOverrides(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateLinks = useCallback((problemId: string, links: PlatformLink[]) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (links.length === 0) delete next[problemId];
      else next[problemId] = links;
      return next;
    });
    void updateProblemLinks(problemId, links);
  }, []);

  return { overrides, updateLinks, loading };
}
