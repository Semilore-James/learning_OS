"use client";

/* ============================================================================
   The node drawer — slides in on the right of a constellation window.
   Tabs: Resources | Tasks | Notes | Textbook (PRD 6.6 / Userflow 5).
   Notes sync through the store. The CTA depends on whether this is a topic
   ("Enter / Continue track") or a sub-node ("Start / Mark complete").
   ========================================================================== */
import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import type { NodeState, SubNode, TopicNode } from "@/content/curriculum";
import { useStore } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { videosForNode, watchUrl } from "@/lib/video";
import { CASES } from "@/content/cases/registry";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ParticleButton } from "@/components/motion";

export function NodeDrawer({
  node,
  kind,
  topicLabel,
  state,
  blockingLabel,
  onStart,
  onComplete,
  onOpenChapter,
  onClose,
}: {
  node: SubNode | TopicNode;
  kind: "topic" | "sub";
  topicLabel: string;
  state: NodeState;
  blockingLabel: string | null;
  onStart: () => void;
  onComplete: () => void;
  onOpenChapter: (slug: string) => void;
  onClose: () => void;
}) {
  const { state: s, dispatch } = useStore();
  const win = useWindowActions();
  const [note, setNote] = useState(s.notes[node.id] ?? "");
  const chapters = "chapters" in node ? node.chapters : [];
  const videos = videosForNode(node.id);
  const cases = CASES.filter((c) => c.skills.includes(node.id));

  const commitNote = () => {
    if (note !== (s.notes[node.id] ?? "")) dispatch({ type: "saveNote", nodeId: node.id, body: note });
  };

  const statusLine = () => {
    if (state === "locked") return `Locked. Complete ${blockingLabel ?? "the prerequisite"} first.`;
    if ("blurb" in node) return node.blurb;
    if (state === "completed") return "Completed. Notes stay editable.";
    if (state === "needs-review") return "Due for review — the queue will bring back a question from this.";
    return "Work through the resources, then mark this complete.";
  };

  const cta = (() => {
    if (state === "locked")
      return <p className="text-center text-[10px] font-mono text-muted-foreground">complete {blockingLabel ?? "prerequisite"} first</p>;
    if (kind === "topic") {
      const label = state === "completed" ? "Revisit track" : state === "available" ? "Enter this track" : "Continue track";
      return <Button className="w-full uppercase tracking-wide" onClick={onStart}>{label}</Button>;
    }
    if (state === "available")
      return <Button className="w-full uppercase tracking-wide" onClick={onStart}>Start this skill</Button>;
    if (state === "active" || state === "needs-review")
      return (
        <ParticleButton className="w-full uppercase tracking-wide" onClick={onComplete}>
          Mark as complete
        </ParticleButton>
      );
    return <p className="text-center text-[10px] font-mono text-brand-green">✓ complete</p>;
  })();

  return (
    <aside className="flex w-72 min-w-72 flex-col bg-surface" style={{ borderLeft: "var(--bd)", animation: "fadeIn .18s ease" }}>
      <div className="flex items-start gap-2 border-b border-border p-4">
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight text-foreground">{node.label}</div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {topicLabel}
            {"estHours" in node ? ` · ~${node.estHours}h` : ""}
          </div>
        </div>
        <button
          type="button"
          aria-label="Close drawer"
          onClick={onClose}
          className="font-mono text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>

      <p className="border-b border-border px-4 py-2.5 text-xs font-light text-muted-foreground">{statusLine()}</p>

      <Tabs defaultValue="resources" className="min-h-0 flex-1 gap-0">
        <TabsList variant="line" className="w-full justify-around border-b border-border px-2">
          <TabsTrigger value="resources" className="text-[10px]">Resources</TabsTrigger>
          <TabsTrigger value="tasks" className="text-[10px]">Tasks</TabsTrigger>
          <TabsTrigger value="notes" className="text-[10px]">Notes</TabsTrigger>
          <TabsTrigger value="textbook" className="text-[10px]">Textbook</TabsTrigger>
        </TabsList>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-3.5">
            <TabsContent value="resources" className="mt-0 flex flex-col gap-2">
              {videos.length === 0 && (
                <p className="text-xs font-light text-muted-foreground">No videos tagged for this skill yet.</p>
              )}
              {videos.map((v) => (
                <div key={v.id} className="chrome-flat bg-surface-raised p-2.5">
                  <div className="text-xs font-semibold text-foreground">{v.title}</div>
                  <div className="mb-1.5 font-mono text-[9px] text-muted-foreground">{v.channel}</div>
                  <div className="flex gap-1.5">
                    <Button size="xs" onClick={() => win.open("video")}>
                      <Play className="size-2.5" /> Library
                    </Button>
                    <Button size="xs" variant="outline" asChild>
                      <a href={watchUrl(v.id)} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-2.5" /> YouTube
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="tasks" className="mt-0 flex flex-col gap-2">
              {cases.length === 0 && (
                <p className="text-xs font-light text-muted-foreground">
                  No case links this skill directly. Completing any case still counts.
                </p>
              )}
              {cases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => win.open("casefiles")}
                  className="chrome-flat bg-surface-raised p-2.5 text-left"
                >
                  <div className="font-mono text-[9px] text-muted-foreground">
                    {c.num} · {c.difficulty}
                  </div>
                  <div className="text-xs font-semibold text-foreground">{c.title}</div>
                </button>
              ))}
            </TabsContent>
            <TabsContent value="notes" className="mt-0">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={commitNote}
                placeholder="Your notes on this skill…"
                className="min-h-44 resize-y bg-background font-body text-xs leading-relaxed"
              />
            </TabsContent>
            <TabsContent value="textbook" className="mt-0 flex flex-col gap-2">
              {chapters.length === 0 && (
                <p className="text-xs font-light text-muted-foreground">No chapter mapped yet.</p>
              )}
              {chapters.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => onOpenChapter(slug)}
                  className={cn("chrome-flat chrome-press bg-surface-raised px-2.5 py-2 text-left font-mono text-[11px] text-foreground")}
                >
                  {slug} &rarr;
                </button>
              ))}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      <div className="border-t border-border p-3">{cta}</div>
    </aside>
  );
}
