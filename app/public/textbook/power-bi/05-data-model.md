# Data model basics: tables, relationships, star schema

## The one-sentence version

The data model is how your tables connect, and getting it into a star schema (facts in the middle, dimensions around the edge) is the single decision that makes everything else in Power BI work smoothly.

## What it is

In **Model view** you see your tables as boxes and the **relationships** between them as lines. A relationship links a column in one table to a column in another, so a filter on one table flows to the other.

The shape you are aiming for is a **star schema**:

- **Fact tables** — the events. One row per transaction, per order line, per session. Long and narrow. Holds the numbers you sum (`quantity`, `revenue`) and the keys that point to dimensions (`product_id`, `store_id`, `date`).
- **Dimension tables** — the descriptive context. One row per product, per store, per customer, per date. Short and wide. Holds attributes you slice and group by (`product_name`, `category`, `region`, `month_name`).

Facts in the center, dimensions radiating out, relationships from each dimension's key to the matching key on the fact. That is the star.

## Why it exists

DAX and the visual engine are built assuming a star schema. When your model is a star:

- Filters flow one direction (dimension filters fact), which is predictable.
- Measures are simple (`SUM(Sales[revenue])`) and respond correctly to any slicer.
- Relationships are one-to-many (one product, many sales), which is fast and unambiguous.

When your model is not a star (one big flat table, or tables joined every which way, or many-to-many relationships everywhere), measures give wrong totals, filters behave surprisingly, and you spend your time fighting the model instead of building the report.

## How it works

**Relationships:**

- Power BI auto-detects some on load (matching column names). Check them; delete the wrong ones.
- Create one by dragging a column from one table onto the matching column in another, in Model view.
- Each relationship has a **cardinality** (almost always one-to-many: the "one" side is the dimension, the "many" side is the fact) and a **cross-filter direction** (default: single, from the one side to the many side). Leave both at the defaults unless you have a specific reason.
- The linking columns must contain matching values. `Sales[product_id]` and `Products[product_id]`. If the fact has a product_id that is not in Products, those sales still show in totals but attribute to "(Blank)" when sliced by product.
- Only one **active** relationship is allowed between two tables at a time (shown as a solid line; extras are dashed and inactive, used via `USERELATIONSHIP` in DAX).

**The Date table** is non-negotiable. Do not slice by the raw date column on your fact. Build a dedicated Date dimension: one row per day from your earliest to latest date, with columns for year, quarter, month number, month name, day of week, is-weekend, fiscal period. Mark it as the date table (Table tools > Mark as date table). Relate it to every fact's date key. This is what makes time intelligence (`SAMEPERIODLASTYEAR`, running totals) work, and what lets month names sort correctly.

**Star schema fixes for common messes:**

- **One flat table** (every attribute repeated on every transaction row): split the dimensions out. In Power Query, reference the flat query, keep the distinct product columns, remove duplicates -> that is your Products dimension. Repeat per dimension. The fact keeps just the keys and the numbers.
- **Snowflake** (a dimension linked to another dimension linked to the fact): flatten it. Merge the sub-dimension's columns into the main dimension in Power Query so the fact sees one dimension, not a chain.
- **Two facts at different grains** (orders and order-lines): keep them as two facts, both related to the shared dimensions (Date, Customer, Product). Do not try to join them together.

**Hide** columns the report should not use: the raw key columns on dimensions, technical fields. Right-click > Hide in report view. A clean Fields pane is a real usability feature.

## When you use it

Right after Power Query, before writing a single measure. Spend the time to get the star right; every hour here saves several later. Revisit it whenever you add a table.

## A worked example

A CSV arrives as one flat table: `order_id, order_date, customer_name, customer_city, customer_segment, product_name, product_category, quantity, unit_price`.

As-is, it works for a quick chart but every "unique customers" count is wrong (customers repeat per order line) and there is no clean way to show a full product list including products with no sales.

Reshaped into a star:

- **Sales fact:** `order_id, order_date, customer_id, product_id, quantity, unit_price`. (Add surrogate `customer_id` / `product_id` in Power Query.)
- **Customers dim:** `customer_id, name, city, segment`. Distinct.
- **Products dim:** `product_id, name, category`. Distinct.
- **Date dim:** generated, one row per day, related to `Sales[order_date]`.

Relationships: each dim's key to Sales, one-to-many. Now `DISTINCTCOUNT(Customers[customer_id])` is correct, a product slicer shows every product, and time intelligence works.

> **Try This**
> Take a flat case dataset. In Model view, plan the star: which columns are the fact (keys + numbers), which groups of columns are dimensions. Build it in Power Query with reference queries, create the relationships, add a Date table, and hide the key columns.
