import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
if (missing.length && typeof window !== "undefined") {
  console.warn(`[firebase] Missing env vars: ${missing.join(", ")} — Firestore will fail until .env.local is set.`);
}

let app: ReturnType<typeof initializeApp>;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>);
} catch (e) {
  // Fallback for build/prerender without env — use dummy app
  app = { name: "[DEFAULT]", options: firebaseConfig } as unknown as ReturnType<typeof initializeApp>;
  if (typeof window !== "undefined") console.warn("[firebase] initializeApp failed:", e);
}
let _db: ReturnType<typeof getFirestore> | null = null;
try {
  if (typeof window !== "undefined") {
    try {
      _db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager(undefined),
        }),
      });
    } catch (e) {
      const msg = (e as Error)?.message ?? "";
      if (msg.includes("already") || msg.includes("exists")) {
        _db = getFirestore(app);
      } else {
        console.warn("[firebase] initializeFirestore with persistent cache failed, fallback to getFirestore", e);
        _db = getFirestore(app);
      }
    }
  } else {
    _db = getFirestore(app);
  }
} catch (e) {
  if (typeof window !== "undefined") console.warn("[firebase] getFirestore failed:", e);
  _db = null as unknown as ReturnType<typeof getFirestore>;
}
export const db = _db as ReturnType<typeof getFirestore>;

let _auth: ReturnType<typeof getAuth> | null = null;
try {
  _auth = getAuth(app);
} catch (e) {
  if (typeof window !== "undefined") console.warn("[firebase] getAuth failed (missing env):", e);
  _auth = null as unknown as ReturnType<typeof getAuth>;
}
export const auth = _auth as ReturnType<typeof getAuth>;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
