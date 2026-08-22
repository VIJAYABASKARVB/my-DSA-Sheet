"use client";
import { useEffect, useState } from "react";
import type { Topic } from "@/lib/types";
import { subscribeToProblems } from "@/lib/firestore";

export function useProblems() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToProblems((data) => {
      setTopics(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { topics, loading };
}
