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
    active: "bg-[#111111] text-white border-[#111111]",
    inactive: "bg-[#EDF3EC] text-[#346538] border-[#EAEAEA] hover:bg-[#E1F0E3] hover:border-[#D0D0CE]",
  },
  hint: {
    label: "Needed hint",
    short: "H",
    active: "bg-[#111111] text-white border-[#111111]",
    inactive: "bg-[#FBF3DB] text-[#956400] border-[#EAEAEA] hover:bg-[#F5EED0] hover:border-[#D0D0CE]",
  },
  blank: {
    label: "Blanked out",
    short: "B",
    active: "bg-[#111111] text-white border-[#111111]",
    inactive: "bg-[#FDEBEC] text-[#9F2F2D] border-[#EAEAEA] hover:bg-[#FBDADD] hover:border-[#D0D0CE]",
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
              "active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/20",
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
