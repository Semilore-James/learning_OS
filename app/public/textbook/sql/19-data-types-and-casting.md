# Data types and casting

## The one-sentence version

Every column has a type that decides how its values sort, compare, and do math, and `CAST` (or `::`) converts between types when the data arrived as the wrong one.

## What it is

The main families you will meet:

| family | examples | notes |
|---|---|---|
| integer | `INT`, `BIGINT`, `SMALLINT` | whole numbers, exact |
| decimal | `NUMERIC(10,2)`, `DECIMAL` | exact, for money |
| floating point | `REAL`, `DOUBLE PRECISION` | approximate, for science not money |
| text | `TEXT`, `VARCHAR(n)`, `CHAR(n)` | `VARCHAR(n)` caps length; `TEXT` does not |
| boolean | `BOOLEAN` | `true` / `false` / `NULL` |
| date/time | `DATE`, `TIMESTAMP`, `TIMESTAMPTZ` | see the date chapter |
| structured | `JSON`, `JSONB`, arrays | engine-dependent |

## Why it exists

Types are what let the database sort `9` before `10` instead of after (as text would), reject `'banana'` in a number column, and store a billion rows compactly. When a CSV import dumps everything as text, or an upstream system sends numbers as strings, your comparisons and sorts quietly go wrong until you cast.

## How it works

**Casting syntax** — two forms, same result:

```sql
CAST(order_id AS TEXT)
order_id::TEXT            -- Postgres shorthand
```

**Text that looks like a number sorts as text.** `'10' < '9'` is `true` because `'1'` comes before `'9'`. If an ID or amount column is text, cast it before sorting or comparing:

```sql
ORDER BY amount::NUMERIC DESC
```

**Integer division truncates.** `5 / 2` is `2`, not `2.5`, when both sides are integers. Cast one side to get a real answer:

```sql
SELECT wins::NUMERIC / games AS win_rate FROM teams;
```

This is the single most common "why is my percentage always 0" bug.

**Money is `NUMERIC`, never `FLOAT`.** Floating point cannot represent `0.10` exactly, so sums of currency drift by fractions of a cent over many rows. Use `NUMERIC(12,2)` for anything financial.

**Failed casts error out.** `'N/A'::INT` throws and can kill the whole query. If a text column has junk mixed in, guard it: `CASE WHEN col ~ '^[0-9]+$' THEN col::INT END` (Postgres regex), or your engine's `TRY_CAST` / `SAFE_CAST` which returns `NULL` instead of failing.

**Booleans from other systems** often arrive as `'Y'`/`'N'`, `1`/`0`, or `'true'`/`'false'` text. Normalise with a `CASE` or a direct cast (`'t'::boolean`).

## When you use it

Right after any import. When a sort is in the wrong order. When a ratio is always 0 or always an integer. When summing money. When a join between two ID columns returns nothing and you discover one side is `INT` and the other `TEXT`.

## A worked example

"Conversion rate per campaign, as a percentage with one decimal." Table: `campaigns` (`name`, `clicks` (text from import), `conversions` (text from import)).

```sql
SELECT
  name,
  ROUND(
    conversions::NUMERIC / NULLIF(clicks::NUMERIC, 0) * 100,
    1
  ) AS conversion_rate_pct
FROM campaigns
ORDER BY conversion_rate_pct DESC NULLS LAST;
```

Both columns are cast to `NUMERIC` so the division is real, not integer. `NULLIF(clicks::NUMERIC, 0)` protects against divide-by-zero for campaigns with no clicks. `NULLS LAST` keeps those at the bottom instead of the top.

> **Try This**
> Case 17 (Marketing Attribution) ships numbers as text in at least one file. Load it, try to `ORDER BY` a spend column without casting, note the wrong order, then fix it with `::NUMERIC`.
