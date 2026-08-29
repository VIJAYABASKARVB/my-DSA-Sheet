"use client";
import { useState } from "react";
import { Circle, CheckCircle2, RotateCw, Pencil, ArrowUpRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecallButtons } from "./RecallButtons";
import type { MergedProblem, Status, PlatformLink, Tag, RecallStatus } from "@/lib/types";

const difficultyStyles: Record<string, string> = {
  Easy: "bg-emerald/10 text-emerald border-emerald/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
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
    color: "text-zinc-500",
    bg: "bg-white/[0.04]",
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
        className="group/row flex flex-wrap sm:flex-nowrap items-center gap-2.5 md:gap-3 py-3 px-3 md:px-4 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] active:bg-white/[0.03] will-change-transform transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
      >
        {/* Status — magnetic */}
        <button
          aria-label={`Status: ${status}. Click to cycle.`}
          onClick={() => onStatusChange(problem.id, cycle[status])}
          className={`group/status w-8 h-8 rounded-full border flex items-center justify-center shrink-0 will-change-transform transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.92] hover:scale-105 ${cfg.bg} ${cfg.border} ${cfg.color}`}
        >
          <StatusIcon
            className={`w-3.5 h-3.5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/status:scale-110 ${status === "review" ? "group-hover/status:rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>

        {/* Recall */}
        {onRecallChange && (
          <RecallButtons
            problemId={problem.id}
            recallStatus={recallStatus}
            onUpdate={onRecallChange}
          />
        )}

        {/* Name */}
        <span className="flex-1 min-w-0 truncate text-[13px] font-medium tracking-tight text-zinc-100 group-hover/row:text-white transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          {problem.name}
        </span>

        {/* Difficulty pill — rounded-full */}
        <Badge
          variant="outline"
          className={`rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 px-2.5 py-1 border ${difficultyStyles[problem.difficulty]}`}
        >
          {problem.difficulty}
        </Badge>

        {/* Tags — pill */}
        <div className="flex gap-1 flex-wrap shrink-0 max-w-[30vw] hidden sm:flex">
          {(problem.tags ?? []).length === 0 ? (
            <span className="text-[10px] text-zinc-600 italic">no tags</span>
          ) : (
            (problem.tags ?? []).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full text-[10px] bg-white/[0.04] border-white/5 text-zinc-400 px-2 py-0.5 font-medium">
                {tag}
              </Badge>
            ))
          )}
        </div>

        {/* Platform links — button-in-button */}
        <div className="flex gap-1.5 overflow-x-auto shrink-0 max-w-[42vw] scrollbar-none">
          {problem.links.length === 0 ? (
            <span className="text-[10px] text-zinc-600 whitespace-nowrap hidden md:inline">no links</span>
          ) : (
            problem.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 text-[11px] font-mono text-zinc-400 hover:text-white whitespace-nowrap will-change-transform transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
              >
                {platformBadge[l.platform] ?? l.platform}
                <span className="w-5 h-5 rounded-full bg-white/10 group-hover/link:bg-white group-hover/link:text-black flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/link:translate-x-[1px] group-hover/link:-translate-y-[1px] group-hover/link:scale-105">
                  <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                </span>
              </a>
            ))
          )}
        </div>

        {/* Edit — island button */}
        <button
          onClick={handleOpen}
          aria-label="Edit links and tags"
          className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0 text-zinc-500 hover:text-white hover:bg-white/[0.08] hover:border-white/10 will-change-transform transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.92] hover:scale-105 group/edit"
        >
          <Pencil className="w-3.5 h-3.5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/edit:rotate-12" strokeWidth={1.25} />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto bg-[#0A0A0A]/90 backdrop-blur-3xl border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] rounded-[2rem] p-1.5 gap-0">
          <div className="rounded-[calc(2rem-0.375rem)] bg-zinc-900 border border-white/5 p-6">
            <DialogHeader className="pb-4 border-b border-white/5 mb-6">
              <DialogTitle className="text-foreground font-[var(--font-instrument-serif)] text-xl tracking-tight">{problem.name}</DialogTitle>
              <p className="text-xs text-zinc-500 mt-1">Edit tags and platform links — synced to Firestore overrides.</p>
            </DialogHeader>
            <div className="space-y-6">
              {/* Tags */}
              <div className="space-y-3">
                <h4 className="eyebrow !bg-white/[0.04] !text-zinc-400 !border-white/5 w-fit">Tags</h4>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {draftTags.length === 0 ? (
                    <span className="text-xs text-zinc-600 italic py-1">No tags yet</span>
                  ) : (
                    draftTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full gap-1.5 pr-1 bg-white/[0.06] border-white/10 text-zinc-200 hover:bg-white/[0.08]">
                        {tag}
                        <button
                          onClick={() => setDraftTags((prev) => prev.filter((t) => t !== tag))}
                          className="ml-0.5 w-5 h-5 rounded-full bg-white/10 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
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
                    className="rounded-full bg-white/[0.04] border-white/10 text-sm focus-visible:border-emerald/30 focus-visible:ring-0 h-9"
                  />
                  <button onClick={() => addTag(newTag)} className="px-4 h-9 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-100 transition-colors shrink-0">
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
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                          active
                            ? "bg-emerald text-white border-emerald shadow-[0_2px_10px_rgba(16,185,129,0.25)]"
                            : "bg-white/[0.04] text-zinc-400 border-white/5 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3">
                <h4 className="eyebrow !bg-white/[0.04] !text-zinc-400 !border-white/5 w-fit">Links</h4>
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
                      <SelectTrigger className="w-[160px] rounded-full bg-white/[0.04] border-white/10 text-sm h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 rounded-2xl">
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
                      className="rounded-full bg-white/[0.04] border-white/10 text-sm focus-visible:border-emerald/30 focus-visible:ring-0 h-9 flex-1"
                    />
                    <button
                      onClick={() => setDraft((d) => d.filter((_, i) => i !== idx))}
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 flex items-center justify-center transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" strokeWidth={1.25} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setDraft((d) => [...d, { platform: "LeetCode", url: "" }])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[14px] leading-none">+</span>
                  Add link
                </button>
              </div>
            </div>
            <DialogFooter className="mt-8 gap-2 sm:gap-2">
              <button onClick={() => setOpen(false)} className="px-5 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="group inline-flex items-center gap-1 pl-5 pr-1 py-1 rounded-full bg-emerald hover:bg-emerald/90 text-white text-sm font-medium transition-all active:scale-[0.98]">
                Save
                <span className="w-7 h-7 rounded-full bg-white text-emerald flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </span>
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
