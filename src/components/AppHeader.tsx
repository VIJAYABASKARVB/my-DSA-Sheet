"use client";

import { useMemo } from "react";
import { BookOpen, Code2, LogIn, LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  dueCount,
  user,
  authLoading,
  signingIn,
  onSignIn,
  onSignOut,
}: {
  solvedCount: number;
  totalProblems: number;
  topicCount: number;
  dueCount?: number;
  user?: { photoURL?: string | null; displayName?: string | null; email?: string | null } | null;
  authLoading?: boolean;
  signingIn?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
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

        {/* Right — progress ring + solved + due + auth */}
        <div className="flex items-center gap-3">
          {typeof dueCount === "number" && dueCount > 0 && (
            <Badge
              variant="outline"
              className="hidden sm:inline-flex bg-amber-500/10 text-amber-400 border-amber-500/20 text-[11px] gap-1 px-2 py-1"
            >
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              {dueCount} due
            </Badge>
          )}
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
          <div className="h-6 w-px bg-white/10 hidden sm:block" aria-hidden="true" />
          {/* Auth */}
          {authLoading ? (
            <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse" aria-label="Loading auth" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? user.email ?? "User"}
                  className="w-7 h-7 rounded-full border border-white/10 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald/15 border border-emerald/20 flex items-center justify-center text-[10px] font-mono text-emerald">
                  {(user.displayName ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                  {user.displayName ?? user.email?.split("@")[0] ?? "Signed in"}
                </span>
                {user.email && <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{user.email}</span>}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onSignOut}
                className="h-8 border-white/10 hover:bg-white/5 text-xs px-2.5"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Sign out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={onSignIn}
              disabled={!!signingIn}
              size="sm"
              className="h-8 bg-emerald hover:bg-emerald/90 text-white text-xs px-3"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              {signingIn ? "Signing in…" : "Sign in with Google"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
