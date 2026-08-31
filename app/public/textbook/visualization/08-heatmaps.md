# Heatmaps for data

## The one-sentence version

A heatmap shows a value across two categorical or binned dimensions using color, and it is the right tool when the story is "the problem is concentrated in this corner of the grid".

## What it is

A grid. Rows are one dimension, columns are another, each cell holds a value shown as a color from a sequential or diverging scale. Common uses:

- **Time patterns** — hour of day (rows) by day of week (columns), colored by traffic or sales. Reveals the peak hours and quiet spells at a glance.
- **Cohort retention** — signup month (rows) by months-since-signup (columns), colored by percent still active. The classic retention triangle.
- **Correlation matrix** — every numeric variable against every other, colored by r. Fast scan for which pairs are related.
- **Cross-tab of a metric** — region by product, colored by margin; segment by channel, colored by conversion.

## Why it exists

When you have a metric that varies across two dimensions at once, a bar chart forces you to pick one dimension for the axis and cram the other into grouping or small multiples. A heatmap shows both dimensions as a grid and uses the third visual channel (color) for the value, so a 12 by 7 pattern that would be 84 bars becomes one readable picture.

## How it works

**The color scale is the whole design:**

- **Sequential** (light to dark, one hue) for values that go from low to high with no meaningful midpoint: traffic counts, retention percent, revenue.
- **Diverging** (two hues, neutral center) for values measured against a reference: above/below target, positive/negative change, correlation (centered at 0).
- Pick the scale direction so "the thing you care about" is the dark, saturated end. If low retention is the problem, make low retention dark.
- Show the legend, with a few labeled tick values, so the reader can decode a color into a number.

**Layout:**

- **Order the rows and columns meaningfully.** Time dimensions keep their natural order (hours 0-23, Mon-Sun). Categorical dimensions can be sorted by their marginal total or clustered so similar rows sit together, which makes blocks of pattern visible.
- Keep the grid small enough to read. Roughly up to 15 by 15 before the cells get too small. Beyond that, aggregate or filter.
- **Annotate the cells with the value** if the grid is small and exact numbers matter. For a large grid, rely on color and let the reader use the legend.
- Square-ish cells. Very wide or very tall cells distort the visual weight.

**What a heatmap is bad at:** precise value comparison (color is judged far less accurately than length or position), and showing a trend (the eye does not follow color gradients across a row the way it follows a line). If the reader needs to know exactly how much bigger Tuesday is than Monday, a heatmap is the wrong choice; use it when the pattern of hot and cold regions is the point.

## When you use it

Two categorical or binned dimensions, one metric, and a story about *where* in the grid the metric concentrates. Peak-hours staffing, retention by cohort, a margin problem that turns out to be one region-product combination, a correlation scan before modelling.

## A worked example

A support team wants to know when to staff. Data: ticket volume by hour (0-23) by day of week.

**As a line chart:** 7 overlapping lines (one per day), each with 24 points. Spaghetti. You can see there is a daytime peak but not much else.

**As a heatmap:** 24 rows (hours), 7 columns (days), sequential scale from pale to dark for volume. Instantly visible: a solid dark block Monday to Friday, 9am to 5pm, with Monday morning and Friday afternoon the darkest cells. Weekends are pale all day except a small warm patch Sunday evening. Tuesday 10-11am is the single hottest cell.

The staffing recommendation writes itself from the picture: full coverage weekday business hours, a Monday-morning and Friday-afternoon surge, skeleton crew weekends with a small Sunday-evening bump.

> **Try This**
> Find two categorical or time dimensions and a metric in a case dataset. Build the heatmap with a sequential scale oriented so the problem is the dark end. Order the rows and columns so any pattern forms a visible block. Write the one sentence the hot region tells you.
