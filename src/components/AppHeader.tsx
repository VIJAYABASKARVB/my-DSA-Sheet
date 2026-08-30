"use client";

import { useMemo, useState, useEffect } from "react";
import { BookOpen, Code2, LogIn, LogOut, Clock, ArrowUpRight } from "lucide-react";
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
    <svg
      width={size}
      height={size}
      className="rotate-[-90deg]"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${value}% solved`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-white/[0.06]"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-emerald"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.32,0.72,0,1)" }}
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
  const [menuOpen, setMenuOpen] = useState(false);

  // lock scroll when overlay open
  useEffect(() => {
    if (menuOpen) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <a href="#sheet-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-emerald focus:text-white focus:text-sm focus:font-medium">
        Skip to content
      </a>
      {/* Fixed island wrapper — detached from top, mx-auto, w-max logic via max-width */}
      <div className="fixed top-4 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
        <header
          role="banner"
          className="pointer-events-auto w-full max-w-[1160px] glass-island rounded-full px-2 py-1.5 flex items-center justify-between gap-2 md:gap-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ willChange: "transform" }}
        >
          {/* Left — brand lockup */}
          <div className="flex items-center gap-3 pl-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center shadow-[0_2px_12px_rgba(16,185,129,0.35)]">
              <Code2 className="w-4 h-4 text-white" strokeWidth={1.6} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[13px] font-semibold tracking-[-0.02em] text-foreground">DSA</span>
              <span className="text-[11px] tracking-[0.14em] uppercase font-medium text-muted-foreground">Sheet</span>
              <span className="hidden sm:inline-flex ml-2 items-center gap-1.5 rounded-full bg-emerald/10 border border-emerald/15 px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald status-pulse" />
                <span className="text-[10px] font-medium tracking-wide text-emerald">vanguard</span>
              </span>
            </div>
          </div>

          {/* Center — topic count + due (desktop) + progress */}
          <nav aria-label="Sheet stats" className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground rounded-full bg-white/[0.04] border border-white/5 px-3 py-1.5">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.25} aria-hidden="true" />
              <span className="font-mono text-foreground">{topicCount}</span>
              <span className="text-muted-foreground">topics</span>
              <span className="mx-1 w-px h-3 bg-white/10" aria-hidden="true" />
              <span className="font-mono text-foreground">{totalProblems}</span>
              <span>problems</span>
            </div>
            {typeof dueCount === "number" && dueCount > 0 && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[11px] gap-1 px-2.5 py-1 rounded-full"
                aria-label={`${dueCount} problems due for review`}
              >
                <Clock className="w-3 h-3" strokeWidth={1.25} aria-hidden="true" />
                {dueCount} due
              </Badge>
            )}
          </nav>

          {/* Progress rail — always visible */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/5 pl-1 pr-3 py-1">
              <div className="relative">
                <CircularProgress value={pct} size={32} strokeWidth={2.5} />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-semibold text-emerald">
                  {pct}
                </span>
              </div>
              <div className="text-xs leading-none">
                <span className="font-mono font-medium text-foreground">{solvedCount}</span>
                <span className="text-muted-foreground"> / {totalProblems}</span>
                <div className="text-[10px] text-muted-foreground tracking-wide">solved</div>
              </div>
            </div>

            {/* Mobile progress micro */}
            <div className="flex sm:hidden items-center gap-2" aria-label={`${pct}% solved`}>
              <div className="relative">
                <CircularProgress value={pct} size={28} strokeWidth={2.25} />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-semibold text-emerald" aria-hidden="true">
                  {pct}
                </span>
              </div>
            </div>

            <div className="hidden md:block h-6 w-px bg-white/10" aria-hidden="true" />

            {/* Auth — desktop */}
            <div className="hidden md:flex items-center gap-2">
              {authLoading ? (
                <div className="w-24 h-8 rounded-full bg-white/5 animate-pulse" aria-label="Loading auth" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/5 pl-1 pr-2 py-1">
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.photoURL}
                        alt={user.displayName ?? user.email ?? "User"}
                        className="w-6 h-6 rounded-full border border-white/10 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald/15 border border-emerald/20 flex items-center justify-center text-[10px] font-mono text-emerald" aria-hidden="true">
                        {(user.displayName ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-medium text-foreground max-w-[110px] truncate">
                      {user.displayName ?? user.email?.split("@")[0] ?? "Signed in"}
                    </span>
                  </div>
                  <button
                    onClick={onSignOut}
                    aria-label="Sign out"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium px-3 py-1.5 pr-1.5 text-zinc-300 hover:text-white transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/50"
                  >
                    <span className="hidden lg:inline">Sign out</span>
                    <span className="lg:hidden">Out</span>
                    <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/15 flex items-center justify-center transition-all duration-200 ease-out group-hover:translate-x-[1px] group-hover:-translate-y-[1px] ml-1">
                      <LogOut className="w-3 h-3" strokeWidth={1.25} aria-hidden="true" />
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  disabled={!!signingIn}
                  aria-label="Sign in with Google"
                  className="group inline-flex items-center gap-1 rounded-full bg-emerald hover:bg-emerald/90 text-white text-xs font-medium pl-3 pr-1 py-1 transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {signingIn ? "Signing in…" : "Sign in"}
                  <span className="w-7 h-7 rounded-full bg-white text-emerald flex items-center justify-center transition-all duration-200 ease-out group-hover:translate-x-[1px] group-hover:-translate-y-[1px]">
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                </button>
              )}
            </div>

            {/* Hamburger morph — visible below md */}
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-11 h-11 rounded-full bg-white text-black flex items-center justify-center relative overflow-hidden shrink-0 active:scale-[0.96] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/50"
            >
              <span className="relative w-3.5 h-3.5 flex items-center justify-center">
                <span
                  className={`absolute h-px w-3.5 bg-black transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "rotate-45" : "-translate-y-1"}`}
                />
                <span
                  className={`absolute h-px w-3.5 bg-black transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "-rotate-45" : "translate-y-1"}`}
                />
                <span
                  className={`absolute h-px w-3.5 bg-black transition-all duration-300 ${menuOpen ? "opacity-0 scale-0" : "opacity-100"}`}
                />
              </span>
            </button>
          </div>
        </header>
      </div>

      {/* Spacer to prevent content under fixed island */}
      <div className="h-[68px]" aria-hidden="true" />

      {/* Expanded overlay — massive glass */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 z-20 flex flex-col md:hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div className="absolute inset-0 bg-black/75 backdrop-blur-3xl" onClick={() => setMenuOpen(false)} aria-hidden="true" />
        <div className="relative mt-[76px] mx-4 rounded-[2rem] glass-island p-1.5 overflow-hidden flex-1 mb-4 flex flex-col">
          <div className="flex-1 rounded-[calc(2rem-0.375rem)] bg-[#0A0A0A] border border-white/5 p-6 overflow-y-auto">
            {/* Staggered mask reveals */}
            <div className="space-y-6">
              <div
                className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100 blur-0" : "translate-y-12 opacity-0 blur-[6px]"} delay-100`}
              >
                <div className="eyebrow mb-3">Progress</div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <CircularProgress value={pct} size={56} strokeWidth={3} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-semibold text-emerald">
                      {pct}%
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-mono font-semibold text-foreground">
                      {solvedCount} / {totalProblems}
                    </div>
                    <div className="text-xs text-muted-foreground">{topicCount} topics · {totalProblems} problems</div>
                    {typeof dueCount === "number" && dueCount > 0 && (
                      <Badge variant="outline" className="mt-2 bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs gap-1">
                        <Clock className="w-3 h-3" strokeWidth={1.25} /> {dueCount} due for review
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`h-px bg-white/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "opacity-100" : "opacity-0"} delay-150`}
              />

              <div
                className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100 blur-0" : "translate-y-12 opacity-0 blur-[6px]"} delay-[150ms]`}
              >
                <div className="eyebrow mb-3">Topics</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" strokeWidth={1.25} />
                  <span className="font-mono text-foreground text-base">{topicCount}</span> tracked topics
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Arrays → Two Pointers → Prefix Sum → Trees & beyond. Curated for depth, not sprawl.
                </p>
              </div>

              <div
                className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? "translate-y-0 opacity-100 blur-0" : "translate-y-12 opacity-0 blur-[6px]"} delay-[200ms]`}
              >
                <div className="eyebrow mb-3">Account</div>
                {authLoading ? (
                  <div className="h-12 rounded-2xl bg-white/5 animate-pulse" />
                ) : user ? (
                  <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald/15 border border-emerald/20 flex items-center justify-center text-sm font-mono text-emerald">
                          {(user.displayName ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">{user.displayName ?? user.email?.split("@")[0]}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onSignOut?.();
                      }}
                      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.25} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSignIn?.();
                    }}
                    disabled={!!signingIn}
                    className="group w-full inline-flex items-center justify-between rounded-full bg-emerald hover:bg-emerald/90 text-white text-sm font-medium pl-5 pr-1.5 py-1.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" strokeWidth={1.25} />
                      {signingIn ? "Signing in…" : "Sign in with Google"}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white text-emerald flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
