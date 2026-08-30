"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PatternAccordion } from "./PatternAccordion";
import type { Topic, MergedProblem, Status, PlatformLink, Tag, RecallStatus } from "@/lib/types";

export function TopicAccordion({
  topic,
  patterns,
  progress,
  spacedReviews,
  onStatusChange,
  onRecallChange,
  onEditLinks,
  onEditTags,
}: {
  topic: Pick<Topic, "id" | "name">;
  patterns: { pattern: Topic["patterns"][number]; problems: MergedProblem[] }[];
  progress: Record<string, Status>;
  spacedReviews?: Record<string, { recallStatus: RecallStatus | null }>;
  onStatusChange: (id: string, next: Status) => void;
  onRecallChange?: (id: string, next: RecallStatus) => void;
  onEditLinks: (id: string, links: PlatformLink[]) => void;
  onEditTags: (id: string, tags: Tag[]) => void;
}) {
  const total = patterns.reduce((acc, cur) => acc + cur.problems.length, 0);
  const solved = patterns.reduce(
    (acc, cur) => acc + cur.problems.filter((p) => progress[p.id] === "solved").length,
    0
  );
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <Accordion defaultValue={[topic.id]} className="mb-4">
      <AccordionItem
        value={topic.id}
        className="group/topic bezel-outer !p-1.5 overflow-hidden data-[state=open]:shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-shadow duration-500 ease-out border-0"
      >
        <div className="bezel-inner overflow-hidden">
          <AccordionTrigger className="px-5 md:px-6 py-4 hover:no-underline group flex items-center justify-between gap-4 bg-transparent hover:bg-white/[0.02] transition-colors duration-200 ease-out rounded-[calc(2rem-0.375rem)] [&[data-state=open]]:rounded-b-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/20 focus-visible:ring-inset">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="hidden sm:flex w-1 self-stretch min-h-[24px] rounded-full bg-emerald/60 group-data-[state=open]/topic:bg-emerald transition-colors duration-300" aria-hidden="true" />
              <h2 className="font-[var(--font-instrument-serif)] text-[18px] md:text-[20px] tracking-[-0.02em] leading-none text-foreground text-left truncate">
                {topic.name}
              </h2>
              <span className="hidden md:inline-flex items-center rounded-full bg-white/[0.04] border border-white/5 px-2.5 py-1 text-[11px] font-mono text-zinc-400 shrink-0" aria-label={`${patterns.length} patterns`}>
                {patterns.length} patterns
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono tabular-nums text-zinc-500 whitespace-nowrap hidden sm:inline" aria-label={`${solved} of ${total} solved`}>
                <span className="text-emerald font-medium">{solved}</span>
                <span className="text-zinc-600">/</span>
                {total}
              </span>
              <div className="w-[88px] h-1.5 rounded-full bg-white/[0.06] border border-white/[0.04] overflow-hidden p-0.5 hidden sm:flex" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% of topic complete`}>
                <div
                  className="h-full rounded-full bg-emerald transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="sm:hidden text-[11px] font-mono tabular-nums px-2.5 py-1 rounded-full bg-emerald/10 border border-emerald/15 text-emerald" aria-label={`${pct}% complete`}>
                {pct}%
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-2 md:px-3 md:pb-3">
            <div className="space-y-2 pt-1">
              {patterns.map(({ pattern, problems }) => (
                <PatternAccordion
                  key={pattern.id}
                  pattern={pattern}
                  problems={problems}
                  progress={progress}
                  spacedReviews={spacedReviews}
                  onStatusChange={onStatusChange}
                  onRecallChange={onRecallChange}
                  onEditLinks={onEditLinks}
                  onEditTags={onEditTags}
                />
              ))}
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
