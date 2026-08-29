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
  Easy: "bg-emerald text-white border-emerald shadow-[0_2px_10px_rgba(16,185,129,0.3)]",
  Medium: "bg-amber-500 text-white border-amber-500 shadow-[0_2px_10px_rgba(245,158,11,0.3)]",
  Hard: "bg-red-500 text-white border-red-500 shadow-[0_2px_10px_rgba(239,68,68,0.3)]",
};
const statusActive: Record<Status, string> = {
  solved: "bg-emerald text-white border-emerald shadow-[0_2px_10px_rgba(16,185,129,0.3)]",
  unsolved: "bg-white text-black border-white",
  review: "bg-amber-500 text-white border-amber-500 shadow-[0_2px_10px_rgba(245,158,11,0.3)]",
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
    <div className="bezel-outer">
      <div className="bezel-inner p-4 md:p-5">
        {/* Top row: Search + Topic + Clear */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" strokeWidth={1.25} />
            <Input
              placeholder="Search 110 problems…"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="h-[42px] pl-10 pr-9 rounded-full bg-white/[0.04] border-white/10 text-sm placeholder:text-zinc-500 focus-visible:border-emerald/30 focus-visible:ring-0 focus-visible:ring-emerald/20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.25} />
              </button>
            )}
          </div>

          <Select
            value={filters.topic ?? "all"}
            onValueChange={(v: string | null) =>
              setFilters({ ...filters, topic: v === "all" || v === null ? null : v })
            }
          >
            <SelectTrigger className="w-[180px] h-[42px] rounded-full bg-white/[0.04] border-white/10 text-sm data-[placeholder]:text-zinc-500">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0A0A] border-white/10 rounded-2xl">
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
              className="group h-[42px] px-4 rounded-full bg-white text-black text-xs font-medium flex items-center gap-1.5 hover:bg-zinc-100 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              <X className="w-3 h-3" strokeWidth={1.25} />
              Clear
              <span className="w-5 h-5 rounded-full bg-black/10 group-hover:bg-black/15 flex items-center justify-center ml-1 transition-colors">
                <X className="w-2.5 h-2.5" strokeWidth={1.5} />
              </span>
            </button>
          )}
        </div>

        {/* Bottom row: Pill segments */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {/* Difficulty pills */}
          <div className="flex items-center gap-1 rounded-full bg-white/[0.03] border border-white/5 p-1">
            {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => toggle("difficulty", d)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] border ${
                  filters.difficulty === d
                    ? difficultyActive[d]
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1 rounded-full bg-white/[0.03] border border-white/5 p-1">
            {(["solved", "unsolved", "review"] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => toggle("status", s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] border ${
                  filters.status === s
                    ? statusActive[s]
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {(availableTags.length > 0 || filters.tags.length > 0) && (
            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
          )}

          {/* Tags — pill island */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full sm:max-w-[48vw] py-1">
            {availableTags.map((tag) => {
              const active = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                    active
                      ? "bg-emerald text-white border-emerald shadow-[0_2px_10px_rgba(16,185,129,0.25)]"
                      : "bg-white/[0.04] text-zinc-400 border-white/5 hover:text-white hover:bg-white/[0.08] hover:border-white/10"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {hasActive && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            Filters active — showing refined results
          </div>
        )}
      </div>
    </div>
  );
}
