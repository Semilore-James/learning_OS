"use client";

/* ============================================================================
   First-run flow, part 1 (mission) and part 3 (orientation). Part 2 is the
   existing DiagnosticScreen. Council call: a real analysis loop before any
   form. Read a tiny brief, notice one thing, tell the PM, get a reply that
   reacts to what you actually said, get paid, then place yourself on the map.

   Skippable from every step; the skip persists (advanceOnboarding -> "done").
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { pmClientKey } from "@/lib/pmai/clientKey";
import { FIRST_MISSION } from "@/content/onboarding";

function SkipLink({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="text-[11px] text-muted-foreground hover:text-foreground"
    >
      Skip the intro
    </button>
  );
}

export function OnboardingMission() {
  const { dispatch } = useStore();
  const [obs, setObs] = useState("");
  const [phase, setPhase] = useState<"brief" | "sending" | "reply">("brief");
  const [reply, setReply] = useState("");
  const sent = useRef(false);

  const skip = () => dispatch({ type: "advanceOnboarding", to: "done" });

  const send = async () => {
    if (sent.current || obs.trim().length < 3) return;
    sent.current = true;
    setPhase("sending");
    let text = FIRST_MISSION.cannedReply;
    try {
      const res = await fetch("/api/pm-ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientKey: pmClientKey(),
          messages: [
            {
              role: "user",
              content:
                `Quick one, I'm just getting started. Looking at Saturday's sales for the ` +
                `four Northwind shops, the thing that jumps out to me is: ${obs.trim()}. ` +
                `Am I looking at the right thing?`,
            },
          ],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { content?: string; kind?: string };
      const c = (data.content ?? "").trim();
      // use the live reply only if it is a real sentence, not a JSON blob or a stub
      if (res.ok && data.kind === "reply" && c.length > 40 && !c.startsWith("{") && !c.startsWith("[")) {
        text = c;
      }
    } catch {
      /* fall back to the canned reply */
    }
    setReply(text);
    setPhase("reply");
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-background/95 p-6">
      <div className="chrome-panel w-[520px] max-w-full bg-surface p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-widest text-primary">
            Case file 00 · warm-up
          </span>
          <SkipLink onSkip={skip} />
        </div>

        <h2 className="mt-2 font-display text-lg font-bold text-foreground">{FIRST_MISSION.title}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{FIRST_MISSION.brief}</p>

        <table className="mt-4 w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr>
              {FIRST_MISSION.columns.map((c) => (
                <th
                  key={c}
                  className="border border-border bg-surface-raised px-2 py-1 text-left text-muted-foreground"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIRST_MISSION.rows.map((r) => (
              <tr key={r[0]}>
                {r.map((v, i) => (
                  <td key={i} className="border border-border px-2 py-1 text-foreground">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {phase !== "reply" && (
          <>
            <p className="mt-4 text-[11px] text-muted-foreground">{FIRST_MISSION.hint}</p>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder={FIRST_MISSION.placeholder}
              rows={2}
              disabled={phase === "sending"}
              className="mt-2 w-full resize-none rounded-md border border-border bg-surface-raised px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary disabled:opacity-60"
            />
            <button
              type="button"
              onClick={send}
              disabled={phase === "sending" || obs.trim().length < 3}
              className="mt-3 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {phase === "sending" ? "Your PM is reading it…" : "Tell your PM"}
            </button>
          </>
        )}

        {phase === "reply" && (
          <div className="mt-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-primary">Your PM</span>
            <p className="mt-1 text-[13px] leading-relaxed text-foreground">{reply}</p>
            <button
              type="button"
              onClick={() => dispatch({ type: "completeFirstMission" })}
              className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Got it. Place me on the map &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function OnboardingOrientation() {
  const { dispatch } = useStore();
  const win = useWindowActions();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    win.open("constellation");
  }, [win]);

  return (
    <div className="fixed bottom-[64px] left-1/2 z-[401] w-[420px] max-w-[92vw] -translate-x-1/2">
      <div className="chrome-panel bg-surface p-4">
        <p className="text-[13px] leading-relaxed text-foreground">
          This is the whole path. Everything you unlock lives here. Your first real
          case is under <span className="text-primary">SQL</span>.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: "advanceOnboarding", to: "done" })}
          className="mt-3 rounded-md bg-primary px-4 py-1.5 text-[13px] font-semibold text-primary-foreground"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
