"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProblemRow } from "./ProblemRow";
import type { Pattern, MergedProblem, Status, PlatformLink, Tag, RecallStatus } from "@/lib/types";

export function PatternAccordion({
  pattern,
  problems,
  progress,
  spacedReviews,
  onStatusChange,
  onRecallChange,
  onEditLinks,
  onEditTags,
}: {
  pattern: Pattern;
  problems: MergedProblem[];
  progress: Record<string, Status>;
  spacedReviews?: Record<string, { recallStatus: RecallStatus | null }>;
  onStatusChange: (id: string, next: Status) => void;
  onRecallChange?: (id: string, next: RecallStatus) => void;
  onEditLinks: (id: string, links: PlatformLink[]) => void;
  onEditTags: (id: string, tags: Tag[]) => void;
}) {
  const solved = problems.filter((p) => progress[p.id] === "solved").length;
  const pct = problems.length > 0 ? Math.round((solved / problems.length) * 100) : 0;

  return (
    <Accordion className="">
      <AccordionItem
        value={pattern.id}
        className="rounded-[8px] border border-[#EAEAEA] bg-white overflow-hidden hover:border-[#E5E5E3] data-[state=open]:border-[#EAEAEA] transition-colors"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline group/pattern focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/10 focus-visible:ring-inset">
          <span className="flex-1 text-left text-[13px] font-medium tracking-tight text-[#111111] group-hover/pattern:text-[#2F3437] transition-colors">
            {pattern.name}
          </span>
          <div className="flex items-center gap-2.5 mr-2 shrink-0">
            <span className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-full bg-[#F7F6F3] border border-[#EAEAEA] text-[#787774]">
              <span className="text-[#111111]">{solved}</span>
              <span className="text-[#EAEAEA]">/</span>
              {problems.length}
            </span>
            <div className="w-14 h-1 rounded-full bg-[#F7F6F3] border border-[#EAEAEA] overflow-hidden p-0.5 hidden sm:flex" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% of pattern complete`}>
              <div className="h-full rounded-full bg-[#111111]/80 group-data-[state=open]:bg-[#111111] transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <div className="border-t border-[#EAEAEA] bg-white rounded-b-[8px] overflow-hidden">
            {problems.map((p) => (
              <ProblemRow
                key={p.id}
                problem={p}
                status={progress[p.id] ?? "unsolved"}
                recallStatus={spacedReviews?.[p.id]?.recallStatus ?? null}
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
