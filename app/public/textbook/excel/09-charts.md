# Charts: bar, line, scatter, combo

## The one-sentence version

Four chart types cover almost everything an analyst needs to show, and picking the right one is mostly about what kind of comparison you are asking the reader to make.

## What it is

Select data, Insert, and pick a chart. Excel draws it and links it to the cells, so it updates when they change. Every chart has the same parts: a plot area, axes, a title, optionally a legend, data labels, and gridlines. Most of the skill is removing the parts you do not need.

## Why it exists

A table makes the reader do the comparison in their head. A chart does the comparison for them: taller means more, this line is above that one, these points cluster. The right chart turns a five-second stare at numbers into an instant read.

## How it works

**Bar / column chart:** comparing a value across categories (revenue by store, headcount by team). Columns for a few categories, horizontal bars when there are many or the labels are long. Sort the bars by value unless the categories have a natural order (months, sizes). Start the value axis at zero: a bar chart is a length comparison and a cut axis lies.

**Line chart:** a value over time, or any continuous progression. One line, or a few lines to compare series. Do not use a line for separate categories that are not a sequence, a smooth line implies the space between points means something.

**Scatter chart (XY):** the relationship between two numeric variables (ad spend vs revenue, price vs units sold). Each point is one observation. Look for the shape: rising, falling, curved, or a shapeless cloud (no relationship). Add a trendline (right-click a point, Add Trendline) and show the R-squared if it helps, but a cloud with a forced line through it still means "no relationship".

**Combo chart:** two series with different scales on one chart, one as columns and one as a line, with a secondary axis. Revenue (columns, left axis) and conversion rate (line, right axis) over months. Powerful and easy to abuse: two independent axes can be scaled to make anything look correlated, so use it only when the two things genuinely belong together and label both axes.

**Pie chart:** parts of one whole, and only when there are about three to five slices and one clearly dominates. Past five slices it is unreadable and a sorted bar chart is better. Never use it to compare two pies over time.

**Cleaning a chart up:** delete the chart title if the surrounding text already says what it is. Delete the legend if there is one series. Delete gridlines unless the reader needs to estimate values. Delete the axis line. Add direct data labels instead of making the reader trace to the axis. The default Excel chart has too much; a good one has almost nothing but the data.

## When you use it

Bar for "compare across categories". Line for "over time". Scatter for "is X related to Y". Combo for "these two metrics, together". If you cannot say in one sentence what comparison the chart is for, you do not have a chart yet, you have decoration.

## A worked example

You have monthly revenue for six stores. The question is "which stores are growing and which are flat".

A line chart with six lines is a tangle. Better: a small-multiples idea, six little line charts, one per store, same axes, so the shapes are directly comparable. Or a bar chart of "this month vs same month last year" per store, so growth is a single length per store. The data is the same; the second chart answers the actual question in one glance.

> **Try This**
> Build a chart for any case finding. Then delete every element that is not the data itself and see if it still reads. Play Chart Critiquer to sharpen the instinct for when a chart is working the reader instead of informing them.
