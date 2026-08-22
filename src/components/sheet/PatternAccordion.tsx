"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProblemRow } from "./ProblemRow";
import type { Pattern, MergedProblem, Status, PlatformLink, Tag } from "@/lib/types";

export function PatternAccordion({
  pattern,
  problems,
  progress,
  onStatusChange,
  onEditLinks,
  onEditTags,
}: {
  pattern: Pattern;
  problems: MergedProblem[];
  progress: Record<string, Status>;
  onStatusChange: (id: string, next: Status) => void;
  onEditLinks: (id: string, links: PlatformLink[]) => void;
  onEditTags: (id: string, tags: Tag[]) => void;
}) {
  const solved = problems.filter((p) => progress[p.id] === "solved").length;
  return (
    <Accordion className="pl-4">
      <AccordionItem value={pattern.id} className="border rounded mb-2 bg-card">
        <AccordionTrigger className="px-3 py-2 hover:no-underline">
          <span className="flex-1 text-left text-sm font-medium">{pattern.name}</span>
          <span className="text-xs text-muted-foreground mr-2">
            {solved}/{problems.length} solved
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <div className="border-t">
            {problems.map((p) => (
              <ProblemRow
                key={p.id}
                problem={p}
                status={progress[p.id] ?? "unsolved"}
                onStatusChange={onStatusChange}
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
