/* ============================================================================
   DA // LEARNING OS  —  Curriculum graph (FROZEN CONTRACT)
   ----------------------------------------------------------------------------
   Single source of truth for the constellation map, the node drawer, the
   textbook cross-links, the onboarding diagnostic, and the spaced-repetition
   review queue. Everything reads from here.

   A curriculum is a directed graph: nodes are skills, edges are prerequisites.
   Node state (locked / available / active / completed / needs-review) is
   DERIVED from progress + this graph by lib/graph.ts — never stored as truth
   anywhere else.

   STATUS: topics fully defined. Sub-nodes fully defined for SQL (reference
   track) and GIT (new track). Other topics carry `plannedSubNodes` from the
   PRD; they get positioned + wired in Phase 1 step 11 following the SQL mold.
   ========================================================================== */

export type NodeState =
  | "locked"
  | "available"
  | "active"
  | "completed"
  | "needs-review";

export type Cluster = "foundations" | "analysis" | "output";

export interface SubNode {
  id: string;
  label: string;
  /** short course code shown on the map ("XL 04"); full label lives in the drawer */
  code?: string;
  /** ids of sub-nodes (within the same topic) that must be completed first */
  prerequisites: string[];
  /** textbook chapter slugs this sub-node maps to (content/textbook/<topic>/<slug>.md) */
  chapters: string[];
  estHours: number;
  /** svg position within the sub-constellation canvas */
  pos: { x: number; y: number; r: number };
}

/** topic id -> code prefix for its sub-nodes */
export const TOPIC_CODE: Record<string, string> = {
  excel: "XL",
  sql: "SQL",
  python: "PY",
  statistics: "STAT",
  "data-cleaning": "CLN",
  visualization: "VIZ",
  "power-bi": "PBI",
  git: "GIT",
  storytelling: "STORY",
  portfolio: "PORT",
  "data-collection": "GET",
  "ai-assisted-analysis": "AI",
  "ml-foundations": "ML",
  "big-data": "BIG",
};

export interface TopicNode {
  id: string;
  label: string;
  blurb: string;
  cluster: Cluster;
  /** ids of other topics that must be completed first (soft-gate: shows a hint, never hard-blocks) */
  prerequisites: string[];
  /** svg position on the level-1 map */
  pos: { x: number; y: number; r: number };
  /** the topic book in the Textbook window, if any */
  book?: string;
  subNodes: SubNode[];
  /** PRD sub-node list, pending positioning + prereq wiring */
  plannedSubNodes?: string[];
  special?: "textbooks";
}

/* ----------------------------------------------------------------------------
   SQL — the reference track. Fully wired.
   PRD section 6.3 "SQL (deep track)" + section 6.1 two-level structure.
   Clusters within SQL: core -> relationships -> advanced -> performance
   -------------------------------------------------------------------------- */
