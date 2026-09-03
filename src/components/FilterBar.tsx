"use client";
import { Search, X } from "lucide-react";
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
  Easy: "bg-[#EDF3EC] dark:bg-[#EDF3EC]/16 text-[#346538] dark:text-[#86EFAC] border-[#EDF3EC] dark:border-[#EDF3EC]/20",
  Medium: "bg-[#FBF3DB] dark:bg-[#FBF3DB]/16 text-[#956400] dark:text-[#FDE68A] border-[#FBF3DB] dark:border-[#FBF3DB]/20",
  Hard: "bg-[#FDEBEC] dark:bg-[#FDEBEC]/16 text-[#9F2F2D] dark:text-[#FCA5A5] border-[#FDEBEC] dark:border-[#FDEBEC]/20",
};
const statusActive: Record<Status, string> = {
  solved: "bg-[#EDF3EC] dark:bg-[#EDF3EC]/16 text-[#346538] dark:text-[#86EFAC] border-[#EDF3EC] dark:border-[#EDF3EC]/20",
  unsolved: "bg-card text-foreground border-border",
  review: "bg-[#FBF3DB] dark:bg-[#FBF3DB]/16 text-[#956400] dark:text-[#FDE68A] border-[#FBF3DB] dark:border-[#FBF3DB]/20",
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
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 min-w-0 sm:min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
            <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
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
            className="h-10 sm:h-10 pl-8 pr-9 rounded-[8px] bg-muted border-border text-sm placeholder:text-muted-foreground focus-visible:border-ring/20 focus-visible:ring-1 focus-visible:ring-ring/20"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: "" })}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-7 sm:h-7 rounded-[6px] border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            >
              <X className="w-3 h-3" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={filters.topic ?? "all"}
            onValueChange={(v: string | null) =>
              setFilters({ ...filters, topic: v === "all" || v === null ? null : v })
            }
          >
            <SelectTrigger aria-label="Filter by topic" className="flex-1 sm:flex-none sm:w-[160px] h-10 rounded-[8px] bg-muted border-border text-sm data-[placeholder]:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/20">
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
              className="h-10 px-4 rounded-[6px] border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 shrink-0 sm:shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2 mt-3" role="toolbar" aria-label="Filter by difficulty, status and tags">
        <div className="flex items-center gap-1 rounded-[8px] bg-muted border border-border p-1" role="group" aria-label="Difficulty">
          {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              aria-pressed={filters.difficulty === d}
              onClick={() => toggle("difficulty", d)}
              className={`h-8 sm:h-7 px-3 rounded-[6px] text-xs font-medium transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 active:scale-[0.97] ${
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
              className={`h-8 sm:h-7 px-3 rounded-[6px] text-xs font-medium capitalize transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 active:scale-[0.97] ${
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

        <div className="relative flex-1 min-w-0 flex items-center basis-full sm:basis-auto mt-1 sm:mt-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full py-1 pr-6 snap-x snap-mandatory" role="group" aria-label="Tags" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
            {availableTags.map((tag) => {
              const active = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  aria-pressed={active}
                  onClick={() => toggleTag(tag)}
                  className={`h-8 sm:h-7 px-3 rounded-full text-xs font-medium whitespace-nowrap border shrink-0 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 snap-start ${
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
