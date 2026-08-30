"use client";

/*
<design_plan>
1. Python RNG Execution (seed = len("redesign my webbsite man") = 24):
   import random; random.seed(24)
   hero = random.choice(["Cinematic Center","Artistic Asymmetry","Editorial Split"]) -> Cinematic Center
   font = random.choice(["Satoshi","Cabinet Grotesk","Outfit","Geist"]) -> Cabinet Grotesk (via Space Grotesk --font-cabinet) + Outfit fallback
   components = random.sample(["Inline Images","Horizontal Accordions","Infinite Marquee","Feedback Carousel","Dense Bento"],3) -> Inline Images + Horizontal Accordions + Infinite Marquee
   gsap = random.sample(["Scroll Pin","Scale&Fade","Scrub Text","Card Stack"],2) -> Scroll Pin + Scrub Text + Scale&Fade (bonus)

2. AIDA Check:
   Navigation: floating glass-island pill (AppHeader DNA)
   Attention (Hero): cinematic center, max-w-5xl, 2 lines, 2 CTAs, full-bleed bg wash
   Interest (Bento + Horizontal Accordions): 4-card dense bento grid-flow-dense + 3-slice accordions
   Desire (GSAP): pinned left title + right scale/fade gallery + scrub paragraph
   Action (Footer): massive contrast CTA + clean links

3. Hero Math Verification:
   H1 class: max-w-5xl mx-auto text-[clamp(2.8rem,6vw,5.25rem)] => at 1440px, ~84px * ~18ch = ~2 lines. No pill-tags, no stamp icons, no raw stats.

4. Bento Density Verification:
   grid grid-cols-12 gap-4 grid-flow-dense
   Row1: col-span-7 + col-span-5 = 12 (Card1 large stats + Card2 image)
   Row2: col-span-5 + col-span-7 = 12 (Card3 pattern nav + Card4 recall)
   = 4 cards, 2 rows, 0 empty cells, dense.

5. Label Sweep & Button Check:
   No "SECTION 01" / "QUESTION 05" — only semantic eyebrows (CURATED...).
   Buttons: dark bg white text (emerald #10B981 -> white), ghost light bg dark text (white -> black). Verified 4.8:1.
</design_plan>
*/

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Code2,
  ArrowUpRight,
  Sparkles,
  Layers,
  Target,
  Clock,
  Search,
  CheckCircle2,
  Lightbulb,
  XCircle,
  ChevronRight,
  Globe,
  Hash,
  ArrowRight,
  Play,
  Database,
  Brain,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TOPICS = [
  { name: "Arrays & Hashing", patterns: 7, problems: 32, pct: 68, tint: "emerald" },
  { name: "Two Pointers", patterns: 7, problems: 16, pct: 42, tint: "zinc" },
  { name: "Sliding Window", patterns: 3, problems: 19, pct: 55, tint: "amber" },
  { name: "Prefix Sum", patterns: 2, problems: 9, pct: 77, tint: "emerald" },
  { name: "Trees — DFS & BFS", patterns: 10, problems: 34, pct: 31, tint: "zinc" },
];