const SQL_SUBNODES: SubNode[] = [
  // --- core ---------------------------------------------------------------
  { id: "db-basics", label: "What databases are", prerequisites: [], chapters: ["01-what-is-a-database"], estHours: 1, pos: { x: 60, y: 300, r: 12 } },
  { id: "select-from", label: "SELECT and FROM", prerequisites: ["db-basics"], chapters: ["02-select-and-from"], estHours: 1.5, pos: { x: 120, y: 250, r: 12 } },
  { id: "where", label: "WHERE and filtering", prerequisites: ["select-from"], chapters: ["03-where-and-filtering"], estHours: 2, pos: { x: 180, y: 300, r: 12 } },
  { id: "order-limit", label: "ORDER BY and LIMIT", prerequisites: ["where"], chapters: ["04-order-by-and-limit"], estHours: 1, pos: { x: 240, y: 250, r: 11 } },
  { id: "aggregates", label: "Aggregate functions", prerequisites: ["where"], chapters: ["05-aggregate-functions"], estHours: 2, pos: { x: 240, y: 355, r: 12 } },
  { id: "group-having", label: "GROUP BY and HAVING", prerequisites: ["aggregates"], chapters: ["06-group-by-and-having"], estHours: 2.5, pos: { x: 310, y: 300, r: 13 } },
  { id: "distinct-alias", label: "DISTINCT and aliases", prerequisites: ["select-from"], chapters: ["07-distinct-and-aliases"], estHours: 1, pos: { x: 180, y: 400, r: 10 } },
  // --- relationships -----------------------------------------------------
  { id: "joins", label: "JOINs (INNER, LEFT, RIGHT, FULL)", prerequisites: ["group-having", "distinct-alias"], chapters: ["08-joins"], estHours: 4, pos: { x: 390, y: 250, r: 14 } },
  { id: "union", label: "UNION and UNION ALL", prerequisites: ["joins"], chapters: ["09-union"], estHours: 1.5, pos: { x: 450, y: 320, r: 10 } },
  // --- advanced querying ------------------------------------------------
  { id: "subqueries", label: "Subqueries", prerequisites: ["joins"], chapters: ["10-subqueries"], estHours: 3, pos: { x: 470, y: 210, r: 12 } },
  { id: "ctes", label: "CTEs (WITH)", prerequisites: ["subqueries"], chapters: ["11-ctes"], estHours: 2.5, pos: { x: 540, y: 170, r: 12 } },
  { id: "window-ranking", label: "Window functions: ROW_NUMBER, RANK, DENSE_RANK", prerequisites: ["ctes"], chapters: ["12-window-ranking"], estHours: 3, pos: { x: 610, y: 200, r: 12 } },
  { id: "window-offset", label: "Window functions: LAG, LEAD, FIRST_VALUE", prerequisites: ["window-ranking"], chapters: ["13-window-offset"], estHours: 2.5, pos: { x: 660, y: 250, r: 11 } },
  { id: "window-agg", label: "Window functions: SUM OVER, AVG OVER, PARTITION BY", prerequisites: ["window-ranking"], chapters: ["14-window-aggregate"], estHours: 2.5, pos: { x: 680, y: 160, r: 11 } },
  { id: "string-fns", label: "String functions", prerequisites: ["group-having"], chapters: ["15-string-functions"], estHours: 1.5, pos: { x: 400, y: 400, r: 10 } },
  { id: "date-fns", label: "Date and time functions", prerequisites: ["group-having"], chapters: ["16-date-functions"], estHours: 2, pos: { x: 470, y: 420, r: 10 } },
  { id: "case", label: "CASE statements", prerequisites: ["group-having"], chapters: ["17-case-statements"], estHours: 1.5, pos: { x: 340, y: 420, r: 10 } },
  { id: "nulls", label: "NULL handling (IS NULL, COALESCE, NULLIF)", prerequisites: ["case"], chapters: ["18-null-handling"], estHours: 1.5, pos: { x: 400, y: 480, r: 10 } },
  // --- performance and patterns ---------------------------------------
  { id: "data-types", label: "Data types and casting", prerequisites: ["nulls"], chapters: ["19-data-types-and-casting"], estHours: 1.5, pos: { x: 560, y: 380, r: 10 } },
  { id: "indexes", label: "Indexes and query performance", prerequisites: ["data-types"], chapters: ["20-indexes-and-performance"], estHours: 2, pos: { x: 640, y: 350, r: 11 } },
  { id: "temp-views", label: "Temporary tables and views", prerequisites: ["ctes"], chapters: ["21-temp-tables-and-views"], estHours: 2, pos: { x: 620, y: 300, r: 10 } },
  { id: "stored-procs", label: "Stored procedures (awareness)", prerequisites: ["temp-views"], chapters: ["22-stored-procedures"], estHours: 1, pos: { x: 700, y: 320, r: 9 } },
  { id: "real-world-patterns", label: "Real-world query patterns (cohort, retention, funnels)", prerequisites: ["window-offset", "window-agg", "date-fns"], chapters: ["23-real-world-patterns"], estHours: 5, pos: { x: 760, y: 230, r: 13 } },
  { id: "sql-reporting", label: "SQL for reporting", prerequisites: ["real-world-patterns"], chapters: ["24-sql-for-reporting"], estHours: 3, pos: { x: 810, y: 280, r: 11 } },
  { id: "clean-sql", label: "Writing clean readable SQL (formatting standards)", prerequisites: ["joins"], chapters: ["25-clean-readable-sql"], estHours: 1, pos: { x: 520, y: 470, r: 10 } },
  { id: "query-plans", label: "Reading query plans (EXPLAIN)", prerequisites: ["indexes"], chapters: ["26-reading-query-plans"], estHours: 2, pos: { x: 710, y: 400, r: 10 } },
];

/* ----------------------------------------------------------------------------
   GIT & VERSION CONTROL — NEW track (user request).
   Built to the same depth as SQL. Pairs with the Toolkit window: the
   "install Git" sub-node deep-links to the Toolkit entry with OS steps and
   the common-problems list.
   -------------------------------------------------------------------------- */
