"use client";

import { useMemo } from "react";
import { BookOpen, Code2 } from "lucide-react";

function CircularProgress({
  value,
  size = 40,
  strokeWidth = 3,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-white/5"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-emerald transition-all duration-500"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppHeader({
  solvedCount,
  totalProblems,
  topicCount,
}: {
  solvedCount: number;
  totalProblems: number;
  topicCount: number;
}) {
  const pct = useMemo(
    () => (totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0),
    [solvedCount, totalProblems]
  );

  return (
    <header className="sticky top-0 z-20 glass-surface">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Brand lockup */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald/15 border border-emerald/20 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-emerald" strokeWidth={1.5} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
              DSA
            </span>
            <span className="text-xs text-muted-foreground tracking-tight">Sheet</span>
          </div>
        </div>

        {/* Center — topic count */}
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>
            <span className="font-mono text-foreground">{topicCount}</span> topics
          </span>
        </div>

        {/* Right — progress ring + solved */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <CircularProgress value={pct} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-semibold text-emerald">
                {pct}
              </span>
            </div>
            <div className="text-xs leading-tight">
              <span className="font-mono text-foreground">{solvedCount}</span>
              <span className="text-muted-foreground"> / {totalProblems}</span>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="GitHub"
          >
            <Code2 className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </header>
  );
}
