/* ============================================================================
   Content for the three non-SQL games. All pure data — the components render
   and score it. Rounds are ordered easiest-first; each cleared round is one
   "level" for recordGameScore.
   ========================================================================== */

/* ---- Data Detective : spot the data-quality defect in a small table -------- */
export interface DetectiveRound {
  prompt: string;
  columns: string[];
  rows: (string | number)[][];
  /** indices of the defective rows (0 to a few; some rounds are clean) */
  badRows: number[];
  /** what the defects were, shown after the round */
  explain: string;
  /** wrong flags allowed before the round fails (default 3) */
  strikeLimit?: number;
}

export const DETECTIVE_ROUNDS: DetectiveRound[] = [
  {
    prompt: "One customer record is impossible. Which row?",
    columns: ["id", "name", "signup_date", "age"],
    rows: [
      [1, "Ada", "2023-01-05", 34],
      [2, "Grace", "2023-02-11", 29],
      [3, "Alan", "2023-02-30", 41],
      [4, "Katherine", "2023-03-15", 38],
    ],
    badRows: [2],
    explain: "February never has 30 days — 2023-02-30 is not a real date.",
  },
  {
    prompt: "A quantity column should never allow this. Which row?",
    columns: ["order_id", "product", "qty", "unit_price"],
    rows: [
      [11, "Keyboard", 2, 89],
      [12, "Monitor", 1, 240],
      [13, "Hub", -3, 45],
      [14, "Webcam", 1, 60],
    ],
    badRows: [2],
    explain: "A negative quantity (-3) can't be shipped — likely a bad return adjustment.",
  },
  {
    prompt: "Primary keys must be unique. Which row breaks that?",
    columns: ["id", "sku", "name"],
    rows: [
      [101, "KB-01", "Keyboard"],
      [102, "MN-27", "Monitor"],
      [103, "HB-0C", "USB-C Hub"],
      [102, "ST-01", "Laptop Stand"],
    ],
    badRows: [3],
    explain: "id 102 already belongs to the Monitor row — the id is duplicated.",
  },
  {
    prompt: "One revenue figure is a clear outlier from a units error. Which row?",
    columns: ["month", "units", "revenue"],
    rows: [
      ["Jan", 120, 10800],
      ["Feb", 132, 11880],
      ["Mar", 1280, 115200],
      ["Apr", 141, 12690],
    ],
    badRows: [2],
    explain: "March units (1280) is ~10x its neighbours — a trailing zero slipped in.",
  },
  {
    prompt: "A percentage column has an invalid value. Which row?",
    columns: ["campaign", "clicks", "ctr_pct"],
    rows: [
      ["Search", 900, 3.1],
      ["Social", 1200, 2.4],
      ["Email", 400, 140.0],
      ["Display", 2200, 0.6],
    ],
    badRows: [2],
    explain: "A click-through rate of 140% is impossible — clicks can't exceed impressions.",
  },
  {
    prompt: "One row's total doesn't add up. Which row?",
    columns: ["invoice", "subtotal", "tax", "total"],
    rows: [
      ["A-1", 100, 20, 120],
      ["A-2", 50, 10, 60],
      ["A-3", 80, 16, 132],
      ["A-4", 200, 40, 240],
    ],
    badRows: [2],
    explain: "80 + 16 = 96, not 132 — the total column is wrong for invoice A-3.",
  },
];

/* ---- Pivot Puzzle : configure a pivot to match a target output ------------
   Rebuilt (Council): a drag/click-to-configure pivot builder. The learner is
   handed a target output table phrased in business language and a raw table,
   and drags fields into Rows / Columns / Values / Filters until the result
   matches. The whole thing is generated (lib/games/miniGamesGen) and checked
   deterministically by lib/games/pivotEngine. No authored rounds. */
export interface PivotRound {
  /** business-language ask ("Finance wants revenue per region, won deals only") */
  prompt: string;
  /** raw table */
  columns: string[];
  rows: (string | number)[][];
  /** which columns are dimensions vs measures, for the field tray */
  dims: string[];
  measures: string[];
  /** distinct values per dimension, for the filter dropdowns */
  filterValues: Record<string, string[]>;
  /** the config that produces the target (used to check + to compute the target) */
  target: import("./pivotEngine").PivotConfig;
}