const GIT_SUBNODES: SubNode[] = [
  { id: "why-version-control", label: "Why version control exists", prerequisites: [], chapters: ["01-why-version-control"], estHours: 0.75, pos: { x: 70, y: 280, r: 12 } },
  { id: "install-git", label: "Installing Git and first-run config", prerequisites: ["why-version-control"], chapters: ["02-installing-and-configuring-git"], estHours: 1, pos: { x: 140, y: 240, r: 12 } },
  { id: "repo-init-clone", label: "Repositories: init and clone", prerequisites: ["install-git"], chapters: ["03-repositories"], estHours: 1, pos: { x: 210, y: 290, r: 12 } },
  { id: "staging-area", label: "The staging area (git add)", prerequisites: ["repo-init-clone"], chapters: ["04-the-staging-area"], estHours: 1, pos: { x: 280, y: 250, r: 11 } },
  { id: "commits", label: "Commits and commit messages", prerequisites: ["staging-area"], chapters: ["05-commits"], estHours: 1.25, pos: { x: 350, y: 300, r: 13 } },
  { id: "status-log-diff", label: "Inspecting history: status, log, diff", prerequisites: ["commits"], chapters: ["06-status-log-diff"], estHours: 1, pos: { x: 420, y: 260, r: 11 } },
  { id: "gitignore", label: ".gitignore and what not to commit", prerequisites: ["commits"], chapters: ["07-gitignore-and-secrets"], estHours: 1, pos: { x: 350, y: 380, r: 11 } },
  { id: "branches", label: "Branches", prerequisites: ["status-log-diff"], chapters: ["08-branches"], estHours: 1.5, pos: { x: 500, y: 300, r: 13 } },
  { id: "merging", label: "Merging", prerequisites: ["branches"], chapters: ["09-merging"], estHours: 1.5, pos: { x: 560, y: 260, r: 12 } },
  { id: "merge-conflicts", label: "Resolving merge conflicts", prerequisites: ["merging"], chapters: ["10-merge-conflicts"], estHours: 2, pos: { x: 620, y: 300, r: 12 } },
  { id: "remotes", label: "Remotes and GitHub", prerequisites: ["branches"], chapters: ["11-remotes-and-github"], estHours: 1.5, pos: { x: 560, y: 370, r: 12 } },
  { id: "push-pull-fetch", label: "push, pull, fetch", prerequisites: ["remotes"], chapters: ["12-push-pull-fetch"], estHours: 1.5, pos: { x: 640, y: 400, r: 11 } },
  { id: "pull-requests", label: "Pull requests and review", prerequisites: ["push-pull-fetch", "merge-conflicts"], chapters: ["13-pull-requests"], estHours: 1.5, pos: { x: 710, y: 350, r: 11 } },
  { id: "undoing-things", label: "Undoing things: checkout, restore, reset, revert", prerequisites: ["status-log-diff"], chapters: ["14-undoing-things"], estHours: 2, pos: { x: 470, y: 420, r: 12 } },
  { id: "git-for-analysts", label: "Git for analysts: versioning SQL, notebooks, never data", prerequisites: ["gitignore", "pull-requests", "undoing-things"], chapters: ["15-git-for-analysts"], estHours: 1.5, pos: { x: 640, y: 470, r: 12 } },
];

/* ----------------------------------------------------------------------------
   EXCEL & SPREADSHEETS — hand-wired to the same depth as SQL and Git.
   Book: content/textbook/excel/*.md
   -------------------------------------------------------------------------- */
const EXCEL_SUBNODES: SubNode[] = [
  { id: "navigation", label: "Navigation and keyboard shortcuts", prerequisites: [], chapters: ["01-navigation-and-shortcuts"], estHours: 1, pos: { x: 80, y: 300, r: 12 } },
  { id: "cell-referencing", label: "Cell referencing: relative, absolute, mixed", prerequisites: ["navigation"], chapters: ["02-cell-referencing"], estHours: 1.5, pos: { x: 150, y: 250, r: 12 } },
  { id: "formulas-functions", label: "Formulas and functions (SUM, IF, VLOOKUP, INDEX-MATCH)", prerequisites: ["cell-referencing"], chapters: ["03-formulas-and-functions"], estHours: 3, pos: { x: 240, y: 300, r: 14 } },
  { id: "named-ranges", label: "Named ranges", prerequisites: ["cell-referencing"], chapters: ["04-named-ranges"], estHours: 1, pos: { x: 190, y: 400, r: 10 } },
  { id: "pivot-tables", label: "Pivot tables", prerequisites: ["formulas-functions"], chapters: ["05-pivot-tables"], estHours: 2.5, pos: { x: 350, y: 255, r: 14 } },
  { id: "data-validation", label: "Data validation", prerequisites: ["formulas-functions"], chapters: ["06-data-validation"], estHours: 1, pos: { x: 350, y: 375, r: 10 } },
  { id: "conditional-formatting", label: "Conditional formatting", prerequisites: ["formulas-functions"], chapters: ["07-conditional-formatting"], estHours: 1, pos: { x: 420, y: 320, r: 10 } },
  { id: "cleaning-in-excel", label: "Data cleaning in Excel", prerequisites: ["formulas-functions", "pivot-tables"], chapters: ["08-data-cleaning-in-excel"], estHours: 2.5, pos: { x: 470, y: 410, r: 13 } },
  { id: "excel-charts", label: "Charts: bar, line, scatter, combo", prerequisites: ["pivot-tables"], chapters: ["09-charts"], estHours: 2, pos: { x: 480, y: 240, r: 12 } },
  { id: "power-query-load", label: "Power Query: get and transform data", prerequisites: ["cleaning-in-excel"], chapters: ["10-power-query-get-and-transform"], estHours: 3, pos: { x: 580, y: 335, r: 13 } },
  { id: "power-query-m", label: "Power Query (M): custom columns, parameters, reusable queries", prerequisites: ["power-query-load"], chapters: ["11-power-query-m"], estHours: 3, pos: { x: 670, y: 300, r: 12 } },
  { id: "vba-intro", label: "VBA: the editor, recording and running macros", prerequisites: ["formulas-functions"], chapters: ["12-vba-editor-and-macros"], estHours: 2, pos: { x: 640, y: 440, r: 11 } },
  { id: "vba-automation", label: "VBA: variables, loops, and a small automation", prerequisites: ["vba-intro"], chapters: ["13-vba-automation"], estHours: 3, pos: { x: 730, y: 400, r: 12 } },
];

