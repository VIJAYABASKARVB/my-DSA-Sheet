"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProblems } from "@/hooks/useProblems";
import { useProgress } from "@/hooks/useProgress";
import { useProblemOverrides } from "@/hooks/useProblemOverrides";
import { useRevisionSchedule } from "@/hooks/useRevisionSchedule";
import { useNotesIndex } from "@/hooks/useNotesIndex";
import { FilterBar, type Filters } from "@/components/FilterBar";
import { TopicAccordion } from "@/components/sheet/TopicAccordion";
import { AppHeader } from "@/components/AppHeader";
import { DueForReviewSection } from "@/components/sheet/DueForReviewSection";
import type { MergedProblem, Pattern, Status, RevisionSchedule } from "@/lib/types";
import { toast } from "sonner";
import { restoreProgressWithSchedule } from "@/lib/firestore";
import { LayoutList, Clock3 } from "lucide-react";

type MergedPatternGroup = { pattern: Pattern; problems: MergedProblem[] };
type MergedTopic = { id: string; name: string; patterns: MergedPatternGroup[] };

function SkeletonCard() {
  return (
    <div className="rounded-[12px] border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 skeleton rounded-[6px]" />
        <div className="h-3 w-16 skeleton rounded-full" />
      </div>
      <div className="h-1.5 w-full skeleton rounded-full" />
    </div>
  );
}

function StatRailCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-[12px] border border-border bg-card p-5">
      <div className="text-[10px] tracking-[0.08em] uppercase font-medium text-muted-foreground font-mono mb-2">{label}</div>
      <div className="text-[26px] font-mono font-semibold tracking-[-0.03em] leading-none text-foreground">
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-1.5">{sub}</div>}
    </div>
  );
}

