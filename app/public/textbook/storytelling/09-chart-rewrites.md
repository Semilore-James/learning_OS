# Before and after: chart rewrites

## The one-sentence version

Improving a chart is a repeatable sequence of edits, and seeing the same chart rewritten step by step is the fastest way to internalise the moves.

## What it is

The standard rewrite process, applied to a weak chart until it makes its point:

1. Fix the chart type if it is wrong.
2. Start bar axes at zero; set line axes to an honest range.
3. Sort by value (unless the category has its own order).
4. Reduce to one accent color; grey the rest.
5. Remove chartjunk: gridlines, legend, 3D, gradients, decimals you do not need.
6. Label directly instead of using a legend.
7. Rewrite the title as the takeaway.
8. Add one annotation and one reference line.

Each step is small. The cumulative effect is a chart the audience reads in three seconds instead of thirty.

## Why it exists

Analysts know the principles (from the Visualization book) but freeze when facing an actual ugly chart, not sure where to start. The rewrite sequence removes the decision paralysis: run the steps in order, and the chart improves whether or not you had a clear vision of the end state.

## How it works

**Rewrite 1: the pie chart of market share**

- *Before:* a pie with 8 slices, a legend, percentages inside each slice, rainbow colors.
- Step 1 (chart type): 8 slices is too many for a pie; humans cannot compare 8 angles. Switch to a horizontal bar chart.
- Step 3 (sort): bars descending by share.
- Step 4 (color): all grey except "Us", in the accent.
- Step 6 (labels): share value at the end of each bar; no legend.
- Step 7 (title): "We are third, 4 points behind the leader".
- *After:* a sorted bar chart where the ranking and the gap to the leader are instant.

**Rewrite 2: the truncated-axis column chart**

- *Before:* two columns, "Before" at 4.1 and "After" at 4.4, y-axis running 4.0 to 4.5, so the "After" column is three times taller.
- Step 2 (axis): start at zero. Now the columns are nearly the same height.
- Step 1 (reconsider): a 7% change on a 1-to-5 scale is small; a column chart oversells it. Switch to a dot plot from 0 to 5 with the two points.
- Step 8 (annotation): add the confidence interval on each point.
- Step 7 (title): "Satisfaction up slightly (4.1 to 4.4), within the margin of error".
- *After:* an honest dot plot that shows the change is real but modest and not yet distinguishable from noise.

**Rewrite 3: the spaghetti line chart**

- *Before:* 9 lines (one per region), 9 colors, a legend, overlapping in the middle so you cannot follow any single line.
- Step 4 (color): the story is about the West turnaround. All 9 lines grey, West in the accent.
- Step 6 (labels): "West" at the end of its line; drop the legend.
- Step 7 (title): "West returned to growth in Q3 after three flat quarters".
- Step 8 (annotation): a shaded band over the quarter the trend changed.
- *If the story were "compare all 9"* instead: switch to small multiples, a 3x3 grid of mini-charts, each with one region highlighted against the faint others.
- *After:* one readable chart with a clear subject, or a grid that lets each region be seen.

**Rewrite 4: the dense table nobody reads**

- *Before:* a 15-row, 8-column table, left-aligned numbers, full gridlines, no sorting, six decimal places.
- Step: right-align numbers, align decimals, cut to one decimal place, thousands separators.
- Step: sort rows by the key metric, descending.
- Step: remove all gridlines except a rule under the header; add whitespace between column groups.
- Step: light cell-heat on the one column where the reader is hunting for outliers.
- Step: bold the one row that is the point.
- Step: title "Three regions carry 70% of revenue; margin pressure is isolated to West".
- *After:* a designed table that is scannable, with the finding highlighted.

## When you use it

On every chart before it goes in a deck, and as a drill to build the instinct. Take a bad chart from a report, a news article, or your own drafts, and run the eight steps. After a dozen rewrites, you start producing the "after" version first.

## A worked example

A single chart, one full pass. Starting point: a 3D exploded pie of support tickets by category, 6 slices, legend, drop shadow, title "Ticket Categories".

- Type: 6 slices, comparison needed -> horizontal bar.
- Axis: bars from zero.
- Sort: descending by ticket count.
- Color: grey, except "Billing" (the problem category) in the accent.
- Junk: no 3D, no shadow, no legend.
- Labels: count and percent at the end of each bar.
- Title: "Billing tickets are 38% of volume and rising".
- Annotation: a small "+12% vs last quarter" note on the Billing bar.

Elapsed time: about four minutes. The chart went from decorative to a slide that makes an argument.

> **Try This**
> Find the worst chart you can (your own old work, a news graphic, a dashboard). Run the eight rewrite steps in order, saving each intermediate version. Compare the first and last. Then play Chart Critiquer and notice you are now spotting the same flaws you just fixed.
