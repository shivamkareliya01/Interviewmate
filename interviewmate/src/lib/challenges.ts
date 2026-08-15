import { type TestCase } from "@/lib/piston";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  starterCode: string;
  language: string;
  timeLimitSeconds: number;
  referenceSolution: string;
  testCases?: TestCase[];
}

export interface ScoreBreakdown {
  correctness: number;
  efficiency: number;
  codeQuality: number;
  testCases: number;
  overallScore: number;
}

export interface FeedbackItem {
  type: "strength" | "suggestion" | "optimization";
  text: string;
}

export interface Submission {
  id: string;
  userId: string;
  challengeId: string;
  code: string;
  scores: ScoreBreakdown;
  feedback: FeedbackItem[];
  timeSpentSeconds: number;
  createdAt: string;
}

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "top-k-frequent",
    title: "Top K Frequent Elements",
    description:
      "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
    difficulty: "Hard",
    tags: ["Hash Table", "Bucket Sort"],
    language: "python3",
    timeLimitSeconds: 2728,
    starterCode: `from typing import List

def topKFrequent(nums: List[int], k: int) -> List[int]:
    # Write your solution here
    pass`,
    referenceSolution: `from collections import Counter
import heapq

def topKFrequent(nums, k):
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)`,
    testCases: [
      { id: "tc_topk_1", input: "nums = [1,1,1,2,2,3], k = 2", expectedOutput: "[1, 2]", isSample: true },
      { id: "tc_topk_2", input: "nums = [1], k = 1", expectedOutput: "[1]", isSample: true },
      { id: "tc_topk_3", input: "nums = [4,4,4,6,6,7,7,7,7], k = 2", expectedOutput: "[7, 4]", isSample: false },
      { id: "tc_topk_4", input: "nums = [-1,-1,2,2,2], k = 1", expectedOutput: "[2]", isSample: false },
    ],
  },
  {
    id: "two-sum",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    language: "python3",
    timeLimitSeconds: 900,
    starterCode: `from typing import List

def twoSum(nums: List[int], target: int) -> List[int]:
    # Write your solution here
    pass`,
    referenceSolution: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i
    return []`,
    testCases: [
      { id: "tc_twosum_1", input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0, 1]", isSample: true },
      { id: "tc_twosum_2", input: "nums = [3,2,4], target = 6", expectedOutput: "[1, 2]", isSample: true },
      { id: "tc_twosum_3", input: "nums = [3,3], target = 6", expectedOutput: "[0, 1]", isSample: false },
      { id: "tc_twosum_4", input: "nums = [-1,-2,-3,-4,-5], target = -8", expectedOutput: "[2, 4]", isSample: false },
    ],
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) time complexity for get and put.",
    difficulty: "Hard",
    tags: ["Hash Table", "Doubly-Linked List"],
    language: "python3",
    timeLimitSeconds: 1800,
    starterCode: `class LRUCache:
    def __init__(self, capacity: int):
        # Initialize LRU cache with capacity
        pass

    def get(self, key: int) -> int:
        # Return value of key if key exists, otherwise return -1
        pass

    def put(self, key: int, value: int) -> None:
        # Update or insert value if key not present. Evict LRU item if capacity exceeded.
        pass`,
    referenceSolution: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
    testCases: [
      { id: "tc_lru_1", input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', expectedOutput: "[null, null, null, 1, null, -1, null, -1, 3, 4]", isSample: true },
      { id: "tc_lru_2", input: '["LRUCache", "get", "put", "get"]\n[[1], [1], [2, 10], [2]]', expectedOutput: "[null, -1, null, 10]", isSample: true },
      { id: "tc_lru_3", input: '["LRUCache", "put", "put", "put", "get"]\n[[2], [1, 1], [2, 2], [3, 3], [1]]', expectedOutput: "[null, null, null, null, -1]", isSample: false },
    ],
  },
  {
    id: "valid-anagram",
    title: "Valid Anagram",
    description:
      "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    difficulty: "Easy",
    tags: ["String", "Hash Table"],
    language: "python3",
    timeLimitSeconds: 900,
    starterCode: `def isAnagram(s: str, t: str) -> bool:
    # Write your solution here
    pass`,
    referenceSolution: `from collections import Counter

def isAnagram(s: str, t: str) -> bool:
    return Counter(s) == Counter(t)`,
    testCases: [
      { id: "tc_anagram_1", input: 's = "anagram", t = "nagaram"', expectedOutput: "true", isSample: true },
      { id: "tc_anagram_2", input: 's = "rat", t = "car"', expectedOutput: "false", isSample: true },
      { id: "tc_anagram_3", input: 's = "listen", t = "silent"', expectedOutput: "true", isSample: false },
      { id: "tc_anagram_4", input: 's = "a", t = "ab"', expectedOutput: "false", isSample: false },
    ],
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    description:
      "Given a string s, find the length of the longest substring without repeating characters in O(N) time.",
    difficulty: "Medium",
    tags: ["Sliding Window", "Hash Set"],
    language: "python3",
    timeLimitSeconds: 1500,
    starterCode: `def lengthOfLongestSubstring(s: str) -> int:
    # Write your solution here
    pass`,
    referenceSolution: `def lengthOfLongestSubstring(s: str) -> int:
    charSet = set()
    l = 0
    res = 0
    for r in range(len(s)):
        while s[r] in charSet:
            charSet.remove(s[l])
            l += 1
        charSet.add(s[r])
        res = max(res, r - l + 1)
    return res`,
    testCases: [
      { id: "tc_longest_1", input: 's = "abcabcbb"', expectedOutput: "3", isSample: true },
      { id: "tc_longest_2", input: 's = "bbbbb"', expectedOutput: "1", isSample: true },
      { id: "tc_longest_3", input: 's = "pwwkew"', expectedOutput: "3", isSample: false },
      { id: "tc_longest_4", input: 's = ""', expectedOutput: "0", isSample: false },
    ],
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "Easy",
    tags: ["Linked List", "Two Pointers"],
    language: "python3",
    timeLimitSeconds: 900,
    starterCode: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def reverseList(head):
    # Write your solution here
    pass`,
    referenceSolution: `def reverseList(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
    testCases: [
      { id: "tc_rev_1", input: "head = [1,2,3,4,5]", expectedOutput: "[5, 4, 3, 2, 1]", isSample: true },
      { id: "tc_rev_2", input: "head = [1,2]", expectedOutput: "[2, 1]", isSample: true },
      { id: "tc_rev_3", input: "head = []", expectedOutput: "[]", isSample: false },
    ],
  },
  {
    id: "container-with-most-water",
    title: "Container With Most Water",
    description:
      "Given n non-negative integers height where each represents a point at coordinate (i, height[i]), find two lines that together with the x-axis form a container containing the most water.",
    difficulty: "Medium",
    tags: ["Two Pointers", "Greedy"],
    language: "python3",
    timeLimitSeconds: 1200,
    starterCode: `from typing import List

def maxArea(height: List[int]) -> int:
    # Write your solution here
    pass`,
    referenceSolution: `def maxArea(height):
    l, r = 0, len(height) - 1
    max_w = 0
    while l < r:
        max_w = max(max_w, (r - l) * min(height[l], height[r]))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return max_w`,
    testCases: [
      { id: "tc_water_1", input: "height = [1,8,6,2,5,4,8,3,7]", expectedOutput: "49", isSample: true },
      { id: "tc_water_2", input: "height = [1,1]", expectedOutput: "1", isSample: true },
      { id: "tc_water_3", input: "height = [4,3,2,1,4]", expectedOutput: "16", isSample: false },
    ],
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    language: "python3",
    timeLimitSeconds: 900,
    starterCode: `def isValid(s: str) -> bool:
    # Write your solution here
    pass`,
    referenceSolution: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
    testCases: [
      { id: "tc_paren_1", input: 's = "()"', expectedOutput: "true", isSample: true },
      { id: "tc_paren_2", input: 's = "()[]{}"', expectedOutput: "true", isSample: true },
      { id: "tc_paren_3", input: 's = "(]"', expectedOutput: "false", isSample: false },
    ],
  },
  {
    id: "best-time-stock",
    title: "Best Time to Buy and Sell Stock",
    description:
      "You are given an array prices where prices[i] is the price of a given stock on the ith day. Return the maximum profit you can achieve from this transaction.",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    language: "python3",
    timeLimitSeconds: 900,
    starterCode: `from typing import List

def maxProfit(prices: List[int]) -> int:
    # Write your solution here
    pass`,
    referenceSolution: `def maxProfit(prices):
    min_p = float('inf')
    max_profit = 0
    for p in prices:
        if p < min_p:
            min_p = p
        elif p - min_p > max_profit:
            max_profit = p - min_p
    return max_profit`,
    testCases: [
      { id: "tc_stock_1", input: "prices = [7,1,5,3,6,4]", expectedOutput: "5", isSample: true },
      { id: "tc_stock_2", input: "prices = [7,6,4,3,1]", expectedOutput: "0", isSample: true },
    ],
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    description:
      "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    difficulty: "Medium",
    tags: ["Hash Table", "String"],
    language: "python3",
    timeLimitSeconds: 1200,
    starterCode: `from typing import List
from collections import defaultdict

def groupAnagrams(strs: List[str]) -> List[List[str]]:
    # Write your solution here
    pass`,
    referenceSolution: `from collections import defaultdict

def groupAnagrams(strs):
    ans = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        ans[tuple(count)].append(s)
    return list(ans.values())`,
    testCases: [
      { id: "tc_grp_1", input: 'strs = ["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]', isSample: true },
      { id: "tc_grp_2", input: 'strs = [""]', expectedOutput: '[[""]]', isSample: true },
    ],
  },
];

const SUBMISSIONS_KEY = "interviewmate_submissions";
const DRAFT_CODE_KEY = "interviewmate_draft_code";

export function getUserSubmissions(userId: string): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${SUBMISSIONS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserSubmission(userId: string, submission: Submission): void {
  if (typeof window === "undefined") return;
  const existing = getUserSubmissions(userId);
  const updated = [submission, ...existing];
  localStorage.setItem(`${SUBMISSIONS_KEY}_${userId}`, JSON.stringify(updated));
}

export function saveDraftCode(userId: string, challengeId: string, language: string, code: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${DRAFT_CODE_KEY}_${userId}_${challengeId}_${language}`, code);
  localStorage.setItem(`${DRAFT_CODE_KEY}_lastlang_${userId}_${challengeId}`, language);
}