/* ----------------------------------------------------------------------------
   PYTHON FOR ANALYSTS — hand-wired. Book: content/textbook/python/*.md
   -------------------------------------------------------------------------- */
const PYTHON_SUBNODES: SubNode[] = [
  { id: "why-python", label: "Why Python for data", prerequisites: [], chapters: ["01-why-python"], estHours: 0.75, pos: { x: 80, y: 300, r: 12 } },
  { id: "py-setup", label: "Setting up: Jupyter and VS Code", prerequisites: ["why-python"], chapters: ["02-setup"], estHours: 1, pos: { x: 150, y: 250, r: 11 } },
  { id: "py-types", label: "Variables and data types", prerequisites: ["py-setup"], chapters: ["03-variables-and-types"], estHours: 1.5, pos: { x: 220, y: 300, r: 12 } },
  { id: "py-collections", label: "Lists, tuples, dictionaries", prerequisites: ["py-types"], chapters: ["04-collections"], estHours: 2, pos: { x: 290, y: 250, r: 12 } },
  { id: "py-control-flow", label: "Control flow: if, for, while", prerequisites: ["py-collections"], chapters: ["05-control-flow"], estHours: 2, pos: { x: 240, y: 380, r: 12 } },
  { id: "py-functions", label: "Functions and scope", prerequisites: ["py-control-flow"], chapters: ["06-functions"], estHours: 2, pos: { x: 340, y: 340, r: 12 } },
  { id: "py-libraries", label: "Importing libraries and NumPy basics", prerequisites: ["py-functions"], chapters: ["07-libraries-and-numpy"], estHours: 2, pos: { x: 400, y: 290, r: 12 } },
  { id: "pd-load", label: "Pandas: loading CSVs and Excel files", prerequisites: ["py-libraries"], chapters: ["08-pandas-loading"], estHours: 1.5, pos: { x: 470, y: 320, r: 13 } },
  { id: "pd-explore", label: "Pandas: exploring data (head, info, describe)", prerequisites: ["pd-load"], chapters: ["09-pandas-exploring"], estHours: 1.5, pos: { x: 470, y: 240, r: 12 } },
  { id: "pd-filter", label: "Pandas: selecting and filtering", prerequisites: ["pd-explore"], chapters: ["10-pandas-selecting-filtering"], estHours: 2.5, pos: { x: 540, y: 290, r: 13 } },
  { id: "pd-groupby", label: "Pandas: groupby and aggregation", prerequisites: ["pd-filter"], chapters: ["11-pandas-groupby"], estHours: 2.5, pos: { x: 610, y: 260, r: 13 } },
  { id: "pd-merge", label: "Pandas: merging and joining", prerequisites: ["pd-filter"], chapters: ["12-pandas-merging"], estHours: 2, pos: { x: 600, y: 350, r: 12 } },
  { id: "pd-clean", label: "Pandas: cleaning data", prerequisites: ["pd-groupby", "pd-merge"], chapters: ["13-pandas-cleaning"], estHours: 3, pos: { x: 670, y: 320, r: 13 } },
  { id: "py-plotting", label: "Plotting: Matplotlib, Seaborn, Plotly", prerequisites: ["pd-groupby"], chapters: ["14-plotting"], estHours: 3, pos: { x: 690, y: 230, r: 12 } },
  { id: "py-project", label: "Writing output and structuring an end-to-end project", prerequisites: ["pd-clean", "py-plotting"], chapters: ["15-project-structure"], estHours: 2, pos: { x: 750, y: 300, r: 12 } },
];

