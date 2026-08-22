export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'unsolved' | 'solved' | 'review';
export type Source = 'Neetcode' | 'Striver' | 'Others';

export type PlatformLink = {
  platform: 'LeetCode' | 'TakeUForward' | 'Code360' | 'GeeksForGeeks' | 'InterviewBit';
  url: string;
};

export type Problem = {
  id: string;
  name: string;
  difficulty: Difficulty;
  source: Source;
  links: PlatformLink[];
  topicId: string;
  patternId: string;
};

export type Pattern = {
  id: string;
  name: string;
  topicId: string;
  problems: Problem[];
};

export type Topic = {
  id: string;
  name: string;
  patterns: Pattern[];
};

export type ProgressDoc = {
  status: Exclude<Status, 'unsolved'>;
  updatedAt: Date;
};

export type ProblemOverrideDoc = {
  links: PlatformLink[];
  updatedAt: Date;
};

export type MergedProblem = Problem & { hasOverride: boolean };
