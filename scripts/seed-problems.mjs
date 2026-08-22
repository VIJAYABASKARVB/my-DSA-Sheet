#!/usr/bin/env node
// Seed Firestore `problems` collection from src/data/problems.json (flat collection, verbatim IDs)
// Usage: npm run seed  (requires NEXT_PUBLIC_FIREBASE_* env vars in .env.local or shell)
// No runtime JSON fetch — JSON files are seed-only artifacts, app reads exclusively from Firestore via onSnapshot.

import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";

// Load env from .env.local if present (simple parser, no dotenv dep)
import { existsSync } from "fs";
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

const PROBLEMS_JSON = resolve(process.cwd(), "src/data/problems.json");
if (!existsSync(PROBLEMS_JSON)) {
  console.error(`Not found: ${PROBLEMS_JSON}`);
  process.exit(1);
}

const raw = JSON.parse(readFileSync(PROBLEMS_JSON, "utf8"));
const topics = raw.topics ?? raw;
if (!Array.isArray(topics)) {
  console.error("Invalid problems.json: expected { topics: [...] } or [...]");
  process.exit(1);
}

let total = 0;
let seeded = 0;

console.log(`Found ${topics.length} topics in ${PROBLEMS_JSON}`);

for (const topic of topics) {
  const topicId = topic.topicId ?? topic.id;
  const topicName = topic.name;
  const patterns = topic.patterns ?? [];
  for (const pat of patterns) {
    const patternId = pat.patternId ?? pat.id;
    const patternName = pat.name;
    const problems = pat.problems ?? [];
    for (const p of problems) {
      total++;
      const problemId = p.id;
      const docData = {
        id: problemId,
        name: p.name,
        difficulty: p.difficulty,
        source: p.source,
        links: p.links ?? [],
        topicId,
        topicName,
        patternId,
        patternName,
        updatedAt: serverTimestamp(),
      };
      // Use merge to keep idempotent
      await setDoc(doc(db, "problems", problemId), docData, { merge: true });
      seeded++;
      if (seeded % 10 === 0) console.log(`  ...seeded ${seeded}/${total} (${problemId})`);
    }
  }
}

console.log(`✅ Seeded ${seeded} problems to Firestore collection "problems" (project: ${firebaseConfig.projectId})`);

// Optional verification: count docs
try {
  const snap = await getDocs(collection(db, "problems"));
  console.log(`Verified collection size: ${snap.size} docs in "problems"`);
} catch (e) {
  console.warn("Could not verify collection size:", e.message);
}

process.exit(0);