const STATS_SUBNODES: SubNode[] = [
  { id: "data-types", label: "Types of data: nominal, ordinal, interval, ratio", prerequisites: [], chapters: ["01-types-of-data"], estHours: 1, pos: { x: 80, y: 300, r: 12 } },
  { id: "central-tendency", label: "Measures of central tendency (mean, median, mode)", prerequisites: ["data-types"], chapters: ["02-central-tendency"], estHours: 1.5, pos: { x: 160, y: 240, r: 12 } },
  { id: "spread", label: "Measures of spread (variance, standard deviation, IQR)", prerequisites: ["central-tendency"], chapters: ["03-measures-of-spread"], estHours: 2, pos: { x: 240, y: 290, r: 13 } },
  { id: "distributions", label: "Distributions: normal, skewed, uniform", prerequisites: ["spread"], chapters: ["04-distributions"], estHours: 2, pos: { x: 330, y: 240, r: 13 } },
  { id: "probability-basics", label: "Probability basics", prerequisites: ["data-types"], chapters: ["05-probability-basics"], estHours: 1.5, pos: { x: 150, y: 410, r: 12 } },
  { id: "conditional-probability", label: "Conditional probability", prerequisites: ["probability-basics"], chapters: ["06-conditional-probability"], estHours: 2, pos: { x: 260, y: 440, r: 12 } },
  { id: "sampling", label: "Sampling and sampling bias", prerequisites: ["distributions", "probability-basics"], chapters: ["07-sampling-and-bias"], estHours: 2, pos: { x: 400, y: 350, r: 13 } },
  { id: "hypothesis-testing", label: "Hypothesis testing: what it is and why", prerequisites: ["sampling", "conditional-probability"], chapters: ["08-hypothesis-testing"], estHours: 2.5, pos: { x: 480, y: 400, r: 14 } },
  { id: "t-tests", label: "T-tests", prerequisites: ["hypothesis-testing"], chapters: ["09-t-tests"], estHours: 2, pos: { x: 580, y: 360, r: 12 } },
  { id: "chi-square", label: "Chi-square tests", prerequisites: ["hypothesis-testing"], chapters: ["10-chi-square-tests"], estHours: 2, pos: { x: 570, y: 460, r: 12 } },
  { id: "correlation-causation", label: "Correlation vs causation", prerequisites: ["distributions"], chapters: ["11-correlation-vs-causation"], estHours: 1.5, pos: { x: 440, y: 230, r: 13 } },
  { id: "regression", label: "Regression basics (linear)", prerequisites: ["correlation-causation", "spread"], chapters: ["12-linear-regression"], estHours: 3, pos: { x: 550, y: 250, r: 13 } },
  { id: "p-values", label: "Interpreting p-values", prerequisites: ["hypothesis-testing"], chapters: ["13-interpreting-p-values"], estHours: 1.5, pos: { x: 640, y: 410, r: 12 } },
  { id: "confidence-intervals", label: "Confidence intervals", prerequisites: ["sampling", "spread"], chapters: ["14-confidence-intervals"], estHours: 2, pos: { x: 540, y: 310, r: 12 } },
  { id: "ab-testing", label: "A/B testing fundamentals", prerequisites: ["t-tests", "p-values", "confidence-intervals"], chapters: ["15-ab-testing"], estHours: 2.5, pos: { x: 710, y: 360, r: 13 } },
];

const DATA_CLEANING_SUBNODES: SubNode[] = [
  { id: "dirty-data", label: "What dirty data looks like", prerequisites: [], chapters: ["01-what-dirty-data-looks-like"], estHours: 1, pos: { x: 90, y: 300, r: 12 } },
  { id: "finding-nulls", label: "Identifying missing values", prerequisites: ["dirty-data"], chapters: ["02-identifying-missing-values"], estHours: 1.5, pos: { x: 180, y: 250, r: 12 } },
  { id: "handling-nulls", label: "Strategies for handling nulls", prerequisites: ["finding-nulls"], chapters: ["03-handling-nulls"], estHours: 2, pos: { x: 270, y: 300, r: 13 } },
  { id: "duplicates", label: "Duplicate detection and removal", prerequisites: ["dirty-data"], chapters: ["04-duplicates"], estHours: 1.5, pos: { x: 200, y: 400, r: 12 } },
  { id: "standardizing", label: "Standardizing formats: dates, strings, numbers", prerequisites: ["dirty-data"], chapters: ["05-standardizing-formats"], estHours: 2.5, pos: { x: 360, y: 360, r: 13 } },
  { id: "type-correction", label: "Data type correction", prerequisites: ["standardizing"], chapters: ["06-data-type-correction"], estHours: 1.5, pos: { x: 440, y: 300, r: 12 } },
  { id: "outliers", label: "Outlier detection", prerequisites: ["handling-nulls", "type-correction"], chapters: ["07-outlier-detection"], estHours: 2, pos: { x: 520, y: 350, r: 13 } },
  { id: "validation-rules", label: "Validation rules", prerequisites: ["outliers"], chapters: ["08-validation-rules"], estHours: 2, pos: { x: 600, y: 300, r: 12 } },
  { id: "documenting-cleaning", label: "Documenting cleaning decisions", prerequisites: ["validation-rules"], chapters: ["09-documenting-decisions"], estHours: 1, pos: { x: 650, y: 400, r: 11 } },
  { id: "cleaning-pipelines", label: "Reproducible cleaning pipelines", prerequisites: ["documenting-cleaning"], chapters: ["10-reproducible-pipelines"], estHours: 2.5, pos: { x: 730, y: 340, r: 13 } },
];

