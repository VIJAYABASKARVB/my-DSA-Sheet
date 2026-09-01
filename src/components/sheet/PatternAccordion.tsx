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
  const completed = problems.filter((p) => progress[p.id] === "solved" || progress[p.id] === "review").length;
  const pct = problems.length > 0 ? Math.round((completed / problems.length) * 100) : 0;

  return (
    <Accordion className="">
      <AccordionItem
        value={pattern.id}
        className="rounded-[8px] border border-border bg-card overflow-hidden hover:border-border data-[state=open]:border-border transition-colors"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline group/pattern focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/10 focus-visible:ring-inset">
          <span className="flex-1 text-left text-[13px] font-medium tracking-tight text-foreground group-hover/pattern:text-foreground transition-colors">
            {pattern.name}
          </span>
          <div className="flex items-center gap-2.5 mr-2 shrink-0">
            <span className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
              <span className="text-foreground">{completed}</span>
              <span className="text-muted-foreground/40 mx-0.5">/</span>
              {problems.length}
            </span>
            <div className="w-14 h-2 rounded-full bg-secondary border border-border overflow-hidden hidden sm:flex" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% of pattern complete`}>
              <div className="h-full rounded-full bg-primary/80 group-data-[state=open]:bg-primary transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `${pct}%`, minWidth: pct > 0 ? '2px' : '0' }} />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <div className="border-t border-border bg-card rounded-b-[8px] overflow-hidden">
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
