"use client";

/* ============================================================================
   Games (build step 20). A launcher for four games; each opens in-place.
   - SQL Dojo        : real SQLite (sql.js WASM), 15 graded levels
   - Data Detective  : spot the data-quality defect
   - Pivot Puzzle    : reconstruct a pivot table from a flat one
   - Chart Critiquer : name the flaw in a misleading chart
   Every cleared level -> recordGameScore (+XP, heatmap credit on improvement).
   ========================================================================== */
import { useState } from "react";
import { ArrowLeft, BarChart3, Database, Search, Table2 } from "lucide-react";
import { useStore, select, type Game } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SqlDojo } from "./SqlDojo";
import { DataDetective } from "./DataDetective";
import { PivotPuzzle } from "./PivotPuzzle";
import { ChartCritiquer } from "./ChartCritiquer";

const GAMES: {
  id: Game;
  title: string;
  blurb: string;
  icon: typeof Database;
  /** number to show, or null for "endless" (procedurally generated) */
  levels: number | null;
}[] = [
  { id: "sql_dojo", title: "SQL Dojo", blurb: "Write real queries against a live SQLite database.", icon: Database, levels: null },
  { id: "data_detective", title: "Data Detective", blurb: "Flag every row that breaks a rule. Three wrong flags and it's over.", icon: Search, levels: null },
  { id: "pivot_puzzle", title: "Pivot Puzzle", blurb: "Configure a pivot to match the target the stakeholder asked for.", icon: Table2, levels: null },
  { id: "chart_critiquer", title: "Chart Critiquer", blurb: "Read the chart, then judge the claim someone made from it.", icon: BarChart3, levels: null },
];

export function GamesWindow() {
  const { state } = useStore();
  const [active, setActive] = useState<Game | null>(null);

  if (active) {
    const Body =
      active === "sql_dojo"
        ? SqlDojo
        : active === "data_detective"
          ? DataDetective
          : active === "pivot_puzzle"
            ? PivotPuzzle
            : ChartCritiquer;
    return (
      <div className="flex h-full flex-col">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="chrome-flat m-2 flex w-fit items-center gap-1.5 bg-surface-raised px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> All games
        </button>
        <div className="min-h-0 flex-1">
          <Body />
        </div>
      </div>
    );
  }

  const totalPoints = select.gamesScore(state);

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">Games</h3>
        <span className="font-mono text-[11px] text-brand-amber">{totalPoints.toLocaleString()} pts</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
      {GAMES.map((g) => {
        const gs = state.games[g.id];
        const best = gs?.level ?? 0;
        const acc = select.gameAccuracy(state, g.id);
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g.id)}
            className={cn(
              "chrome-panel flex flex-col items-start gap-2 p-4 text-left transition-colors hover:bg-surface-raised",
            )}
          >
            <g.icon className="size-6 text-primary" />
            <span className="font-display text-sm font-bold text-foreground">{g.title}</span>
            <span className="text-xs text-muted-foreground">{g.blurb}</span>
            <div className="mt-auto flex w-full flex-wrap gap-x-3 gap-y-0.5 pt-2 font-mono text-[10px] text-muted-foreground">
              <span>
                {g.levels === null
                  ? best > 0
                    ? `lvl ${best}`
                    : "not started"
                  : best > 0
                    ? `${best}/${g.levels}`
                    : `${g.levels} lvls`}
              </span>
              {gs && gs.score > 0 && <span className="text-brand-amber">{gs.score} pts</span>}
              {acc !== null && <span>{Math.round(acc * 100)}% acc</span>}
              {gs && gs.bestStreak > 1 && <span>🔥 {gs.bestStreak}</span>}
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}
