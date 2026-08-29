# Named ranges

## The one-sentence version

A named range gives a cell or block a plain-English name so your formulas read like sentences instead of coordinates.

## What it is

Instead of `$C$1`, you can name that cell `TaxRate` and write `=A2*TaxRate`. The name refers to the same cell, but the formula now says what it means. You create names in the Name Box (top-left, next to the formula bar) or in Formulas, Name Manager.

## Why it exists

Six months from now, `=SUMIFS('Raw Data'!$F$2:$F$9999, 'Raw Data'!$C$2:$C$9999, $B$4)` is unreadable, and so is a workbook full of formulas like it. `=SUMIFS(Revenue, Region, SelectedRegion)` tells you exactly what is happening. Names also mean that if the data moves, you update one definition instead of hunting through every formula.

## How it works

**Creating one:** select the cell or range, click the Name Box, type a name, press Enter. Names cannot contain spaces (use `TaxRate` or `tax_rate`), cannot look like a cell address (`Q1` is not allowed), and are workbook-wide by default.

**Naming a whole column of a Table:** if you use `Ctrl+T` to make a Table, its columns are automatically referenceable by header. `=SUM(Sales[Revenue])` works with no manual naming, and it grows automatically as rows are added. This is usually the better path than hand-naming ranges.

**A name for a single input:** put your assumptions on one sheet: a cell for the tax rate, one for the target, one for the "as of" date. Name each. Every formula in the workbook can then reference `Target` or `AsOfDate`, and changing the assumption is a one-cell edit.

**Name Manager** (Formulas tab) lists every name, what it points at, and its scope. Use it to fix a name whose range is wrong, or to delete names left over from deleted data (those show `#REF!` and are worth clearing out).

**A dynamic name:** you can define a name as a formula, not just a fixed range. `=OFFSET($A$2, 0, 0, COUNTA($A:$A)-1, 1)` names a range that always covers exactly the filled rows of column A. Tables do this more cleanly, so reach for Tables first, but this is how it was done before Tables existed and you will still see it.

## When you use it

Any workbook that someone else will open, or that you will reopen. Any place you have a shared assumption. Any formula you find yourself squinting at. If a formula has a `$C$1` in it that means something, that something deserves a name.

## A worked example

You are building a commission calculator. On a "Settings" sheet: `B2` holds `0.05` and you name it `CommissionRate`; `B3` holds `50000` and you name it `Threshold`.

On the "Deals" sheet, commission per deal: `=IF(D2>Threshold, D2*CommissionRate, 0)`. Anyone reading that formula understands it without opening another sheet. If finance changes the rate to 6%, you edit one cell and every deal recalculates.

> **Try This**
> Take any workbook you built with `$C$1`-style fixed references and replace them with names. Read a few of the formulas out loud before and after. Then convert the raw data to a Table with `Ctrl+T` and rewrite one SUMIFS using the `Table[Column]` style.
