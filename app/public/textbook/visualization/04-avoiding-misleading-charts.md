# Avoiding misleading charts

## The one-sentence version

A misleading chart is one where an honest reader draws a conclusion the data does not support, and most of them are made by accident by people who were not paying attention to the axis.

## What it is

The recurring ways a chart lies, whether on purpose or not:

- **Truncated bar axis.** Bars that do not start at zero. A change from 98 to 100 looks like a doubling.
- **Truncated or stretched line axis.** Zooming the y-axis to make a flat trend look dramatic, or zooming out to make a real change look flat.
- **Dual axes.** Two y-scales chosen to make two unrelated series appear to move together.
- **Cherry-picked window.** Starting the x-axis right after a peak so a normal return to baseline looks like a crash, or starting right after a trough so noise looks like growth.
- **Wrong chart for the comparison.** A pie that hides a trend; a 3D bar whose perspective inflates the front row.
- **Area encoding a linear value.** Making a circle's radius proportional to the value, so a 2x value looks 4x.
- **Missing denominator.** Raw counts where the population changed. "Complaints doubled" when the user base tripled.
- **Aggregation hiding a reversal.** A total that goes up while every subgroup goes down (Simpson's paradox).
- **Unlabelled or inconsistent units.** Some values in thousands, some in millions, on the same axis.

## Why it exists

Charting tools auto-scale axes to "fit the data", which by default truncates them. Dual-axis is one checkbox. A slide deck rewards a dramatic-looking chart. And the person making the chart usually already believes the conclusion, so a chart that shows it strongly does not trigger suspicion. Almost all misleading charts in the wild are honest mistakes by someone who did not check.

## How it works

**The checklist, run on every chart before it leaves your hands:**

1. **Bar chart: does the value axis start at zero?** It must. Bars encode length, and length from a non-zero baseline is not proportional to the value. If the differences are too small to see from zero, a bar chart is the wrong choice; use a dot plot or a line, or show the actual numbers.
2. **Line chart: is the y-axis range honest?** Lines encode position and slope, not length, so a non-zero baseline is allowed. But the range should be chosen to show the real variation, not to amplify or flatten it. A good default is to include zero or a meaningful reference (last year, the target), and to keep the aspect ratio such that a meaningful change looks meaningful and noise looks like noise.
3. **Are there two y-axes?** Remove one. Split into two charts sharing an x-axis.
4. **Does the x-axis window include the relevant context?** Show enough history that the reader can judge whether the recent move is unusual. One or two full cycles.
5. **Are you showing a rate or a count?** If the population changed over the period, show the rate, or show both.
6. **Does the total agree with the parts?** If the headline goes one way and the segments go the other, lead with the segments and explain the mix shift.
7. **Are all values in the same unit, labelled?** Check.
8. **Is anything encoded as area or 3D?** Fix it to length or position.

**The honesty standard:** a chart is fine if a smart, skeptical stranger who does not want to be fooled would read it correctly. Show your chart to a colleague and ask what it says. If their answer is stronger or different from what the data supports, the chart is misleading and it is your problem to fix.

## When you use it

As the last step before sharing any chart, and as the first thing you do when reviewing someone else's. It is a two-minute pass and it is the difference between a chart that informs a decision and one that corrupts it.

## A worked example

A team presents: "Customer satisfaction jumped after the redesign." The chart is a bar going from 4.1 to 4.4, y-axis running 4.0 to 4.5. The 4.4 bar is three times taller than the 4.1 bar.

Run the checklist. Bar chart, axis does not start at zero: fail. Redraw from zero and the two bars are nearly the same height, a 7% relative change that might be real but is not a "jump".

Better: show it as a dot plot from 0 to 5 with the two points and a confidence interval on each, plus the sample size. If the intervals overlap, the honest headline is "satisfaction is up slightly, within the margin of error, we should keep watching", which is a different slide.

> **Try This**
> Find a chart (from a case, an article, a dashboard) and run the 8-point checklist on it. Note every point it fails and how you would fix each one. Then play Chart Critiquer, which is this checklist as a game: is that chart safe to act on, or is it working you?
