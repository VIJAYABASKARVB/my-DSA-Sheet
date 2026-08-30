"use client";
import { cn } from "@/lib/utils";
import type { RecallStatus } from "@/lib/types";

type Props = {
  problemId: string;
  recallStatus: RecallStatus | null | undefined;
  onUpdate: (id: string, status: RecallStatus) => void;
  disabled?: boolean;
};

const buttonConfig: Record<RecallStatus, { label: string; active: string; inactive: string; short: string }> = {
  easy: {
    label: "Easy recall",
    short: "E",
    active: "bg-primary text-primary-foreground border-primary",
    inactive:
      "bg-[#EDF3EC] dark:bg-[#EDF3EC]/10 text-[#346538] dark:text-[#86EFAC] border-border hover:bg-[#E1F0E3] dark:hover:bg-[#EDF3EC]/15",
  },
  hint: {
    label: "Needed hint",
    short: "H",
    active: "bg-primary text-primary-foreground border-primary",
    inactive:
      "bg-[#FBF3DB] dark:bg-[#FBF3DB]/10 text-[#956400] dark:text-[#FDE68A] border-border hover:bg-[#F5EED0] dark:hover:bg-[#FBF3DB]/15",
  },
  blank: {
    label: "Blanked out",
    short: "B",
    active: "bg-primary text-primary-foreground border-primary",
    inactive:
      "bg-[#FDEBEC] dark:bg-[#FDEBEC]/10 text-[#9F2F2D] dark:text-[#FCA5A5] border-border hover:bg-[#FBDADD] dark:hover:bg-[#FDEBEC]/15",
  },
};

export function RecallButtons({ problemId, recallStatus, onUpdate, disabled }: Props) {
  return (
    <div className="flex items-center gap-1 shrink-0" role="group" aria-label={`Recall for ${problemId}`}>
      {(Object.keys(buttonConfig) as RecallStatus[]).map((key) => {
        const cfg = buttonConfig[key];
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
              "w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] border flex items-center justify-center shrink-0 text-[10px] font-mono font-semibold",
              "transition-colors duration-150",
              "active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
              "disabled:opacity-50 disabled:pointer-events-none",
              isActive ? cfg.active : cfg.inactive
            )}
          >
            {cfg.short}
          </button>
        );
      })}
    </div>
  );
}
