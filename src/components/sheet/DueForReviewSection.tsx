"use client";
import { Clock, AlertTriangle, CheckCircle2, Frown, Lightbulb, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { daysOverdue } from "@/lib/spaced-repetition";
import type { SpacedReviewDoc } from "@/lib/spaced-repetition";
import type { RecallStatus, MergedProblem } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

type DueItem = SpacedReviewDoc & { problemId: string };

type Props = {
  dueReviews: DueItem[];
  problemMap: Map<string, MergedProblem>;
  topicMap: Map<string, string>; // topicId -> topicName
  patternMap: Map<string, string>; // patternId -> patternName
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
      // brief highlight
      el.classList.add("ring-1", "ring-emerald/40", "bg-emerald/5");
      setTimeout(() => el.classList.remove("ring-1", "ring-emerald/40", "bg-emerald/5"), 1600);
    }
  };

  return (
    <div className="rounded-[1.25rem] border border-white/5 bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Due for Review</h3>
        </div>
        <Badge
          variant="outline"
          className={
            dueReviews.length > 0
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20 text-[11px]"
              : "bg-white/5 text-muted-foreground border-white/10 text-[11px]"
          }
        >
          {dueReviews.length} due today
        </Badge>
      </div>

      {/* Content */}
      <div className="max-h-[480px] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            <div className="h-12 w-full skeleton rounded-xl" />
            <div className="h-12 w-full skeleton rounded-xl" />
            <div className="h-12 w-full skeleton rounded-xl" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-foreground font-medium">Failed to load reviews</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        ) : dueReviews.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/15 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-foreground font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No problems due for review. Keep solving.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {dueReviews.map((item) => {
              const problem = problemMap.get(item.problemId);
              const overdueText = formatOverdue(item.nextReviewAt);
              const recall = item.recallStatus as RecallStatus | null;
              const badgeCfg = recall ? recallBadge[recall] : null;
              const TopicName = problem ? topicMap.get(problem.topicId) ?? problem.topicId : "—";
              const PatternName = problem ? patternMap.get(problem.patternId) ?? problem.patternId : "—";
              const overdueDays = item.nextReviewAt ? daysOverdue(item.nextReviewAt as Timestamp) : 0;
              // intensity for row bg based on overdue
              const overdueIntensity = overdueDays > 3 ? "bg-red-500/[0.04]" : overdueDays > 1 ? "bg-amber-500/[0.03]" : "";

              return (
                <button
                  key={item.problemId}
                  onClick={() => handleSelect(item.problemId)}
                  className={`w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors flex items-center gap-3 group ${overdueIntensity}`}
                >
                  {/* left */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate group-hover:text-white transition-colors">
                      {problem?.name ?? item.problemId}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-zinc-400">
                        {TopicName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground truncate">{PatternName}</span>
                      {overdueDays > 0 && (
                        <>
                          <span className="text-[11px] text-muted-foreground">·</span>
                          <span
                            className={`text-[11px] font-medium ${overdueDays > 3 ? "text-red-400" : overdueDays > 0 ? "text-amber-400" : "text-muted-foreground"}`}
                          >
                            {overdueText}
                          </span>
                        </>
                      )}
                      {overdueDays <= 0 && (
                        <>
                          <span className="text-[11px] text-muted-foreground">·</span>
                          <span className="text-[11px] text-amber-400">{overdueText}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* right badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {badgeCfg && (
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-1 ${badgeCfg.className}`}>
                        <badgeCfg.icon className="w-2.5 h-2.5" strokeWidth={1.5} />
                        {badgeCfg.label}
                      </Badge>
                    )}
                    {item.reviewCount !== undefined && (
                      <span className="text-[11px] font-mono text-muted-foreground">×{item.reviewCount}</span>
                    )}
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" strokeWidth={1.5} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {dueReviews.length > 0 && !loading && !error && (
        <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.01] text-[11px] text-muted-foreground text-center">
          Sorted by most overdue first · Click to jump to problem
        </div>
      )}
    </div>
  );
}
