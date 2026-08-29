"use client";
import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecallStatus } from "@/lib/types";

type Props = {
  problemId: string;
  recallStatus: RecallStatus | null | undefined;
  onUpdate: (id: string, status: RecallStatus) => void;
  disabled?: boolean;
};

const buttonConfig: Record<
  RecallStatus,
  { icon: typeof CheckCircle2; label: string; active: string; inactive: string }
> = {
  easy: {
    icon: CheckCircle2,
    label: "Easy recall",
    active: "bg-emerald text-white border-emerald shadow-[0_2px_12px_rgba(16,185,129,0.35)]",
    inactive:
      "bg-emerald/10 text-emerald border-emerald/15 hover:bg-emerald/15 hover:border-emerald/25",
  },
  hint: {
    icon: Lightbulb,
    label: "Needed hint",
    active: "bg-amber-500 text-white border-amber-500 shadow-[0_2px_12px_rgba(245,158,11,0.35)]",
    inactive:
      "bg-amber-500/10 text-amber-400 border-amber-500/15 hover:bg-amber-500/15 hover:border-amber-500/25",
  },
  blank: {
    icon: XCircle,
    label: "Blanked out",
    active: "bg-red-500 text-white border-red-500 shadow-[0_2px_12px_rgba(239,68,68,0.35)]",
    inactive:
      "bg-red-500/10 text-red-400 border-red-500/15 hover:bg-red-500/15 hover:border-red-500/25",
  },
};

export function RecallButtons({ problemId, recallStatus, onUpdate, disabled }: Props) {
  return (
    <div className="flex items-center gap-1 shrink-0" role="group" aria-label="Recall status">
      {(Object.keys(buttonConfig) as RecallStatus[]).map((key) => {
        const cfg = buttonConfig[key];
        const Icon = cfg.icon;
        const isActive = recallStatus === key;
        return (
          <button
            key={key}
            aria-label={cfg.label}
            aria-pressed={isActive}
            title={cfg.label}
            disabled={disabled}
            onClick={() => onUpdate(problemId, key)}
            className={cn(
              "w-7 h-7 rounded-full border flex items-center justify-center shrink-0",
              "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
              "active:scale-[0.92] hover:scale-105 will-change-transform",
              "disabled:opacity-50 disabled:pointer-events-none",
              isActive ? cfg.active : cfg.inactive
            )}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}
