# Building visuals in Power BI

## The one-sentence version

You build a Power BI visual by picking a chart type and dropping fields into its wells, and the same chart-craft rules from the Visualization book apply, just with Power BI's formatting pane doing the work.

## What it is

A **visual** is one chart, card, table, or map on the report canvas. You create one by clicking a type in the Visualizations pane, then dragging fields from the Fields pane into the visual's **wells**:

- **Axis / Category** — the categorical or date dimension.
- **Values** — the measure(s).
- **Legend** — a second categorical field that splits the series by color.
- **Small multiples** — a field that repeats the visual in a grid.
- **Tooltips** — extra measures shown on hover.
- **Filters** — fields that filter just this visual.

## Why it exists

Power BI's promise is that once the model and measures are right, building visuals is fast and consistent: drag a measure and a dimension, get a chart that responds to every slicer on the page automatically. The report becomes an interactive view of the model rather than a set of static pictures.

## How it works

**The core visual types and their wells:**

- **Card** — one big number. Values well only. Use for KPIs. The newer "Card (new)" supports a reference label ("vs target").
- **Clustered/stacked bar and column** — Axis + Values (+ Legend). Follow the bar-chart rules: sort by value (visual > ... > Sort axis), start at zero, one accent color.
- **Line chart** — Axis (a date) + Values (+ Legend). For trends.
- **Table / Matrix** — the matrix is a pivot table: fields on Rows, fields on Columns, measures in Values. Supports subtotals, expand/collapse, and conditional formatting per cell.
- **Slicer** — one field, becomes an interactive filter for the whole page.
- **Map / Filled map** — a geographic field (country, state, lat/long) + a measure.
- **KPI** — a value, a target, and a trend axis in one visual.

**Formatting (the paint-roller tab), the settings that matter:**

- **Data labels** — on or off per series. On for bar charts where exact values help; off when the axis suffices.
- **Sort** — the "..." menu on the visual > Sort axis > by the measure, descending.
- **Colors** — Format > Bars/Columns > default color, and use "fx" (conditional formatting) to color one bar or color by a rule.
- **Title** — write the finding, not the field name. Format > Title > Text.
- **Axis** — set the start (0 for bars), format the number, hide gridlines you do not need.
- **Legend** — position it, or turn it off and rely on direct context.

**Interactions between visuals:** by default, clicking a bar in one visual cross-filters the others on the page. Format > Edit interactions lets you change whether each other visual filters, highlights, or ignores the selection. A slicer filters; a detail table might highlight; a context KPI might ignore.

**Field-level controls:** a measure or column dropped in a well has its own menu (rename for this visual, change the aggregation for an implicit measure, apply a visual-level filter, sort by it).

**Reuse and consistency:** copy a formatted visual (Ctrl+C / Ctrl+V) and swap its fields to keep styling consistent. Or set up a **report theme** (View > Themes) once, so every new visual inherits the fonts, colors, and defaults.

## When you use it

After the model is a star and the base measures exist. Then building the report is drag, format, repeat. If you find yourself unable to make a visual show what you want, the problem is usually upstream (a missing measure, a wrong relationship, a field on the wrong table), not the visual.

## A worked example

A one-page sales overview from an existing model with `[Total Revenue]`, `[Order Count]`, `[Margin %]`, and a Date table:

1. Three cards across the top: `[Total Revenue]`, `[Order Count]`, `[Margin %]`. Format each with a big font, a short title, and a target reference label.
2. A line chart below: Axis = `'Date'[month]`, Values = `[Total Revenue]`. Title: "Revenue trending up 8% this year". One line, no legend.
3. A bar chart bottom-left: Axis = `Products[category]`, Values = `[Total Revenue]`, sorted descending, one grey with the top bar accented.
4. A matrix bottom-right: Rows = `Stores[region]`, Values = `[Total Revenue]`, `[Margin %]`, with conditional formatting so the low-margin region's cell is tinted.
5. A `Products[category]` slicer and a `'Date'[year]` slicer top-right.
6. View > Themes: apply a theme so colors and fonts are consistent.

Click a category in the bar chart and the cards, line, and matrix all filter to it. That interactivity came free from the model.

> **Try This**
> Build a 4-visual page from a case model: two cards, one line by month, one sorted bar by a category. Format each to the Visualization book's standards (finding as the title, sorted, one accent, honest axis). Click a bar and watch the page cross-filter.
