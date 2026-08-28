# Case 05 — Fintech Churn Analysis

**Industry:** Fintech · **Difficulty:** ANALYST

## The situation

A savings app charges a flat monthly fee. The product lead is worried: "Retention looks fine at the top line but I think we are losing our best users and replacing them with worse ones. I need to know if that is true and where it is happening."

"Churn" here means: a user who had an active subscription and then let it lapse without renewing within 30 days.

## The data

**users**

| column | type | notes |
|---|---|---|
| id | integer | |
| signup_date | date | |
| plan | text | 'basic', 'plus', 'premium' |
| referral_source | text | |

**subscriptions**

| column | type | notes |
|---|---|---|
| id | integer | |
| user_id | integer | |
| started_on | date | |
| ended_on | date | null if still active |
| mrr | numeric | monthly recurring revenue for this subscription |

**deposits**

| column | type | notes |
|---|---|---|
| user_id | integer | |
| deposit_date | date | |
| amount | numeric | |

## Deliverables

1. **Monthly churn rate.** For each of the last 12 months, the number of users who churned that month divided by the number active at the month's start. A `JOIN` between subscriptions and a month series, plus aggregation.
2. **Are we losing the good ones?** Compare churned users to retained users on two measures: average total deposits, and average months subscribed before churn. State plainly whether the product lead's fear is supported.
3. **Where.** Break churn rate down by `plan` and by `referral_source`. Name the one or two segments doing most of the damage.

## What "done" looks like

Three result sets with queries, and a three-sentence verdict: is it true, how bad, and which segment to look at first.

## Submit

Paste your queries and your verdict below, then submit for PM-AI review.
