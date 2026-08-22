"use client";
import { useMemo, useState } from "react";
import { useProblems } from "@/hooks/useProblems";
import { useProgress } from "@/hooks/useProgress";
import { useProblemOverrides } from "@/hooks/useProblemOverrides";
import { FilterBar, type Filters } from "@/components/FilterBar";
import { TopicAccordion } from "@/components/sheet/TopicAccordion";
import type { MergedProblem, Pattern } from "@/lib/types";

type MergedPatternGroup = { pattern: Pattern; problems: MergedProblem[] };
type MergedTopic = { id: string; name: string; patterns: MergedPatternGroup[] };

export default function SheetPage() {
  const { topics, loading: problemsLoading } = useProblems();
  const { progress, updateStatus, loading: pLoading } = useProgress();
  const { overrides, updateLinks, updateTags, loading: oLoading } = useProblemOverrides();
  const [filters, setFilters] = useState<Filters>({ search: "", topic: null, difficulty: null, status: null, tags: [] });

  const mergedTopics: MergedTopic[] = useMemo(
    () =>
      topics.map((t) => ({
        id: t.id,
        name: t.name,
        patterns: t.patterns.map((p) => ({
          pattern: p,
          problems: p.problems.map((prob) => {
            const ov = overrides[prob.id];
            return {
              ...prob,
              links: ov?.links ?? prob.links,
              tags: ov?.tags ?? prob.tags ?? (prob.source ? [prob.source] : []),
              hasOverride: prob.id in overrides,
            } as MergedProblem;
          }),
        })),
      })),
    [topics, overrides]
  );

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of mergedTopics) for (const pat of t.patterns) for (const p of pat.problems) for (const tag of p.tags ?? []) set.add(tag);
    return Array.from(set).sort();
  }, [mergedTopics]);

  const filtered: MergedTopic[] = useMemo(() => {
    return mergedTopics
      .map((t) => {
        if (filters.topic && t.name !== filters.topic) return null;
        const patterns = t.patterns
          .map(({ pattern, problems }) => {
            const kept = problems.filter((problem) => {
              if (filters.search && !problem.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
              if (filters.difficulty && problem.difficulty !== filters.difficulty) return false;
              if (filters.tags.length > 0) {
                const probTags = (problem.tags ?? []).map((tag) => tag.toLowerCase());
                if (!filters.tags.every((ft) => probTags.includes(ft.toLowerCase()))) return false;
              }
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

  const loading = pLoading || oLoading || problemsLoading;
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
      <FilterBar filters={filters} setFilters={setFilters} topicNames={topics.map((t) => t.name)} availableTags={availableTags} />
      <div className="p-4">
        {loading ? <div className="text-sm text-muted-foreground py-4">Loading problems…</div> : null}
        {!loading && topics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No problems found — Firestore is empty. Run <code className="bg-muted px-1 rounded">npm run seed</code> to populate from JSON files.
          </div>
        ) : filtered.length === 0 && !loading ? (
          <div className="text-center py-12 text-muted-foreground">
            No problems match your filters.{" "}
            <button
              className="underline hover:text-foreground"
              onClick={() => setFilters({ search: "", topic: null, difficulty: null, status: null, tags: [] })}
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
              onEditTags={updateTags}
            />
          ))
        )}
      </div>
    </div>
  );
}
