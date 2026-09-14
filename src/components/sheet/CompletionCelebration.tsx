"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DOTS = Array.from({ length: 12 });

export function CompletionCelebration({
  open,
  title,
  subtitle,
  pct,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  pct: number;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const radius = 26;
  const circ = radius * 2 * Math.PI;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = circ - (clamped / 100) * circ;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-background/60 backdrop-blur-[2px]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="celebrate-card relative w-full max-w-[380px] rounded-[12px] border border-border bg-card p-6 text-center overflow-hidden"
          >
            {/* dot burst */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
              {DOTS.map((_, i) => {
                const angle = (i / DOTS.length) * Math.PI * 2;
                const dist = 110;
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                const pale = i % 3 === 0;
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 0], x, y, scale: 1 }}
                    transition={{ duration: 1.1, delay: 0.15 + i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute w-1.5 h-1.5 rounded-full ${pale ? "bg-[#956400]/60 dark:bg-[#EAB308]/60" : "bg-primary/70"}`}
                  />
                );
              })}
            </div>

            <div className="relative mx-auto w-[72px] h-[72px]">
              <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg] block" aria-hidden="true">
                <circle cx="36" cy="36" r={radius} fill="none" className="text-border" stroke="currentColor" strokeWidth="5" opacity={0.9} />
                <motion.circle
                  cx="36"
                  cy="36"
                  r={radius}
                  fill="none"
                  className="text-foreground"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 400, damping: 18 }}
                className="absolute inset-0 flex items-center justify-center text-sm font-medium text-foreground"
                aria-hidden="true"
              >
                ✓
              </motion.span>
            </div>

            <h2 className="mt-4 font-[var(--font-newsreader)] text-[22px] leading-tight tracking-[-0.02em] text-foreground text-balance">
              {title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>
            <div className="mt-2 font-mono text-[11px] tabular-nums text-muted-foreground">
              <span className="text-foreground font-medium">{clamped}%</span> of sheet complete
            </div>
            <button
              onClick={onClose}
              autoFocus
              className="mt-5 inline-flex items-center justify-center rounded-[6px] bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-6 py-2.5 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            >
              Keep going
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
