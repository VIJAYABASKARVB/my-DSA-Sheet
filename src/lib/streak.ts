export type ActivityMap = Record<string, number>; // dayKey yyyy-mm-dd -> solves

export function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export type StreakStats = {
  current: number;
  longest: number;
  totalActive: number;
  totalSolves: number;
  thisWeek: number;
  bestDayCount: number;
};

export function getStreakStats(activity: ActivityMap, now: Date = new Date()): StreakStats {
  const today = startOfDay(now);
  const keys = Object.keys(activity).filter((k) => (activity[k] ?? 0) > 0);
  const keySet = new Set(keys);
  const totalActive = keys.length;
  const totalSolves = keys.reduce((a, k) => a + (activity[k] ?? 0), 0);
  const bestDayCount = keys.reduce((a, k) => Math.max(a, activity[k] ?? 0), 0);

  // Current streak: allow bridge if today empty but yesterday active
  let current = 0;
  const cursor = new Date(today);
  if (!keySet.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    // if yesterday also empty, streak is 0
    if (!keySet.has(toDayKey(cursor))) {
      current = 0;
    } else {
      while (keySet.has(toDayKey(cursor))) {
        current += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
  } else {
    while (keySet.has(toDayKey(cursor))) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Longest: iterate sorted keys
  const sorted = keys.map(parseDayKey).sort((a, b) => a.getTime() - b.getTime());
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of sorted) {
    if (prev && d.getTime() - prev.getTime() === 86400000) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    prev = d;
  }

  // This week (Sun-Sat)
  const dow = today.getDay();
  const weekStart = addDays(today, -dow);
  let thisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const k = toDayKey(addDays(weekStart, i));
    thisWeek += activity[k] ?? 0;
  }

  return { current, longest, totalActive, totalSolves, thisWeek, bestDayCount };
}

export type CalendarCell = {
  key: string;
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  inFuture: boolean;
};

export function countToLevel(count: number): CalendarCell["level"] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

/**
 * Build Sunday-started columns for last `weeks` weeks ending this week.
 * Returns weeks array: weeks[w][dow 0..6]
 */
export function buildCalendarMatrix(activity: ActivityMap, weeks = 20, now: Date = new Date()): CalendarCell[][] {
  const today = startOfDay(now);
  const thisSaturday = addDays(today, 6 - today.getDay());
  const startSunday = addDays(thisSaturday, -(weeks * 7 - 1));
  const cols: CalendarCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: CalendarCell[] = [];
    for (let dow = 0; dow < 7; dow++) {
      const date = addDays(startSunday, w * 7 + dow);
      const key = toDayKey(date);
      const count = activity[key] ?? 0;
      col.push({
        key,
        date,
        count,
        level: countToLevel(count),
        inFuture: date.getTime() > today.getTime(),
      });
    }
    cols.push(col);
  }
  return cols;
}

export function monthLabelsForMatrix(matrix: CalendarCell[][]): (string | null)[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return matrix.map((col, i) => {
    const first = col[0];
    if (!first) return null;
    if (i === 0) return months[first.date.getMonth()] ?? null;
    const prev = matrix[i - 1]?.[0];
    if (!prev) return months[first.date.getMonth()] ?? null;
    return first.date.getMonth() !== prev.date.getMonth() ? (months[first.date.getMonth()] ?? null) : null;
  });
}
