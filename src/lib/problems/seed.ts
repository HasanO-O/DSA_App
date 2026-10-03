import type { PublicTestCase } from '@/types/problem';
import type { Problem } from '@/types/problem';
import type { LearningStatus } from '@/types/progress';

/**
 * V1 seed dataset: one problem per pattern family, ordered by the NeetCode
 * roadmap so the browser can render the roadmap grouping directly.
 *
 * Content policy (spec §8): `summary` is an original one-or-two line description
 * written for this app. Full problem statements stay on LeetCode and are reached
 * through `leetcodeUrl`. Nothing here reproduces third-party copyrighted text.
 */

export interface SeedProblem extends Problem {
  publicTests: PublicTestCase[];
}

export const SEED_PROBLEMS: SeedProblem[] = [
  {
    id: 'two-sum',
    leetcodeSlug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'EASY',
    category: 'Arrays & Hashing',
    pattern: 'Hash Map',
    neetcodeOrder: 1,
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    summary:
      'Given an array of integers and a target, return the indices of the two values that add up to the target. Each input has exactly one solution and the same element may not be used twice.',
    tags: ['array', 'hash-table'],
    entryFunction: 'twoSum',
    publicTests: [
      { index: 0, args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { index: 1, args: [[3, 2, 4], 6], expected: [1, 2] },
      { index: 2, args: [[3, 3], 6], expected: [0, 1] },
    ],
  },
  {
    id: 'valid-anagram',
    leetcodeSlug: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'EASY',
    category: 'Arrays & Hashing',
    pattern: 'Hash Map',
    neetcodeOrder: 2,
    leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
    summary:
      'Given two strings, return true if the second is an anagram of the first. An anagram uses the same characters with the same counts, ignoring order.',
    tags: ['hash-table', 'string'],
    entryFunction: 'isAnagram',
    publicTests: [
      { index: 0, args: ['anagram', 'nagaram'], expected: true },
      { index: 1, args: ['rat', 'car'], expected: false },
      { index: 2, args: ['', ''], expected: true },
    ],
  },
  {
    id: 'group-anagrams',
    leetcodeSlug: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: 'MEDIUM',
    category: 'Arrays & Hashing',
    pattern: 'Hash Map',
    neetcodeOrder: 3,
    leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/',
    summary:
      'Given an array of strings, group the anagrams together and return the groups. Group order and the order within a group do not matter.',
    tags: ['array', 'hash-table', 'sorting'],
    entryFunction: 'groupAnagrams',
    publicTests: [
      { index: 0, args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: 'GROUPED' },
      { index: 1, args: [['']], expected: 'GROUPED' },
      { index: 2, args: [['a']], expected: 'GROUPED' },
    ],
  },
  {
    id: 'contains-duplicate',
    leetcodeSlug: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'EASY',
    category: 'Arrays & Hashing',
    pattern: 'Hash Map',
    neetcodeOrder: 4,
    leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/',
    summary:
      'Given an integer array, return true if any value appears at least twice and false if every value is distinct.',
    tags: ['array', 'hash-table'],
    entryFunction: 'containsDuplicate',
    publicTests: [
      { index: 0, args: [[1, 2, 3, 1]], expected: true },
      { index: 1, args: [[1, 2, 3, 4]], expected: false },
      { index: 2, args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
    ],
  },
  {
    id: 'valid-parentheses',
    leetcodeSlug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'EASY',
    category: 'Stack',
    pattern: 'Stack',
    neetcodeOrder: 40,
    leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
    summary:
      'Given a string of brackets, return true if every opening bracket is closed by the same type of bracket in the correct order.',
    tags: ['stack', 'string'],
    entryFunction: 'isValid',
    publicTests: [
      { index: 0, args: ['()[]{}'], expected: true },
      { index: 1, args: ['(]'], expected: false },
      { index: 2, args: ['([)]'], expected: false },
      { index: 3, args: ['{[]}'], expected: true },
    ],
  },
  {
    id: 'valid-palindrome',
    leetcodeSlug: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'EASY',
    category: 'Two Pointers',
    pattern: 'Two Pointers',
    neetcodeOrder: 5,
    leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
    summary:
      'Given a string, return true if it reads the same forwards and backwards, ignoring case and all non-alphanumeric characters.',
    tags: ['two-pointers', 'string'],
    entryFunction: 'isPalindrome',
    publicTests: [
      { index: 0, args: ['A man, a plan, a canal: Panama'], expected: true },
      { index: 1, args: ['race a car'], expected: false },
      { index: 2, args: [' '], expected: true },
    ],
  },
  {
    id: 'best-time-to-buy-and-sell-stock',
    leetcodeSlug: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'EASY',
    category: 'Sliding Window',
    pattern: 'Sliding Window',
    neetcodeOrder: 6,
    leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    summary:
      'Given daily stock prices, return the maximum profit achievable from one buy followed by one later sell. Return 0 if no profit is possible.',
    tags: ['array', 'sliding-window'],
    entryFunction: 'maxProfit',
    publicTests: [
      { index: 0, args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { index: 1, args: [[7, 6, 4, 3, 1]], expected: 0 },
    ],
  },
  {
    id: 'longest-substring-without-repeating-characters',
    leetcodeSlug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM',
    category: 'Sliding Window',
    pattern: 'Sliding Window',
    neetcodeOrder: 7,
    leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    summary:
      'Given a string, return the length of the longest substring that contains no repeated characters.',
    tags: ['sliding-window', 'string', 'hash-table'],
    entryFunction: 'lengthOfLongestSubstring',
    publicTests: [
      { index: 0, args: ['abcabcbb'], expected: 3 },
      { index: 1, args: ['bbbbb'], expected: 1 },
      { index: 2, args: ['pwwkew'], expected: 3 },
    ],
  },
  {
    id: 'binary-search',
    leetcodeSlug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'EASY',
    category: 'Binary Search',
    pattern: 'Binary Search',
    neetcodeOrder: 20,
    leetcodeUrl: 'https://leetcode.com/problems/binary-search/',
    summary:
      'Given a sorted array of distinct integers and a target, return the target index or -1 if the target is not present.',
    tags: ['binary-search', 'array'],
    entryFunction: 'search',
    publicTests: [
      { index: 0, args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { index: 1, args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
    ],
  },
  {
    id: 'reverse-linked-list',
    leetcodeSlug: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'EASY',
    category: 'Linked List',
    pattern: 'Linked List',
    neetcodeOrder: 25,
    leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
    summary:
      'Given the head of a singly linked list, reverse the list and return its new head. Values arrive as arrays in the harness.',
    tags: ['linked-list'],
    entryFunction: 'reverseList',
    publicTests: [
      { index: 0, args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { index: 1, args: [[]], expected: [] },
      { index: 2, args: [[1]], expected: [1] },
    ],
  },
  {
    id: 'invert-binary-tree',
    leetcodeSlug: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    difficulty: 'EASY',
    category: 'Trees',
    pattern: 'Tree',
    neetcodeOrder: 30,
    leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/',
    summary:
      'Given the root of a binary tree, return the tree with every left and right child swapped. The harness passes a level-order array with nulls.',
    tags: ['tree', 'binary-tree'],
    entryFunction: 'invertTree',
    publicTests: [
      { index: 0, args: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1] },
      { index: 1, args: [[]], expected: [] },
      { index: 2, args: [[2, 1, 3]], expected: [2, 3, 1] },
    ],
  },
  {
    id: 'kth-largest-element-in-an-array',
    leetcodeSlug: 'kth-largest-element-in-an-array',
    title: 'Kth Largest Element in an Array',
    difficulty: 'MEDIUM',
    category: 'Heap / Priority Queue',
    pattern: 'Heap',
    neetcodeOrder: 35,
    leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    summary:
      'Given an integer array and an integer k, return the kth largest element in sorted order. It is not the kth distinct element.',
    tags: ['heap', 'array'],
    entryFunction: 'findKthLargest',
    publicTests: [
      { index: 0, args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { index: 1, args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
    ],
  },
  {
    id: 'number-of-islands',
    leetcodeSlug: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'MEDIUM',
    category: 'Graphs',
    pattern: 'Graph',
    neetcodeOrder: 45,
    leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
    summary:
      'Given a grid of water and land, count the number of islands. Land cells connect horizontally and vertically, and diagonals do not count.',
    tags: ['graph', 'dfs', 'bfs'],
    entryFunction: 'numIslands',
    publicTests: [
      {
        index: 0,
        args: [
          [
            ['1', '1', '1', '1', '0'],
            ['1', '1', '0', '1', '0'],
            ['1', '1', '0', '0', '0'],
            ['0', '0', '0', '0', '0'],
          ],
        ],
        expected: 1,
      },
      {
        index: 1,
        args: [
          [
            ['1', '1', '0', '0', '0'],
            ['1', '1', '0', '0', '0'],
            ['0', '0', '1', '0', '0'],
            ['0', '0', '0', '1', '1'],
          ],
        ],
        expected: 3,
      },
    ],
  },
  {
    id: 'climbing-stairs',
    leetcodeSlug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'EASY',
    category: '1-D DP',
    pattern: 'Dynamic Programming',
    neetcodeOrder: 50,
    leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
    summary:
      'Given n steps, return the number of distinct ways to climb to the top if you can take one or two steps at a time.',
    tags: ['dynamic-programming', 'math'],
    entryFunction: 'climbStairs',
    publicTests: [
      { index: 0, args: [2], expected: 2 },
      { index: 1, args: [3], expected: 3 },
      { index: 2, args: [10], expected: 89 },
    ],
  },
];

/** Roadmap ordering used to group the browser into NeetCode-style sections. */
export const SEED_CATEGORY_ORDER = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Heap / Priority Queue',
  'Graphs',
  '1-D DP',
] as const;

export function groupProblemsByCategory(problems: SeedProblem[]): {
  category: string;
  problems: SeedProblem[];
}[] {
  const order = [...SEED_CATEGORY_ORDER];
  const groups = new Map<string, SeedProblem[]>();
  for (const problem of problems) {
    const list = groups.get(problem.category) ?? [];
    list.push(problem);
    groups.set(problem.category, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.neetcodeOrder - b.neetcodeOrder);
  }
  return [...groups.entries()]
    .map(([category, list]) => ({ category, problems: list }))
    .sort((a, b) => {
      const ai = order.indexOf(a.category as (typeof order)[number]);
      const bi = order.indexOf(b.category as (typeof order)[number]);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
}

export const EMPTY_PROGRESS: LearningStatus = 'NOT_STARTED';