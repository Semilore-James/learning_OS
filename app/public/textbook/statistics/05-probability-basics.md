# Probability basics

## The one-sentence version

Probability is the language for "how often would this happen", and a few simple rules stop you from double-counting, from adding things that should be multiplied, and from being surprised by coincidences that are actually common.

## What it is

A probability is a number from 0 to 1 saying how likely an event is. 0 is impossible, 1 is certain, 0.5 is a coin flip. You can write it as a percentage (37%) or a proportion (0.37); they are the same thing.

The core building blocks:

- **Event** — a thing that either happens or does not. "The customer churns this month." "The order is over 100."
- **P(A)** — the probability of event A.
- **Complement** — `P(not A) = 1 - P(A)`. If 3% of orders are returned, 97% are not.
- **Independent events** — one happening tells you nothing about the other. Two separate coin flips.
- **Mutually exclusive events** — they cannot both happen. An order is "returned" or "kept", not both.

## Why it exists

Analysts constantly estimate rates from data and then reason about them. "5% of trial users convert. If we get 2,000 trials, how many conversions should we expect, and how much will that number bounce around?" That is a probability question. Getting the rules wrong leads to real errors: quoting a combined failure rate that is too low because you added independent probabilities instead of accounting for overlap, or calling a run of bad weeks a trend when it is just noise.

## How it works

**Estimating a probability from data:** count the times it happened, divide by the total. 47 churns out of 1,200 customers gives an estimated `P(churn) = 47 / 1200 = 0.039`, about 3.9%. This is just a proportion, and it is your best guess at the underlying rate. How much to trust it depends on the sample size (see confidence intervals).

**The AND rule (multiplication):** for independent events, `P(A and B) = P(A) x P(B)`. If a checkout step has a 2% error rate and the next step independently has a 3% error rate, the probability of getting through both cleanly is `0.98 x 0.97 = 0.9506`, so about 5% of users hit an error somewhere. Note you do not add 2% and 3% to get 5%; that only works because the numbers are small. With a 40% and 50% rate, adding gives 90% but multiplying the successes gives `0.6 x 0.5 = 0.30`, so 70% hit an error.

**The OR rule (addition):** `P(A or B) = P(A) + P(B) - P(A and B)`. You subtract the overlap so you do not count it twice. If 20% of users are on mobile and 30% are new, and 8% are both, then "mobile or new" is `0.20 + 0.30 - 0.08 = 0.42`. Forgetting the subtraction is one of the most common probability mistakes in analytics.

**Independence is an assumption, not a default.** Two events in the same dataset are often linked. Churn and low usage are not independent. Before you multiply, ask whether one event makes the other more or less likely. If it does, you need conditional probability (the next chapter).

**Expected value:** the long-run average outcome. `E = sum of (each outcome x its probability)`. If a promo costs 10 to send, converts 4% of the time, and a conversion is worth 200, the expected value per send is `0.04 x 200 - 10 = -2`. On average you lose 2 per send. That is a decision, made with one line of arithmetic.

## When you use it

Any time you translate a rate from your data into an expectation about the future or about a larger group: forecasting conversions, sizing the impact of an error rate, deciding whether a campaign pays for itself, judging whether a streak of results is remarkable or routine.

## A worked example

A signup funnel: 100% land on the page, 60% start the form, 70% of those finish it, 90% of those verify their email.

Probability a random visitor completes the whole funnel: `1.0 x 0.60 x 0.70 x 0.90 = 0.378`, about 38%.

Now someone proposes improving the form-finish step from 70% to 80%. New completion: `0.60 x 0.80 x 0.90 = 0.432`. That is a jump from 38% to 43%, a 14% relative lift in signups from one step. The multiplication rule is what lets you price that change before anyone builds it.

> **Try This**
> Take a funnel or a set of pass rates from a case. Compute the end-to-end completion probability by multiplying the step rates. Then find the single step where a 10-point improvement helps the total the most, and check: is it always the worst step? (It usually is, but not always.)
