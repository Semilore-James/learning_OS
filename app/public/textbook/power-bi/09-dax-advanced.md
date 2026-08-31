# DAX advanced: variables, iterators, time intelligence

## The one-sentence version

Variables make measures readable and fast, iterators do row-by-row math inside a measure, and time intelligence functions handle "vs last year" and "year to date" as one-liners against a proper Date table.

## What it is

- **VAR / RETURN** — store a value in a named variable, compute once, reuse.
- **Iterators** (`SUMX`, `AVERAGEX`, `MAXX`, `RANKX`, ...) — functions that walk a table row by row, evaluate an expression per row, then aggregate.
- **Time intelligence** (`TOTALYTD`, `SAMEPERIODLASTYEAR`, `DATEADD`, `DATESINPERIOD`, ...) — functions that shift or extend the date filter, requiring a marked Date table.

## Why it exists

Intermediate DAX gets you most metrics. The remaining ones need these three tools: a complex measure written without variables is unreadable and often recomputes the same subexpression five times; some calculations (weighted averages, per-customer then averaged) are inherently row-by-row; and every business report needs period comparisons, which are miserable to write by hand and trivial with time intelligence.

## How it works

**Variables:**

```
YoY Growth % =
VAR CurrentRevenue = [Total Revenue]
VAR PriorRevenue = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[date]))
VAR Growth = DIVIDE(CurrentRevenue - PriorRevenue, PriorRevenue)
RETURN
    IF(PriorRevenue = 0, BLANK(), Growth)
```

Each `VAR` is evaluated once, in the filter context where the `VAR` line sits (this matters: a variable does not "see" filters applied later in the same measure). Variables make the logic a readable sequence, prevent recomputation, and are the single biggest readability upgrade to a measure. Use them liberally.

**Iterators:**

```
Weighted Avg Price =
DIVIDE(
    SUMX(Sales, Sales[quantity] * Sales[unit_price]),
    SUM(Sales[quantity])
)

Avg Revenue per Customer =
AVERAGEX(VALUES(Customers[customer_id]), [Total Revenue])
```

`SUMX(table, expr)` sets a row context for each row of `table`, evaluates `expr`, sums. `AVERAGEX(VALUES(Customers[customer_id]), [Total Revenue])` iterates the distinct customers in context, gets each one's total revenue (context transition makes `[Total Revenue]` respect the current customer), and averages those. This "calculate per entity, then aggregate the results" pattern is the main reason iterators exist.

`RANKX(ALL(Products[name]), [Total Revenue], , DESC)` ranks products by revenue.

Iterators over large fact tables can be slow; iterating a small dimension (`VALUES` of a key) and letting each step aggregate is usually faster than iterating the fact directly.

**Time intelligence** (needs a Date table marked as such, with a continuous daily date column):

```
Revenue YTD = TOTALYTD([Total Revenue], 'Date'[date])
Revenue LY = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[date]))
Revenue LY YTD = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[date]), DATESYTD('Date'[date]))
Rolling 12M Revenue =
    CALCULATE([Total Revenue], DATESINPERIOD('Date'[date], MAX('Date'[date]), -12, MONTH))
MoM Change =
VAR ThisMonth = [Total Revenue]
VAR LastMonth = CALCULATE([Total Revenue], DATEADD('Date'[date], -1, MONTH))
RETURN ThisMonth - LastMonth
```

These only work if:

- You have a dedicated Date table (not the fact's date column).
- It has one row per day with no gaps, covering the full range.
- It is marked (Table tools > Mark as date table).
- Every fact's date key relates to it.

Get any of that wrong and the functions silently return wrong numbers or blanks. When time intelligence "does not work", the Date table is almost always the cause.

**Fiscal years:** if the business year does not start in January, pass the year-end month: `TOTALYTD([Total Revenue], 'Date'[date], "06-30")`.

## When you use it

Variables: in every measure longer than one line. Iterators: when the calculation is "do X per row/entity, then aggregate", especially weighted averages and per-customer metrics. Time intelligence: any period comparison or cumulative-to-date, which is most business reporting.

## A worked example

An executive scorecard needs, per month: revenue, revenue vs the same month last year, and year-to-date revenue vs last year's YTD.

```
Total Revenue = SUM(Sales[revenue])

Revenue LY =
CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[date]))

YoY % =
VAR cur = [Total Revenue]
VAR prev = [Revenue LY]
RETURN DIVIDE(cur - prev, prev)

Revenue YTD =
TOTALYTD([Total Revenue], 'Date'[date])

Revenue YTD LY =
CALCULATE([Revenue YTD], SAMEPERIODLASTYEAR('Date'[date]))

YTD YoY % =
DIVIDE([Revenue YTD] - [Revenue YTD LY], [Revenue YTD LY])
```

Put these in a matrix with `'Date'[month]` on rows. Each month shows current, prior year, the growth rate, and the cumulative comparison. Six measures, all leaning on one proper Date table, and the scorecard updates itself every refresh.

> **Try This**
> In a model with a real Date table, build `Revenue LY` and `YoY %` with variables. Put them in a matrix by month. Then break the Date table on purpose (remove the "mark as date table" setting) and watch the measures fail, so you recognise the symptom later.
