# Power Query (M): custom columns, parameters, reusable queries

## The one-sentence version

Every click in Power Query writes a line of a language called M, and learning to read and lightly edit M lets you add logic the ribbon buttons cannot, and build queries that flex instead of breaking.

## What it is

M is the formula language behind Power Query. Each Applied Step is one M expression. The Advanced Editor (View, Advanced Editor) shows the whole query as text, a `let ... in` block where each line is a step feeding the next. You rarely write M from scratch; you record steps with the buttons, then open the editor to tweak.

## Why it exists

The ribbon covers the common 90%. The other 10% is custom logic: a column that is `IF` this `AND` that, a category derived from a lookup, a value pulled from another query, a filter that depends on today's date. That needs an expression, not a button. And parameters let one query point at "the current file" or "the last 90 days" without you hardcoding the path or the date.

## How it works

**Custom Column** (Add Column, Custom Column) opens a box where you write one M expression that becomes the new column. M's `if` is `if ... then ... else ...` (no elif; nest for more branches):

```
if [units] < 0 then "return"
else if [total] <> [units] * [unit_price] then "mismatch"
else "ok"
```

Column references are `[column_name]` in square brackets. Common functions: `Text.Trim`, `Text.Upper`, `Text.Contains([email], "@")`, `Date.Year([date])`, `Number.Round([value], 2)`, `List.Sum(...)`. The function names are `Category.Verb` and the editor autocompletes them.

**Conditional Column** (Add Column, Conditional Column) is a friendlier UI for simple `if` ladders, and it writes the M for you. Use it, then open the editor to see what it generated.

**Parameters** (Home, Manage Parameters, New Parameter) are named values you can reference in steps. A `FolderPath` text parameter means the folder source is `Folder.Files(FolderPath)` instead of a literal path, so moving the files is a one-field change. A `DaysBack` number parameter lets a filter step be `Date.From([order_date]) >= Date.AddDays(DateTime.LocalNow(), -DaysBack)`.

**Reusable queries:** any query can be set to "Connection only" and then **referenced** by another (right-click, Reference). Build one "clean base" query that loads and scrubs the raw data, then have three small queries reference it, each doing its own grouping. Fix the cleaning once, all three update. This is the same idea as a CTE or a view in SQL.

**Reading a query:** open the Advanced Editor on something you built with buttons. You will see each step named (`#"Removed Columns"`, `#"Changed Type"`) and each one taking the previous step's result as its first argument. Once that pattern clicks, you can reorder steps, rename them, or drop one by editing the text.

## When you use it

When a column needs real logic. When a path or a date window should be a parameter, not a hardcoded value. When two or more queries share the same cleaning and you want to define it once. When you want to understand or fix a query someone else built.

## A worked example

You load a deals export daily and need a `deal_health` column and a rolling 30-day filter.

Add a Conditional Column for health: `stage = "Lost"` then `"lost"`, `days_since_activity > 14` then `"stale"`, else `"active"`. Open the Advanced Editor and see the `if` it wrote. Add a `DaysBack` parameter set to 30. Add a filter step: keep rows where `[last_activity] >= Date.AddDays(DateTime.LocalNow(), -DaysBack)`. Tomorrow the same query, refreshed, gives the current rolling window with no edits.

> **Try This**
> Build a case-data cleaning query with buttons, then open the Advanced Editor and change one thing by hand (reorder two steps, or edit a filter). Add a parameter for the source file path.
