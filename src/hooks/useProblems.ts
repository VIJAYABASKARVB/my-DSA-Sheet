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
import strings from "@/data/strings-topic.json";
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
  strings as RawTopic,
  linkedList as RawTopic,
  slidingWindow as RawTopic,
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

export function useProblems(userId?: string | null) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | null = null;
    let resolved = false;

    const useFallback = () => {
      if (cancelled || resolved) return;
      resolved = true;
      setTopics(FALLBACK_TOPICS);
      setLoading(false);
      console.info("[useProblems] Using local fallback (Firestore empty / not configured / not signed in)");
    };

    const onError = (err: Error) => {
      const msg = err.message ?? String(err);
      console.warn("[useProblems] Firestore error", msg);
      // If not signed in, fallback silently (allow browsing). If signed in, show why Firestore failed but still fallback so app usable.
      if (msg.includes("permission-denied") || msg.includes("Missing or insufficient permissions")) {
        // Likely not signed in yet — silently fallback, don't spam
        useFallback();
        return;
      }
      if (msg.includes("Database") && msg.includes("not found")) {
        // Only toast if user is signed in (they expect sync). For anon browsing, keep quiet.
        if (userId) {
          // Handled by useProgress toast; avoid duplicate loud toast here
          console.error("[useProblems] Database not found — needs creation in console (asia-southeast1)");
        }
      }
      setError(msg);
      useFallback();
    };

    try {
      unsub = subscribeToProblems(
        (data) => {
          if (cancelled) return;
          if (data.length === 0) {
            useFallback();
          } else {
            resolved = true;
            setTopics(data);
            setLoading(false);
            setError(null);
          }
        },
        onError
      );
    } catch (e) {
      console.warn("[useProblems] Firestore subscribe failed, using fallback", e);
      useFallback();
    }

    const timer = setTimeout(() => {
      if (!resolved) {
        useFallback();
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, [userId]);

  return { topics, loading, error };
}
