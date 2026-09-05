"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "@/hooks/useAuth";
import { useNote } from "@/hooks/useNote";
import { useProblems } from "@/hooks/useProblems";
import dynamic from "next/dynamic";

// Dynamic import for code editor to avoid SSR issues
const CodeEditor = dynamic(() => import("@uiw/react-textarea-code-editor").then((m) => m.default as unknown as React.ComponentType<Record<string, unknown>>), {
  ssr: false,
  loading: () => null,
});

export default function NotesPage() {
  const params = useParams<{ problemId: string }>();
  const problemId = params?.problemId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { topics } = useProblems(user?.uid ?? null);
  const { note, content, loading: noteLoading, error: noteError, saving, savedRecently, updateContent, setProblemName, flush } = useNote(user?.uid ?? null, problemId);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  // Resolve problemName from topics fallback or note
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const problemName = useMemo(() => {
    if (note?.problemName) return note.problemName;
    for (const t of topics) {
      for (const p of t.patterns) {
        const found = p.problems.find((prob) => prob.id === problemId);
        if (found) return found.name;
      }
    }
    return problemId;
  }, [note?.problemName, topics, problemId]);

  // Keep hook aware of problemName for denormalized save
  useEffect(() => {
    if (problemName && problemName !== problemId) {
      setProblemName(problemName);
    }
  }, [problemName, problemId, setProblemName]);

  const handleToggleEdit = async () => {
    if (isEditing) {
      // Flushing pending save before leaving edit
      await flush();
      setIsEditing(false);
    } else {
      setActiveTab("editor");
      setIsEditing(true);
    }
  };

  const isLoading = authLoading || noteLoading;
  const hasContent = content.trim().length > 0 || (note?.content?.trim().length ?? 0) > 0;
  // Prefer live content in edit mode, else note content
  const displayContent = isEditing ? content : note?.content ?? "";

  if (!authLoading && !user) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <header className="sticky top-0 z-10 bg-card/85 backdrop-blur-[8px] border-b border-border">
          <div className="max-w-[1160px] mx-auto px-4 md:px-6 h-[56px] flex items-center justify-between gap-4">
            <Link href="/sheet" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Sheet
            </Link>
            <span className="text-sm font-medium truncate text-foreground">{problemName}</span>
            <span className="w-[64px]" />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="rounded-[12px] border border-border bg-card p-8 max-w-md w-full text-center">
            <h2 className="font-[var(--font-newsreader)] text-xl text-foreground">Sign in to use notes</h2>
            <p className="text-sm text-muted-foreground mt-2">Your notes are stored per user at <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">users/{`{uid}`}/notes/{problemId}</code>. Sign in with Google to enable sync.</p>
            <Link href="/sheet" className="mt-6 inline-flex items-center justify-center rounded-[6px] bg-primary text-primary-foreground text-sm font-medium px-5 py-2">
              Go to Sheet to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/85 backdrop-blur-[8px] border-b border-border">
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 h-[56px] flex items-center justify-between gap-3">
          <Link
            href="/sheet"
            onClick={(e) => {
              // Flush before navigating away via back link
              if (isEditing) {
                e.preventDefault();
                void flush().then(() => router.push("/sheet"));
              }
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            ← Back to Sheet
          </Link>
          <h1 className="flex-1 text-center text-sm md:text-[15px] font-medium tracking-tight text-foreground truncate px-2" title={problemName}>
            {isLoading ? <span className="inline-block h-3 w-24 skeleton rounded" /> : problemName}
          </h1>
          <button
            onClick={handleToggleEdit}
            className="inline-flex items-center justify-center rounded-[6px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium px-4 py-1.5 shrink-0 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
      </header>

      {/* Mobile/Tablet tabs when editing — up to 900px stacked */}
      {isEditing && (
        <div className="[900px]:hidden sticky top-[56px] z-10 bg-background border-b border-border px-4">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex-1 rounded-[6px] text-sm font-medium py-2 transition-colors ${activeTab === "editor" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"}`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex-1 rounded-[6px] text-sm font-medium py-2 transition-colors ${activeTab === "preview" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"}`}
            >
              Preview
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      {!isEditing ? (
        // Preview Mode
        <div className="flex-1 max-w-[1160px] mx-auto w-full px-4 md:px-6 py-8">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-3/4 skeleton rounded" />
              <div className="h-4 w-1/2 skeleton rounded" />
              <div className="h-32 w-full skeleton rounded-[8px]" />
            </div>
          ) : !hasContent ? (
            <div className="rounded-[12px] border border-border bg-card p-10 text-center">
              <div className="w-10 h-10 rounded-[8px] bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">📝</div>
              <p className="text-sm text-muted-foreground mt-3">No notes yet. Click Edit to start writing.</p>
              <p className="text-xs text-muted-foreground/60 mt-1 font-mono">Markdown supported · autosaves every 800ms</p>
            </div>
          ) : (
            <article className="prose dark:prose-invert max-w-none prose-sm md:prose-base prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-[#0F0F0F] dark:prose-pre:bg-[#0F0F0F] prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-th:text-foreground prose-td:text-muted-foreground prose-hr:border-border">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className } = props as { children?: React.ReactNode; className?: string };
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    if (match) {
                      return (
                        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" className="rounded-[8px] !bg-[#0F0F0F] !p-4 text-sm">
                          {codeString}
                        </SyntaxHighlighter>
                      );
                    }
                    return <code className={className}>{children}</code>;
                  },
                }}
              >
                {displayContent}
              </ReactMarkdown>
            </article>
          )}
        </div>
      ) : (
        // Edit Mode — Split Screen (900px cohesion: stacked on tablet, split on desktop)
        <div className="flex-1 flex flex-col [900px]:grid [900px]:grid-cols-2 h-[calc(100dvh-56px)] overflow-hidden">
          {/* Editor Panel — warm charcoal, not zinc, keeps code-dark in both themes */}
          <div className={`${activeTab === "preview" ? "hidden [900px]:flex" : "flex"} flex-col border-b [900px]:border-b-0 [900px]:border-r border-border bg-[#0F0F0F] relative min-h-[40vh] [900px]:min-h-0 overflow-hidden`}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08] bg-[#0F0F0F] shrink-0">
              <span className="text-[11px] tracking-[0.08em] uppercase font-medium text-white/60 font-mono">Editor</span>
              <span className="text-xs font-mono" role="status" aria-live="polite">
                {noteError ? <span className="text-[#FCA5A5] max-w-[220px] truncate inline-block align-bottom" title={noteError}>Sync issue — {noteError}</span> : saving ? <span className="text-white/60">Saving…</span> : savedRecently ? <span className="text-[#86EFAC]">Saved</span> : <span className="text-white/40 hidden [900px]:inline">Autosaves 800ms</span>}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-0">
              {/* Prefer CodeEditor, fallback to textarea if not loaded */}
              <div className="h-full min-h-[300px] [900px]:min-h-[500px]">
                <FallbackEditor content={content} onChange={updateContent} />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`${activeTab === "editor" ? "hidden [900px]:flex" : "flex"} flex-col bg-background overflow-hidden`}>
            <div className="hidden [900px]:flex items-center px-4 py-2 border-b border-border bg-card/50 shrink-0">
              <span className="text-[11px] tracking-[0.08em] uppercase font-medium text-muted-foreground font-mono">Preview</span>
              <span className="ml-auto text-[11px] text-muted-foreground font-mono hidden [900px]:inline">Live</span>
            </div>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto overscroll-contain">
              {!content.trim() ? (
                <p className="text-sm text-muted-foreground italic">Nothing to preview yet — start typing on the left.</p>
              ) : (
                <article className="prose dark:prose-invert max-w-none prose-sm md:prose-base prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-[#0F0F0F] dark:prose-pre:bg-[#0F0F0F] prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-th:text-foreground prose-td:text-muted-foreground prose-hr:border-border">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code(props) {
                        const { children, className } = props as { children?: React.ReactNode; className?: string };
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");
                        if (match) {
                          return (
                            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" className="rounded-[8px] !bg-[#0F0F0F] !p-4 text-sm">
                              {codeString}
                            </SyntaxHighlighter>
                          );
                        }
                        return <code className={className}>{children}</code>;
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </article>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FallbackEditor({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  const [useCodeEditor, setUseCodeEditor] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <textarea value={content} onChange={(e) => onChange(e.target.value)} className="w-full h-full min-h-[300px] [900px]:min-h-[500px] bg-[#0F0F0F] text-[#F5F5F3] font-mono text-sm p-4 resize-none focus:outline-none placeholder:text-white/40" placeholder="Start writing markdown..." />;
  }

  // Try CodeEditor, but wrap in try - if it errors, fallback
  if (useCodeEditor) {
    return (
      <div data-color-mode="dark" className="h-full">
        <CodeEditor
          value={content}
          language="markdown"
          placeholder="Start writing markdown..."
          onChange={(evn: unknown) => {
            const target = evn as { target: { value: string } };
            onChange(target.target.value);
          }}
          style={{
            fontSize: 14,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            backgroundColor: "#0F0F0F",
            minHeight: "500px",
            height: "100%",
          }}
        />
      </div>
    );
  }

  // Default: textarea with toggle to try code editor
  return (
    <div className="flex flex-col h-full">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full bg-[#0F0F0F] text-[#F5F5F3] font-mono text-sm p-4 resize-none focus:outline-none placeholder:text-white/40 min-h-[300px] [900px]:min-h-[500px]"
        placeholder={"# Notes\n\n- Use **bold**, *italic*, `code`\n- Lists, tables, blockquotes supported\n- Code blocks:\n\n```js\nconsole.log(\"hello\")\n```\n"}
        autoFocus
      />
      <div className="px-3 py-1.5 border-t border-white/[0.08] bg-[#141414] flex justify-end">
        <button onClick={() => setUseCodeEditor(true)} className="text-[11px] font-mono text-white/60 hover:text-white transition-colors">
          Try syntax-highlighted editor →
        </button>
      </div>
    </div>
  );
}
