# Case 19 — Marketplace Take-rate Analysis

**Industry:** SaaS · **Difficulty:** SENIOR

## The situation

The CFO of a marketplace:

> "Our blended take-rate has been sliding for two quarters and I can't get a
> straight answer why. Revenue is growing so nobody's panicking, but a falling
> take-rate compounds. Find the cause."

## The data

`orders.csv` — one row per order (~55k rows).

| column | notes |
|---|---|
| order_id, date, seller_id | |
| seller_tier | standard, plus, pro |
| gmv | gross merchandise value |
| fee | what the marketplace charged |

Take-rate for an order is `fee / gmv`.

## How to approach it

Confirm the blended take-rate decline over time.

Then decompose it. A blended rate can fall for two reasons: the rate charged
within each tier dropped, or the *mix* shifted toward lower-rate tiers. Check
both:

- effective take-rate per tier, over time — is any tier's rate drifting?
- share of GMV by tier, over time — is the mix moving?

One tier's effective rate should be sitting below where it's supposed to be
(compare `fee / gmv` to the tier's stated rate). And that tier's share of volume
is growing. That combination is what's dragging the blend.

## What to hand back

- blended take-rate over time
- the decomposition: rate-within-tier vs mix-shift
- the specific tier that's underpricing, the gap vs its intended rate, and the
  revenue impact if it were corrected
- one sentence for the CFO

## Submit

Paste your queries and the decomposition below, then send it to your PM.
