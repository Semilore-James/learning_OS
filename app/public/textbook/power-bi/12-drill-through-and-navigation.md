# Drill-through and report navigation

## The one-sentence version

Drill-through and navigation turn a set of pages into a report someone can move around in, from a summary down to the detail behind one number, and back.

## What it is

- **Drill-down** — within one visual, moving through a hierarchy (Year -> Quarter -> Month, or Region -> City -> Store) using the drill controls in the visual's header.
- **Drill-through** — right-clicking a data point and jumping to a dedicated detail page that is automatically filtered to that point.
- **Buttons and bookmarks** — navigation controls: a button that goes to another page, or applies a saved state (filters + visibility) called a bookmark.
- **Page navigator / bookmark navigator** — auto-generated button bars for moving between pages or bookmarks.

## Why it exists

A good report answers the top question on the first page ("are we on track?") and lets the reader pursue the follow-up ("which region is the problem, and what's driving it?") without you building every possible breakdown up front. Drill-through means one detail page serves every category, region, or product. Navigation means the reader is not scrolling through 15 pages hunting for the one they need.

## How it works

**Drill-down (within a visual):**

- Put a hierarchy in the Axis well (drag `Year`, then `Quarter`, then `Month`, or use a defined hierarchy from the Fields pane).
- The visual header shows drill controls: a down-arrow (drill mode), a double-arrow (go to next level for all), and a fork (expand one level, keeping the parent).
- The reader clicks a bar to drill into just that year's quarters, then again into that quarter's months.

**Drill-through (to another page):**

1. Make a detail page (e.g. "Store Detail").
2. On that page, drag the field you want to drill by (`Stores[store_name]`) into the **Drill through** well in the Filters pane.
3. Optionally add a "Back" button (Insert > Buttons > Back) so the reader can return.
4. Now, anywhere in the report, right-clicking a store (in a bar, a table row) shows "Drill through > Store Detail", and clicking it opens that page filtered to that store.

The detail page can carry the drill-through filter plus any other filters the reader had applied ("keep all filters" toggle). It typically holds a full breakdown: that store's monthly trend, its product mix, its top customers, its outstanding issues.

**Buttons and bookmarks:**

- **Bookmark** (View > Bookmarks > Add) captures the current state: which filters are set, which visuals are visible, the current page. Name it.
- **Button** (Insert > Buttons): set its Action to Page navigation (go to a page), Bookmark (apply a saved state), or Back.
- Use bookmarks for: a "reset filters" button, a toggle between two chart views in the same space (show/hide visuals), a guided-tour sequence.
- **Page navigator** (Insert > Buttons > Navigator > Page navigator) auto-builds a button per page, styled consistently. Beats hand-making a nav bar.

**Tooltips as mini-reports:** make a page, set its Page information > Allow use as tooltip, size it small (Page size > Type: Tooltip). Assign it in a visual's Tooltip settings. Now hovering a bar shows a small custom card (a sparkline, a couple of stats) instead of the default value list.

## When you use it

- **Drill-down** for any visual with a natural hierarchy the reader might want to explore (time, geography, org structure).
- **Drill-through** once you have a summary page and the obvious follow-up is "show me everything about this one thing". One detail page, reused.
- **Navigation buttons** as soon as the report has more than 3 or 4 pages, or when two views should share screen space.

## A worked example

A regional sales report:

- **Page 1, Overview:** KPIs, a revenue trend, a bar of revenue by region. The region bar has a Region -> City -> Store hierarchy, so a curious reader can drill down in place.
- **Page 2, Store Detail** (hidden from the nav): drill-through field = `store_name`. Contains that store's monthly revenue, product mix, staff count, and open tickets. A Back button top-left.
- The reader on Page 1 sees the West region is low, drills the bar into West's cities, sees Ikeja is the weak one, right-clicks Ikeja > Drill through > Store Detail, and lands on a full page about Ikeja, filtered automatically.
- A **page navigator** button bar along the top switches between Overview, By Product, and By Customer.
- A **"Reset"** button (bookmark) clears all slicers back to the default view.

One detail page serves all 40 stores, and the reader can follow their own trail from the headline to the root without you having pre-built 40 pages.

> **Try This**
> On a case report, build a summary page and one drill-through detail page (drill field = a category or store). Add a Back button. From the summary, right-click a data point and drill through. Then add a page navigator so moving between pages is one click.
