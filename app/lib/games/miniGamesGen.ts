/* ============================================================================
   Endless rounds for Data Detective, Pivot Puzzle and Chart Critiquer. The
   authored rounds in miniGames.ts are the intro; getXRound(n) synthesises
   everything past that deterministically from n, so each game runs forever.
   ========================================================================== */
import {
  DETECTIVE_ROUNDS,
  CRITIQUE_ROUNDS,
  type DetectiveRound,
  type PivotRound,
  type CritiqueRound,
} from "./miniGames";
import { runPivot, type Agg, type PivotConfig } from "./pivotEngine";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
const pick = <T>(r: () => number, a: readonly T[]) => a[Math.floor(r() * a.length)];
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

export const DETECTIVE_AUTHORED = DETECTIVE_ROUNDS.length;
export const CRITIQUE_AUTHORED = CRITIQUE_ROUNDS.length;

/* ---------------------------------------------------------- Data Detective --
   Past the 6 authored intro rounds, real scale: 20-48 rows, 0-4 defects (some
   rounds are clean), a 3-strike limit so you scan instead of clicking the
   ugliest number. Defects graduate from blatant to "valid value that breaks an
   inferable business rule" as the level climbs (Council). */
const DD_STORES = ["Ikeja", "Lekki", "Yaba", "Victoria Is.", "Ajah", "Surulere"];
const DD_CATS = ["Plants", "Tools", "Soil", "Pots", "Furniture", "Seeds"];
// June 2024: weekdays vs weekend/holiday days (the store is B2B, weekdays only)
const DD_WEEKDAYS = [3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28];
const DD_NONWEEKDAYS = [1, 2, 8, 9, 15, 16, 22, 23, 29, 30];

type DDefect =
  | "impossible_date"
  | "negative_qty"
  | "dup_id"
  | "outlier_10x"
  | "impossible_pct"
  | "total_mismatch"
  | "weekend_order"
  | "price_inconsistent";

const DD_BLATANT: DDefect[] = [
  "impossible_date", "negative_qty", "dup_id", "outlier_10x", "impossible_pct", "total_mismatch",
];
const DD_SUBTLE: DDefect[] = ["weekend_order", "price_inconsistent", "total_mismatch", "outlier_10x"];

