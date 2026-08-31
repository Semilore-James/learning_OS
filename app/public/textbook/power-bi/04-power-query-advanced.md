# Power Query (M): custom columns, parameters, and reuse

## The one-sentence version

Once the basic shaping is done, custom columns add derived fields, parameters make queries configurable, and reference queries let you build one shaping pipeline and branch off it, so the whole thing stays maintainable.

## What it is

The features that turn a one-off cleaning job into a maintainable data layer:

- **Custom column** — a new column defined by an M expression, when the ribbon transformations do not cover what you need.
- **Conditional column** — a custom column built from if/then rules through a dialog, no M required.
- **Parameters** — named values (a file path, a start date, a server name) that you set in one place and reference across queries.
- **Reference and duplicate queries** — building a base query and deriving others from it.
- **Functions** — a reusable transformation you apply to many tables (like combining a folder of files).

## Why it exists

The basic ribbon gets you a clean table. What it does not give you is a pipeline that survives change: a hard-coded file path breaks when the folder moves; the same 8 cleaning steps copy-pasted across 5 queries means fixing a bug in 5 places; a derived column written by hand in the report is invisible and un-reusable. These features are how the shaping layer stays coherent as the report grows.

## How it works

**Custom column** (Add Column > Custom Column):

```
// full name from parts
Text.Combine({[first_name], [last_name]}, " ")

// margin
([revenue] - [cost]) / [revenue]

// order size bucket
if [amount] < 50 then "Small"
else if [amount] < 200 then "Medium"
else "Large"
```

M is case-sensitive, columns go in `[square brackets]`, and the function library is large (`Text.`, `Date.`, `Number.`, `List.` namespaces). For simple if/then logic, the **Conditional Column** dialog writes it for you.

**Prefer a custom column in Power Query over a DAX calculated column** when the value only depends on that row and does not need to respond to report filters. It computes once at refresh, compresses well, and does not bloat the model the way a DAX calculated column can.

**Parameters** (Home > Manage Parameters):

- Create a parameter `FolderPath` with a current value.
- In the folder connector's source step, replace the hard-coded path with `FolderPath`.
- Now moving the data is a one-field change, and you can have a "dev" value and a "prod" value.
- Common parameters: source file/folder path, database server, a cut-off date for how much history to load, an environment flag.

**Reference vs Duplicate:**

- **Duplicate** copies the query and all its steps. The two are now independent; a fix to one does not touch the other. Use rarely.
- **Reference** creates a new query that *starts from* the output of another. The base query does its cleaning once; referenced queries build on that result. If you fix the base, every reference gets the fix. This is the maintainable pattern: one `Sales_Clean` base query, then `Sales_2026` and `Sales_ByRegion` referencing it.

**Disable load** for staging queries. Right-click a query used only as a base for others > uncheck "Enable load". It still runs, but it does not create a table in the model, keeping the model tidy.

**Functions:** when you connect to a folder, Power Query auto-generates a function (`Transform File`) and a sample query, and applies the function to every file. You can edit that function to add cleaning that runs per-file. You can also write your own: a query that takes a parameter and returns a transformed table, then invoke it.

## When you use it

After the first pass of basic shaping works, when you notice you are about to copy-paste steps, hard-code a path, or write a derived column. That is the signal to reach for a reference query, a parameter, or a custom column instead.

## A worked example

A report combines this year's and last year's sales, from two folders, and both need the same 6 cleaning steps.

Bad: two queries, 6 steps each, copy-pasted. A bug in step 3 is now two bugs.

Better:

1. Parameter `DataRoot` = the parent folder path.
2. Query `Clean` — a function taking a subfolder name, that connects to `DataRoot & subfolder`, combines the files, and applies the 6 steps. Load disabled.
3. Query `Sales_2026` — invokes `Clean("2026")`.
4. Query `Sales_2025` — invokes `Clean("2025")`.
5. Query `Sales_All` — appends the two.

One place for the path, one place for the cleaning logic, and adding 2027 is one more `Clean("2027")` line.

> **Try This**
> Take a Power Query pipeline you built earlier. Pull the file path into a parameter. Split it into a base "clean" query with load disabled and a reference query that the report actually uses. Change one cleaning step in the base and confirm the reference picks it up.
