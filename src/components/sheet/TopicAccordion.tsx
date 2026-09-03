"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PatternAccordion } from "./PatternAccordion";
import type { Topic, MergedProblem, Status, PlatformLink, Tag, RevisionSchedule } from "@/lib/types";

export function TopicAccordion({
  topic,
  patterns,
  progress,
  revisions,
  expandedTopics,
  expandedPatterns,
  onExpandedTopicsChange,
  onExpandedPatternsChange,
  onStatusChange,
  onMarkRevised,
  onEditLinks,
  onEditTags,
  notedProblemIds,
}: {
  topic: Pick<Topic, "id" | "name">;
  patterns: { pattern: Topic["patterns"][number]; problems: MergedProblem[] }[];
  progress: Record<string, Status>;
  revisions?: Record<string, RevisionSchedule>;
  expandedTopics?: string[];
  expandedPatterns?: string[];
  onExpandedTopicsChange?: (ids: string[]) => void;
  onExpandedPatternsChange?: (ids: string[]) => void;
  onStatusChange: (id: string, next: Status) => void;
  onMarkRevised?: (id: string) => void;
  onEditLinks: (id: string, links: PlatformLink[]) => void;
  onEditTags: (id: string, tags: Tag[]) => void;
  notedProblemIds?: Set<string>;
}) {
  const total = patterns.reduce((acc, cur) => acc + cur.problems.length, 0);
  const completed = patterns.reduce(
    (acc, cur) => acc + cur.problems.filter((p) => progress[p.id] === "solved" || progress[p.id] === "review").length,
    0
  );
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isControlled = expandedTopics !== undefined && onExpandedTopicsChange !== undefined;
  // Treat empty controlled array as "default open all" to avoid flash-closed on first mount before sheet/page populates
  const isOpen = isControlled ? (expandedTopics!.length === 0 ? true : expandedTopics!.includes(topic.id)) : true;
  const handleTopicChange = (value: string[]) => {
    if (!onExpandedTopicsChange || !expandedTopics) return;
    const nextOpen = value.includes(topic.id);
    if (nextOpen && !expandedTopics.includes(topic.id)) {
      onExpandedTopicsChange([...expandedTopics, topic.id]);
    } else if (!nextOpen && expandedTopics.includes(topic.id)) {
      onExpandedTopicsChange(expandedTopics.filter((id) => id !== topic.id));
    }
  };

  return (
    <Accordion
      {...(isControlled ? { value: isOpen ? [topic.id] : [], onValueChange: handleTopicChange } : { defaultValue: [topic.id] })}
      className="mb-3"
    >
      <AccordionItem
        value={topic.id}
        className="rounded-[12px] border border-border bg-card overflow-hidden data-[state=open]:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:data-[state=open]:shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-shadow"
      >
        <AccordionTrigger className="px-5 py-4 hover:no-underline group flex items-center justify-between gap-4 bg-card hover:bg-muted/50 transition-colors [&[data-state=open]]:border-b [&[data-state=open]]:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/10 focus-visible:ring-inset">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="hidden sm:block w-0.5 self-stretch min-h-[20px] rounded-full bg-border group-data-[state=open]:bg-primary transition-colors" aria-hidden="true" />
            <h2 className="font-[var(--font-newsreader)] text-[17px] md:text-[18px] tracking-[-0.02em] leading-none text-foreground text-left truncate">
              {topic.name}
            </h2>
            <span className="hidden md:inline-flex items-center rounded-full bg-muted border border-border px-2.5 py-1 text-[11px] font-mono text-muted-foreground shrink-0">
              {patterns.length} patterns
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap hidden sm:inline">
              <span className="text-foreground font-medium">{completed}</span>
              <span className="text-muted-foreground/40 mx-0.5">/</span>
              {total}
            </span>
            <div className="w-[88px] h-2 rounded-full bg-secondary border border-border overflow-hidden hidden sm:flex" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% of topic complete`}>
              <div className="h-full rounded-full bg-primary transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `${pct}%`, minWidth: pct > 0 ? '2px' : '0' }} />
            </div>
            <span className="sm:hidden text-[11px] font-mono tabular-nums px-2.5 py-1 rounded-full bg-muted border border-border text-foreground">{pct}%</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2 md:px-3 md:pb-3 bg-muted/30">
          <div className="space-y-2 pt-2">
            {patterns.map(({ pattern, problems }) => (
              <PatternAccordion
                key={pattern.id}
                pattern={pattern}
                problems={problems}
                progress={progress}
                revisions={revisions}
                isOpen={expandedPatterns?.includes(pattern.id)}
                onToggle={(open) => {
                  if (!onExpandedPatternsChange || !expandedPatterns) return;
                  if (open && !expandedPatterns.includes(pattern.id)) {
                    onExpandedPatternsChange([...expandedPatterns, pattern.id]);
                  } else if (!open && expandedPatterns.includes(pattern.id)) {
                    onExpandedPatternsChange(expandedPatterns.filter((id) => id !== pattern.id));
                  }
                }}
                onStatusChange={onStatusChange}
                onMarkRevised={onMarkRevised}
                onEditLinks={onEditLinks}
                onEditTags={onEditTags}
                notedProblemIds={notedProblemIds}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