export function detectiveRound(n: number): DetectiveRound {
  if (n <= DETECTIVE_AUTHORED) return DETECTIVE_ROUNDS[n - 1];
  const r = rng(n * 2246822519 + 11);

  const rowN = Math.min(48, 18 + n + int(r, 0, 6));
  const defectN = pick(r, [0, 1, 1, 2, 2, 3, 4]);
  const subtleUnlocked = n >= 15;
  const pool: DDefect[] = !subtleUnlocked
    ? DD_BLATANT
    : n >= 25
      ? DD_SUBTLE
      : [...DD_BLATANT, ...DD_SUBTLE];

  const columns = ["id", "store", "category", "date", "units", "unit_price", "total"];
  // one "correct" price per category, so an inconsistent one stands out
  const priceByCat: Record<string, number> = {};
  for (const c of DD_CATS) priceByCat[c] = int(r, 800, 9000);

  const rows: (string | number)[][] = [];
  for (let i = 0; i < rowN; i++) {
    const cat = pick(r, DD_CATS);
    const units = int(r, 1, 9);
    const price = priceByCat[cat] + int(r, -40, 40); // small honest noise
    const day = String(pick(r, DD_WEEKDAYS)).padStart(2, "0");
    rows.push([2000 + i, pick(r, DD_STORES), cat, `2024-06-${day}`, units, price, units * price]);
  }

  const bad = new Set<number>();
  const reasons: string[] = [];
  let guard = 0;
  while (bad.size < defectN && guard++ < 200) {
    const idx = int(r, 0, rowN - 1);
    if (bad.has(idx)) continue;
    const row = rows[idx];
    const def = pick(r, pool);

    if (def === "impossible_date") {
      row[3] = pick(r, ["2024-02-30", "2024-06-31", "2024-13-04", "2024-04-31"]);
      reasons.push(`Row ${idx + 1}: ${row[3]} is not a real calendar date.`);
    } else if (def === "negative_qty") {
      row[4] = -int(r, 1, 6);
      row[6] = (row[4] as number) * (row[5] as number);
      reasons.push(`Row ${idx + 1}: units is ${row[4]} — you cannot sell negative units.`);
    } else if (def === "dup_id") {
      const other = idx === 0 ? 1 : idx - 1;
      row[0] = rows[other][0];
      reasons.push(`Row ${idx + 1}: id ${row[0]} is already used by row ${other + 1}.`);
    } else if (def === "outlier_10x") {
      row[4] = (row[4] as number) * 10 + int(r, 0, 5);
      row[6] = (row[4] as number) * (row[5] as number);
      reasons.push(`Row ${idx + 1}: ${row[4]} units is ~10x every other row — a trailing zero.`);
    } else if (def === "impossible_pct") {
      // repurpose unit_price as a discount_pct that went past 100
      columns[5] = "discount_pct";
      row[5] = int(r, 110, 260);
      row[6] = "";
      reasons.push(`Row ${idx + 1}: a discount of ${row[5]}% is impossible.`);
    } else if (def === "total_mismatch") {
      row[6] = (row[6] as number) + int(r, 200, 2000);
      reasons.push(`Row ${idx + 1}: total does not equal units x unit_price.`);
    } else if (def === "weekend_order") {
      const wd = String(pick(r, DD_NONWEEKDAYS)).padStart(2, "0");
      row[3] = `2024-06-${wd}`;
      reasons.push(`Row ${idx + 1}: 2024-06-${wd} is a weekend. This is a B2B store, no weekend orders.`);
    } else {
      // price_inconsistent
      const cat = row[2] as string;
      row[5] = priceByCat[cat] * 3 + int(r, -50, 50);
      row[6] = (row[4] as number) * (row[5] as number);
      reasons.push(`Row ${idx + 1}: ${cat} is ~${priceByCat[cat]} everywhere else here, this row prices it at ${row[5]}.`);
    }
    bad.add(idx);
  }

  const badRows = [...bad].sort((a, b) => a - b);
  const prompt =
    defectN === 0
      ? "Scan the table and flag every row that breaks a rule. This one may be clean — flagging nothing is a valid answer."
      : `Scan the table and flag every row that breaks a rule. Three wrong flags ends the round.`;

  return {
    prompt,
    columns,
    rows,
    badRows,
    explain: reasons.length ? reasons.join(" ") : "Nothing was wrong with this table.",
    strikeLimit: 3,
  };
}

/* ------------------------------------------------------------- Pivot Puzzle --
   Generate a raw deals table and a target pivot config; the component gives the
   learner the tray + drop zones and pivotEngine checks their build. */
const PV_DIMS: { col: string; vals: string[] }[] = [
  { col: "region", vals: ["North", "South", "East", "West"] },
  { col: "quarter", vals: ["Q1", "Q2", "Q3", "Q4"] },
  { col: "channel", vals: ["Web", "Field", "Partner"] },
  { col: "stage", vals: ["Open", "Won", "Lost"] },
  { col: "segment", vals: ["SMB", "Mid", "Enterprise"] },
];
const PV_MEASURES = ["revenue", "units", "discount"];
const PV_PERSONA = ["Finance", "The ops lead", "Your manager", "The RevOps team", "The board deck"];

function verbFor(agg: Agg, measure: string | null): string {
  if (agg === "count") return "the number of deals";
  if (agg === "sum") return `total ${measure}`;
  if (agg === "avg") return `average ${measure}`;
  return `the ${agg} ${measure}`;
}

