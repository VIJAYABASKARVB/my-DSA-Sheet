"use client";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProblems } from "@/hooks/useProblems";
import { useProgress } from "@/hooks/useProgress";
import { useProblemOverrides } from "@/hooks/useProblemOverrides";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { FilterBar, type Filters } from "@/components/FilterBar";
import { TopicAccordion } from "@/components/sheet/TopicAccordion";
import { AppHeader } from "@/components/AppHeader";
import { DueForReviewSection } from "@/components/sheet/DueForReviewSection";
import { SearchX, Database, Filter, LogIn, ShieldAlert, ArrowUpRight, Sparkles, Layers, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MergedProblem, Pattern } from "@/lib/types";

type MergedPatternGroup = { pattern: Pattern; problems: MergedProblem[] };
type MergedTopic = { id: string; name: string; patterns: MergedPatternGroup[] };

function SkeletonCard() {
  return (
    <div className="bezel-outer">
      <div className="bezel-inner p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 skeleton rounded-full" />
          <div className="h-4 w-20 skeleton rounded-full" />
        </div>
        <div className="h-1.5 w-full skeleton rounded-full" />
      </div>
    </div>
  );
}

function StatRailCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bezel-outer">
      <div className="bezel-inner p-5">
        <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-zinc-500 mb-2">{label}</div>
        <div className="text-[28px] font-mono font-semibold tracking-[-0.03em] leading-none text-foreground">
          {value}
        </div>
        {sub && <div className="text-xs text-zinc-500 mt-1.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function SheetPage() {
  const { user, loading: authLoading, signingIn, signInWithGoogle, signOut } = useAuth();
  const { topics, loading: problemsLoading } = useProblems(user?.uid ?? null);
  const { progress, updateStatus, loading: pLoading } = useProgress(user?.uid ?? null);
  const { overrides, updateLinks, updateTags, loading: oLoading } = useProblemOverrides(user?.uid ?? null);
  const { reviews, dueReviews, dueCount, updateRecall, loading: srLoading, error: srError } = useSpacedRepetition(user?.uid ?? null);
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
  const pct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Maps for DueForReviewSection
  const { problemMap, topicMap, patternMap } = useMemo(() => {
    const pMap = new Map<string, MergedProblem>();
    const tMap = new Map<string, string>();
    const patMap = new Map<string, string>();
    for (const t of topics) tMap.set(t.id, t.name);
    for (const t of mergedTopics) {
      for (const grp of t.patterns) {
        patMap.set(grp.pattern.id, grp.pattern.name);
        for (const prob of grp.problems) pMap.set(prob.id, prob);
      }
    }
    return { problemMap: pMap, topicMap: tMap, patternMap: patMap };
  }, [topics, mergedTopics]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <AppHeader
        solvedCount={solvedCount}
        totalProblems={totalProblems}
        topicCount={topics.length}
        dueCount={dueCount}
        user={user}
        authLoading={authLoading}
        signingIn={signingIn}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
      />

      <div id="sheet-content" className="max-w-[1160px] mx-auto w-full flex-1 px-4 md:px-6" tabIndex={-1}>
        {/* HERO — product-restrained, tighter than brand hero: py-12 breathing */}
        <section className="py-10 md:py-16 border-b border-white/[0.04] mb-8" aria-labelledby="hero-title">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="eyebrow w-fit">
                <Sparkles className="w-3 h-3" strokeWidth={1.25} aria-hidden="true" />
                CURATED FOR DEPTH · NOT SPRAWL
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald text-white text-[10px] tracking-wide font-semibold px-2.5 py-1">
                VANGUARD EDITION
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-zinc-500">
                <span className="w-1 h-1 rounded-full bg-emerald animate-pulse" aria-hidden="true" /> Live
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-[640px]">
                <h1 id="hero-title" className="font-[var(--font-instrument-serif)] text-[clamp(2rem,5.5vw,3.5rem)] leading-[0.92] tracking-[-0.04em] text-foreground">
                  Your DSA
                  <span className="font-mono text-[0.5em] tracking-[-0.02em] font-light text-zinc-500 ml-2.5 align-middle" aria-hidden="true">—</span>
                  <br />
                  <span className="text-emerald">Sheet</span>
                  <span className="text-zinc-500">, perfected.</span>
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400 max-w-[54ch]">
                  Striver and NeetCode, merged and ordered. Topic → Pattern → Problem with spaced repetition and Firestore sync. Built for depth, not sprawl.
                </p>
              </div>

              {/* Metric cluster — dense product, one line, no double pill */}
              <div className="flex items-center gap-3 flex-wrap lg:justify-end shrink-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/5 p-1 pr-1.5" aria-label={`${pct}% complete, ${solvedCount} of ${totalProblems} solved`}>
                  <span className="px-3 py-1.5 rounded-full bg-emerald text-white text-xs font-mono font-medium flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" strokeWidth={1.25} aria-hidden="true" /> {pct}% done
                  </span>
                  <span className="pl-2 pr-2 text-xs font-mono text-zinc-400 tabular-nums">
                    <span className="text-foreground font-medium">{solvedCount}</span> / {totalProblems}
                  </span>
                  <span className="hidden sm:inline h-4 w-px bg-white/10 mx-1" aria-hidden="true" />
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-500 pr-2">
                    <Layers className="w-3.5 h-3.5" strokeWidth={1.25} aria-hidden="true" />
                    <span className="font-mono text-foreground">{topics.length}</span> topics
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Auth gate — amber, now compact */}
        {!authLoading && !user && (
          <div className="mb-6 bezel-outer !bg-amber-500/[0.06] !border-amber-500/15" role="status" aria-live="polite">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#1A1508]/80 border border-amber-500/10 px-4 md:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0" aria-hidden="true">
                  <ShieldAlert className="w-4 h-4 text-amber-400" strokeWidth={1.25} />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight text-foreground">Sign in to sync across devices</div>
                  <div className="text-xs leading-relaxed text-zinc-400 mt-0.5 max-w-[60ch]">
                    Progress in <code className="font-mono text-amber-300/80 bg-amber-500/10 px-1 py-0.5 rounded text-[11px]">users/{`{uid}`}/progress</code> · Follow your Gmail. Without sign-in, changes reset on refresh.
                  </div>
                </div>
              </div>
              <button
                onClick={signInWithGoogle}
                disabled={signingIn}
                aria-label="Sign in with Google to enable sync"
                className="group inline-flex items-center gap-1 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold pl-4 pr-1 py-1 shrink-0 transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
              >
                <LogIn className="w-3.5 h-3.5" strokeWidth={1.25} aria-hidden="true" />
                {signingIn ? "Signing in…" : "Sign in with Google"}
                <span className="w-7 h-7 rounded-full bg-black text-amber-400 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 ease-out ml-1.5" aria-hidden="true">
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* FilterBar — double-bezel already */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          topicNames={topicNames}
          availableTags={availableTags}
        />

        {/* Due for Review — mobile */}
        <div className="lg:hidden mt-6">
          <DueForReviewSection
            dueReviews={dueReviews}
            problemMap={problemMap}
            topicMap={topicMap}
            patternMap={patternMap}
            loading={srLoading}
            error={srError}
          />
        </div>

        {/* Main + stat rail */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 md:gap-8 mt-6 pb-24">
          {/* Main — Topics */}
          <main className="space-y-4 min-w-0" aria-label="Problem topics">
            {loading ? (
              <div className="space-y-4" aria-busy="true" aria-live="polite">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : topics.length === 0 ? (
              <div className="bezel-outer">
                <div className="bezel-inner flex flex-col items-center justify-center py-16 md:py-20 text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center mb-5" aria-hidden="true">
                    <Database className="w-7 h-7 text-zinc-500" strokeWidth={1.25} />
                  </div>
                  <h2 className="font-[var(--font-instrument-serif)] text-xl tracking-tight text-foreground mb-2">No problems loaded</h2>
                  <p className="text-sm text-zinc-500 max-w-sm mb-6 leading-relaxed">
                    Firestore is empty. Seed your data to get started — vanguard edition awaits.
                  </p>
                  <code className="font-mono text-xs bg-white/[0.04] border border-white/5 rounded-full px-4 py-2 text-zinc-400">
                    npm run seed
                  </code>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bezel-outer">
                <div className="bezel-inner flex flex-col items-center justify-center py-16 md:py-20 text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center mb-5" aria-hidden="true">
                    <SearchX className="w-7 h-7 text-zinc-500" strokeWidth={1.25} />
                  </div>
                  <h2 className="font-[var(--font-instrument-serif)] text-xl tracking-tight text-foreground mb-2">No matches</h2>
                  <p className="text-sm text-zinc-500 max-w-sm mb-6">No problems match your current filters. Adjust or clear to rediscover.</p>
                  <button
                    onClick={() => setFilters({ search: "", topic: null, difficulty: null, status: null, tags: [] })}
                    aria-label="Clear all filters"
                    className="group inline-flex items-center gap-1 rounded-full bg-white text-black text-sm font-medium pl-4 pr-1 py-1 hover:bg-zinc-100 transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <Filter className="w-3.5 h-3.5" strokeWidth={1.25} aria-hidden="true" />
                    Clear all filters
                    <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true">
                      <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              filtered.map((topic, idx) => (
                <div
                  key={topic.id}
                  className="reveal"
                  style={{ transitionDelay: `${idx * 80}ms` }}
                  ref={(el) => {
                    if (!el) return;
                    const obs = new IntersectionObserver(
                      (entries) => {
                        entries.forEach((e) => {
                          if (e.isIntersecting) {
                            e.target.classList.add("in-view");
                            obs.unobserve(e.target);
                          }
                        });
                      },
                      { threshold: 0.12 }
                    );
                    obs.observe(el);
                  }}
                >
                  <TopicAccordion
                    topic={{ id: topic.id, name: topic.name }}
                    patterns={topic.patterns}
                    progress={progress}
                    spacedReviews={reviews}
                    onStatusChange={updateStatus}
                    onRecallChange={updateRecall}
                    onEditLinks={updateLinks}
                    onEditTags={updateTags}
                  />
                </div>
              ))
            )}
          </main>

          {/* Right rail — sticky */}
          <aside className="hidden lg:block space-y-4" aria-label="Progress summary">
            <div className="sticky top-[88px] space-y-4">
              <DueForReviewSection
                dueReviews={dueReviews}
                problemMap={problemMap}
                topicMap={topicMap}
                patternMap={patternMap}
                loading={srLoading}
                error={srError}
              />
              <StatRailCard
                label="Total Solved"
                value={<span className="text-emerald">{solvedCount}</span>}
                sub={`of ${totalProblems} problems · ${pct}% complete`}
              />
              <div className="grid grid-cols-2 gap-3">
                <StatRailCard label="In Review" value={<span className="text-amber-400">{reviewedCount}</span>} />
                <StatRailCard label="Remaining" value={<span className="text-zinc-400">{unsolvedCount}</span>} />
              </div>

              {/* Topic breakdown — bezel */}
              <div className="bezel-outer">
                <div className="bezel-inner p-5">
                  <div className="eyebrow mb-4 !bg-white/[0.04] !text-zinc-400 !border-white/5">
                    <Layers className="w-3 h-3" strokeWidth={1.25} /> Topics
                  </div>
                  <div className="space-y-3.5">
                    {topics.map((t) => {
                      const tTotal = t.patterns.reduce((a, p) => a + p.problems.length, 0);
                      const tSolved = t.patterns.reduce(
                        (a, p) => a + p.problems.filter((pr) => progress[pr.id] === "solved").length,
                        0
                      );
                      const pctT = tTotal > 0 ? Math.round((tSolved / tTotal) * 100) : 0;
                      return (
                        <div key={t.id}>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-foreground truncate pr-2 font-medium">{t.name}</span>
                            <span className="font-mono text-zinc-500 shrink-0">
                              {tSolved}/{tTotal}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/[0.04] border border-white/[0.03] overflow-hidden p-0.5">
                            <div
                              className="h-full rounded-full bg-emerald transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                              style={{ width: `${pctT}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-2 py-3 text-center border-t border-white/[0.04] mt-1">
                <p className="text-[11px] leading-relaxed text-zinc-600">
                  Vanguard Edition · Ethereal Glass ·<br />
                  <span className="font-mono text-zinc-500">obsessive archive — depth, not sprawl</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
