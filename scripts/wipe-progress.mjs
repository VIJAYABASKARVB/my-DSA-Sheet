#!/usr/bin/env node
// Wipe Firestore progress (and optionally overrides) for fresh start
// Usage: npm run wipe:progress  (or node scripts/wipe-progress.mjs --overrides)

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error(`Missing Firebase env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const includeOverrides = process.argv.includes("--overrides") || process.argv.includes("--all");

async function wipeCollection(name) {
  const snap = await getDocs(collection(db, name));
  console.log(`Found ${snap.size} docs in "${name}"`);
  let deleted = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, name, d.id));
    deleted++;
    if (deleted % 20 === 0) console.log(`  ...deleted ${deleted}/${snap.size}`);
  }
  console.log(`✅ Wiped ${deleted} docs from "${name}"`);
}

async function wipeUserProgress() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    console.log(`Found ${usersSnap.size} users`);
    let totalDeleted = 0;
    for (const userDoc of usersSnap.docs) {
      const progSnap = await getDocs(collection(db, "users", userDoc.id, "progress"));
      console.log(`  User ${userDoc.id}: ${progSnap.size} progress docs`);
      for (const d of progSnap.docs) {
        await deleteDoc(doc(db, "users", userDoc.id, "progress", d.id));
        totalDeleted++;
      }
    }
    console.log(`✅ Wiped ${totalDeleted} docs from users/*/progress`);
    return totalDeleted;
  } catch (e) {
    console.warn("Could not wipe users/*/progress (may not exist yet):", e.message);
    return 0;
  }
}

await wipeCollection("progress"); // legacy global
await wipeUserProgress();
if (includeOverrides) {
  await wipeCollection("problemOverrides");
  console.log("Also wiped problemOverrides (via --overrides)");
} else {
  console.log("Skipped problemOverrides (run with --overrides to wipe them too)");
}

process.exit(0);