/* ---- Chart Critiquer : read the chart, then judge the claim someone made ---
   Each round shows a chart plus a stakeholder's conclusion. Step 1 is the hard
   part: does the claim hold, is the chart misleading, or can you not tell from
   this alone? "Can't tell" and "safe" are correct often enough that reflexive
   skepticism loses points. Step 2 names the specific problem. Harder rounds add
   a follow-up: what you'd ask for, or which fix actually changes the answer. */
export type ChartType = "bar" | "line" | "line-smooth" | "pie" | "dual";
export type Verdict = "safe" | "misleading" | "cant-tell";

export interface CritiqueStep {
  options: string[];
  answer: number;
  explain: string;
}

export interface CritiqueRound {
  title: string;
  chart: ChartType;
  series: { label: string; value: number }[];
  /** dual only: the second series */
  series2?: { label: string; value: number }[];
  /** bar baseline; 0 unless the round is testing a truncated axis */
  yStart: number;
  /** what the chart plots */
  caption: string;
  /** the decision or conclusion someone drew from it */
  claim: string;
  /** step 1 */
  verdict: Verdict;
  verdictExplain: string;
  /** step 2: name the specific issue (or confirm there isn't one) */
  problem: CritiqueStep;
  /** step 3, harder rounds: what you'd do about it */
  followup?: CritiqueStep;
}

