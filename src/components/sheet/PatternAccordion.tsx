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
    <Accordion className="pl-2">
      <AccordionItem value={pattern.id} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <AccordionTrigger className="px-4 py-2.5 hover:no-underline">
          <span className="flex-1 text-left text-sm font-medium text-foreground">
            {pattern.name}
          </span>
          <div className="flex items-center gap-2.5 mr-2 shrink-0">
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-emerald">{solved}</span>/{problems.length}
            </span>
            <div className="w-12 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald/60 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <div className="border-t border-white/5">
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
