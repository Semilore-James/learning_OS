# UNION and UNION ALL

## The one-sentence version

`UNION` stacks the rows of two query results on top of each other, where a join puts columns side by side.

## What it is

A join is horizontal: more columns. A union is vertical: more rows. You use it when you have two sets of rows that mean the same thing but live in different places or come from different queries.

```sql
SELECT name, email FROM current_customers
UNION
SELECT name, email FROM archived_customers;
```

One combined list. Both `SELECT`s must return the same number of columns, in the same order, with compatible types. The column names come from the first query.

## Why it exists

Real systems split data that is conceptually one thing: current and archived records, this year's table and last year's table, events from the web app and events from the mobile app. When you need them as one dataset, `UNION` is the join-free way to combine them.

It is also useful for building a small result by hand:

```sql
SELECT 'Q1' AS quarter, 120000 AS target
UNION ALL SELECT 'Q2', 135000
UNION ALL SELECT 'Q3', 140000
UNION ALL SELECT 'Q4', 160000;
```

A four-row targets table with no table.

## How it works

There are two versions and the difference is about duplicates:

- **UNION** removes duplicate rows across the whole combined result. If the same `(name, email)` appears in both tables, you get it once.
- **UNION ALL** keeps everything, duplicates included.

`UNION ALL` is faster, because `UNION` has to sort and de-duplicate. Use `UNION ALL` unless you specifically need duplicates gone, and even then, think about whether a duplicate means you have a data problem to look at rather than hide.

`ORDER BY` goes at the very end and applies to the whole result, not to each piece:

```sql
SELECT name, 'active' AS status FROM current_customers
UNION ALL
SELECT name, 'archived' FROM archived_customers
ORDER BY name;
```

## When you use it

Combining "the same kind of row" from multiple sources. Stacking a per-category summary with a "Total" row. Occasionally, unpivoting: turning `jan, feb, mar` columns into `month, value` rows by unioning three small selects.

## A worked example

"A single activity feed of everything that happened to an account: signups, orders, and support tickets, newest first." Three tables, three different shapes, but you want one timeline.

```sql
SELECT account_id, created_at AS ts, 'signup'  AS event FROM accounts
UNION ALL
SELECT account_id, order_date  AS ts, 'order'   AS event FROM orders
UNION ALL
SELECT account_id, opened_at   AS ts, 'ticket'  AS event FROM support_tickets
ORDER BY account_id, ts DESC;
```

Each `SELECT` reshapes its table into the same three columns — account, timestamp, event type — and `UNION ALL` stacks them into one feed.

> **Try This**
> SQL Dojo has a UNION step. There is no dedicated case, but Case 12 (EdTech) can use `UNION ALL` to compare pre-update and post-update completion side by side.
