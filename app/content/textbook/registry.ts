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
