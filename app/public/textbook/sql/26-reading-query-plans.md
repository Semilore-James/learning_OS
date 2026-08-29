# Reading query plans (EXPLAIN)

## The one-sentence version

`EXPLAIN` shows the step-by-step strategy the database chose to run your query, and `EXPLAIN ANALYZE` runs it and shows what actually happened, so you can find the one slow step instead of guessing.

## What it is

```sql
EXPLAIN ANALYZE
SELECT c.name, SUM(o.total)
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE c.region = 'EU'
GROUP BY c.name;
```

The output is a tree of operations, read from the most indented (runs first) outward. Each node says what it does, how many rows it expected, and with `ANALYZE`, how many it got and how long it took.

## Why it exists

"The query is slow" is not actionable. A plan turns it into "the join is doing a sequential scan of 40 million order rows because there is no index on `customer_id`". You cannot fix performance you cannot see, and the plan is how you see it.

## How it works

**Read inside-out.** The deepest node runs first, feeding its parent, up to the top.

**Scan types, best to worst for a selective query:**

- `Index Scan` / `Index Only Scan` — jumped straight to the rows via an index. Good.
- `Bitmap Heap Scan` — used an index to find many rows, then fetched them in bulk. Fine for medium selectivity.
- `Seq Scan` (sequential scan) — read the entire table. Correct when you need most of the table; a red flag when you filtered to a few rows.

**Join types:**

- `Nested Loop` — for each row on one side, look up matches on the other. Fast when one side is tiny, catastrophic when both are large.
- `Hash Join` — build a hash table of one side, probe with the other. Good for two big unindexed sets.
- `Merge Join` — both sides sorted, walked together. Good when inputs are already sorted.

**The numbers that matter:**

- `rows=` estimated versus `actual rows=`. A big gap (estimated 100, actual 2,000,000) means the planner's statistics are stale (`ANALYZE tablename` to refresh) and it may have picked a bad plan because of it.
- `actual time=` on each node. Find the node with the largest share of total time. That is your target.
- `Rows Removed by Filter` — the query read a lot and threw most away. An index on the filter column would skip that work.

**What you do about it:**

- `Seq Scan` + small result → add or use an index on the filter/join column.
- `Nested Loop` over two big tables → usually fixed by an index that makes the inner lookup cheap, or the planner switches to `Hash Join` once stats are fresh.
- Huge `Sort` node → an index in the sort order, or accept it.
- Estimate wildly off → run `ANALYZE` on the table, re-check.

On cloud warehouses the command varies (`EXPLAIN` in BigQuery's UI, `EXPLAIN` / query profile in Snowflake) but the questions are the same: what is scanning the most data, and why.

## When you use it

Any query slower than a second that you will run more than once. Before adding an index, to confirm it is needed. After adding one, to confirm it is used. When two queries that look equivalent perform very differently.

## A worked example

A case query is slow. `EXPLAIN ANALYZE` shows:

```
HashAggregate (actual time=4200ms)
  -> Hash Join (actual time=3900ms)
       -> Seq Scan on orders  (actual rows=40000000, Rows Removed by Filter: 39960000)
       -> Hash
            -> Seq Scan on customers (actual rows=5000)
```

The `orders` seq scan reads 40M rows to keep 40K. The fix is an index on `orders.created_at` (or whatever the filter is). Re-run the plan afterward and the bottom node should read `Index Scan on orders` with `actual rows` near 40,000 and the total time in tens of milliseconds.

> **Try This**
> Load any large case dataset into Postgres. Run a filtered aggregate, `EXPLAIN ANALYZE` it, note the scan type and time. Add an index on the filter column, run the plan again, and read the difference. That before/after is a strong portfolio note.
