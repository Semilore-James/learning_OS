# DAX intermediate: CALCULATE, FILTER, ALL

## The one-sentence version

CALCULATE is the function that changes filter context, and almost every non-trivial measure (percent of total, year-to-date, "same metric but ignoring the slicer") is CALCULATE plus one filter argument.

## What it is

- **CALCULATE(expression, filter1, filter2, ...)** — evaluates `expression` after modifying the current filter context with the filter arguments. The most important function in DAX.
- **ALL(table or column)** — a filter argument that *removes* filters from that table or column.
- **FILTER(table, condition)** — returns a filtered table, used as a filter argument when you need a condition CALCULATE's simple syntax cannot express.
- **KEEPFILTERS**, **REMOVEFILTERS**, **ALLEXCEPT** — variations on the same theme of adjusting context.

## Why it exists

The base measures from the last chapter respect whatever context they land in. But real metrics often need to *break out* of that context: "this category's share of the *total*" needs the denominator to ignore the category; "revenue *last year*" needs the date filter shifted; "revenue for *completed* orders only" needs an extra filter regardless of what the user selected. CALCULATE is the one tool that does all of this.

## How it works

**CALCULATE's filter arguments do two things:** they can add a filter, and (for columns) they replace any existing filter on that column.

```
Completed Revenue = CALCULATE([Total Revenue], Sales[status] = "completed")
```

This forces `status = "completed"` into the filter context. If the user also has a status slicer, this measure overrides it for `status`.

**ALL removes filters — the key to "percent of total":**

```
Revenue % of Category Total =
DIVIDE(
    [Total Revenue],
    CALCULATE([Total Revenue], ALL(Products[category]))
)
```

The denominator's `ALL(Products[category])` strips the category filter, so it is always the total across all categories. The numerator keeps the row's category. Result: each category's share.

`ALL(Products)` removes filters on the whole Products table. `ALL(Sales)` clears everything from Sales. `ALL()` with no argument, inside CALCULATE, clears all filters on the model (rare, use with care).

**ALLEXCEPT** keeps some filters and drops the rest:

```
Revenue % of Region =
DIVIDE([Total Revenue], CALCULATE([Total Revenue], ALLEXCEPT(Stores, Stores[region])))
```

Denominator keeps the region filter, drops city/store, so you get each store's share of its region.

**FILTER for conditions CALCULATE cannot express directly:**

```
Big Order Revenue =
CALCULATE([Total Revenue], FILTER(Sales, Sales[revenue] > 1000))

Revenue for Above-Average Products =
CALCULATE(
    [Total Revenue],
    FILTER(
        ALL(Products),
        [Total Revenue] > CALCULATE([Total Revenue], ALL(Products)) / DISTINCTCOUNT(...)
    )
)
```

Use a plain `column = value` filter argument when you can (it is faster). Use `FILTER` when the condition compares to a measure, spans a range that is not a single value, or references multiple columns.

**KEEPFILTERS** stops CALCULATE from overriding an existing user filter, instead intersecting with it:

```
CALCULATE([Total Revenue], KEEPFILTERS(Sales[status] = "completed"))
```

If the user's slicer is on "shipped", this returns blank (the intersection of "completed" and "shipped" is empty) rather than overriding to "completed".

**Context transition:** when CALCULATE runs inside a row context (an iterator, or a calculated column), it turns that row context into a filter context. This is why `SUMX(Customers, [Total Revenue])` gives each customer's revenue: `[Total Revenue]` is wrapped in an implicit CALCULATE, and the row context (one customer) becomes a filter.

## When you use it

The moment a measure needs to be anything other than "aggregate the visible rows". Percent of total, running totals, "ignoring the slicer", "only this status", "compared to the average", period-over-period: all CALCULATE. If you are writing a measure and reaching for CALCULATE, you are on the right track.

## A worked example

A report needs: revenue, revenue as a percent of the grand total, and revenue for completed orders only, all sliceable by category and region.

```
Total Revenue = SUM(Sales[revenue])

Revenue % of Total =
DIVIDE([Total Revenue], CALCULATE([Total Revenue], ALL(Sales)))

Completed Revenue =
CALCULATE([Total Revenue], KEEPFILTERS(Sales[status] = "completed"))
```

Put these in a matrix with `category` on rows. Each category shows its revenue, its share of the whole (the shares sum to 100%), and its completed-only revenue. Add a region slicer: `Total Revenue` and `Completed Revenue` filter to the region, and `Revenue % of Total` now shows each category's share *within that region*, because `ALL(Sales)` cleared the category but the slicer's region filter... actually `ALL(Sales)` clears region too. If you want share-within-region, use `ALLEXCEPT(Sales, Stores[region])` or `ALL(Products[category])` instead. Choosing which filters to remove is the whole craft.

> **Try This**
> In a Power BI model, write a "percent of total" measure with `ALL`. Add a slicer and observe whether the percentages recalculate within the slicer's selection or against the true grand total. Then rewrite it with `ALLEXCEPT` to change that behaviour and see the difference.
