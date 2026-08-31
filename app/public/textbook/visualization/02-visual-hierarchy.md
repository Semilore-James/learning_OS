# Principles of visual hierarchy

## The one-sentence version

Visual hierarchy is making the most important thing on the chart the most visually prominent, and making everything else quiet, so the eye lands on the point before it reads a word.

## What it is

A chart has a hierarchy whether you designed one or not. The reader's eye goes first to whatever is biggest, darkest, most saturated, most isolated, or most different from its neighbours. Visual hierarchy is deliberately controlling that order:

1. The finding (one bar, one line, one region).
2. The context that makes the finding legible (the other bars, the axis, the comparison baseline).
3. The scaffolding (gridlines, tick labels, the chart border).

## Why it exists

The default output of every charting tool gives equal weight to everything: every bar the same colour, every gridline the same as every other, the title the same size as a footnote. The reader then has to do the work of figuring out what matters. A chart with hierarchy has done that work for them, which is the whole job.

## How it works

**The tools for making something prominent, roughly in order of strength:**

- **Colour.** One coloured element against grey is the strongest signal there is. Use it once per chart.
- **Size and weight.** A thicker line, a bigger label, bold text.
- **Position and isolation.** Something set apart, or at the top, or labelled directly.
- **Contrast.** Dark against light.

**The tools for making something recede:**

- Grey it. Light grey is "present but not the point".
- Shrink it or thin it.
- Remove it. The strongest way to de-emphasise a gridline is to delete it.

**Apply it:**

1. Decide the one thing the reader should see first. Give it the colour.
2. Everything in the same series that is *not* the point becomes a single neutral grey.
3. Mute the axis: light grey ticks and labels, no axis line or a faint one, gridlines only if values must be read off them and then very light.
4. The title states the finding in words ("Ikeja is 33% below the next-lowest store"), not the category ("Revenue by store"). The title is the loudest text and it should carry the message.
5. Label the important element directly, next to it, instead of making the reader trace to a legend.

**The test:** squint at the chart, or look at it for half a second and look away. What did you see? If it was the finding, the hierarchy works. If it was a wall of same-coloured bars, it does not.

## When you use it

On every chart that goes in front of another person. Exploratory charts for yourself can stay default; the moment a chart has an audience, it needs a hierarchy, and adding one takes about a minute once it is a habit.

## A worked example

Revenue by store, 12 stores, and the finding is that one store (Ikeja) is far below the rest.

**Default version:** 12 blue bars, unsorted, a legend, medium gridlines, title "Store Revenue". The reader scans all 12, finds the short one, reads the label. Five seconds of work.

**With hierarchy:**

- Bars sorted ascending, so Ikeja is on the left where the eye starts.
- Ikeja's bar is coloured (a warm accent). The other 11 are one flat grey.
- No legend (only one thing is coloured, and it is labelled directly: "Ikeja £1.2M" sits at the end of its bar).
- Gridlines gone; a single reference line at the median with a small label "median £1.8M".
- Title: "Ikeja is 33% below the next-lowest store".

Now the reader looks at it and immediately thinks the sentence you wanted them to think. The chart did the work.

> **Try This**
> Take a default bar chart from a case analysis. Sort it, grey everything except the one bar that matters, delete the gridlines and legend, label the key bar directly, and rewrite the title as the finding. Compare the half-second impression before and after.
