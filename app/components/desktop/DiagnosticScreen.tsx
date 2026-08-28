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
  const [seeds, setSeeds] = useState<Set<string>>(new Set());

  const finish = (extra: string[]) => {
    const all = new Set(seeds);
    for (const s of extra) all.add(s);
    dispatch({ type: "completeOnboarding", seededNodeIds: [...all] });
  };

  const q = QUESTIONS[step];
  const last = step === QUESTIONS.length - 1;

  const choose = (opt: Q["options"][number]) => {
    if (last) {
      finish(opt.seeds);
      return;
    }
    setSeeds((prev) => {
      const n = new Set(prev);
      for (const s of opt.seeds) n.add(s);
      return n;
    });
    setStep((s) => s + 1);
  };

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
          {q.options.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => choose(o)}
              className="chrome-flat chrome-press bg-surface-raised px-3 py-2.5 text-left text-[13px] text-foreground hover:text-primary"
            >
              {o.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => finish([])}
          className="mt-4 text-[11px] text-muted-foreground hover:text-foreground"
        >
          I&apos;m starting completely fresh — skip this
        </button>
      </div>
    </div>
  );
}
