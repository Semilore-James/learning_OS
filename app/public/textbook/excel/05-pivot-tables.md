# Pivot tables

## The one-sentence version

A pivot table takes a long list of rows and summarises it by whatever categories you drag in, and it is the fastest way in any tool to answer "how much, by what".

## What it is

You point a pivot at a range or Table of raw rows. Then you drag field names into four zones:

- **Rows:** what to group down the side (region, month, product).
- **Columns:** what to split across the top (quarter, status).
- **Values:** the number to compute, and how (sum of revenue, count of orders, average of price).
- **Filters:** conditions applied before anything is computed (only "Won" deals).

Excel rebuilds the summary instantly every time you change a zone.

## Why it exists

The alternative is a wall of `SUMIFS` formulas, one per cell of the summary, each with hardcoded criteria, that you rebuild by hand every time the question changes slightly. A pivot does the same computation but you reshape it by dragging, and it handles new categories in the data automatically. For exploratory "let me see this cut, now that cut" work, nothing is faster.

## How it works

**Build it:** click inside your data, Insert, PivotTable. Excel puts an empty pivot on a new sheet with the field list on the right.

**The Values zone is the aggregate.** Drop a numeric field there and it defaults to `Sum`. Click it, "Value Field Settings", to switch to Count, Average, Max, Min, or "Count (Distinct)". Drop a text field there and it can only Count.

**Rows plus Columns makes a cross-tab.** Region in Rows, Quarter in Columns, Sum of Revenue in Values gives you a grid of revenue by region and quarter, with row and column totals for free.

**"Show Values As"** (in Value Field Settings) turns a raw number into a share or a change: "% of Grand Total", "% of Row Total", "Difference From" the previous period, "Running Total In". This is how you get a percent-of-total column without a single formula.

**Group a date field:** right-click a date in the Rows zone, Group, and pick Months / Quarters / Years. Now a pivot on daily transactions shows monthly totals.

**Refresh, do not rebuild.** When the source data changes, right-click the pivot and Refresh (or `Alt+F5`). If rows were added, first make sure the source is a Table (`Ctrl+T`) so the range expands on its own.

**Double-click a value to drill through:** Excel spits out the underlying rows behind that cell on a new sheet. Useful for checking a number that looks wrong.

## When you use it

The first thing to reach for on any "summarise this" question. Revenue by store. Orders per month. Average ticket by channel. Headcount by department and level. If the answer is a table of totals grouped by something, a pivot gets you there in under a minute.

## A worked example

Restaurant tickets: one row per ticket, columns `location`, `date`, `party_size`, `total`, `tip`.

Insert a pivot. Drag `location` to Rows, `total` to Values (Sum). You now have revenue per location. Drag `date` to Columns and group by Month: revenue per location per month. Set the `total` value to "Show Values As, % of Column Total": each month's column now shows each location's share. Add a Filter on `party_size` for `>= 4` and the whole thing recomputes to large parties only.

> **Try This**
> Case 03 (Restaurant Revenue by Location) is a pivot table exercise end to end. Build revenue per location, then per location per month, then look at which location's share is moving. The Pivot Puzzle game drills the same "which field goes in which zone" instinct.
