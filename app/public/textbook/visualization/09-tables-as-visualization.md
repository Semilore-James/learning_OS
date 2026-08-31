# Tables as visualization

## The one-sentence version

A table is a legitimate visualization, and often the right one, when the reader needs exact values, several metrics per row, or the ability to look up a specific entry, and a well-designed table beats a bad chart every time.

## What it is

Rows and columns of values, designed. The design choices that turn a data dump into a communication tool:

- Alignment, number formatting, and precision.
- Which rows and in what order.
- Light structure: rules, spacing, a header treatment.
- Embedded encoding: color, small bars, arrows, or sparklines inside cells.

## Why it exists

Charts are for showing shape and relationship. Tables are for showing values. A board pack that needs the exact revenue, margin, and growth for each of 8 business units, so people can quote the numbers, should be a table. Forcing that into a grouped bar chart makes every number an estimate the reader squints at. The instinct that "a chart is always more sophisticated than a table" is wrong; the right question is whether the reader needs the pattern or the numbers.

## How it works

**Formatting that does the heavy lifting:**

- **Right-align numbers**, and align the decimal points, so magnitudes are comparable down a column at a glance. Left-align text.
- **Consistent precision.** Pick the number of decimal places from what the reader needs to act on, and use it everywhere in the column. Revenue in whole thousands (`1,240k`), rates to one decimal (`4.2%`), not a mix.
- **Thousands separators** on anything over 1,000.
- **Units in the header** (`Revenue (£000)`), not repeated in every cell.
- **Suppress noise.** Drop trailing zeros the reader does not need. Replace true zeros with a dash if zero means "none" and you want the eye to skip them.

**Structure:**

- Minimal rules. A line under the header, a line above a totals row, and that is often all. No vertical lines, no full grid, no zebra striping unless the table is very wide.
- **Sort the rows by the column that matters** (largest revenue first), unless there is a natural order.
- Whitespace between column groups is cheaper and cleaner than a vertical rule.
- Keep it to what fits without scrolling or shrinking the font below readable. A 40-row table is a reference document, not a slide.

**Embedded encoding turns a table into a visual:**

- **Heat the cells:** a light background color scaled to the value, so the eye catches the high and low cells while the exact number stays readable. Good for a matrix of rates.
- **In-cell bars:** a small horizontal bar behind the number, proportional to it. Gives the column a bar-chart read without leaving the table.
- **Change indicators:** a small up or down arrow, colored, next to a growth figure. Not just color (colorblind readers), the arrow carries it too.
- **Sparklines:** a tiny inline line chart in a "trend" column, showing each row's last 12 periods. The reader gets the level from the number and the trajectory from the sparkline.

**One highlight.** Bold or tint the row or the number that is the point. A table with everything the same weight makes the reader hunt.

## When you use it

When the deliverable needs exact figures (finance, board reporting, anything people will quote), when there are several metrics per entity and no single one is the story, when the reader needs to find their own row, or when there are too few data points for a chart to be worth it (a chart of 3 numbers is just a table with extra steps).

## A worked example

A monthly business review for 6 regions. The ask: current revenue, margin, and year-on-year growth per region, and which region needs attention.

**As a grouped bar chart:** 18 bars in 6 clusters, three different scales (revenue in millions, margin in percent, growth in percent) that cannot share an axis, so it becomes three charts. The reader cannot read any exact value.

**As a designed table:** 6 rows sorted by revenue. Columns: Region, Revenue (£M, right-aligned, one decimal), Margin (%, with a light heat scale so the low-margin cell stands out), YoY growth (%, with a colored up/down arrow). The one region with negative growth and a below-target margin has its row tinted. Title: "West margin down to 12% on flat revenue; all other regions on plan."

Every number is exact and quotable, the problem region is visually obvious, and it fits on one slide.

> **Try This**
> Take a multi-metric summary from a case (a few entities, 3+ metrics each). Build it as a designed table: right-aligned consistent numbers, minimal rules, sorted by the key column, one cell-heat or in-bar encoding, and the key row highlighted. Compare it to charting the same data and decide which serves the reader better.
