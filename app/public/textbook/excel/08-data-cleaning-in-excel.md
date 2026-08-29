# Data cleaning in Excel

## The one-sentence version

Cleaning is finding and fixing the parts of a dataset that would make an analysis wrong, and in Excel it is a repeatable checklist of small moves, not a mystery.

## What it is

You get a file. Before you can trust any total from it, you check and fix: stray spaces, mixed case, inconsistent categories, wrong data types, blanks that should be zeros (or zeros that should be blanks), duplicates, impossible values, and dates stored as text. Cleaning is that pass.

## Why it exists

A `SUM` does not know that `"West "` and `"West"` are the same region, so it splits them. `AVERAGE` skips blanks, so a column that is half empty gives a misleading mean. A date stored as text will not sort or filter as a date. None of these announce themselves. They just make the answer quietly wrong, and the analyst who did not clean gets blamed for the number.

## How it works

A working order:

**1. Get the shape.** `Ctrl+End` for the size. Scroll the headers. Note which columns are numbers, text, dates. Turn the range into a Table (`Ctrl+T`) so filters and formulas behave.

**2. Trim and case.** In a helper column: `=TRIM(A2)` removes leading, trailing, and doubled spaces. `=PROPER(TRIM(A2))` also normalises case. Then paste the helper column back over the original as values (`Ctrl+Shift+V`).

**3. Find inconsistent categories.** Build a quick pivot with the category field in Rows and a count in Values. The distinct values are now a list. `West`, `west`, `Westt`, `W` all show up as separate rows, and you can see exactly what needs merging. Fix with Find and Replace (`Ctrl+H`) or a small lookup table.

**4. Fix data types.** A number stored as text is left-aligned and often has a little green triangle. Select the column, use the triangle's "Convert to Number", or multiply by 1 in a helper column. A date stored as text: `=DATEVALUE(A2)` then format as a date, or use Text to Columns (Data tab) with the Date option, which is the reliable fix.

**5. Handle blanks deliberately.** Decide per column: is a blank a real zero, or genuinely unknown? `Ctrl+G`, Special, Blanks selects them all at once so you can fill `0` or a flag. Do not fill unknowns with zero, that biases every average and sum.

**6. Remove duplicates.** Data, Remove Duplicates, and pick the columns that define a duplicate. First, check with a `=COUNTIF($A:$A, A2)>1` column so you see what will go, rather than deleting blind.

**7. Spot impossible values.** Sort or filter each numeric column and look at the extremes. Negative quantities, a price 10x its neighbours, a percentage over 100, a date in the future. Conditional formatting colour scales make this a glance.

**8. Keep a copy of the raw file.** Always. Cleaning is destructive; you want to be able to go back.

## When you use it

The first thing you do with any file, every time, before you compute a single summary. The temptation to skip it and "just get the number" is exactly how wrong numbers ship.

## A worked example

Retail till data arrives. `Ctrl+End`: 4,600 rows, 7 columns. Store names include `Ikeja`, `ikeja`, `IKEJA `. `TRIM` and `PROPER` in a helper, paste back as values: now one `Ikeja`. `unit_price` is left-aligned: convert to number. 41 blank prices: these are genuinely missing, so flag them and exclude, do not zero them. Sort `units`: three rows are negative, likely returns, flag for the write-up. Now `SUMIFS` by store gives a total you can defend.

> **Try This**
> Case 01 and Case 03 both ship "lightly dirty" data. Run this checklist on one of them. Note every fix you made, because the case wants you to explain your cleaning, and the PM will ask what you did with the blanks.
