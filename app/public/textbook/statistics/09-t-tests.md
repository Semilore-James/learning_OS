# T-tests

## The one-sentence version

A t-test is the standard tool for "are these two averages really different", and knowing which of its three versions to use is most of the skill.

## What it is

A t-test compares means and tells you whether the difference is larger than the noise would explain. It produces a **t-statistic** (the difference in means divided by its standard error) and a **p-value**.

Three versions:

- **One-sample t-test** — is this group's mean different from a specific target number? "Is average handle time different from the 10-minute SLA?"
- **Two-sample (independent) t-test** — are the means of two separate groups different? "Do users from paid search spend more than users from organic?" This is the A/B test workhorse.
- **Paired t-test** — for the same units measured twice. "Did the same 200 stores sell more after the layout change than before?" The pairing removes the store-to-store variation and makes the test far more sensitive.

## Why it exists

Comparing two averages by eye is unreliable because the reliability depends on the spread and the sample size, which you cannot judge visually. The t-test bakes both in: a difference of 5 is convincing if each group is tightly clustered with 500 observations, and unconvincing if each group is all over the place with 12 observations. The t-test is the arithmetic that turns "looks different" into "is different, p = 0.003" or "cannot tell, p = 0.4".

## How it works

**The idea:** `t = (difference in means) / (standard error of that difference)`. The standard error shrinks as samples grow and as the data gets less variable. A big t means the gap is large relative to the noise. The p-value converts t into "probability of a gap this big if the true means were equal".

**Assumptions, and how much they matter:**

- **The data (or the sampling distribution of the mean) is roughly normal.** With samples above about 30 per group, the Central Limit Theorem makes the test robust even to non-normal data. Small samples of skewed data are where it breaks; use a non-parametric test (Mann-Whitney) there.
- **Independent observations.** Each row is its own unit. If you have repeated measures on the same customers, use the paired test or a different model.
- **Similar variances** for the classic two-sample test. If in doubt, use **Welch's t-test**, which does not assume equal variances and is a safe default. Most tools let you switch with one argument (`equal_var=False` in scipy).

**One-tailed vs two-tailed:** two-tailed asks "different in either direction" and is the honest default. Use one-tailed only if you genuinely do not care about an effect in the other direction and you decided this before seeing the data.

**Report the effect size too.** A significant t-test says the difference is probably real. Cohen's d (the difference in means divided by the pooled standard deviation) or just the raw difference with a confidence interval says whether it matters.

## When you use it

Any two-group or before-after comparison of a numeric outcome where a decision depends on the result: conversion value, time on task, revenue per user, satisfaction score (with the ordinal caveat), page load time. For comparing rates or proportions, reach for a chi-square or two-proportion test instead.

## A worked example

A checkout redesign test. Revenue per session:

```
Control:  n = 2,400,  mean = 18.20,  SD = 44.10
Variant:  n = 2,380,  mean = 20.05,  SD = 47.30
```

Welch's two-sample t-test: t = 1.40, p = 0.16.

The variant made 1.85 more per session on average, which sounds good, but revenue per session is extremely variable (SD more than twice the mean, classic right skew from a few big orders). At this sample size, a gap of 1.85 is well within what chance produces. p = 0.16 means fail to reject.

The report: "Variant is up 1.85 per session (10%), but not significant (p = 0.16) because session revenue is very noisy. Need roughly 3x the sample, or analyse conversion rate and average order value separately, which are each less variable."

> **Try This**
> Find two groups in a case dataset (region A vs region B, new vs returning) and a numeric outcome. State whether it is a paired or independent comparison. Run the t-test if you have the tools, or at least compute both means and both standard deviations and form an opinion about whether the gap could be noise.