export const P = {
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

/** the flaw-families reference, grouped, for the in-game panel */
export const FLAW_REFERENCE: { group: string; items: string[] }[] = [
  {
    group: "The chart itself is the tell",
    items: [P.truncated, P.dualAxis, P.wrongType, P.tooManySlices, P.cherryWindow],
  },
  {
    group: "The claim outruns the data",
    items: [P.noDenominator, P.simpsons, P.smoothedVariance, P.survivorship, P.shortWindow],
  },
];

export const CRITIQUE_ROUNDS: CritiqueRound[] = [
  {
    title: "Quarterly revenue",
    chart: "bar",
    series: [
      { label: "Q1", value: 100 }, { label: "Q2", value: 112 },
      { label: "Q3", value: 121 }, { label: "Q4", value: 134 },
    ],
    yStart: 0,
    caption: "Revenue by quarter, axis from zero, all four quarters shown.",
    claim: "Revenue grew about a third over the year and the trend is real.",
    verdict: "safe",
    verdictExplain: "Zero baseline, every period shown, a clear consistent rise. The claim is supported.",
    problem: {
      options: [
        P.honest,
        P.truncated,
        P.cherryWindow,
        P.wrongType,
      ],
      answer: 0,
      explain: "Not every chart is a trick. This one is drawn honestly and the conclusion follows from it.",
    },
  },
  {
    title: "Quarterly revenue",
    chart: "bar",
    series: [
      { label: "Q1", value: 102 }, { label: "Q2", value: 104 },
      { label: "Q3", value: 103 }, { label: "Q4", value: 106 },
    ],
    yStart: 100,
    caption: "Revenue by quarter. The bars nearly fill the panel.",
    claim: "Revenue is climbing fast, up sharply through the year.",
    verdict: "misleading",
    verdictExplain: "The change is about 4%. The chart makes it look like a surge.",
    problem: {
      options: [P.truncated, P.dualAxis, P.tooManySlices, P.honest],
      answer: 0,
      explain: "The y-axis starts at 100, not 0. Redraw it from zero and the bars are nearly flat.",
    },
    followup: {
      options: [
        "Redraw from a zero baseline and restate the change as a percentage",
        "Add data labels on top of each bar",
        "Switch the bars to a line",
        "Use a brighter colour for Q4",
      ],
      answer: 0,
      explain: "Only the zero baseline changes what a reader concludes. The rest is decoration.",
    },
  },
  {
    title: "Support tickets by city",
    chart: "bar",
    series: [
      { label: "City A", value: 900 }, { label: "City B", value: 310 },
      { label: "City C", value: 280 },
    ],
    yStart: 0,
    caption: "Total support tickets last quarter, by city.",
    claim: "City A has a much worse support experience than the others.",
    verdict: "cant-tell",
    verdictExplain: "City A might just have far more customers. Volume alone can't tell you the per-customer rate.",
    problem: {
      options: [P.noDenominator, P.truncated, P.wrongType, P.honest],
      answer: 0,
      explain: "Tickets per customer is the comparison. If City A has 5x the customers, it is actually doing better.",
    },
    followup: {
      options: [
        "Active customers per city, to get tickets per customer",
        "The tickets broken out by severity",
        "The same chart as a pie",
        "Two more quarters of ticket totals",
      ],
      answer: 0,
      explain: "You need the denominator. Severity and history are useful later, but they don't fix the core gap.",
    },
  },
  {
    title: "Ad spend vs. revenue",
    chart: "dual",
    series: [
      { label: "Jan", value: 50 }, { label: "Feb", value: 52 },
      { label: "Mar", value: 51 }, { label: "Apr", value: 53 },
    ],
    series2: [
      { label: "Jan", value: 5000 }, { label: "Feb", value: 5200 },
      { label: "Mar", value: 5100 }, { label: "Apr", value: 5300 },
    ],
    yStart: 0,
    caption: "Ad spend and revenue on the same chart, each on its own hidden axis.",
    claim: "Ad spend drives revenue. The two lines move together.",
    verdict: "misleading",
    verdictExplain: "Two independent axes were scaled so the lines overlap. That overlap is a drawing choice, not a finding.",
    problem: {
      options: [P.dualAxis, P.truncated, P.shortWindow, P.honest],
      answer: 0,
      explain: "Any two vaguely-rising series can be made to sit on top of each other with the right two scales.",
    },
    followup: {
      options: [
        "Index both to 100 at January and plot them on one axis",
        "Add gridlines to both axes",
        "Make the lines thicker",
        "Label the axes with their units",
      ],
      answer: 0,
      explain: "One shared, indexed axis is the honest view. Then you can see whether they really track.",
    },
  },
  {
    title: "Site-wide conversion rate",
    chart: "line",
    series: [
      { label: "Jan", value: 3.0 }, { label: "Feb", value: 3.2 },
      { label: "Mar", value: 3.4 }, { label: "Apr", value: 3.6 },
    ],
    yStart: 0,
    caption: "Overall conversion rate, all traffic, trending up month over month.",
    claim: "The checkout changes are working. Conversion is improving.",
    verdict: "cant-tell",
    verdictExplain: "The overall rate can rise while every single segment falls, if the traffic mix shifted toward higher-intent visitors.",
    problem: {
      options: [P.simpsons, P.truncated, P.wrongType, P.honest],
      answer: 0,
      explain: "More paid-search traffic, say, lifts the blended rate even if the checkout got worse for everyone. You can't see that here.",
    },
    followup: {
      options: [
        "Conversion split by traffic source and device, same months",
        "A longer history of the overall rate",
        "The raw visit counts under the line",
        "The same data as bars",
      ],
      answer: 0,
      explain: "You need the segments. If each one improved too, the claim holds. If the mix moved, it doesn't.",
    },
  },
  {
    title: "Campaign performance",
    chart: "line-smooth",
    series: [
      { label: "Camp 1", value: 40 }, { label: "Camp 2", value: 52 },
      { label: "Camp 3", value: 61 }, { label: "Camp 4", value: 73 },
    ],
    yStart: 0,
    caption: "Response rate for the last four campaigns, drawn as one smooth curve.",
    claim: "Each campaign beats the last. We've found a formula.",
    verdict: "misleading",
    verdictExplain: "Four separate campaigns are not a continuous process, and four points is not a formula.",
    problem: {
      options: [P.wrongType, P.truncated, P.noDenominator, P.honest],
      answer: 0,
      explain: "A smooth line implies each campaign flows into the next. They're discrete tries. Draw them as bars and the 'trend' is just four numbers.",
    },
    followup: {
      options: [
        "Run several more campaigns and compare them as bars, looking at the spread",
        "Add a trendline to the existing four points",
        "Colour the highest bar green",
        "Switch to a pie of the four rates",
      ],
      answer: 0,
      explain: "You need more tries and an honest look at the variation before calling four rising numbers a formula.",
    },
  },
];
