# Choosing the right chart type

## The one-sentence version

Pick the chart from the question you are answering, not from a gallery of options, because the right chart makes the answer obvious and the wrong one hides it.

## What it is

A chart type is a mapping from data to a visual comparison. Each type is good at one kind of comparison and bad at the others:

- **Bar** — comparing a value across categories. "Which region sold most?"
- **Line** — a value changing over an ordered axis, almost always time. "How did revenue trend this year?"
- **Scatter** — the relationship between two numeric variables. "Does ad spend relate to signups?"
- **Grouped or stacked bar** — a value across two categorical dimensions. "Sales by region by product line."
- **Histogram** — the distribution of one numeric variable. "How is order value spread out?"
- **Heatmap** — a value across two categorical (or binned) dimensions, shown as colour. "Traffic by hour by day of week."
- **Table** — exact values, several metrics per row, or when the reader needs to look things up.

## Why it exists

The same data plotted two ways can tell opposite stories. Monthly sales as a pie chart hides the trend completely; as a line it is instant. Market share as a bar chart forces the reader to compare bar heights; as a single stacked bar it shows the parts of a whole at a glance. The chart is not decoration on top of the analysis. It *is* the analysis, delivered.

## How it works

**Start from the sentence you want the reader to think after seeing the chart.** Then pick the type that makes that sentence unavoidable.

- "X is bigger than Y" -> bar, sorted by value.
- "X went up over time" -> line.
- "X and Y move together" -> scatter.
- "X is made of these parts" -> stacked bar (one bar) or a small table.
- "Most values are around here, with a few extremes" -> histogram.
- "The problem is concentrated in this corner" -> heatmap.

**The types to avoid almost always:**

- **Pie charts** for more than 2 or 3 slices. Humans compare angles badly. A sorted bar does the same job better. The one defensible pie is a simple "42% did X, 58% did not".
- **Dual-axis charts** (two different y-scales). The reader cannot tell which line to read against which axis, and you can make any two series look correlated by choosing the scales. If you need two units, use two stacked charts sharing an x-axis.
- **3D anything.** The perspective distorts the values. There is no chart that is better in 3D.
- **Donut, radar, gauge, funnel-as-art.** Occasionally fine, usually a bar in a costume.

**Time is special.** If your x-axis is time, use a line (for a trend) or a bar (for discrete periods you want to compare, like "Q1 vs Q2 vs Q3"). Never a scatter, never sorted by value (time has its own order).

**Categorical x-axis with an inherent order** (small/medium/large, Mon-Sun, age bands) keeps that order. Categorical with no order (regions, products) gets sorted by the value, largest first, so the ranking is the first thing the eye gets.

## When you use it

Before you make the chart, every time. Thirty seconds deciding the type saves ten minutes making a beautiful version of the wrong one.

## A worked example

You have monthly revenue for 4 product lines over 2 years, and the question is "is the new product line growing".

- **Pie of the latest month:** shows the new line is small. Says nothing about growth. Wrong.
- **Stacked bar per month:** shows the total and roughly the mix, but the new line is a thin sliver at the top and its trend is hard to read against a moving baseline. Weak.
- **Line chart, one line per product, 24 months:** the new line's slope is right there. If it is climbing while the others are flat, the answer is yes and the reader sees it in one second. Right.

Same data, three charts, one answer and two non-answers.

> **Try This**
> For a finding in a case, write the one sentence you want the reader to leave with. Pick the chart type that makes that sentence obvious, and name one type that would hide it. Then play Chart Critiquer, where "wrong chart type" is one of the flaws you learn to call.
