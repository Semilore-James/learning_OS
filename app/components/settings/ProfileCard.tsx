"use client";

/* ============================================================================
   Profile summary — sits at the top of Settings. Name, level (from XP), streak,
   coins (game points), plus the stats the council teacher argued belong on an
   analyst's profile: track, cases cleared, chapters read, game accuracy,
   longest streak, active days.
   ========================================================================== */
import { useStore, select } from "@/lib/store";
import { CASES } from "@/content/cases/registry";
import { XP_PER_LEVEL, levelFromXp } from "@/lib/gamification";

export function ProfileCard() {
  const { state } = useStore();
  const { displayName } = state.profile;

  const xp = state.xpTotal;
  const level = levelFromXp(xp);
  const intoLevel = xp % XP_PER_LEVEL;
  const streak = select.streak(state);
  const coins = select.coinBalance(state);

  const casesDone = Object.values(state.cases).filter((c) => c.status.startsWith("complete")).length;
  const chaptersRead = Object.keys(state.chapterReads ?? {}).length;
  const activeDays = Object.values(state.heatmap).filter((w) => w > 0).length;

  const gameAtt = Object.values(state.games).reduce((t, g) => t + (g.attempts ?? 0), 0);
  const gameWins = Object.values(state.games).reduce((t, g) => t + (g.wins ?? 0), 0);
  const accuracy = gameAtt > 0 ? Math.round((gameWins / gameAtt) * 100) : null;

  const stats: [string, string | number][] = [
    ["Track", "Data Analyst"],
    ["Cases cleared", `${casesDone} / ${CASES.length}`],
    ["Chapters read", chaptersRead],
    ["Game accuracy", accuracy === null ? "—" : `${accuracy}%`],
    ["Longest streak", `${streak.longest} days`],
    ["Active days", activeDays],
  ];

  return (
    <section className="flex flex-col gap-3 border-b border-border p-5">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-control)] bg-brand-violet text-sm font-bold text-white">
          {(displayName?.[0] ?? "A").toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-bold text-foreground">
            {displayName || "Unnamed analyst"}
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="text-primary">Level {level}</span>
            <span className="text-brand-amber">🔥 {streak.current}</span>
            <span className="text-brand-amber">{coins.toLocaleString()} coins</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between font-mono text-[9px] text-muted-foreground">
          <span>{xp.toLocaleString()} XP</span>
          <span>{intoLevel} / {XP_PER_LEVEL} to level {level + 1}</span>
        </div>
        <span className="mt-1 block h-1.5 w-full overflow-hidden bg-surface-raised">
          <span
            className="block h-full bg-brand-amber transition-[width] duration-500"
            style={{ width: `${(intoLevel / XP_PER_LEVEL) * 100}%` }}
          />
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {stats.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between text-[11px]">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-semibold text-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="font-mono text-[9px] text-muted-foreground">
        XP tracks learning. Coins are won in Games and will be spendable in the Shop.
      </p>
    </section>
  );
}
