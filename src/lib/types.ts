export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'unsolved' | 'solved' | 'review';
export type Source = 'Neetcode' | 'Striver' | 'Others';
export type Tag = string;

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