const VIZ_SUBNODES: SubNode[] = [
  { id: "chart-choice", label: "Choosing the right chart type", prerequisites: [], chapters: ["01-choosing-the-right-chart"], estHours: 1.5, pos: { x: 90, y: 300, r: 13 } },
  { id: "visual-hierarchy", label: "Principles of visual hierarchy", prerequisites: ["chart-choice"], chapters: ["02-visual-hierarchy"], estHours: 1.5, pos: { x: 180, y: 240, r: 12 } },
  { id: "color-in-charts", label: "Color use in charts", prerequisites: ["visual-hierarchy"], chapters: ["03-color-in-charts"], estHours: 1.5, pos: { x: 270, y: 290, r: 12 } },
  { id: "misleading-charts", label: "Avoiding misleading charts", prerequisites: ["chart-choice"], chapters: ["04-avoiding-misleading-charts"], estHours: 2, pos: { x: 200, y: 400, r: 13 } },
  { id: "bar-charts", label: "Bar charts done right", prerequisites: ["visual-hierarchy"], chapters: ["05-bar-charts"], estHours: 1.5, pos: { x: 360, y: 250, r: 12 } },
  { id: "line-charts", label: "Line charts done right", prerequisites: ["visual-hierarchy"], chapters: ["06-line-charts"], estHours: 1.5, pos: { x: 350, y: 360, r: 12 } },
  { id: "scatter-plots", label: "Scatter plots and correlation", prerequisites: ["bar-charts", "line-charts"], chapters: ["07-scatter-plots"], estHours: 1.5, pos: { x: 460, y: 300, r: 12 } },
  { id: "heatmaps", label: "Heatmaps for data", prerequisites: ["color-in-charts"], chapters: ["08-heatmaps"], estHours: 1.5, pos: { x: 470, y: 420, r: 11 } },
  { id: "tables-as-viz", label: "Tables as visualization", prerequisites: ["visual-hierarchy"], chapters: ["09-tables-as-visualization"], estHours: 1.5, pos: { x: 540, y: 380, r: 12 } },
  { id: "annotations", label: "Annotations and callouts", prerequisites: ["scatter-plots"], chapters: ["10-annotations-and-callouts"], estHours: 1, pos: { x: 560, y: 270, r: 12 } },
  { id: "dashboard-layout", label: "Dashboard layout principles", prerequisites: ["annotations", "tables-as-viz"], chapters: ["11-dashboard-layout"], estHours: 2, pos: { x: 650, y: 330, r: 13 } },
  { id: "chart-accessibility", label: "Accessibility in charts", prerequisites: ["color-in-charts", "annotations"], chapters: ["12-accessibility"], estHours: 1.5, pos: { x: 700, y: 250, r: 12 } },
];

const POWERBI_SUBNODES: SubNode[] = [
  { id: "pbi-interface", label: "Power BI interface orientation", prerequisites: [], chapters: ["01-interface-orientation"], estHours: 1, pos: { x: 80, y: 300, r: 12 } },
  { id: "pbi-connect", label: "Connecting to data sources", prerequisites: ["pbi-interface"], chapters: ["02-connecting-to-data"], estHours: 1.5, pos: { x: 150, y: 240, r: 12 } },
  { id: "pbi-pq-shape", label: "Power Query (M): shaping data in the query editor", prerequisites: ["pbi-connect"], chapters: ["03-power-query-shaping"], estHours: 3, pos: { x: 230, y: 290, r: 13 } },
  { id: "pbi-pq-advanced", label: "Power Query (M): custom columns, parameters, and reuse", prerequisites: ["pbi-pq-shape"], chapters: ["04-power-query-advanced"], estHours: 3, pos: { x: 300, y: 360, r: 12 } },
  { id: "pbi-model", label: "Data model basics: tables, relationships, star schema", prerequisites: ["pbi-pq-shape"], chapters: ["05-data-model"], estHours: 3, pos: { x: 350, y: 250, r: 14 } },
  { id: "pbi-context", label: "DAX: row context vs filter context (the core idea)", prerequisites: ["pbi-model"], chapters: ["06-dax-context"], estHours: 3, pos: { x: 440, y: 300, r: 14 } },
  { id: "pbi-dax-basics", label: "DAX basics: calculated columns, measures", prerequisites: ["pbi-context"], chapters: ["07-dax-basics"], estHours: 2.5, pos: { x: 500, y: 240, r: 13 } },
  { id: "pbi-dax-intermediate", label: "DAX intermediate: CALCULATE, FILTER, ALL", prerequisites: ["pbi-dax-basics"], chapters: ["08-dax-intermediate"], estHours: 3, pos: { x: 560, y: 300, r: 13 } },
  { id: "pbi-dax-advanced", label: "DAX advanced: variables, iterators (SUMX), time intelligence", prerequisites: ["pbi-dax-intermediate"], chapters: ["09-dax-advanced"], estHours: 3.5, pos: { x: 630, y: 250, r: 13 } },
  { id: "pbi-visuals", label: "Building visuals in Power BI", prerequisites: ["pbi-dax-basics"], chapters: ["10-building-visuals"], estHours: 2, pos: { x: 470, y: 400, r: 12 } },
  { id: "pbi-slicers", label: "Slicers and filters", prerequisites: ["pbi-visuals"], chapters: ["11-slicers-and-filters"], estHours: 1.5, pos: { x: 550, y: 430, r: 11 } },
  { id: "pbi-drillthrough", label: "Drill-through and report navigation", prerequisites: ["pbi-slicers"], chapters: ["12-drill-through-and-navigation"], estHours: 1.5, pos: { x: 630, y: 390, r: 11 } },
  { id: "pbi-publish", label: "Publishing and sharing", prerequisites: ["pbi-visuals"], chapters: ["13-publishing-and-sharing"], estHours: 1.5, pos: { x: 700, y: 330, r: 12 } },
  { id: "pbi-design", label: "Dashboard design principles", prerequisites: ["pbi-drillthrough", "pbi-publish"], chapters: ["14-dashboard-design"], estHours: 2, pos: { x: 730, y: 260, r: 13 } },
];

