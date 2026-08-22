"use client";
import { useEffect, useState, useCallback } from "react";
import type { PlatformLink, Tag } from "@/lib/types";
import { subscribeToOverrides, updateProblemLinks, updateProblemTags } from "@/lib/firestore";

type OverrideEntry = { links?: PlatformLink[]; tags?: Tag[] };

export function useProblemOverrides() {
  const [overrides, setOverrides] = useState<Record<string, OverrideEntry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;
    let unsub: (() => void) | null = null;
    try {
      unsub = subscribeToOverrides((data) => {
        resolved = true;
        setOverrides(data as Record<string, OverrideEntry>);
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
      const cur = next[problemId] ?? {};
      if (links.length === 0 && !cur.tags?.length) {
        delete next[problemId];
      } else if (links.length === 0) {
        next[problemId] = { ...cur, links: undefined };
        if (!next[problemId].tags?.length) delete next[problemId];
        else {
          // keep tags, remove links key
          const { links: _omit, ...rest } = next[problemId] as OverrideEntry & { links?: PlatformLink[] };
          next[problemId] = rest;
        }
      } else {
        next[problemId] = { ...cur, links };
      }
      return next;
    });
    void updateProblemLinks(problemId, links);
  }, []);

  const updateTags = useCallback((problemId: string, tags: Tag[]) => {
    setOverrides((prev) => {
      const next = { ...prev };
      const cur = next[problemId] ?? {};
      if (tags.length === 0 && !cur.links?.length) {
        delete next[problemId];
      } else if (tags.length === 0) {
        const { tags: _omit, ...rest } = cur as OverrideEntry;
        if (Object.keys(rest).length === 0) delete next[problemId];
        else next[problemId] = rest;
      } else {
        next[problemId] = { ...cur, tags };
      }
      return next;
    });
    void updateProblemTags(problemId, tags);
  }, []);

  return { overrides, updateLinks, updateTags, loading };
}
