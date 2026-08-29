# String functions

## The one-sentence version

String functions clean, cut, join, and search text inside the query, so you can fix messy names and pull fields apart without exporting to a spreadsheet first.

## What it is

A set of built-in functions that take text in and give text (or a number, or a boolean) out.

```sql
SELECT
  TRIM(name)                       AS clean_name,
  UPPER(country_code)              AS country_code,
  LENGTH(email)                    AS email_len,
  LEFT(phone, 3)                   AS area_code,
  SPLIT_PART(email, '@', 2)        AS email_domain
FROM contacts;
```

## Why it exists

Real text data is dirty. Leading spaces, mixed case, `"john@ACME.com "` versus `"John@acme.com"`, full names in one column that you need split into first and last, category codes with inconsistent padding. String functions let you normalise all of that in the `SELECT` or `WHERE` so the rest of the query works on clean values.

## How it works

The common ones, grouped by what they do:

**Trim and case**

- `TRIM(s)` removes leading and trailing whitespace. `LTRIM` / `RTRIM` do one side.
- `LOWER(s)`, `UPPER(s)` change case. Lowercasing both sides of a comparison is the standard fix for case-mismatched joins.

**Length and substring**

- `LENGTH(s)` (some databases: `LEN`) returns character count.
- `LEFT(s, n)`, `RIGHT(s, n)` take from an end.
- `SUBSTRING(s FROM start FOR count)` (or `SUBSTR(s, start, count)`) takes from the middle. Positions are 1-based.

**Split and combine**

- `CONCAT(a, b, c)` or `a || b` joins strings. `CONCAT` treats `NULL` as empty; `||` often returns `NULL` if any part is `NULL`.
- `SPLIT_PART(s, delimiter, n)` returns the nth piece. `SPLIT_PART('a-b-c', '-', 2)` is `'b'`.

**Search and replace**

- `REPLACE(s, from, to)` swaps every occurrence.
- `POSITION(sub IN s)` / `STRPOS(s, sub)` returns the index of the first match, or 0.
- `s LIKE 'abc%'` matches a pattern: `%` is any run of characters, `_` is exactly one. `ILIKE` is case-insensitive (Postgres).

Function names vary by database more here than anywhere else in SQL. `LENGTH` vs `LEN`, `SUBSTRING` vs `SUBSTR`, `SPLIT_PART` (Postgres) vs `SPLIT` (BigQuery). Check your engine's docs; the concepts transfer.

## When you use it

Cleaning a column before grouping on it. Splitting a combined field. Building a display label. Filtering rows by a text pattern. Fixing a join that fails because one side is `"US"` and the other is `"us "`.

## A worked example

"Group signups by email domain, but the data has trailing spaces and mixed case." Table: `users` (`email`).

```sql
SELECT
  LOWER(SPLIT_PART(TRIM(email), '@', 2)) AS domain,
  COUNT(*)                               AS signups
FROM users
WHERE email LIKE '%@%'
GROUP BY LOWER(SPLIT_PART(TRIM(email), '@', 2))
ORDER BY signups DESC;
```

`TRIM` drops the spaces, `SPLIT_PART(..., '@', 2)` takes the part after the `@`, `LOWER` collapses `Gmail.com` and `gmail.com` into one group. The `WHERE email LIKE '%@%'` guards against rows with no `@` at all.

> **Try This**
> Case 01 (Retail Sales Audit) has a product column with inconsistent spacing and casing. Normalise it with `TRIM` and `LOWER` before you group, and see how many "different" products merge back together.
