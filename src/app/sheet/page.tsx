"use client";
import { useMemo, useState } from "react";
import { topics } from "@/data/problems";
import { useProgress } from "@/hooks/useProgress";
import { useProblemOverrides } from "@/hooks/useProblemOverrides";
import { FilterBar, type Filters } from "@/components/FilterBar";
import { TopicAccordion } from "@/components/sheet/TopicAccordion";
import type { MergedProblem, Topic, Pattern } from "@/lib/types";

type MergedPatternGroup = { pattern: Pattern; problems: MergedProblem[] };
type MergedTopic = { id: string; name: string; patterns: MergedPatternGroup[] };

export default function SheetPage() {
  const { progress, updateStatus, loading: pLoading } = useProgress();
  const { overrides, updateLinks, loading: oLoading } = useProblemOverrides();
  const [filters, setFilters] = useState<Filters>({ search: "", topic: null, difficulty: null, status: null, source: null });

  const mergedTopics: MergedTopic[] = useMemo(
    () =>
      topics.map((t) => ({
        id: t.id,
        name: t.name,
        patterns: t.patterns.map((p) => ({
          pattern: p,
          problems: p.problems.map(
            (prob) =>
              ({
                ...prob,
                links: overrides[prob.id] ?? prob.links,
                hasOverride: prob.id in overrides,
              }) as MergedProblem
          ),
        })),
      })),
    [overrides]
  );

  const filtered: MergedTopic[] = useMemo(() => {
    return mergedTopics
      .map((t) => {
        if (filters.topic && t.name !== filters.topic) return null;
        const patterns = t.patterns
          .map(({ pattern, problems }) => {
            const kept = problems.filter((problem) => {
              if (filters.search && !problem.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
              if (filters.difficulty && problem.difficulty !== filters.difficulty) return false;
              if (filters.source && problem.source !== filters.source) return false;
              const st = progress[problem.id] ?? "unsolved";
              if (filters.status && st !== filters.status) return false;
              return true;
            });
            return kept.length ? { pattern, problems: kept } : null;
          })
          .filter(Boolean) as MergedPatternGroup[];
        return patterns.length ? { id: t.id, name: t.name, patterns } : null;
      })
      .filter(Boolean) as MergedTopic[];
  }, [mergedTopics, filters, progress]);

  const loading = pLoading || oLoading;
  const totalProblems = topics.flatMap((t) => t.patterns.flatMap((p) => p.problems)).length;
  const solvedCount = Object.values(progress).filter((s) => s === "solved").length;

  return (
    <div className="max-w-5xl mx-auto min-h-screen">
      <div className="px-4 py-6 border-b bg-card">
        <h1 className="text-2xl font-bold tracking-tight">My DSA Sheet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {solvedCount}/{totalProblems} solved • {topics.length} topics • Firestore sync enabled
        </p>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} topicNames={topics.map((t) => t.name)} />
      <div className="p-4">
        {loading ? <div className="text-sm text-muted-foreground py-4">Loading progress…</div> : null}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No problems match your filters.{" "}
            <button
              className="underline hover:text-foreground"
              onClick={() => setFilters({ search: "", topic: null, difficulty: null, status: null, source: null })}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((topic) => (
            <TopicAccordion
              key={topic.id}
              topic={{ id: topic.id, name: topic.name }}
              patterns={topic.patterns}
              progress={progress}
              onStatusChange={updateStatus}
              onEditLinks={updateLinks}
            />
          ))
        )}
      </div>
    </div>
  );
}
