# Case 17 — Bank Transaction Anomaly Detection

**Industry:** Banking · **Difficulty:** SENIOR

## The situation

The financial-crime team:

> "Compliance flagged that our large-transfer monitoring might have a blind
> spot. There's a reporting threshold at 1,000,000. I want to know if anyone is
> deliberately keeping transfers just under it. Give me a list of accounts to
> look at."

## The data

`transactions.csv` — outbound transfers (~90k rows).

| column | notes |
|---|---|
| txn_id, date, account_id, beneficiary_id | |
| amount | |
| channel | mobile, web, branch |

## How to approach it

Look at the distribution of `amount` near 1,000,000. For most of the book,
amounts are smoothly spread. But there should be a suspicious bunching in the
900,000–999,999 band.

The accounts driving that bunching are the ones to flag. For each candidate,
check:

- how many just-under-threshold transfers, over what time window (structuring is
  usually clustered)
- how many distinct beneficiaries — a few repeat beneficiaries is a stronger
  signal than many
- whether their behaviour looks different from a matched set of ordinary
  accounts

Don't over-flag. A single large-ish transfer is not structuring. You want the
accounts with a *pattern*.

## What to hand back

- a chart or table showing the bunching below the threshold
- your shortlist of accounts, with the count, time window, and beneficiary
  concentration for each
- one sentence on your false-positive risk

## Submit

Paste your analysis and the shortlist below, then send it to your PM.
