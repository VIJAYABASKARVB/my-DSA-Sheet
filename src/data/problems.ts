import type { Topic } from "@/lib/types";

export const topics: Topic[] = [
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    patterns: [
      {
        id: "stage-1-array-basics",
        name: "Stage 1 — Array Basics",
        topicId: "arrays-hashing",
        problems: [
          { id: "largest-element-in-array", name: "Largest Element in an Array", difficulty: "Easy", source: "Striver", links: [], topicId: "arrays-hashing", patternId: "stage-1-array-basics" },
          { id: "second-smallest-and-largest-element", name: "Second Smallest & Largest Element", difficulty: "Easy", source: "Striver", links: [], topicId: "arrays-hashing", patternId: "stage-1-array-basics" },
          { id: "check-if-array-is-sorted", name: "Check if Array is Sorted", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/" }], topicId: "arrays-hashing", patternId: "stage-1-array-basics" },
          { id: "linear-search", name: "Linear Search", difficulty: "Easy", source: "Striver", links: [], topicId: "arrays-hashing", patternId: "stage-1-array-basics" },
          { id: "maximum-consecutive-ones", name: "Maximum Consecutive Ones", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/max-consecutive-ones/" }], topicId: "arrays-hashing", patternId: "stage-1-array-basics" },
          { id: "concatenation-of-array", name: "Concatenation of Array", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/concatenation-of-array/" }], topicId: "arrays-hashing", patternId: "stage-1-array-basics" },
          { id: "remove-element", name: "Remove Element", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/remove-element/" }], topicId: "arrays-hashing", patternId: "stage-1-array-basics" },
        ],
      },
      {
        id: "stage-2-basic-hashing-counting",
        name: "Stage 2 — Basic Hashing & Counting",
        topicId: "arrays-hashing",
        problems: [
          { id: "contains-duplicate", name: "Contains Duplicate", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/contains-duplicate/" }], topicId: "arrays-hashing", patternId: "stage-2-basic-hashing-counting" },
          { id: "valid-anagram", name: "Valid Anagram", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/valid-anagram/" }], topicId: "arrays-hashing", patternId: "stage-2-basic-hashing-counting" },
          { id: "two-sum", name: "Two Sum", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/two-sum/" }], topicId: "arrays-hashing", patternId: "stage-2-basic-hashing-counting" },
          { id: "majority-element", name: "Majority Element", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/majority-element/" }], topicId: "arrays-hashing", patternId: "stage-2-basic-hashing-counting" },
          { id: "find-missing-number", name: "Find Missing Number", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/missing-number/" }], topicId: "arrays-hashing", patternId: "stage-2-basic-hashing-counting" },
          { id: "number-that-appears-once", name: "Number that Appears Once", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/single-number/" }], topicId: "arrays-hashing", patternId: "stage-2-basic-hashing-counting" },
        ],
      },
      {
        id: "stage-3-sorting-based-problems",
        name: "Stage 3 — Sorting-Based Problems",
        topicId: "arrays-hashing",
        problems: [
          { id: "sort-an-array", name: "Sort an Array", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/sort-an-array/" }], topicId: "arrays-hashing", patternId: "stage-3-sorting-based-problems" },
          { id: "sort-colors", name: "Sort Colors", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/sort-colors/" }], topicId: "arrays-hashing", patternId: "stage-3-sorting-based-problems" },
          { id: "longest-common-prefix", name: "Longest Common Prefix", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/longest-common-prefix/" }], topicId: "arrays-hashing", patternId: "stage-3-sorting-based-problems" },
          { id: "group-anagrams", name: "Group Anagrams", difficulty: "Medium", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/group-anagrams/" }], topicId: "arrays-hashing", patternId: "stage-3-sorting-based-problems" },
          { id: "merge-overlapping-intervals", name: "Merge Overlapping Intervals", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/merge-intervals/" }], topicId: "arrays-hashing", patternId: "stage-3-sorting-based-problems" },
          { id: "leaders-in-an-array", name: "Leaders in an Array", difficulty: "Easy", source: "Striver", links: [], topicId: "arrays-hashing", patternId: "stage-3-sorting-based-problems" },
        ],
      },
      {
        id: "stage-4-array-manipulation",
        name: "Stage 4 — Array Manipulation",
        topicId: "arrays-hashing",
        problems: [
          { id: "left-rotate-array-by-one", name: "Left Rotate Array by One", difficulty: "Easy", source: "Striver", links: [], topicId: "arrays-hashing", patternId: "stage-4-array-manipulation" },
          { id: "rotate-array-by-k-places", name: "Rotate Array by K Places", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/rotate-array/" }], topicId: "arrays-hashing", patternId: "stage-4-array-manipulation" },
          { id: "rearrange-array-by-sign", name: "Rearrange Array by Sign", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/rearrange-array-elements-by-sign/" }], topicId: "arrays-hashing", patternId: "stage-4-array-manipulation" },
          { id: "next-permutation", name: "Next Permutation", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/next-permutation/" }], topicId: "arrays-hashing", patternId: "stage-4-array-manipulation" },
          { id: "stock-buy-and-sell", name: "Stock Buy and Sell", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" }], topicId: "arrays-hashing", patternId: "stage-4-array-manipulation" },
          { id: "best-time-to-buy-and-sell-stock-ii", name: "Best Time to Buy and Sell Stock II", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/" }], topicId: "arrays-hashing", patternId: "stage-4-array-manipulation" },
        ],
      },
      {
        id: "stage-5-prefix-sum-pattern",
        name: "Stage 5 — Prefix Sum Pattern",
        topicId: "arrays-hashing",
        problems: [
          { id: "range-sum-query-2d-immutable", name: "Range Sum Query 2D Immutable", difficulty: "Medium", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/range-sum-query-2d-immutable/" }], topicId: "arrays-hashing", patternId: "stage-5-prefix-sum-pattern" },
          { id: "subarray-sum-equals-k", name: "Subarray Sum Equals K", difficulty: "Medium", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/subarray-sum-equals-k/" }], topicId: "arrays-hashing", patternId: "stage-5-prefix-sum-pattern" },
          { id: "product-of-array-except-self", name: "Product of Array Except Self", difficulty: "Medium", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/product-of-array-except-self/" }], topicId: "arrays-hashing", patternId: "stage-5-prefix-sum-pattern" },
        ],
      },
      {
        id: "stage-6-advanced-hashing",
        name: "Stage 6 — Advanced Hashing",
        topicId: "arrays-hashing",
        problems: [
          { id: "top-k-frequent-elements", name: "Top K Frequent Elements", difficulty: "Medium", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/top-k-frequent-elements/" }], topicId: "arrays-hashing", patternId: "stage-6-advanced-hashing" },
          { id: "valid-sudoku", name: "Valid Sudoku", difficulty: "Medium", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/valid-sudoku/" }], topicId: "arrays-hashing", patternId: "stage-6-advanced-hashing" },
          { id: "longest-consecutive-sequence", name: "Longest Consecutive Sequence", difficulty: "Medium", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/longest-consecutive-sequence/" }], topicId: "arrays-hashing", patternId: "stage-6-advanced-hashing" },
          { id: "find-repeating-and-missing-number", name: "Find Repeating & Missing Number", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/set-mismatch/" }], topicId: "arrays-hashing", patternId: "stage-6-advanced-hashing" },
          { id: "majority-element-ii", name: "Majority Element II", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/majority-element-ii/" }], topicId: "arrays-hashing", patternId: "stage-6-advanced-hashing" },
        ],
      },
      {
        id: "stage-7-hard-placement-classics",
        name: "Stage 7 — Hard / Placement Classics",
        topicId: "arrays-hashing",
        problems: [
          { id: "first-missing-positive", name: "First Missing Positive", difficulty: "Hard", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/first-missing-positive/" }], topicId: "arrays-hashing", patternId: "stage-7-hard-placement-classics" },
        ],
      },
    ],
  },
  {
    id: "trees-dfs-bfs",
    name: "Trees — DFS & BFS",
    patterns: [
      {
        id: "stage-1-traversal-foundations",
        name: "Stage 1 — Traversal Foundations",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "binary-tree-inorder-traversal", name: "Binary Tree Inorder Traversal", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-1-traversal-foundations" },
          { id: "binary-tree-preorder-traversal", name: "Binary Tree Preorder Traversal", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-preorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-1-traversal-foundations" },
          { id: "binary-tree-postorder-traversal", name: "Binary Tree Postorder Traversal", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-postorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-1-traversal-foundations" },
          { id: "binary-tree-level-order-traversal", name: "Binary Tree Level Order Traversal", difficulty: "Medium", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-1-traversal-foundations" },
        ],
      },
      {
        id: "stage-2-iterative-traversals",
        name: "Stage 2 — Iterative Traversals",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "iterative-inorder-traversal", name: "Iterative Inorder Traversal", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-2-iterative-traversals" },
          { id: "iterative-preorder-traversal", name: "Iterative Preorder Traversal", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-preorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-2-iterative-traversals" },
          { id: "binary-tree-postorder-using-2-stacks", name: "Binary Tree Postorder Using 2 Stacks", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-postorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-2-iterative-traversals" },
          { id: "binary-tree-postorder-using-1-stack", name: "Binary Tree Postorder Using 1 Stack", difficulty: "Hard", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-postorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-2-iterative-traversals" },
        ],
      },
      {
        id: "stage-3-dfs-post-order-problems",
        name: "Stage 3 — DFS Post-order Problems",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "maximum-depth-of-binary-tree", name: "Maximum Depth of Binary Tree", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-3-dfs-post-order-problems" },
          { id: "balanced-binary-tree", name: "Balanced Binary Tree", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/balanced-binary-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-3-dfs-post-order-problems" },
          { id: "diameter-of-binary-tree", name: "Diameter of Binary Tree", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/diameter-of-binary-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-3-dfs-post-order-problems" },
          { id: "binary-tree-maximum-path-sum", name: "Binary Tree Maximum Path Sum", difficulty: "Hard", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" }], topicId: "trees-dfs-bfs", patternId: "stage-3-dfs-post-order-problems" },
        ],
      },
      {
        id: "stage-4-dfs-pre-order-problems",
        name: "Stage 4 — DFS Pre-order Problems",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "same-tree", name: "Same Tree", difficulty: "Easy", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/same-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-4-dfs-pre-order-problems" },
          { id: "symmetric-tree", name: "Symmetric Tree", difficulty: "Easy", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/symmetric-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-4-dfs-pre-order-problems" },
          { id: "binary-tree-right-side-view", name: "Binary Tree Right Side View", difficulty: "Medium", source: "Neetcode", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-right-side-view/" }], topicId: "trees-dfs-bfs", patternId: "stage-4-dfs-pre-order-problems" },
        ],
      },
      {
        id: "stage-5-bfs-level-order-variants",
        name: "Stage 5 — BFS Level Order Variants",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "zigzag-level-order-traversal", name: "ZigZag Level Order Traversal", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-5-bfs-level-order-variants" },
          { id: "maximum-width-of-binary-tree", name: "Maximum Width of Binary Tree", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/maximum-width-of-binary-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-5-bfs-level-order-variants" },
        ],
      },
      {
        id: "stage-6-view-problems",
        name: "Stage 6 — View Problems",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "vertical-order-traversal-of-a-binary-tree", name: "Vertical Order Traversal of a Binary Tree", difficulty: "Hard", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-6-view-problems" },
          { id: "top-view-of-binary-tree", name: "Top View of Binary Tree", difficulty: "Medium", source: "Striver", links: [], topicId: "trees-dfs-bfs", patternId: "stage-6-view-problems" },
          { id: "bottom-view-of-binary-tree", name: "Bottom View of Binary Tree", difficulty: "Medium", source: "Striver", links: [], topicId: "trees-dfs-bfs", patternId: "stage-6-view-problems" },
        ],
      },
      {
        id: "stage-7-path-and-ancestor-problems",
        name: "Stage 7 — Path & Ancestor Problems",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "print-root-to-node-path", name: "Print Root to Node Path", difficulty: "Medium", source: "Striver", links: [], topicId: "trees-dfs-bfs", patternId: "stage-7-path-and-ancestor-problems" },
          { id: "lowest-common-ancestor-of-a-binary-tree", name: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-7-path-and-ancestor-problems" },
          { id: "all-nodes-distance-k-in-binary-tree", name: "All Nodes Distance K in Binary Tree", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-7-path-and-ancestor-problems" },
        ],
      },
      {
        id: "stage-8-boundary-and-special-traversals",
        name: "Stage 8 — Boundary & Special Traversals",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "boundary-traversal-of-binary-tree", name: "Boundary Traversal of Binary Tree", difficulty: "Medium", source: "Striver", links: [], topicId: "trees-dfs-bfs", patternId: "stage-8-boundary-and-special-traversals" },
          { id: "check-for-children-sum-property", name: "Check for Children Sum Property", difficulty: "Medium", source: "Striver", links: [], topicId: "trees-dfs-bfs", patternId: "stage-8-boundary-and-special-traversals" },
        ],
      },
      {
        id: "stage-9-construction-problems",
        name: "Stage 9 — Construction Problems",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "requirements-to-construct-unique-bt", name: "Requirements to Construct Unique BT", difficulty: "Medium", source: "Others", links: [], topicId: "trees-dfs-bfs", patternId: "stage-9-construction-problems" },
          { id: "construct-bt-from-preorder-and-inorder", name: "Construct BT from Preorder and Inorder", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-9-construction-problems" },
          { id: "construct-bt-from-inorder-and-postorder", name: "Construct BT from Inorder and Postorder", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-9-construction-problems" },
        ],
      },
      {
        id: "stage-10-advanced-hard",
        name: "Stage 10 — Advanced / Hard",
        topicId: "trees-dfs-bfs",
        problems: [
          { id: "minimum-time-to-burn-the-bt", name: "Minimum Time to Burn the BT", difficulty: "Hard", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/amount-of-time-for-binary-tree-to-be-infected/" }], topicId: "trees-dfs-bfs", patternId: "stage-10-advanced-hard" },
          { id: "count-complete-tree-nodes", name: "Count Complete Tree Nodes", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/count-complete-tree-nodes/" }], topicId: "trees-dfs-bfs", patternId: "stage-10-advanced-hard" },
          { id: "serialize-and-deserialize-binary-tree", name: "Serialize and Deserialize Binary Tree", difficulty: "Hard", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" }], topicId: "trees-dfs-bfs", patternId: "stage-10-advanced-hard" },
          { id: "flatten-binary-tree-to-linked-list", name: "Flatten Binary Tree to Linked List", difficulty: "Medium", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/" }], topicId: "trees-dfs-bfs", patternId: "stage-10-advanced-hard" },
          { id: "morris-inorder-traversal", name: "Morris Inorder Traversal", difficulty: "Hard", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-10-advanced-hard" },
          { id: "morris-preorder-traversal", name: "Morris Preorder Traversal", difficulty: "Hard", source: "Striver", links: [{ platform: "LeetCode", url: "https://leetcode.com/problems/binary-tree-preorder-traversal/" }], topicId: "trees-dfs-bfs", patternId: "stage-10-advanced-hard" },
        ],
      },
    ],
  },
];

export const allProblems = topics.flatMap((t) => t.patterns.flatMap((p) => p.problems));
