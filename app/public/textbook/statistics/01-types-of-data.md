# Types of data: nominal, ordinal, interval, ratio

## The one-sentence version

Before you calculate anything, decide what kind of number you have, because the type determines which operations mean something and which produce nonsense.

## What it is

A four-way split of every column you will ever analyse:

- **Nominal** — labels with no order. `country`, `payment_method`, `department`. You can count them and compare them for equality. Nothing else.
- **Ordinal** — labels with an order but no fixed distance between steps. `satisfaction` (low / medium / high), `t_shirt_size` (S / M / L), `plan_tier` (free / pro / enterprise). You can rank them. You cannot say "high minus low".
- **Interval** — numbers with equal spacing but no true zero. Temperature in Celsius, calendar years, IQ scores. Differences mean something (20 to 30 degrees is the same jump as 30 to 40). Ratios do not (30 degrees is not "twice as hot" as 15).
- **Ratio** — numbers with equal spacing and a real zero. `revenue`, `age`, `session_length`, `units_sold`. Everything is allowed: differences, ratios, means, the lot. Zero means "none".

## Why it exists

Because a spreadsheet will happily average anything. It will give you the "mean" of a column of ZIP codes, or the "mean" of a satisfaction column where you coded low as 1 and high as 3. Both numbers are meaningless, and both have been put in front of executives. Knowing the data type is what stops you.

## How it works

Ask two questions of a column:

1. **Is there an order?** No means nominal. Yes, continue.
2. **Is the distance between values fixed, and is there a true zero?** Fixed distance, no true zero: interval. Fixed distance and true zero: ratio. Order but no fixed distance: ordinal.

The consequences:

| Type | Can compare = | Can rank | Can add / subtract | Can take a ratio | Sensible centre |
|---|---|---|---|---|---|
| Nominal | yes | no | no | no | mode |
| Ordinal | yes | yes | no | no | median or mode |
| Interval | yes | yes | yes | no | mean or median |
| Ratio | yes | yes | yes | yes | mean or median |

**The common trap:** numeric codes for categories. `region_id` is `1, 2, 3` in the database but it is nominal. `store_number` is nominal. A phone area code is nominal. If the number is an identifier or a label, treat it as nominal no matter what it looks like.

**The other trap:** ordinal data dressed as ratio. A 1 to 5 star rating is ordinal. The gap between 1 star and 2 stars is not obviously the same as the gap between 4 and 5. People average star ratings constantly, and it is a defensible shortcut, but know that you are making an assumption when you do.

## When you use it

At the start of every analysis, during the exploration pass. As you go through the columns you are also mentally tagging each one, because that tag decides your next move: a `groupby` for categoricals, a distribution plot for ratio data, a rank or an ordered bar for ordinal.

## A worked example

A support ticket export:

| Column | Type | So you can |
|---|---|---|
| `ticket_id` | nominal | count tickets, nothing else |
| `channel` (email/chat/phone) | nominal | group by channel, compare volumes |
| `priority` (low/med/high/urgent) | ordinal | order the bars low to urgent, take the median priority |
| `csat_score` (1 to 5) | ordinal (often treated as interval) | show the distribution; average it only with a caveat |
| `first_response_minutes` | ratio | mean, median, "twice as long", percentiles, all fine |
| `created_at` | interval (a timestamp) | differences (time to resolve) yes; "twice the date" no |

The mistake waiting to happen: someone reports "average priority is 2.7". Priority is ordinal. 2.7 is not a priority. Report "most tickets are medium, urgent tickets are 8% of volume and rising" instead.

> **Try This**
> Open any case dataset. For every column, write nominal / ordinal / interval / ratio next to it before you run a single calculation. Then check: is there anywhere the case is tempting you to average something that is not ratio?
