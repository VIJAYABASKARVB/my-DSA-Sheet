"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Note } from "@/lib/types";
import { subscribeToNote, saveNote, ensureNoteIndexed } from "@/lib/firestore";

export function useNote(userId: string | null | undefined, problemId: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<string | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const problemNameRef = useRef<string>("");
  const isInitialSyncRef = useRef(true);
  const noteRef = useRef<Note | null>(null);
  // eslint-disable-next-line react-hooks/refs
  noteRef.current = note;

  // Keep content in sync when note loads from Firestore (but not while user is typing)
  useEffect(() => {
    if (!userId || !problemId) {
      setNote(null);
      setContent("");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    isInitialSyncRef.current = true;
    const unsub = subscribeToNote(
      userId,
      problemId,
      (data) => {
        setNote(data);
        // Only overwrite local content on initial load or if server has newer content and no pending save
        if (isInitialSyncRef.current) {
          isInitialSyncRef.current = false;
          setContent(data?.content ?? "");
          pendingRef.current = null;
          // capture problemName for future saves
          if (data?.problemName) problemNameRef.current = data.problemName;
          // Self-heal: a note with content must be present in the notes index
          // (drives the sheet's note icon). Repairs orphans from failed index writes.
          if (data && data.content.trim().length > 0) {
            void ensureNoteIndexed(userId, problemId).catch((e) => {
              console.warn("[useNote] notes index self-heal failed", e);
              setError((e as Error).message ?? String(e));
            });
          }
        } else {
          // If user is not currently dirty (no pending debounce), sync
          if (!pendingRef.current && data) {
            // Only sync if different to avoid cursor jump
            setContent((prev) => (prev === data.content ? prev : data.content));
            if (data.problemName) problemNameRef.current = data.problemName;
          } else if (!data && !pendingRef.current) {
            // deleted externally
            setContent("");
          }
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message ?? String(err));
        setLoading(false);
      }
    );
    return () => unsub();
  }, [userId, problemId]);

  // Capture problemName when available from note or external source
  const setProblemName = useCallback((name: string) => {
    if (name) problemNameRef.current = name;
  }, []);

  // Flush pending debounce synchronously (used for beforeunload, unmount, Done)
  const flush = useCallback(async () => {
    if (!userId || !problemId) return;
    if (pendingRef.current === null) return;
    const toSave = pendingRef.current;
    pendingRef.current = null;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    // Only save if content actually changed from last known note
    const lastContent = noteRef.current?.content ?? "";
    if (toSave === lastContent) {
      setSaving(false);
      return;
    }
    setSaving(true);
    try {
      await saveNote(userId, problemId, {
        content: toSave,
        problemName: problemNameRef.current || problemId,
      });
      setSavedRecently(true);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSavedRecently(false), 2000);
    } catch (e) {
      console.error("[useNote] flush save failed", e);
      setError((e as Error).message ?? String(e));
    } finally {
      setSaving(false);
    }
  }, [userId, problemId]);

  const updateContent = useCallback(
    (markdown: string) => {
      setContent(markdown);
      pendingRef.current = markdown;
      setSaving(true);
      setSavedRecently(false);
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = null;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        debounceRef.current = null;
        if (!userId || !problemId) {
          setSaving(false);
          return;
        }
        const toSave = pendingRef.current;
        if (toSave === null) {
          setSaving(false);
          return;
        }
        pendingRef.current = null;
        // Avoid saving duplicate if same as server
        const lastContent = noteRef.current?.content ?? "";
        if (toSave === lastContent && toSave !== "") {
          // Even if same, we already have correct state; just clear saving
          setSaving(false);
          return;
        }
        try {
          await saveNote(userId, problemId, {
            content: toSave,
            problemName: problemNameRef.current || problemId,
          });
          setSavedRecently(true);
          if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
          savedTimeoutRef.current = setTimeout(() => setSavedRecently(false), 2000);
        } catch (e) {
          console.error("[useNote] save failed", e);
          setError((e as Error).message ?? String(e));
          // Put back pending so user can retry? Keep saving false and show error
        } finally {
          setSaving(false);
        }
      }, 800);
    },
    [userId, problemId]
  );

  // beforeunload + visibilitychange + unmount flush
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingRef.current !== null && userId && problemId) {
        // For beforeunload we cannot await, but we try sync save via saveNote without await (best effort)
        // Use the flush logic but fire-and-forget; browser may kill it
        // We do not block unload
        void flush();
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && pendingRef.current !== null) {
        void flush();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
      // On unmount, flush pending
      if (pendingRef.current !== null) {
        void flush();
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, [flush, userId, problemId]);

  return { note, content, loading, error, saving, savedRecently, updateContent, setProblemName, flush };
}
