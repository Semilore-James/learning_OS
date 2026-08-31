# Conditional probability

## The one-sentence version

Conditional probability is "the chance of A, given that we already know B", and confusing it with "the chance of A" is behind a large share of bad decisions made from data.

## What it is

`P(A | B)` reads "the probability of A given B". It is the probability of A restricted to the rows where B is true.

`P(churn) = 0.04` is the churn rate across all customers.
`P(churn | opened zero tickets last month) = 0.11` is the churn rate among only the customers who went silent.

Same event, different population, very different number, and the second one is far more useful.

## Why it exists

Almost every question a stakeholder actually cares about is conditional. Not "what is the conversion rate" but "what is the conversion rate for users who came from paid search". Not "how many orders are fraudulent" but "given that an order was flagged, how likely is it actually fraud". The unconditional rate is a headline; the conditional rates are where the decisions live.

## How it works

**From data, it is just a filtered proportion:**

```
P(A | B) = (rows where A and B) / (rows where B)
```

Filter to B, then compute the rate of A within that filter. That is the whole operation. In pandas it is `df[df.B].A.mean()`.

**The definition in probability terms:**

```
P(A | B) = P(A and B) / P(B)
```

**The direction matters and they are not equal.** `P(A | B)` is usually not the same as `P(B | A)`. `P(flagged | fraud)` might be 0.95 (the model catches most fraud). `P(fraud | flagged)` might be 0.10 (most flags are false alarms, because fraud is rare). Swapping these two is called the prosecutor's fallacy, and it convicts innocent people and blocks legitimate customers.

**Bayes' rule** flips the direction:

```
P(A | B) = P(B | A) x P(A) / P(B)
```

You need it when you know the test's accuracy (`P(flag | fraud)`) but want the thing you actually care about (`P(fraud | flag)`). The base rate `P(A)` is the piece people forget, and it dominates the answer when the event is rare.

**Independence, restated:** A and B are independent exactly when `P(A | B) = P(A)`, that is, knowing B changes nothing. If the conditional rate differs from the overall rate, the two are related, and that relationship is often your finding.

## When you use it

Constantly, usually without naming it. Every `groupby` followed by a rate is a table of conditional probabilities. Every "this segment behaves differently" claim is `P(behaviour | segment) != P(behaviour)`. You use Bayes' rule specifically when reasoning about the reliability of a flag, an alert, a test, or a model score for a rare outcome.

## A worked example

A fraud model on 100,000 transactions. Fraud is 0.5% of transactions (500 of them). The model flags 90% of real fraud and falsely flags 3% of legitimate transactions.

- Real fraud flagged: `500 x 0.90 = 450`
- Legit transactions flagged: `99,500 x 0.03 = 2,985`
- Total flags: `450 + 2,985 = 3,435`

`P(fraud | flagged) = 450 / 3,435 = 0.13`.

The model is "90% accurate at catching fraud", and yet **87% of the transactions it flags are not fraud**. If the fraud team treats a flag as near-certain, they will decline thousands of good customers. The base rate (0.5%) is why. Report the precision (13%), not just the recall (90%), and let the team set the threshold with both numbers in view.

> **Try This**
> In a case dataset, pick an outcome (churned, returned, converted) and a segment. Compute the overall rate and the rate within the segment. If they differ, you have found a conditional relationship worth writing up. Then run Chart Critiquer and watch for the rounds where a chart shows an overall rate that hides a very different conditional one.
