"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Difficulty, Status } from "@/lib/types";

export type Filters = {
  search: string;
  topic: string | null;
  difficulty: Difficulty | null;
  status: Status | null;
  tags: string[];
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
    setFilters({ ...filters, [key]: filters[key] === value ? null : (value as unknown as Filters[typeof key]) });
  };
  const toggleTag = (tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag],
    });
  };
  const hasActive = filters.search || filters.topic || filters.difficulty || filters.status || filters.tags.length > 0;
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-3 flex flex-wrap gap-2 items-center">
      <Input
        placeholder="Search problems..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="w-[200px] h-9"
      />
      <Select value={filters.topic ?? "all"} onValueChange={(v: string | null) => setFilters({ ...filters, topic: v === "all" || v === null ? null : v })}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="All Topics" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Topics</SelectItem>
          {topicNames.map((n) => (
            <SelectItem key={n} value={n}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
        <Badge
          key={d}
          variant={filters.difficulty === d ? "default" : "outline"}
          className={`cursor-pointer select-none ${filters.difficulty === d ? "" : "hover:bg-muted"}`}
          onClick={() => toggle("difficulty", d)}
        >
          {d}
        </Badge>
      ))}
      {(["solved", "unsolved", "review"] as Status[]).map((s) => (
        <Badge
          key={s}
          variant={filters.status === s ? "default" : "outline"}
          className={`cursor-pointer select-none capitalize ${filters.status === s ? "" : "hover:bg-muted"}`}
          onClick={() => toggle("status", s)}
        >
          {s}
        </Badge>
      ))}
      {availableTags.map((tag) => (
        <Badge
          key={tag}
          variant={filters.tags.includes(tag) ? "default" : "outline"}
          className={`cursor-pointer select-none ${filters.tags.includes(tag) ? "" : "hover:bg-muted"}`}
          onClick={() => toggleTag(tag)}
        >
          {tag}
        </Badge>
      ))}
      {hasActive ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({ search: "", topic: null, difficulty: null, status: null, tags: [] })}
        >
          Clear
        </Button>
      ) : null}
    </div>
  );
}
