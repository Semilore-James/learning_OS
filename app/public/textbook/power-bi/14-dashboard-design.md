# Dashboard design principles

## The one-sentence version

A Power BI report people actually use has one clear purpose per page, a first page that answers the top question at a glance, and enough restraint that nobody has to be trained to read it.

## What it is

The design layer on top of a working model: what each page is for, what goes where, how the pages connect, and everything you leave out. This chapter is the Visualization book's dashboard-layout advice applied to Power BI specifically, plus the tool's own performance and maintenance concerns.

## Why it exists

Power BI makes it very easy to keep adding visuals, pages, slicers, and custom visuals until the report is a maze that only its author can navigate. The reports that survive are the disciplined ones. Design is the discipline.

## How it works

**One purpose per page, stated.** Page 1 = "are we on track this month". Page 2 = "where is the problem". Page 3 = "detail for one thing". Write the purpose in a text box on the page or at least in your head, and cut any visual that does not serve it.

**The first page is the answer.** Top-left to bottom-right:

- **KPI cards** across the top, each with a comparison built in (vs target, vs last year). A number alone is not a KPI.
- **The primary trend** below: the one line chart that shows direction over time.
- **The main breakdown** under that: a sorted bar or a small matrix showing where the number comes from.
- Slicers top-right (date, one or two segments), defaulted to the common view.

If the reader has to click or scroll to get the headline, the page is wrong.

**Consistency is usability:**

- Same color for the same thing on every page and every visual. Set a **report theme** (View > Themes > Customize) so this is enforced, not manual.
- Same chart type for the same metric. Do not show revenue as a line here and a gauge there.
- Aligned to a grid. Use the alignment tools; ragged edges read as careless.
- Consistent titles: the finding, not the field name.

**Subtraction:**

- For each visual: if it were gone, what decision could the reader not make? "None" -> cut it.
- Aim for one screen per page, no scroll.
- Custom visuals from the marketplace: use sparingly. Each one is a dependency that can break, slow the report, or raise a governance flag. The built-ins cover most needs.

**Performance (Power BI-specific):**

- **Fewer visuals per page.** Every visual is a separate query. 20 visuals on a page is 20 queries per interaction. Keep it to ~8.
- **Import mode, star schema, measures not calculated columns.** Covered earlier; they are also the biggest performance levers.
- **Turn off "Auto date/time"** (Options > Data Load) and use your own Date table. Auto date/time creates a hidden table per date column and bloats the model.
- Use the **Performance Analyzer** (View > Performance analyzer) to record a page interaction and see which visual is slow.
- Avoid bidirectional cross-filtering and many-to-many relationships unless you truly need them.

**Maintainability:**

- Measures in one `_Measures` table, named plainly.
- Hide technical columns and key columns from the report view.
- Keep a "Notes" or "About" page with the data sources, the refresh schedule, metric definitions, and who owns it.
- Develop in a separate workspace; publish to the shared one only when ready.

**Accessibility:** Power BI has a built-in check (some versions) and tab-order settings (Selection pane > Tab order). Set a sensible tab order, provide alt text on key visuals (Format > General > Alt text), and do not rely on color alone. The Visualization book's accessibility chapter applies directly.

## When you use it

Continuously, but especially at the end: before publishing, do a design pass. Purpose per page, headline on page 1, theme applied, visuals culled, performance analyzer run, notes page written. Then publish.

## A worked example

A sales report request that started as "put everything on a dashboard" and grew to 6 pages and 40 visuals nobody could navigate.

Redesigned to 3 pages:

- **Overview** (purpose: on track for the quarter?): 4 KPI cards with vs-target labels, a revenue-pace line against the quota line, a sorted bar of revenue by region with the weak one accented, a `year` and `region` slicer defaulted to current year / all regions. One screen.
- **Diagnose** (purpose: where is the gap?): a matrix of region by product with margin heat, a waterfall of revenue change vs last quarter, a small "top 5 declining accounts" table. Drill-through target set to `account_name`.
- **Account detail** (hidden, drill-through only): one account's trend, product mix, contacts, open issues, Back button.

Plus a page navigator, a "Reset" bookmark button, a theme applied, Auto date/time off with a real Date table, and an About page. Performance Analyzer shows the slowest page renders in under 2 seconds. The Monday meeting now opens with the Overview page instead of a data pull.

> **Try This**
> Take a case report and do the design pass: one purpose per page written down, the headline answer on page 1 top-left, a theme applied for consistency, every non-essential visual cut, and Performance Analyzer run to find the slowest visual. Then write the About page.
