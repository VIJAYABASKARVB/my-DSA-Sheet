"use client";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Difficulty, Status } from "@/lib/types";

export type Filters = {
  search: string;
  topic: string | null;
  difficulty: Difficulty | null;
  status: Status | null;
  tags: string[];
};

const difficultyColors: Record<Difficulty, string> = {
  Easy: "bg-emerald/15 text-emerald border-emerald/20",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Hard: "bg-red-500/15 text-red-400 border-red-500/20",
};
const difficultyColorsActive: Record<Difficulty, string> = {
  Easy: "bg-emerald text-white border-emerald",
  Medium: "bg-amber-500 text-white border-amber-500",
  Hard: "bg-red-500 text-white border-red-500",
};
const statusColors: Record<Status, string> = {
  solved: "bg-emerald/15 text-emerald border-emerald/20",
  unsolved: "bg-white/5 text-muted-foreground border-white/10",
  review: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};
const statusColorsActive: Record<Status, string> = {
  solved: "bg-emerald text-white border-emerald",
  unsolved: "bg-white/10 text-foreground border-white/20",
  review: "bg-amber-500 text-white border-amber-500",
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
    <div className="rounded-[1.25rem] border border-white/5 bg-card/50 backdrop-blur-sm p-4">
      {/* Top row: Search + Topic */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder="Search problems..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="h-9 pl-9 pr-9 bg-white/[0.04] border-white/5 text-sm placeholder:text-muted-foreground focus-visible:border-emerald/40 focus-visible:ring-emerald/20"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <Select
          value={filters.topic ?? "all"}
          onValueChange={(v: string | null) =>
            setFilters({ ...filters, topic: v === "all" || v === null ? null : v })
          }
        >
          <SelectTrigger className="w-[180px] h-9 bg-white/[0.04] border-white/5 text-sm">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
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
            onClick={() =>
              setFilters({ search: "", topic: null, difficulty: null, status: null, tags: [] })
            }
            className="h-9 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3 h-3" strokeWidth={1.5} />
            Clear
          </button>
        )}
      </div>

      {/* Bottom row: Segmented filters */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {/* Difficulty segment */}
        <div className="flex items-center gap-0.5 rounded-lg border border-white/5 bg-white/[0.02] p-0.5">
          {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => toggle("difficulty", d)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filters.difficulty === d
                  ? difficultyColorsActive[d]
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Status segment */}
        <div className="flex items-center gap-0.5 rounded-lg border border-white/5 bg-white/[0.02] p-0.5">
          {(["solved", "unsolved", "review"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => toggle("status", s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                filters.status === s
                  ? statusColorsActive[s]
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Separator */}
        {(availableTags.length > 0 || filters.tags.length > 0) && (
          <div className="w-px h-5 bg-white/10 mx-1" />
        )}

        {/* Tags */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-[50vw]">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                filters.tags.includes(tag)
                  ? "bg-emerald/15 text-emerald border border-emerald/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
