"use client";

/* ============================================================================
   Chart Critiquer — read the chart, then judge the claim someone made from it.
   Step 1 (the hard one): does the claim hold, is the chart misleading, or can
   you not tell from this alone? Step 2: name the specific issue. Step 3: which
   fix actually changes the answer (weightless before level 7 so it becomes a
   habit first). A wrong Step 1 ends the round. Runs in 5-round sets.
   ========================================================================== */
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { critiqueRound } from "@/lib/games/miniGamesGen";
import { FLAW_REFERENCE, type CritiqueRound, type Verdict } from "@/lib/games/miniGames";
import { recordVerdict, calibrationHint } from "@/lib/games/critiquerCalib";
import { GameSet } from "./GameSet";
import { FlawedChart } from "./FlawedChart";

const VERDICTS: { key: Verdict; label: string }[] = [
  { key: "safe", label: "The claim holds" },
  { key: "misleading", label: "The chart is misleading" },
  { key: "cant-tell", label: "Can't tell from this chart" },
];

export function ChartCritiquer() {
  return (
    <GameSet
      game="chart_critiquer"
      roundLabel={(n) => critiqueRound(n).title}
      renderRound={(n, resolve) => <Round key={n} n={n} resolve={resolve} />}
    />
  );
}

type Phase = "verdict" | "problem" | "followup" | "done";

function Round({ n, resolve }: { n: number; resolve: (passed: boolean) => void }) {
  const round: CritiqueRound = useMemo(() => critiqueRound(n), [n]);
  const hint = useMemo(() => calibrationHint(), []);
  const scoreStep3 = n >= 7;

  const [phase, setPhase] = useState<Phase>("verdict");
  const [vPick, setVPick] = useState<Verdict | null>(null);
  const [pPick, setPPick] = useState<number | null>(null);
  const [fPick, setFPick] = useState<number | null>(null);
  const [ref, setRef] = useState(false);

  const vRight = vPick === round.verdict;
  const pRight = pPick === round.problem.answer;
  const fRight = round.followup ? fPick === round.followup.answer : true;

  const chooseVerdict = (v: Verdict) => {
    if (phase !== "verdict") return;
    setVPick(v);
    recordVerdict(round.verdict, v);
    if (v === round.verdict) setPhase("problem");
    else {
      // a wrong read ends the round
      resolve(false);
      setPhase("done");
    }
  };

  const chooseProblem = (i: number) => {
    if (phase !== "problem") return;
    setPPick(i);
    if (i === round.problem.answer && round.followup) setPhase("followup");
    else {
      const passed = i === round.problem.answer;
      resolve(passed);
      setPhase("done");
    }
  };

  const chooseFollowup = (i: number) => {
    if (phase !== "followup") return;
    setFPick(i);
    const fOk = !round.followup || i === round.followup.answer;
    resolve(vRight && pRight && (!scoreStep3 || fOk));
    setPhase("done");
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

  const order = ["verdict", "problem", "followup", "done"];
  const past = (p: Phase) => order.indexOf(phase) > order.indexOf(p);
  const done = phase === "done";
  const passed = vRight && pRight && (!scoreStep3 || !round.followup || fRight);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">{round.title}</h3>
        <button
          type="button"
          onClick={() => setRef((v) => !v)}
          className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Flaw families
          <ChevronDown className={cn("size-3 transition-transform", ref && "rotate-180")} />
        </button>
      </div>

      {ref && (
        <div className="chrome-flat flex flex-col gap-2 bg-surface-raised p-3 text-[10px] leading-snug">
          {FLAW_REFERENCE.map((g) => (
            <div key={g.group}>
              <span className="font-mono uppercase tracking-wide text-brand-amber">{g.group}</span>
              <ul className="mt-0.5 flex flex-col gap-0.5 text-muted-foreground">
                {g.items.map((it) => (
                  <li key={it}>• {it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {hint && phase === "verdict" && (
        <p className="text-[10px] italic text-brand-amber">{hint}</p>
      )}

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
      {(phase === "problem" || past("problem")) && vRight && (
        <>
          <p className="text-[11px] font-semibold text-foreground">
            {round.verdict === "safe" ? "Confirm it: what makes this one trustworthy?" : "What is going on?"}
          </p>
          {optionRow(round.problem.options, round.problem.answer, pPick, chooseProblem, phase !== "problem")}
          {phase !== "problem" && (
            <p className="text-[11px] text-muted-foreground">{round.problem.explain}</p>
          )}
        </>
      )}

      {/* step 3 */}
      {round.followup && (phase === "followup" || phase === "done") && vRight && pRight && (
        <>
          <p className="text-[11px] font-semibold text-foreground">
            What actually helps?{!scoreStep3 && <span className="ml-1 font-normal text-muted-foreground">(practice, not scored yet)</span>}
          </p>
          {optionRow(round.followup.options, round.followup.answer, fPick, chooseFollowup, phase !== "followup")}
          {done && <p className="text-[11px] text-muted-foreground">{round.followup.explain}</p>}
        </>
      )}

      {done && (
        <p className={cn("text-[12px] font-bold", passed ? "text-brand-green" : "text-[#e5484d]")}>
          {passed ? "Passed." : "Not this time."}
        </p>
      )}
    </div>
  );
}
