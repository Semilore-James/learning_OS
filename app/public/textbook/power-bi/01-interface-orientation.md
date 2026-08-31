# Power BI interface orientation

## The one-sentence version

Power BI Desktop is really three tools stacked in one window, and knowing which of the three you are in at any moment is what stops the early confusion.

## What it is

**Power BI Desktop** is the free Windows application where you build reports. It has three views, switched from the icons on the left edge:

- **Report view** — the canvas where you drag fields onto visuals and lay out pages. Where you spend most of your time once the data is ready.
- **Table view** (formerly Data view) — a spreadsheet-like look at each loaded table. Where you write calculated columns and check that your data loaded correctly.
- **Model view** — a diagram of your tables and the relationships between them. Where you connect tables and manage the data model.

Separately, **Power Query Editor** opens in its own window (Home > Transform data) and is where you clean and shape data *before* it lands in the model.

And **Power BI Service** is the website (app.powerbi.com) where you publish reports so others can view them. Desktop is for building; Service is for sharing.

## Why it exists

The workflow has distinct stages (get data, shape it, model it, calculate, visualise, publish) and each stage has its own surface. Beginners get lost because they try to fix a data problem in Report view, or write a measure in Power Query, and nothing works the way they expect. The tool is not one thing; it is a pipeline, and each view is one station on it.

## How it works

**The panels in Report view:**

- **Fields pane** (right) — every table and every column/measure in your model. You drag from here onto visuals.
- **Visualizations pane** (right) — pick a chart type, then the "wells" (Axis, Values, Legend, Filters) where you drop fields to configure it. The format (paint-roller) tab is where you style the selected visual.
- **Filters pane** — filters at three scopes: this visual, this page, all pages.
- **Canvas** (center) — the report page. Multiple pages are tabs along the bottom.

**The ribbon** (top) has the actions: Get data, Transform data (opens Power Query), New measure, New visual, Publish.

**The typical build order:**

1. **Get data** (ribbon) — connect to a source.
2. **Transform data** — clean and shape in Power Query, then Close & Apply.
3. **Model view** — check/fix relationships between tables.
4. **Table view** — add any calculated columns; sanity-check the data.
5. **New measure** — write the DAX measures for your metrics.
6. **Report view** — build the visuals.
7. **Publish** — push to the Service.

You will loop back (a measure needs a column that needs a Power Query step), but that is the spine.

**The .pbix file** is your whole project: the queries, the model, the measures, the report layout, and (unless you configured otherwise) a cached copy of the data. One file, save it often, it can get large.

## When you use it

Right now, before touching data. Spend ten minutes clicking between the three views and opening Power Query, just to build the mental map of where each kind of work happens. Every later chapter assumes you know which view it is talking about.

## A worked example

You load a sales CSV and the `revenue` column shows up as text, so `SUM` does not work.

- **Wrong instinct:** go to Report view, try to fix it in the visual. There is no option to; visuals display data, they do not repair it.
- **Right move:** Home > Transform data to open Power Query, click the `revenue` column header, change its type to Decimal Number, Close & Apply. Back in Report view, `revenue` now sums.

The fix belonged to the shaping stage (Power Query), not the visualising stage (Report view). Knowing that is the orientation.

> **Try This**
> Open Power BI Desktop, load any CSV, and visit all three views plus Power Query. For each, write one sentence on what kind of work happens there. Keep that note; the rest of the book refers to these views constantly.
