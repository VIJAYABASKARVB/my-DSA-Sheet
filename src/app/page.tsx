"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const FAQS = [
  {
    q: "How is this different from a plain list?",
    a: "Every problem lives in Topic → Pattern → Problem. Morris threading comes before Flatten Binary Tree because the pointer technique is the prerequisite. Arrays before Trees. You learn dependency, not just difficulty.",
  },
  {
    q: "What does the filter bar do?",
    a: "Search, Topic, Difficulty, Status and Tags combine with AND logic. It is sticky and always present. Type two characters and the view narrows; filtered patterns auto-expand so the next problem is one glance away.",
  },
  {
    q: "How does spaced repetition work?",
    a: "After marking solved, choose recall: Easy (+7 days), Hint (+2 days) or Blank (+1 day). Due items sort by most overdue first. Click any due item and it scrolls to the row with a subtle highlight.",
  },
  {
    q: "Where is my data stored?",
    a: "Firestore per-user: users/{uid}/progress and users/{uid}/spacedReviews plus per-problem overrides for links and tags. Sign in with Google to sync across devices; without sign-in edits are session-local and revert on refresh.",
  },
];

function MinimalIcon({ kind }: { kind: "layers" | "search" | "clock" | "check" }) {
  if (kind === "layers")
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2.5" y="3" width="11" height="3.2" rx="0.8" stroke="#111111" strokeWidth="1.3" />
        <rect x="2.5" y="6.8" width="11" height="3.2" rx="0.8" stroke="#111111" strokeWidth="1.3" opacity="0.55" />
        <rect x="2.5" y="10.6" width="11" height="1.5" rx="0.8" stroke="#787774" strokeWidth="1.1" />
      </svg>
    );
  if (kind === "search")
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.2" stroke="#111111" strokeWidth="1.35" />
        <path d="M10.2 10.2 L13 13" stroke="#111111" strokeWidth="1.35" strokeLinecap="round" />
      </svg>
    );
  if (kind === "clock")
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.2" stroke="#111111" strokeWidth="1.3" />
        <path d="M8 5.2 V8 L10.6 9.2" stroke="#111111" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" stroke="#111111" strokeWidth="1.3" />
      <path d="M5.2 8 L7.1 9.9 L10.9 6.1" stroke="#111111" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#111111]">
      {/* NAV — minimal editorial */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-[8px] border-b border-[#EAEAEA]">
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 h-[56px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-7 h-7 rounded-[6px] bg-[#111111] flex items-center justify-center">
              <span className="font-mono text-[10px] font-semibold text-white tracking-widest">DSA</span>
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-mono text-[13px] font-semibold tracking-[-0.02em] text-[#111111]">DSA</span>
              <span className="text-[10px] tracking-[0.14em] uppercase font-medium text-[#787774]">Sheet</span>
            </span>
            <span className="hidden sm:inline-flex ml-2 text-[10px] font-mono tracking-wide text-[#787774] border-l border-[#EAEAEA] pl-2.5">
              Minimal Archive
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-xs">
            <a href="#system" className="text-[#787774] hover:text-[#111111] transition-colors">
              System
            </a>
            <a href="#faq" className="text-[#787774] hover:text-[#111111] transition-colors">
              FAQ
            </a>
            <span className="w-px h-4 bg-[#EAEAEA]" aria-hidden="true" />
            <span className="text-[11px] font-mono text-[#787774]">
              <span className="text-[#111111] font-medium">110</span> problems · <span className="text-[#111111] font-medium">5</span> topics
            </span>
          </nav>
          <Link
            href="/sheet"
            className="inline-flex items-center justify-center rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white text-xs font-medium px-4 py-2 transition-colors active:scale-[0.98]"
          >
            Open Sheet
          </Link>
        </div>
      </header>

      {/* HERO — editorial center, warm bone, max-w-5xl */}
      <section className="relative overflow-hidden border-b border-[#EAEAEA] bg-[#F7F6F3]">
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" aria-hidden="true" />
            <span className="text-[10px] font-mono tracking-[0.08em] uppercase font-medium text-[#787774]">Curated for depth · not sprawl</span>
          </div>

          <h1 className="mt-8 max-w-[18ch] font-[var(--font-newsreader)] text-[clamp(2.6rem,6vw,4.5rem)] font-[400] leading-[0.95] tracking-[-0.04em] text-[#111111] text-balance">
            Master DSA
            <br />
            <span className="font-[var(--font-newsreader)] italic font-[300] tracking-[-0.03em] text-[#787774]">without</span> the sprawl
          </h1>

          <p className="mt-5 max-w-[62ch] text-[15px] md:text-[16px] leading-relaxed text-[#787774] text-balance">
            Striver and NeetCode merged and ordered into Topic → Pattern → Problem. 110 problems staged by learning dependency, Firestore-synced progress, and spaced repetition built for obsessive repetition.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sheet"
              className="inline-flex items-center justify-center rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white text-sm font-medium px-6 py-3 transition-colors active:scale-[0.98]"
            >
              Open your sheet
            </Link>
            <a
              href="#system"
              className="inline-flex items-center justify-center rounded-[6px] border border-[#EAEAEA] bg-white hover:bg-[#F7F6F3] text-[#111111] text-sm font-medium px-6 py-3 transition-colors active:scale-[0.98]"
            >
              See the system
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-white px-3 py-1 text-[#787774]">
              <span className="w-1 h-1 rounded-full bg-[#111111]" aria-hidden="true" /> Topic → Pattern → Problem
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-white px-3 py-1 text-[#787774]">Spaced recall · easy / hint / blank</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-white px-3 py-1 text-[#787774]">Firestore realtime</span>
          </div>

          {/* Faux-OS window preview — minimalist */}
          <div className="mt-12 md:mt-16 w-full max-w-[880px] text-left">
            <div className="rounded-[12px] border border-[#EAEAEA] bg-white overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="h-9 flex items-center justify-between px-4 border-b border-[#EAEAEA] bg-[#FBFBFA]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-white border border-[#EAEAEA]" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-white border border-[#EAEAEA]" aria-hidden="true" />
                  <span className="w-3 h-3 rounded-full bg-white border border-[#EAEAEA]" aria-hidden="true" />
                </div>
                <span className="hidden sm:inline text-[11px] font-mono text-[#787774]">arrays-hashing · 32 problems · 7 patterns</span>
                <span className="text-[11px] font-mono text-[#787774] tabular-nums">68% done</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-[#EAEAEA]">
                <div className="p-3 space-y-2">
                  {[
                    { name: "Arrays & Hashing", meta: "7 patterns · 32 problems", pct: 68 },
                    { name: "Two Pointers", meta: "7 patterns · 16 problems", pct: 42 },
                    { name: "Sliding Window", meta: "3 patterns · 19 problems", pct: 55 },
                  ].map((t) => (
                    <div key={t.name} className="flex items-center gap-3 rounded-[8px] border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-3">
                      <span className="w-0.5 h-7 rounded-full bg-[#111111]" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#111111] truncate">{t.name}</div>
                        <div className="text-xs font-mono text-[#787774]">{t.meta}</div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <div className="w-20 h-1.5 rounded-full bg-white border border-[#EAEAEA] p-0.5 overflow-hidden">
                          <div className="h-full rounded-full bg-[#111111]" style={{ width: `${t.pct}%` }} />
                        </div>
                        <span className="text-xs font-mono text-[#111111] w-8 text-right tabular-nums">{t.pct}%</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 text-center text-[11px] font-mono text-[#787774]">+ 2 more topics</div>
                </div>
                <div className="bg-[#F7F6F3] p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-[6px] bg-[#FBF3DB] border border-[#EAEAEA] flex items-center justify-center">
                      <MinimalIcon kind="clock" />
                    </span>
                    <span className="text-xs font-medium text-[#111111]">Due for Review</span>
                    <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#EAEAEA] text-[#956400]">3 due</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {["Two Sum — hint · 2d overdue", "Invert Tree — blank · due today", "Merge Intervals — easy · 1d overdue"].map((line) => (
                      <div key={line} className="rounded-[8px] border border-[#EAEAEA] bg-white px-3 py-2 text-xs text-[#2F3437] flex items-center justify-between">
                        <span className="truncate pr-2">{line}</span>
                        <span className="w-5 h-5 rounded-[6px] border border-[#EAEAEA] bg-white flex items-center justify-center shrink-0 text-[10px]">→</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-[11px] font-mono text-[#787774] text-center">Sorted most overdue first · click to jump</div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center text-[11px] font-mono text-[#787774]">Live preview · realtime sync · optimistic updates</div>
          </div>
        </div>
      </section>

      {/* SYSTEM — Bento 3 cards, asymmetrical */}
      <section id="system" className="max-w-[1160px] mx-auto w-full px-4 md:px-6 py-24 md:py-32">
        <div data-reveal className="reveal max-w-3xl mb-10">
          <div className="eyebrow">
            <MinimalIcon kind="layers" /> The system
          </div>
          <h2 className="mt-5 font-[var(--font-newsreader)] text-[clamp(1.9rem,4vw,2.75rem)] font-[400] leading-[1.05] tracking-[-0.03em] text-[#111111]">
            Not a list. A <span className="italic font-[300] text-[#787774]">hierarchy</span> that teaches order.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#787774] max-w-[58ch]">
            Every problem lives in Topic → Pattern → Problem. Morris before Flatten. Arrays before Trees. The filter bar is sticky, AND-logic, and always present — find the next problem in one glance.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-5 auto-rows-[minmax(260px,auto)]">
          <div data-reveal className="reveal flat-card col-span-12 lg:col-span-7 p-6 md:p-8 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-[#EDF3EC] border border-[#EAEAEA] px-2.5 py-1 text-[11px] font-mono font-medium text-[#346538]">Progress is the product</span>
                <h3 className="mt-4 font-[var(--font-newsreader)] text-[22px] leading-tight tracking-[-0.02em] text-[#111111]">
                  Every surface answers
                  <br />
                  <span className="text-[#787774] font-[300] italic">how much is done.</span>
                </h3>
              </div>
              <span className="hidden md:inline-flex w-8 h-8 rounded-[6px] border border-[#EAEAEA] bg-white items-center justify-center text-[#111111] text-xs" aria-hidden="true">
                →
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[8px] border border-[#EAEAEA] bg-[#FBFBFA] p-4">
                <div className="text-[10px] tracking-[0.08em] uppercase font-medium text-[#787774] font-mono">Solved</div>
                <div className="mt-1.5 text-xl font-mono font-semibold text-[#111111]">42</div>
                <div className="text-xs text-[#787774]">of 110 · 38%</div>
                <div className="mt-3 h-1.5 rounded-full bg-white border border-[#EAEAEA] p-0.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#111111] w-[38%]" />
                </div>
              </div>
              <div className="rounded-[8px] border border-[#EAEAEA] bg-[#FBFBFA] p-4">
                <div className="text-[10px] tracking-[0.08em] uppercase font-medium text-[#787774] font-mono">In review</div>
                <div className="mt-1.5 text-xl font-mono font-semibold text-[#111111]">7</div>
                <div className="text-xs text-[#787774]">spaced</div>
                <div className="mt-3 h-1.5 rounded-full bg-[#FBF3DB] border border-[#EAEAEA] overflow-hidden">
                  <div className="h-full bg-[#956400] w-[60%]" />
                </div>
              </div>
              <div className="rounded-[8px] border border-[#EAEAEA] bg-[#FBFBFA] p-4">
                <div className="text-[10px] tracking-[0.08em] uppercase font-medium text-[#787774] font-mono">Due today</div>
                <div className="mt-1.5 text-xl font-mono font-semibold text-[#111111]">3</div>
                <div className="text-xs text-[#787774]">click to jump</div>
                <div className="mt-3 inline-flex rounded-full bg-[#FBF3DB] border border-[#EAEAEA] px-2 py-1 text-[10px] font-medium text-[#956400]">most overdue first</div>
              </div>
            </div>
            <div className="mt-auto pt-5 flex items-center gap-2 text-xs text-[#787774] border-t border-[#EAEAEA]">
              <span className="w-1 h-1 rounded-full bg-[#111111]" aria-hidden="true" /> Topic bars · pattern counters · due badges — no vanity metrics.
            </div>
          </div>

          <div data-reveal className="reveal flat-card col-span-12 lg:col-span-5 p-6 md:p-8 flex flex-col bg-[#FBFBFA]">
            <div className="w-full h-28 rounded-[8px] border border-[#EAEAEA] bg-white flex items-center justify-center gap-3">
              <span className="w-10 h-10 rounded-[8px] bg-[#E1F3FE] border border-[#EAEAEA] flex items-center justify-center">
                <MinimalIcon kind="layers" />
              </span>
              <span className="w-10 h-10 rounded-[8px] bg-[#FDEBEC] border border-[#EAEAEA] flex items-center justify-center opacity-60 translate-y-1">○</span>
              <span className="w-10 h-10 rounded-[8px] bg-[#EDF3EC] border border-[#EAEAEA] flex items-center justify-center opacity-40 -translate-y-1">◇</span>
            </div>
            <div className="inline-flex w-fit mt-6 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 py-1 text-[11px] font-medium text-[#111111]">
              Learn in dependency order
            </div>
            <h3 className="mt-3 font-[var(--font-newsreader)] text-[22px] leading-none tracking-[-0.02em] text-[#111111]">Trees, slowly.</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#787774] max-w-[32ch]">Morris before Flatten. Same right-pointer threading — staged by concept, not just difficulty.</p>
            <Link href="/sheet" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#111111] hover:text-[#787774] transition-colors">
              Explore Trees <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div data-reveal className="reveal flat-card col-span-12 p-6 md:p-8">
            <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-[6px] border border-[#EAEAEA] bg-[#F7F6F3] flex items-center justify-center">
                    <MinimalIcon kind="search" />
                  </span>
                  <span className="text-sm font-medium text-[#111111]">Filter bar — always present</span>
                  <span className="ml-auto text-[11px] font-mono px-2 py-1 rounded-full border border-[#EAEAEA] bg-white text-[#787774]">AND-logic</span>
                </div>
                <div className="mt-5 h-11 flex items-center gap-3 px-4 rounded-[8px] border border-[#EAEAEA] bg-[#F7F6F3]">
                  <MinimalIcon kind="search" />
                  <span className="text-sm text-[#787774]">Search problems…</span>
                  <span className="ml-auto hidden sm:inline-flex text-xs font-mono px-2 py-1 rounded-full bg-white border border-[#EAEAEA] text-[#111111]">110</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <span
                      key={d}
                      className={`px-3 py-1.5 rounded-[6px] text-xs font-medium border ${d === "Hard" ? "bg-[#FDEBEC] text-[#9F2F2D] border-[#EAEAEA]" : d === "Medium" ? "bg-[#FBF3DB] text-[#956400] border-[#EAEAEA]" : "bg-[#EDF3EC] text-[#346538] border-[#EAEAEA]"}`}
                    >
                      {d}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 rounded-[6px] text-xs font-medium bg-white border border-[#EAEAEA] text-[#787774]">solved</span>
                  <span className="px-3 py-1.5 rounded-[6px] text-xs font-medium bg-white border border-[#EAEAEA] text-[#787774]">review</span>
                </div>
                <p className="mt-4 text-xs text-[#787774]">Search · Topic · Difficulty · Status · Tags — combinable. Filtered view auto-expands.</p>
              </div>
              <div className="rounded-[8px] border border-[#EAEAEA] bg-[#F7F6F3] p-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#EAEAEA] px-3 py-1 text-[11px] font-medium text-[#787774]">
                  <MinimalIcon kind="clock" /> Spaced repetition
                </div>
                <h4 className="mt-3 font-[var(--font-newsreader)] text-[18px] leading-none tracking-[-0.02em] text-[#111111]">
                  Recall, <span className="text-[#787774] font-[300] italic">not just solved.</span>
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[#787774]">Easy / hint / blank → next review computed. Due section sorts most overdue first.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#EDF3EC] px-2.5 py-1 text-[#346538] font-medium">
                    <MinimalIcon kind="check" /> Easy · +7d
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#FBF3DB] px-2.5 py-1 text-[#956400] font-medium">
                    <MinimalIcon kind="clock" /> Hint · +2d
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#FDEBEC] px-2.5 py-1 text-[#9F2F2D] font-medium">Blank · +1d</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="border-y border-[#EAEAEA] bg-white">
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 py-12 md:py-16">
          <div data-reveal className="reveal grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <blockquote className="font-[var(--font-newsreader)] text-[clamp(1.35rem,3vw,1.9rem)] leading-[1.1] tracking-[-0.03em] text-[#111111]">
                “Not another list. It finally taught me <span className="italic font-[300] text-[#787774]">order</span> — what to re-learn, when, and why.”
              </blockquote>
              <div className="mt-3 flex items-center gap-3 text-sm text-[#787774]">
                <span className="w-6 h-px bg-[#EAEAEA]" aria-hidden="true" />
                Solo learners · interview prep · late-night repetition
              </div>
            </div>
            <div className="rounded-[12px] border border-[#EAEAEA] bg-[#F7F6F3] p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#111111]">
                <span className="w-7 h-7 rounded-[6px] bg-[#111111] text-white flex items-center justify-center text-[10px]">✓</span>
                Recall distribution <span className="ml-auto text-[11px] font-mono text-[#787774]">last 30 days</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Easy", pct: 58, bg: "bg-[#111111]" },
                  { label: "Hint", pct: 26, bg: "bg-[#956400]" },
                  { label: "Blank", pct: 16, bg: "bg-[#9F2F2D]" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="w-12 text-xs font-medium text-[#787774]">{r.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white border border-[#EAEAEA] p-0.5 overflow-hidden">
                      <div className={`h-full rounded-full ${r.bg}`} style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-mono text-[#787774] tabular-nums">{r.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[8px] border border-[#EAEAEA] bg-white p-3 text-xs leading-relaxed text-[#787774]">
                <span className="font-medium text-[#111111]">Minimal rule:</span> color is scarce — pastels only for meaning, otherwise monochrome.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — stripped */}
      <section id="faq" className="max-w-5xl mx-auto w-full px-4 md:px-6 py-24 md:py-32">
        <div data-reveal className="reveal max-w-3xl">
          <div className="eyebrow">FAQ</div>
          <h2 className="mt-4 font-[var(--font-newsreader)] text-[clamp(1.7rem,3.5vw,2.4rem)] leading-none tracking-[-0.03em] text-[#111111]">Plain answers.</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#787774]">No clichés — specific mechanics, plain language.</p>
        </div>
        <div data-reveal className="reveal mt-10 border-t border-[#EAEAEA]">
          {FAQS.map((f, i) => (
            <div key={f.q} className="border-b border-[#EAEAEA]">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                aria-expanded={openFaq === i}
              >
                <span className="text-[15px] font-medium tracking-tight text-[#111111] group-hover:text-[#2F3437] transition-colors">{f.q}</span>
                <span className="shrink-0 w-7 h-7 rounded-[6px] border border-[#EAEAEA] bg-white flex items-center justify-center text-[#111111] text-sm leading-none">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              <div className={`grid transition-all duration-300 ease-out ${openFaq === i ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-[#787774] max-w-[68ch] pr-8">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#787774]">
          Keyboard: <kbd>⌘</kbd> <span>+</span> <kbd>K</kbd> to focus search · <kbd>↩</kbd> to open · <kbd>Esc</kbd> to close
        </div>
      </section>

      {/* FINAL CTA — minimal */}
      <section className="border-t border-[#EAEAEA] bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <h2 className="font-[var(--font-newsreader)] text-[clamp(2rem,5vw,3.2rem)] font-[400] leading-[0.95] tracking-[-0.04em] text-[#111111] text-balance">
            Your sheet.
            <br />
            <span className="italic font-[300] text-[#787774]">perfected.</span>
          </h2>
          <p className="mt-3 max-w-[54ch] mx-auto text-[15px] leading-relaxed text-[#787774] text-balance">
            Five topics, 110 problems, zero sprawl. Progress syncs via Firestore and your next review is already computed.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sheet"
              className="inline-flex items-center justify-center rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white text-sm font-medium px-6 py-3 transition-colors active:scale-[0.98]"
            >
              Open sheet — it’s free
            </Link>
            <span className="text-xs font-mono text-[#787774] hidden sm:inline">No signup required · syncs when you do</span>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-[#787774]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#F7F6F3] px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" aria-hidden="true" /> 5 topics
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#F7F6F3] px-3 py-1">29 patterns</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#F7F6F3] px-3 py-1">110 problems</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#F7F6F3] px-3 py-1">Firestore + onSnapshot</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#EAEAEA] bg-[#F7F6F3]">
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#787774] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" aria-hidden="true" /> DST Minimal Archive · depth, not sprawl
          </div>
          <div className="flex items-center gap-5 text-[#787774]">
            <Link href="/sheet" className="hover:text-[#111111] transition-colors">
              Sheet
            </Link>
            <a href="#system" className="hover:text-[#111111] transition-colors">
              System
            </a>
            <a href="#faq" className="hover:text-[#111111] transition-colors">
              FAQ
            </a>
            <span className="hidden sm:inline text-[#787774]/60">© 2026 My DSA Sheet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
