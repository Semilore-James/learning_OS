"use client";

/* ============================================================================
   Chart Critiquer — read the chart, then judge the claim someone made from it.
   Step 1 (the hard one): does the claim hold, is the chart misleading, or can
   you not tell from this alone? Step 2: name the specific issue. Step 3 (harder
   rounds): what you'd actually do about it. A wrong Step 1 ends the round.
   ========================================================================== */
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { critiqueRound } from "@/lib/games/miniGamesGen";
import type { Verdict } from "@/lib/games/miniGames";
import { FlawedChart } from "./FlawedChart";

const VERDICTS: { key: Verdict; label: string }[] = [
  { key: "safe", label: "The claim holds" },
  { key: "misleading", label: "The chart is misleading" },
  { key: "cant-tell", label: "Can't tell from this chart" },
];

type Phase = "verdict" | "problem" | "followup" | "done";

export function ChartCritiquer() {
  const { state, dispatch } = useStore();
  const best = state.games.chart_critiquer?.level ?? 0;
  const [n, setN] = useState(Math.max(1, best + 1));
  const round = useMemo(() => critiqueRound(n), [n]);

  const [phase, setPhase] = useState<Phase>("verdict");
  const [vPick, setVPick] = useState<Verdict | null>(null);
  const [pPick, setPPick] = useState<number | null>(null);
  const [fPick, setFPick] = useState<number | null>(null);
  const [recorded, setRecorded] = useState(false);

  const vRight = vPick === round.verdict;
  const pRight = pPick === round.problem.answer;
  const fRight = round.followup ? fPick === round.followup.answer : true;
  const passed = vRight && pRight;

  const finish = () => {
    if (recorded) return;
    setRecorded(true);
    dispatch({ type: "recordGameAttempt", game: "chart_critiquer", level: n, passed });
    if (passed) dispatch({ type: "recordGameScore", game: "chart_critiquer", level: n, score: n });
  };

  const chooseVerdict = (v: Verdict) => {
    if (phase !== "verdict") return;
    setVPick(v);
    if (v === round.verdict) {
      setPhase("problem");
    } else {
      setPhase("done");
      // record immediately: a wrong read ends it
      setRecorded(true);
      dispatch({ type: "recordGameAttempt", game: "chart_critiquer", level: n, passed: false });
    }
  };

  const chooseProblem = (i: number) => {
    if (phase !== "problem") return;
    setPPick(i);
    if (i === round.problem.answer && round.followup) setPhase("followup");
    else {
      setPhase("done");
      if (i === round.problem.answer) {
        // verdict + problem right, no follow-up on this round = pass
        setRecorded(true);
        dispatch({ type: "recordGameAttempt", game: "chart_critiquer", level: n, passed: true });
        dispatch({ type: "recordGameScore", game: "chart_critiquer", level: n, score: n });
      } else {
        setRecorded(true);
        dispatch({ type: "recordGameAttempt", game: "chart_critiquer", level: n, passed: false });
      }
    }
  };

  const chooseFollowup = (i: number) => {
    if (phase !== "followup") return;
    setFPick(i);
    setPhase("done");
    finish();
  };

  const next = () => {
    setPhase("verdict");
    setVPick(null);
    setPPick(null);
    setFPick(null);
    setRecorded(false);
    setN((x) => x + 1);
  };

  const optionRow = (
    options: string[],
    answer: number,
    picked: number | null,
    onPick: (i: number) => void,
    locked: boolean,
  ) => (
    <div className="flex flex-col gap-1.5">
      {options.map((o, oi) => (
        <button
          key={oi}
          type="button"
          onClick={() => onPick(oi)}
          disabled={locked}
          className={cn(
            "chrome-flat px-3 py-2 text-left text-[11px] leading-snug",
            !locked && "bg-surface-raised text-foreground hover:text-primary",
            locked && oi === answer && "bg-brand-green/15 text-brand-green",
            locked && picked === oi && oi !== answer && "bg-[#e5484d]/15 text-[#e5484d]",
            locked && oi !== answer && picked !== oi && "bg-surface-raised text-muted-foreground opacity-50",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );

  const stepPast = (p: Phase) =>
    ["verdict", "problem", "followup", "done"].indexOf(phase) > ["verdict", "problem", "followup", "done"].indexOf(p);

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Round {n}</span>
        {round.followup && (
          <span className="font-mono text-[9px] text-muted-foreground">3 steps</span>
        )}
      </div>
      <h3 className="font-display text-sm font-bold text-foreground">{round.title}</h3>

      <div className="chrome-flat h-44 bg-surface-raised p-2">
        <FlawedChart round={round} />
      </div>
      <p className="text-[11px] italic text-muted-foreground">{round.caption}</p>

      <div className="chrome-flat bg-surface-raised px-3 py-2 text-[12px] text-foreground">
        <span className="font-mono text-[9px] uppercase tracking-widest text-brand-amber">The claim</span>
        <p className="mt-0.5">{round.claim}</p>
      </div>

      {/* step 1 */}
      <p className="text-[11px] font-semibold text-foreground">Can you act on that claim?</p>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {VERDICTS.map((v) => {
          const locked = phase !== "verdict";
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => chooseVerdict(v.key)}
              disabled={locked}
              className={cn(
                "chrome-flat px-3 py-2 text-left text-[11px] leading-snug sm:text-center",
                !locked && "bg-surface-raised text-foreground hover:text-primary",
                locked && v.key === round.verdict && "bg-brand-green/15 text-brand-green",
                locked && vPick === v.key && v.key !== round.verdict && "bg-[#e5484d]/15 text-[#e5484d]",
                locked && v.key !== round.verdict && vPick !== v.key && "bg-surface-raised text-muted-foreground opacity-50",
              )}
            >
              {v.label}
            </button>
          );
        })}
      </div>
      {phase !== "verdict" && (
        <p className={cn("text-[11px]", vRight ? "text-brand-green" : "text-[#e5484d]")}>
          {vRight ? "Right read. " : "Wrong read. "}
          <span className="text-muted-foreground">{round.verdictExplain}</span>
        </p>
      )}

      {/* step 2 */}
      {(phase === "problem" || stepPast("problem")) && vRight && (
        <>
          <p className="text-[11px] font-semibold text-foreground">
            {round.verdict === "safe" ? "Confirm it: what makes this one trustworthy?" : "What is going on?"}
          </p>
          {optionRow(round.problem.options, round.problem.answer, pPick, chooseProblem, phase !== "problem")}
          {phase !== "problem" && (
            <p className={cn("text-[11px]", pRight ? "text-brand-green" : "text-[#e5484d]")}>
              <span className="text-muted-foreground">{round.problem.explain}</span>
            </p>
          )}
        </>
      )}

      {/* step 3 */}
      {round.followup && (phase === "followup" || phase === "done") && vRight && pRight && (
        <>
          <p className="text-[11px] font-semibold text-foreground">What actually helps?</p>
          {optionRow(round.followup.options, round.followup.answer, fPick, chooseFollowup, phase !== "followup")}
          {phase === "done" && (
            <p className="text-[11px] text-muted-foreground">{round.followup.explain}</p>
          )}
        </>
      )}

      {phase === "done" && (
        <div className="chrome-flat mt-1 bg-surface-raised p-3 text-xs">
          <p className={cn("font-bold", passed ? "text-brand-green" : "text-[#e5484d]")}>
            {passed ? (fRight ? "Clean pass." : "Passed. The last step was the ideal move.") : "Not this time."}
          </p>
          <button
            type="button"
            onClick={next}
            className="chrome-flat mt-2 bg-surface px-3 py-1.5 text-[11px] font-semibold text-foreground hover:text-primary"
          >
            Next round →
          </button>
        </div>
      )}
    </div>
  );
}
