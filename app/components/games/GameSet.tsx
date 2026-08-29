"use client";

/* ============================================================================
   A 5-round set wrapper for the non-SQL mini-games (Council decision: the
   per-round loop had no arc). The wrapped game supplies renderRound(n, resolve);
   GameSet owns the round counter, the "next" button, the pass tally, scoring,
   and the end-of-set summary. Difficulty keeps climbing across sets — a set is
   levels n .. n+4, and the next set starts where this one ended.

   Scoring hooks stay the same: recordGameAttempt per round (keeps accuracy
   honest for the portfolio), recordGameScore per passed round.
   ========================================================================== */
import { useState, type ReactNode } from "react";
import { useStore, type Game } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  game: Game;
  /** how many rounds in a set (default 5) */
  perSet?: number;
  /** render one round; call resolve(passed) exactly once when it is decided */
  renderRound: (n: number, resolve: (passed: boolean) => void) => ReactNode;
  /** short label for a round, for the summary list (e.g. the round title) */
  roundLabel?: (n: number) => string;
}

export function GameSet({ game, perSet = 5, renderRound, roundLabel }: Props) {
  const { state, dispatch } = useStore();
  const best = state.games[game]?.level ?? 0;

  const [startN, setStartN] = useState(() => Math.max(1, best + 1));
  const [roundInSet, setRoundInSet] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [resolved, setResolved] = useState(false);

  const n = startN + roundInSet;
  const done = roundInSet >= perSet;

  const resolve = (passed: boolean) => {
    if (resolved) return;
    setResolved(true);
    dispatch({ type: "recordGameAttempt", game, level: n, passed });
    if (passed) dispatch({ type: "recordGameScore", game, level: n, score: n });
    setResults((r) => [...r, passed]);
  };

  const next = () => {
    setResolved(false);
    setRoundInSet((i) => i + 1);
  };

  const newSet = () => {
    setStartN(startN + perSet);
    setRoundInSet(0);
    setResults([]);
    setResolved(false);
  };

  if (done) {
    const passed = results.filter(Boolean).length;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Set complete
        </span>
        <div className="font-display text-4xl font-black text-foreground">
          {passed} / {perSet}
        </div>
        <ul className="flex flex-col gap-1 text-[12px]">
          {results.map((ok, i) => (
            <li key={i} className={cn(ok ? "text-brand-green" : "text-[#e5484d]")}>
              {ok ? "✓" : "✗"} Round {startN + i}
              {roundLabel ? ` — ${roundLabel(startN + i)}` : ""}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={newSet}
          className="chrome-flat chrome-press mt-2 bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground"
        >
          Next set (rounds {startN + perSet}–{startN + perSet * 2 - 1})
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Round {roundInSet + 1} of {perSet}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: perSet }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full",
                i < results.length
                  ? results[i]
                    ? "bg-brand-green"
                    : "bg-[#e5484d]"
                  : i === roundInSet
                    ? "bg-primary"
                    : "bg-border",
              )}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">{renderRound(n, resolve)}</div>

      {resolved && (
        <div className="border-t border-border p-2.5">
          <button
            type="button"
            onClick={next}
            className="chrome-flat chrome-press w-full bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground"
          >
            {roundInSet + 1 >= perSet ? "See set results" : "Next round"}
          </button>
        </div>
      )}
    </div>
  );
}