const STORYTELLING_SUBNODES: SubNode[] = [
  { id: "audience", label: "Who is your audience", prerequisites: [], chapters: ["01-who-is-your-audience"], estHours: 1, pos: { x: 90, y: 300, r: 12 } },
  { id: "one-insight", label: "What is the one insight", prerequisites: ["audience"], chapters: ["02-the-one-insight"], estHours: 1, pos: { x: 180, y: 250, r: 12 } },
  { id: "narrative-structure", label: "Structuring a data narrative", prerequisites: ["one-insight"], chapters: ["03-structuring-a-narrative"], estHours: 2, pos: { x: 270, y: 300, r: 13 } },
  { id: "slide-design", label: "Slide design for data", prerequisites: ["narrative-structure"], chapters: ["04-slide-design"], estHours: 2, pos: { x: 360, y: 250, r: 12 } },
  { id: "exec-summary", label: "Executive summary writing", prerequisites: ["one-insight"], chapters: ["05-executive-summary"], estHours: 1.5, pos: { x: 260, y: 410, r: 12 } },
  { id: "what-not-to-show", label: "Choosing what NOT to show", prerequisites: ["narrative-structure"], chapters: ["06-what-not-to-show"], estHours: 1, pos: { x: 400, y: 360, r: 12 } },
  { id: "story-annotation", label: "Annotation and context", prerequisites: ["slide-design"], chapters: ["07-annotation-and-context"], estHours: 1.5, pos: { x: 470, y: 290, r: 12 } },
  { id: "presenting-uncertainty", label: "Presenting uncertainty", prerequisites: ["what-not-to-show", "exec-summary"], chapters: ["08-presenting-uncertainty"], estHours: 2, pos: { x: 500, y: 400, r: 13 } },
  { id: "chart-rewrites", label: "Before and after: chart rewrites", prerequisites: ["story-annotation"], chapters: ["09-chart-rewrites"], estHours: 2, pos: { x: 580, y: 320, r: 12 } },
  { id: "presentation-deconstruction", label: "Case study: real presentation deconstruction", prerequisites: ["chart-rewrites", "presenting-uncertainty"], chapters: ["10-presentation-deconstruction"], estHours: 2, pos: { x: 670, y: 350, r: 13 } },
];

/* ----------------------------------------------------------------------------
   LEVEL 1 — topic nodes
   Positions adapted from docs/DA Learning OS.dc.html (cNodes array).
   Clusters: FOUNDATIONS (bottom-left) / ANALYSIS (center) / OUTPUT (top-right)
   -------------------------------------------------------------------------- */
