# Color use in charts

## The one-sentence version

Color in a chart is a channel that carries meaning, so every color should mean something, and a chart with no color decision reads as noise.

## What it is

Three jobs color does in a chart, each with its own kind of palette:

- **Categorical** — distinguishing groups with no order (regions, products). Distinct hues, no implied ranking. Use as few as you can, ideally 2 to 5. Beyond about 7, colors stop being distinguishable and you should switch to small multiples or direct labels.
- **Sequential** — showing magnitude on an ordered scale (low to high). One hue, light to dark. Used for heatmaps and choropleth maps.
- **Diverging** — showing distance from a meaningful midpoint (below/above target, negative/positive change). Two hues meeting at a neutral center.

And one job that is not about data:

- **Emphasis** — one accent color on the element that matters, everything else grey. This is the highest-value use of color in an analyst's chart.

## Why it exists

Charting tools assign a rainbow by default: every series gets its own bright hue, whether the series are ordered or not, whether one matters more than the others or not. That rainbow implies distinctions that are not in the data and buries the one distinction that is. Making a deliberate color choice is what turns a busy chart into a clear one.

## How it works

**The rules:**

1. **Grey is the default; color is the exception.** Start with everything grey. Add color only where it carries meaning: the one series that is the point, or the categorical split that the whole chart is about.
2. **One accent per chart.** If two things are colored, the reader does not know which one to look at.
3. **Match the palette to the data type.** Never use a categorical rainbow for ordered data (it makes "high" and "medium" look unrelated). Never use a sequential ramp for unordered categories (it implies a ranking that is not there).
4. **Keep color meaning consistent** across every chart in a report. If "West" is blue on slide 3, it is blue on slide 8. If green means "good" once, it means "good" everywhere.
5. **Do not rely on color alone.** About 1 in 12 men cannot distinguish red from green. Add a second channel: direct labels, different line styles, position, or a shape marker. (Full chapter on this later.)
6. **Semantic colors carry baggage.** Red reads as bad or negative, green as good, in most Western business contexts. Do not color your "loss" bars green because it looked nicer.

**Where to get a palette:** use your organisation's brand palette if it has one and it is legible. Otherwise, a purpose-built set (ColorBrewer for sequential and diverging, a curated categorical set of muted hues). Avoid pure saturated primaries at full strength for large fills; they vibrate and tire the eye. Muted, slightly desaturated colors read as more professional and are easier to look at.

**Contrast against the background.** A light-grey line on a white background disappears. A pale yellow on white is invisible. Test the chart at the size it will actually be shown, in the medium it will be shown in (a projector washes out low-contrast colors badly).

## When you use it

Every chart. The decision is quick: is this categorical, sequential, diverging, or just "one thing matters"? Pick the matching approach, keep it to one accent, and reuse the same colors for the same things across the whole deliverable.

## A worked example

A chart of monthly revenue for 6 regions, and the finding is that the West region turned around this quarter.

**Default:** 6 bright lines, a legend, the reader hunting for West.

**Fixed:** all 6 lines light grey, except West in a single accent blue. West is labelled directly at the end of its line ("West"). No legend needed, because only one line is identified and the other 5 are context, not subjects. The reader's eye goes straight to the blue line and its upturn.

If the question were instead "how do all 6 regions compare", small multiples (6 mini-charts in a grid, each with one region highlighted against the faint others) beats 6 colors on one chart.

> **Try This**
> Take a multi-series chart from a case. Identify whether the series are categorical, ordered, or "one matters". Recolor accordingly: for "one matters", grey everything and accent the one. Check it still makes sense printed in greyscale.
