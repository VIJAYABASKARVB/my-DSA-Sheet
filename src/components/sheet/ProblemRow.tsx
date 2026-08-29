"use client";
import { useState } from "react";
import { Circle, CheckCircle2, RotateCw, Pencil, ExternalLink, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecallButtons } from "./RecallButtons";
import type { MergedProblem, Status, PlatformLink, Tag, RecallStatus } from "@/lib/types";

const difficultyStyles: Record<string, string> = {
  Easy: "bg-emerald/10 text-emerald border-emerald/15",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/15",
  Hard: "bg-red-500/10 text-red-400 border-red-500/15",
};
const platformBadge: Record<string, string> = {
  LeetCode: "LC",
  NeetCode: "NC",
  TakeUForward: "TUF",
  Code360: "C360",
  GeeksForGeeks: "GFG",
  InterviewBit: "IB",
};
const cycle: Record<Status, Status> = { unsolved: "solved", solved: "review", review: "unsolved" };

const statusConfig: Record<Status, { icon: typeof Circle; color: string; bg: string; border: string }> = {
  unsolved: {
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-white/5",
    border: "border-white/10",
  },
  solved: {
    icon: CheckCircle2,
    color: "text-emerald",
    bg: "bg-emerald/10",
    border: "border-emerald/20",
  },
  review: {
    icon: RotateCw,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
};

const SUGGESTED_TAGS: Tag[] = ["Neetcode", "Striver", "Others"];

export function ProblemRow({
  problem,
  status,
  recallStatus,
  onStatusChange,
  onRecallChange,
  onEditLinks,
  onEditTags,
}: {
  problem: MergedProblem;
  status: Status;
  recallStatus?: RecallStatus | null;
  onStatusChange: (id: string, next: Status) => void;
  onRecallChange?: (id: string, next: RecallStatus) => void;
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

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <>
      <div
        id={`problem-${problem.id}`}
        className="flex flex-wrap sm:flex-nowrap items-center gap-3 py-3 px-4 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors active:scale-[0.99]"
      >
        {/* Status button */}
        <button
          aria-label={`Status: ${status}. Click to cycle.`}
          onClick={() => onStatusChange(problem.id, cycle[status])}
          className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all ${cfg.bg} ${cfg.border} ${cfg.color}`}
        >
          <StatusIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>

        {/* Recall status buttons */}
        {onRecallChange && (
          <RecallButtons
            problemId={problem.id}
            recallStatus={recallStatus}
            onUpdate={onRecallChange}
          />
        )}

        {/* Problem name */}
        <span className="flex-1 min-w-0 truncate text-sm font-medium text-foreground">
          {problem.name}
        </span>

        {/* Difficulty pill */}
        <Badge
          variant="outline"
          className={`text-[10px] font-semibold uppercase tracking-wider shrink-0 px-2 py-0.5 ${difficultyStyles[problem.difficulty]}`}
        >
          {problem.difficulty}
        </Badge>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap shrink-0 max-w-[30vw]">
          {(problem.tags ?? []).length === 0 ? (
            <span className="text-[10px] text-muted-foreground/50 italic">no tags</span>
          ) : (
            (problem.tags ?? []).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] bg-white/5 border-white/5 text-zinc-400 px-1.5 py-0">
                {tag}
              </Badge>
            ))
          )}
        </div>

        {/* Platform links */}
        <div className="flex gap-1 overflow-x-auto shrink-0 max-w-[40vw] scrollbar-none">
          {problem.links.length === 0 ? (
            <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap">no links</span>
          ) : (
            problem.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono border border-white/10 rounded-md px-2 py-0.5 text-zinc-400 hover:bg-white/5 hover:text-foreground transition-colors whitespace-nowrap flex items-center gap-1"
              >
                {platformBadge[l.platform] ?? l.platform}
                <ExternalLink className="w-2.5 h-2.5 opacity-40" strokeWidth={1.5} />
              </a>
            ))
          )}
        </div>

        {/* Edit button */}
        <button
          onClick={handleOpen}
          aria-label="Edit links and tags"
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors active:scale-95"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto bg-zinc-900 border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{problem.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Tags section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {draftTags.length === 0 ? (
                  <span className="text-xs text-muted-foreground/60 italic">No tags yet</span>
                ) : (
                  draftTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1.5 pr-1 bg-white/5 border-white/5 text-zinc-300">
                      {tag}
                      <button
                        onClick={() => setDraftTags((prev) => prev.filter((t) => t !== tag))}
                        className="ml-0.5 rounded-full hover:bg-white/10 p-0.5 transition-colors"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="w-2.5 h-2.5" strokeWidth={1.5} />
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
                  className="bg-white/[0.04] border-white/5 text-sm focus-visible:border-emerald/40 focus-visible:ring-emerald/20"
                />
                <Button variant="outline" size="sm" onClick={() => addTag(newTag)} className="border-white/10 hover:bg-white/5">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((tag) => {
                  const active = draftTags.some((t) => t.toLowerCase() === tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (active) setDraftTags((prev) => prev.filter((t) => t.toLowerCase() !== tag.toLowerCase()));
                        else addTag(tag);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        active
                          ? "bg-emerald/15 text-emerald border border-emerald/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Links section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Links</h4>
              {draft.map((l, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Select
                    value={l.platform}
                    onValueChange={(v: string | null) => {
                      if (v === null) return;
                      setDraft((d) =>
                        d.map((x, i) => (i === idx ? { ...x, platform: v as PlatformLink["platform"] } : x))
                      );
                    }}
                  >
                    <SelectTrigger className="w-[160px] bg-white/[0.04] border-white/5 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-white/10">
                      <SelectItem value="LeetCode">LeetCode</SelectItem>
                      <SelectItem value="NeetCode">NeetCode</SelectItem>
                      <SelectItem value="TakeUForward">TakeUForward</SelectItem>
                      <SelectItem value="Code360">Code360</SelectItem>
                      <SelectItem value="GeeksForGeeks">GeeksForGeeks</SelectItem>
                      <SelectItem value="InterviewBit">InterviewBit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="https://..."
                    value={l.url}
                    onChange={(e) =>
                      setDraft((d) => d.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))
                    }
                    className="bg-white/[0.04] border-white/5 text-sm focus-visible:border-emerald/40 focus-visible:ring-emerald/20"
                  />
                  <button
                    onClick={() => setDraft((d) => d.filter((_, i) => i !== idx))}
                    className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDraft((d) => [...d, { platform: "LeetCode", url: "" }])}
                className="border-white/10 hover:bg-white/5"
              >
                Add link
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-white/10 hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-emerald hover:bg-emerald/90 text-white">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
