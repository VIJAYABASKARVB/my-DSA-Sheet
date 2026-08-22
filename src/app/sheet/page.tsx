"use client";
import { useMemo, useState } from "react";
import { useProblems } from "@/hooks/useProblems";
import { useProgress } from "@/hooks/useProgress";
import { useProblemOverrides } from "@/hooks/useProblemOverrides";
import { FilterBar, type Filters } from "@/components/FilterBar";
import { TopicAccordion } from "@/components/sheet/TopicAccordion";
import { AppHeader } from "@/components/AppHeader";
import { SearchX, Database, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MergedProblem, Pattern } from "@/lib/types";

type MergedPatternGroup = { pattern: Pattern; problems: MergedProblem[] };
type MergedTopic = { id: string; name: string; patterns: MergedPatternGroup[] };

function SkeletonCard() {
  return (
    <div className="rounded-[1.25rem] border border-white/5 bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-5 w-40 skeleton rounded-lg" />
        <div className="h-4 w-20 skeleton rounded-lg" />
      </div>
      <div className="h-2 w-full skeleton rounded-full" />
    </div>
  );
}

function StatRailCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="p-4 rounded-[1rem] border border-white/5 bg-card">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-mono font-semibold tracking-tight text-foreground">
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export default function SheetPage() {
  const { topics, loading: problemsLoading } = useProblems();
  const { progress, updateStatus, loading: pLoading } = useProgress();
  const { overrides, updateLinks, updateTags, loading: oLoading } = useProblemOverrides();
  const [filters, setFilters] = useState<Filters>({
    search: "",
    topic: null,
    difficulty: null,
    status: null,
    tags: [],
  });

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
    for (const t of mergedTopics)
      for (const pat of t.patterns)
        for (const p of pat.problems)
          for (const tag of p.tags ?? []) set.add(tag);
    return Array.from(set).sort();
  }, [mergedTopics]);

  const filtered: MergedTopic[] = useMemo(() => {
    return mergedTopics
      .map((t) => {
        if (filters.topic && t.name !== filters.topic) return null;
        const patterns = t.patterns
          .map(({ pattern, problems }) => {
            const kept = problems.filter((problem) => {
              if (
                filters.search &&
                !problem.name.toLowerCase().includes(filters.search.toLowerCase())
              )
                return false;
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
  const reviewedCount = Object.values(progress).filter((s) => s === "review").length;
  const unsolvedCount = totalProblems - solvedCount - reviewedCount;
  const topicNames = topics.map((t) => t.name);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <AppHeader
        solvedCount={solvedCount}
        totalProblems={totalProblems}
        topicCount={topics.length}
      />

      <div className="max-w-[1400px] mx-auto w-full flex-1 px-4 md:px-6 py-6">
        {/* FilterBar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          topicNames={topicNames}
          availableTags={availableTags}
        />

        {/* Asymmetric 70/30 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-6">
          {/* Main content — Topics */}
          <div className="space-y-4 min-w-0">
            {loading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : topics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-5">
                  <Database className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1.5">No problems loaded</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-5">
                  Firestore is empty. Seed your data to get started.
                </p>
                <code className="font-mono text-xs bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-muted-foreground">
                  npm run seed
                </code>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-5">
                  <SearchX className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1.5">No matches</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-5">
                  No problems match your current filters.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({ search: "", topic: null, difficulty: null, status: null, tags: [] })
                  }
                >
                  <Filter className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                  Clear all filters
                </Button>
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

          {/* Right stat rail — sticky */}
          <div className="hidden lg:block space-y-4">
            <div className="sticky top-24 space-y-4">
              <StatRailCard
                label="Total Solved"
                value={<span className="text-emerald">{solvedCount}</span>}
                sub={`of ${totalProblems} problems`}
              />
              <StatRailCard label="In Review" value={reviewedCount} />
              <StatRailCard label="Remaining" value={unsolvedCount} />

              {/* Topic breakdown */}
              <div className="p-4 rounded-[1rem] border border-white/5 bg-card">
                <div className="text-xs text-muted-foreground mb-3">Topics</div>
                <div className="space-y-2">
                  {topics.map((t) => {
                    const tTotal = t.patterns.reduce((a, p) => a + p.problems.length, 0);
                    const tSolved = t.patterns.reduce(
                      (a, p) => a + p.problems.filter((pr) => progress[pr.id] === "solved").length,
                      0
                    );
                    const pct = tTotal > 0 ? Math.round((tSolved / tTotal) * 100) : 0;
                    return (
                      <div key={t.id}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-foreground truncate pr-2">{t.name}</span>
                          <span className="font-mono text-muted-foreground shrink-0">
                            {tSolved}/{tTotal}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-emerald transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
