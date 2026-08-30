"use client";
import { Clock, AlertTriangle, CheckCircle2, Frown, Lightbulb, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { daysOverdue } from "@/lib/spaced-repetition";
import type { SpacedReviewDoc } from "@/lib/spaced-repetition";
import type { RecallStatus, MergedProblem } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

type DueItem = SpacedReviewDoc & { problemId: string };

type Props = {
  dueReviews: DueItem[];
  problemMap: Map<string, MergedProblem>;
  topicMap: Map<string, string>;
  patternMap: Map<string, string>;
  loading: boolean;
  error: string | null;
};

const recallBadge: Record<RecallStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  easy: {
    label: "easy",
    className: "bg-emerald/10 text-emerald border-emerald/15",
    icon: CheckCircle2,
  },
  hint: {
    label: "hint",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/15",
    icon: Lightbulb,
  },
  blank: {
    label: "blank",
    className: "bg-red-500/10 text-red-400 border-red-500/15",
    icon: Frown,
  },
};

function formatOverdue(nextReviewAt: Timestamp | Date | undefined): string {
  if (!nextReviewAt) return "";
  const overdue = daysOverdue(nextReviewAt as Timestamp, new Date());
  if (overdue <= 0) return "due today";
  if (overdue === 1) return "1 day overdue";
  return `${overdue} days overdue`;
}

export function DueForReviewSection({ dueReviews, problemMap, topicMap, patternMap, loading, error }: Props) {
  const handleSelect = (problemId: string) => {
    const el = document.getElementById(`problem-${problemId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-1", "ring-emerald/40", "bg-emerald/5");
      setTimeout(() => el.classList.remove("ring-1", "ring-emerald/40", "bg-emerald/5"), 1600);
    }
  };

  return (
    <section className="bezel-outer" aria-label="Due for review">
      <div className="bezel-inner overflow-hidden">
        {/* Header — pill */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center" aria-hidden="true">
              <Clock className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.25} />
            </div>
            <h3 className="text-[13px] font-semibold tracking-tight text-foreground">Due for Review</h3>
          </div>
          <Badge
            variant="outline"
            aria-label={`${dueReviews.length} due today`}
            className={`rounded-full text-[11px] px-2.5 py-1 font-mono border tabular-nums ${
              dueReviews.length > 0
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-white/[0.04] text-zinc-500 border-white/10"
            }`}
          >
            {dueReviews.length} due today
          </Badge>
        </div>

        {/* Content */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-none">
          {loading ? (
            <div className="p-4 space-y-3">
              <div className="h-14 w-full skeleton rounded-2xl" />
              <div className="h-14 w-full skeleton rounded-2xl" />
              <div className="h-14 w-full skeleton rounded-2xl" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/15 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={1.25} />
              </div>
              <p className="text-sm text-foreground font-medium">Failed to load reviews</p>
              <p className="text-xs text-zinc-500 mt-1">{error}</p>
            </div>
          ) : dueReviews.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald/10 border border-emerald/15 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald" strokeWidth={1.25} />
              </div>
              <p className="text-sm text-foreground font-medium">All caught up!</p>
              <p className="text-xs text-zinc-500 mt-1">No problems due for review. Keep solving.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {dueReviews.map((item) => {
                const problem = problemMap.get(item.problemId);
                const overdueText = formatOverdue(item.nextReviewAt);
                const recall = item.recallStatus as RecallStatus | null;
                const badgeCfg = recall ? recallBadge[recall] : null;
                const TopicName = problem ? topicMap.get(problem.topicId) ?? problem.topicId : "—";
                const PatternName = problem ? patternMap.get(problem.patternId) ?? problem.patternId : "—";
                const overdueDays = item.nextReviewAt ? daysOverdue(item.nextReviewAt as Timestamp) : 0;
                const overdueIntensity =
                  overdueDays > 3 ? "bg-red-500/[0.04]" : overdueDays > 1 ? "bg-amber-500/[0.03]" : "";

                return (
                  <button
                    key={item.problemId}
                    onClick={() => handleSelect(item.problemId)}
                    aria-label={`Jump to ${problem?.name ?? item.problemId}, ${overdueText}`}
                    className={`group w-full text-left px-4 py-3.5 hover:bg-white/[0.03] focus-visible:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:ring-inset transition-colors duration-200 ease-out flex items-center gap-3 ${overdueIntensity}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium tracking-tight text-zinc-100 truncate group-hover:text-white transition-colors">
                        {problem?.name ?? item.problemId}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/5 text-zinc-400">
                          {TopicName}
                        </span>
                        <span className="text-[11px] text-zinc-600">·</span>
                        <span className="text-[11px] text-zinc-500 truncate">{PatternName}</span>
                        <span className="text-[11px] text-zinc-600">·</span>
                        <span
                          className={`text-[11px] font-medium ${overdueDays > 3 ? "text-red-400" : overdueDays > 0 ? "text-amber-400" : "text-amber-400"}`}
                        >
                          {overdueText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {badgeCfg && (
                        <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0.5 gap-1 font-medium border ${badgeCfg.className}`}>
                          <badgeCfg.icon className="w-2.5 h-2.5" strokeWidth={1.25} />
                          {badgeCfg.label}
                        </Badge>
                      )}
                      {item.reviewCount !== undefined && (
                        <span className="text-[11px] font-mono text-zinc-500">×{item.reviewCount}</span>
                      )}
                      <span className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/5 group-hover:bg-white group-hover:text-black group-focus-visible:bg-white group-focus-visible:text-black flex items-center justify-center text-zinc-500 group-hover:border-white transition-all duration-200 ease-out group-hover:translate-x-[1px] group-hover:-translate-y-[1px] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
                        <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {dueReviews.length > 0 && !loading && !error && (
          <div className="px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.015] text-[11px] text-zinc-500 text-center">
            Sorted by most overdue first · Click to jump
          </div>
        )}
      </div>
    </section>
  );
}
