"use client";
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

const recallBadge: Record<RecallStatus, { label: string; className: string }> = {
  easy: {
    label: "easy",
    className: "bg-[#EDF3EC] text-[#346538] border-[#EAEAEA]",
  },
  hint: {
    label: "hint",
    className: "bg-[#FBF3DB] text-[#956400] border-[#EAEAEA]",
  },
  blank: {
    label: "blank",
    className: "bg-[#FDEBEC] text-[#9F2F2D] border-[#EAEAEA]",
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
      el.classList.add("ring-1", "ring-[#111111]/20", "bg-[#F7F6F3]");
      setTimeout(() => el.classList.remove("ring-1", "ring-[#111111]/20", "bg-[#F7F6F3]"), 1600);
    }
  };

  return (
    <section className="rounded-[12px] border border-[#EAEAEA] bg-white overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} aria-label="Due for review">
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#EAEAEA] bg-[#FBFBFA]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[6px] bg-[#FBF3DB] border border-[#EAEAEA] flex items-center justify-center text-[11px]" aria-hidden="true">
            ◷
          </div>
          <h3 className="text-[13px] font-medium tracking-tight text-[#111111]">Due for Review</h3>
        </div>
        <Badge
          variant="outline"
          aria-label={`${dueReviews.length} due today`}
          className={`rounded-full text-[11px] px-2.5 py-1 font-mono border tabular-nums ${
            dueReviews.length > 0
              ? "bg-[#FBF3DB] text-[#956400] border-[#EAEAEA]"
              : "bg-[#F7F6F3] text-[#787774] border-[#EAEAEA]"
          }`}
        >
          {dueReviews.length} due
        </Badge>
      </div>

      <div className="max-h-[420px] overflow-y-auto scrollbar-none">
        {loading ? (
          <div className="p-4 space-y-3">
            <div className="h-14 w-full skeleton rounded-[8px]" />
            <div className="h-14 w-full skeleton rounded-[8px]" />
            <div className="h-14 w-full skeleton rounded-[8px]" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-9 h-9 rounded-[6px] bg-[#FDEBEC] border border-[#EAEAEA] flex items-center justify-center mx-auto mb-3 text-[#9F2F2D] text-sm">!</div>
            <p className="text-sm text-[#111111] font-medium">Failed to load reviews</p>
            <p className="text-xs text-[#787774] mt-1">{error}</p>
          </div>
        ) : dueReviews.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-9 h-9 rounded-[6px] bg-[#EDF3EC] border border-[#EAEAEA] flex items-center justify-center mx-auto mb-3 text-[#346538] text-sm">✓</div>
            <p className="text-sm text-[#111111] font-medium">All caught up!</p>
            <p className="text-xs text-[#787774] mt-1">No problems due for review. Keep solving.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAEAEA]">
            {dueReviews.map((item) => {
              const problem = problemMap.get(item.problemId);
              const overdueText = formatOverdue(item.nextReviewAt);
              const recall = item.recallStatus as RecallStatus | null;
              const badgeCfg = recall ? recallBadge[recall] : null;
              const TopicName = problem ? topicMap.get(problem.topicId) ?? problem.topicId : "—";
              const PatternName = problem ? patternMap.get(problem.patternId) ?? problem.patternId : "—";
              const overdueDays = item.nextReviewAt ? daysOverdue(item.nextReviewAt as Timestamp) : 0;
              const overdueBg = overdueDays > 3 ? "bg-[#FDEBEC]/60" : overdueDays > 1 ? "bg-[#FBF3DB]/50" : "";

              return (
                <button
                  key={item.problemId}
                  onClick={() => handleSelect(item.problemId)}
                  aria-label={`Jump to ${problem?.name ?? item.problemId}, ${overdueText}`}
                  className={`group w-full text-left px-4 py-3.5 hover:bg-[#F7F6F3] focus-visible:bg-[#F7F6F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/10 focus-visible:ring-inset transition-colors flex items-center gap-3 ${overdueBg}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium tracking-tight text-[#111111] truncate group-hover:text-[#2F3437] transition-colors">
                      {problem?.name ?? item.problemId}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F7F6F3] border border-[#EAEAEA] text-[#787774]">
                        {TopicName}
                      </span>
                      <span className="text-[11px] text-[#EAEAEA]">·</span>
                      <span className="text-[11px] text-[#787774] truncate">{PatternName}</span>
                      <span className="text-[11px] text-[#EAEAEA]">·</span>
                      <span className={`text-[11px] font-medium ${overdueDays > 3 ? "text-[#9F2F2D]" : overdueDays > 0 ? "text-[#956400]" : "text-[#956400]"}`}>
                        {overdueText}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {badgeCfg && (
                      <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0.5 font-medium border ${badgeCfg.className}`}>
                        {badgeCfg.label}
                      </Badge>
                    )}
                    {item.reviewCount !== undefined && (
                      <span className="text-[11px] font-mono text-[#787774]">×{item.reviewCount}</span>
                    )}
                    <span className="w-6 h-6 rounded-[6px] border border-[#EAEAEA] bg-white group-hover:bg-[#111111] group-hover:text-white group-hover:border-[#111111] flex items-center justify-center text-[#787774] transition-colors opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 text-xs" aria-hidden="true">
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {dueReviews.length > 0 && !loading && !error && (
        <div className="px-4 py-2.5 border-t border-[#EAEAEA] bg-[#FBFBFA] text-[11px] text-[#787774] font-mono text-center">
          Sorted by most overdue first · Click to jump
        </div>
      )}
    </section>
  );
}
