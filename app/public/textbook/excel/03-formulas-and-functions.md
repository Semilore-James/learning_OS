# Formulas and functions

## The one-sentence version

A handful of functions (SUM, COUNT, IF, and a lookup) covers the large majority of real analyst work in a spreadsheet, and knowing them cold matters more than knowing a hundred you use once a year.

## What it is

A formula starts with `=` and computes a value. A function is a named piece of built-in logic you call inside a formula: `SUM(B2:B40)`, `IF(C2>100, "big", "small")`. Functions take arguments in parentheses, separated by commas.

## Why it exists

You could add fifty numbers by typing `=B2+B3+B4+...`. Functions let you say `=SUM(B2:B51)` instead, and the formula keeps working when the data grows. More importantly, functions like `IF` and `VLOOKUP` let a spreadsheet make decisions and pull data from one place to another, which is what turns a grid of numbers into an analysis.

## How it works

**The aggregates:**

- `SUM(range)`, `AVERAGE(range)`, `MIN`, `MAX` do what they say. They ignore text and blanks.
- `COUNT(range)` counts cells with numbers. `COUNTA(range)` counts cells with anything. `COUNTBLANK(range)` counts empties.
- `SUMIF(range, criteria, sum_range)` totals only the rows that match. `SUMIFS` and `COUNTIFS` take several conditions: `=SUMIFS(Revenue, Region, "West", Status, "Won")`.

**IF:** `IF(test, value_if_true, value_if_false)`. Nest them for a few bands, but past two or three it gets unreadable, and `IFS()` or a small lookup table is clearer:

```
=IF(A2>=500,"large",IF(A2>=100,"medium","small"))
```

**Guarding against errors:** `IFERROR(formula, value_if_error)` catches `#DIV/0!`, `#N/A`, and the rest. `=IFERROR(A2/B2, 0)` gives 0 instead of an error when `B2` is blank.

**Lookups.** This is the one people struggle with. You have a value in one place (a product code) and you want the matching detail (its price) from a table somewhere else.

- `VLOOKUP(lookup_value, table, column_number, FALSE)`. Searches the **first column** of `table` for `lookup_value`, returns the value from column `column_number` of that table. The `FALSE` (or `0`) means exact match, and you almost always want it. `VLOOKUP` can only look to the right and breaks if someone inserts a column, because `column_number` is a hardcoded position.
- `INDEX(return_range, MATCH(lookup_value, lookup_range, 0))`. `MATCH` finds the position of the value; `INDEX` returns whatever is at that position in another range. It looks in any direction and does not break when columns move. This is the one to learn as your default.
- `XLOOKUP(lookup_value, lookup_range, return_range)` is the modern replacement for both, in newer Excel and Google Sheets. Simpler, no column number, returns a clean result. Use it if you have it.

**Text helpers you will reach for:** `TRIM` (strip stray spaces), `UPPER`/`LOWER`/`PROPER` (case), `LEFT`/`RIGHT`/`MID` (substrings), `LEN` (length), `&` or `CONCAT` (join), `TEXT(value, format)` (format a number or date as a string), `SUBSTITUTE(text, old, new)`.

## When you use it

`SUM` / `COUNT` / `SUMIFS` for any total or count. `IF` and `IFERROR` for cleaning and categorising. A lookup whenever you need to attach data from one table to another, which is most days.

## A worked example

You have a sales table with a `product_code` column, and a separate `products` sheet with `code` and `price`. You want revenue per row.

In the sales sheet, add a `unit_price` column: `=XLOOKUP(B2, products!A:A, products!C:C)` (or `=INDEX(products!C:C, MATCH(B2, products!A:A, 0))` if no XLOOKUP). Then `revenue`: `=D2*E2` where `D2` is units. Now `=SUMIFS(F:F, C:C, "West")` gives West's total revenue. You have gone from raw rows to a regional number with three formulas.

> **Try This**
> Case 01 (Retail Sales Audit) needs revenue by store. Attach unit prices with a lookup if they are on a second sheet, compute revenue per row, then total by store with SUMIFS. Compare that to what SQL Dojo does with GROUP BY.
