"use client";
import { useEffect, useState, useCallback } from "react";
import type { PlatformLink } from "@/lib/types";
import { subscribeToOverrides, updateProblemLinks } from "@/lib/firestore";

export function useProblemOverrides() {
  const [overrides, setOverrides] = useState<Record<string, PlatformLink[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;
    let unsub: (() => void) | null = null;
    try {
      unsub = subscribeToOverrides((data) => {
        resolved = true;
        setOverrides(data);
        setLoading(false);
      });
    } catch (e) {
      console.warn("[useProblemOverrides] Firestore subscribe failed, using local", e);
      setLoading(false);
      resolved = true;
    }
    const timer = setTimeout(() => {
      if (!resolved) {
        console.info("[useProblemOverrides] Firestore timeout, using local");
        setLoading(false);
      }
    }, 2000);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
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
