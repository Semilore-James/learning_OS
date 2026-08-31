# Line charts done right

## The one-sentence version

The line chart shows how a value moves over an ordered axis, and doing it right is about an honest y-range, few enough lines to follow, and letting the reader see enough history to judge the recent move.

## What it is

Points connected in order, where the x-axis has a natural sequence, almost always time. The line's job is to show **direction and rate of change**: is it going up, how fast, is it accelerating, did it turn.

Variants:

- **Single line** — one metric over time.
- **Multi-line** — a few series compared over the same period.
- **Small multiples** — a grid of single-line charts, one per series, sharing axes. The right answer once you have more than ~4 series.
- **Area chart** — a filled line, used when the magnitude of the total matters (and stacked area for parts of a whole over time, though the upper bands are hard to read).

## Why it exists

Time is the most common thing an analyst tracks, and a line is the only chart that makes a slope directly visible. A table of monthly numbers requires the reader to compute the trend in their head. A bar chart of the same months shows the levels but makes the shape of the change harder to see. The line hands the reader the trajectory.

## How it works

**The y-axis:**

- Unlike bars, a line does **not** have to start at zero, because a line encodes position and slope, not length. Truncating is allowed.
- But the range still has to be honest. Choose it to show the real variation at a natural scale. A common, defensible choice: include zero if the values are not too far above it, otherwise anchor to a meaningful reference like last year's level or the target. Do not pick a range that turns 1% noise into a cliff or a 30% drop into a wiggle.
- Aspect ratio matters. Very wide and short flattens everything; very tall and narrow exaggerates. A moderate ratio where a meaningful change looks meaningful is the goal ("banking to 45 degrees" is the classic rule of thumb for the average slope).

**The x-axis:**

- Show enough history for context. If the reader needs to know whether this month is unusual, they need to see a year or two, or a couple of full seasonal cycles.
- Keep the time intervals even. Do not skip missing months by butting the points together; leave the gap or interpolate and say so.
- Label the axis at sensible intervals (every quarter, every year), not every single point.

**The lines:**

- One to three lines, distinguished by color, is fine. Label each line directly at its right end, not in a legend.
- More than three or four: switch to small multiples. Ten lines on one chart is a "spaghetti chart" and nobody can follow their own line.
- The line that matters gets the accent color; the rest go grey as context.
- Do not add markers on every point unless the points are few and each one is a real observation you want the reader to register. For dense daily data, markers are clutter.

**Smoothing:** a rolling average can reveal a trend hidden in noisy daily data, but it also hides the noise, which is sometimes the story (a spike, a step change). If you smooth, show the raw series faintly behind the smoothed line, and say the window ("7-day average").

**Forecasts and gaps:** if part of the line is projected, style it differently (dashed) and label it. If data collection changed partway (a new tracking tool), mark the seam.

## When you use it

Any metric over time where the trend is the point: revenue, active users, error rate, conversion, headcount. Use bars for time only when there are few periods and you want them compared as blocks. Never use a line for a categorical x-axis with no order (connecting "North" to "South" implies a path that does not exist).

## A worked example

Weekly signups for a year, and the question is whether the recent dip is a problem.

**Weak:** last 6 weeks only, y-axis 800 to 1,000, a steep-looking drop from 950 to 870.

**Strong:** all 52 weeks, y-axis 0 to max with a light gridline at the annual average. The full view shows signups oscillate between roughly 800 and 1,100 every few weeks all year, and the "dip" to 870 is well inside that normal band. A faint 4-week rolling average line makes the underlying trend (flat) visible. Title: "Signups holding steady; recent week is within normal weekly variation".

The 6-week version would have launched an investigation. The full-context version correctly says there is nothing to see.

> **Try This**
> Take a time series from a case. Plot it two ways: a short recent window with a tight y-axis, and the full history with an honest axis and a reference line. Notice how differently the same recent movement reads. Ship the honest one.
