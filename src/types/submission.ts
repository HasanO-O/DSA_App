import { z } from 'zod';
import type { Difficulty } from './problem';

export const LANGUAGES = ['rust', 'python', 'cpp', 'javascript', 'java'] as const;
export type Language = (typeof LANGUAGES)[number];

export interface LanguageDescriptor {
  id: Language;
  label: string;
  /** Judge0 CE language id. Validated server-side before dispatch. */
  judge0Id: number;
  extension: string;
  /** Bare starter code containing only the expected entry-function signature. */
  starterCode: string;
  monacoLanguage: string;
}

export const LANGUAGE_LIST: LanguageDescriptor[] = [
  {
    id: 'rust',
    label: 'Rust',
    judge0Id: 73,
    extension: 'rs',
    monacoLanguage: 'rust',
    starterCode: `// Implement \`entryFunction\`.\n// Your function is called by the test harness with the test arguments.\n\nfn solve(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    todo!()\n}\n`,
  },
  {
    id: 'python',
    label: 'Python',
    judge0Id: 71,
    extension: 'py',
    monacoLanguage: 'python',
    starterCode: `# Implement \`solve\`.\n# Your function is called by the test harness with the test arguments.\n\ndef solve(nums, target):\n    return []\n`,
  },
  {
    id: 'cpp',
    label: 'C++',
    judge0Id: 54,
    extension: 'cpp',
    monacoLanguage: 'cpp',
    starterCode: `#include <bits/stdc++.h>\nusing namespace std;\n\n// Implement \`solve\`.\n\nvector<int> solve(vector<int>& nums, int target) {\n    return {};\n}\n`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    judge0Id: 63,
    extension: 'js',
    monacoLanguage: 'javascript',
    starterCode: `// Implement \`solve\`.\n// Your function is called by the test harness with the test arguments.\n\nfunction solve(nums, target) {\n  return [];\n}\n`,
  },
  {
    id: 'java',
    label: 'Java',
    judge0Id: 62,
    extension: 'java',
    monacoLanguage: 'java',
    starterCode: `// Implement \`solve\`.\n\nclass Solution {\n    static Object solve(int[] nums, int target) {\n        return new int[0];\n    }\n}\n`,
  },
];

export const languageSchema = z.enum(LANGUAGES);

export function getLanguage(id: string): LanguageDescriptor | undefined {
  return LANGUAGE_LIST.find((language) => language.id === id);
}

export const SUBMISSION_STATUSES = [
  'ACCEPTED',
  'WRONG_ANSWER',
  'RUNTIME_ERROR',
  'COMPILE_ERROR',
  'TIME_LIMIT_EXCEEDED',
  'INTERNAL_ERROR',
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export interface TestCaseResult {
  index: number;
  passed: boolean;
  actual?: string;
  expected?: string;
  error?: string;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  language: Language;
  sourceCode: string;
  status: SubmissionStatus;
  runtimeMs: number | null;
  memoryKb: number | null;
  passedTests: number;
  totalTests: number;
  testSummary: TestCaseResult[];
  compileOutput: string | null;
  stderr: string | null;
  createdAt: string;
}

export interface CodeDraft {
  /** Composite local key: `${problemId}::${language}`. */
  id: string;
  userId: string;
  problemId: string;
  language: Language;
  code: string;
  /** Monotonic counter used for last-write-wins conflict resolution. */
  version: number;
  updatedAt: string;
}

export interface VisualizationsSceneMeta {
  id: string;
  problemId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  problemId: string;
  body: string;
  updatedAt: string;
}

export interface CategoryProgressSummary {
  category: string;
  solved: number;
  total: number;
}