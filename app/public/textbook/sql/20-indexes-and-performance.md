# Indexes and query performance

## The one-sentence version

An index is a sorted lookup structure the database keeps alongside a table so it can jump straight to the rows you asked for instead of scanning every row, and knowing when one helps is most of query performance.

## What it is

Think of a book index. Without it, finding every mention of "revenue" means reading all 400 pages. With it, you flip to the index, find the page numbers, go straight there. A database index on `customer_id` does the same for `WHERE customer_id = 4821`.

```sql
CREATE INDEX idx_orders_customer ON orders (customer_id);
```

## Why it exists

Tables grow. A query that scans 10,000 rows in a millisecond scans 50 million rows in seconds, and a dashboard that runs it every page load falls over. Indexes turn a full scan into a targeted lookup, often a thousand times less work. As an analyst you rarely create them in production, but you constantly write queries whose speed depends on which indexes exist.

## How it works

**What an index speeds up:**

- Equality and range filters: `WHERE status = 'open'`, `WHERE created_at >= '2026-01-01'`.
- Joins: an index on the join key of the larger table.
- `ORDER BY` / `GROUP BY` on the indexed column, sometimes (the data is already sorted).
- `MIN` / `MAX` on an indexed column (jump to one end).

**What defeats an index:**

- Wrapping the column in a function: `WHERE LOWER(email) = '...'` cannot use a plain index on `email`. Index the expression, or store the column already-lowercased.
- Leading wildcard: `WHERE name LIKE '%smith'` scans; `LIKE 'smith%'` can use an index.
- A filter that matches most of the table. If 90% of rows qualify, scanning is actually faster, and the planner will choose to.
- Type mismatch: `WHERE id = '4821'` when `id` is an integer may skip the index.

**Composite indexes** cover multiple columns in order: `(customer_id, created_at)`. That helps `WHERE customer_id = X AND created_at > Y`, and `WHERE customer_id = X` alone, but not `WHERE created_at > Y` alone. Left-to-right, like a phone book sorted by last name then first name.

**The cost:** every index makes `INSERT`, `UPDATE`, and `DELETE` slower, because the index has to be maintained too, and it takes disk space. That is why tables are not just indexed on every column.

## When you use it (as an analyst)

Mostly as a diagnosis. A query is slow, you look at what it filters and joins on, you check whether those columns are indexed (`\d tablename` in psql, or the information schema), and either add one in your own analytical database or rewrite the query to hit an index that already exists. On a warehouse (BigQuery, Snowflake) there are no indexes in the classic sense; the equivalent levers are partitioning and clustering, same idea, different name.

## A worked example

A dashboard query filters `orders` by `store_id` and a date range and is slow:

```sql
SELECT date_trunc('day', created_at) AS day, SUM(total)
FROM orders
WHERE store_id = 12
  AND created_at >= '2026-01-01' AND created_at < '2026-02-01'
GROUP BY 1;
```

`orders` has 40 million rows and no useful index. Adding:

```sql
CREATE INDEX idx_orders_store_created ON orders (store_id, created_at);
```

lets the database jump to store 12's rows, then within those to the January slice, reading maybe 30,000 rows instead of 40 million. The `date_trunc` in the `SELECT` does not matter; it runs on the small result, not the whole table.

> **Try This**
> The next chapter (Reading query plans) shows how to confirm an index is actually being used. For now, in any case dataset you have loaded, run a filtered query, then `EXPLAIN` it, and look for the words "Seq Scan" versus "Index Scan".