export function pivotRound(n: number): PivotRound {
  const r = rng(n * 2654435761 + 3);

  // pick 2-3 dimensions + 1 measure for the raw table
  const dims = shuffle(r, [...PV_DIMS]).slice(0, n >= 14 ? 3 : n >= 6 ? 3 : 2);
  const measure = pick(r, PV_MEASURES);
  const columns = [...dims.map((d) => d.col), measure];

  const rowN = int(r, 24, 44);
  const rows: (string | number)[][] = Array.from({ length: rowN }, () => [
    ...dims.map((d) => pick(r, d.vals)),
    measure === "discount" ? int(r, 0, 40) : int(r, 20, 900),
  ]);
  const raw = rows.map((row) =>
    Object.fromEntries(columns.map((c, i) => [c, row[i]])),
  ) as Record<string, string | number>[];

  // build the target config, scaling complexity with n
  const agg: Agg = pick(r, n >= 6 ? (["sum", "count", "avg", "max"] as Agg[]) : (["sum", "count"] as Agg[]));
  const rowField = dims[0].col;
  const cfg: PivotConfig = {
    rows: [rowField],
    cols: [],
    value: agg === "count" ? null : measure,
    agg,
    filters: [],
  };

  if (n >= 6 && n < 14) {
    // one extra lever: a column split OR a filter
    if (r() < 0.5 && dims.length > 1) cfg.cols = [dims[1].col];
    else if (dims.length > 1) {
      const fd = dims[1];
      cfg.filters = [{ field: fd.col, eq: pick(r, fd.vals) }];
    }
  } else if (n >= 14) {
    // two levers
    if (r() < 0.5 && dims.length >= 3) {
      cfg.rows = [dims[0].col, dims[1].col];
      const fd = dims[2];
      cfg.filters = [{ field: fd.col, eq: pick(r, fd.vals) }];
    } else if (dims.length >= 3) {
      cfg.cols = [dims[1].col];
      const fd = dims[2];
      cfg.filters = [{ field: fd.col, eq: pick(r, fd.vals) }];
    }
  }

  // prose ask
  const persona = pick(r, PV_PERSONA);
  const per = `per ${cfg.rows.join(" then ")}`;
  const split = cfg.cols.length ? `, split by ${cfg.cols[0]}` : "";
  const filt = cfg.filters.length ? `, ${cfg.filters[0].field} = ${cfg.filters[0].eq} only` : "";
  const prompt = `${persona} wants ${verbFor(agg, cfg.value)} ${per}${split}${filt}.`;

  const filterValues: Record<string, string[]> = {};
  for (const d of dims) filterValues[d.col] = d.vals;

  // guarantee the target actually produces something (rare empty from a filter)
  const check = runPivot(raw, cfg);
  if (check.rowKeys.length === 0) cfg.filters = [];

  return {
    prompt,
    columns,
    rows,
    dims: dims.map((d) => d.col),
    measures: [measure],
    filterValues,
    target: cfg,
  };
}

/* --------------------------------------------------------- Chart Critiquer -- */
import type { CritiqueStep } from "./miniGames";

/** the concept strings — kept in sync with P in miniGames.ts */
const CONCEPTS = {
  truncated: "Truncated y-axis: the baseline is not zero, so a small change looks huge",
  dualAxis: "Two independent y-axes scaled to overlap, manufacturing a correlation",
  wrongType: "A continuous line over discrete categories implies progression that isn't there",
  tooManySlices: "A pie split into too many wedges to compare",
  cherryWindow: "Only a flattering slice of the time range is shown",
  noDenominator: "Raw counts with no population or base to turn them into rates",
  simpsons: "A rising aggregate can hide every segment falling if the mix shifted (Simpson's paradox)",
  smoothedVariance: "A smoothed average hides how volatile the underlying values are",
  survivorship: "The sample is only the people who stayed, so the losers are invisible",
  shortWindow: "Too few points to claim a trend or a cause",
  honest: "Nothing wrong: zero baseline, full range shown, the claim matches the data",
} as const;
type ConceptKey = keyof typeof CONCEPTS;

const SUBJECTS = ["Revenue", "Sign-ups", "Active users", "Conversion", "NPS", "Engagement", "Retention"];
const PERIODS: string[][] = [
  ["Q1", "Q2", "Q3", "Q4"],
  ["Jan", "Feb", "Mar", "Apr", "May"],
  ["2021", "2022", "2023", "2024"],
  ["Wk1", "Wk2", "Wk3", "Wk4"],
];
const DECOY_ACTIONS = [
  "Add data labels to every point",
  "Use a bolder colour for the top value",
  "Switch the chart to 3D",
  "Add a title and a legend",
  "Make the gridlines darker",
  "Sort the bars from high to low",
];

