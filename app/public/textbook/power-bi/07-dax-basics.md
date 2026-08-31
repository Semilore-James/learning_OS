# DAX basics: calculated columns, measures

## The one-sentence version

Ninety percent of DAX in a real report is a dozen simple measures built from SUM, AVERAGE, COUNTROWS, DIVIDE, and a bit of DISTINCTCOUNT, and you should default to measures and use calculated columns rarely.

## What it is

- **Measure** — a named calculation that evaluates in the filter context of wherever it is used. Does not take up storage. Written with `New measure`.
- **Calculated column** — a column added to a table, computed per row at refresh, stored in the model. Written with `New column` in Table view.

Both use DAX. The choice between them is the previous chapter's lesson: filter-dependent -> measure; fixed row property -> column (or Power Query).

## Why it exists

Every metric on a report is a measure: revenue, orders, average order value, conversion, growth. Getting the base ones right, well-named, and reusable is the foundation. Calculated columns exist for the narrower job of categorising or bucketing rows in a way Power Query cannot.

## How it works

**The aggregation functions** (the core of most measures):

```
Total Revenue = SUM(Sales[revenue])
Total Cost = SUM(Sales[cost])
Order Count = COUNTROWS(Sales)
Distinct Customers = DISTINCTCOUNT(Sales[customer_id])
Average Order Value = AVERAGE(Sales[revenue])         -- or DIVIDE below
Max Single Order = MAX(Sales[revenue])
```

**DIVIDE, not `/`:**

```
Margin % = DIVIDE([Total Revenue] - [Total Cost], [Total Revenue])
AOV = DIVIDE([Total Revenue], [Order Count])
```

`DIVIDE(a, b)` returns blank (or a value you specify) when `b` is zero, instead of an error. Always use it for division.

**Build measures on measures.** Once `[Total Revenue]` and `[Total Cost]` exist, define `[Total Profit] = [Total Revenue] - [Total Cost]` by referencing them, not by re-summing. Reference measures in square brackets, no table prefix. This keeps logic in one place: fix `[Total Revenue]` once and everything downstream updates.

**Naming and organising:**

- Give measures plain names: `Total Revenue`, not `SumRev` or `_rev1`.
- Put all measures in one place. Common practice: create an empty table (Enter data, one throwaway column), name it `_Measures`, and move every measure into it. The Fields pane then has a clear "here are the numbers" home.
- Set the format (Measure tools > Format) once per measure: currency, percentage, whole number with thousands separator.

**Calculated columns, the legitimate uses:**

```
Sales[Order Size] =
SWITCH(TRUE(),
    Sales[revenue] < 50, "Small",
    Sales[revenue] < 200, "Medium",
    "Large"
)

Customers[Tenure Band] =
VAR months = DATEDIFF(Customers[signup_date], TODAY(), MONTH)
RETURN
    SWITCH(TRUE(), months < 3, "New", months < 12, "Established", "Loyal")
```

These create a text attribute you can slice by and put on an axis. If Power Query could compute it just as easily (it can, for the first one), prefer Power Query. Use a DAX calculated column when the logic needs something only the model has, like `RELATED` values or `TODAY()`.

**What NOT to make a calculated column:** anything you sum. `Sales[LineTotal] = quantity * unit_price` as a column works but bloats the model; `SUMX(Sales, Sales[quantity] * Sales[unit_price])` as a measure is better. Never store an aggregation as a column.

## When you use it

Right after the model is a clean star. Write the 6 to 10 base measures your report needs, name them well, format them, park them in `_Measures`. Then build the report from those. Add calculated columns only when you need a new attribute to slice by that the source and Power Query cannot give you.

## A worked example

A sales report's measure set, all in `_Measures`:

```
Total Revenue      = SUM(Sales[revenue])
Total Cost         = SUM(Sales[cost])
Total Profit       = [Total Revenue] - [Total Cost]
Margin %           = DIVIDE([Total Profit], [Total Revenue])
Order Count        = DISTINCTCOUNT(Sales[order_id])
Units Sold         = SUM(Sales[quantity])
AOV                = DIVIDE([Total Revenue], [Order Count])
Distinct Customers = DISTINCTCOUNT(Sales[customer_id])
Revenue per Customer = DIVIDE([Total Revenue], [Distinct Customers])
```

Nine measures. Formatted (currency, percent, whole number). Every visual on the report is built from these, and each one recalculates correctly for whatever category, region, or date range the user slices to. No calculated columns needed for the sales analysis; the one column added is `Customers[Tenure Band]` so the report can compare new vs loyal customers.

> **Try This**
> In a Power BI model, create a `_Measures` table and write the 6 base measures for a case dataset: a total, a count, a distinct count, an average via DIVIDE, and two measures built by referencing the others. Format each. Build one matrix from them and check the totals are right.
