"use client";
import { useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setLoading(false);
      },
      (err) => {
        console.error("[useAuth] onAuthStateChanged error", err);
        toast.error("Auth error: " + (err as Error).message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      toast.error("Firebase Auth not configured");
      return;
    }
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in");
    } catch (e) {
      const err = e as { code?: string; message?: string };
      // Don't toast on user-cancelled popup
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        return;
      }
      console.error("[useAuth] signInWithGoogle failed", e);
      toast.error("Sign-in failed: " + (err.message ?? "Unknown error"));
      throw e;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      toast.success("Signed out");
    } catch (e) {
      console.error("[useAuth] signOut failed", e);
      toast.error("Sign-out failed: " + (e as Error).message);
    }
  }, []);

  return { user, loading, signingIn, signInWithGoogle, signOut, uid: user?.uid ?? null };
}
