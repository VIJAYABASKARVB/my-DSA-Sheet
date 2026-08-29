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

export type RecallStatus = "easy" | "hint" | "blank";

export type ProgressDoc = {
  status: Exclude<Status, 'unsolved'>;
  updatedAt: Date;
  // Spaced repetition fields (per-user, stored in users/{uid}/progress/{problemId})
  recallStatus?: RecallStatus | null;
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  reviewCount?: number;
};

export type ProblemOverrideDoc = {
  links?: PlatformLink[];
  tags?: Tag[];
  updatedAt: Date;
};

export type MergedProblem = Problem & { hasOverride: boolean };
