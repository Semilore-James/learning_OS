/* ============================================================================
   Textbook structure. Prose lives in the sibling .md files; this maps books ->
   chapters, their order, the curriculum node each chapter backs, and the
   "Try This" link at the end of the chapter. The DA // Field Guide is the
   master book that ties the topic books together.

   A chapter file lives at public/textbook/<slug>.md and is fetched as a static
   asset, so authors only ever touch markdown and it deploys anywhere.
   ========================================================================== */

export interface Chapter {
  slug: string; // e.g. "sql/02-select-and-from"
  title: string;
  /** curriculum sub-node id this chapter backs */
  nodeId?: string;
  /** end-of-chapter prompt: opens a case or a game */
  tryThis?: { label: string; target: string };
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  chapters: Chapter[];
}

export const BOOKS: Book[] = [
  {
    id: "field-guide",
    title: "The DA // Field Guide",
    subtitle: "The master book. How the pieces fit.",
    chapters: [
      { slug: "field-guide/01-what-a-data-analyst-actually-does", title: "What a data analyst actually does" },
      { slug: "field-guide/02-the-shape-of-a-question", title: "The shape of a question" },
    ],
  },
  {
    id: "sql",
    title: "SQL: The Complete Playbook",
    subtitle: "Drilled, revisited, embedded everywhere.",
    chapters: [
      { slug: "sql/01-what-is-a-database", title: "What a database is, and why", nodeId: "db-basics" },
      { slug: "sql/02-select-and-from", title: "SELECT and FROM", nodeId: "select-from", tryThis: { label: "SQL Dojo, level 1", target: "games" } },
      { slug: "sql/03-where-and-filtering", title: "WHERE and filtering", nodeId: "where" },
      { slug: "sql/04-order-by-and-limit", title: "ORDER BY and LIMIT", nodeId: "order-limit", tryThis: { label: "SQL Dojo, levels 5-6", target: "games" } },
      { slug: "sql/05-aggregate-functions", title: "Aggregate functions", nodeId: "aggregates" },
      { slug: "sql/06-group-by-and-having", title: "GROUP BY and HAVING", nodeId: "group-having", tryThis: { label: "Case 04: Customer Order Analysis", target: "casefiles" } },
      { slug: "sql/07-distinct-and-aliases", title: "DISTINCT and aliases", nodeId: "distinct-alias" },
      { slug: "sql/08-joins", title: "JOINs", nodeId: "joins", tryThis: { label: "SQL Dojo, levels 9-12", target: "games" } },
      { slug: "sql/09-union", title: "UNION and UNION ALL", nodeId: "union" },
      { slug: "sql/10-subqueries", title: "Subqueries", nodeId: "subqueries", tryThis: { label: "Case 05: Fintech Churn", target: "casefiles" } },
      { slug: "sql/11-ctes", title: "CTEs (WITH)", nodeId: "ctes" },
      { slug: "sql/12-window-ranking", title: "Window functions: ROW_NUMBER, RANK, DENSE_RANK", nodeId: "window-ranking", tryThis: { label: "Case 15: SaaS Cohort Retention", target: "casefiles" } },
      { slug: "sql/13-window-offset", title: "Window functions: LAG, LEAD, FIRST_VALUE", nodeId: "window-offset" },
      { slug: "sql/14-window-aggregate", title: "Window functions: SUM OVER, AVG OVER, PARTITION BY", nodeId: "window-agg" },
      { slug: "sql/15-string-functions", title: "String functions", nodeId: "string-fns" },
      { slug: "sql/16-date-functions", title: "Date and time functions", nodeId: "date-fns", tryThis: { label: "Case 09: Subscription Revenue", target: "casefiles" } },
      { slug: "sql/17-case-statements", title: "CASE statements", nodeId: "case" },
      { slug: "sql/18-null-handling", title: "NULL handling (IS NULL, COALESCE, NULLIF)", nodeId: "nulls" },
      { slug: "sql/19-data-types-and-casting", title: "Data types and casting", nodeId: "data-types" },
      { slug: "sql/20-indexes-and-performance", title: "Indexes and query performance", nodeId: "indexes" },
      { slug: "sql/21-temp-tables-and-views", title: "Temporary tables and views", nodeId: "temp-views" },
      { slug: "sql/22-stored-procedures", title: "Stored procedures (awareness)", nodeId: "stored-procs" },
      { slug: "sql/23-real-world-patterns", title: "Real-world query patterns (cohort, retention, funnels)", nodeId: "real-world-patterns", tryThis: { label: "Case 15: SaaS Cohort Retention", target: "casefiles" } },
      { slug: "sql/24-sql-for-reporting", title: "SQL for reporting", nodeId: "sql-reporting" },
      { slug: "sql/25-clean-readable-sql", title: "Writing clean, readable SQL", nodeId: "clean-sql" },
      { slug: "sql/26-reading-query-plans", title: "Reading query plans (EXPLAIN)", nodeId: "query-plans" },
    ],
  },
  {
    id: "git-for-analysts",
    title: "Git for Analysts",
    subtitle: "Keep your work. Share it. Prove you did it.",
    chapters: [
      { slug: "git/01-why-version-control", title: "Why version control exists", nodeId: "why-version-control" },
      { slug: "git/02-installing-and-configuring-git", title: "Installing and configuring Git", nodeId: "install-git" },
      { slug: "git/03-repositories", title: "Repositories: init and clone", nodeId: "repo-init-clone" },
      { slug: "git/04-the-staging-area", title: "The staging area (git add)", nodeId: "staging-area" },
      { slug: "git/05-commits", title: "Commits and commit messages", nodeId: "commits" },
      { slug: "git/06-status-log-diff", title: "Inspecting history: status, log, diff", nodeId: "status-log-diff" },
      { slug: "git/07-gitignore-and-secrets", title: ".gitignore and what not to commit", nodeId: "gitignore" },
      { slug: "git/08-branches", title: "Branches", nodeId: "branches" },
      { slug: "git/09-merging", title: "Merging", nodeId: "merging" },
      { slug: "git/10-merge-conflicts", title: "Resolving merge conflicts", nodeId: "merge-conflicts" },
      { slug: "git/11-remotes-and-github", title: "Remotes and GitHub", nodeId: "remotes" },
      { slug: "git/12-push-pull-fetch", title: "push, pull, fetch", nodeId: "push-pull-fetch" },
      { slug: "git/13-pull-requests", title: "Pull requests and review", nodeId: "pull-requests" },
      { slug: "git/14-undoing-things", title: "Undoing things", nodeId: "undoing-things" },
      { slug: "git/15-git-for-analysts", title: "Git for analysts: versioning SQL, never data", nodeId: "git-for-analysts" },
    ],
  },
  {
    id: "excel-mastery",
    title: "Excel and Spreadsheets",
    subtitle: "Where every analyst starts, and where half the work still happens.",
    chapters: [
      { slug: "excel/01-navigation-and-shortcuts", title: "Navigation and keyboard shortcuts", nodeId: "navigation" },
      { slug: "excel/02-cell-referencing", title: "Cell referencing: relative, absolute, mixed", nodeId: "cell-referencing" },
      { slug: "excel/03-formulas-and-functions", title: "Formulas and functions", nodeId: "formulas-functions", tryThis: { label: "Case 01: Retail Sales Audit", target: "casefiles" } },
      { slug: "excel/04-named-ranges", title: "Named ranges", nodeId: "named-ranges" },
      { slug: "excel/05-pivot-tables", title: "Pivot tables", nodeId: "pivot-tables", tryThis: { label: "Pivot Puzzle", target: "games" } },
      { slug: "excel/06-data-validation", title: "Data validation", nodeId: "data-validation" },
      { slug: "excel/07-conditional-formatting", title: "Conditional formatting", nodeId: "conditional-formatting" },
      { slug: "excel/08-data-cleaning-in-excel", title: "Data cleaning in Excel", nodeId: "cleaning-in-excel", tryThis: { label: "Case 03: Restaurant Revenue by Location", target: "casefiles" } },
      { slug: "excel/09-charts", title: "Charts: bar, line, scatter, combo", nodeId: "excel-charts", tryThis: { label: "Chart Critiquer", target: "games" } },
      { slug: "excel/10-power-query-get-and-transform", title: "Power Query: get and transform data", nodeId: "power-query-load" },
      { slug: "excel/11-power-query-m", title: "Power Query (M): custom columns, parameters, reusable queries", nodeId: "power-query-m" },
      { slug: "excel/12-vba-editor-and-macros", title: "VBA: the editor, recording and running macros", nodeId: "vba-intro" },
      { slug: "excel/13-vba-automation", title: "VBA: variables, loops, and a small automation", nodeId: "vba-automation" },
    ],
  },
  {
    id: "python-for-analysts",
    title: "Python for Analysts",
    subtitle: "When the spreadsheet runs out of room.",
    chapters: [
      { slug: "python/01-why-python", title: "Why Python for data", nodeId: "why-python" },
      { slug: "python/02-setup", title: "Setting up: Jupyter and VS Code", nodeId: "py-setup" },
      { slug: "python/03-variables-and-types", title: "Variables and data types", nodeId: "py-types" },
      { slug: "python/04-collections", title: "Lists, tuples, dictionaries", nodeId: "py-collections" },
      { slug: "python/05-control-flow", title: "Control flow: if, for, while", nodeId: "py-control-flow" },
      { slug: "python/06-functions", title: "Functions and scope", nodeId: "py-functions" },
      { slug: "python/07-libraries-and-numpy", title: "Importing libraries and NumPy basics", nodeId: "py-libraries" },
      { slug: "python/08-pandas-loading", title: "Pandas: loading CSVs and Excel files", nodeId: "pd-load" },
      { slug: "python/09-pandas-exploring", title: "Pandas: exploring data", nodeId: "pd-explore" },
      { slug: "python/10-pandas-selecting-filtering", title: "Pandas: selecting and filtering", nodeId: "pd-filter", tryThis: { label: "Case 05: Fintech Churn", target: "casefiles" } },
      { slug: "python/11-pandas-groupby", title: "Pandas: groupby and aggregation", nodeId: "pd-groupby" },
      { slug: "python/12-pandas-merging", title: "Pandas: merging and joining", nodeId: "pd-merge" },
      { slug: "python/13-pandas-cleaning", title: "Pandas: cleaning data", nodeId: "pd-clean" },
      { slug: "python/14-plotting", title: "Plotting: Matplotlib, Seaborn, Plotly", nodeId: "py-plotting", tryThis: { label: "Chart Critiquer", target: "games" } },
      { slug: "python/15-project-structure", title: "Writing output and structuring an end-to-end project", nodeId: "py-project" },
    ],
  },
  {
    id: "statistics-without-fear",
    title: "Statistics Without Fear",
    subtitle: "The difference between a number and an insight.",
    chapters: [
      { slug: "statistics/01-types-of-data", title: "Types of data: nominal, ordinal, interval, ratio", nodeId: "data-types" },
      { slug: "statistics/02-central-tendency", title: "Measures of central tendency", nodeId: "central-tendency" },
      { slug: "statistics/03-measures-of-spread", title: "Measures of spread", nodeId: "spread" },
      { slug: "statistics/04-distributions", title: "Distributions: normal, skewed, uniform", nodeId: "distributions", tryThis: { label: "Data Detective", target: "games" } },
      { slug: "statistics/05-probability-basics", title: "Probability basics", nodeId: "probability-basics" },
      { slug: "statistics/06-conditional-probability", title: "Conditional probability", nodeId: "conditional-probability" },
      { slug: "statistics/07-sampling-and-bias", title: "Sampling and sampling bias", nodeId: "sampling" },
      { slug: "statistics/08-hypothesis-testing", title: "Hypothesis testing: what it is and why", nodeId: "hypothesis-testing" },
      { slug: "statistics/09-t-tests", title: "T-tests", nodeId: "t-tests" },
      { slug: "statistics/10-chi-square-tests", title: "Chi-square tests", nodeId: "chi-square" },
      { slug: "statistics/11-correlation-vs-causation", title: "Correlation vs causation", nodeId: "correlation-causation", tryThis: { label: "Chart Critiquer", target: "games" } },
      { slug: "statistics/12-linear-regression", title: "Regression basics (linear)", nodeId: "regression" },
      { slug: "statistics/13-interpreting-p-values", title: "Interpreting p-values", nodeId: "p-values" },
      { slug: "statistics/14-confidence-intervals", title: "Confidence intervals", nodeId: "confidence-intervals" },
      { slug: "statistics/15-ab-testing", title: "A/B testing fundamentals", nodeId: "ab-testing" },
    ],
  },
  {
    id: "the-cleaning-playbook",
    title: "The Cleaning Playbook",
    subtitle: "The 80 percent of the job nobody puts on a slide.",
    chapters: [
      { slug: "data-cleaning/01-what-dirty-data-looks-like", title: "What dirty data looks like", nodeId: "dirty-data" },
      { slug: "data-cleaning/02-identifying-missing-values", title: "Identifying missing values", nodeId: "finding-nulls" },
      { slug: "data-cleaning/03-handling-nulls", title: "Strategies for handling nulls", nodeId: "handling-nulls" },
      { slug: "data-cleaning/04-duplicates", title: "Duplicate detection and removal", nodeId: "duplicates", tryThis: { label: "Data Detective", target: "games" } },
      { slug: "data-cleaning/05-standardizing-formats", title: "Standardizing formats: dates, strings, numbers", nodeId: "standardizing" },
      { slug: "data-cleaning/06-data-type-correction", title: "Data type correction", nodeId: "type-correction" },
      { slug: "data-cleaning/07-outlier-detection", title: "Outlier detection", nodeId: "outliers", tryThis: { label: "Data Detective", target: "games" } },
      { slug: "data-cleaning/08-validation-rules", title: "Validation rules", nodeId: "validation-rules" },
      { slug: "data-cleaning/09-documenting-decisions", title: "Documenting cleaning decisions", nodeId: "documenting-cleaning" },
      { slug: "data-cleaning/10-reproducible-pipelines", title: "Reproducible cleaning pipelines", nodeId: "cleaning-pipelines", tryThis: { label: "Case 01: Retail Sales Audit", target: "casefiles" } },
    ],
  },
];

export const BOOKS_BY_ID: Record<string, Book> = Object.fromEntries(BOOKS.map((b) => [b.id, b]));

export const ALL_CHAPTERS: Chapter[] = BOOKS.flatMap((b) => b.chapters);

export function chapterBySlug(slug: string): { book: Book; chapter: Chapter } | null {
  for (const book of BOOKS) {
    const chapter = book.chapters.find((c) => c.slug === slug || c.slug.endsWith(`/${slug}`) || c.nodeId === slug);
    if (chapter) return { book, chapter };
  }
  return null;
}
