"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { daysOverdue } from "@/lib/revision-schedule";
import type { RevisionSchedule, MergedProblem } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

type RevisionEntry = RevisionSchedule & { problemId: string };
type UpcomingEntry = RevisionEntry & { nextDate: Date; daysUntil: number };

type Props = {
  dueToday: RevisionEntry[];
  upcoming: UpcomingEntry[];
  problemMap: Map<string, MergedProblem>;
  topicMap: Map<string, string>;
  patternMap: Map<string, string>;
  loading: boolean;
  error: string | null;
  onMarkRevised?: (problemId: string) => void;
};

function formatOverdue(target: Timestamp | Date | undefined): string {
  if (!target) return "";
  const overdue = daysOverdue(target as Timestamp, new Date());
  if (overdue <= 0) return "due today";
  if (overdue === 1) return "1 day overdue";
  return `${overdue} days overdue`;
}

function ProgressDots({ currentIdx, mastered }: { currentIdx: number; mastered: boolean }) {
  // currentIdx 0..6, dots = 6
  const total = 6;
  const filled = mastered ? total : currentIdx;
  return (
    <div className="flex items-center gap-1" aria-label={`Revision ${currentIdx} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full border transition-colors ${
            i < filled ? "bg-primary border-primary" : i === filled && !mastered ? "bg-[#FBF3DB] border-border dark:bg-[#FBF3DB]/30" : "bg-muted border-border"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function DueForReviewSection({ dueToday, upcoming, problemMap, topicMap, patternMap, loading, error, onMarkRevised }: Props) {
  const handleSelect = (problemId: string) => {
    const el = document.getElementById(`problem-${problemId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-1", "ring-ring/20", "bg-muted");
      setTimeout(() => el.classList.remove("ring-1", "ring-ring/20", "bg-muted"), 1600);
    }
  };

  return (
    <div className="space-y-4">
      {/* Due Today */}
      <section className="rounded-[12px] border border-border bg-card overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} aria-label="Due today">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-muted/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#FDEBEC] dark:bg-[#FDEBEC]/16 border border-border flex items-center justify-center text-[11px]" aria-hidden="true">
              !
            </div>
            <h3 className="text-[13px] font-medium tracking-tight text-foreground">Due Today</h3>
          </div>
          <Badge
            variant="outline"
            aria-label={`${dueToday.length} due today`}
            className={`rounded-full text-[11px] px-2.5 py-1 font-mono border tabular-nums ${
              dueToday.length > 0
                ? "bg-[#FDEBEC] dark:bg-[#FDEBEC]/16 text-[#9F2F2D] dark:text-[#FCA5A5] border-border"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {dueToday.length} due
          </Badge>
        </div>

        <div className="max-h-[420px] overflow-y-auto scrollbar-none">
          {loading ? (
            <div className="p-4 space-y-3">
              <div className="h-16 w-full skeleton rounded-[8px]" />
              <div className="h-16 w-full skeleton rounded-[8px]" />
              <div className="h-16 w-full skeleton rounded-[8px]" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-9 h-9 rounded-[6px] bg-[#FDEBEC] dark:bg-[#FDEBEC]/16 border border-border flex items-center justify-center mx-auto mb-3 text-[#9F2F2D] dark:text-[#FCA5A5] text-sm">!</div>
              <p className="text-sm text-foreground font-medium">Failed to load revisions</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          ) : dueToday.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-9 h-9 rounded-[6px] bg-[#EDF3EC] dark:bg-[#EDF3EC]/16 border border-border flex items-center justify-center mx-auto mb-3 text-[#346538] dark:text-[#86EFAC] text-sm">✓</div>
              <p className="text-sm text-foreground font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No revisions due today. Keep solving.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {dueToday.map((item) => {
                const problem = problemMap.get(item.problemId);
                const nextRaw = item.revisionDates[item.currentRevisionIndex] as unknown as Timestamp | undefined;
                const overdueText = formatOverdue(nextRaw as Timestamp);
                const overdueDays = nextRaw ? daysOverdue(nextRaw as Timestamp) : 0;
                const TopicName = problem ? topicMap.get(problem.topicId) ?? problem.topicId : "—";
                const PatternName = problem ? patternMap.get(problem.patternId) ?? problem.patternId : "—";
                const revisionLabel = `Revision ${item.currentRevisionIndex + 1} of 6`;
                const overdueBg = overdueDays > 3 ? "bg-[#FDEBEC]/60 dark:bg-[#FDEBEC]/16" : overdueDays > 1 ? "bg-[#FBF3DB]/50 dark:bg-[#FBF3DB]/16" : "";

                return (
                  <div
                    key={item.problemId}
                    className={`group w-full text-left px-4 py-3.5 hover:bg-muted transition-colors flex items-center gap-3 ${overdueBg}`}
                  >
                    <button
                      onClick={() => handleSelect(item.problemId)}
                      aria-label={`Jump to ${problem?.name ?? item.problemId}, ${overdueText}`}
                      className="flex-1 min-w-0 text-left focus-visible:outline-none"
                    >
                      <div className="text-[13px] font-medium tracking-tight text-foreground truncate group-hover:text-foreground">
                        {problem?.name ?? item.problemId}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                          {TopicName}
                        </span>
                        <span className="text-[11px] text-border">·</span>
                        <span className="text-[11px] text-muted-foreground truncate">{PatternName}</span>
                        <span className="text-[11px] text-border">·</span>
                        <span className={`text-[11px] font-medium ${overdueDays > 3 ? "text-[#9F2F2D] dark:text-[#FCA5A5]" : "text-[#9F2F2D] dark:text-[#FCA5A5]"}`}>
                          {overdueText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <ProgressDots currentIdx={item.currentRevisionIndex} mastered={item.isFullyMastered} />
                        <span className="text-[11px] font-mono text-muted-foreground">{revisionLabel}</span>
                      </div>
                    </button>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onMarkRevised?.(item.problemId)}
                        aria-label={`Mark Revised for ${problem?.name ?? item.problemId}`}
                        className="h-7 px-3 rounded-[6px] text-xs font-medium border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      >
                        Mark Revised ✓
                      </Button>
                      <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                        {item.completedRevisions.length}/6 done
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {dueToday.length > 0 && !loading && !error && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/50 text-[11px] text-muted-foreground font-mono text-center">
            Due or overdue · Click title to jump · Mark Revised when done
          </div>
        )}
      </section>

      {/* Upcoming next 7 days */}
      <section className="rounded-[12px] border border-border bg-card overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} aria-label="Upcoming">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-muted/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#EDF3EC] dark:bg-[#EDF3EC]/16 border border-border flex items-center justify-center text-[11px]" aria-hidden="true">
              ◷
            </div>
            <h3 className="text-[13px] font-medium tracking-tight text-foreground">Upcoming</h3>
            <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">next 7 days</span>
          </div>
          <Badge
            variant="outline"
            className="rounded-full text-[11px] px-2.5 py-1 font-mono border bg-muted text-muted-foreground border-border tabular-nums"
          >
            {upcoming.length} scheduled
          </Badge>
        </div>

        <div className="max-h-[320px] overflow-y-auto scrollbar-none">
          {loading ? (
            <div className="p-4 space-y-3">
              <div className="h-14 w-full skeleton rounded-[8px]" />
              <div className="h-14 w-full skeleton rounded-[8px]" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-xs text-muted-foreground">{error}</div>
          ) : upcoming.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-9 h-9 rounded-[6px] bg-muted border border-border flex items-center justify-center mx-auto mb-3 text-muted-foreground text-sm">—</div>
              <p className="text-sm text-foreground font-medium">Nothing upcoming</p>
              <p className="text-xs text-muted-foreground mt-1">No revisions scheduled in the next 7 days.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {upcoming.map((item) => {
                const problem = problemMap.get(item.problemId);
                const TopicName = problem ? topicMap.get(problem.topicId) ?? problem.topicId : "—";
                const revisionLabel = `Revision ${item.currentRevisionIndex + 1} of 6`;
                const dateStr = item.nextDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                return (
                  <div key={item.problemId} className="group w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3">
                    <button
                      onClick={() => handleSelect(item.problemId)}
                      className="flex-1 min-w-0 text-left focus-visible:outline-none"
                      aria-label={`Jump to ${problem?.name ?? item.problemId}`}
                    >
                      <div className="text-[13px] font-medium tracking-tight text-foreground truncate">
                        {problem?.name ?? item.problemId}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                          {TopicName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{dateStr}</span>
                        <span className="text-[11px] text-border">·</span>
                        <span className="text-[11px] text-muted-foreground">in {item.daysUntil} day{item.daysUntil !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <ProgressDots currentIdx={item.currentRevisionIndex} mastered={item.isFullyMastered} />
                        <span className="text-[11px] font-mono text-muted-foreground">{revisionLabel}</span>
                      </div>
                    </button>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onMarkRevised?.(item.problemId)}
                        className="h-7 px-3 rounded-[6px] text-xs font-medium border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      >
                        Mark Revised ✓
                      </Button>
                      <span className="text-[10px] text-muted-foreground font-mono">{revisionLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {upcoming.length > 0 && !loading && !error && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/50 text-[11px] text-muted-foreground font-mono text-center">
            Next 7 days · Early revision allowed
          </div>
        )}
      </section>
    </div>
  );
}
