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
        className="rounded-[1.25rem] border border-white/5 bg-card/50 overflow-hidden data-[state=open]:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)] transition-shadow"
      >
        <AccordionTrigger className="px-6 py-4 hover:no-underline group">
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold text-base tracking-tight text-foreground text-left">
              {topic.name}
            </span>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                <span className="text-emerald">{solved}</span>/{total}
              </span>
              <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-2">
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
