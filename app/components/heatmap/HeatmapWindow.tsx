"use client";

/* ============================================================================
   Heatmap (build step 14 / PRD 12). 53-week GitHub-style grid of activity, one
   cell per day coloured by that day's summed activity weight (1..4). Streak and
   total active days above; month labels; hover tooltip.
   ========================================================================== */
import { useMemo, useState } from "react";
import { useStore, select } from "@/lib/store";
import { todayUTC } from "@/lib/store/reducer";

const WEEKS = 53;
const DAY_MS = 86_400_000;

function levelColor(weight: number): string {
  if (weight <= 0) return "var(--surface-raised)";
  if (weight === 1) return "color-mix(in srgb, var(--accent-3) 35%, transparent)";
  if (weight === 2) return "color-mix(in srgb, var(--accent-3) 60%, var(--accent-1) 10%)";
  if (weight === 3) return "color-mix(in srgb, var(--accent-1) 65%, transparent)";
  return "var(--accent-1)";
}

export function HeatmapWindow() {
  const { state } = useStore();
  const { current, longest } = select.streak(state);

  const { columns, monthLabels, activeDays, maxDay } = useMemo(() => {
    const today = Date.parse(todayUTC());
    // start on the Sunday of the week (WEEKS-1) weeks ago
    const todayDow = new Date(today).getUTCDay();
    const start = today - (todayDow + (WEEKS - 1) * 7) * DAY_MS;

    const cols: { date: string; weight: number; future: boolean }[][] = [];
    const labels: { col: number; text: string }[] = [];
    let lastMonth = -1;
    let active = 0;
    let peak = 0;

    for (let w = 0; w < WEEKS; w++) {
      const col: { date: string; weight: number; future: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const ts = start + (w * 7 + d) * DAY_MS;
        const date = new Date(ts).toISOString().slice(0, 10);
        const weight = state.heatmap[date] ?? 0;
        if (weight > 0) active++;
        peak = Math.max(peak, weight);
        col.push({ date, weight, future: ts > today });
        const m = new Date(ts).getUTCMonth();
        if (d === 0 && m !== lastMonth) {
          labels.push({ col: w, text: new Date(ts).toLocaleDateString(undefined, { month: "short" }) });
          lastMonth = m;
        }
      }
      cols.push(col);
    }
    return { columns: cols, monthLabels: labels, activeDays: active, maxDay: peak };
  }, [state.heatmap]);

  const [hover, setHover] = useState<{ date: string; weight: number } | null>(null);

  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div>
          <span className="text-2xl font-bold text-brand-amber">{current}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">day streak</span>
        </div>
        <div className="text-xs text-muted-foreground">
          longest <span className="text-foreground">{longest}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="text-foreground">{activeDays}</span> active days
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* month row */}
          <div className="relative h-3" style={{ width: WEEKS * 13 }}>
            {monthLabels.map((m) => (
              <span
                key={`${m.col}-${m.text}`}
                className="absolute font-mono text-[8px] text-muted-foreground"
                style={{ left: m.col * 13 }}
              >
                {m.text}
              </span>
            ))}
          </div>
          {/* grid */}
          <div className="flex gap-[3px]">
            {columns.map((col, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {col.map((cell) => (
                  <span
                    key={cell.date}
                    onMouseEnter={() => !cell.future && setHover({ date: cell.date, weight: cell.weight })}
                    onMouseLeave={() => setHover(null)}
                    className="size-2.5"
                    style={{
                      background: cell.future ? "transparent" : levelColor(cell.weight),
                      outline: cell.date === todayUTC() ? "1px solid var(--primary)" : "none",
                      boxShadow: cell.weight >= 4 ? "0 0 4px var(--accent-1)" : "none",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 font-mono text-[9px] text-muted-foreground">
        less
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="size-2.5" style={{ background: levelColor(l) }} />
        ))}
        more
      </div>

      <div className="mt-4 min-h-5 text-xs text-muted-foreground">
        {hover ? (
          <span>
            <span className="text-foreground">{hover.date}</span> — activity weight {hover.weight}
            {hover.weight === 0 && " (nothing logged)"}
          </span>
        ) : (
          <span className="opacity-60">Hover a day for its activity. Weights: daily log 1, video/game 2, case submit 3, node complete 4.</span>
        )}
      </div>

      {maxDay === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No activity yet. Write a daily log, watch a video, or complete a node to light the first cell.
        </p>
      )}
    </div>
  );
}
