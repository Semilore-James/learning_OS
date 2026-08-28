# WHERE and filtering

## The one-sentence version

`WHERE` keeps only the rows that pass a test, so you get "customers in Lagos" instead of "all customers".

## What it is

`WHERE` sits between `FROM` and any sorting, and it takes a condition. The database checks the condition against every row and keeps the rows where the condition is true.

```sql
SELECT name, city, signup_date
FROM customers
WHERE city = 'Lagos';
```

The condition here is `city = 'Lagos'`. Text values go in single quotes. A row for a customer in Abuja fails the test and is dropped from the result.

## Why it exists

Analysis is almost always about a subset: this month, this region, this product line, the accounts over a certain size. Without `WHERE` you would pull the whole table and filter it later in a spreadsheet or in code, which is slow and wasteful. `WHERE` filters at the source, so only the rows you care about ever leave the database.

## How it works

The comparison operators are what you expect: `=`, `<>` (not equal), `<`, `<=`, `>`, `>=`.

You combine conditions with `AND` and `OR`. `AND` means both must be true; `OR` means at least one. Use brackets when you mix them, because the database applies `AND` before `OR` and that is easy to get wrong:

```sql
-- customers in Lagos OR Abuja who signed up this year
SELECT name, city
FROM customers
WHERE (city = 'Lagos' OR city = 'Abuja')
  AND signup_date >= '2026-01-01';
```

Some conditions have their own keywords because they come up so often:

```sql
WHERE age BETWEEN 25 AND 34            -- inclusive on both ends
WHERE city IN ('Lagos', 'Abuja', 'Kano')   -- shorter than three ORs
WHERE name LIKE 'A%'                   -- name starts with A (% is "any characters")
WHERE deleted_at IS NULL              -- the row has no deletion date
```

That last one matters. A missing value in SQL is `NULL`, and it is not equal to anything, not even to itself. `WHERE deleted_at = NULL` returns nothing, ever. You must write `IS NULL` or `IS NOT NULL`.

## When you use it

Any time the answer is about part of the data, which is most of the time. The habit to build: before you write the query, say the filter out loud in plain words ("orders, from March, over 100 dollars, not refunded"), then translate each phrase into one condition.

## A worked example

The support team asks: "how many open tickets are older than 7 days?" The `tickets` table has `id`, `status`, `created_at`, `closed_at`, `priority`.

"Open" means `status = 'open'`. "Older than 7 days" means the created date is more than 7 days ago.

```sql
SELECT COUNT(*) AS stale_open_tickets
FROM tickets
WHERE status = 'open'
  AND created_at < CURRENT_DATE - INTERVAL '7 days';
```

Two conditions, joined with `AND`, each a direct translation of one phrase from the question.

> **Try This**
> Case 04 (Customer Order Analysis) opens with a filtering question. Start it and write the `WHERE` clause for the first deliverable.
