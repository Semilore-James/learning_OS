"use client";

/* ============================================================================
   Onboarding diagnostic (build step 21). Four quick questions on first run.
   Answers pre-complete the sub-nodes the learner already knows so the
   constellation opens at the right depth instead of at "what is a database".
   Dispatches completeOnboarding (persisted by both adapters); "I'm starting
   fresh" seeds nothing.
   ========================================================================== */
import { useState } from "react";
import { useStore } from "@/lib/store";

interface Q {
  id: string;
  prompt: string;
  options: { label: string; seeds: string[] }[];
}

/* SQL is the fully-wired reference track — its sub-node ids are stable. */
const SQL_CORE = ["db-basics", "select-from", "where", "order-limit", "distinct-alias"];
const SQL_AGG = [...SQL_CORE, "aggregates", "group-having"];
const SQL_JOINS = [...SQL_AGG, "joins", "union", "subqueries"];
const SQL_ADV = [...SQL_JOINS, "ctes", "window-ranking", "window-offset", "window-agg"];

const QUESTIONS: Q[] = [
  {
    id: "sql",
    prompt: "How much SQL have you written?",
    options: [
      { label: "None yet", seeds: [] },
      { label: "Basic SELECT / WHERE", seeds: SQL_CORE },
      { label: "GROUP BY and aggregates", seeds: SQL_AGG },
      { label: "JOINs and subqueries", seeds: SQL_JOINS },
      { label: "Window functions and CTEs", seeds: SQL_ADV },
    ],
  },
  {
    id: "sheets",
    prompt: "Spreadsheets (Excel / Sheets)?",
    options: [
      { label: "Barely touched them", seeds: [] },
      { label: "Comfortable with formulas", seeds: ["excel"] },
      { label: "Pivot tables and lookups", seeds: ["excel"] },
    ],
  },
  {
    id: "code",
    prompt: "Python or R for data?",
    options: [
      { label: "Never", seeds: [] },
      { label: "A little scripting", seeds: [] },
      { label: "Yes, regularly", seeds: ["python"] },
    ],
  },
  {
    id: "git",
    prompt: "Git and version control?",
    options: [
      { label: "What's Git?", seeds: [] },
      { label: "I can commit and push", seeds: ["git"] },
    ],
  },
];

export function DiagnosticScreen() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  // one chosen option per answered step, so Back can un-pick cleanly
  const [picks, setPicks] = useState<(Q["options"][number] | null)[]>(
    () => QUESTIONS.map(() => null),
  );

  const seedsFrom = (list: (Q["options"][number] | null)[]) => {
    const all = new Set<string>();
    for (const p of list) if (p) for (const s of p.seeds) all.add(s);
    return [...all];
  };

  const finish = (list: (Q["options"][number] | null)[]) => {
    dispatch({ type: "completeOnboarding", seededNodeIds: seedsFrom(list) });
  };

  const q = QUESTIONS[step];
  const last = step === QUESTIONS.length - 1;

  const choose = (opt: Q["options"][number]) => {
    const next = picks.slice();
    next[step] = opt;
    setPicks(next);
    if (last) finish(next);
    else setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-background p-6">
      <div className="chrome-panel w-[440px] max-w-full bg-surface p-6">
        <span className="font-mono text-[9px] uppercase tracking-widest text-primary">
          Quick calibration · {step + 1} / {QUESTIONS.length}
        </span>
        <h2 className="mt-2 font-display text-lg font-bold text-foreground">{q.prompt}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          This just sets your starting point on the map. You can revisit anything.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {q.options.map((o) => {
            const chosen = picks[step]?.label === o.label;
            return (
              <button
                key={o.label}
                type="button"
                onClick={() => choose(o)}
                className={`chrome-flat chrome-press bg-surface-raised px-3 py-2.5 text-left text-[13px] hover:text-primary ${
                  chosen ? "text-primary" : "text-foreground"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="text-muted-foreground hover:text-foreground disabled:invisible"
          >
            &larr; Back
          </button>
          <button
            type="button"
            onClick={() => finish(picks)}
            className="text-muted-foreground hover:text-foreground"
          >
            I&apos;m starting completely fresh, skip this
          </button>
        </div>
      </div>
    </div>
  );
}
