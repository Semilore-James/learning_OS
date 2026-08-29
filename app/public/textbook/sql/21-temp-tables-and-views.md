# Temporary tables and views

## The one-sentence version

A view is a saved query you can select from by name, and a temporary table is a real table that holds results for the length of your session, so both let you name an intermediate step and reuse it across multiple queries.

## What it is

A **view**:

```sql
CREATE VIEW active_customers AS
SELECT id, name, region
FROM customers
WHERE status = 'active';
```

From then on `SELECT * FROM active_customers` runs that query. The view stores no data; it is a name for the query.

A **temporary table**:

```sql
CREATE TEMP TABLE monthly_rev AS
SELECT date_trunc('month', created_at) AS month, SUM(total) AS revenue
FROM orders
GROUP BY 1;
```

This one runs the query now and stores the rows. It disappears when your session ends. Other users cannot see it.

## Why it exists

A CTE lives and dies inside one statement. When you have an intermediate result you need in **three** different queries during an analysis, retyping the CTE each time is error-prone. A view (if you can create one) or a temp table (always available to you) gives that result a stable name.

They also serve different audiences. A view is often built by a data engineer to give analysts a clean, pre-joined, pre-filtered starting point so nobody has to know the raw schema. A temp table is a private scratchpad for one person's session.

## How it works

**View**

- Always reflects the current data. Query it today and next week, you get today's and next week's rows.
- Re-runs its query every time you select from it. A view over a slow query is still slow.
- A **materialized view** (`CREATE MATERIALIZED VIEW`) does store the results and must be refreshed (`REFRESH MATERIALIZED VIEW`). Fast to read, but stale until refreshed. Good for an expensive aggregate that feeds a dashboard.
- Dropping or changing underlying columns can break a view.

**Temporary table**

- Holds a snapshot. If the source data changes after you create it, your temp table does not.
- Session-scoped: gone on disconnect, invisible to others, no name clashes with permanent tables.
- You can index a temp table, which is worth doing if you join it repeatedly.
- Needs `CREATE TEMP TABLE` privilege, which most analytical accounts have even when they cannot create permanent objects.

**Which to reach for**

- One statement, one use: CTE.
- Reused across a session, data can be frozen, you want speed: temp table.
- Reused by many people or over time, must stay live: view (or materialized view if it is expensive).

## When you use it

Breaking a 200-line analysis into named stages. Freezing a snapshot so your numbers do not shift mid-analysis. Building a clean layer over an ugly schema. Precomputing an expensive aggregate once and joining to it many times.

## A worked example

An analysis needs "revenue per customer" in four different queries: top customers, revenue distribution, revenue by region, and churn value.

```sql
CREATE TEMP TABLE customer_rev AS
SELECT
  c.id, c.region,
  COALESCE(SUM(o.total), 0) AS revenue,
  COUNT(o.id)               AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.region;

CREATE INDEX ON customer_rev (region);

-- now all four queries just read from customer_rev
SELECT * FROM customer_rev ORDER BY revenue DESC LIMIT 20;
SELECT region, AVG(revenue) FROM customer_rev GROUP BY region;
```

The expensive join and aggregation runs once. Every follow-up query is fast and reads from a stable, consistent snapshot.

> **Try This**
> Take any case where you wrote the same CTE two or three times. Rebuild it as a temp table at the top of your working file, add an index, and see how much shorter the rest of your queries get.
