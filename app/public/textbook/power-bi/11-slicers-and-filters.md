# Slicers and filters

## The one-sentence version

Power BI has several layers of filtering, from a slicer the user clicks to a filter baked into the report they never see, and knowing which layer to use keeps a report both flexible and safe.

## What it is

The filter layers, from most visible to least:

- **Slicer** — a visual on the canvas the user interacts with (a list, dropdown, date range, buttons).
- **Cross-filtering** — clicking a data point in one visual filters the others.
- **Visual-level filter** — applies to one visual only, set in the Filters pane.
- **Page-level filter** — applies to every visual on one page.
- **Report-level filter** — applies to every visual on every page.
- **Filters in the query / model** — Power Query filters or a DAX measure's own `CALCULATE` filter. The user cannot change these and often cannot see them.

They all combine (intersect). A visual shows rows that pass the slicer AND the page filter AND the visual filter AND the model filter.

## Why it exists

Different needs. The user should control the date range and maybe the region (slicers). The analyst wants "this page is always about completed orders" without a visible control (page filter). And "this report never shows test accounts" belongs in the query so it can never be turned off. Putting every filter as a slicer clutters the page; hiding filters the user needs is frustrating. The layers let you place each filter at the right level of visibility and permanence.

## How it works

**Slicers:**

- One field per slicer. Format > Slicer settings to choose the style: list, dropdown, between (numeric/date range), relative date ("last 30 days").
- **Sync slicers across pages:** View > Sync slicers. So the region the user picks on page 1 carries to page 2.
- Set a sensible default selection so the report is useful with zero clicks.
- A slicer with hundreds of values should be a dropdown with search, not a list.
- Buttons/tiles style is good for a small set (a 3-way status toggle).

**The Filters pane** (right side, in edit mode) is where visual/page/report filters live:

- Drag a field into the "Filters on this visual" area, set a condition. Common: filter a top-N visual to `Top 10 by [Total Revenue]`.
- "Filters on this page" for a page-wide constraint.
- "Filters on all pages" for report-wide.
- You can **hide** a filter from the reader (the eye icon) so it applies invisibly, or **lock** it so they see it but cannot change it.

**Cross-filtering behaviour** is set per visual pair via Format > Edit interactions (the toolbar toggles when a visual is selected): each other visual can be set to Filter, Highlight, or None. Turn cross-filtering off for context visuals that should always show the full picture.

**The TREATAS / measure-filter approach** for filters that depend on logic: rather than a page filter, a measure can carry its own `CALCULATE(..., Sales[status] = "completed")`. Use this when only *some* metrics on the page should be restricted.

**Decide the layer by two questions:**

1. Should the user be able to change it? Yes -> slicer. No -> a hidden page/report filter or a model filter.
2. Should it ever be possible to turn it off? Yes -> report filter (hidden/locked). Absolutely not (test data, deleted rows) -> Power Query.

## When you use it

Every report has at least a date slicer and usually a region or category slicer. Add page filters for pages with a fixed focus. Push the "always exclude" rules (test accounts, cancelled-and-refunded rows) down to Power Query so they are permanent and cheap.

## A worked example

A sales report, 3 pages: Overview, By Region, By Product.

- **Power Query:** filter out `account_type = "internal_test"` on load. Permanent, invisible, correct.
- **Report-level filter (hidden):** `order_date >= 2024-01-01`. The report is not meant to show older data; hiding it stops anyone accidentally pulling 2019.
- **Synced slicers (all pages):** a `'Date'[year]` dropdown and a `Stores[region]` list. The user's selection follows them across pages.
- **Page-level filter on "By Product":** `Products[discontinued] = false`, because that page is about the current catalogue.
- **Visual-level filter** on the "top movers" bar chart: Top 10 by `[Revenue Growth]`.
- **Edit interactions:** the KPI cards ignore cross-filtering from the bar charts, so they always show the region/year totals, not a single clicked bar.

Every filter is at the level that matches how permanent and how visible it should be.

> **Try This**
> On a case report, add a synced date and category slicer, a hidden page filter for one page's focus, and a Power Query filter for rows that should never appear. Then use Edit interactions to make one card ignore cross-filtering.
