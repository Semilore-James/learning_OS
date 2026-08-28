"use client";

/* ============================================================================
   PM-AI window (build step 17 / PRD 9 / Userflow 8). A demanding advisor, not a
   tutor. Chat with prompt chips, plus a Decline Log tab. Every decline is
   counted; the full log is an account feature (needs persisted history).

   PM-AI needs the advisor configured (GROK_API_KEY) — until then every turn
   returns a plain "not reachable" line. It also officially needs an account
   for continuity; guests get a soft warning.
   ========================================================================== */
import { useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useStore, select } from "@/lib/store";
import { TOPICS } from "@/content/curriculum";
import { subNodesFor } from "@/lib/curriculumLayout";
import { CASES } from "@/content/cases/registry";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/motion";

const CHIPS = [
  "Review my last case submission",
  "What should I focus on next?",
  "Is my approach correct?",
  "I am stuck. What question should I be asking?",
];

interface Msg {
  role: "user" | "assistant";
  content: string;
  declined?: boolean;
}

export function PmAiWindow() {
  const { state } = useStore();
  const [tab, setTab] = useState<"chat" | "declines">("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ctx = useMemo(() => {
    const active = select.activeNodeId(state);
    let activeNode: { id: string; label: string; topic: string } | null = null;
    for (const t of TOPICS) {
      const s = subNodesFor(t).find((n) => n.id === active);
      if (s) activeNode = { id: s.id, label: s.label, topic: t.label };
    }
    return {
      xpTotal: state.xpTotal,
      streakDays: select.streak(state).current,
      nodesCompleted: select.completedNodeIds(state).size,
      casesComplete: Object.values(state.cases).filter((c) => c.status.startsWith("complete")).length,
      casesTotal: CASES.length,
      declineCount: state.declineCount,
      activeNode,
    };
  }, [state]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/pm-ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })), context: ctx }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages([...next, { role: "assistant", content: data.error ?? "Something went wrong." }]);
      } else if (data.kind === "decline") {
        setMessages([...next, { role: "assistant", content: data.reason, declined: true }]);
      } else {
        setMessages([...next, { role: "assistant", content: data.content }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Could not reach PM-AI." }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-border p-2">
        {(["chat", "declines"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "chrome-flat px-3 py-1 text-[11px] font-semibold uppercase",
              tab === t ? "bg-primary text-primary-foreground" : "bg-surface-raised text-muted-foreground",
            )}
          >
            {t === "chat" ? "Chat" : `Decline Log (${state.declineCount})`}
          </button>
        ))}
      </div>

      {tab === "declines" ? (
        <div className="flex-1 overflow-auto p-5 text-sm">
          <p className="text-foreground">
            PM-AI has declined a shortcut or logged a disagreement <span className="font-bold text-brand-amber">{state.declineCount}</span>{" "}
            time{state.declineCount === 1 ? "" : "s"}.
          </p>
          <p className="mt-3 text-muted-foreground">
            The full log — every request PM-AI refused, when, and what it said — surfaces automatically once
            you finish all {CASES.length} cases, and is stored per account. Sign in to keep it across devices.
          </p>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
            {messages.length === 0 && (
              <div className="m-auto max-w-sm text-center text-sm text-muted-foreground">
                <p className="font-display font-semibold text-foreground">PM-AI</p>
                <p className="mt-1">
                  Not a tutor. It will not give you answers or explain what the textbook covers. It reviews,
                  challenges, and asks the question you should be asking.
                </p>
                {state.mode === "guest" && (
                  <p className="mt-3 text-[11px] text-brand-amber">
                    Guest mode: PM-AI works best with an account, since it needs your full history.
                  </p>
                )}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-[var(--radius-control)] px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "self-end bg-primary text-primary-foreground"
                    : cn("self-start bg-surface-raised", m.declined ? "text-brand-amber" : "text-foreground"),
                )}
              >
                {m.role === "assistant" && i === messages.length - 1 ? (
                  <Typewriter key={m.content} text={m.content} />
                ) : (
                  m.content
                )}
              </div>
            ))}
            {busy && <div className="self-start font-mono text-xs text-muted-foreground">PM-AI is thinking…</div>}
          </div>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => send(c)}
                  className="chrome-flat bg-surface-raised px-2.5 py-1 text-[11px] text-foreground hover:text-primary"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-border p-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask PM-AI…"
              className="flex-1 border border-border bg-background px-2.5 py-1.5 text-sm"
              style={{ borderRadius: "var(--radius-control)" }}
            />
            <Button size="icon-sm" onClick={() => send(input)} disabled={busy || !input.trim()} aria-label="Send">
              <Send className="size-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
