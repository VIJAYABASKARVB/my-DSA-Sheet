#!/usr/bin/env node
// One-off: delete a single problem from Firestore shared collections.
// Usage: npm run delete:problem  (or node scripts/delete-problem.mjs)
// Requires NEXT_PUBLIC_FIREBASE_* env vars in .env.local or shell (same as npm run seed).
// Deletes: problems/{PROBLEM_ID}, problemOverrides/{PROBLEM_ID} (if exists),
// and removes PROBLEM_ID from patterns/{PATTERN_ID}.problemIds.
// Does NOT touch per-user users/*/progress or users/*/notes (orphans are harmless —
// the UI only renders IDs present in the problems collection).

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const PROBLEM_ID = "longest-subarray-with-zero-sum";
const PATTERN_ID = "prefix-sum-problems";

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
  console.error("Set them in .env.local or shell before running: npm run delete:problem");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Delete problems/{PROBLEM_ID}
const problemRef = doc(db, "problems", PROBLEM_ID);
const problemSnap = await getDoc(problemRef);
if (problemSnap.exists()) {
  await deleteDoc(problemRef);
  console.log(`✅ Deleted problems/${PROBLEM_ID}`);
} else {
  console.log(`ℹ️  problems/${PROBLEM_ID} not found (already deleted?)`);
}

// 2. Remove ID from patterns/{PATTERN_ID}.problemIds
const patternRef = doc(db, "patterns", PATTERN_ID);
const patternSnap = await getDoc(patternRef);
if (patternSnap.exists()) {
  const data = patternSnap.data();
  const before = Array.isArray(data.problemIds) ? data.problemIds : [];
  const after = before.filter((id) => id !== PROBLEM_ID);
  if (after.length !== before.length) {
    await setDoc(
      patternRef,
      { problemIds: after, updatedAt: serverTimestamp() },
      { merge: true }
    );
    console.log(`✅ patterns/${PATTERN_ID}.problemIds ${before.length}→${after.length}`);
  } else {
    console.log(`ℹ️  patterns/${PATTERN_ID}.problemIds already clean (${before.length} ids)`);
  }
} else {
  console.warn(`⚠️  patterns/${PATTERN_ID} not found — nothing to update`);
}

// 3. Delete problemOverrides/{PROBLEM_ID} if present
const overrideRef = doc(db, "problemOverrides", PROBLEM_ID);
const overrideSnap = await getDoc(overrideRef);
if (overrideSnap.exists()) {
  await deleteDoc(overrideRef);
  console.log(`✅ Deleted problemOverrides/${PROBLEM_ID}`);
} else {
  console.log(`ℹ️  problemOverrides/${PROBLEM_ID} not found (nothing to do)`);
}

// 4. Verify
const verifyProblem = await getDoc(problemRef);
const verifyPattern = await getDoc(patternRef);
const problemsSnap = await getDocs(collection(db, "problems"));
const stillListed =
  verifyPattern.exists() &&
  Array.isArray(verifyPattern.data().problemIds) &&
  verifyPattern.data().problemIds.includes(PROBLEM_ID);
console.log(
  `Verified: problems/${PROBLEM_ID} exists=${verifyProblem.exists()}, ` +
    `listed in patterns/${PATTERN_ID}=${stillListed}, problems collection size=${problemsSnap.size}`
);
if (verifyProblem.exists() || stillListed) {
  console.error("❌ Cleanup incomplete — see lines above");
  process.exit(1);
}
console.log("✅ Cleanup complete");

process.exit(0);
