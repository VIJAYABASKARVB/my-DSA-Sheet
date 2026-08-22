#!/usr/bin/env node
// Migrate Firestore `problems` from `source` single string to `tags: string[]`
// Usage: npm run migrate:tags  (requires NEXT_PUBLIC_FIREBASE_* env vars)

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

const snap = await getDocs(collection(db, "problems"));
console.log(`Found ${snap.size} docs in "problems"`);
let migrated = 0;
for (const d of snap.docs) {
  const data = d.data();
  if (Array.isArray(data.tags) && data.tags.length) continue;
  const source = data.source;
  if (source && typeof source === "string") {
    const tags = [source];
    await setDoc(doc(db, "problems", d.id), { tags, updatedAt: serverTimestamp() }, { merge: true });
    console.log(`  migrated ${d.id}: source=${source} -> tags=${JSON.stringify(tags)}`);
    migrated++;
  } else if (!Array.isArray(data.tags)) {
    await setDoc(doc(db, "problems", d.id), { tags: [], updatedAt: serverTimestamp() }, { merge: true });
    console.log(`  set empty tags for ${d.id}`);
    migrated++;
  }
}
console.log(`✅ Migrated ${migrated} docs to tags`);
process.exit(0);
