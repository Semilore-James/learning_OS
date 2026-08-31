# DAX: row context vs filter context (the core idea)

## The one-sentence version

Every DAX formula runs inside a context that decides which rows it sees, and there are exactly two kinds of context, and understanding the difference is the whole battle with DAX.

## What it is

**DAX** (Data Analysis Expressions) is the formula language for calculated columns and measures. When a DAX expression evaluates, it does so inside a **context**:

- **Row context** — "the current row". Exists automatically inside a calculated column and inside iterator functions (`SUMX`, `FILTER`, ...). The expression can refer to columns and gets that row's values.
- **Filter context** — "the set of rows currently visible", determined by what is on the visual: the rows/columns of a matrix, the slicers, the page filters, and any filters a measure applies. A measure evaluates inside filter context.

A calculated column has row context but no filter context. A measure has filter context but no row context (until you introduce one with an iterator).

## Why it exists

The same formula gives different answers depending on where you use it, and beginners write `= SUM(Sales[revenue])` as a measure, see it work in one cell, then are baffled when the grand total is wrong or a slicer does nothing. That confusion is always a context misunderstanding. Once the two contexts click, DAX stops being random.

## How it works

**Row context — the calculated column case:**

```
Sales[LineTotal] = Sales[quantity] * Sales[unit_price]
```

This runs once per row of `Sales`. `Sales[quantity]` means "this row's quantity". There is no filter context; it does not care what is on any visual. The result is stored in the table, taking up space, computed at refresh.

**Filter context — the measure case:**

```
Total Revenue = SUM(Sales[revenue])
```

This has no row context. `SUM` looks at all rows *currently in filter context* and adds their `revenue`. Drop this measure into a matrix with `Products[category]` on rows:

- In the "Electronics" row, filter context is "Sales rows where category = Electronics" (the relationship carries the filter from the Products dimension). `SUM` adds those.
- In the grand total row, filter context is "all Sales rows" (no category filter). `SUM` adds everything.

One formula, many answers, because filter context changed per cell. This is the point of a measure: it recalculates for every context it lands in.

**Row context does NOT automatically become filter context.** Inside a calculated column, `Sales[quantity] * Sales[unit_price]` works because both are the same table's row. But `Sales[quantity] * RELATED(Products[list_price])` needs `RELATED` to reach across the relationship, and a calculated column referring to `[Total Revenue]` (a measure) triggers **context transition**: the row context becomes a filter context for the measure. This is subtle and a common source of surprise.

**Iterators create row context inside a measure:**

```
Total Revenue = SUMX(Sales, Sales[quantity] * Sales[unit_price])
```

`SUMX` walks the rows currently in filter context, and for *each* row it establishes a row context, evaluates `quantity * unit_price`, and sums the results. This is how a measure does row-by-row math without a stored calculated column. Prefer this over a calculated column for row-level math you only need in measures.

**Column vs measure, decide by this:** does the value depend on what the user filters? Yes -> measure. No, it is a fixed property of the row -> calculated column (or better, a Power Query custom column).

## When you use it

Every time you write DAX. Before you type, ask: "what context is this running in, and what rows does it see?" For a measure: "what is the filter context in the cell where this appears?" For a calculated column: "this runs per row, no filters." Getting this question into your head before every formula is the skill.

## A worked example

You want "percent of total revenue" per category. First attempt:

```
Pct of Total = SUM(Sales[revenue]) / SUM(Sales[revenue])
```

This gives 100% everywhere. Both `SUM`s run in the same filter context (the category), so numerator and denominator are equal.

The fix is to make the denominator ignore the category filter:

```
Pct of Total =
DIVIDE(
    SUM(Sales[revenue]),
    CALCULATE(SUM(Sales[revenue]), ALL(Products[category]))
)
```

`CALCULATE(..., ALL(Products[category]))` removes the category from the denominator's filter context, so it is always the grand total. Numerator still respects the row's category. Now the "Electronics" row shows Electronics revenue over total revenue. This uses `CALCULATE` and `ALL` to *modify* filter context, which is the next chapter, but it only makes sense once you see that the problem was two things running in the same context.

> **Try This**
> In a Power BI model, make one calculated column (`quantity * unit_price`) and one measure (`SUMX` of the same). Put a category slicer on the page. Watch the measure change with the slicer and the calculated column not. Write one sentence explaining why.
