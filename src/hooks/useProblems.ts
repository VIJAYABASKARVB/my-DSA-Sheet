"use client";
import { useEffect, useState } from "react";
import type { Topic } from "@/lib/types";
import { subscribeToProblems } from "@/lib/firestore";
import fallbackData from "@/data/problems.json";

type RawTopic = {
  topicId: string;
  name: string;
  patterns: {
    patternId: string;
    name: string;
    problems: { id: string; name: string; difficulty: string; tags?: string[]; source?: string; links: { platform: string; url: string }[] }[];
  }[];
};

function buildFallbackTopics(): Topic[] {
  const raw = fallbackData as { topics: RawTopic[] };
  return raw.topics.map((t) => ({
    id: t.topicId,
    name: t.name,
    patterns: t.patterns.map((p) => ({
      id: p.patternId,
      name: p.name,
      topicId: t.topicId,
      problems: p.problems.map((prob) => ({
        id: prob.id,
        name: prob.name,
        difficulty: prob.difficulty as Topic["patterns"][number]["problems"][number]["difficulty"],
        tags: (prob.tags ?? (prob.source ? [prob.source] : [])) as Topic["patterns"][number]["problems"][number]["tags"],
        source: prob.source as Topic["patterns"][number]["problems"][number]["source"],
        links: prob.links as Topic["patterns"][number]["problems"][number]["links"],
        topicId: t.topicId,
        patternId: p.patternId,
      })),
    })),
  }));
}

const FALLBACK_TOPICS = buildFallbackTopics();

export function useProblems() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | null = null;
    let resolved = false;

    // Helper to use local fallback (immediate, no network)
    const useFallback = () => {
      if (cancelled || resolved) return;
      resolved = true;
      setTopics(FALLBACK_TOPICS);
      setLoading(false);
      console.info("[useProblems] Using local fallback (Firestore empty / not configured)");
    };

    try {
      unsub = subscribeToProblems((data) => {
        if (cancelled) return;
        // Firestore as primary — if empty (not seeded), fall back to local so sheet is usable locally
        if (data.length === 0) {
          useFallback();
        } else {
          resolved = true;
          setTopics(data);
          setLoading(false);
        }
      });
    } catch (e) {
      console.warn("[useProblems] Firestore subscribe failed, using fallback", e);
      useFallback();
    }

    // Safety: if Firestore doesn't respond in 2s (e.g., missing env), fall back so local works
    const timer = setTimeout(() => {
      if (!resolved) {
        useFallback();
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (unsub) unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { topics, loading };
}
