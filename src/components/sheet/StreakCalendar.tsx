"use client";
import type { CalendarCell, StreakStats } from "@/lib/streak";

const CELL = "w-[11px] h-[11px] rounded-[3px] border shrink-0";

function cellClass(level: CalendarCell["level"], isToday: boolean, inFuture: boolean): string {
  const base =
    level === 0
      ? "bg-muted border-border/70"
      : level === 1
        ? "bg-primary/15 border-primary/20"
        : level === 2
          ? "bg-primary/35 border-primary/25"
          : level === 3
            ? "bg-primary/65 border-primary/30"
            : "bg-primary border-primary";
  const future = inFuture ? " opacity-40" : "";
  const today = isToday ? " streak-today" : "";
  return `${CELL} ${base}${future}${today}`;
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rhythmLine(current: number): string {
  if (current <= 0) return "Solve one today to start the rhythm.";
  if (current === 1) return "Day one — depth starts daily.";
  if (current < 7) return `${current} day rhythm — keep depth daily.`;
  if (current < 30) return `${current} day rhythm — depth compounds.`;
  return `${current} day rhythm — archival discipline.`;
}

export function StreakCalendar({
  matrix,
  monthLabels,
  stats,
  loading,
  signedIn,
}: {
  matrix: CalendarCell[][];
  monthLabels: (string | null)[];
  stats: StreakStats;
  loading: boolean;
  signedIn: boolean;
}) {
  const tk = todayKey();

  return (
    <section
      aria-label="Solve rhythm calendar"
      className="rounded-[12px] border border-border bg-card overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="flex flex-col md:flex-row md:items-stretch gap-0">
        {/* Summary */}
        <div className="md:w-[248px] shrink-0 px-4 md:px-5 py-4 md:py-5 border-b md:border-b-0 md:border-r border-border bg-muted/20">
          <div className="eyebrow w-fit">Progress rhythm</div>
          {loading ? (
            <div className="mt-3 space-y-2" aria-busy="true">
              <div className="h-8 w-24 skeleton rounded-[6px]" />
              <div className="h-3 w-32 skeleton rounded-full" />
            </div>
          ) : !signedIn ? (
            <div className="mt-3">
              <div className="text-[26px] font-mono font-semibold tracking-[-0.03em] leading-none text-foreground tabular-nums">
                --
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-[26ch]">
                Sign in to track solved days. Your rhythm calendar lives here.
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[30px] font-mono font-semibold tracking-[-0.03em] leading-none text-foreground tabular-nums">
                  {stats.current}
                </span>
                <span className="text-xs text-muted-foreground">day{stats.current === 1 ? "" : "s"} streak</span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-muted-foreground tabular-nums">
                <span>
                  longest <span className="text-foreground font-medium">{stats.longest}</span>
                </span>
                <span className="w-px h-3 bg-border" aria-hidden="true" />
                <span>
                  active <span className="text-foreground font-medium">{stats.totalActive}</span>
                </span>
                <span className="w-px h-3 bg-border" aria-hidden="true" />
                <span>
                  wk <span className="text-foreground font-medium">{stats.thisWeek}</span>
                </span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{rhythmLine(stats.current)}</p>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0 px-4 md:px-5 py-4 md:py-5">
          {loading ? (
            <div className="flex gap-[3px]" aria-hidden="true">
              {Array.from({ length: 20 }).map((_, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, d) => (
                    <div key={d} className={`${CELL} skeleton border-transparent`} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-none -mx-1 px-1" role="img" aria-label={`${stats.totalActive} active days, ${stats.current} day current streak, solved days only`}>
              {/* Month labels */}
              <div className="flex gap-[3px] mb-1.5 min-w-max" aria-hidden="true">
                <div className="w-7 shrink-0" />
                {monthLabels.map((m, i) => (
                  <div key={i} className="w-[11px] shrink-0 overflow-visible">
                    {m && <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">{m}</span>}
                  </div>
                ))}
              </div>
              <div className="flex gap-[3px] min-w-max">
                {/* Weekday gutter */}
                <div className="w-7 shrink-0 flex flex-col gap-[3px] mr-1" aria-hidden="true">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="h-[11px] flex items-center">
                      {(i === 1 || i === 3 || i === 5) && (
                        <span className="text-[9px] font-mono text-muted-foreground/70">{d}</span>
                      )}
                    </div>
                  ))}
                </div>
                {matrix.map((col, w) => (
                  <div key={w} className="flex flex-col gap-[3px]">
                    {col.map((cell) => {
                      const label = cell.date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      });
                      return (
                        <div
                          key={cell.key}
                          title={`${cell.count} solved on ${label}`}
                          aria-label={`${cell.count} solved on ${label}`}
                          className={cellClass(cell.level, cell.key === tk, cell.inFuture)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="mt-2.5 flex items-center justify-end gap-1.5 text-[10px] font-mono text-muted-foreground">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((l) => (
                  <span
                    key={l}
                    aria-hidden="true"
                    className={cellClass(l as CalendarCell["level"], false, false).replace("shrink-0", "") + " !w-[10px] !h-[10px]"}
                  />
                ))}
                <span>More</span>
                <span className="ml-2 hidden sm:inline text-muted-foreground/70">solved days only</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
