# Documenting cleaning decisions

## The one-sentence version

Every cleaning choice changes the numbers, so a short written record of what you did and why is what makes your analysis defensible three months later when someone challenges the result.

## What it is

A running log, kept as you clean, of every non-trivial decision:

- What you found (the problem).
- What you did about it (the fix).
- Why (the reasoning).
- How many rows or values it affected.

It lives next to the code: a section in the notebook, a `CLEANING.md` in the project folder, or comments in the `clean()` function. Not in your head, and not only in the code, because the code shows the *what* but rarely the *why*.

## Why it exists

Cleaning is a series of judgment calls, and judgment calls get questioned. "Why is Q3 revenue lower than the system report?" "Because I removed 340 rows that were refunds mislabelled as orders, which the system report includes." That sentence ends the conversation. Without the log, you are reconstructing your reasoning from memory under pressure, and you will get it wrong. The log also lets a colleague rerun your work, and lets future-you remember why that one weird line is in the pipeline.

## How it works

**Log an entry whenever a decision could reasonably have gone another way.** You do not need to log `df.columns = df.columns.str.lower()`. You do need to log every row removal, every imputation, every value remapping, and every filter that narrows the dataset.

**A good entry has four parts.** Example:

> **Refund rows removed.** 340 rows had `type = "order"` but negative `amount` and an `order_id` matching an earlier positive row. These are refunds recorded as orders. Removed them so revenue is not understated by double-counting the reversal. Revenue total drops the 340 negative amounts (about -18,200), net effect on reported revenue: +18,200 vs leaving them in.

**Keep a summary table at the top** so someone can see the shape of what happened at a glance:

| Decision | Rows affected | Direction of effect |
|---|---|---|
| Dropped rows missing `order_id` | 12 | negligible |
| Removed mislabelled refunds | 340 | revenue +18.2k |
| Imputed missing `region` as "Unknown" | 2,100 | none (new category) |
| Capped `delivery_hours` at 720 for cancelled orders -> null | 190 | avg delivery time 41h -> 28h |
| Standardised 7 spellings of "West" | 1,050 | West revenue +33% (was split) |

**Record what you did NOT do, if it was tempting.** "Considered dropping the 2,100 rows with missing region; kept them as 'Unknown' instead because they are 24% of the data and concentrated in the pre-2024 period, so dropping would bias the trend." This shows you saw the option and made a call.

**Version the raw data, not the cleaned data.** Keep the original file untouched (`data/raw/`, read-only). Anyone can rerun your pipeline from raw and get your cleaned output. If you only keep the cleaned file, your decisions are baked in and unauditable.

## When you use it

As you clean, entry by entry, not at the end. Writing it up afterward means you forget the small calls and misremember the counts. The log is a byproduct of doing the work carefully, not a separate chore.

## A worked example

An analyst reports that a store's revenue is 33% below the others and recommends an investigation into off-book discounting. Two weeks later, in the review meeting, someone from that store's team says the number is wrong because the store's system shows normal revenue.

The analyst opens `CLEANING.md`:

> **Store name standardisation.** "Ikeja", "IKEJA", "Ikeja Branch", and "ikeja " were four separate values, splitting the store's sales. Merged to "Ikeja". This *raised* Ikeja's apparent revenue; the 33% gap is after the merge, not because of it.
>
> **Cash-discount rows.** 210 transactions at "Ikeja" had `discount_pct` between 0.35 and 0.60, far above the 0.10 company cap. Kept them (they are the finding), flagged as `high_discount`. These account for the entire 33% revenue gap.

The store's system shows normal revenue because it records the discounted price as the full price and books the discount elsewhere. The analyst's number is right, the reasoning is documented, and the meeting moves on to what to do about it.

> **Try This**
> For a completed case, write the `CLEANING.md`: the summary table plus a four-part entry for every decision that changed the row count or a headline number. When the case asks you to explain your cleaning, submit this.
