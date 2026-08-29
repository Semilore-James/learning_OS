# ORDER BY and LIMIT

## The one-sentence version

`ORDER BY` sorts the result, `LIMIT` cuts it to the top few rows, and together they answer every "what are the biggest / most recent / worst N" question.

## What it is

`ORDER BY` comes after `WHERE` and names one or more columns to sort by. `LIMIT` comes last and takes a number: how many rows to keep.

```sql
SELECT name, signup_date
FROM customers
ORDER BY signup_date DESC
LIMIT 5;
```

This gives the five most recently signed-up customers. `DESC` means descending (largest or latest first); `ASC` means ascending and is the default, so you can leave it off when you want smallest-first.

## Why it exists

A raw query result comes back in whatever order the database finds convenient, which is effectively random and can change between runs. If the order matters to your answer, you have to state it. And most questions with a ranking in them ("top 10 products", "the 3 slowest queries", "our newest accounts") only care about the first few rows, so `LIMIT` saves you scrolling through thousands.

## How it works

You can sort by more than one column. The database sorts by the first, then breaks ties with the second, and so on:

```sql
ORDER BY city ASC, signup_date DESC
```

Customers grouped by city alphabetically, and within each city, newest first.

You can sort by a column you did not select, and by a computed value:

```sql
SELECT name, price
FROM products
ORDER BY price * 0.9 DESC;   -- sort by the discounted price
```

`LIMIT` with an `OFFSET` skips rows before it starts counting, which is how pagination works: `LIMIT 20 OFFSET 40` is "rows 41 to 60".

One trap: `LIMIT` without `ORDER BY` gives you *some* 5 rows, not a meaningful 5. Always pair them when the "top" actually means something.

## When you use it

Any ranking question. Any "most recent" question. Any time you want a quick sample of a big table (`LIMIT 10` while you explore). Any time you are about to eyeball a result and want it in a sensible order.

## A worked example

The finance team asks: "which three months last year had the highest revenue?" You already have a `monthly_revenue` table with `month` and `revenue`.

```sql
SELECT month, revenue
FROM monthly_revenue
WHERE month >= '2025-01-01' AND month < '2026-01-01'
ORDER BY revenue DESC
LIMIT 3;
```

`WHERE` narrows to last year, `ORDER BY revenue DESC` puts the biggest month first, `LIMIT 3` keeps the top three. The question translated almost word for word.

> **Try This**
> Open SQL Dojo. Levels 5 and 6 are pure ORDER BY and LIMIT. Clear both.
