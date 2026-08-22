"use client";
import { useEffect, useState } from "react";
import type { Topic } from "@/lib/types";
import { subscribeToProblems } from "@/lib/firestore";
import arraysHashing from "@/data/arrays-hashing-topic.json";
import trees from "@/data/trees-topic.json";
import prefixSum from "@/data/prefix-sum-topic.json";
import twoPointers from "@/data/two-pointers-topic.json";
import slidingWindow from "@/data/sliding-window-topic.json";
import matrix from "@/data/matrix-topic.json";
import algorithms from "@/data/algorithms-topic.json";
import linkedList from "@/data/linked-list-topic.json";
import binarySearch from "@/data/binary-search-topic.json";

type RawTopic = {
  topicId: string;
  name: string;
  order?: number;
  patterns: {
    patternId: string;
    name: string;
    order?: number;
    problems: { id: string; name: string; difficulty: string; order?: number; tags?: string[]; source?: string; links: { platform: string; url: string }[] }[];
  }[];
};

const rawTopics: RawTopic[] = [
  arraysHashing as RawTopic,
  twoPointers as RawTopic,
  prefixSum as RawTopic,
  matrix as RawTopic,
  algorithms as RawTopic,
  slidingWindow as RawTopic,
  linkedList as RawTopic,
  binarySearch as RawTopic,
  trees as RawTopic,
];

function buildFallbackTopics(): Topic[] {
  return rawTopics.map((t, tIdx) => ({
    id: t.topicId,
    name: t.name,
    order: t.order ?? tIdx,
    patterns: t.patterns.map((p, pIdx) => ({
      id: p.patternId,
      name: p.name,
      topicId: t.topicId,
      order: p.order ?? pIdx,
      problems: p.problems.map((prob, probIdx) => ({
        id: prob.id,
        name: prob.name,
        difficulty: prob.difficulty as Topic["patterns"][number]["problems"][number]["difficulty"],
        tags: (prob.tags ?? (prob.source ? [prob.source] : [])) as Topic["patterns"][number]["problems"][number]["tags"],
        source: prob.source as Topic["patterns"][number]["problems"][number]["source"],
        links: prob.links as Topic["patterns"][number]["problems"][number]["links"],
        topicId: t.topicId,
        patternId: p.patternId,
        order: prob.order ?? probIdx,
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
