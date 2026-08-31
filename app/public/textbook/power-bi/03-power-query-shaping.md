# Power Query (M): shaping data in the query editor

## The one-sentence version

Power Query is where you clean and reshape data before it enters the model, by clicking transformations that stack into a repeatable recipe, so every refresh gets the same treatment.

## What it is

The **Power Query Editor** (Home > Transform data) is a separate window with:

- A preview of the current table.
- **Applied Steps** (right) — an ordered list of every transformation you have done. This is the recipe. You can click any step to see the table at that point, reorder steps, edit them, or delete them.
- The ribbon, full of transformations: remove columns, filter rows, change type, split, replace values, group by, pivot, unpivot, merge, append.

Every click writes a line of **M**, the language underneath Power Query. You rarely write M by hand at first; the ribbon generates it. View > Advanced Editor shows the full M script for the query.

## Why it exists

The alternative is cleaning the data manually every time it updates, or writing a cleaning script and running it separately. Power Query makes the cleaning part of the connection: define the steps once, and every scheduled refresh replays them on the fresh data automatically. It is a reproducible pipeline with a point-and-click front end.

## How it works

**The common transformations, and when each is used:**

- **Promote headers** — if the first row is column names, Transform > Use first row as headers.
- **Change type** — click a column's type icon, pick the right type. Do this early and deliberately; a wrong type breaks everything downstream. Power Query auto-adds a "Changed Type" step on load that is often wrong; fix it.
- **Remove columns** — Home > Remove columns, or right-click > Remove other columns to keep a whitelist. Cut everything the model does not need.
- **Filter rows** — click the column dropdown, uncheck values or set a condition. Filter early so later steps process fewer rows.
- **Remove duplicates / Remove blank rows** — Home menu.
- **Replace values** — right-click a column > Replace values, or Transform > Replace values. For standardising ("USA" -> "United States").
- **Split column** — by delimiter or by position. Turns `"Lagos, NG"` into two columns.
- **Trim / Clean / Lowercase** — Transform > Format. Removes whitespace and non-printing characters.
- **Group by** — Transform > Group by. Aggregates rows (sum revenue per store). Use when you want the model to hold summary rows, not detail.
- **Merge queries** — a join. Home > Merge queries, pick the matching columns and the join kind. Adds columns from another table.
- **Append queries** — a union. Stacks rows from another table with the same shape.

**Unpivot** deserves its own mention. Data that arrives "wide" (a column per month: `Jan`, `Feb`, `Mar` ...) is bad for a model. Select those columns, Transform > Unpivot columns, and you get two columns (`Month`, `Value`) with one row per month per record. Almost every messy spreadsheet needs an unpivot to become model-ready.

**Query folding:** when your source is a database, Power Query tries to translate your steps into SQL and let the database do the work. Steps like filter, remove columns, and group by fold; some steps (certain text operations, adding an index) break folding, and everything after a broken step runs in Power BI instead. Keep folding steps first. Right-click a step > View Native Query to check whether folding is still happening.

**Close & Apply** (top-left) runs all the queries and loads the results into the model. Nothing you do in Power Query affects the report until you apply.

## When you use it

Immediately after connecting, before modelling or writing any DAX. The rule of thumb: shape it in Power Query if it is about the *rows and columns* (cleaning, filtering, joining, reshaping). Save it for DAX if it is a *calculation that depends on report context* (a measure that responds to slicers).

## A worked example

A monthly sales spreadsheet arrives wide: columns `Store`, `Region`, `2026-01`, `2026-02`, `2026-03`, ... Each cell is that store's revenue that month.

Power Query steps:

1. Promote headers.
2. Change `Store` and `Region` to text.
3. Select all the date columns, Transform > Unpivot columns. Now: `Store`, `Region`, `Attribute` (the date), `Value` (the revenue).
4. Rename `Attribute` to `Month`, `Value` to `Revenue`. Change `Month` to Date, `Revenue` to Decimal.
5. Filter out rows where `Revenue` is null (stores that did not exist yet).
6. Close & Apply.

The wide, unusable spreadsheet is now a tidy fact table: one row per store per month. And next month's file, with a new column added, unpivots the same way with zero extra work.

> **Try This**
> Take a wide case dataset (or make one wide in Excel) and shape it in Power Query: promote headers, fix types, unpivot the wide columns, filter the nulls. Then open the Advanced Editor and read the M it generated.
