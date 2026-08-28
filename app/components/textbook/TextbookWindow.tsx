"use client";

/* ============================================================================
   Textbook window (build step 12). Sidebar of books -> chapters with read /
   unread dots, a reading pane rendering the chapter markdown, and the
   end-of-chapter "Try This" link. Reaching the bottom marks the chapter read
   (+25 XP, heatmap).
   ========================================================================== */
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/lib/common";
import { BOOKS, chapterBySlug, type Chapter } from "@/content/textbook/registry";
import { useStore } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function TextbookWindow() {
  const { state, dispatch } = useStore();
  const win = useWindowActions();

  const target = useMemo(() => win.consumeTextbookTarget(), [win]);
  const initial = (target && chapterBySlug(target)) || {
    book: BOOKS[0],
    chapter: BOOKS[0].chapters[0],
  };

  const [bookId, setBookId] = useState(initial.book.id);
  const [chapter, setChapter] = useState<Chapter>(initial.chapter);
  const [loaded, setLoaded] = useState<{ slug: string; md: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const book = BOOKS.find((b) => b.id === bookId) ?? BOOKS[0];
  const loading = loaded?.slug !== chapter.slug;
  const md = loaded?.slug === chapter.slug ? loaded.md : "";

  useEffect(() => {
    let cancelled = false;
    fetch(`/textbook/${chapter.slug}.md`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("not written"))))
      .then((t) => !cancelled && setLoaded({ slug: chapter.slug, md: t }))
      .catch(
        () =>
          !cancelled &&
          setLoaded({ slug: chapter.slug, md: `# ${chapter.title}\n\nThis chapter has not been written yet.` }),
      );
    return () => {
      cancelled = true;
    };
  }, [chapter.slug, chapter.title]);

  // mark read when scrolled near the bottom
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || loading) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && !state.chapterReads[chapter.slug]) {
      dispatch({ type: "readChapter", slug: chapter.slug, book: book.id });
    }
  };

  return (
    <div className="flex h-full">
      {/* sidebar */}
      <div className="flex w-52 min-w-52 flex-col overflow-auto border-r border-border bg-surface">
        <div className="flex flex-col gap-0.5 border-b border-border p-3">
          <span className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Books</span>
          {BOOKS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBookId(b.id);
                setChapter(b.chapters[0]);
              }}
              className={cn(
                "rounded-[var(--radius-control)] px-2.5 py-1.5 text-left text-xs",
                b.id === bookId ? "chrome-flat bg-surface-raised text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {b.title}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-0.5 p-3">
          <span className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Chapters</span>
          {book.chapters.map((c) => {
            const read = !!state.chapterReads[c.slug];
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setChapter(c)}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-1.5 text-left text-xs",
                  c.slug === chapter.slug ? "bg-surface-raised text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: read ? "var(--accent-2)" : "var(--border)" }}
                />
                {c.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* reading pane */}
      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-auto">
        <div className="flex justify-center px-10 py-9">
          <div className="w-full max-w-[620px]">
            <div className="prose-da">
              {loading ? (
                <p className="text-muted-foreground">Loading…</p>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
                  {md}
                </ReactMarkdown>
              )}
            </div>

            {chapter.tryThis && !loading && (
              <div className="chrome-flat mt-6 flex items-center justify-between gap-3 bg-surface-raised p-3">
                <span className="text-xs text-muted-foreground">
                  Try this: <span className="text-foreground">{chapter.tryThis.label}</span>
                </span>
                <Button size="sm" variant="secondary" onClick={() => win.open(chapter.tryThis!.target)}>
                  Open
                </Button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-border pt-4 font-mono text-[10px] text-muted-foreground">
              <span>{book.title}</span>
              <span>{state.chapterReads[chapter.slug] ? "✓ read" : "scroll to the end to mark read (+25 XP)"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
