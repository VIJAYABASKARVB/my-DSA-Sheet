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
    <Accordion defaultValue={[topic.id]} className="mb-3">
      <AccordionItem
        value={topic.id}
        className="rounded-[12px] border border-[#EAEAEA] bg-white overflow-hidden data-[state=open]:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow"
      >
        <AccordionTrigger className="px-5 py-4 hover:no-underline group flex items-center justify-between gap-4 bg-white hover:bg-[#FBFBFA] transition-colors [&[data-state=open]]:border-b [&[data-state=open]]:border-[#EAEAEA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/10 focus-visible:ring-inset">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="hidden sm:block w-0.5 self-stretch min-h-[20px] rounded-full bg-[#EAEAEA] group-data-[state=open]:bg-[#111111] transition-colors" aria-hidden="true" />
            <h2 className="font-[var(--font-newsreader)] text-[17px] md:text-[18px] tracking-[-0.02em] leading-none text-[#111111] text-left truncate">
              {topic.name}
            </h2>
            <span className="hidden md:inline-flex items-center rounded-full bg-[#F7F6F3] border border-[#EAEAEA] px-2.5 py-1 text-[11px] font-mono text-[#787774] shrink-0">
              {patterns.length} patterns
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono tabular-nums text-[#787774] whitespace-nowrap hidden sm:inline">
              <span className="text-[#111111] font-medium">{solved}</span>
              <span className="text-[#EAEAEA]">/</span>
              {total}
            </span>
            <div className="w-[88px] h-1.5 rounded-full bg-[#F7F6F3] border border-[#EAEAEA] overflow-hidden p-0.5 hidden sm:flex" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% of topic complete`}>
              <div className="h-full rounded-full bg-[#111111] transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="sm:hidden text-[11px] font-mono tabular-nums px-2.5 py-1 rounded-full bg-[#F7F6F3] border border-[#EAEAEA] text-[#111111]">{pct}%</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2 md:px-3 md:pb-3 bg-[#FBFBFA]">
          <div className="space-y-2 pt-2">
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
      </AccordionItem>
    </Accordion>
  );
}
