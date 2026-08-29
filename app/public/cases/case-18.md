# Case 18 — Insurance Claims Pattern

**Industry:** Insurance · **Difficulty:** SENIOR

## The situation

The claims director:

> "Average claim size looks like it jumped this year and the reinsurance team is
> asking hard questions. Also there was a policy change in the Southern region
> mid-year. I need to know what's real."

## The data

`claims.csv` — one row per claim (~32k rows).

| column | notes |
|---|---|
| claim_id, policy_region, claim_date, claim_type | |
| amount | **mostly numeric, but ~8% are strings** like "$4,200" or "USD 3100" |

## How to approach it

If you aggregate `amount` as-is, the string values sort and sum wrong and can
distort the average. First get `amount` to a clean numeric type — strip currency
symbols, commas, "USD" — and count how many rows you had to fix.

Recompute average claim size over time on the clean data. The "jump" may
disappear or shrink a lot.

Then look at the Southern region around the mid-year policy change. The real
signal here is more likely a change in claim *frequency* (claims per month) than
claim *size*. Compare South's monthly claim count before and after the change,
with the other regions as a control.

## What to hand back

- how many `amount` values were dirty and how you cleaned them
- average claim size over time, before and after cleaning
- South region claim frequency before vs after the policy change
- one sentence: is the "claims are getting bigger" story real?

## Submit

Paste your analysis below, then send it to your PM.