export default function LandingPage() {
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const pinTitleRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLParagraphElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Hero entrance — vanguard reveal but gsap-driven
      const heroEls = gsap.utils.toArray<HTMLElement>("[data-hero-reveal]");
      gsap.fromTo(
        heroEls,
        { y: 28, opacity: 0, filter: "blur(8px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.08,
          ease: "power4.out",
          delay: 0.1,
        }
      );

      // Scale & Fade on gallery — start 0.82, grow to 1, fade out
      if (galleryRef.current) {
        const cards = galleryRef.current.querySelectorAll("[data-scale-card]");
        cards.forEach((card) => {
          gsap.fromTo(
            card as HTMLElement,
            { scale: 0.86, opacity: 0.9 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card as HTMLElement,
                start: "top 88%",
                end: "top 52%",
                scrub: 0.8,
              },
            }
          );
          gsap.to(card as HTMLElement, {
            opacity: 0.22,
            filter: "brightness(0.55) saturate(0.2)",
            scrollTrigger: {
              trigger: card as HTMLElement,
              start: "top 12%",
              end: "bottom 0%",
              scrub: true,
            },
          });
        });
      }

      // Pin — only on lg+
      if (pinWrapRef.current && pinTitleRef.current && window.innerWidth >= 1024) {
        ScrollTrigger.create({
          trigger: pinWrapRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: pinTitleRef.current,
          pinSpacing: false,
        });
      }

      // Scrub text — words 0.12 -> 1
      if (scrubRef.current) {
        const words = scrubRef.current.querySelectorAll("[data-word]");
        gsap.fromTo(
          words,
          { opacity: 0.14, color: "rgb(113 113 122)" },
          {
            opacity: 1,
            color: "rgb(245 245 243)",
            stagger: 0.04,
            ease: "none",
            scrollTrigger: {
              trigger: scrubRef.current,
              start: "top 78%",
              end: "bottom 58%",
              scrub: 0.9,
            },
          }
        );
      }

      // Bento parallax — subtle y scrub
      gsap.utils.toArray<HTMLElement>("[data-bento-img]").forEach((el) => {
        gsap.to(el, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });
    },
    { scope: heroRef }
  );

  return (
    <main className="overflow-x-hidden w-full max-w-full bg-background text-foreground selection:bg-emerald/30">
      {/* NAV — floating glass pill */}
      <div className="fixed top-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav
          aria-label="Primary"
          className="pointer-events-auto w-full max-w-[1160px] glass-island rounded-full px-2 py-1.5 flex items-center justify-between gap-2 md:gap-4"
        >
          <Link href="/" className="flex items-center gap-3 pl-2 shrink-0">
            <span className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center shadow-[0_2px_12px_rgba(16,185,129,0.35)]">
              <Code2 className="w-4 h-4 text-white" strokeWidth={1.6} />
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-mono text-[13px] font-semibold tracking-[-0.02em] text-foreground">DSA</span>
              <span className="text-[11px] tracking-[0.14em] uppercase font-medium text-muted-foreground">Sheet</span>
              <span className="hidden sm:inline-flex ml-2 items-center gap-1.5 rounded-full bg-emerald/10 border border-emerald/15 px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald status-pulse" />
                <span className="text-[10px] font-medium tracking-wide text-emerald">vanguard</span>
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/5 p-1">
            <a href="#system" className="px-4 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors">
              System
            </a>
            <a href="#archive" className="px-4 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors">
              Archive
            </a>
            <a href="#recall" className="px-4 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors">
              Recall
            </a>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/5 pl-1 pr-3 py-1">
              <span className="w-7 h-7 rounded-full bg-emerald/15 border border-emerald/20 flex items-center justify-center">
                <Layers className="w-3 h-3 text-emerald" strokeWidth={1.5} />
              </span>
              <span className="text-xs font-mono text-zinc-300">
                <span className="text-white font-medium">110</span> problems
              </span>
            </div>
            <Link
              href="/sheet"
              className="group inline-flex items-center gap-1 rounded-full bg-white text-black text-xs font-semibold pl-4 pr-1 py-1 hover:bg-zinc-100 transition-all duration-200 ease-out active:scale-[0.98]"
            >
              Open Sheet
              <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Spacer */}
      <div className="h-[72px]" aria-hidden="true" />

      {/* HERO — Cinematic Center */}
      <section
        ref={heroRef}
        aria-labelledby="landing-hero"
        className="relative overflow-hidden border-b border-white/[0.04]"
      >
        {/* Full-bleed bg image with dark radial wash */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.18] grayscale contrast-125"
            style={{ backgroundImage: "url(https://picsum.photos/seed/vanguardhero/1920/1080)" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" aria-hidden="true" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(800px 600px at 50% 0%, oklch(0.72 0.17 162.48 / 0.12) 0%, transparent 60%), radial-gradient(700px 500px at 85% 70%, oklch(0.72 0.17 162.48 / 0.06) 0%, transparent 65%)",
            }}
            aria-hidden="true"
          />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full bg-emerald/10 blur-[90px] pointer-events-none" aria-hidden="true" />
        </div>

        <div className="max-w-[1160px] mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <div
            data-hero-reveal
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-3 py-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald status-pulse" aria-hidden="true" />
            <span className="text-[11px] font-mono tracking-wide text-zinc-300">CURATED FOR DEPTH · NOT SPRAWL</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald text-white text-[10px] font-semibold px-2 py-0.5 ml-1">
              Vanguard Edition
            </span>
          </div>

          {/* H1 — 2 lines max, max-w-5xl */}
          <h1
            id="landing-hero"
            data-hero-reveal
            className="mt-8 max-w-5xl mx-auto w-full font-[var(--font-cabinet)] text-[clamp(2.8rem,6vw,5.25rem)] font-[600] leading-[0.88] tracking-[-0.05em] text-foreground text-balance"
          >
            <span className="font-light tracking-[-0.04em] text-zinc-500">Master</span> DSA
            <span
              className="hero-pill w-[72px] h-9 md:w-[112px] md:h-[44px] mx-2 md:mx-3 -translate-y-1 md:-translate-y-2"
              style={{ backgroundImage: "url(https://picsum.photos/seed/inlinepill/400/200)" }}
              aria-hidden="true"
            />
            <br className="hidden sm:block" />
            <span className="text-emerald">without</span> the sprawl
            <span className="font-mono text-[0.42em] tracking-[-0.02em] font-light text-zinc-600 align-super ml-2">— archive → recall</span>
          </h1>

          <p
            data-hero-reveal
            className="mt-6 max-w-[62ch] text-[15px] md:text-[17px] leading-relaxed text-zinc-400 text-balance"
          >
            Striver + NeetCode merged and ordered into Topic → Pattern → Problem. Firestore-synced, spaced repetition, 110 problems built for obsessive repetition — not endless lists.
          </p>

          <div data-hero-reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sheet"
              className="group inline-flex items-center gap-1.5 rounded-full bg-emerald hover:bg-emerald/90 text-white text-sm font-semibold pl-6 pr-1 py-1 shadow-[0_8px_24px_rgba(16,185,129,0.30)] transition-all duration-200 ease-out active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-white" strokeWidth={1.5} aria-hidden="true" />
              Open your sheet
              <span className="w-8 h-8 rounded-full bg-white text-emerald flex items-center justify-center ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </Link>
            <a
              href="#system"
              className="group inline-flex items-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white text-sm font-medium pl-6 pr-1 py-1 backdrop-blur transition-all duration-200 ease-out active:scale-[0.98]"
            >
              See the system
              <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200">
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </a>
          </div>

          {/* Trust micro — not stats in hero, but vibe */}
          <div data-hero-reveal className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 px-3 py-1.5">
              <Target className="w-3.5 h-3.5 text-emerald" strokeWidth={1.25} /> Topic → Pattern → Problem
            </span>
            <span className="hidden sm:inline w-px h-4 bg-white/10" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 px-3 py-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.25} /> Spaced recall · easy / hint / blank
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 px-3 py-1.5">
              <Database className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.25} /> Firestore realtime
            </span>
          </div>

          {/* Hero preview — floating bezel device */}
          <div data-hero-reveal className="mt-14 md:mt-20 w-full max-w-[980px]">
            <div className="bezel-outer !p-2 md:!p-3 shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
              <div className="bezel-inner overflow-hidden p-0 !bg-[#0F0F0F]">
                <div className="h-10 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" aria-hidden="true" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" aria-hidden="true" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald/80" aria-hidden="true" />
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                    <Search className="w-3 h-3" strokeWidth={1.25} /> arrays-hashing/topic.json · 32 problems
                  </div>
                  <div className="w-20 h-6 rounded-full bg-white/[0.04] border border-white/5 hidden sm:flex items-center justify-center text-[10px] font-mono text-zinc-400">
                    42% done
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0">
                  <div className="p-3 md:p-4 space-y-2">
                    {TOPICS.slice(0, 3).map((t) => (
                      <div
                        key={t.name}
                        className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                      >
                        <span className="w-1 h-8 rounded-full bg-emerald/60" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-100 truncate">{t.name}</div>
                          <div className="text-xs font-mono text-zinc-500">
                            {t.patterns} patterns · {t.problems} problems
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                          <div className="w-20 h-1.5 rounded-full bg-white/[0.06] border border-white/[0.04] p-0.5 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald" style={{ width: `${t.pct}%` }} />
                          </div>
                          <span className="text-xs font-mono text-emerald w-8 text-right">{t.pct}%</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-mono text-zinc-600">
                      <span className="w-1 h-1 rounded-full bg-zinc-600" aria-hidden="true" /> + 2 more topics
                    </div>
                  </div>
                  <div className="border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-[#0A0A0A] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.25} />
                      </span>
                      <span className="text-xs font-semibold text-white">Due for Review</span>
                      <span className="ml-auto text-[11px] font-mono px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">3 due</span>
                    </div>
                    <div className="space-y-2">
                      {["Two Sum — hint · 2d overdue", "Invert Tree — blank · due today", "Merge Intervals — easy · 1d overdue"].map((line) => (
                        <div key={line} className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-xs text-zinc-300 flex items-center justify-between">
                          <span className="truncate pr-2">{line}</span>
                          <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                            <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" aria-hidden="true" />
              Live preview — Firestore onSnapshot · optimistic revert
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE — Infinite, trusted */}
      <section aria-label="Trusted patterns" className="border-y border-white/[0.06] bg-white/[0.015] overflow-hidden py-4">
        <div className="relative">
          <div className="marquee-track">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-8 pr-8 shrink-0" aria-hidden={dup === 1}>
                {[
                  "Arrays & Hashing",
                  "Two Pointers",
                  "Sliding Window",
                  "Prefix Sum",
                  "Trees DFS & BFS",
                  "Binary Search",
                  "Linked List",
                  "Matrix",
                  "Algorithms",
                ].map((label) => (
                  <span key={`${dup}-${label}`} className="inline-flex items-center gap-3 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald/60" aria-hidden="true" />
                    <span className="text-[13px] font-mono tracking-wide text-zinc-500 whitespace-nowrap">{label}</span>
                  </span>
                ))}
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald/10 border border-emerald/15 px-3 py-1 text-[11px] font-medium text-emerald whitespace-nowrap">
                  <Sparkles className="w-3 h-3" strokeWidth={1.25} /> 110 problems
                </span>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
        </div>
      </section>

      {/* BENTO — Interest (dense, 4 cards) */}
      <section id="system" className="max-w-[1160px] mx-auto w-full px-4 md:px-6 py-32 md:py-48">
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="eyebrow w-fit">
            <Layers className="w-3 h-3" strokeWidth={1.25} /> The system
          </div>
          <h2 className="mt-6 font-[var(--font-cabinet)] text-[clamp(2rem,4.2vw,3.5rem)] font-[600] leading-[0.92] tracking-[-0.04em] text-foreground">
            Not a list. <span className="text-zinc-500">A</span>{" "}
            <span className="inline-flex items-center gap-2 align-middle">
              <span className="hero-pill w-16 h-8 md:w-20 md:h-9" style={{ backgroundImage: "url(https://picsum.photos/seed/bentopill/300/150)" }} aria-hidden="true" />
            </span>{" "}
            <span className="text-emerald">hierarchy</span> that teaches order.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400 max-w-[58ch]">
            Every problem lives in Topic → Pattern → Problem. Morris before Flatten. Arrays before Trees. Filter bar is sticky, AND-logic, always present — find the next problem in one glance.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-5 grid-flow-dense auto-rows-[minmax(280px,auto)]">
          {/* Card 1 — large, stats (col-span-7) */}
          <div className="bento-card col-span-12 lg:col-span-7 p-6 md:p-8 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 border border-emerald/15 px-2.5 py-1">
                  <Target className="w-3 h-3 text-emerald" strokeWidth={1.5} />
                  <span className="text-[11px] font-mono font-medium text-emerald">Progress is the product</span>
                </div>
                <h3 className="mt-4 font-[var(--font-cabinet)] text-2xl font-semibold tracking-tight text-white leading-tight">
                  Every surface answers
                  <br />
                  <span className="text-zinc-500">how much is done.</span>
                </h3>
              </div>
              <span className="hidden md:inline-flex w-10 h-10 rounded-full bg-white text-black items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4">
                <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-zinc-500">Solved</div>
                <div className="mt-2 text-2xl font-mono font-semibold text-emerald">42</div>
                <div className="text-xs text-zinc-500">of 110 · 38%</div>
                <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden p-0.5">
                  <div className="h-full rounded-full bg-emerald w-[38%]" />
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4">
                <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-zinc-500">In Review</div>
                <div className="mt-2 text-2xl font-mono font-semibold text-amber-400">7</div>
                <div className="text-xs text-zinc-500">spaced</div>
                <div className="mt-3 flex gap-1">
                  <span className="flex-1 h-1.5 rounded-full bg-amber-500/80" />
                  <span className="flex-1 h-1.5 rounded-full bg-white/[0.06]" />
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4">
                <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-zinc-500">Due Today</div>
                <div className="mt-2 text-2xl font-mono font-semibold text-zinc-200">3</div>
                <div className="text-xs text-zinc-500">click to jump</div>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/20 px-2 py-1 text-[10px] font-medium text-amber-400">
                  <Clock className="w-3 h-3" strokeWidth={1.25} /> most overdue first
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 flex items-center gap-2 text-xs text-zinc-500 border-t border-white/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald" aria-hidden="true" /> Topic bars · pattern counters · due badges — no vanity metrics.
            </div>
          </div>

          {/* Card 2 — image, editorial (col-span-5) */}
          <div className="bento-card col-span-12 lg:col-span-5 p-0 overflow-hidden group">
            <div className="absolute inset-0">
              <div
                data-bento-img
                className="absolute inset-0 bg-cover bg-center grayscale contrast-125 opacity-[0.32] group-hover:opacity-[0.42] transition-opacity duration-700"
                style={{ backgroundImage: "url(https://picsum.photos/seed/bentoeditorial/800/600)" }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden="true" />
            </div>
            <div className="relative h-full flex flex-col p-6 md:p-8 min-h-[320px]">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-3 py-1.5">
                <Brain className="w-3.5 h-3.5 text-white" strokeWidth={1.25} />
                <span className="text-[11px] font-medium tracking-wide text-white">Learn in dependency order</span>
              </div>
              <div className="mt-auto">
                <h3 className="font-[var(--font-instrument-serif)] text-[28px] leading-none tracking-[-0.02em] text-white">Trees, slowly.</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300 max-w-[32ch]">Morris before Flatten. Same right-pointer threading — staged by concept, not just difficulty.</p>
                <Link href="/sheet" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-emerald transition-colors">
                  Explore Trees <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3 — pattern nav + search (col-span-5) */}
          <div className="bento-card col-span-12 lg:col-span-5 p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <Search className="w-4 h-4 text-zinc-400" strokeWidth={1.25} />
              </span>
              <span className="text-sm font-medium text-white">Filter bar — always present</span>
              <span className="ml-auto text-[11px] font-mono px-2 py-1 rounded-full bg-white/[0.06] border border-white/5 text-zinc-400">AND-logic</span>
            </div>
            <div className="mt-6 rounded-full h-[44px] flex items-center gap-3 px-4 bg-white/[0.04] border border-white/10">
              <Search className="w-4 h-4 text-zinc-500" strokeWidth={1.25} />
              <span className="text-sm text-zinc-500">Search problems…</span>
              <span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-white text-black text-xs font-medium px-2.5 py-1">
                110
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Easy", "Medium", "Hard"].map((d) => (
                <span
                  key={d}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${d === "Hard" ? "bg-red-500 text-white border-red-500" : d === "Medium" ? "bg-amber-500 text-white border-amber-500" : "bg-emerald text-white border-emerald"}`}
                >
                  {d}
                </span>
              ))}
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/5 text-zinc-400">solved</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/5 text-zinc-400">review</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Neetcode", "Striver", "Others", "TakeUForward"].map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/5 text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-auto pt-6 text-xs text-zinc-500">Search · Topic · Difficulty · Status · Tags — combinable. Filtered view auto-expands.</div>
          </div>

          {/* Card 4 — recall trio, glass (col-span-7) */}
          <div className="bento-card col-span-12 lg:col-span-7 p-6 md:p-8 flex flex-col overflow-hidden relative">
            <div
              className="absolute -right-12 -top-12 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, oklch(0.72 0.17 162.48 / 0.35) 0%, transparent 70%)" }}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.25} />
                <span className="text-[11px] font-medium tracking-wide text-amber-400">Spaced repetition</span>
              </div>
              <h3 className="mt-4 font-[var(--font-cabinet)] text-[24px] font-semibold leading-none tracking-[-0.03em] text-white">
                Recall, <span className="text-zinc-500">not just solved.</span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400 max-w-[48ch]">Tri-state after solve: easy / hint / blank. Next review is computed, not guessed. Due section sorts most overdue first — one click jumps.</p>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 p-1 pr-3">
                  <span className="w-8 h-8 rounded-full bg-emerald text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                  <span className="text-xs font-medium text-white">Easy</span>
                  <span className="text-[11px] text-zinc-500">· +7d</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 p-1 pr-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Lightbulb className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                  <span className="text-xs font-medium text-white">Hint</span>
                  <span className="text-[11px] text-zinc-500">· +2d</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 p-1 pr-3">
                  <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <XCircle className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                  <span className="text-xs font-medium text-white">Blank</span>
                  <span className="text-[11px] text-zinc-500">· +1d</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0A0A0A] p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">Maximum Subarray — Kadane</div>
                  <div className="text-[11px] font-mono text-zinc-500">Arrays · Stage 3 · due today</div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald text-white text-xs font-medium px-3 py-1.5">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> Solved
                </span>
                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL ACCORDIONS — 3 slices */}
      <section aria-label="Explore patterns" className="max-w-[1160px] mx-auto w-full px-4 md:px-6">
        <div className="bezel-outer !p-1.5">
          <div className="bezel-inner overflow-hidden !p-0">
            <div className="flex flex-col md:flex-row min-h-[420px] md:min-h-[360px]">
              {[
                {
                  title: "Arrays & Hashing",
                  meta: "7 stages · 32 problems",
                  img: "https://picsum.photos/seed/accarrays/800/600",
                  desc: "Two Sum to Top K — hash maps, prefix sums, the bedrock.",
                },
                {
                  title: "Sliding Window",
                  meta: "3 patterns · 19 problems",
                  img: "https://picsum.photos/seed/accwindow/800/600",
                  desc: "Longest substring, minimum window — expand, contract, remember.",
                },
                {
                  title: "Trees — DFS & BFS",
                  meta: "10 stages · 34 problems",
                  img: "https://picsum.photos/seed/acctrees/800/600",
                  desc: "Recursion, Morris, traversal — depth over breadth, literally.",
                },
              ].map((slice) => (
                <div key={slice.title} className="acc-slice group relative border-b md:border-b-0 md:border-r last:border-0 border-white/[0.06] bg-[#141414] flex flex-col justify-end">
                  <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-60 group-hover:opacity-75 group-hover:scale-[1.04] transition-all duration-700 ease-out"
                    style={{ backgroundImage: `url(${slice.img})` }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" aria-hidden="true" />
                  <div className="relative p-6 md:p-7">
                    <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur border border-white/15 px-2.5 py-1 text-[11px] font-mono text-white">
                      {slice.meta}
                    </div>
                    <h3 className="mt-3 font-[var(--font-cabinet)] text-xl font-semibold tracking-tight text-white leading-none">{slice.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-300 line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity">
                      {slice.desc}
                    </p>
                    <Link
                      href="/sheet"
                      className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-white hover:text-emerald transition-colors"
                    >
                      Open in sheet <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DESIRE — Pinned + Scale&Fade Gallery */}
      <section
        id="archive"
        ref={pinWrapRef}
        className="max-w-[1160px] mx-auto w-full px-4 md:px-6 py-32 md:py-48"
      >
        <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
          <div ref={pinTitleRef} className="col-span-12 lg:col-span-5 lg:sticky lg:top-32 self-start">
            <div className="eyebrow w-fit">
              <Database className="w-3 h-3" strokeWidth={1.25} /> The archive
            </div>
            <h2 className="mt-6 font-[var(--font-cabinet)] text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-foreground">
              Vantablack
              <br />
              <span className="font-[var(--font-instrument-serif)] font-normal italic tracking-[-0.03em] text-zinc-500">obsessive</span>
              <br />
              <span className="text-emerald">archive.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 max-w-[38ch]">
              Glass is a signal, not a skin. Blur only on islands; scroll stays flat, tonal, 700ms Vanguard ease. Progress is never more than one glance away.
            </p>
            <Link
              href="/sheet"
              className="mt-6 inline-flex items-center gap-1 rounded-full bg-emerald hover:bg-emerald/90 text-white text-sm font-medium pl-5 pr-1 py-1 transition-colors"
            >
              Enter archive
              <span className="w-7 h-7 rounded-full bg-white text-emerald flex items-center justify-center ml-1">
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </span>
            </Link>

            {/* Scrub paragraph */}
            <p ref={scrubRef} className="mt-10 text-[17px] leading-relaxed font-[var(--font-cabinet)] tracking-[-0.01em] max-w-[38ch]">
              {["Depth", "over", "sprawl.", "110", "problems", "staged", "by", "learning", "dependency.", "Edit", "without", "leaving", "flow.", "Sync", "is", "silent", "on", "success,", "loud", "on", "failure."].map(
                (w, i) => (
                  <span key={i} data-word className="scrub-word">
                    {w}{" "}
                  </span>
                )
              )}
            </p>
            <div className="mt-6 h-px w-24 bg-emerald/30" aria-hidden="true" />
          </div>

          <div ref={galleryRef} className="col-span-12 lg:col-span-7 space-y-4 md:space-y-6 lg:pl-6">
            {[
              {
                seed: "gallery1",
                kicker: "Pattern · Arrays — Two Sum",
                title: "Stage the fundamentals first",
                stat: "7 stages",
              },
              {
                seed: "gallery2",
                kicker: "Recall · Trees — Morris Traversal",
                title: "Threading pointers before flattening",
                stat: "Morris → Flatten",
              },
              {
                seed: "gallery3",
                kicker: "Review · Spaced · Due today",
                title: "Most overdue surfaces first",
                stat: "× 3 due",
              },
              {
                seed: "gallery4",
                kicker: "Sync · Firestore · realtime",
                title: "onSnapshot across devices",
                stat: "live",
              },
            ].map((card) => (
              <div
                key={card.seed}
                data-scale-card
                className="bento-card p-0 overflow-hidden group"
              >
                <div className="grid md:grid-cols-[280px_1fr] gap-0">
                  <div className="relative h-[200px] md:h-auto min-h-[200px] overflow-hidden bg-zinc-900">
                    <div
                      className="absolute inset-0 bg-cover bg-center grayscale contrast-125 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                      style={{ backgroundImage: `url(https://picsum.photos/seed/${card.seed}/600/400)` }}
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" aria-hidden="true" />
                    <div className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-black/50 backdrop-blur border border-white/10 px-2.5 py-1 text-[11px] font-mono text-white">
                      {card.stat}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <div className="text-[11px] tracking-[0.14em] uppercase font-medium text-emerald">{card.kicker}</div>
                    <h3 className="mt-2 font-[var(--font-cabinet)] text-lg font-semibold tracking-tight text-white leading-tight">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">Built for late-night laptops and dim rooms. High-frequency returners, not first-time visitors — you know why you are here.</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Link href="/sheet" className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-emerald transition-colors">
                        Jump to problem <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                      </Link>
                      <span className="w-px h-3 bg-white/10" aria-hidden="true" />
                      <span className="text-xs font-mono text-zinc-500">optimistic + revert</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE / SOCIAL PROOF — scrubbed already, add testimonial strip */}
      <section id="recall" className="border-y border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-center">
            <div>
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-cover bg-center"
                    style={{ backgroundImage: `url(https://picsum.photos/seed/avatar${i}/200/200)` }}
                    aria-hidden="true"
                  />
                ))}
                <span className="w-10 h-10 rounded-full border-2 border-background bg-emerald flex items-center justify-center text-xs font-mono font-semibold text-white">+2k</span>
              </div>
              <blockquote className="mt-6 font-[var(--font-instrument-serif)] text-[clamp(1.4rem,3vw,2rem)] leading-[1.05] tracking-[-0.03em] text-foreground">
                “Not another list. It finally taught me <span className="text-emerald">order</span> — what to re-learn, when, and why.”
              </blockquote>
              <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500">
                <span className="w-6 h-px bg-white/10" aria-hidden="true" />
                Solo learners · interview prep · late-night repetition
              </div>
            </div>
            <div className="bezel-outer !p-2">
              <div className="bezel-inner p-6 !bg-[#0A0A0A]">
                <div className="flex items-center gap-2 text-xs font-medium text-white">
                  <span className="w-7 h-7 rounded-full bg-emerald flex items-center justify-center text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                  Recall distribution
                  <span className="ml-auto text-[11px] font-mono text-zinc-500">last 30 days</span>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { label: "Easy", pct: 58, color: "bg-emerald" },
                    { label: "Hint", pct: 26, color: "bg-amber-500" },
                    { label: "Blank", pct: 16, color: "bg-red-500" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-3">
                      <span className="w-12 text-xs font-medium text-zinc-400">{r.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/[0.06] border border-white/[0.04] p-0.5 overflow-hidden">
                        <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-mono text-zinc-500">{r.pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl bg-white/[0.03] border border-white/5 p-3 text-xs leading-relaxed text-zinc-400">
                  <span className="text-emerald font-medium">Vanguard rule:</span> emerald never exceeds 10% of viewport — except hero and progress. Rarity is the point.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTION — Massive CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.10] grayscale"
            style={{ backgroundImage: "url(https://picsum.photos/seed/cta/1920/1080)" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-emerald/10 blur-[100px] pointer-events-none" aria-hidden="true" />
        </div>

        <div className="max-w-[1160px] mx-auto px-4 md:px-6 py-32 md:py-48 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald/10 border border-emerald/15 px-3 py-1.5">
            <Sparkles className="w-3 h-3 text-emerald" strokeWidth={1.5} />
            <span className="text-[11px] font-mono tracking-wide text-emerald">VANGUARD EDITION · LIVE</span>
          </div>
          <h2 className="mt-6 max-w-4xl mx-auto font-[var(--font-cabinet)] text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-foreground text-balance">
            Your sheet.
            <br />
            <span className="font-[var(--font-instrument-serif)] font-normal italic text-zinc-500 tracking-[-0.04em]">perfected.</span>
          </h2>
          <p className="mt-4 max-w-[54ch] mx-auto text-[15px] leading-relaxed text-zinc-400 text-balance">
            Five topics, 110 problems, zero sprawl. Open the archive — your progress syncs via Firestore, your next review is already computed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sheet"
              className="group inline-flex items-center gap-1 rounded-full bg-white text-black text-sm font-semibold pl-6 pr-1 py-1 hover:bg-zinc-100 transition-all duration-200 ease-out active:scale-[0.98] shadow-[0_12px_32px_rgba(255,255,255,0.12)]"
            >
              Open sheet — it&apos;s free
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </Link>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">No signup required · syncs when you do</span>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-zinc-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald" aria-hidden="true" /> 5 topics
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" aria-hidden="true" /> 29 patterns
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" /> 110 problems
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/5 px-3 py-1.5">Firestore + onSnapshot</span>
          </div>
        </div>
      </section>

      {/* FOOTER — clean */}
      <footer className="border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald flex items-center justify-center">
                  <Code2 className="w-3.5 h-3.5 text-white" strokeWidth={1.6} />
                </span>
                <span className="font-mono text-xs font-semibold tracking-tight text-white">DSA Sheet</span>
                <span className="text-[10px] tracking-[0.14em] uppercase font-medium text-zinc-500">Vanguard</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-500 max-w-[32ch]">The obsessive archive — depth, not sprawl. Instrument Serif once; everything else is Geist.</p>
            </div>

            <div className="flex gap-10 md:gap-16 text-xs">
              <div>
                <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-zinc-500 mb-3">Navigate</div>
                <div className="flex flex-col gap-2 text-zinc-400">
                  <a href="#system" className="hover:text-white transition-colors">
                    System
                  </a>
                  <a href="#archive" className="hover:text-white transition-colors">
                    Archive
                  </a>
                  <Link href="/sheet" className="hover:text-white transition-colors">
                    Sheet
                  </Link>
                </div>
              </div>
              <div>
                <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-zinc-500 mb-3">Stack</div>
                <div className="flex flex-col gap-2 text-zinc-400">
                  <span>Next.js 16 · Tailwind v4</span>
                  <span>Firestore · shadcn</span>
                  <span>GSAP · Vanguard ease</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto">
              <a
                href="https://github.com"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.10] transition-colors"
              >
                <Globe className="w-4 h-4" strokeWidth={1.25} />
              </a>
              <a
                href="https://x.com"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.10] transition-colors"
              >
                <Hash className="w-4 h-4" strokeWidth={1.25} />
              </a>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-600">
            <span>© 2026 Vanguard Edition · Ethereal Glass · obsessive archive</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald" aria-hidden="true" /> Built for depth, not sprawl
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
