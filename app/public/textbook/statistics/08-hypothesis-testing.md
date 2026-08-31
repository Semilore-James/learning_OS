# Hypothesis testing: what it is and why

## The one-sentence version

A hypothesis test asks one question: could the difference I am looking at plausibly be just noise, or is it too big for that, and it answers with a probability.

## What it is

The setup, every time:

- **Null hypothesis (H0)** — the boring explanation. "There is no real difference. Any gap I see is random variation."
- **Alternative hypothesis (H1)** — the interesting one. "There is a real difference."
- **Test statistic** — a number that measures how far the data is from what H0 predicts, scaled by the noise.
- **p-value** — assuming H0 is true, the probability of seeing a result at least this extreme. Small p means the data would be surprising if nothing were going on.
- **Significance level (alpha)** — the threshold you set in advance, usually 0.05. If p is below alpha, you "reject the null" and call the result statistically significant.

## Why it exists

Two numbers are almost never exactly equal. Variant A converts at 4.1%, variant B at 4.4%. Is B better, or did B just get a slightly luckier sample this week? Your eyes cannot tell. A hypothesis test is a disciplined way to answer "is this gap bigger than the wobble I would expect from chance alone", so you do not ship a change based on noise or kill a good one because its first week was unlucky.

## How it works

**The logic is proof by contradiction with a probability attached.** You assume there is no effect (H0). You compute how likely your observed data is under that assumption. If that likelihood is very low, you conclude the assumption was probably wrong.

**The steps:**

1. State H0 and H1 before looking at the outcome.
2. Pick alpha (0.05 is convention, not law).
3. Choose the right test for your data: t-test for comparing two means, chi-square for comparing proportions or counts across categories, and so on.
4. Compute the test statistic and the p-value.
5. If p < alpha, reject H0. If not, you "fail to reject" H0.

**"Fail to reject" is not "prove there is no effect."** A non-significant result means you did not find enough evidence, which can happen because there is no effect or because your sample was too small to detect a real one. Absence of evidence is not evidence of absence.

**Statistical significance is not practical significance.** With a large enough sample, a completely trivial difference (4.10% vs 4.11%) will come back significant. Significance says the effect is probably real; it says nothing about whether it is big enough to care about. Always report the effect size next to the p-value.

**The two ways to be wrong:**

- **Type I error (false positive)** — you reject H0 when it was actually true. You ship a change that does nothing. The rate of this is alpha, which is why you set it low.
- **Type II error (false negative)** — you fail to reject H0 when there was a real effect. You miss a good change. The chance of catching a real effect is called **power**, and it goes up with sample size and effect size.

## When you use it

Whenever you are about to claim "X is different from Y" or "X changed" based on sampled data and a decision hangs on it: A/B tests, before-and-after comparisons, "this segment converts better", "the error rate went up after the release". If nothing depends on the answer, you can often skip the ceremony and just show the numbers with their spread.

## A worked example

An email subject line test. Old line: 1,000 sends, 210 opens (21.0%). New line: 1,000 sends, 242 opens (24.2%).

- **H0:** the two subject lines have the same true open rate.
- **H1:** they differ.
- A two-proportion test gives a p-value of about 0.09.

At alpha 0.05, you fail to reject H0. The 3.2-point gap is real in this sample but not large enough, given only 1,000 sends each, to rule out chance. The honest report: "The new line opened 3 points higher, but the test is inconclusive at this volume. Run it to 4,000 sends per line and we will have the power to call it."

That is a useful answer. It stops the team from rolling out a subject line on a coin flip, and it tells them exactly what to do next.

> **Try This**
> Find a before-and-after or A-vs-B comparison in a case. Write the null hypothesis in one sentence before you calculate anything. Then decide: does the case give you enough rows to say anything, or is the honest finding "we cannot tell yet"?
