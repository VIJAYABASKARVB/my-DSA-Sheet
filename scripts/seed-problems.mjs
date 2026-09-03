#!/usr/bin/env node
// Seed Firestore collections from individual topic JSON files (source of truth)
// Usage: npm run seed  (requires NEXT_PUBLIC_FIREBASE_* env vars in .env.local or shell)
// Reads 5 topic JSON files and upserts to Firestore: topics/{topicId}, patterns/{patternId}, problems/{problemId}
// No runtime JSON fetch — JSON files are seed-only artifacts, app reads exclusively from Firestore via onSnapshot.

import { readFileSync } from "fs";
import { resolve } from "path";
import { existsSync } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";

// Load env from .env.local if present (simple parser, no dotenv dep)
function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const src = readFileSync(path, "utf8");
  for (const line of src.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, vRaw] = m;
    if (process.env[k] === undefined) {
      let v = vRaw.trim().replace(/^["']|["']$/g, "");
      process.env[k] = v;
    }
  }
}
loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`Missing Firebase env vars: ${missing.join(", ")}`);
  console.error("Set them in .env.local or shell before running: npm run seed");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Read individual topic JSON files (source of truth) — order matches requested: array & hashing → Two Pointers → Prefix Sum → matrix → algorithms → Strings → Recursion & Backtracking → LinkedList → Sliding Window → Binary search → trees → binary-search-tree
const topicFiles = [
  "src/data/arrays-hashing-topic.json",
  "src/data/two-pointers-topic.json",
  "src/data/prefix-sum-topic.json",
  "src/data/matrix-topic.json",
  "src/data/algorithms-topic.json",
  "src/data/strings-topic.json",
  "src/data/recursion-backtracking-topic.json",
  "src/data/linked-list-topic.json",
  "src/data/sliding-window-topic.json",
  "src/data/binary-search-topic.json",
  "src/data/trees-topic.json",
  "src/data/binary-search-tree-topic.json",
];

const topics = [];
for (const rel of topicFiles) {
  const full = resolve(process.cwd(), rel);
  if (!existsSync(full)) {
    console.error(`Not found: ${full}`);
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(full, "utf8"));
  topics.push(data);
  console.log(`Loaded ${rel}: ${data.topicId} — ${data.patterns.length} patterns, ${data.patterns.reduce((a, p) => a + p.problems.length, 0)} problems`);
}

console.log(`\nFound ${topics.length} topics from individual JSON files`);

let totalProblems = 0;
let totalPatterns = 0;
let seededProblems = 0;
let seededPatterns = 0;
let seededTopics = 0;

for (let topicIdx = 0; topicIdx < topics.length; topicIdx++) {
  const topic = topics[topicIdx];
  const topicId = topic.topicId ?? topic.id;
  const topicName = topic.name;
  const topicOrder = topicIdx;
  const patterns = topic.patterns ?? [];

  // Write topic metadata to topics/{topicId}
  const topicDoc = {
    topicId,
    name: topicName,
    order: topicOrder,
    patternIds: patterns.map((p) => p.patternId ?? p.id),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, "topics", topicId), topicDoc, { merge: true });
  seededTopics++;
  console.log(`  + topics/${topicId} (order ${topicOrder})`);

  for (const pat of patterns) {
    const patternId = pat.patternId ?? pat.id;
    const patternName = pat.name;
    const patternOrder = pat.order ?? patterns.indexOf(pat);
    const problems = pat.problems ?? [];
    totalPatterns++;

    // Write pattern to patterns/{patternId}
    const patternDoc = {
      patternId,
      name: patternName,
      topicId,
      topicName,
      order: patternOrder,
      problemIds: problems.map((p) => p.id),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "patterns", patternId), patternDoc, { merge: true });
    seededPatterns++;

    for (const p of problems) {
      totalProblems++;
      const problemId = p.id;
      const tags = Array.isArray(p.tags) ? p.tags : p.source ? [p.source] : [];
      const docData = {
        id: problemId,
        name: p.name,
        difficulty: p.difficulty,
        tags,
        links: p.links ?? [],
        topicId,
        topicName,
        topicOrder,
        patternId,
        patternName,
        patternOrder,
        order: p.order ?? problems.indexOf(p),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "problems", problemId), docData, { merge: true });
      seededProblems++;
      if (seededProblems % 10 === 0) console.log(`  ...seeded ${seededProblems}/${totalProblems} problems (${problemId})`);
    }
  }
}

console.log(`\n✅ Seeded ${seededTopics} topics, ${seededPatterns} patterns, ${seededProblems} problems to Firestore (project: ${firebaseConfig.projectId})`);

// Verification: count docs in each collection
try {
  const [topicsSnap, patternsSnap, problemsSnap] = await Promise.all([
    getDocs(collection(db, "topics")),
    getDocs(collection(db, "patterns")),
    getDocs(collection(db, "problems")),
  ]);
  console.log(`Verified: topics=${topicsSnap.size}, patterns=${patternsSnap.size}, problems=${problemsSnap.size}`);
  if (topicsSnap.size !== 12) console.warn(`⚠️  Expected 12 topics, got ${topicsSnap.size}`);
} catch (e) {
  console.warn("Could not verify collection sizes:", e.message);
}

process.exit(0);
