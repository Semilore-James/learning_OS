/* ============================================================================
   Endless rounds for Data Detective, Pivot Puzzle and Chart Critiquer. The
   authored rounds in miniGames.ts are the intro; getXRound(n) synthesises
   everything past that deterministically from n, so each game runs forever.
   ========================================================================== */
import {
  DETECTIVE_ROUNDS,
  PIVOT_ROUNDS,
  CRITIQUE_ROUNDS,
  type DetectiveRound,
  type PivotRound,
  type CritiqueRound,
} from "./miniGames";

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
export const PIVOT_AUTHORED = PIVOT_ROUNDS.length;
export const CRITIQUE_AUTHORED = CRITIQUE_ROUNDS.length;

/* ---------------------------------------------------------- Data Detective -- */
const NAMES = ["Ada", "Kai", "Sam", "Ivy", "Ron", "Mia", "Leo", "Nia", "Tom", "Zoe"];
const PRODUCTS = ["Keyboard", "Monitor", "Hub", "Webcam", "Stand", "Mat", "Cable"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

type Defect =
  | "impossible_date"
  | "negative_qty"
  | "dup_id"
  | "outlier"
  | "bad_pct"
  | "total_mismatch";

export function detectiveRound(n: number): DetectiveRound {
  if (n <= DETECTIVE_AUTHORED) return DETECTIVE_ROUNDS[n - 1];
  const r = rng(n * 2246822519);
  const defect = pick(r, [
    "impossible_date",
    "negative_qty",
    "dup_id",
    "outlier",
    "bad_pct",
    "total_mismatch",
  ] as Defect[]);
  const rowCount = int(r, 4, 5);
  const bad = int(r, 0, rowCount - 1);

  if (defect === "impossible_date") {
    const rows = Array.from({ length: rowCount }, (_, i) => {
      const mm = int(r, 1, 12);
      const dd = i === bad ? pick(r, [31, 32, 30]) : int(r, 1, 28);
      const badMonth = i === bad && pick(r, [true, false]);
      const m = badMonth ? "13" : String(mm).padStart(2, "0");
      return [100 + i, pick(r, NAMES), `2024-${m}-${String(i === bad && !badMonth ? dd : int(r, 1, 28)).padStart(2, "0")}`];
    });
    // force the bad row to be clearly impossible
    rows[bad][2] = pick(r, ["2024-02-30", "2024-04-31", "2024-13-05", "2024-06-31"]);
    return {
      prompt: "One signup date can't be real. Which row?",
      columns: ["id", "name", "signup_date"],
      rows,
      badRow: bad,
      because: `${rows[bad][2]} isn't a valid calendar date.`,
    };
  }

  if (defect === "negative_qty") {
    const rows = Array.from({ length: rowCount }, (_, i) => [
      10 + i,
      pick(r, PRODUCTS),
      i === bad ? -int(r, 1, 5) : int(r, 1, 6),
      int(r, 20, 200),
    ]);
    return {
      prompt: "A quantity column shouldn't allow this value. Which row?",
      columns: ["order_id", "product", "qty", "unit_price"],
      rows,
      badRow: bad,
      because: `A quantity of ${rows[bad][2]} can't be shipped — likely a bad return adjustment.`,
    };
  }

  if (defect === "dup_id") {
    const base = int(r, 100, 180);
    const rows = Array.from({ length: rowCount }, (_, i) => [base + i, `SKU-${int(r, 10, 99)}`, pick(r, PRODUCTS)]);
    const clash = bad === 0 ? 1 : 0;
    rows[bad][0] = rows[clash][0];
    return {
      prompt: "Primary keys must be unique. Which row breaks that?",
      columns: ["id", "sku", "name"],
      rows,
      badRow: bad,
      because: `id ${rows[bad][0]} already belongs to row ${clash + 1}.`,
    };
  }

  if (defect === "outlier") {
    const nom = int(r, 90, 160);
    const rows = Array.from({ length: rowCount }, (_, i) => {
      const units = i === bad ? nom * 10 + int(r, 0, 30) : nom + int(r, -12, 12);
      return [MONTHS[i], units, units * 90];
    });
    return {
      prompt: "One month's figures are a clear outlier from a units error. Which row?",
      columns: ["month", "units", "revenue"],
      rows,
      badRow: bad,
      because: `${rows[bad][0]} units (${rows[bad][1]}) is ~10x its neighbours — a trailing zero slipped in.`,
    };
  }

  if (defect === "bad_pct") {
    const rows = Array.from({ length: rowCount }, (_, i) => [
      pick(r, ["Search", "Social", "Email", "Display", "Video"]),
      int(r, 200, 2000),
      i === bad ? int(r, 120, 260) + r() : Math.round((0.3 + r() * 4) * 10) / 10,
    ]);
    return {
      prompt: "A rate column has an impossible value. Which row?",
      columns: ["channel", "clicks", "ctr_pct"],
      rows: rows.map((x) => [x[0], x[1], typeof x[2] === "number" ? Math.round((x[2] as number) * 10) / 10 : x[2]]),
      badRow: bad,
      because: `A click-through rate of ${Math.round((rows[bad][2] as number) * 10) / 10}% is impossible — clicks can't exceed impressions.`,
    };
  }

  // total_mismatch
  const rows = Array.from({ length: rowCount }, (_, i) => {
    const sub = int(r, 40, 220);
    const tax = Math.round(sub * 0.2);
    const total = i === bad ? sub + tax + int(r, 8, 40) : sub + tax;
    return [`INV-${i + 1}`, sub, tax, total];
  });
  return {
    prompt: "One invoice's total doesn't add up. Which row?",
    columns: ["invoice", "subtotal", "tax", "total"],
    rows,
    badRow: bad,
    because: `${rows[bad][1]} + ${rows[bad][2]} = ${(rows[bad][1] as number) + (rows[bad][2] as number)}, not ${rows[bad][3]}.`,
  };
}

/* ------------------------------------------------------------- Pivot Puzzle -- */
const DIMS = [
  { col: "region", vals: ["North", "South", "East", "West"] },
  { col: "team", vals: ["Alpha", "Bravo", "Charlie"] },
  { col: "channel", vals: ["Web", "Store", "Partner"] },
  { col: "stage", vals: ["Open", "Won", "Lost"] },
];
const AGGS = ["sum", "count", "avg", "max"] as const;

export function pivotRound(n: number): PivotRound {
  if (n <= PIVOT_AUTHORED) return PIVOT_ROUNDS[n - 1];
  const r = rng(n * 2654435761);
  const dim = pick(r, DIMS);
  const agg = pick(r, AGGS);
  const measure = pick(r, ["revenue", "value", "score", "amount"]);
  const labelCol = pick(r, ["rep", "deal", "item", "order"]);
  const rowN = int(r, 5, 8);
  const cols = [dim.col, labelCol, measure];
  const rows: (string | number)[][] = Array.from({ length: rowN }, (_, i) => [
    pick(r, dim.vals),
    `${labelCol[0]}${i + 1}`,
    int(r, 10, 200),
  ]);
  // compute expected
  const buckets = new Map<string, number[]>();
  for (const row of rows) {
    const k = String(row[0]);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k)!.push(agg === "count" ? 1 : (row[2] as number));
  }
  const expect: [string, number][] = [];
  for (const [k, v] of buckets) {
    let out: number;
    if (agg === "count") out = v.length;
    else if (agg === "sum") out = v.reduce((a, b) => a + b, 0);
    else if (agg === "avg") out = v.reduce((a, b) => a + b, 0) / v.length;
    else out = Math.max(...v);
    expect.push([k, Math.round(out * 100) / 100]);
  }
  expect.sort((a, b) => a[0].localeCompare(b[0]));
  const scene = pick(r, [
    "The ops lead wants a summary for the weekly review.",
    "Finance asked for this cut before the board deck.",
    "You're building a dashboard tile and need the right rollup.",
    "A stakeholder emailed asking for exactly this number.",
  ]);
  const verb = agg === "count" ? "the number of records" : `the ${agg} of ${measure}`;
  return {
    prompt: `${scene} Rebuild ${verb} per ${dim.col} from the raw rows.`,
    columns: cols,
    rows,
    groupBy: dim.col,
    valueField: agg === "count" ? labelCol : measure,
    agg,
    expect,
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
