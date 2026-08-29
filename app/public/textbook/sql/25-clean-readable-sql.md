# Writing clean, readable SQL

## The one-sentence version

SQL is read far more often than it is written, usually by someone trying to trust its numbers, so consistent formatting and named steps are not cosmetic, they are how a reviewer verifies the query is correct.

## What it is

A set of conventions for laying out a query: keyword casing, indentation, where line breaks go, how you name things, and how you break a big query into parts.

## Why it exists

When a number looks wrong, someone opens the query. If it is one 40-line block with no structure, they cannot tell what it does, so they either rewrite it or trust it blindly. Both are bad. A well-formatted query with named CTEs can be checked step by step, and the person checking it can see your logic, not just your result.

## How it works

**Keywords and layout**

- Uppercase SQL keywords (`SELECT`, `FROM`, `WHERE`, `JOIN`), lowercase identifiers. The eye uses the contrast to find clause boundaries.
- One column per line in a long `SELECT`. Leading commas or trailing commas, pick one and hold it.
- Each `JOIN` on its own line with its `ON` right after it.
- `WHERE` conditions one per line, `AND` at the start of the line so you can see the list.

```sql
SELECT
  c.id,
  c.name,
  SUM(o.total) AS lifetime_spend,
  COUNT(o.id)  AS order_count
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.id
WHERE c.status = 'active'
  AND c.created_at >= '2025-01-01'
GROUP BY c.id, c.name
ORDER BY lifetime_spend DESC;
```

**Naming**

- Table aliases that mean something: `customers AS c`, not `x`. Two-letter is fine if it maps to the table.
- Result columns named for what they are: `lifetime_spend`, not `sum`. Someone reads these in a spreadsheet later with no query attached.
- Snake_case throughout. Never rely on a column name needing quotes.

**Structure**

- Break anything with more than two logical steps into CTEs, one `WITH` block per step, named for what it produces (`monthly_revenue`, `ranked_customers`).
- Each CTE should do one thing. If you cannot name it in two words, it is doing two things.
- The final `SELECT` should be short: it reads from the CTEs and applies the last filter or sort.

**Comments**

- Comment the *why*, not the *what*. `-- exclude test accounts, see DATA-412` is useful. `-- select the name` is noise.
- A one-line comment at the top saying what the query answers and who asked.

**Consistency beats any single rule.** A team style guide you dislike, applied everywhere, is better than your preferred style applied half the time. Many teams run an automatic formatter (sqlfluff, sql-formatter) so it stops being a discussion.

## When you use it

Always, but especially the moment a query will be seen by anyone else, saved to a repo, or pasted into a review. The exploratory scratch query in your terminal can be messy; the one you commit cannot.

## A worked example

Before:

```sql
select c.name,sum(o.total) t from customers c join orders o on o.customer_id=c.id where o.created_at>'2026-01-01' group by 1 having sum(o.total)>1000 order by 2 desc
```

After:

```sql
-- Customers with over $1k of revenue since Jan 2026. For the Q1 account review.
SELECT
  c.name,
  SUM(o.total) AS revenue_2026
FROM customers AS c
JOIN orders AS o
  ON o.customer_id = c.id
WHERE o.created_at >= '2026-01-01'
GROUP BY c.name
HAVING SUM(o.total) > 1000
ORDER BY revenue_2026 DESC;
```

Same result. The second one a reviewer can verify in ten seconds, and the column arrives in their spreadsheet already labelled.

> **Try This**
> Open your submission for any completed case, find the longest query, and reformat it to this standard: named CTEs, one column per line, meaningful aliases, a header comment. Diff the readability.
