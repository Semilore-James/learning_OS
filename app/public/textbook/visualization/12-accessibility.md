# Accessibility in charts

## The one-sentence version

An accessible chart is one that still works for a reader who cannot distinguish certain colors, is using a screen reader, or is looking at a low-quality projection, and building for that also makes the chart clearer for everyone.

## What it is

Designing so the chart's meaning survives:

- **Color vision deficiency** — about 1 in 12 men and 1 in 200 women cannot reliably tell red from green (the most common type). Some cannot tell blue from purple, or see color at all.
- **Screen readers** — a blind reader gets the alt text and the surrounding text, not the pixels.
- **Low vision** — small labels, thin lines, and low contrast disappear.
- **Poor display conditions** — a washed-out projector, a phone in sunlight, a greyscale printout, a colorblind-simulation filter someone applied.

## Why it exists

The default chart relies almost entirely on color to carry meaning: series identity, categories, good vs bad. For a large minority of readers, some of those colors are indistinguishable, so the chart becomes a puzzle or a wrong conclusion. And the fixes (a second visual channel, readable text, direct labels) are things a well-made chart wants anyway.

## How it works

**Never rely on color alone.** Every distinction color makes should be made by a second channel too:

- **Lines:** vary the line style (solid, dashed, dotted) as well as the color, and label each line directly at its end.
- **Bars and areas:** rely on position and direct labels; if you must distinguish two categories in the same bar, add a texture or a border, or better, split into two charts.
- **Categorical points on a scatter:** use different marker shapes (circle, triangle, square) as well as colors.
- **Good vs bad:** an up or down arrow, a `+`/`-` sign, or the word, next to the colored number.

**Choose colorblind-safe palettes.** Use a palette designed for it (Okabe-Ito, ColorBrewer's colorblind-safe sets, Viridis for sequential). Avoid red-and-green as the two contrasting colors; blue-and-orange is a safe high-contrast pair. Check your chart with a simulator (browser extensions and design tools have them) or just render it in greyscale: if two series become the same grey, add the second channel.

**Contrast:**

- Text and lines need enough contrast against the background. Aim for the WCAG ratio of at least 3:1 for large text and graphical elements, 4.5:1 for body-size text. Light grey on white usually fails.
- Data marks should be darker and heavier than gridlines and axes, so the hierarchy is a contrast hierarchy too.

**Text:**

- Label text large enough to read at the size the chart will actually be shown. If it goes on a slide, test it from the back of a room.
- Avoid all-caps for anything longer than a short label; it is slower to read.
- Do not put essential information only in a hover tooltip; a printout or a screen reader will not get it.

**For screen readers and non-visual access:**

- Give every chart a text **alt description** that states the takeaway and the key numbers: "Bar chart. Ikeja store revenue is £1.2M, 33% below the next-lowest store; the other 11 stores range from £1.8M to £2.4M." Not "chart of revenue by store".
- Where the platform supports it, provide the underlying data as a table alongside the chart. A table is fully accessible; a chart image is not.
- The chart's title and the surrounding prose should convey the finding on their own, so a reader who cannot see the chart still gets the point from the words around it.

## When you use it

On every chart that goes to more than one person, which is most of them. It is a short checklist run at the end: greyscale test, second channel on every color distinction, contrast check, readable text, an alt description. Five minutes, and the chart reaches everyone.

## A worked example

A chart comparing conversion for two campaigns over 12 weeks: two lines, one red (Campaign A), one green (Campaign B), distinguished only by color, identified by a legend.

For a red-green colorblind reader this is one indistinguishable line that occasionally splits into two, with a legend they cannot use.

Fixed: Campaign A is a solid dark line, Campaign B a dashed line, both in a colorblind-safe blue and orange. Each is labelled at its right end ("Campaign A", "Campaign B") so the legend is gone. Alt text: "Line chart, weekly conversion. Campaign B (dashed) overtakes Campaign A (solid) in week 5 and ends 1.2 points higher, 4.8% vs 3.6%." The chart now works in greyscale, for colorblind readers, and for a screen reader.

> **Try This**
> Take a multi-series chart from a case. Render it in greyscale and check every series is still distinguishable. Add a second channel (line style or marker shape) to any distinction that was color-only. Write a one-sentence alt description that states the finding and the key numbers.
