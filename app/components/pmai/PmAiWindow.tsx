"use client";

/* ============================================================================
   L_OS COMMS (build step 17 / PRD 9 / Userflow 8). Presented as a chat channel:
   #comms, where the other person in the room is your PM. Same advisor behind it
   — a demanding reviewer, not a tutor: it will not hand you answers or re-teach
   the textbook, it reviews, pushes back, and asks the question you should be
   asking. Declines are counted; the full log unlocks per account.

   Needs GROQ_API_KEY server-side; without it every turn returns a plain
   "not reachable" line.
   ========================================================================== */
import { useEffect, useMemo, useRef, useState } from "react";
import { Hash, Plus, Send, X } from "lucide-react";
import { useStore, select } from "@/lib/store";
import { TOPICS } from "@/content/curriculum";
import { subNodesFor } from "@/lib/curriculumLayout";
import { CASES } from "@/content/cases/registry";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { sleep, beforeTyping, TYPING_MIN_MS, nowMs } from "@/lib/pace";
import { pmClientKey } from "@/lib/pmai/clientKey";
import { downscaleImage } from "@/lib/pmai/downscaleImage";
import { flag } from "@/lib/flags";
import { Button } from "@/components/ui/button";

/** rough bucket for analytics — not shown to the learner */
function classifyPrompt(t: string): string {
  const s = t.toLowerCase();
  if (/review|feedback|submission|grade/.test(s)) return "review_request";
  if (/stuck|hint|help|don'?t (know|understand)/.test(s)) return "help_request";
  if (/what (is|are|does)|explain|difference between|concept/.test(s)) return "concept_question";
  if (/next|focus|should i|what now|roadmap/.test(s)) return "direction";
  return "general";
}

const CHIPS = [
  "Review my last case submission",
  "What should I focus on next?",
  "Is my approach correct?",
  "I'm stuck — what question should I be asking?",
];

interface Msg {
  role: "user" | "assistant";
  content: string;
  declined?: boolean;
  images?: string[];
}

function Row({ who, tone, children }: { who: "PM" | "You"; tone?: string; children: React.ReactNode }) {
  const isPm = who === "PM";
  return (
    <div className="da-msg-in flex gap-2.5 px-4 py-1.5 hover:bg-surface-raised/40">
      <div
        className={cn(
          "mt-0.5 grid size-7 shrink-0 place-items-center rounded-[var(--radius-control)] text-[10px] font-bold",
          isPm ? "bg-brand-violet text-white" : "bg-primary text-primary-foreground",
        )}
      >
        {who}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[12px] font-bold text-foreground">{isPm ? "PM" : "You"}</span>
        <div className={cn("whitespace-pre-wrap text-[13px] leading-relaxed", tone ?? "text-foreground")}>{children}</div>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1">
      <span className="da-dot size-1.5 rounded-full bg-muted-foreground" />
      <span className="da-dot size-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: "0.15s" }} />
      <span className="da-dot size-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: "0.3s" }} />
    </span>
  );
}

export function PmAiWindow() {
  const { state } = useStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false); // guards the composer
  const [typing, setTyping] = useState(false); // shows the PM's typing dots
  const [showDeclines, setShowDeclines] = useState(false);
  const [attention, setAttention] = useState<number | null>(null); // calls left this hour
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(nowMs);
  const [pendingImg, setPendingImg] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const visionOn = flag("pmVision");

  const attachImage = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setAttaching(true);
    try {
      setPendingImg(await downscaleImage(file));
    } catch {
      setPendingImg(null);
    }
    setAttaching(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const cooling = cooldownUntil != null && now < cooldownUntil;

  useEffect(() => {
    if (!cooling) return;
    const id = setInterval(() => setNow(nowMs()), 1000);
    return () => clearInterval(id);
  }, [cooling]);

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

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
  }, [messages, typing]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || sending || cooling) return;
    track("pm_ai_prompt", { prompt_category: classifyPrompt(t) });
    const img = pendingImg;
    const next: Msg[] = [
      ...messages,
      { role: "user", content: t, ...(img ? { images: [img] } : {}) },
    ];
    setMessages(next);
    setInput("");
    setPendingImg(null);
    setSending(true);
    setTyping(false);

    const replyP: Promise<{ msg: Msg; remainingHour?: number | null; resetInSec?: number }> = fetch(
      "/api/pm-ai/chat",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m, i) =>
            i === next.length - 1 && m.images
              ? { role: m.role, content: m.content, images: m.images }
              : { role: m.role, content: m.content },
          ),
          context: ctx,
          clientKey: pmClientKey(),
        }),
      },
    )
      .then(async (res) => {
        const data = await res.json().catch(() => ({}) as Record<string, unknown>);
        if (res.status === 429) {
          return {
            msg: { role: "assistant", content: String(data.error ?? "That is my time for this hour."), declined: true } as Msg,
            remainingHour: 0,
            resetInSec: typeof data.resetInSec === "number" ? data.resetInSec : 3600,
          };
        }
        if (!res.ok)
          return { msg: { role: "assistant", content: String(data.error ?? "Something went wrong.") } as Msg };
        const remainingHour = typeof data.remainingHour === "number" ? data.remainingHour : null;
        if (data.kind === "decline")
          return { msg: { role: "assistant", content: String(data.reason), declined: true } as Msg, remainingHour };
        return { msg: { role: "assistant", content: String(data.content ?? "…") } as Msg, remainingHour };
      })
      .catch(() => ({ msg: { role: "assistant", content: "Couldn't reach the channel." } as Msg }));

    // a beat before the PM starts typing, then hold the dots for a moment
    await sleep(beforeTyping());
    setTyping(true);
    const [out] = await Promise.all([replyP, sleep(TYPING_MIN_MS)]);
    setMessages((m) => [...m, out.msg]);
    if (out.remainingHour != null) setAttention(out.remainingHour);
    if (out.resetInSec != null) setCooldownUntil(nowMs() + out.resetInSec * 1000);
    setTyping(false);
    setSending(false);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* channel header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-1.5">
          <Hash className="size-4 text-muted-foreground" />
          <span className="text-[13px] font-bold text-foreground">comms</span>
          <span className="ml-2 font-mono text-[9px] text-muted-foreground">your PM, on call</span>
        </div>
        <button
          type="button"
          onClick={() => setShowDeclines((v) => !v)}
          className="chrome-flat bg-surface-raised px-2 py-0.5 font-mono text-[9px] text-muted-foreground hover:text-foreground"
        >
          declines {state.declineCount}
        </button>
      </div>

      {showDeclines && (
        <div className="border-b border-border bg-surface-raised px-4 py-2.5 text-[12px]">
          <p className="text-foreground">
            The PM has declined a shortcut or logged a disagreement{" "}
            <span className="font-bold text-brand-amber">{state.declineCount}</span> time
            {state.declineCount === 1 ? "" : "s"}.
          </p>
          <p className="mt-1 text-muted-foreground">
            The full transcript of every refusal unlocks once you clear all {CASES.length} cases, and is kept
            per account.
          </p>
        </div>
      )}

      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-auto py-2">
        {messages.length === 0 && (
          <div className="m-auto max-w-sm px-4 text-center text-[13px] text-muted-foreground">
            <div className="mx-auto mb-2 grid size-9 place-items-center rounded-[var(--radius-control)] bg-brand-violet text-xs font-bold text-white">
              PM
            </div>
            <p className="font-display font-semibold text-foreground">This is the start of #comms</p>
            <p className="mt-1">
              Message your PM like a colleague. They won&apos;t give you answers or re-explain the textbook —
              they review what you did, push back, and ask the question you&apos;re avoiding.
            </p>
            {state.mode === "guest" && (
              <p className="mt-3 text-[11px] text-brand-amber">
                Guest mode: the PM works best with an account — it reads your whole history.
              </p>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <Row key={i} who={m.role === "user" ? "You" : "PM"} tone={m.declined ? "text-brand-amber" : undefined}>
            {m.images?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.images[0]}
                alt="attached screenshot"
                className="mb-1.5 max-h-40 rounded-[var(--radius-control)] border border-border"
              />
            )}
            {m.content}
          </Row>
        ))}
        {typing && (
          <Row who="PM" tone="text-muted-foreground">
            <Dots />
          </Row>
        )}
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

      {pendingImg && (
        <div className="flex items-center gap-2 px-3 pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingImg} alt="attachment preview" className="h-12 rounded-[var(--radius-control)] border border-border" />
          <span className="text-[11px] text-muted-foreground">Screenshot attached</span>
          <button type="button" onClick={() => setPendingImg(null)} className="text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-border p-2.5">
        {visionOn && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => attachImage(e.target.files?.[0])}
            />
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={attaching || cooling || Boolean(pendingImg)}
              aria-label="Attach a screenshot"
              title="Attach a screenshot"
            >
              <Plus className="size-3.5" />
            </Button>
          </>
        )}
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          disabled={cooling}
          placeholder={cooling ? "The PM is out for a bit." : "Message #comms"}
          className="max-h-28 flex-1 resize-none border border-border bg-surface px-2.5 py-2 text-[13px] text-foreground outline-none disabled:opacity-60"
          style={{ borderRadius: "var(--radius-control)" }}
        />
        <Button
          size="icon-sm"
          onClick={() => send(input)}
          disabled={sending || cooling || !input.trim()}
          aria-label="Send"
        >
          <Send className="size-3.5" />
        </Button>
      </div>

      <div className="flex justify-end px-3 pb-1.5">
        <AttentionBar cooling={cooling} msLeft={cooldownUntil ? cooldownUntil - now : 0} left={attention} />
      </div>
    </div>
  );
}

/** the "PM's attention" meter, bottom-right of the composer. Frames the rate
 *  limit as the PM's time, not a quota — scarce on purpose. */
function AttentionBar({
  cooling,
  msLeft,
  left,
}: {
  cooling: boolean;
  msLeft: number;
  left: number | null;
}) {
  if (cooling) {
    const s = Math.max(0, Math.ceil(msLeft / 1000));
    const mm = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, "0");
    return (
      <span className="font-mono text-[9px] text-brand-amber">PM free again in {mm}:{ss}</span>
    );
  }
  if (left == null) return null;
  return (
    <span
      className={cn(
        "font-mono text-[9px]",
        left <= 2 ? "text-brand-amber" : "text-muted-foreground",
      )}
    >
      PM&apos;s attention: {left} left this hour
    </span>
  );
}
