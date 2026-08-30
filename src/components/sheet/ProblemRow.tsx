"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecallButtons } from "./RecallButtons";
import type { MergedProblem, Status, PlatformLink, Tag, RecallStatus } from "@/lib/types";

const difficultyStyles: Record<string, string> = {
  Easy: "bg-[#EDF3EC] dark:bg-[#EDF3EC]/16 text-[#346538] dark:text-[#86EFAC] border-border",
  Medium: "bg-[#FBF3DB] dark:bg-[#FBF3DB]/16 text-[#956400] dark:text-[#FDE68A] border-border",
  Hard: "bg-[#FDEBEC] dark:bg-[#FDEBEC]/16 text-[#9F2F2D] dark:text-[#FCA5A5] border-border",
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

const statusConfig: Record<Status, { label: string; bg: string; border: string; text: string }> = {
  unsolved: {
    label: "○",
    bg: "bg-card",
    border: "border-border",
    text: "text-muted-foreground",
  },
  solved: {
    label: "✓",
    bg: "bg-primary",
    border: "border-primary",
    text: "text-primary-foreground",
  },
  review: {
    label: "↻",
    bg: "bg-[#FBF3DB] dark:bg-[#FBF3DB]/16",
    border: "border-border",
    text: "text-[#956400] dark:text-[#EAB308]",
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

  return (
    <>
      <div
        id={`problem-${problem.id}`}
        className="group/row flex flex-wrap sm:flex-nowrap items-center gap-2.5 md:gap-3 py-2.5 px-3 md:px-4 border-b border-border last:border-b-0 hover:bg-muted/60 transition-colors"
      >
        <button
          aria-label={`Status: ${status}. Click to cycle to ${cycle[status]}.`}
          onClick={() => onStatusChange(problem.id, cycle[status])}
          className={`w-7 h-7 rounded-[6px] border flex items-center justify-center shrink-0 text-xs font-medium transition-colors active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${cfg.bg} ${cfg.border} ${cfg.text}`}
        >
          <span aria-hidden="true">{cfg.label}</span>
        </button>

        {onRecallChange && (
          <RecallButtons
            problemId={problem.id}
            recallStatus={recallStatus}
            onUpdate={onRecallChange}
          />
        )}

        <span className="flex-1 min-w-[120px] truncate text-[13px] font-medium tracking-tight text-foreground group-hover/row:text-foreground transition-colors">
          {problem.name}
        </span>

        <Badge
          variant="outline"
          aria-label={`Difficulty ${problem.difficulty}`}
          className={`rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 px-2.5 py-1 border ${difficultyStyles[problem.difficulty]}`}
        >
          {problem.difficulty}
        </Badge>

        <div className="hidden sm:flex gap-1 flex-wrap shrink-0 max-w-[28vw]">
          {(problem.tags ?? []).length === 0 ? (
            <span className="text-[10px] text-muted-foreground italic">no tags</span>
          ) : (
            (problem.tags ?? []).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full text-[10px] bg-card border-border text-muted-foreground px-2 py-0.5 font-medium">
                {tag}
              </Badge>
            ))
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto shrink-0 max-w-[40vw] scrollbar-none -mr-1 pr-1">
          {problem.links.length === 0 ? (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden md:inline">no links</span>
          ) : (
            problem.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${l.platform} — ${problem.name}`}
                className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-[6px] border border-border bg-card hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
              >
                {platformBadge[l.platform] ?? l.platform}
                <span className="w-5 h-5 rounded-[4px] border border-border bg-muted flex items-center justify-center text-[10px]" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))
          )}
        </div>

        <button
          onClick={handleOpen}
          aria-label={`Edit links and tags for ${problem.name}`}
          className="w-7 h-7 rounded-[6px] border border-border bg-card flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
        >
          <span aria-hidden="true" className="text-xs">✎</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto bg-card border border-border rounded-[12px] p-0 gap-0 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="p-6">
            <DialogHeader className="pb-4 border-b border-border mb-6">
              <DialogTitle className="text-foreground font-[var(--font-newsreader)] text-xl tracking-tight">{problem.name}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">Edit tags and platform links — synced to Firestore overrides.</p>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="eyebrow w-fit">Tags</h4>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {draftTags.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic py-1">No tags yet</span>
                  ) : (
                    draftTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full gap-1.5 pr-1 bg-muted border-border text-foreground hover:bg-border">
                        {tag}
                        <button
                          onClick={() => setDraftTags((prev) => prev.filter((t) => t !== tag))}
                          className="ml-0.5 w-5 h-5 rounded-full bg-card border border-border hover:bg-[#FDEBEC] dark:hover:bg-[#FDEBEC]/15 hover:text-[#9F2F2D] dark:hover:text-[#FCA5A5] flex items-center justify-center transition-colors"
                          aria-label={`Remove ${tag}`}
                        >
                          <span className="text-[10px]">×</span>
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
                    className="rounded-[8px] bg-muted border-border text-sm focus-visible:border-ring/20 focus-visible:ring-0 h-9"
                  />
                  <button onClick={() => addTag(newTag)} className="px-4 h-9 rounded-[6px] bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors shrink-0">
                    Add
                  </button>
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
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="eyebrow w-fit">Links</h4>
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
                      <SelectTrigger className="w-[160px] rounded-[8px] bg-muted border-border text-sm h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border rounded-[8px]">
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
                      className="rounded-[8px] bg-muted border-border text-sm focus-visible:border-ring/20 focus-visible:ring-0 h-9 flex-1"
                    />
                    <button
                      onClick={() => setDraft((d) => d.filter((_, i) => i !== idx))}
                      className="w-8 h-8 rounded-[6px] bg-card border border-border text-muted-foreground hover:text-[#9F2F2D] dark:hover:text-[#FCA5A5] hover:bg-[#FDEBEC] dark:hover:bg-[#FDEBEC]/15 flex items-center justify-center transition-colors shrink-0"
                    >
                      <span className="text-sm">×</span>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setDraft((d) => [...d, { platform: "LeetCode", url: "" }])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-border bg-muted hover:bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-xs leading-none">+</span>
                  Add link
                </button>
              </div>
            </div>
            <DialogFooter className="mt-8 gap-2 sm:gap-2 border-t border-border bg-muted/50 -mx-6 -mb-6 p-4 rounded-b-[12px]">
              <button onClick={() => setOpen(false)} className="px-5 py-2 rounded-[6px] border border-border bg-card hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="inline-flex items-center justify-center rounded-[6px] bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-5 py-2 transition-colors active:scale-[0.98]">
                Save
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
