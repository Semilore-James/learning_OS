# Power Query: get and transform data

## The one-sentence version

Power Query is a built-in tool that records your data-cleaning steps as a recipe, so next month's file gets cleaned by pressing Refresh instead of doing it all again by hand.

## What it is

In Excel (Data, Get Data) and in Power BI, Power Query is an editor where you load data from a file, folder, database, or the web, then apply steps: remove columns, filter rows, change types, split a column, replace values, group, unpivot. Each step is remembered in an "Applied Steps" list. The output loads back into a sheet or the data model. When the source changes, you Refresh and every step re-runs.

## Why it exists

Manual cleaning is not repeatable. You TRIM, you fix categories, you remove duplicates, and then the file is updated and you do the whole thing again, hoping you remember every move. Power Query makes cleaning a saved pipeline. It also handles things that are painful in formulas: combining twenty files from a folder, unpivoting a cross-tab back into tidy rows, or connecting straight to a database.

## How it works

**Load:** Data, Get Data, from a workbook / CSV / folder / SQL Server / web. A preview opens in the Power Query Editor.

**The common steps, all from the ribbon:**

- **Remove / choose columns.** Right-click a header, Remove, or Home, Choose Columns.
- **Filter rows.** Click a column's filter arrow, same as a normal filter. Filtering here happens before the data loads, so a million-row source becomes the ten thousand you need.
- **Change type.** Click the icon left of a header and set text / whole number / decimal / date. Do this deliberately; a wrong auto-detected type is a common cause of errors downstream.
- **Split column.** By delimiter or by number of characters. Turn `2024-06-15` in a text column, or `Smith, John`, into clean parts.
- **Replace values.** Fix `west` to `West` across the whole column in one step.
- **Remove duplicates / remove blank rows.** One click each, Home tab.
- **Trim / clean / case.** Transform, Format.
- **Group By.** Transform, Group By, to produce a summary (sum of revenue per region) as its own query.

**Combine a folder of files:** Get Data, From Folder, point at a directory of identically-shaped CSVs, and Power Query stacks them into one table, with a column for the source file name. New file dropped in the folder next month, Refresh, it is included.

**Unpivot:** if data arrives as a cross-tab (months across the top), select the category columns, Transform, Unpivot Columns, and you get tidy `attribute` / `value` rows that a pivot table and every chart can actually use.

**Output:** Home, Close & Load To, and choose a Table on a sheet, a PivotTable, or "Connection only" plus "Add to Data Model" if you are building a bigger model.

**Refresh:** Data, Refresh All, or right-click the output table. The Applied Steps run again against the current source.

## When you use it

Any cleaning you will do more than once. Any time you are combining multiple files. Any time the source is a database or a folder rather than a single sheet. Any cross-tab you need to reshape. If you catch yourself doing the same Find-and-Replace on this month's export that you did on last month's, that is the signal to move it into Power Query.

## A worked example

Every month, five branch managers email a sales CSV. Each has stray spaces, a mixed-case region column, and a total row at the bottom you do not want.

Once: Get Data, From Folder, pointed at where you save the emails. Filter out the total rows. Trim the text columns. Replace the region variants. Set types. Group By region to get monthly totals, or load the clean detail and pivot it. Close & Load.

Every month after: save the five files to the folder, click Refresh All, done. The twenty minutes of cleaning became one click.

> **Try This**
> Take any case dataset, load it through Power Query, and do the cleaning as steps instead of formulas. Then change one value in the source file and Refresh to watch the whole pipeline re-run.
