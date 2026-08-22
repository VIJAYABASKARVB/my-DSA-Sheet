"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MergedProblem, Status, PlatformLink, Tag } from "@/lib/types";

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-800 border-green-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  Hard: "bg-red-100 text-red-800 border-red-200",
};
const platformBadge: Record<string, string> = {
  LeetCode: "LC",
  TakeUForward: "TUF",
  Code360: "C360",
  GeeksForGeeks: "GFG",
  InterviewBit: "IB",
};
const cycle: Record<Status, Status> = { unsolved: "solved", solved: "review", review: "unsolved" };
const icon: Record<Status, string> = { unsolved: "☐", solved: "✓", review: "⟳" };

const SUGGESTED_TAGS: Tag[] = ["Neetcode", "Striver", "Others"];

export function ProblemRow({
  problem,
  status,
  onStatusChange,
  onEditLinks,
  onEditTags,
}: {
  problem: MergedProblem;
  status: Status;
  onStatusChange: (id: string, next: Status) => void;
  onEditLinks: (id: string, links: PlatformLink[]) => void;
  onEditTags: (id: string, tags: Tag[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PlatformLink[]>(problem.links);
  const [draftTags, setDraftTags] = useState<Tag[]>(problem.tags ?? []);
  const [newTag, setNewTag] = useState("");

  const handleOpen = () => {
    setDraft(problem.links);
    setDraftTags(problem.tags ?? []);
    setNewTag("");
    setOpen(true);
  };

  const handleSave = () => {
    const cleaned = draft.filter((l) => l.url.trim()).map((l) => ({ ...l, url: l.url.trim() }));
    const cleanedTags = draftTags.map((t) => t.trim()).filter(Boolean);
    // dedup case-insensitive, preserve original casing of first occurrence
    const seen = new Set<string>();
    const deduped: Tag[] = [];
    for (const t of cleanedTags) {
      const lower = t.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        deduped.push(t);
      }
    }
    onEditLinks(problem.id, cleaned);
    onEditTags(problem.id, deduped);
    setOpen(false);
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (draftTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    setDraftTags((prev) => [...prev, trimmed]);
    setNewTag("");
  };

  return (
    <>
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 py-2.5 px-3 rounded border-b last:border-b-0 hover:bg-muted/50">
        <button
          aria-label={`Status ${status}`}
          onClick={() => onStatusChange(problem.id, cycle[status])}
          className={`w-7 h-7 rounded border flex items-center justify-center text-sm shrink-0 transition-colors ${
            status === "solved"
              ? "bg-green-50 border-green-300 text-green-700"
              : status === "review"
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-white hover:bg-muted"
          }`}
        >
          {icon[status]}
        </button>
        <span className="flex-1 min-w-0 truncate text-sm font-medium">{problem.name}</span>
        <Badge variant="outline" className={`text-xs shrink-0 ${difficultyColor[problem.difficulty]}`}>
          {problem.difficulty}
        </Badge>
        <div className="flex gap-1 flex-wrap shrink-0 max-w-[30vw]">
          {(problem.tags ?? []).length === 0 ? (
            <Badge variant="outline" className="text-xs">
              No tags
            </Badge>
          ) : (
            (problem.tags ?? []).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))
          )}
        </div>
        <div className="flex gap-1 overflow-x-auto shrink-0 max-w-[40vw] scrollbar-thin">
          {problem.links.length === 0 ? (
            <span className="text-xs text-muted-foreground whitespace-nowrap">No links</span>
          ) : (
            problem.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs border rounded px-1.5 py-0.5 hover:bg-muted whitespace-nowrap"
              >
                {platformBadge[l.platform] ?? l.platform}
              </a>
            ))
          )}
        </div>
        <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={handleOpen} aria-label="Edit links">
          ✎
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit — {problem.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags (sheets)</h4>
              <div className="flex flex-wrap gap-1">
                {draftTags.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No tags — add one below</span>
                ) : (
                  draftTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        onClick={() => setDraftTags((prev) => prev.filter((t) => t !== tag))}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="New tag (e.g., Love-Babbar)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(newTag);
                    }
                  }}
                />
                <Button variant="outline" size="sm" onClick={() => addTag(newTag)}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TAGS.map((tag) => {
                  const active = draftTags.some((t) => t.toLowerCase() === tag.toLowerCase());
                  return (
                    <Badge
                      key={tag}
                      variant={active ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (active) setDraftTags((prev) => prev.filter((t) => t.toLowerCase() !== tag.toLowerCase()));
                        else addTag(tag);
                      }}
                    >
                      {tag} {active ? "✓" : "+"}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Links</h4>
              {draft.map((l, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Select
                    value={l.platform}
                    onValueChange={(v: string | null) => {
                      if (v === null) return;
                      setDraft((d) => d.map((x, i) => (i === idx ? { ...x, platform: v as PlatformLink["platform"] } : x)));
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LeetCode">LeetCode</SelectItem>
                      <SelectItem value="TakeUForward">TakeUForward</SelectItem>
                      <SelectItem value="Code360">Code360</SelectItem>
                      <SelectItem value="GeeksForGeeks">GeeksForGeeks</SelectItem>
                      <SelectItem value="InterviewBit">InterviewBit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="https://..."
                    value={l.url}
                    onChange={(e) => setDraft((d) => d.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setDraft((d) => d.filter((_, i) => i !== idx))}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setDraft((d) => [...d, { platform: "LeetCode", url: "" }])}>
                Add link
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
