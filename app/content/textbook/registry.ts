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
    ],
  },
  {
    id: "git-for-analysts",
    title: "Git for Analysts",
    subtitle: "Keep your work. Share it. Prove you did it.",
    chapters: [
      { slug: "git/01-why-version-control", title: "Why version control exists", nodeId: "why-version-control" },
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
