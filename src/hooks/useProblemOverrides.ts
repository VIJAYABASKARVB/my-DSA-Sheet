"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import type { PlatformLink, Tag } from "@/lib/types";
import { subscribeToOverrides, updateProblemLinks, updateProblemTags } from "@/lib/firestore";
import { toast } from "sonner";

type OverrideEntry = { links?: PlatformLink[]; tags?: Tag[] };

export function useProblemOverrides(userId?: string | null) {
  const [overrides, setOverrides] = useState<Record<string, OverrideEntry>>({});
  const [loading, setLoading] = useState(true);
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;

  const isAuthed = !!userId;

  useEffect(() => {
    if (!isAuthed) {
      setOverrides({});
      setLoading(false);
      return;
    }
    setLoading(true);
    let resolved = false;
    let unsub: (() => void) | null = null;

    const onError = (err: Error) => {
      const msg = err.message ?? String(err);
      if (msg.includes("Database") && msg.includes("not found")) {
        toast.error("Firestore database not found — create it in Firebase Console");
      } else if (msg.includes("permission-denied")) {
        toast.error("Firestore permission denied for overrides");
      } else {
        toast.error("Failed to sync overrides: " + msg);
      }
      setLoading(false);
    };

    try {
      unsub = subscribeToOverrides((data) => {
        resolved = true;
        setOverrides(data as Record<string, OverrideEntry>);
        setLoading(false);
      }, onError);
    } catch (e) {
      console.warn("[useProblemOverrides] Firestore subscribe failed", e);
      onError(e as Error);
      resolved = true;
    }
    const timer = setTimeout(() => {
      if (!resolved) {
        console.info("[useProblemOverrides] Firestore timeout, using local");
        setLoading(false);
      }
    }, 4000);
    return () => {
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [isAuthed]);

  const updateLinks = useCallback(
    async (problemId: string, links: PlatformLink[]) => {
      if (!isAuthed) {
        toast.error("Please sign in to edit links");
        return;
      }
      const prev = { ...overridesRef.current };
      setOverrides((prevState) => {
        const next = { ...prevState };
        const cur = next[problemId] ?? {};
        if (links.length === 0 && !cur.tags?.length) {
          delete next[problemId];
        } else if (links.length === 0) {
          const { links: _omit, ...rest } = next[problemId] as OverrideEntry & { links?: PlatformLink[] };
          next[problemId] = Object.keys(rest).length === 0 ? (delete next[problemId], next[problemId] as never) : (rest as OverrideEntry);
          if (!next[problemId]?.tags?.length && !next[problemId]?.links) delete next[problemId];
        } else {
          next[problemId] = { ...cur, links };
        }
        return next;
      });
      try {
        await updateProblemLinks(problemId, links);
      } catch (e) {
        setOverrides(prev);
        const msg = (e as Error).message ?? String(e);
        console.error("[useProblemOverrides] updateLinks failed", e);
        toast.error("Failed to save links: " + msg);
      }
    },
    [isAuthed]
  );

  const updateTags = useCallback(
    async (problemId: string, tags: Tag[]) => {
      if (!isAuthed) {
        toast.error("Please sign in to edit tags");
        return;
      }
      const prev = { ...overridesRef.current };
      setOverrides((prevState) => {
        const next = { ...prevState };
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
      try {
        await updateProblemTags(problemId, tags);
      } catch (e) {
        setOverrides(prev);
        const msg = (e as Error).message ?? String(e);
        console.error("[useProblemOverrides] updateTags failed", e);
        toast.error("Failed to save tags: " + msg);
      }
    },
    [isAuthed]
  );

  return { overrides, updateLinks, updateTags, loading };
}
