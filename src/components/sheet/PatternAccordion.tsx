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
        className="rounded-[1.25rem] border border-white/[0.06] bg-white/[0.015] overflow-hidden data-[state=open]:bg-white/[0.03] data-[state=open]:border-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline group/pattern">
          <span className="flex-1 text-left text-[13px] font-medium tracking-tight text-zinc-200 group-hover/pattern:text-white transition-colors">
            {pattern.name}
          </span>
          <div className="flex items-center gap-2.5 mr-2 shrink-0">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/5 text-zinc-400">
              <span className="text-emerald">{solved}</span>
              <span className="text-zinc-600">/</span>
              {problems.length}
            </span>
            <div className="w-14 h-1 rounded-full bg-white/[0.06] overflow-hidden p-0.5 hidden sm:flex">
              <div
                className="h-full rounded-full bg-emerald/70 group-data-[state=open]/pattern:bg-emerald transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <div className="border-t border-white/[0.06] bg-[#0F0F0F]/50 rounded-b-[1.25rem] overflow-hidden">
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