export default function SheetPage() {
  const { user, loading: authLoading, signingIn, signInWithGoogle, signOut } = useAuth();
  const { topics, loading: problemsLoading } = useProblems(user?.uid ?? null);
  const { progress, updateStatus, optimisticRemove, optimisticRestore, loading: pLoading } = useProgress(user?.uid ?? null);
  const { overrides, updateLinks, updateTags, loading: oLoading } = useProblemOverrides(user?.uid ?? null);
  const { revisions, dueToday, upcoming, dueCount, markRevisionDone, removeRevision, restoreRevision, loading: srLoading, error: srError } = useRevisionSchedule(user?.uid ?? null);
  const { notedProblemIds } = useNotesIndex(user?.uid ?? null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    topic: null,
    difficulty: null,
    status: null,
    tags: [],
  });
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [expandedPatterns, setExpandedPatterns] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<"sheet" | "revisions">("sheet");

  // Restore toggle preference (sheet ↔ revisions)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sheet:activeView") as "sheet" | "revisions" | null;
      if (saved === "sheet" || saved === "revisions") setActiveView(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("sheet:activeView", activeView);
    } catch {}
  }, [activeView]);

  // Keep topics expanded by default when they first load
  useEffect(() => {
    if (topics.length > 0 && expandedTopics.length === 0) {
      setExpandedTopics(topics.map((t) => t.id));
    }
  }, [topics, expandedTopics.length]);

  useEffect(() => {
    const el = document.getElementById("filter-sticky");
    if (!el) return;
    const onScroll = () => {
      const scrolled = window.scrollY > 120;
      el.setAttribute("data-scrolled", String(scrolled));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  const completedCount = solvedCount + reviewedCount;
  const unsolvedCount = totalProblems - completedCount;
  const topicNames = topics.map((t) => t.name);
  const pct = totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0;

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

  // Navigate from revision rail to problem row: auto-expand topic+pattern, clear filters if hidden, scroll & highlight
  const handleNavigateToProblem = useCallback(
    (problemId: string) => {
      const prob = problemMap.get(problemId);
      if (!prob) {
        toast.error("Problem not found: " + problemId);
        return;
      }
      // Switch to sheet view if currently on revisions — fixes navigation when toggle separates views
      setActiveView((prev) => (prev === "revisions" ? "sheet" : prev));
      // If filtered hides the problem, clear filters so it becomes visible
      const inFiltered = filtered.some((t) =>
        t.patterns.some((g) => g.problems.some((p) => p.id === problemId))
      );
      if (!inFiltered) {
        setFilters({ search: "", topic: null, difficulty: null, status: null, tags: [] });
        toast("Filters cleared to show problem");
      }
      // Ensure topic + pattern are expanded
      setExpandedTopics((prev) => (prev.includes(prob.topicId) ? prev : [...prev, prob.topicId]));
      setExpandedPatterns((prev) => (prev.includes(prob.patternId) ? prev : [...prev, prob.patternId]));

      // Wait for React to render filtered + expanded accordions, then scroll
      // Extra delay when switching from revisions tab
      const doScroll = (attempt = 0) => {
        const el = document.getElementById(`problem-${problemId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-1", "ring-ring/20", "bg-muted");
          // Make focusable for a11y
          if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
          try {
            (el as HTMLElement).focus({ preventScroll: true });
          } catch {}
          setTimeout(() => el.classList.remove("ring-1", "ring-ring/20", "bg-muted"), 1600);
        } else if (attempt < 4) {
          setTimeout(() => doScroll(attempt + 1), 180);
        }
      };
      // 200ms when tab switch needed, else 120ms
      const delay = activeView === "revisions" ? 200 : 120;
      setTimeout(() => doScroll(0), delay);
    },
    [problemMap, filtered, activeView]
  );

  // Hard-delete with 5s Undo: solved -> unsolved accidentally
  const handleStatusChange = useCallback(
    (problemId: string, next: Status) => {
      const prevStatus = (progress[problemId] ?? "unsolved") as Status;
      const prevSchedule = revisions[problemId] as RevisionSchedule | undefined;

      // Only intercept accidental uncheck: solved (with schedule) -> unsolved
      if (prevStatus === "solved" && next === "unsolved" && prevSchedule) {
        if (!user?.uid) {
          // Not signed in — fallback to plain toggle (no persistence)
          updateStatus(problemId, next);
          return;
        }
        const problemName = problemMap.get(problemId)?.name ?? problemId;
        const backupSchedule: RevisionSchedule = {
          ...prevSchedule,
          revisionDates: [...prevSchedule.revisionDates],
          completedRevisions: [...(prevSchedule.completedRevisions ?? [])],
        };
        // Snapshot to avoid mutation after optimistic delete
        const backupStatus: Exclude<Status, "unsolved"> = "solved";

        // Optimistic immediate removal from UI (both progress + revision rail)
        optimisticRemove(problemId);
        removeRevision(problemId);

        // Persist hard-delete
        void updateStatus(problemId, next);

        // Show Undo toast (5s)
        toast(`Removed "${problemName}"`, {
          description: "Hard-deleted from revisions. Undo within 5s.",
          duration: 5000,
          action: {
            label: "Undo",
            onClick: async () => {
              // Optimistic restore
              optimisticRestore(problemId, backupStatus);
              restoreRevision(problemId, backupSchedule);
              try {
                await restoreProgressWithSchedule(problemId, backupStatus, backupSchedule, user.uid);
                toast.success(`Restored "${problemName}"`);
              } catch (e) {
                const msg = (e as Error).message ?? String(e);
                console.error("[sheet] restore failed", e);
                toast.error("Failed to restore: " + msg);
                // Revert optimistic restore on failure
                optimisticRemove(problemId);
                removeRevision(problemId);
              }
            },
          },
        });
        return;
      }

      // Generic hard-delete without schedule (e.g., review -> unsolved) — also hard-delete
      if (next === "unsolved" && (prevStatus === "review" || prevStatus === "solved")) {
        // Ensure revision also removed optimistically even if no schedule captured (covers orphan)
        if (revisions[problemId]) removeRevision(problemId);
      }

      updateStatus(problemId, next);
    },
    [progress, revisions, problemMap, user, updateStatus, optimisticRemove, optimisticRestore, removeRevision, restoreRevision]
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <AppHeader
        solvedCount={solvedCount}
        reviewedCount={reviewedCount}
        completedCount={completedCount}
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
        {/* HERO — minimal editorial */}
        <section className="relative py-6 sm:py-10 md:py-14 border-b border-border mb-6 sm:mb-8" aria-labelledby="hero-title">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-[720px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">Curated for depth · not sprawl</span>
                <Link href="/" className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors border-l border-border pl-2.5 ml-1">
                  ← Back to home
                </Link>
              </div>
              <h1 id="hero-title" className="mt-3 sm:mt-4 font-[var(--font-newsreader)] text-[clamp(1.65rem,5vw,2.6rem)] leading-[0.98] tracking-[-0.03em] text-foreground text-balance">
                Your DSA <span className="italic font-[300] text-muted-foreground">Sheet</span>, perfected.
              </h1>
              <p className="mt-2 sm:mt-2.5 text-[13px] leading-relaxed text-muted-foreground max-w-[58ch] text-pretty">
                Striver and NeetCode, merged and ordered. Topic → Pattern → Problem with spaced repetition and Firestore sync. Built for depth, not sprawl.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap lg:justify-end shrink-0">
              <div className="inline-flex items-center gap-3 rounded-[8px] border border-border bg-card px-3 py-2" aria-label={`${pct}% complete`}>
                <span className="text-[11px] font-mono tracking-wide px-2.5 py-1 rounded-[6px] bg-primary text-primary-foreground font-medium tabular-nums">{pct}% done</span>
                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                  <span className="text-foreground font-medium">{completedCount}</span> / {totalProblems}
                  <span className="hidden sm:inline text-muted-foreground/60 ml-1">({solvedCount} solved · {reviewedCount} review)</span>
                </span>
                <span className="hidden sm:block w-px h-4 bg-border" aria-hidden="true" />
                <span className="hidden sm:inline-flex text-xs text-muted-foreground gap-1">
                  <span className="font-mono text-foreground font-medium">{topics.length}</span> topics
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Auth gate — pale yellow */}
        {!authLoading && !user && (
          <div className="mb-6 rounded-[12px] border border-border bg-[#FBF3DB] dark:bg-[#FBF3DB]/16 px-4 md:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3" role="status" aria-live="polite">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[6px] bg-card border border-border flex items-center justify-center shrink-0 text-[#956400] dark:text-[#EAB308] text-xs" aria-hidden="true">
                !
              </div>
              <div>
                <div className="text-sm font-medium tracking-tight text-foreground">Sign in to sync across devices</div>
                <div className="text-xs leading-relaxed text-muted-foreground mt-0.5 max-w-[60ch]">
                  Progress in <code className="font-mono text-[#956400] dark:text-[#EAB308] bg-card border border-border px-1 py-0.5 rounded text-[11px]">users/{`{uid}`}/progress</code> · Without sign-in, changes reset on refresh.
                </div>
              </div>
            </div>
            <button
              onClick={signInWithGoogle}
              disabled={signingIn}
              aria-label="Sign in with Google to enable sync"
              className="inline-flex items-center justify-center rounded-[6px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium px-4 py-2 shrink-0 transition-colors active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            >
              {signingIn ? "Signing in…" : "Sign in with Google"}
            </button>
          </div>
        )}

        {/* Sticky filtering card — toggle inside header (right), body is FilterBar */}
        <div
          className="sticky top-[56px] z-10 -mx-4 px-4 sm:-mx-1 sm:px-1 py-2 -mt-2 bg-background/85 backdrop-blur-[8px] border-b border-transparent data-[scrolled=true]:border-border data-[scrolled=true]:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:data-[scrolled=true]:shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-all duration-300 supports-[backdrop-filter]:bg-background/80"
          id="filter-sticky"
        >
          <div className="rounded-[12px] border border-border bg-card overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between gap-2 px-3 md:px-4 py-2 border-b border-border bg-muted/20">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wide text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                Filters
              </span>
              <span className="sm:hidden text-[11px] font-mono tracking-wide text-muted-foreground">Filters</span>
              <div
                role="tablist"
                aria-label="Sheet or revisions view"
                className="ml-auto inline-flex items-center gap-1 p-1 rounded-[10px] border border-border bg-muted"
              >
                <button
                  role="tab"
                  aria-selected={activeView === "sheet"}
                  aria-controls="sheet-panel"
                  id="tab-sheet"
                  onClick={() => setActiveView("sheet")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
                    activeView === "sheet"
                      ? "bg-card border border-border text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                  Sheet
                  <span className="hidden sm:inline ml-1 font-mono text-[11px] tabular-nums opacity-60">
                    {filtered.length > 0 ? `${filtered.reduce((a, t) => a + t.patterns.reduce((x, g) => x + g.problems.length, 0), 0)}/${totalProblems}` : `${totalProblems}`}
                  </span>
                </button>
                <button
                  role="tab"
                  aria-selected={activeView === "revisions"}
                  aria-controls="revisions-panel"
                  id="tab-revisions"
                  onClick={() => setActiveView("revisions")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
                    activeView === "revisions"
                      ? "bg-card border border-border text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock3 className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                  Revisions
                  <span className="inline-flex items-center gap-1 ml-1">
                    {dueCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#FDEBEC] dark:bg-[#FDEBEC]/16 border border-border text-[#9F2F2D] dark:text-[#FCA5A5] text-[10px] font-mono leading-none">
                        {dueCount} due
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground text-[10px] font-mono leading-none">
                        {upcoming.length}
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
            {activeView === "sheet" && (
              <div className="p-3 md:p-4">
                <FilterBar filters={filters} setFilters={setFilters} topicNames={topicNames} availableTags={availableTags} headerless />
              </div>
            )}
          </div>
        </div>

        {activeView === "sheet" ? (
          <div className="mt-6 pb-24" id="sheet-panel" role="tabpanel" aria-labelledby="tab-sheet">
          <main className="space-y-3 min-w-0" aria-label="Problem topics">
            {loading ? (
              <div className="space-y-3" aria-busy="true" aria-live="polite">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : topics.length === 0 ? (
              <div className="rounded-[12px] border border-border bg-card flex flex-col items-center justify-center py-10 sm:py-14 text-center p-6 sm:p-8">
                <div className="w-12 h-12 rounded-[8px] bg-muted border border-border flex items-center justify-center mb-4 text-muted-foreground text-sm" aria-hidden="true">
                  ◻
                </div>
                <h2 className="font-[var(--font-newsreader)] text-xl tracking-tight text-foreground mb-1.5">No problems loaded</h2>
                <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed text-pretty">Firestore is empty. Seed your data to get started.</p>
                <code className="font-mono text-xs bg-muted border border-border rounded-[6px] px-3 py-1.5 text-muted-foreground">npm run seed</code>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[12px] border border-border bg-card flex flex-col items-center justify-center py-10 sm:py-14 text-center p-6 sm:p-8">
                <div className="w-12 h-12 rounded-[8px] bg-muted border border-border flex items-center justify-center mb-4 text-muted-foreground text-sm" aria-hidden="true">
                  ⌕
                </div>
                <h2 className="font-[var(--font-newsreader)] text-xl tracking-tight text-foreground mb-1.5">No matches</h2>
                <p className="text-sm text-muted-foreground max-w-sm mb-5 text-pretty">No problems match your current filters. Adjust or clear to rediscover.</p>
                <button
                  onClick={() => setFilters({ search: "", topic: null, difficulty: null, status: null, tags: [] })}
                  aria-label="Clear all filters"
                  className="inline-flex items-center gap-2 rounded-[6px] bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filtered.map((topic, idx) => (
                <div
                  key={topic.id}
                  className="reveal"
                  style={{ transitionDelay: `${Math.min(idx * 40, 120)}ms` } as React.CSSProperties}
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
                    revisions={revisions}
                    expandedTopics={expandedTopics}
                    expandedPatterns={expandedPatterns}
                    onExpandedTopicsChange={setExpandedTopics}
                    onExpandedPatternsChange={setExpandedPatterns}
                    onStatusChange={handleStatusChange}
                    onMarkRevised={markRevisionDone}
                    onEditLinks={updateLinks}
                    onEditTags={updateTags}
                    notedProblemIds={notedProblemIds}
                  />
                </div>
              ))
            )}
          </main>
          </div>
        ) : (
          <div className="mt-6 pb-24" id="revisions-panel" role="tabpanel" aria-labelledby="tab-revisions">
            <div className="max-w-[860px] mx-auto space-y-6">
              <DueForReviewSection
                dueToday={dueToday}
                upcoming={upcoming}
                problemMap={problemMap}
                topicMap={topicMap}
                patternMap={patternMap}
                loading={srLoading}
                error={srError}
                onMarkRevised={markRevisionDone}
                onSelectProblem={handleNavigateToProblem}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatRailCard
                  label="Completed"
                  value={<span className="text-foreground">{completedCount}</span>}
                  sub={`of ${totalProblems} · ${pct}% · ${solvedCount} solved · ${reviewedCount} review`}
                />
                <StatRailCard label="In Review" value={<span className="text-[#956400] dark:text-[#EAB308]">{reviewedCount}</span>} />
                <StatRailCard label="Remaining" value={<span className="text-muted-foreground">{unsolvedCount}</span>} />
              </div>

              <div className="rounded-[12px] border border-border bg-card p-5">
                <div className="eyebrow mb-4">Topics</div>
                <div className="space-y-3.5">
                  {topics.map((t) => {
                    const tTotal = t.patterns.reduce((a, p) => a + p.problems.length, 0);
                    const tCompleted = t.patterns.reduce(
                      (a, p) => a + p.problems.filter((pr) => progress[pr.id] === "solved" || progress[pr.id] === "review").length,
                      0
                    );
                    const pctT = tTotal > 0 ? Math.round((tCompleted / tTotal) * 100) : 0;
                    return (
                      <div key={t.id}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-foreground truncate pr-2 font-medium">{t.name}</span>
                          <span className="font-mono text-muted-foreground shrink-0 tabular-nums">
                            {tCompleted}/{tTotal}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary border border-border overflow-hidden" role="progressbar" aria-valuenow={pctT} aria-valuemin={0} aria-valuemax={100} aria-label={`${pctT}% of ${t.name} complete`}>
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            style={{ width: `${pctT}%`, minWidth: pctT > 0 ? '4px' : '0' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-2 py-3 text-center border-t border-border mt-1">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Minimal Archive · Warm monochrome ·<br />
                  <span className="font-mono">depth, not sprawl</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
