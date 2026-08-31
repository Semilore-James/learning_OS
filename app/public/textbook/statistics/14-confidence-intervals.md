# Confidence intervals

## The one-sentence version

A confidence interval is a range of plausible values for the thing you are estimating, and reporting one instead of a single number is the difference between "our conversion rate is 4.2%" and a claim someone can actually reason about.

## What it is

When you estimate a quantity from a sample (a mean, a proportion, a difference, a regression coefficient), the estimate is not exact. A 95% confidence interval is a range, computed from the data, constructed so that if you repeated the whole sampling process many times, about 95% of the intervals you built would contain the true value.

`conversion rate: 4.2% (95% CI: 3.6% to 4.8%)` means: the point estimate is 4.2%, and the true rate is plausibly anywhere from 3.6% to 4.8%.

## Why it exists

A single number hides how much you actually know. "Average order value is 62" reads the same whether it came from 40 orders or 40,000, but one of those you can bank on and one you cannot. The interval width carries that information. It also stops false precision: quoting 62.37 when the interval is 55 to 70 is claiming a certainty you do not have.

## How it works

**The general shape:**

```
estimate  +/-  (critical value)  x  (standard error)
```

The **standard error** is the standard deviation of the estimate, and it shrinks as the sample grows (roughly with the square root of n). The **critical value** comes from the confidence level: about 1.96 for 95%, about 2.58 for 99%.

**What drives the width:**

- **Sample size** — bigger n, narrower interval. To halve the width you need roughly 4x the data.
- **Variability** — noisier data, wider interval.
- **Confidence level** — 99% is wider than 95% is wider than 90%. More confidence, less precision. 95% is the default.

**The correct interpretation is about the procedure, not the specific interval.** "95% confident" means the method captures the truth 95% of the time. Any single interval either contains the true value or it does not; it is not "95% probable" that the truth is in this one. In practice most people read it as "plausible range for the true value" and that is close enough for decisions.

**The overlap shortcut and its limit.** If two groups' confidence intervals do not overlap at all, the difference is significant. If they overlap a lot, it is not. If they overlap a little, you cannot tell from the intervals alone; compute a confidence interval on the *difference* directly, which is the right thing to report for a comparison anyway.

**An interval that includes zero (for a difference) or includes "no change" (a ratio of 1) means the effect is not statistically significant.** The CI and the hypothesis test agree; the CI just also tells you the range of effect sizes you cannot rule out.

## When you use it

Every estimate that goes in a report. Every A/B test result ("lift of 5%, CI 1% to 9%"). Every forecast. Any time precision matters to the decision. The habit to build: never write a single estimate without asking "how wide is the interval around this, and does the decision change across that range?"

## A worked example

Two landing pages tested.

```
Page A:  1,000 visitors,  50 signups,  5.0% (95% CI: 3.7% to 6.5%)
Page B:  1,000 visitors,  65 signups,  6.5% (95% CI: 5.1% to 8.2%)
```

The intervals overlap (roughly 5.1% to 6.5% is shared), so you cannot conclude a difference from the individual intervals. The right move is the interval on the difference:

```
Difference (B - A): +1.5 points  (95% CI: -0.7 to +3.7 points)
```

That interval includes zero. B might be 3.7 points better, or A might actually be 0.7 points better. The test is inconclusive.

The report: "B is up 1.5 points, but the interval runs from slightly negative to +3.7, so we cannot commit. At 3,000 visitors per page the interval would tighten enough to call it. If we have to decide now, the expected value favours B, but it is close to a coin flip."

That is a far more useful answer than "B won, 6.5% vs 5.0%".

> **Try This**
> Take a rate from a case (a conversion rate, a defect rate, a pass rate). Compute or estimate its 95% confidence interval. Then double the sample size in your head and note how much the interval would shrink. Notice how much of "we need more data" is really "the interval is too wide to act on".
