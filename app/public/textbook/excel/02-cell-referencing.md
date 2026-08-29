# Cell referencing: relative, absolute, mixed

## The one-sentence version

A dollar sign locks part of a cell address so it does not move when you copy the formula, and getting this right is the difference between a formula that fills correctly and one that quietly breaks.

## What it is

When a formula points at another cell, that pointer is a reference. `=A2*B2` has two references. When you copy that formula down one row, Excel adjusts both to `=A3*B3`. That adjustment is the reference being **relative**.

A `$` in front of the column letter or the row number freezes that part. `$A$2` never changes. `A$2` keeps the column relative but freezes the row. `$A2` freezes the column but lets the row move.

## Why it exists

You almost never write a formula once. You write it in one cell and fill it down a thousand rows, or across twelve months. Relative references are what makes that work: each row's formula automatically points at that row's data. But some things should not move. A tax rate in one cell, a lookup table off to the side, a "total" cell you divide by for a percentage. Those need to stay put, and that is what `$` is for.

## How it works

**Relative** (`A2`): moves with the formula in both directions. The default.

**Absolute** (`$A$2`): never moves. Use for a single fixed input like a rate, a threshold, or a start date.

**Mixed** (`A$2` or `$A2`): one part moves, one part is locked. Use when you fill a formula both down and across and only one axis should track.

**The F4 key cycles through them.** Type a reference, press `F4`, and it goes `A2` then `$A$2` then `A$2` then `$A2` then back. You do not type the dollar signs by hand.

The classic mistake:

```
   A          B         C
1  Price      Tax rate  0.075
2  100        =A2*C2
3  200        =A2*C2   <- copied down
```

Row 3's formula became `=A3*C3`, but `C3` is empty. The tax rate should have been `$C$1`. Fixed:

```
2  100        =A2*$C$1
3  200        =A3*$C$1   <- C1 stays locked
```

**A quick tell:** if a filled-down formula gives `#DIV/0!` or blanks partway down a column, a reference that should have been locked probably drifted onto an empty cell.

## When you use it

Every time you have a shared input (a rate, a target, a conversion factor) or a lookup range that a filled formula points at. If the formula references something that lives in exactly one place, that reference is almost always absolute.

## A worked example

You have daily revenue in `B2:B32` and you want each day as a percent of the month's total. The total is in `B33`.

In `C2`: `=B2/$B$33`. The `B2` is relative so it tracks each day. The `$B$33` is absolute so every row divides by the same total. Fill `C2` down to `C32` and every percentage is correct. Without the dollar signs, row 3 would try `=B3/B34`, dividing by an empty cell.

> **Try This**
> Build a "percent of total" column for any monthly figure in a case dataset. Then try the same formula without the `$` and watch where it breaks. Press F4 while editing a reference to feel the cycle.
