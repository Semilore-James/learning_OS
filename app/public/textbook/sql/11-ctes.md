# CTEs (WITH)

## The one-sentence version

A CTE names a subquery and puts it at the top of the statement, so a complex query reads like a series of steps instead of a nest of brackets.

## What it is

CTE stands for Common Table Expression. You write `WITH some_name AS (...)` before your main `SELECT`, and then you can refer to `some_name` as if it were a table.

```sql
WITH per_customer AS (
  SELECT customer_id, SUM(total) AS lifetime_spend
  FROM orders
  GROUP BY customer_id
)
SELECT AVG(lifetime_spend) AS avg_ltv,
       MAX(lifetime_spend) AS top_ltv
FROM per_customer;
```

`per_customer` is defined once, at the top, and used below. The result is identical to writing it as a subquery in the `FROM` clause, but it reads better.

## Why it exists

A real analytical query often has three or four logical steps: reshape this table, join it to that one, aggregate, then rank. Nested subqueries force you to write those steps inside-out and read them the same way. CTEs let you write them top-down, in the order you think about them, each with a name that says what it is.

You can also chain them, and reference an earlier one from a later one:

```sql
WITH
monthly AS (
  SELECT date_trunc('month', order_date) AS month, SUM(total) AS revenue
  FROM orders GROUP BY 1
),
with_growth AS (
  SELECT month, revenue,
         revenue - LAG(revenue) OVER (ORDER BY month) AS mom_change
  FROM monthly
)
SELECT * FROM with_growth WHERE mom_change < 0;
```

Two named steps: roll up to months, then compute month-over-month change. The final `SELECT` just filters. Anyone reading this can follow it.

## How it works

The CTE list goes between `WITH` and the final statement. Each CTE is `name AS (query)`, separated by commas. The final statement is a normal `SELECT` (or `INSERT`, `UPDATE`, `DELETE`).

A CTE is not stored anywhere. It exists only for the duration of that one statement. If you need the same intermediate result in two different queries, a CTE will not help; that is what a view or a temporary table is for.

Performance: in most modern databases a CTE is optimized the same as an equivalent subquery, so use whichever is clearer. In a few older ones a CTE was an optimization barrier, so check your database if a CTE query is surprisingly slow.

CTEs can also be **recursive** (`WITH RECURSIVE`), which is how you walk a tree or a graph, like an org chart or a category hierarchy. That is an advanced topic; know the term exists.

## When you use it

Any query with more than one logical step. Any query you would have to explain to a colleague step by step. Any time you are three brackets deep in a subquery and losing track of which level you are on.

## A worked example

"For each region, what share of revenue comes from its single biggest customer?" Tables: `customers` (`id`, `region`), `orders` (`customer_id`, `total`).

```sql
WITH customer_rev AS (
  SELECT c.region, c.id AS customer_id, SUM(o.total) AS revenue
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, c.id
),
region_totals AS (
  SELECT region, SUM(revenue) AS region_revenue, MAX(revenue) AS top_customer_revenue
  FROM customer_rev
  GROUP BY region
)
SELECT region,
       ROUND(top_customer_revenue / region_revenue * 100, 1) AS top_customer_pct
FROM region_totals
ORDER BY top_customer_pct DESC;
```

Step one: revenue per customer, with their region attached. Step two: per region, the total and the single largest. Final: the percentage. Three readable stages.

> **Try This**
> SQL Dojo does not gate on CTEs, but rewrite an earlier subquery level using `WITH` and confirm the result matches. Then Case 15 (SaaS Cohort Retention) is much cleaner with CTEs.
