"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { PatternAccordion } from "./PatternAccordion";
import type { Topic, MergedProblem, Status, PlatformLink } from "@/lib/types";

export function TopicAccordion({
  topic,
  patterns,
  progress,
  onStatusChange,
  onEditLinks,
}: {
  topic: Pick<Topic, "id" | "name">;
  patterns: { pattern: Topic["patterns"][number]; problems: MergedProblem[] }[];
  progress: Record<string, Status>;
  onStatusChange: (id: string, next: Status) => void;
  onEditLinks: (id: string, links: PlatformLink[]) => void;
}) {
  const total = patterns.reduce((acc, cur) => acc + cur.problems.length, 0);
  const solved = patterns.reduce((acc, cur) => acc + cur.problems.filter((p) => progress[p.id] === "solved").length, 0);
  return (
    <Accordion defaultValue={[topic.id]} className="mb-4">
      <AccordionItem value={topic.id} className="border rounded-lg bg-card shadow-sm">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <span className="font-semibold text-base text-left">{topic.name}</span>
          <div className="flex items-center gap-3 ml-auto mr-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {solved}/{total} solved
            </span>
            <Progress value={total ? (solved / total) * 100 : 0} className="w-24 h-2" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3">
          {patterns.map(({ pattern, problems }) => (
            <PatternAccordion
              key={pattern.id}
              pattern={pattern}
              problems={problems}
              progress={progress}
              onStatusChange={onStatusChange}
              onEditLinks={onEditLinks}
            />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
