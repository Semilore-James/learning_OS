# Case 04 — SQL Customer Order Analysis

**Industry:** E-commerce · **Difficulty:** ROOKIE

## The situation

You've joined a homeware retailer as their first analyst. The head of sales
drops three CSVs on your desk:

> "Marketing keeps saying the South East region is our fastest grower and wants
> more budget there. I'm not sure I believe it. Can you look at where our
> revenue actually comes from by region? And while you're in there, sanity-check
> whatever else looks off."

## The data

Three files, meant to be loaded into SQLite (or joined in your tool of choice).

**customers.csv** — `customer_id, name, city, region, signup_date`
**orders.csv** — `order_id, customer_id, order_date`
**order_items.csv** — `order_id, product_id, qty, unit_price`

Revenue for an order line is `qty * unit_price`. Region is stored on the
customer.

The order data is clean. The customer data is *mostly* clean — but the region
column was populated by an import job, and imports are not always careful.

## How to approach it

Load the files and get revenue by region first — the question that was actually
asked. Note the answer.

Then don't trust it yet. Region lives on `customers`, so before you report a
regional number, check that the region column is sound. One way in: every city
belongs to exactly one region in the real world. Do the rows agree with that?
Group by `city` and `region` and see whether any city shows up under more than
one region. If it does, work out how many customers are affected, and whether
they cluster — by signup date, for instance.

Once you know how bad the region column is, redo the revenue-by-region cut in a
way you'd be willing to defend, and say how much it changes the picture.

There's a second, smaller thing in `order_items` worth a one-line mention if you
spot it. It won't move the regional totals much, but it's the kind of thing that
quietly inflates revenue if nobody catches it.

## What to hand back

- revenue by region, before and after you dealt with the region column
- what's wrong with the region data, how many rows, and your best guess at why
- the one-liner on whatever you found in `order_items`
- one sentence for the head of sales: does the "South East is booming" claim
  hold up?

## Submit

Paste your queries and what you concluded, then send it to your PM. Your PM
won't debug your SQL — they'll tell you what's thin and ask you one question.