function shuffle<T>(r: () => number, a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** step 2: pick the concept. correct + 3 other concepts, one optionally a near-miss. */
function conceptStep(
  r: () => number,
  correct: ConceptKey,
  explain: string,
  near?: ConceptKey,
): CritiqueStep {
  const pool = (Object.keys(CONCEPTS) as ConceptKey[]).filter((k) => k !== correct);
  const distract: ConceptKey[] = [];
  if (near && near !== correct) distract.push(near);
  while (distract.length < 3) {
    const k = pick(r, pool);
    if (!distract.includes(k)) distract.push(k);
  }
  const opts = shuffle(r, [correct, ...distract]);
  return { options: opts.map((k) => CONCEPTS[k]), answer: opts.indexOf(correct), explain };
}

/** step 3: pick the action that actually helps. */
function actionStep(r: () => number, correct: string, explain: string): CritiqueStep {
  const opts = shuffle(r, [correct, ...shuffle(r, DECOY_ACTIONS).slice(0, 3)]);
  return { options: opts, answer: opts.indexOf(correct), explain };
}

type Family =
  | "honest" | "truncated" | "dualAxis" | "wrongType" | "tooManySlices"
  | "cherryWindow" | "noDenominator" | "simpsons" | "smoothedVariance"
  | "survivorship" | "shortWindow";

const VISUAL_FAMILIES: Family[] = ["truncated", "dualAxis", "wrongType", "tooManySlices", "cherryWindow"];
const JUDGMENT_FAMILIES: Family[] = ["noDenominator", "simpsons", "smoothedVariance", "survivorship", "shortWindow"];

/** enforce the mix (Council): ~22% honest control, ~40% visual flaw where the
 *  chart itself is the tell, ~38% judgment flaw where the claim outruns the
 *  data. Judgment flaws unlock at level 13, the nastier ones at 20. */
function pickFamily(r: () => number, n: number): Family {
  const roll = r();
  if (roll < 0.22) return "honest";
  const judgmentUnlocked = n >= 13;
  if (roll < 0.62 || !judgmentUnlocked) return pick(r, VISUAL_FAMILIES);
  const pool = n >= 20 ? JUDGMENT_FAMILIES : JUDGMENT_FAMILIES.slice(0, 3);
  return pick(r, pool);
}

export function critiqueRound(n: number): CritiqueRound {
  if (n <= CRITIQUE_AUTHORED) return CRITIQUE_ROUNDS[n - 1];
  const r = rng(n * 40503 + 7);
  const fam = pickFamily(r, n);
  const subject = pick(r, SUBJECTS);
  const periods = pick(r, PERIODS);
  const near = n >= 20; // slip in a near-miss distractor at higher levels

  let round: CritiqueRound;

  if (fam === "honest") {
    const v0 = int(r, 40, 80);
    const step = int(r, 7, 16);
    round = {
      title: subject,
      chart: "bar",
      series: periods.map((l, i) => ({ label: l, value: v0 + i * step + int(r, -2, 2) })),
      yStart: 0,
      caption: `${subject} by period, axis from zero, every period shown.`,
      claim: `${subject} rose steadily across the whole range and the trend is real.`,
      verdict: "safe",
      verdictExplain: "Honest baseline, full range, a consistent rise. The claim follows from the chart.",
      problem: conceptStep(r, "honest", "Not every chart is a trick. This one is drawn straight and the claim holds.", near ? "cherryWindow" : undefined),
    };
  } else if (fam === "truncated") {
    const base = int(r, 90, 400);
    round = {
      title: subject,
      chart: "bar",
      series: periods.map((l) => ({ label: l, value: base + int(r, 2, 14) })),
      yStart: base,
      caption: `${subject} by period. The bars nearly fill the panel.`,
      claim: `${subject} jumped sharply this period.`,
      verdict: "misleading",
      verdictExplain: "The real change is a few percent. The cut axis turns it into a cliff.",
      problem: conceptStep(r, "truncated", "The axis starts well above zero. Draw it from zero and the bars are almost level.", near ? "cherryWindow" : undefined),
      followup: actionStep(r, "Redraw from a zero baseline and state the change as a percentage", "Only the baseline changes what a reader concludes."),
    };
  } else if (fam === "dualAxis") {
    const b = int(r, 30, 90);
    const b2 = int(r, 3000, 9000);
    round = {
      title: `${subject} and spend`,
      chart: "dual",
      series: periods.map((l) => ({ label: l, value: b + int(r, -3, 5) })),
      series2: periods.map((l) => ({ label: l, value: b2 + int(r, -300, 500) })),
      yStart: 0,
      caption: "Two metrics on one chart, each on its own hidden axis.",
      claim: "The two move together, so one is driving the other.",
      verdict: "misleading",
      verdictExplain: "The overlap is a scaling choice. Any two rising series can be stacked like this.",
      problem: conceptStep(r, "dualAxis", "Independent axes scaled to overlap prove nothing about a relationship.", near ? "simpsons" : undefined),
      followup: actionStep(r, "Index both to 100 at the first period and plot them on one axis", "One shared, indexed axis is the honest view."),
    };
  } else if (fam === "wrongType") {
    round = {
      title: `${subject} by campaign`,
      chart: "line-smooth",
      series: periods.map((l, i) => ({ label: l.replace(/\D+/, "Camp "), value: 30 + i * int(r, 8, 16) + int(r, -3, 3) })),
      yStart: 0,
      caption: `${subject} for ${periods.length} separate campaigns, drawn as one smooth curve.`,
      claim: "Each campaign beats the last. We've found a formula.",
      verdict: "misleading",
      verdictExplain: "Separate campaigns are not a continuous process, and this few points is not a formula.",
      problem: conceptStep(r, "wrongType", "A smooth line implies flow between points that aren't connected. Use bars.", near ? "shortWindow" : undefined),
      followup: actionStep(r, "Redraw as bars and run more campaigns before calling it a pattern", "Bars stop the eye inventing a trend."),
    };
  } else if (fam === "tooManySlices") {
    const cnt = int(r, 8, 12);
    round = {
      title: `${subject} share`,
      chart: "pie",
      series: "ABCDEFGHIJKL".slice(0, cnt).split("").map((l) => ({ label: l, value: int(r, 5, 16) })),
      yStart: 0,
      caption: `${subject.toLowerCase()} share across ${cnt} categories, as a pie.`,
      claim: "You can see at a glance which categories lead.",
      verdict: "misleading",
      verdictExplain: `With ${cnt} similar wedges you cannot rank them by eye.`,
      problem: conceptStep(r, "tooManySlices", "Past about five slices a pie is unreadable. A ranked bar chart compares many categories.", near ? "noDenominator" : undefined),
      followup: actionStep(r, "Redraw as a horizontal bar chart sorted high to low", "Sorted bars make the ranking instant."),
    };
  } else if (fam === "cherryWindow") {
    const full = periods.map((l) => ({ label: l, value: int(r, 40, 130) }));
    round = {
      title: subject,
      chart: "bar",
      series: [full[0], full[full.length - 1]],
      yStart: 0,
      caption: `${subject} for the first and last period only. The ones in between are not shown.`,
      claim: `${subject} is up over the period.`,
      verdict: "cant-tell",
      verdictExplain: "The two endpoints might be the only good months. Without the middle you cannot call it a trend.",
      problem: conceptStep(r, "cherryWindow", "Only the flattering endpoints are shown. The path between them is hidden.", near ? "shortWindow" : undefined),
      followup: actionStep(r, "Ask for every period in the range and redraw the full series", "The middle is where the story is."),
    };
  } else if (fam === "noDenominator") {
    const groups = pick(r, [["City A", "City B", "City C"], ["Team 1", "Team 2", "Team 3"], ["Region N", "Region S", "Region E"]]);
    round = {
      title: `${subject} by group`,
      chart: "bar",
      series: groups.map((l) => ({ label: l, value: int(r, 200, 1200) })),
      yStart: 0,
      caption: `Total ${subject.toLowerCase()} count by group, last quarter.`,
      claim: "The group with the tallest bar is the worst performer.",
      verdict: "cant-tell",
      verdictExplain: "A bigger group produces more of everything. Without the group sizes this is just headcount.",
      problem: conceptStep(r, "noDenominator", "Raw counts with no population. You need it per customer, per user, per capita.", near ? "simpsons" : undefined),
      followup: actionStep(r, "Get the size of each group and switch to a per-member rate", "Rates, not counts, when the groups differ in size."),
    };
  } else if (fam === "simpsons") {
    round = {
      title: `${subject} overall`,
      chart: "line",
      series: periods.map((l, i) => ({ label: l, value: Math.round((3 + i * 0.3 + r() * 0.2) * 10) / 10 })),
      yStart: 0,
      caption: `Overall ${subject.toLowerCase()}, all segments combined, trending up.`,
      claim: "Things are improving across the board.",
      verdict: "cant-tell",
      verdictExplain: "The blended number can rise while every segment falls, if the mix shifted toward the stronger segment.",
      problem: conceptStep(r, "simpsons", "A rising total can hide every part falling. The aggregate alone will not show it.", near ? "smoothedVariance" : undefined),
      followup: actionStep(r, "Break the same metric out by segment for the same periods", "If each segment rose too, the claim holds. If the mix moved, it doesn't."),
    };
  } else if (fam === "smoothedVariance") {
    round = {
      title: `${subject} monthly average`,
      chart: "line",
      series: periods.map((l) => ({ label: l, value: int(r, 48, 52) })),
      yStart: 0,
      caption: `Monthly average ${subject.toLowerCase()}. A note says daily values swing from near zero to double the average.`,
      claim: `${subject} is stable and predictable.`,
      verdict: "misleading",
      verdictExplain: "A flat monthly average can sit on top of wild daily swings. Stable on average is not stable.",
      problem: conceptStep(r, "smoothedVariance", "The smoothing hides the spread. Plot the daily range or a distribution.", near ? "simpsons" : undefined),
      followup: actionStep(r, "Plot the daily values or a min-max band, not just the monthly mean", "The variation is the whole point here."),
    };
  } else if (fam === "survivorship") {
    round = {
      title: `${subject} survey`,
      chart: "bar",
      series: [
        { label: "Rated 1-6", value: int(r, 5, 15) },
        { label: "Rated 7-8", value: int(r, 20, 30) },
        { label: "Rated 9-10", value: int(r, 55, 70) },
      ],
      yStart: 0,
      caption: "Satisfaction survey results. The survey went to people who logged in this week.",
      claim: "Users love the product.",
      verdict: "cant-tell",
      verdictExplain: "Everyone who hated it already left and never saw the survey. You are measuring the fans.",
      problem: conceptStep(r, "survivorship", "The sample is only the survivors. The unhappy ones churned and are invisible here.", near ? "noDenominator" : undefined),
      followup: actionStep(r, "Survey recently churned users too, or read this next to the retention curve", "Ask the people who left."),
    };
  } else {
    // shortWindow
    const p3 = periods.slice(0, 3);
    round = {
      title: subject,
      chart: "line",
      series: p3.map((l, i) => ({ label: l, value: 50 + i * int(r, 10, 20) })),
      yStart: 0,
      caption: `${subject} for three periods after a change shipped.`,
      claim: "The change caused the jump.",
      verdict: "cant-tell",
      verdictExplain: "Three rising points can be noise, seasonality, or something else that changed at the same time.",
      problem: conceptStep(r, "shortWindow", "Too few points, and nothing rules out the other things that moved that week.", near ? "simpsons" : undefined),
      followup: actionStep(r, "Compare against a control group or the same weeks last year", "You need a counterfactual, not just before and after."),
    };
  }

  // the follow-up ("which fix changes the answer") is always shown now — the
  // component makes it weightless before level 7 so it becomes a habit first.
  // "honest" rounds have no fix to make, so they keep no follow-up.
  return round;
}
