# Conditional formatting

## The one-sentence version

Conditional formatting changes how a cell looks based on its value, so patterns and problems in a table jump out at a glance instead of hiding in the numbers.

## What it is

Select a range, Home, Conditional Formatting, and pick a rule. The rule can be a comparison ("greater than 100"), a top/bottom selection ("top 10%"), a colour scale, a data bar, an icon set, or a custom formula. Cells that match get the formatting you choose. The values do not change, only the display.

## Why it exists

Your eye is far better at spotting "the row that is a different colour" than "the row where column F is 40% below the others". A wall of numbers hides its own outliers. A quick colour scale turns that same wall into a heat map where the cold spot is obvious. It is the cheapest form of data visualisation, applied directly to the data.

## How it works

**Highlight cells rules:** greater than, less than, between, equal to, text that contains, a date occurring, duplicate values. "Highlight duplicate values" on an ID column is a two-click integrity check.

**Top/bottom rules:** top 10 items, bottom 10%, above average, below average. "Below average" across a revenue column immediately shows which stores are dragging.

**Colour scales:** a 2- or 3-colour gradient mapped to the range of values. Low values red, high values green (or whatever you pick). Best for a single column of comparable numbers.

**Data bars:** a little in-cell bar proportional to the value. Turns a column of numbers into a mini bar chart without leaving the cell.

**Icon sets:** traffic lights, arrows, ratings, based on thresholds you set. Useful on a summary sheet, easy to overdo.

**Custom formula** is where it gets useful for real work. Conditional Formatting, New Rule, "Use a formula". The formula is written for the **top-left cell** of your selection and must return TRUE to format that row. Write it with the right dollar signs so it fills correctly:

- Highlight the whole row when a status is overdue: select `A2:H100`, formula `=$F2="Overdue"`. The `$F` locks the column so every cell in the row is tested against F; the `2` is relative so each row tests its own F.
- Flag a total that does not match: `=$E2<>$C2+$D2`
- Shade weekends in a date column: `=WEEKDAY($A2,2)>5`

**Managing rules:** Conditional Formatting, Manage Rules shows every rule on the sheet, its range, and its order. Rules apply top-down; "Stop If True" halts further rules for a matched cell. Delete rules you no longer need, they slow big sheets down.

## When you use it

Any time you are scanning a table for outliers, gaps, duplicates, or rule-breakers, which is most of data QA. Any summary or tracker where a reader needs to see status at a glance. As a first pass before you build a real chart.

## A worked example

You have a sales table and you suspect one store is systematically lower. Select the revenue column, Conditional Formatting, Color Scales, red-white-green. One store's cells are visibly redder down the whole column. You did not compute anything, you just made the pattern visible. Then select the full table `A2:H500`, add a formula rule `=$C2="Ikeja"` with a fill colour, and now that store's rows are marked everywhere so you can eyeball its dates, payment methods, and prices together.

> **Try This**
> On any case dataset, use a colour scale to find the outlier group, then a "highlight duplicates" rule on the ID column to check for repeated keys, then a formula rule to shade rows where the total does not equal units times price.
