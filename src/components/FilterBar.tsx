"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Difficulty, Status } from "@/lib/types";

export type Filters = {
  search: string;
  topic: string | null;
  difficulty: Difficulty | null;
  status: Status | null;
  tags: string[];
};

const difficultyActive: Record<Difficulty, string> = {
  Easy: "bg-primary text-primary-foreground border-primary",
  Medium: "bg-primary text-primary-foreground border-primary",
  Hard: "bg-primary text-primary-foreground border-primary",
};
const statusActive: Record<Status, string> = {
  solved: "bg-primary text-primary-foreground border-primary",
  unsolved: "bg-card text-foreground border-border",
  review: "bg-primary text-primary-foreground border-primary",
};

export function FilterBar({
  filters,
  setFilters,
  topicNames,
  availableTags,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  topicNames: string[];
  availableTags: string[];
}) {
  const toggle = <T extends string>(key: keyof Filters, value: T) => {
    setFilters({
      ...filters,
      [key]: filters[key] === value ? null : (value as unknown as Filters[typeof key]),
    });
  };
  const toggleTag = (tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag],
    });
  };
  const hasActive =
    filters.search || filters.topic || filters.difficulty || filters.status || filters.tags.length > 0;

  return (
    <div className="rounded-[12px] border border-border bg-card p-3 md:p-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none" aria-hidden="true">
            ⌕
          </span>
          <label htmlFor="sheet-search" className="sr-only">
            Search problems
          </label>
          <Input
            id="sheet-search"
            type="search"
            aria-label="Search problems by name"
            placeholder="Search problems…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="h-10 pl-8 pr-9 rounded-[8px] bg-muted border-border text-sm placeholder:text-muted-foreground focus-visible:border-ring/20 focus-visible:ring-1 focus-visible:ring-ring/20"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: "" })}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-[6px] border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            >
              <span className="text-xs leading-none">×</span>
            </button>
          )}
        </div>

        <Select
          value={filters.topic ?? "all"}
          onValueChange={(v: string | null) =>
            setFilters({ ...filters, topic: v === "all" || v === null ? null : v })
          }
        >
          <SelectTrigger aria-label="Filter by topic" className="w-[160px] h-10 rounded-[8px] bg-muted border-border text-sm data-[placeholder]:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/20">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border rounded-[8px]">
            <SelectItem value="all">All Topics</SelectItem>
            {topicNames.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActive && (
          <button
            onClick={() => setFilters({ search: "", topic: null, difficulty: null, status: null, tags: [] })}
            aria-label="Clear all filters"
            className="h-10 px-4 rounded-[6px] border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3" role="toolbar" aria-label="Filter by difficulty, status and tags">
        <div className="flex items-center gap-1 rounded-[8px] bg-muted border border-border p-1" role="group" aria-label="Difficulty">
          {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              aria-pressed={filters.difficulty === d}
              onClick={() => toggle("difficulty", d)}
              className={`h-7 px-3 rounded-[6px] text-xs font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
                filters.difficulty === d
                  ? difficultyActive[d]
                  : "text-muted-foreground hover:text-foreground hover:bg-card border-transparent"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-[8px] bg-muted border border-border p-1" role="group" aria-label="Status">
          {(["solved", "unsolved", "review"] as Status[]).map((s) => (
            <button
              key={s}
              aria-pressed={filters.status === s}
              onClick={() => toggle("status", s)}
              className={`h-7 px-3 rounded-[6px] text-xs font-medium capitalize transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
                filters.status === s
                  ? statusActive[s]
                  : "text-muted-foreground hover:text-foreground hover:bg-card border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {(availableTags.length > 0 || filters.tags.length > 0) && (
          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
        )}

        <div className="relative flex-1 min-w-0 flex items-center">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full py-1 pr-6" role="group" aria-label="Tags">
            {availableTags.map((tag) => {
              const active = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  aria-pressed={active}
                  onClick={() => toggleTag(tag)}
                  className={`h-7 px-3 rounded-full text-xs font-medium whitespace-nowrap border shrink-0 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {availableTags.length === 0 && (
              <span className="text-xs text-muted-foreground px-2">No tags yet — add via edit on any problem</span>
            )}
          </div>
          {availableTags.length > 4 && (
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card to-transparent hidden sm:block" aria-hidden="true" />
          )}
        </div>
      </div>

      {hasActive && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground font-mono" role="status" aria-live="polite">
          <span className="w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
          Filters active — showing refined results
        </div>
      )}
    </div>
  );
}
