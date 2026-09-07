export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'unsolved' | 'solved' | 'review';
export type Source = 'Neetcode' | 'Striver' | 'Others';
export type Tag = string;

export function canonicalizeTag(t: string): Tag {
  const s = t.trim();
  const l = s.toLowerCase();
  if (l === "striver") return "Striver";
  if (l === "neetcode" || l === "neetcode") return "Neetcode";
  if (l === "others" || l === "other") return "Others";
  return s;
}

export function normalizeTags(tags: unknown): Tag[] {
  if (!Array.isArray(tags)) return [];
  const out: Tag[] = [];
  const seen = new Set<string>();
  for (const raw of tags) {
    const c = canonicalizeTag(String(raw ?? ""));
    if (!c || seen.has(c.toLowerCase())) continue;
    seen.add(c.toLowerCase());
    out.push(c);
  }
  return out;
}

export type PlatformLink = {
  platform: 'LeetCode' | 'NeetCode' | 'TakeUForward' | 'Code360' | 'GeeksForGeeks' | 'InterviewBit';
  url: string;
};

export type Problem = {
  id: string;
  name: string;
  difficulty: Difficulty;
  tags: Tag[];
  source?: Source;
  links: PlatformLink[];
  topicId: string;
  patternId: string;
  order: number;
};

export type Pattern = {
  id: string;
  name: string;
  topicId: string;
  order: number;
  problems: Problem[];
};

export type Topic = {
  id: string;
  name: string;
  order: number;
  patterns: Pattern[];
};

import type { Timestamp } from "firebase/firestore";

export type RevisionSchedule = {
  learnedAt: Timestamp;
  revisionDates: Timestamp[];
  currentRevisionIndex: number; // 0..6 (6 => fully mastered)
  completedRevisions: Timestamp[];
  isFullyMastered: boolean;
};

export type ProgressDoc = {
  status: Exclude<Status, 'unsolved'>;
  updatedAt: Date;
  revisionSchedule?: RevisionSchedule | null;
};

export type ProblemOverrideDoc = {
  links?: PlatformLink[];
  tags?: Tag[];
  updatedAt: Date;
};

export type MergedProblem = Problem & { hasOverride: boolean };

export type Note = {
  problemId: string;
  problemName: string;
  content: string;
  updatedAt: Date;
};
