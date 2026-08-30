"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

function CircularProgress({
  value,
  size = 32,
  strokeWidth = 1.75,
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
        className="text-border"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="text-foreground"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.16,1,0.3,1)" }}
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

  useEffect(() => {
    if (menuOpen) document.documentElement.style.overflow = "hidden";
    else document.documentElement.style.overflow = "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <a
        href="#sheet-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-[6px] focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <header
        role="banner"
        className="sticky top-0 z-30 w-full bg-card/85 backdrop-blur-[8px] border-b border-border"
      >
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 h-[56px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-7 h-7 rounded-[6px] bg-primary flex items-center justify-center">
                <span className="font-mono text-[10px] font-semibold text-primary-foreground tracking-widest">DSA</span>
              </span>
              <span className="hidden sm:flex items-baseline gap-1.5">
                <span className="font-mono text-[13px] font-semibold tracking-[-0.02em] text-foreground">DSA</span>
                <span className="text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">Sheet</span>
              </span>
            </Link>
            <span className="hidden lg:block w-px h-5 bg-border" aria-hidden="true" />
            <nav aria-label="Sheet stats" className="hidden lg:flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="font-mono text-foreground font-medium">{topicCount}</span> topics
              </span>
              <span className="w-px h-3 bg-border" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="font-mono text-foreground font-medium">{totalProblems}</span> problems
              </span>
              {typeof dueCount === "number" && dueCount > 0 && (
                <>
                  <span className="w-px h-3 bg-border" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#FBF3DB] dark:bg-[#FBF3DB]/16 border border-border px-2 py-0.5 text-[11px] font-medium text-[#956400] dark:text-[#EAB308]">
                    {dueCount} due
                  </span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Progress — minimal */}
            <div className="hidden sm:flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-[8px] border border-border bg-muted">
              <div className="relative">
                <CircularProgress value={pct} size={30} strokeWidth={1.75} />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-semibold text-foreground">
                  {pct}
                </span>
              </div>
              <div className="text-xs leading-none">
                <span className="font-mono font-medium text-foreground tabular-nums">{solvedCount}</span>
                <span className="text-muted-foreground"> / {totalProblems}</span>
                <div className="text-[10px] font-mono tracking-wide text-muted-foreground">solved</div>
              </div>
            </div>

            <div className="flex sm:hidden items-center gap-2" aria-label={`${pct}% solved`}>
              <div className="relative">
                <CircularProgress value={pct} size={28} strokeWidth={1.75} />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-semibold text-foreground" aria-hidden="true">
                  {pct}
                </span>
              </div>
            </div>

            <div className="hidden md:block h-5 w-px bg-border" aria-hidden="true" />

            <Link
              href="/sheet"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            >
              Sheet
            </Link>

            <ThemeToggle />

            <div className="hidden md:flex items-center gap-2">
              {authLoading ? (
                <div className="w-20 h-8 rounded-[6px] bg-muted border border-border animate-pulse" aria-label="Loading auth" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex items-center gap-2 rounded-[8px] border border-border bg-muted pl-1 pr-2.5 py-1">
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.photoURL}
                        alt={user.displayName ?? user.email ?? "User"}
                        className="w-6 h-6 rounded-full border border-border object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-mono text-foreground" aria-hidden="true">
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
                    className="inline-flex items-center gap-1 rounded-[6px] border border-border bg-card hover:bg-muted text-xs font-medium px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  disabled={!!signingIn}
                  aria-label="Sign in with Google"
                  className="inline-flex items-center justify-center rounded-[6px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium px-4 py-2 transition-colors active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  {signingIn ? "Signing in…" : "Sign in"}
                </button>
              )}
            </div>

            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 rounded-[6px] border border-border bg-card flex items-center justify-center shrink-0 active:scale-[0.96] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            >
              <span className="relative w-3.5 h-3.5 flex items-center justify-center">
                <span className={`absolute h-px w-3.5 bg-foreground transition-all duration-300 ${menuOpen ? "rotate-45" : "-translate-y-1"}`} />
                <span className={`absolute h-px w-3.5 bg-foreground transition-all duration-300 ${menuOpen ? "-rotate-45" : "translate-y-1"}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`md:hidden border-t border-border bg-card overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
          aria-hidden={!menuOpen}
        >
          <div className="px-4 py-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <CircularProgress value={pct} size={44} strokeWidth={1.75} />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-semibold text-foreground">
                  {pct}%
                </span>
              </div>
              <div>
                <div className="text-sm font-mono font-medium text-foreground tabular-nums">
                  {solvedCount} / {totalProblems}
                </div>
                <div className="text-xs text-muted-foreground">{topicCount} topics · {totalProblems} problems</div>
                {typeof dueCount === "number" && dueCount > 0 && (
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-[#FBF3DB] dark:bg-[#FBF3DB]/16 border border-border px-2 py-0.5 text-[11px] font-medium text-[#956400] dark:text-[#EAB308]">
                    {dueCount} due
                  </span>
                )}
              </div>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <Link
                href="/sheet"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-[8px] border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground active:scale-[0.98] transition-transform"
              >
                Open Sheet <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-[8px] border border-border bg-card px-4 py-3 text-sm font-medium text-foreground active:scale-[0.98] transition-transform"
              >
                Home <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.08em] uppercase font-medium text-muted-foreground mb-2 font-mono">Account</div>
              {authLoading ? (
                <div className="h-11 rounded-[8px] bg-muted border border-border animate-pulse" />
              ) : user ? (
                <div className="flex items-center justify-between rounded-[8px] border border-border bg-muted p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-border" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-mono text-foreground">
                        {(user.displayName ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{user.displayName ?? user.email?.split("@")[0]}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSignOut?.();
                    }}
                    className="shrink-0 rounded-[6px] border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onSignIn?.();
                  }}
                  disabled={!!signingIn}
                  className="w-full inline-flex items-center justify-center rounded-[6px] bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2.5 transition-colors active:scale-[0.98]"
                >
                  {signingIn ? "Signing in…" : "Sign in with Google"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