export function getDraftCode(userId: string, challengeId: string, language: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${DRAFT_CODE_KEY}_${userId}_${challengeId}_${language}`);
}

export function getLastUsedLanguage(userId: string, challengeId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${DRAFT_CODE_KEY}_lastlang_${userId}_${challengeId}`);
}

export function calculateUserStats(userId: string) {
  const submissions = getUserSubmissions(userId);

  if (submissions.length === 0) {
    return {
      totalPoints: 0,
      streakCount: 0,
      submissionsCount: 0,
      latestSubmission: null,
    };
  }

  // Points calculation: sum of overallScore * difficulty multiplier
  let totalPoints = 0;
  submissions.forEach((sub) => {
    totalPoints += sub.scores.overallScore * 10;
  });

  // Calculate practice streak from submission dates
  const dates = Array.from(
    new Set(
      submissions.map((s) => new Date(s.createdAt).toISOString().split("T")[0])
    )
  ).sort().reverse();

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (dates.includes(today) || dates.includes(yesterday)) {
    let currentCheck = new Date(dates[0]).getTime();
    streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i]).getTime();
      const diffDays = Math.round((currentCheck - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
        currentCheck = prevDate;
      } else {
        break;
      }
    }
  }

  return {
    totalPoints,
    streakCount: streak,
    submissionsCount: submissions.length,
    latestSubmission: submissions[0],
  };
}