export const TOPICS: TopicNode[] = [
  {
    id: "excel",
    label: "Excel and Spreadsheets",
    blurb: "Where every analyst starts and where half the work still happens.",
    cluster: "foundations",
    prerequisites: [],
    pos: { x: 130, y: 440, r: 21 },
    book: "excel-mastery",
    subNodes: EXCEL_SUBNODES,
  },
  {
    id: "sql",
    label: "SQL",
    blurb: "The deep track. Drilled, revisited, and embedded everywhere else.",
    cluster: "foundations",
    prerequisites: ["excel"],
    pos: { x: 270, y: 390, r: 22 },
    book: "sql-the-complete-playbook",
    subNodes: SQL_SUBNODES,
  },
  {
    id: "python",
    label: "Python",
    blurb: "When the spreadsheet runs out of room.",
    cluster: "foundations",
    prerequisites: ["sql"],
    pos: { x: 190, y: 310, r: 18 },
    book: "python-for-analysts",
    subNodes: PYTHON_SUBNODES,
  },
  {
    id: "statistics",
    label: "Statistics and Probability",
    blurb: "The difference between a number and an insight.",
    cluster: "foundations",
    prerequisites: ["python"],
    pos: { x: 90, y: 270, r: 19 },
    book: "statistics-without-fear",
    subNodes: STATS_SUBNODES,
  },
  {
    id: "data-cleaning",
    label: "Data Cleaning",
    blurb: "The 80 percent of the job nobody puts on a slide.",
    cluster: "analysis",
    prerequisites: ["sql"],
    pos: { x: 430, y: 320, r: 16 },
    book: "the-cleaning-playbook",
    subNodes: DATA_CLEANING_SUBNODES,
  },
  {
    id: "visualization",
    label: "Data Visualization",
    blurb: "Make the chart the argument, not the decoration.",
    cluster: "analysis",
    prerequisites: ["data-cleaning"],
    pos: { x: 520, y: 250, r: 15 },
    book: "data-visualization-field-manual",
    subNodes: VIZ_SUBNODES,
  },
  {
    id: "power-bi",
    label: "Power BI and Dashboards",
    blurb: "From one-off analysis to something a team refreshes every Monday.",
    cluster: "analysis",
    prerequisites: ["visualization"],
    pos: { x: 460, y: 180, r: 14 },
    book: "power-bi-from-scratch",
    subNodes: POWERBI_SUBNODES,
  },
  {
    id: "git",
    label: "Git and Version Control",
    blurb: "How analysts keep their work, share it, and prove they did it.",
    cluster: "output",
    prerequisites: ["python"],
    pos: { x: 400, y: 120, r: 15 },
    book: "git-for-analysts",
    subNodes: GIT_SUBNODES,
  },
  {
    id: "storytelling",
    label: "Storytelling with Data",
    blurb: "The analysis is worthless if the room does not act on it.",
    cluster: "output",
    prerequisites: ["visualization"],
    pos: { x: 670, y: 160, r: 13 },
    book: "storytelling-with-data",
    subNodes: STORYTELLING_SUBNODES,
  },
  {
    id: "data-collection",
    label: "Getting the Data",
    blurb: "It is not always a clean CSV waiting for you.",
    cluster: "foundations",
    prerequisites: ["sql"],
    pos: { x: 130, y: 200, r: 13 },
    subNodes: [],
    plannedSubNodes: [
      "Where data lives (files, databases, apps, the web)",
      "CSV, TSV, JSON, Parquet, and when each shows up",
      "Reading from a database vs an export",
      "Calling a REST API: endpoints, params, keys, pagination",
      "Rate limits and being a good API citizen",
      "Web scraping basics (HTML, selectors, ethics, robots.txt)",
      "When scraping is the wrong answer",
      "Combining sources into one clean table",
      "Documenting where a dataset came from",
    ],
  },
  {
    id: "ai-assisted-analysis",
    label: "Working with AI",
    blurb: "An LLM is a fast, confident junior analyst. Supervise it.",
    cluster: "analysis",
    prerequisites: ["sql", "data-cleaning"],
    pos: { x: 500, y: 380, r: 13 },
    subNodes: [],
    plannedSubNodes: [
      "What an LLM is good and bad at for data work",
      "Drafting SQL and pandas with an assistant, then verifying it",
      "Explaining an error message or a query plan",
      "Summarising findings and writing the first draft of a report",
      "Prompt patterns: give it the schema, the goal, the constraints",
      "Catching confident nonsense (hallucinated columns, wrong joins)",
      "Never paste secrets or personal data into a chatbox",
      "Where the human judgement has to stay: the question, the caveat, the decision",
    ],
  },
  {
    id: "ml-foundations",
    label: "Machine Learning: the map",
    blurb: "Enough to talk to a data scientist and know when a model is the answer.",
    cluster: "analysis",
    prerequisites: ["statistics", "python"],
    pos: { x: 560, y: 440, r: 13 },
    subNodes: [],
    plannedSubNodes: [
      "Supervised vs unsupervised vs reinforcement, in plain words",
      "Regression vs classification vs clustering",
      "Train / validation / test and why you split",
      "Overfitting and underfitting",
      "Common algorithms: linear/logistic regression, decision trees, k-means, KNN",
      "Model evaluation: accuracy, precision, recall, F1, ROC-AUC, and when each lies",
      "Feature engineering, briefly",
      "When NOT to reach for ML (a GROUP BY often wins)",
      "Handing a problem to a data scientist: what to bring",
    ],
  },
  {
    id: "big-data",
    label: "Big Data: awareness",
    blurb: "When the data does not fit on one machine.",
    cluster: "analysis",
    prerequisites: ["sql"],
    pos: { x: 620, y: 400, r: 11 },
    subNodes: [],
    plannedSubNodes: [
      "What 'big data' actually means (and when it does not apply to you)",
      "Distributed storage and processing, conceptually",
      "Hadoop and MapReduce, in one paragraph each",
      "Spark and why it replaced most MapReduce",
      "Data warehouses vs data lakes vs lakehouses",
      "Cloud warehouses you will meet: BigQuery, Snowflake, Redshift",
      "Partitioning and why your query scanned 2 TB",
      "The analyst's job in a big-data shop",
    ],
  },
  {
    id: "textbooks",
    label: "Textbooks",
    blurb: "The connective tissue. The DA Field Guide and the topic books.",
    cluster: "output",
    prerequisites: [],
    pos: { x: 730, y: 100, r: 12 },
    special: "textbooks",
    subNodes: [],
  },
  {
    id: "portfolio",
    label: "Portfolio and Capstone",
    blurb: "The thing you actually show an employer.",
    cluster: "output",
    prerequisites: ["git", "storytelling"],
    pos: { x: 770, y: 150, r: 13 },
    subNodes: [],
    plannedSubNodes: [
      "What makes a strong DA portfolio",
      "Project structure and documentation",
      "Writing a case study in plain English",
      "GitHub for analysts",
      "Building a portfolio site (optional)",
      "Capstone project brief",
      "Submission and self-review",
      "Peer review framework",
    ],
  },
];

export const TOPICS_BY_ID: Record<string, TopicNode> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
);

/** Level-1 connection edges for the map (prerequisite -> topic). */
export const TOPIC_EDGES: Array<{ from: string; to: string }> = TOPICS.flatMap(
  (t) => t.prerequisites.map((p) => ({ from: p, to: t.id })),
);
